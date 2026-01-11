import { Client, Message } from 'azure-iot-device';
import { Mqtt as Protocol } from 'azure-iot-device-mqtt';
import { config } from '../config/environment';
import logger from '../utils/logger.util';

/**
 * Azure IoT Hub Service
 * 
 * Receives data from wearable devices and health sensors.
 * Auto-triggers emergency if vitals cross critical thresholds.
 * 
 * Supported Vitals:
 * - Heart Rate (BPM)
 * - SpO2 (Oxygen Saturation %)
 * - Blood Pressure
 * - Fall Detection
 * - Body Temperature
 * 
 * SAFETY: Thresholds are conservative, false positives are acceptable.
 */

interface VitalSigns {
    deviceId: string;
    userId: string;
    timestamp: Date;
    heartRate?: number;
    spO2?: number;
    systolic?: number;
    diastolic?: number;
    temperature?: number;
    fallDetected?: boolean;
    location?: {
        latitude: number;
        longitude: number;
    };
}

interface VitalThresholds {
    heartRateMin: number;
    heartRateMax: number;
    spO2Min: number;
    systolicMax: number;
    diastolicMax: number;
    temperatureMax: number;
}

interface EmergencyTrigger {
    shouldTrigger: boolean;
    reason: string;
    severity: 'medium' | 'high' | 'critical';
    vitals: VitalSigns;
}

class AzureIoTHubService {
    private enabled: boolean = false;
    private deviceClients: Map<string, Client> = new Map();

    // Conservative thresholds - prioritize safety over false positives
    private readonly THRESHOLDS: VitalThresholds = {
        heartRateMin: 40,    // Bradycardia
        heartRateMax: 150,   // Tachycardia
        spO2Min: 90,         // Hypoxemia
        systolicMax: 180,    // Hypertensive crisis
        diastolicMax: 120,   // Hypertensive crisis
        temperatureMax: 39.5 // High fever (Celsius)
    };

    constructor() {
        const iotConfig = config.azure?.iot;

        if (iotConfig?.enabled && iotConfig.connectionString) {
            this.enabled = true;
            logger.info('✅ Azure IoT Hub service initialized');
        } else {
            logger.warn('Azure IoT Hub not configured. Wearable device support disabled.');
            this.enabled = false;
        }
    }

    /**
     * Process incoming vitals from IoT device
     * 
     * @param vitals - Vitals data from wearable/sensor
     * @returns Emergency trigger result
     * 
     * SAFETY: Conservative thresholds, auto-trigger on critical values
     */
    async processVitals(vitals: VitalSigns): Promise<EmergencyTrigger> {
        logger.info(`Processing vitals from device ${vitals.deviceId} for user ${vitals.userId}`);

        // Check thresholds
        const trigger = this.evaluateVitals(vitals);

        if (trigger.shouldTrigger) {
            logger.warn(`🚨 Emergency auto-trigger: ${trigger.reason}`);

            // TODO: Integrate with emergency controller to auto-create emergency
            // This should call emergencyController.create() with vitals data
        }

        return trigger;
    }

