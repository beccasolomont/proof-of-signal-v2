/**
 * useVoiceInput — hook for browser-native speech recognition.
 *
 * @param onTranscript - Callback invoked with the recognised text when speech ends.
 * @returns `{ supported, listening, toggle }` — whether the API exists, current state, and a start/stop toggle.
 */
import { useState, useEffect, useCallback, useRef } from 'react';

export function useVoiceInput(onTranscript: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SR);
  }, []);

  const toggle = useCallback(() => {
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setSupported(false);
    };

    recognition.start();
    setListening(true);
  }, [listening, onTranscript]);

  return { supported, listening, toggle };
}
