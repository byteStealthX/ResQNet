import { EventGridPublisherClient, AzureKeyCredential } from '@azure/eventgrid';
import { config } from '../config/environment';
import logger from '../utils/logger.util';
import insightsService from './azure-insights.service';

/**
 * Azure Event Grid Service
 * 
 * Publishes real-time events for emergency coordination.
 * Events are consumed by Azure SignalR, Logic Apps, or custom handlers.
 * 
 * Event Types:
 * - EmergencyCreated
 * - EmergencyUpdated
 * - AmbulanceAssigned
 * - AmbulanceLocationUpdated
 * - HospitalAssigned
 * - HospitalReady
 * - PatientAdmitted
 */

interface EventGridConfig {
    endpoint: string;
    key: string;
    topicName: string;
}

interface BaseEvent {
    id: string;
    eventType: string;
    subject: string;
    dataVersion: string;
    data: any;
}

class AzureEventGridService {
    private client: EventGridPublisherClient | null = null;
    private enabled: boolean = false;
    private topicName: string = 're sqnet-events';

    constructor() {
        const eventGridConfig = config.azure?.eventGrid;

        if (eventGridConfig?.enabled && eventGridConfig.endpoint && eventGridConfig.key) {
            try {
                this.client = new EventGridPublisherClient(
                    eventGridConfig.endpoint,
                    'EventGrid',
                    new AzureKeyCredential(eventGridConfig.key)
                );

                this.topicName = eventGridConfig.topicName || 'resqnet-events';
                this.enabled = true;
                logger.info('✅ Azure Event Grid service initialized');
            } catch (error) {
                logger.error('Failed to initialize Azure Event Grid:', error);
                this.enabled = false;
            }
        } else {
            logger.warn('Azure Event Grid not configured. Real-time events limited to local Socket.IO.');
            this.enabled = false;
        }
    }

    /**
     * Publish emergency created event
     */
    async publishEmergencyCreated(emergency: any): Promise<void> {
        await this.publishEvent({
            eventType: 'ResQNet.Emergency.Created',
            subject: `emergencies/${emergency._id}`,
            data: {
                emergencyId: emergency._id.toString(),
                type: emergency.type,
                severity: emergency.severity,
                location: emergency.location,
                patientId: emergency.patient?.toString(),
                timestamp: new Date().toISOString()
            }
        });

        // Track in Application Insights
        insightsService.trackEmergencyCreated(
            emergency._id.toString(),
            emergency.type,
            emergency.severity
        );
    }

    /**
     * Publish emergency updated event
     */
    async publishEmergencyUpdated(emergencyId: string, updates: any): Promise<void> {
        await this.publishEvent({
            eventType: 'ResQNet.Emergency.Updated',
            subject: `emergencies/${emergencyId}`,
            data: {
                emergencyId,
                updates,
                timestamp: new Date().toISOString()
            }
        });
    }

    /**
     * Publish ambulance assigned event
     */
    async publishAmbulanceAssigned(emergencyId: string, ambulanceId: string, eta: number): Promise<void> {
        await this.publishEvent({
            eventType: 'ResQNet.Ambulance.Assigned',
            subject: `emergencies/${emergencyId}/ambulance`,
            data: {
                emergencyId,
                ambulanceId,
                eta,
                timestamp: new Date().toISOString()
            }
        });

        // Track in Application Insights
        insightsService.trackAmbulanceDispatched(emergencyId, ambulanceId, eta);
    }

    /**
     * Publish ambulance location updated event
     */
    async publishAmbulanceLocation(ambulanceId: string, location: { latitude: number; longitude: number }): Promise<void> {
        await this.publishEvent({
            eventType: 'ResQNet.Ambulance.LocationUpdated',
            subject: `ambulances/${ambulanceId}/location`,
            data: {
                ambulanceId,
                location,
                timestamp: new Date().toISOString()
            }
        });
    }

    /**
     * Publish hospital assigned event
     */
    async publishHospitalAssigned(emergencyId: string, hospitalId: string): Promise<void> {
        await this.publishEvent({
            eventType: 'ResQNet.Hospital.Assigned',
            subject: `emergencies/${emergencyId}/hospital`,
            data: {
                emergencyId,
                hospitalId,
                timestamp: new Date().toISOString()
            }
        });

        // Track in Application Insights
        insightsService.trackHospitalAssigned(emergencyId, hospitalId);
    }

    /**
     * Publish hospital ready event
     */
    async publishHospitalReady(hospitalId: string, emergencyId: string): Promise<void> {
        await this.publishEvent({
            eventType: 'ResQNet.Hospital.Ready',
            subject: `hospitals/${hospitalId}/ready`,
            data: {
                hospitalId,
                emergencyId,
                timestamp: new Date().toISOString()
            }
        });
    }

    /**
     * Publish patient admitted event
     */
    async publishPatientAdmitted(emergencyId: string, hospitalId: string): Promise<void> {
        await this.publishEvent({
            eventType: 'ResQNet.Patient.Admitted',
            subject: `emergencies/${emergencyId}/admitted`,
            data: {
                emergencyId,
                hospitalId,
                timestamp: new Date().toISOString()
            }
        });

        // Track resolution time
        insightsService.trackEmergencyResolved(emergencyId, 0); // Duration to be calculated
    }

    /**
     * Generic event publisher
     * 
     * @param event - Event to publish
     */
    private async publishEvent(event: Partial<BaseEvent>): Promise<void> {
        if (!this.enabled || !this.client) {
            logger.debug(`Event not published (Event Grid disabled): ${event.eventType}`);
            return;
        }

        try {
            const fullEvent = {
                id: event.id || this.generateEventId(),
                eventType: event.eventType!,
                subject: event.subject!,
                eventTime: new Date(),
                dataVersion: event.dataVersion || '1.0',
                data: event.data
            };

            await this.client.send([fullEvent]);

            logger.info(`Event published: ${fullEvent.eventType} - ${fullEvent.subject}`);

        } catch (error) {
            logger.error(`Failed to publish event ${event.eventType}:`, error);
            // Don't throw - failures shouldn't block emergency operations
        }
    }

    /**
     * Generate unique event ID
     */
    private generateEventId(): string {
        return `evt-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }

    /**
     * Check if Event Grid is enabled
     */
    isEnabled(): boolean {
        return this.enabled;
    }
}

export default new AzureEventGridService();
