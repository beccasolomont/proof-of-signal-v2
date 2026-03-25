/**
 * SignalHeatmapCalendar — monthly calendar where each day is shaded
 * by how many signals were logged on that date. Clicking a day opens
 * a dialog listing that day's signals.
 */
import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths, isSameMonth, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Signal } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getTagColorClass } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface SignalHeatmapCalendarProps {
  signals: Signal[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SignalHeatmapCalendar = ({ signals }: SignalHeatmapCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Group signals by date string
  const signalsByDate = useMemo(() => {
    const map: Record<string, Signal[]> = {};
    signals.forEach(s => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return map;
  }, [signals]);

  // Find the max count across all dates for opacity scaling
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
    <div className="bg-card rounded-2xl border border-border p-6 lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-serif text-navy">Signal calendar</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
            className="p-1 rounded-md hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-medium text-navy w-32 text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
            className="p-1 rounded-md hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
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
                'aspect-square rounded-lg flex flex-col items-center justify-center text-xs relative transition-all',
                count > 0 ? 'cursor-pointer hover:ring-2 hover:ring-navy/30' : 'cursor-default',
                today && 'ring-1 ring-navy/40',
              )}
              style={count > 0 ? { backgroundColor: `hsl(var(--navy) / ${opacity})` } : undefined}
            >
              <span className={cn(
                'text-xs',
                count > 0 && opacity > 0.5 ? 'text-primary-foreground' : 'text-foreground',
                !isSameMonth(day, currentMonth) && 'text-muted-foreground',
              )}>
                {format(day, 'd')}
              </span>
              {count > 0 && (
                <span className={cn(
                  'text-[10px] leading-none mt-0.5 font-medium',
                  opacity > 0.5 ? 'text-primary-foreground/80' : 'text-navy/70',
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 justify-end">
        <span className="text-[10px] text-muted-foreground">Less</span>
        {[0.15, 0.35, 0.55, 0.75, 0.9].map((op, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: `hsl(var(--navy) / ${op})` }}
          />
        ))}
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>

      {/* Day detail dialog */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-navy">
              {selectedDate ? format(new Date(selectedDate + 'T00:00:00'), 'MMMM d, yyyy') : ''}
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