    /**
     * Evaluate vitals against thresholds
     * 
     * @param vitals - Vital signs to evaluate
     * @returns Emergency trigger decision
     */
    private evaluateVitals(vitals: VitalSigns): EmergencyTrigger {
        const reasons: string[] = [];
        let maxSeverity: 'medium' | 'high' | 'critical' = 'medium';

        // Fall detection - immediate critical
        if (vitals.fallDetected) {
            reasons.push('Fall detected');
            maxSeverity = 'critical';
        }

        // Heart rate check
        if (vitals.heartRate) {
            if (vitals.heartRate < this.THRESHOLDS.heartRateMin) {
                reasons.push(`Low heart rate: ${vitals.heartRate} BPM (< ${this.THRESHOLDS.heartRateMin})`);
                maxSeverity = this.escalateSeverity(maxSeverity, 'high');
            } else if (vitals.heartRate > this.THRESHOLDS.heartRateMax) {
                reasons.push(`High heart rate: ${vitals.heartRate} BPM (> ${this.THRESHOLDS.heartRateMax})`);
                maxSeverity = this.escalateSeverity(maxSeverity, 'high');
            }
        }

        // SpO2 check
        if (vitals.spO2 && vitals.spO2 < this.THRESHOLDS.spO2Min) {
            reasons.push(`Low oxygen saturation: ${vitals.spO2}% (< ${this.THRESHOLDS.spO2Min}%)`);
            maxSeverity = this.escalateSeverity(maxSeverity, 'critical');
        }

        // Blood pressure check
        if (vitals.systolic && vitals.systolic > this.THRESHOLDS.systolicMax) {
            reasons.push(`High systolic BP: ${vitals.systolic} mmHg`);
            maxSeverity = this.escalateSeverity(maxSeverity, 'high');
        }

        if (vitals.diastolic && vitals.diastolic > this.THRESHOLDS.diastolicMax) {
            reasons.push(`High diastolic BP: ${vitals.diastolic} mmHg`);
            maxSeverity = this.escalateSeverity(maxSeverity, 'high');
        }

        // Temperature check
        if (vitals.temperature && vitals.temperature > this.THRESHOLDS.temperatureMax) {
            reasons.push(`High temperature: ${vitals.temperature}°C`);
            maxSeverity = this.escalateSeverity(maxSeverity, 'medium');
        }

        const shouldTrigger = reasons.length > 0;

        return {
            shouldTrigger,
            reason: reasons.join('; '),
            severity: maxSeverity,
            vitals
        };
    }

    /**
     * Escalate severity to higher level if needed
     * 
     * Priority: critical > high > medium
     */
    private escalateSeverity(
        current: 'medium' | 'high' | 'critical',
        new_level: 'medium' | 'high' | 'critical'
    ): 'medium' | 'high' | 'critical' {
        const levels = { medium: 1, high: 2, critical: 3 };
        return levels[new_level] > levels[current] ? new_level : current;
    }

    /**
     * Register IoT device for a user
     * 
     * @param deviceId - Unique device identifier
     * @param userId - User who owns the device
     */
    async registerDevice(deviceId: string, userId: string): Promise<void> {
        if (!this.enabled) {
            logger.warn('IoT Hub not enabled, cannot register device');
            return;
        }

        try {
            // In production, this would create device in IoT Hub
            // and return connection string for the device
            logger.info(`Device ${deviceId} registered for user ${userId}`);
        } catch (error) {
            logger.error(`Failed to register device ${deviceId}:`, error);
            throw error;
        }
    }

    /**
     * Get current vitals for a user (from last sync)
     * 
     * @param userId - User ID
     * @returns Latest vitals or null
     */
    async getLatestVitals(userId: string): Promise<VitalSigns | null> {
        // TODO: Implement caching of latest vitals
        // Could use Redis or in-memory cache
        return null;
    }

    /**
     * Simulate vitals for testing (development only)
     * 
     * @param userId - User ID
     * @returns Simulated vitals
     */
    simulateVitals(userId: string, abnormal: boolean = false): VitalSigns {
        const normal: VitalSigns = {
            deviceId: `sim-device-${userId}`,
            userId,
            timestamp: new Date(),
            heartRate: 75,
            spO2: 98,
            systolic: 120,
            diastolic: 80,
            temperature: 36.8,
            fallDetected: false
        };

        if (abnormal) {
            // Simulate critical vitals
            return {
                ...normal,
                heartRate: 160,  // Tachycardia
                spO2: 88,        // Hypoxemia
                fallDetected: true
            };
        }

        return normal;
    }

    /**
     * Check if IoT Hub is enabled
     */
    isEnabled(): boolean {
        return this.enabled;
    }
}

export default new AzureIoTHubService();
