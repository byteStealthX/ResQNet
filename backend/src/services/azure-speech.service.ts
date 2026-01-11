import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { config } from '../config/environment';
import logger from '../utils/logger.util';

/**
 * Azure AI Speech Service
 * 
 * Converts voice SOS input to text for emergency reporting.
 * Supports real-time speech recognition and voice commands.
 * 
 * SAFETY: Voice input is transcribed only, human verification required.
 */

interface VoiceToTextResult {
    success: boolean;
    text?: string;
    confidence?: number;
    error?: string;
    requiresHumanVerification: boolean;
}

class AzureSpeechService {
    private speechConfig: sdk.SpeechConfig | null = null;
    private enabled: boolean = false;

    constructor() {
        const speechConfig = config.azure?.speech;

        if (speechConfig?.enabled && speechConfig.key && speechConfig.region) {
            try {
                this.speechConfig = sdk.SpeechConfig.fromSubscription(
                    speechConfig.key,
                    speechConfig.region
                );

                // Configure speech recognition settings
                this.speechConfig.speechRecognitionLanguage = speechConfig.language || 'en-US';
                this.speechConfig.enableDictation();

                this.enabled = true;
                logger.info('✅ Azure AI Speech service initialized');
            } catch (error) {
                logger.error('Failed to initialize Azure Speech:', error);
                this.enabled = false;
            }
        } else {
            logger.warn('Azure Speech not configured. Voice input disabled.');
            this.enabled = false;
        }
    }

    /**
     * Convert voice audio to text
     * 
     * @param audioBuffer - Audio buffer (WAV format recommended)
     * @returns Transcribed text with confidence score
     * 
     * SAFETY: Always requires human verification flag set to true
     */
    async voiceToText(audioBuffer: Buffer): Promise<VoiceToTextResult> {
        if (!this.enabled || !this.speechConfig) {
            return {
                success: false,
                error: 'Azure Speech not configured',
                requiresHumanVerification: true
            };
        }

        try {
            // Create push stream from audio buffer
            const pushStream = sdk.AudioInputStream.createPushStream();
            pushStream.write(audioBuffer);
            pushStream.close();

            const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
            const recognizer = new sdk.SpeechRecognizer(this.speechConfig, audioConfig);

            return new Promise((resolve) => {
                recognizer.recognizeOnceAsync(
                    (result) => {
                        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
                            // Calculate confidence (0-1)
                            const confidence = this.calculateConfidence(result);

                            resolve({
                                success: true,
                                text: result.text,
                                confidence,
                                requiresHumanVerification: true // Always require verification
                            });
                        } else {
                            resolve({
                                success: false,
                                error: 'Speech not recognized',
                                requiresHumanVerification: true
                            });
                        }
                        recognizer.close();
                    },
                    (error) => {
                        logger.error('Speech recognition error:', error);
                        resolve({
                            success: false,
                            error: error.toString(),
                            requiresHumanVerification: true
                        });
                        recognizer.close();
                    }
                );
            });

        } catch (error) {
            logger.error('Voice to text conversion failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                requiresHumanVerification: true
            };
        }
    }

    /**
     * Calculate confidence score from speech recognition result
     * 
     * @param result - Speech recognition result
     * @returns Confidence score (0-1)
     */
    private calculateConfidence(result: sdk.SpeechRecognitionResult): number {
        try {
            // Parse JSON details if available
            const json = result.properties.getProperty(
                sdk.PropertyId.SpeechServiceResponse_JsonResult
            );

            if (json) {
                const parsed = JSON.parse(json);
                if (parsed.NBest && parsed.NBest.length > 0) {
                    return parsed.NBest[0].Confidence || 0.5;
                }
            }
        } catch (error) {
            logger.warn('Could not parse confidence score:', error);
        }

        // Default confidence for successful recognition
        return 0.7;
    }

    /**
     * Convert text to speech (for voice responses - optional feature)
     * 
     * @param text - Text to convert to speech
     * @returns Audio buffer
     */
    async textToSpeech(text: string): Promise<Buffer | null> {
        if (!this.enabled || !this.speechConfig) {
            logger.warn('Text to speech not available');
            return null;
        }

        try {
            const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig);

            return new Promise((resolve) => {
                synthesizer.speakTextAsync(
                    text,
                    (result) => {
                        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                            resolve(Buffer.from(result.audioData));
                        } else {
                            resolve(null);
                        }
                        synthesizer.close();
                    },
                    (error) => {
                        logger.error('Text to speech error:', error);
                        resolve(null);
                        synthesizer.close();
                    }
                );
            });

        } catch (error) {
            logger.error('Text to speech failed:', error);
            return null;
        }
    }

    /**
     * Check if speech service is enabled
     */
    isEnabled(): boolean {
        return this.enabled;
    }
}

export default new AzureSpeechService();
