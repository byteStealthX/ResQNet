import { useState, useCallback, useEffect } from 'react';
import { useVoiceCommands } from './useVoiceCommands';
import { useTextToSpeech, emergencyAlerts } from './useTextToSpeech';
import { toast } from '@/hooks/use-toast';

interface UseVoiceSOSAssistantOptions {
  onSOSTrigger?: () => void;
  onCall108?: () => void;
  onCancel?: () => void;
  autoAnnounce?: boolean;
}

interface VoiceSOSAssistantReturn {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  activate: () => void;
  deactivate: () => void;
  announce: (message: string) => void;
  announceAlert: (alertKey: keyof typeof emergencyAlerts) => void;
  isSupported: boolean;
}

export function useVoiceSOSAssistant({
  onSOSTrigger,
  onCall108,
  onCancel,
  autoAnnounce = true,
}: UseVoiceSOSAssistantOptions = {}): VoiceSOSAssistantReturn {
  const [isActive, setIsActive] = useState(false);
  
  const { speak, stop: stopSpeaking, isSpeaking, isSupported: ttsSupported } = useTextToSpeech({
    rate: 1.1,
    pitch: 1,
    volume: 1,
  });
  
  const {
    isListening,
    startListening,
    stopListening,
    transcript,
    isSupported: voiceSupported,
  } = useVoiceCommands({
    onSOSTrigger: () => {
      if (autoAnnounce) {
        speak(emergencyAlerts.emergencyConfirmed);
      }
      onSOSTrigger?.();
    },
    onCall108: () => {
      if (autoAnnounce) {
        speak("Calling emergency services.");
      }
      onCall108?.();
    },
    onCancel: () => {
      if (autoAnnounce) {
        speak(emergencyAlerts.cancelConfirmed);
      }
      onCancel?.();
    },
    enabled: isActive,
  });

  const activate = useCallback(() => {
    setIsActive(true);
    startListening();
    if (autoAnnounce) {
      speak("Voice assistant activated. Say help me or emergency to trigger SOS.");
    }
    toast({
      title: "🎤 Voice SOS Assistant Active",
      description: "Listening for voice commands...",
    });
  }, [startListening, speak, autoAnnounce]);

  const deactivate = useCallback(() => {
    setIsActive(false);
    stopListening();
    stopSpeaking();
    toast({
      title: "Voice Assistant Deactivated",
      description: "Voice commands disabled",
    });
  }, [stopListening, stopSpeaking]);

  const announce = useCallback((message: string) => {
    speak(message);
  }, [speak]);

  const announceAlert = useCallback((alertKey: keyof typeof emergencyAlerts) => {
    speak(emergencyAlerts[alertKey]);
  }, [speak]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [stopListening, stopSpeaking]);

  return {
    isActive,
    isListening,
    isSpeaking,
    transcript,
    activate,
    deactivate,
    announce,
    announceAlert,
    isSupported: voiceSupported && ttsSupported,
  };
}
