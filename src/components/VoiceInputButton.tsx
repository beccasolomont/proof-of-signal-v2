/**
 * VoiceInputButton — microphone toggle used in signal text areas.
 * Extracted from Dashboard and Onboarding to eliminate duplication.
 */
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputButtonProps {
  listening: boolean;
  onToggle: () => void;
}

const VoiceInputButton = ({ listening, onToggle }: VoiceInputButtonProps) => (
  <button
    type="button"
    onClick={onToggle}
    className={`absolute top-3 right-3 p-1.5 rounded-lg transition-colors ${listening ? 'bg-destructive/10 hover:bg-destructive/20' : ''}`}
    title={listening ? 'Stop recording' : 'Start voice input'}
  >
    {listening ? (
      <span className="flex items-center gap-1 text-xs font-medium text-destructive animate-pulse">
        <MicOff className="w-4 h-4" /> Stop
      </span>
    ) : (
      <Mic className="w-4 h-4 text-muted-foreground hover:text-navy" />
    )}
  </button>
);

export default VoiceInputButton;
