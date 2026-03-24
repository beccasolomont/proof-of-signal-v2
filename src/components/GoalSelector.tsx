/**
 * GoalSelector — grid of goal buttons with max-selection logic.
 * Shared by Onboarding and Profile.
 */
import { Check } from 'lucide-react';
import { GOALS, MAX_GOALS } from '@/lib/constants';

interface GoalSelectorProps {
  selected: string[];
  onToggle: (goal: string) => void;
  /** Extra classNames applied per-goal for swap animations (Onboarding). */
  getExtraClassName?: (goal: string) => string;
}

const GoalSelector = ({ selected, onToggle, getExtraClassName }: GoalSelectorProps) => (
  <div className="grid grid-cols-2 gap-2">
    {GOALS.map(g => (
      <button
        key={g}
        onClick={() => onToggle(g)}
        className={`px-4 py-3 rounded-xl text-sm text-left border transition-colors ${
          selected.includes(g)
            ? 'border-navy bg-navy text-primary-foreground'
            : 'border-border bg-card text-foreground hover:border-blush'
        } ${getExtraClassName?.(g) ?? ''}`}
      >
        {selected.includes(g) && <Check className="inline w-3.5 h-3.5 mr-1.5" />}
        {g}
      </button>
    ))}
  </div>
);

export default GoalSelector;
