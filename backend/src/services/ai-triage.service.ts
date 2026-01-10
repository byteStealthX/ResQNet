import azureOpenAIService from './azure-openai.service';
import { EmergencyType, IAITriageResult } from '../models/Emergency';
import logger from '../utils/logger.util';

interface TriageInput {
    type: EmergencyType;
    description: string;
    patientInfo: {
        age: number;
        gender: string;
        medicalHistory?: string[];
        allergies?: string[];
    };
    vitals?: {
        heartRate?: number;
        bloodPressure?: string;
        respiratoryRate?: number;
        temperature?: number;
        oxygenSaturation?: number;
    };
}

class AITriageService {
    async triageEmergency(input: TriageInput): Promise<IAITriageResult> {
        try {
            logger.info(`Triaging ${input.type} emergency for patient age ${input.patientInfo.age}`);

            const triageResult = await azureOpenAIService.performTriage(input);

            logger.info(`Triage completed: Severity=${triageResult.severity}, Confidence=${triageResult.confidence}`);

            return triageResult;
        } catch (error) {
            logger.error('AI Triage service error:', error);
            throw error;
        }
    }

    validateTriageResult(result: IAITriageResult): boolean {
        return (
            result.severity !== undefined &&
            result.confidence >= 0 &&
            result.confidence <= 1 &&
            result.reasoning.length > 0 &&
            Array.isArray(result.recommendedActions)
        );
    }
}

export default new AITriageService();
