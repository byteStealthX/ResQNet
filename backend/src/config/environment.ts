import dotenv from 'dotenv';

dotenv.config();

export const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),
    apiVersion: process.env.API_VERSION || 'v1',

    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/resqnet'
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'change_this_secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    },

    bcrypt: {
        rounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10)
    },

    azure: {
        openai: {
            endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
            apiKey: process.env.AZURE_OPENAI_API_KEY || '',
            deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4',
            apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview'
        },
        maps: {
            subscriptionKey: process.env.AZURE_MAPS_SUBSCRIPTION_KEY || ''
        },
        communication: {
            connectionString: process.env.AZURE_COMMUNICATION_CONNECTION_STRING || '',
            phoneNumber: process.env.AZURE_COMMUNICATION_PHONE_NUMBER || '',
            enabled: process.env.SMS_NOTIFICATIONS_ENABLED === 'true'
        },
        webPubSub: {
            connectionString: process.env.AZURE_WEB_PUBSUB_CONNECTION_STRING || '',
            enabled: process.env.AZURE_WEB_PUBSUB_ENABLED === 'true'
        },
        applicationInsights: {
            connectionString: process.env.AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING || '',
            instrumentationKey: process.env.AZURE_APPLICATION_INSIGHTS_INSTRUMENTATION_KEY || '',
            enabled: process.env.APPLICATION_INSIGHTS_ENABLED === 'true'
        }
    },

    cors: {
        origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(o => o.trim())
    },

    socketIO: {
        enabled: process.env.SOCKET_IO_ENABLED !== 'false',
        cors: {
            origin: (process.env.SOCKET_CORS_ORIGIN || process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(o => o.trim())
        },
        pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT || '60000', 10)
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
        auth: {
            windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000', 10),
            max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5', 10)
        }
    },

    emergency: {
        defaultSearchRadiusKm: parseInt(process.env.DEFAULT_SEARCH_RADIUS_KM || '50', 10),
        maxAmbulanceCandidates: parseInt(process.env.MAX_AMBULANCE_CANDIDATES || '10', 10),
        maxHospitalCandidates: parseInt(process.env.MAX_HOSPITAL_CANDIDATES || '5', 10),
        autoEscalationTimeoutMinutes: parseInt(process.env.AUTO_ESCALATION_TIMEOUT_MINUTES || '5', 10),
        updateThrottleSeconds: parseInt(process.env.EMERGENCY_UPDATE_THROTTLE_SECONDS || '30', 10)
    },

    fallbacks: {
        aiTriageEnabled: process.env.AI_TRIAGE_FALLBACK_ENABLED !== 'false',
        mapsEnabled: process.env.MAPS_FALLBACK_ENABLED !== 'false'
    },

    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'simple'
    },

    development: {
        verboseErrors: process.env.VERBOSE_ERRORS === 'true',
        mockAzureServices: process.env.MOCK_AZURE_SERVICES === 'true',
        autoSeedDatabase: process.env.AUTO_SEED_DATABASE === 'true'
    }
};

export default config;
