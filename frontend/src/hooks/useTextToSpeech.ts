import { useCallback, useRef, useState } from 'react';

interface UseTextToSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string;
}

interface TextToSpeechReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
}

export function useTextToSpeech({
  rate = 1,
  pitch = 1,
  volume = 1,
  voice,
}: UseTextToSpeechOptions = {}): TextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load voices
  if (isSupported && voices.length === 0) {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  const speak = useCallback((text: string) => {
    if (!isSupported) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Find requested voice or use default
    if (voice && voices.length > 0) {
      const selectedVoice = voices.find(v => 
        v.name.toLowerCase().includes(voice.toLowerCase())
      );
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, rate, pitch, volume, voice, voices]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    voices,
  };
}

// Alert announcements for emergency updates
export const emergencyAlerts = {
  ambulanceDispatched: "Ambulance has been dispatched. Help is on the way.",
  ambulanceNearby: "Ambulance is 2 minutes away. Please stay calm.",
  ambulanceArrived: "Ambulance has arrived at your location.",
  emergencyConfirmed: "Emergency confirmed. Ambulance is being dispatched.",
  locationShared: "Your location has been shared with emergency contacts.",
  cancelConfirmed: "Emergency request has been cancelled.",
};
