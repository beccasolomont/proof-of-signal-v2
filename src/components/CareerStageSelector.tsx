/**
 * CareerStageSelector — grid of career-stage buttons shared by Onboarding and Profile.
 */
import { CAREER_STAGES } from '@/lib/constants';

interface CareerStageSelectorProps {
  value: string;
  onChange: (stage: string) => void;
}

const CareerStageSelector = ({ value, onChange }: CareerStageSelectorProps) => (
  <div className="grid grid-cols-2 gap-2">
    {CAREER_STAGES.map(s => (
      <button
        key={s}
        onClick={() => onChange(s)}
        className={`px-4 py-3 rounded-xl text-sm text-left border transition-colors ${
          value === s
            ? 'border-navy bg-navy text-primary-foreground'
            : 'border-border bg-card text-foreground hover:border-blush'
        }`}
      >
        {s}
      </button>
    ))}
  </div>
);

export default CareerStageSelector;
