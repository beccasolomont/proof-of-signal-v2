/**
 * SignalHeatmapCalendar — compact monthly calendar where each day is shaded
 * by how many signals were logged on that date. Clicking a day opens
 * a dialog listing that day's signals.
 */
import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Signal } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getTagColorClass } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface SignalHeatmapCalendarProps {
  signals: Signal[];
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const SignalHeatmapCalendar = ({ signals }: SignalHeatmapCalendarProps) => {
  // Default to the month of the most recent signal, or current month
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (signals.length > 0) {
      const sorted = [...signals].sort((a, b) => b.date.localeCompare(a.date));
      return startOfMonth(parseISO(sorted[0].date));
    }
    return startOfMonth(new Date());
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const signalsByDate = useMemo(() => {
    const map: Record<string, Signal[]> = {};
    signals.forEach(s => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return map;
  }, [signals]);

  const maxCount = useMemo(() => {
    const counts = Object.values(signalsByDate).map(arr => arr.length);
    return Math.max(...counts, 1);
  }, [signalsByDate]);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startDayOfWeek = getDay(days[0]);
  const selectedSignals = selectedDate ? (signalsByDate[selectedDate] || []) : [];

  return (
    <div className="bg-card rounded-2xl border border-border p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-serif text-navy">Signal calendar</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
            className="p-0.5 rounded hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <span className="text-xs font-medium text-navy w-24 text-center">
            {format(currentMonth, 'MMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
            className="p-0.5 rounded hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-center text-xs text-muted-foreground font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-7" />
        ))}

        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const count = signalsByDate[dateStr]?.length || 0;
          const opacity = count > 0 ? 0.15 + (count / maxCount) * 0.75 : 0;
          const today = isToday(day);

          return (
            <button
              key={dateStr}
              onClick={() => count > 0 && setSelectedDate(dateStr)}
              className={cn(
                'h-7 rounded flex flex-col items-center justify-center relative transition-all',
                count > 0 ? 'cursor-pointer hover:ring-1 hover:ring-navy/30' : 'cursor-default',
                today && 'ring-1 ring-navy/40',
              )}
              style={count > 0 ? { backgroundColor: `hsl(var(--navy) / ${opacity})` } : undefined}
            >
              <span className={cn(
                'text-[11px] leading-none',
                count > 0 && opacity > 0.5 ? 'text-primary-foreground' : 'text-foreground',
              )}>
                {format(day, 'd')}
              </span>
              {count > 0 && (
                <div
                  className="w-1 h-1 rounded-full mt-0.5"
                  style={{ backgroundColor: opacity > 0.5 ? 'hsl(var(--primary-foreground))' : 'hsl(var(--navy))' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="text-[9px] text-muted-foreground">Less</span>
        {[0.15, 0.35, 0.55, 0.75, 0.9].map((op, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: `hsl(var(--navy) / ${op})` }}
          />
        ))}
        <span className="text-[9px] text-muted-foreground">More</span>
      </div>

      {/* Day detail dialog */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-navy">
              {selectedDate ? format(parseISO(selectedDate), 'MMMM d, yyyy') : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {selectedSignals.map(s => (
              <div key={s.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                <Badge variant="secondary" className={`${getTagColorClass(s.tag)} text-navy border-0 text-xs flex-shrink-0 mt-0.5`}>
                  {s.tag}
                </Badge>
                <p className="text-sm text-foreground leading-relaxed">{s.text}</p>
              </div>
            ))}
            {selectedSignals.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No signals on this date.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignalHeatmapCalendar;
