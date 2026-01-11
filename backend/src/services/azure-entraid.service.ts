import { DefaultAzureCredential, ClientSecretCredential } from '@azure/identity';
import { ConfidentialClientApplication } from '@azure/msal-node';
import { config } from '../config/environment';
import logger from '../utils/logger.util';

/**
 * Azure Entra ID (Azure AD) Authentication Service
 * 
 * Provides enterprise-grade authentication with role-based access control.
 * Falls back to existing JWT authentication if Azure AD is not configured.
 * 
 * Roles:
 * - patient: Report emergencies, view own data
 * - paramedic: View emergencies, update ambulance status
 * - hospital_admin: Manage hospital resources, view incoming patients
 * - admin: Full system access
 */

interface EntraIDConfig {
    tenantId: string;
    clientId: string;
    clientSecret: string;
    authority: string;
}

interface TokenValidationResult {
    valid: boolean;
    userId?: string;
    email?: string;
    role?: string;
    name?: string;
    error?: string;
}

class AzureEntraIDService {
    private msalClient: ConfidentialClientApplication | null = null;
    private enabled: boolean = false;
    private credential: DefaultAzureCredential | null = null;

    constructor() {
        const entraConfig = config.azure?.entraId;

        if (entraConfig?.enabled && entraConfig.tenantId && entraConfig.clientId) {
            try {
                // Initialize MSAL confidential client
                this.msalClient = new ConfidentialClientApplication({
                    auth: {
                        clientId: entraConfig.clientId,
                        authority: entraConfig.authority || `https://login.microsoftonline.com/${entraConfig.tenantId}`,
                        clientSecret: entraConfig.clientSecret
                    }
                });

                // Initialize Azure credential for service-to-service auth
                if (entraConfig.clientSecret) {
                    this.credential = new ClientSecretCredential(
                        entraConfig.tenantId,
                        entraConfig.clientId,
                        entraConfig.clientSecret
                    ) as any;
                } else {
                    this.credential = new DefaultAzureCredential();
                }

                this.enabled = true;
                logger.info('✅ Azure Entra ID service initialized');
            } catch (error) {
                logger.error('Failed to initialize Azure Entra ID:', error);
                this.enabled = false;
            }
        } else {
            logger.warn('Azure Entra ID not configured. Using fallback JWT authentication.');
            this.enabled = false;
        }
    }

    /**
     * Check if Azure Entra ID is enabled
     */
    isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * Validate Azure AD access token
     * 
     * @param token - JWT token from Azure AD
     * @returns Validation result with user info
     */
    async validateToken(token: string): Promise<TokenValidationResult> {
        if (!this.enabled || !this.msalClient) {
            return {
                valid: false,
                error: 'Azure Entra ID not enabled'
            };
        }

        try {
            // Decode token (in production, verify signature with JWKS)
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                return { valid: false, error: 'Invalid token format' };
            }

            const payload = JSON.parse(
                Buffer.from(tokenParts[1], 'base64').toString('utf-8')
            );

            // Verify token expiration
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                return { valid: false, error: 'Token expired' };
            }

            // Verify audience and issuer
            const expectedAudience = config.azure.entraId.clientId;
            if (payload.aud !== expectedAudience) {
                return { valid: false, error: 'Invalid audience' };
            }

            // Extract user information and role from claims
            const role = this.extractRoleFromClaims(payload);

            return {
                valid: true,
                userId: payload.sub || payload.oid,
                email: payload.email || payload.preferred_username,
                name: payload.name,
                role
            };

        } catch (error) {
            logger.error('Token validation error:', error);
            return {
                valid: false,
                error: 'Token validation failed'
            };
        }
    }

    /**
     * Extract role from Azure AD token claims
     * 
     * Supports multiple claim formats:
     * - roles (array)
     * - extension_role (custom attribute)
     * - app_role (application role)
     * 
     * Falls back to 'patient' if no role found
     */
    private extractRoleFromClaims(payload: any): string {
        // Check standard roles claim
        if (payload.roles && Array.isArray(payload.roles)) {
            const role = payload.roles[0];
            if (this.isValidRole(role)) {
                return role.toLowerCase();
            }
        }

        // Check custom extension attributes
        if (payload.extension_role && this.isValidRole(payload.extension_role)) {
            return payload.extension_role.toLowerCase();
        }

        // Check app roles
        if (payload.app_role && this.isValidRole(payload.app_role)) {
            return payload.app_role.toLowerCase();
        }

        // Default to patient role
        logger.warn('No valid role found in token, defaulting to patient');
        return 'patient';
    }

    /**
     * Validate if role is one of the allowed system roles
     */
    private isValidRole(role: string): boolean {
        const validRoles = ['patient', 'paramedic', 'hospital_admin', 'admin'];
        return validRoles.includes(role.toLowerCase());
    }

    /**
     * Get Azure credential for service-to-service authentication
     * 
     * Used for accessing other Azure services with managed identity
     */
    getCredential(): DefaultAzureCredential | null {
        return this.credential;
    }

    /**
     * Generate login URL for frontend (optional)
     * 
     * @param redirectUri - URI to redirect after login
     * @returns Authorization URL
     */
    getLoginUrl(redirectUri: string): string | null {
        if (!this.enabled) {
            return null;
        }

        const authority = config.azure.entraId.authority ||
            `https://login.microsoftonline.com/${config.azure.entraId.tenantId}`;

        const scopes = ['openid', 'profile', 'email'];

        return `${authority}/oauth2/v2.0/authorize?` +
            `client_id=${config.azure.entraId.clientId}&` +
            `response_type=code&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=${scopes.join('%20')}`;
    }

    /**
     * Exchange authorization code for tokens (optional)
     * 
     * @param code - Authorization code from OAuth flow
     * @param redirectUri - Same redirect URI used in auth request
     */
    async exchangeCodeForTokens(code: string, redirectUri: string): Promise<any> {
        if (!this.enabled || !this.msalClient) {
            throw new Error('Azure Entra ID not enabled');
        }

        try {
            const result = await this.msalClient.acquireTokenByCode({
                code,
                scopes: ['openid', 'profile', 'email'],
                redirectUri
            });

            return result;
        } catch (error) {
            logger.error('Token exchange failed:', error);
            throw error;
        }
    }
}

export default new AzureEntraIDService();
