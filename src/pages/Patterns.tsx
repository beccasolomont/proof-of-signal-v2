/**
 * Patterns — AI-powered insights view.
 *
 * Displays signal theme distribution, contextual insight copy based on dominant theme,
 * clickable tag definitions, and a categorised flagged-signal review section.
 */
import { useState } from 'react';
import { useApp, FLAG_CATEGORIES, FlagCategory } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/illustrations/EmptyState';
import DemoInsight from '@/components/DemoInsight';
import { SIGNAL_TAGS } from '@/lib/signalTagger';
import { TAG_DEFINITIONS, THEME_INSIGHTS, MIN_SIGNALS_FOR_INSIGHT, DEMO_USER_NAME, getTagColorClass } from '@/lib/constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SignalRadarChart from '@/components/SignalRadarChart';
import SignalHeatmapCalendar from '@/components/SignalHeatmapCalendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

const Patterns = () => {
  const { signals, user, updateSignal } = useApp();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const tagCounts = SIGNAL_TAGS.reduce((acc, tag) => {
    acc[tag] = signals.filter(s => s.tag === tag).length;
    return acc;
  }, {} as Record<string, number>);

  const topTags = Object.entries(tagCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  const totalSignals = signals.length;
  const signalsNeeded = MIN_SIGNALS_FOR_INSIGHT - totalSignals;

  const flaggedSignals = signals.filter(s => s.flagged);
  const filteredFlagged = categoryFilter === 'all'
    ? flaggedSignals
    : flaggedSignals.filter(s => (s.flagCategory || 'ai-pending') === categoryFilter);

  // Auto-suggest flag categories for uncategorized flagged signals
  const suggestedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const uncategorized = flaggedSignals.filter(s => !s.flagCategory && !suggestedRef.current.has(s.id));
    if (uncategorized.length === 0) return;

    uncategorized.forEach(s => {
      suggestedRef.current.add(s.id);
      supabase.functions.invoke('suggest-flag-category', {
        body: { text: s.text, tag: s.tag },
      }).then(({ data, error }) => {
        if (!error && data?.category) {
          updateSignal(s.id, { flagCategory: data.category as FlagCategory });
        }
      }).catch(() => { /* silently fail */ });
    });
  }, [flaggedSignals]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-8 md:px-16 lg:px-24 py-10 max-w-[1600px] mx-auto">
        <h1 className="text-3xl font-serif text-navy mb-2">Patterns</h1>
        <p className="text-muted-foreground text-sm mb-10">
          AI-powered insights based on your signals. The more you log, the clearer the picture.
        </p>

        {totalSignals < MIN_SIGNALS_FOR_INSIGHT ? (
          <EmptyState
            title="Not enough signals yet"
            description={`Log ${signalsNeeded} more signal${signalsNeeded > 1 ? 's' : ''} to unlock your first pattern insight.`}
          />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Tag Distribution */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-serif text-navy mb-4">Signal themes</h2>
              <div className="space-y-3">
                {topTags.map(([tag, count]) => (
                  <div key={tag} className="flex items-center gap-3">
                    <button onClick={() => setSelectedTag(tag)} className="focus:outline-none">
                      <Badge variant="secondary" className={`${getTagColorClass(tag)} text-navy border-0 text-xs w-36 justify-center cursor-pointer hover:opacity-80 transition-all`}>
                        {tag}
                      </Badge>
                    </button>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-navy rounded-full transition-all"
                        style={{ width: `${(count / totalSignals) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar Chart */}
            <SignalRadarChart tagCounts={tagCounts} totalSignals={totalSignals} />

            {/* Signal Calendar */}
            <SignalHeatmapCalendar signals={signals} />

            {/* Insight — full width */}
            <div className="bg-gradient-to-br from-rose-soft to-blush-light rounded-2xl p-6 border border-blush/20 lg:col-span-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-foreground text-xs font-bold">✦</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-navy mb-1">What your signals suggest</h3>
                  {user.firstName === DEMO_USER_NAME ? (
                    <DemoInsight />
                  ) : (
                    <p className="text-sm text-foreground leading-relaxed">
                      {THEME_INSIGHTS[topTags[0]?.[0]] || `Based on your ${totalSignals} signals, patterns are emerging.`}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Flagged Review — spans full width */}

            {/* Flagged Review — spans full width */}
            {flaggedSignals.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6 lg:col-span-3">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-serif text-navy">Flagged for review</h2>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48 h-8 text-xs">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {FLAG_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  {filteredFlagged.map(s => (
                    <div key={s.id} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-20 flex-shrink-0">{s.date}</span>
                      <p className="text-sm text-foreground line-clamp-1 flex-1">{s.text}</p>
                      <Badge variant="secondary" className={`${getTagColorClass(s.tag)} text-navy border-0 text-xs flex-shrink-0`}>
                        {s.tag}
                      </Badge>
                      <Select
                        value={s.flagCategory || 'ai-pending'}
                        onValueChange={(val) => updateSignal(s.id, { flagCategory: val as FlagCategory })}
                      >
                        <SelectTrigger className="w-44 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ai-pending" disabled className="text-muted-foreground italic">
                            AI suggestion pending
                          </SelectItem>
                          {FLAG_CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                  {filteredFlagged.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No flagged signals in this category.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tag Definition Modal */}
      <Dialog open={!!selectedTag} onOpenChange={() => setSelectedTag(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-navy">{selectedTag}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-foreground leading-relaxed">
            {selectedTag ? TAG_DEFINITIONS[selectedTag] ?? 'No definition available.' : ''}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Patterns;
