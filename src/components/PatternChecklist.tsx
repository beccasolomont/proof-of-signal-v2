/**
 * PatternChecklist — AI-generated actionable next steps based on flagged signal patterns.
 */
import { useState } from 'react';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChecklistItem {
  text: string;
  priority: 'high' | 'medium' | 'low';
}

interface PatternChecklistProps {
  items: ChecklistItem[];
}

const priorityConfig = {
  high: { label: 'High', className: 'bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]' },
  medium: { label: 'Med', className: 'bg-[hsl(var(--tag-manager-signal))] text-navy' },
  low: { label: 'Low', className: 'bg-[hsl(var(--tag-personal-milestone))] text-navy' },
};

const PatternChecklist = ({ items }: PatternChecklistProps) => {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (items.length === 0) return null;

  const completedCount = checked.size;
  const totalCount = items.length;

  return (
    <div className="bg-card rounded-2xl border-2 border-accent p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
          <ArrowRight className="w-4 h-4 text-accent-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-serif text-navy">Recommended next steps</h2>
          <p className="text-xs text-muted-foreground">
            {completedCount}/{totalCount} completed
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => {
          const isDone = checked.has(i);
          const config = priorityConfig[item.priority];
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              className="flex items-start gap-3 w-full text-left group hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors"
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5 group-hover:text-accent transition-colors" />
              )}
              <span className={`text-sm flex-1 leading-relaxed ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {item.text}
              </span>
              <Badge className={`${config.className} text-[10px] px-1.5 py-0 flex-shrink-0 border-0`}>
                {config.label}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PatternChecklist;
