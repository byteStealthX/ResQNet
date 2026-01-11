import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface UseVoiceCommandsOptions {
  onSOSTrigger?: () => void;
  onCall108?: () => void;
  onCancel?: () => void;
  enabled?: boolean;
}

interface VoiceCommandsReturn {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
  isSupported: boolean;
}

const SOS_PHRASES = ['help me', 'help', 'emergency', 'sos', 'call ambulance', 'i need help'];
const CALL_PHRASES = ['call 108', 'call ambulance', 'dial 108'];
const CANCEL_PHRASES = ['cancel', 'stop', 'nevermind', 'false alarm'];

export function useVoiceCommands({
  onSOSTrigger,
  onCall108,
  onCancel,
  enabled = true,
}: UseVoiceCommandsOptions = {}): VoiceCommandsReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const processCommand = useCallback((text: string) => {
    const lowerText = text.toLowerCase().trim();
    
    // Check for SOS phrases
    if (SOS_PHRASES.some(phrase => lowerText.includes(phrase))) {
      toast({
        title: "🚨 Voice Command Detected",
        description: `Triggering emergency: "${text}"`,
        variant: "destructive",
      });
      onSOSTrigger?.();
      return true;
    }
    
    // Check for call phrases
    if (CALL_PHRASES.some(phrase => lowerText.includes(phrase))) {
      toast({
        title: "📞 Voice Command Detected",
        description: "Calling 108...",
      });
      onCall108?.();
      return true;
    }
    
    // Check for cancel phrases
    if (CANCEL_PHRASES.some(phrase => lowerText.includes(phrase))) {
      toast({
        title: "❌ Voice Command Detected",
        description: "Cancelling...",
      });
      onCancel?.();
      return true;
    }
    
    return false;
  }, [onSOSTrigger, onCall108, onCancel]);

  const startListening = useCallback(() => {
    if (!isSupported || !enabled) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "🎤 Voice Activated",
        description: "Say 'Help me' or 'Emergency' for SOS",
      });
    };
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      
      setTranscript(interimTranscript || finalTranscript);
      
      if (finalTranscript) {
        processCommand(finalTranscript);
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        toast({
          title: "Voice Recognition Error",
          description: `Error: ${event.error}`,
          variant: "destructive",
        });
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
      // Restart if still enabled (continuous listening)
      if (enabled && recognitionRef.current) {
        try {
          recognition.start();
        } catch (e) {
          // Already started
        }
      }
    };
    
    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
    }
  }, [isSupported, enabled, processCommand]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setTranscript('');
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    startListening,
    stopListening,
    transcript,
    isSupported,
  };
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}
