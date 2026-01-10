import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { azureConfig } from '../config/azure';
import logger from '../utils/logger.util';
import {
    EmergencyType,
    EmergencySeverity,
    IAITriageResult
} from '../models/Emergency';

interface TriageInput {
    type: EmergencyType;
    description: string;
    patientInfo: {
        age: number;
        gender: string;
        medicalHistory?: string[];
    };
    vitals?: {
        heartRate?: number;
        bloodPressure?: string;
        respiratoryRate?: number;
        oxygenSaturation?: number;
    };
}

class AzureOpenAIService {
    private client: OpenAIClient | null = null;
    private deploymentName: string;

    constructor() {
        this.deploymentName = azureConfig.openai.deploymentName;

        if (azureConfig.openai.enabled) {
            try {
                this.client = new OpenAIClient(
                    azureConfig.openai.endpoint,
                    new AzureKeyCredential(azureConfig.openai.apiKey)
                );
                logger.info('✅ Azure OpenAI client initialized');
            } catch (error) {
                logger.error('Failed to initialize Azure OpenAI client:', error);
            }
        } else {
            logger.warn('Azure OpenAI is not configured. Using fallback triage.');
        }
    }

    async performTriage(input: TriageInput): Promise<IAITriageResult> {
        if (!this.client || !azureConfig.openai.enabled) {
            logger.warn('Azure OpenAI unavailable, using fallback triage');
            return this.fallbackTriage(input);
        }

        try {
            const prompt = this.buildTriagePrompt(input);

            const response = await this.client.getChatCompletions(
                this.deploymentName,
                [
                    {
                        role: 'system',
                        content: 'You are an expert medical triage AI assistant. Analyze emergency cases and provide severity assessment, confidence score, reasoning, and recommended actions. Always respond in valid JSON format.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                {
                    temperature: 0.3,
                    maxTokens: 500,
                    responseFormat: { type: 'json_object' }
                }
            );

            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No response from Azure OpenAI');
            }

            const aiResult = JSON.parse(content);

            return {
                severity: this.normalizeSeverity(aiResult.severity),
                confidence: Math.min(Math.max(aiResult.confidence || 0.7, 0), 1),
                reasoning: aiResult.reasoning || 'AI-generated triage assessment',
                recommendedActions: aiResult.recommendedActions || [],
                estimatedResponseTime: aiResult.estimatedResponseTime || this.calculateBaseResponseTime(input.type)
            };

        } catch (error) {
            logger.error('Azure OpenAI triage failed, using fallback:', error);
            return this.fallbackTriage(input);
        }
    }

    private buildTriagePrompt(input: TriageInput): string {
        return `
Analyze this medical emergency and provide a triage assessment:

Emergency Type: ${input.type}
Description: ${input.description}
Patient Age: ${input.patientInfo.age}
Patient Gender: ${input.patientInfo.gender}
${input.patientInfo.medicalHistory ? `Medical History: ${input.patientInfo.medicalHistory.join(', ')}` : ''}
${input.vitals ? `Vitals:
  - Heart Rate: ${input.vitals.heartRate || 'N/A'} bpm
  - Blood Pressure: ${input.vitals.bloodPressure || 'N/A'}
  - Respiratory Rate: ${input.vitals.respiratoryRate || 'N/A'} breaths/min
  - Oxygen Saturation: ${input.vitals.oxygenSaturation || 'N/A'}%` : ''}

Provide your assessment in the following JSON format:
{
  "severity": "low|medium|high|critical",
  "confidence": 0.0-1.0,
  "reasoning": "detailed explanation of severity assessment",
  "recommendedActions": ["action1", "action2", ...],
  "estimatedResponseTime": minutes_number
}
    `.trim();
    }

    private fallbackTriage(input: TriageInput): IAITriageResult {
        let severity: EmergencySeverity = EmergencySeverity.MEDIUM;
        const recommendedActions: string[] = [];
        let reasoning = '';

        // Rule-based triage logic
        if (input.type === EmergencyType.CARDIAC) {
            severity = EmergencySeverity.CRITICAL;
            reasoning = 'Cardiac emergencies require immediate response';
            recommendedActions.push('Dispatch ALS ambulance immediately');
            recommendedActions.push('Alert cardiac care unit');
            recommendedActions.push('Prepare defibrillator');
        } else if (input.type === EmergencyType.STROKE) {
            severity = EmergencySeverity.CRITICAL;
            reasoning = 'Stroke patients need urgent neurological care';
            recommendedActions.push('Dispatch nearest available ambulance');
            recommendedActions.push('Alert stroke center');
            recommendedActions.push('Time-critical transport required');
        } else if (input.type === EmergencyType.TRAUMA) {
            severity = EmergencySeverity.HIGH;
            reasoning = 'Trauma cases require rapid assessment and stabilization';
            recommendedActions.push('Dispatch trauma-equipped ambulance');
            recommendedActions.push('Alert trauma center');
        } else if (input.type === EmergencyType.RESPIRATORY) {
            severity = EmergencySeverity.HIGH;
            reasoning = 'Respiratory distress requires oxygen support';
            recommendedActions.push('Ensure oxygen equipment available');
            recommendedActions.push('Dispatch BLS or ALS ambulance');
        } else if (input.type === EmergencyType.BURN) {
            severity = EmergencySeverity.HIGH;
            reasoning = 'Burn injuries need specialized care';
            recommendedActions.push('Dispatch ambulance with burn treatment supplies');
            recommendedActions.push('Alert burn unit if available');
        } else {
            severity = EmergencySeverity.MEDIUM;
            reasoning = 'Standard emergency response protocol';
            recommendedActions.push('Dispatch nearest available ambulance');
        }

        // Adjust based on vitals
        if (input.vitals) {
            if (
                (input.vitals.heartRate && (input.vitals.heartRate > 120 || input.vitals.heartRate < 50)) ||
                (input.vitals.oxygenSaturation && input.vitals.oxygenSaturation < 90) ||
                (input.vitals.respiratoryRate && (input.vitals.respiratoryRate > 30 || input.vitals.respiratoryRate < 8))
            ) {
                severity = EmergencySeverity.CRITICAL;
                reasoning += '. Critical vital signs detected.';
                recommendedActions.unshift('Immediate life support required');
            }
        }

        // Age-based adjustment
        if (input.patientInfo.age < 5 || input.patientInfo.age > 70) {
            if (severity === EmergencySeverity.MEDIUM) {
                severity = EmergencySeverity.HIGH;
            }
            reasoning += ` Age factor (${input.patientInfo.age}) increases risk.`;
        }

        return {
            severity,
            confidence: 0.75,
            reasoning,
            recommendedActions,
            estimatedResponseTime: this.calculateBaseResponseTime(input.type)
        };
    }

    private normalizeSeverity(severity: string): EmergencySeverity {
        const normalized = severity.toLowerCase();
        if (Object.values(EmergencySeverity).includes(normalized as EmergencySeverity)) {
            return normalized as EmergencySeverity;
        }
        return EmergencySeverity.MEDIUM;
    }

    private calculateBaseResponseTime(type: EmergencyType): number {
        const baseTime: Record<EmergencyType, number> = {
            [EmergencyType.CARDIAC]: 8,
            [EmergencyType.STROKE]: 10,
            [EmergencyType.TRAUMA]: 12,
            [EmergencyType.RESPIRATORY]: 10,
            [EmergencyType.BURN]: 15,
            [EmergencyType.POISONING]: 12,
            [EmergencyType.ACCIDENT]: 15,
            [EmergencyType.OTHER]: 20
        };
        return baseTime[type] || 15;
    }
}

export default new AzureOpenAIService();
