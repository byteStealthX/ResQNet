import { SmsClient } from '@azure/communication-sms';
import { azureConfig } from '../config/azure';
import logger from '../utils/logger.util';

interface SMSMessage {
    to: string;
    message: string;
}

class AzureCommunicationService {
    private smsClient: SmsClient | null = null;
    private fromNumber: string;

    constructor() {
        this.fromNumber = azureConfig.communication.phoneNumber;

        if (azureConfig.communication.enabled) {
            try {
                this.smsClient = new SmsClient(azureConfig.communication.connectionString);
                logger.info('✅ Azure Communication Services initialized');
            } catch (error) {
                logger.error('Failed to initialize Azure Communication Services:', error);
            }
        } else {
            logger.warn('Azure Communication Services not configured');
        }
    }

    async sendSMS({ to, message }: SMSMessage): Promise<boolean> {
        if (!this.smsClient || !azureConfig.communication.enabled) {
            logger.warn(`SMS not sent (ACS disabled). To:${to}, Message: ${message}`);
            return false;
        }

        try {
            const result = await this.smsClient.send({
                from: this.fromNumber,
                to: [to],
                message
            });

            const response = result[0];
            if (response.successful) {
                logger.info(`✅ SMS sent successfully to ${to}`);
                return true;
            } else {
                logger.error(`❌ SMS failed to ${to}: ${response.errorMessage}`);
                return false;
            }
        } catch (error) {
            logger.error('SMS send error:', error);
            return false;
        }
    }

    async notifyAmbulanceAssignment(phone: string, emergencyId: string, location: string): Promise<void> {
        const message = `🚨 EMERGENCY DISPATCH\nEmergency ID: ${emergencyId}\nLocation: ${location}\nRespond immediately via ResQNet app.`;
        await this.sendSMS({ to: phone, message });
    }

    async notifyHospitalAlert(phone: string, patientInfo: string, eta: number): Promise<void> {
        const message = `🏥 INCOMING PATIENT\n${patientInfo}\nETA: ${eta} minutes\nPrepare emergency room.`;
        await this.sendSMS({ to: phone, message });
    }

    async notifyPatientUpdate(phone: string, status: string): Promise<void> {
        const message = `ResQNet Update: ${status}\nTrack your emergency in the app for real-time updates.`;
        await this.sendSMS({ to: phone, message });
    }
}

export default new AzureCommunicationService();
