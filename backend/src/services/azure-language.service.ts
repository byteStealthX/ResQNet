import { TextAnalyticsClient, AzureKeyCredential } from '@azure/ai-language-text';
import { config } from '../config/environment';
import logger from '../utils/logger.util';

/**
 * Azure AI Language Service
 * 
 * Extracts symptoms, urgency keywords, and medical context from emergency descriptions.
 * Used for AI-assisted triage decision support.
 * 
 * SAFETY: AI only suggests severity, final decision requires human approval.
 */

interface SymptomExtraction {
    symptoms: string[];
    urgencyKeywords: string[];
    medicalEntities: MedicalEntity[];
    suggestedSeverity?: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    requiresHumanApproval: boolean;
}

interface MedicalEntity {
    text: string;
    category: string;
    subCategory?: string;
    confidence: number;
}

class AzureLanguageService {
    private client: TextAnalyticsClient | null = null;
    private enabled: boolean = false;

    // Medical urgency keywords for severity detection
    private readonly CRITICAL_KEYWORDS = [
        'unconscious', 'not breathing', 'chest pain', 'heart attack', 'stroke',
        'severe bleeding', 'head injury', 'seizure', 'allergic reaction'
    ];

    private readonly HIGH_KEYWORDS = [
        'difficulty breathing', 'severe pain', 'broken bone', 'heavy bleeding',
        'high fever', 'vomiting blood', 'severe burn'
    ];

    constructor() {
        const languageConfig = config.azure?.language;

        if (languageConfig?.enabled && languageConfig.key && languageConfig.endpoint) {
            try {
                this.client = new TextAnalyticsClient(
                    languageConfig.endpoint,
                    new AzureKeyCredential(languageConfig.key)
                );

                this.enabled = true;
                logger.info('✅ Azure AI Language service initialized');
            } catch (error) {
                logger.error('Failed to initialize Azure Language:', error);
                this.enabled = false;
            }
        } else {
            logger.warn('Azure Language not configured. Using rule-based symptom extraction.');
            this.enabled = false;
        }
    }

    /**
     * Extract symptoms and urgency from emergency description
     * 
     * @param description - Patient's emergency description (text or transcribed voice)
     * @returns Extracted symptoms, urgency, and AI suggestion
     * 
     * SAFETY: Always returns requiresHumanApproval = true
     */
    async extractSymptoms(description: string): Promise<SymptomExtraction> {
        if (!this.enabled || !this.client) {
            // Fallback to rule-based extraction
            return this.ruleBasedExtraction(description);
        }

        try {
            // Use Azure AI to extract medical entities
            const results = await this.client.recognizeEntities([description], 'en');

            if (results[0].error) {
                logger.error('Entity recognition error:', results[0].error);
                return this.ruleBasedExtraction(description);
            }

            // Extract entities
            const entities = results[0].entities.map(entity => ({
                text: entity.text,
                category: entity.category,
                subCategory: entity.subCategory,
                confidence: entity.confidenceScore
            }));

            // Extract symptoms (medical conditions, symptoms, body parts)
            const symptoms = entities
                .filter(e =>
                    e.category === 'HealthcareMedicalCondition' ||
                    e.category === 'Symptom' ||
                    e.category === 'BodyStructure'
                )
                .map(e => e.text);

            // Detect urgency keywords
            const urgencyKeywords = this.detectUrgencyKeywords(description);

            // Suggest severity based on keywords and AI confidence
            const suggestedSeverity = this.calculateSuggestedSeverity(
                urgencyKeywords,
                entities
            );

            // Calculate overall confidence
            const avgConfidence = entities.length > 0
                ? entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length
                : 0.5;

            return {
                symptoms: [...new Set(symptoms)], // Remove duplicates
                urgencyKeywords,
                medicalEntities: entities,
                suggestedSeverity,
                confidence: avgConfidence,
                requiresHumanApproval: true // Always require human approval
            };

        } catch (error) {
            logger.error('Symptom extraction failed:', error);
            return this.ruleBasedExtraction(description);
        }
    }

    /**
     * Fallback rule-based symptom extraction
     * 
     * Used when Azure Language is not available
     */
    private ruleBasedExtraction(description: string): SymptomExtraction {
        const lowerDesc = description.toLowerCase();

        // Detect urgency keywords
        const urgencyKeywords = this.detectUrgencyKeywords(description);

        // Simple keyword matching for symptoms
        const commonSymptoms = [
            'pain', 'bleeding', 'fever', 'breathing', 'nausea', 'vomiting',
            'headache', 'dizziness', 'weakness', 'numbness', 'swelling'
        ];

        const detectedSymptoms = commonSymptoms.filter(symptom =>
            lowerDesc.includes(symptom)
        );

        // Suggest severity based on keywords only
        const suggestedSeverity = this.calculateSuggestedSeverity(urgencyKeywords, []);

        return {
            symptoms: detectedSymptoms,
            urgencyKeywords,
            medicalEntities: [],
            suggestedSeverity,
            confidence: 0.6, // Lower confidence for rule-based
            requiresHumanApproval: true
        };
    }

    /**
     * Detect urgency keywords in description
     */
    private detectUrgencyKeywords(description: string): string[] {
        const lowerDesc = description.toLowerCase();
        const detected: string[] = [];

        // Check critical keywords
        this.CRITICAL_KEYWORDS.forEach(keyword => {
            if (lowerDesc.includes(keyword)) {
                detected.push(keyword);
            }
        });

        // Check high urgency keywords
        this.HIGH_KEYWORDS.forEach(keyword => {
            if (lowerDesc.includes(keyword)) {
                detected.push(keyword);
            }
        });

        return detected;
    }

    /**
     * Calculate suggested severity based on keywords and entities
     * 
     * SAFETY: This is a suggestion only, not a final decision
     */
    private calculateSuggestedSeverity(
        urgencyKeywords: string[],
        entities: MedicalEntity[]
    ): 'low' | 'medium' | 'high' | 'critical' {
        // Check for critical keywords
        const hasCritical = urgencyKeywords.some(keyword =>
            this.CRITICAL_KEYWORDS.includes(keyword)
        );

        if (hasCritical) {
            return 'critical';
        }

        // Check for high urgency keywords
        const hasHigh = urgencyKeywords.some(keyword =>
            this.HIGH_KEYWORDS.includes(keyword)
        );

        if (hasHigh) {
            return 'high';
        }

        // Check entity confidence for medical conditions
        const highConfidenceMedical = entities.some(entity =>
            entity.category === 'HealthcareMedicalCondition' &&
            entity.confidence > 0.8
        );

        if (highConfidenceMedical) {
            return 'high';
        }

        // Check if symptoms detected
        if (urgencyKeywords.length > 0 || entities.length > 0) {
            return 'medium';
        }

        return 'low';
    }

    /**
     * Analyze sentiment of emergency description (optional)
     * 
     * Can help detect panic or urgency in tone
     */
    async analyzeSentiment(description: string): Promise<{
        sentiment: 'positive' | 'neutral' | 'negative';
        confidence: number;
    } | null> {
        if (!this.enabled || !this.client) {
            return null;
        }

        try {
            const results = await this.client.analyzeSentiment([description]);

            if (results[0].error) {
                return null;
            }

            return {
                sentiment: results[0].sentiment,
                confidence: results[0].confidenceScores[results[0].sentiment]
            };

        } catch (error) {
            logger.error('Sentiment analysis failed:', error);
            return null;
        }
    }

    /**
     * Check if language service is enabled
     */
    isEnabled(): boolean {
        return this.enabled;
    }
}

export default new AzureLanguageService();
