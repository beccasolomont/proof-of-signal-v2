/**
 * useVoiceInput — hook for browser-native speech recognition.
 *
 * @param onTranscript - Callback invoked with the recognised text when speech ends.
 * @returns `{ supported, listening, toggle }` — whether the API exists, current state, and a start/stop toggle.
 */
import { useState, useEffect, useCallback, useRef } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

function getSpeechRecognition(): SpeechRecognitionCtor | undefined {
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function useVoiceInput(onTranscript: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    setSupported(!!getSpeechRecognition());
  }, []);

  const toggle = useCallback(() => {
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const SR = getSpeechRecognition();
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
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
