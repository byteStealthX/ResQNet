import { TelemetryClient } from 'applicationinsights';
import * as appInsights from 'applicationinsights';
import { azureConfig } from '../config/azure';
import logger from '../utils/logger.util';

class AzureApplicationInsightsService {
    private client: TelemetryClient | null = null;
    private isEnabled: boolean = false;

    constructor() {
        const connectionString = process.env.AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING;
        const enabled = process.env.APPLICATION_INSIGHTS_ENABLED === 'true';

        if (enabled && connectionString) {
            try {
                appInsights.setup(connectionString)
                    .setAutoDependencyCorrelation(true)
                    .setAutoCollectRequests(true)
                    .setAutoCollectPerformance(true, true)
                    .setAutoCollectExceptions(true)
                    .setAutoCollectDependencies(true)
                    .setAutoCollectConsole(true)
                    .setUseDiskRetryCaching(true)
                    .setSendLiveMetrics(false)
                    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
                    .start();

                this.client = appInsights.defaultClient;
                this.isEnabled = true;
                logger.info('✅ Azure Application Insights initialized');
            } catch (error) {
                logger.error('Failed to initialize Azure Application Insights:', error);
                this.isEnabled = false;
            }
        } else {
            logger.warn('Azure Application Insights not configured');
            this.isEnabled = false;
        }
    }

    trackEvent(name: string, properties?: Record<string, any>): void {
        if (!this.isEnabled || !this.client) return;

        this.client.trackEvent({
            name,
            properties
        });
    }

    trackMetric(name: string, value: number, properties?: Record<string, any>): void {
        if (!this.isEnabled || !this.client) return;

        this.client.trackMetric({
            name,
            value,
            properties
        });
    }

    trackException(error: Error, properties?: Record<string, any>): void {
        if (!this.isEnabled || !this.client) return;

        this.client.trackException({
            exception: error,
            properties
        });
    }

    trackRequest(name: string, duration: number, success: boolean, resultCode: number): void {
        if (!this.isEnabled || !this.client) return;

        this.client.trackRequest({
            name,
            duration,
            success,
            resultCode,
            url: name
        });
    }

    trackDependency(
        name: string,
        type: string,
        duration: number,
        success: boolean,
        data?: string
    ): void {
        if (!this.isEnabled || !this.client) return;

        this.client.trackDependency({
            target: name,
            name,
            data,
            duration,
            success,
            dependencyTypeName: type,
            resultCode: success ? 200 : 500
        });
    }

    // Emergency-specific tracking methods
    trackEmergencyCreated(emergencyId: string, type: string, severity: string): void {
        this.trackEvent('EmergencyCreated', {
            emergencyId,
            type,
            severity
        });

        this.trackMetric('Emergency.Created', 1, {
            type,
            severity
        });
    }

    trackAmbulanceDispatched(emergencyId: string, ambulanceId: string, eta: number): void {
        this.trackEvent('AmbulanceDispatched', {
            emergencyId,
            ambulanceId,
            etaMinutes: eta
        });

        this.trackMetric('Ambulance.DispatchTime', eta, {
            emergencyId
        });
    }

    trackHospitalAssigned(emergencyId: string, hospitalId: string): void {
        this.trackEvent('HospitalAssigned', {
            emergencyId,
            hospitalId
        });
    }

    trackEmergencyResolved(emergencyId: string, durationMinutes: number): void {
        this.trackEvent('EmergencyResolved', {
            emergencyId,
            durationMinutes
        });

        this.trackMetric('Emergency.ResolutionTime', durationMinutes, {
            emergencyId
        });
    }

    trackAITriagePerformed(emergencyId: string, severity: string, confidence: number): void {
        this.trackEvent('AITriagePerformed', {
            emergencyId,
            severity,
            confidence
        });

        this.trackMetric('AI.TriageConfidence', confidence, {
            emergencyId,
            severity
        });
    }

    trackSMSSent(to: string, success: boolean): void {
        this.trackEvent('SMSSent', {
            to: to.substring(0, 5) + '***', // Anonymize phone number
            success
        });

        this.trackMetric('SMS.Sent', 1, {
            success: success.toString()
        });
    }

    flush(): Promise<void> {
        if (!this.isEnabled || !this.client) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            this.client!.flush({
                callback: () => resolve()
            });
        });
    }
}

export default new AzureApplicationInsightsService();
