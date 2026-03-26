/**
 * Patterns — AI-powered insights view.
 *
 * Displays signal theme distribution, contextual insight copy based on dominant theme,
 * clickable tag definitions, and a categorised flagged-signal review section.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp, FLAG_CATEGORIES, FlagCategory } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/illustrations/EmptyState';
import { SIGNAL_TAGS } from '@/lib/signalTagger';
import { TAG_DEFINITIONS, MIN_SIGNALS_FOR_INSIGHT, getTagColorClass } from '@/lib/constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SignalRadarChart from '@/components/SignalRadarChart';
import SignalHeatmapCalendar from '@/components/SignalHeatmapCalendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PatternInsightCard from '@/components/PatternInsightCard';
import PatternChecklist from '@/components/PatternChecklist';


const Patterns = () => {
  const { signals, user, updateSignal, reclassifyFlaggedSignals } = useApp();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isReclassifying, setIsReclassifying] = useState(false);

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
    : flaggedSignals.filter(s => s.flagCategory === categoryFilter);

  // Coaching tips cache: signal id → tip text (or 'loading' / 'error')
  const [tips, setTips] = useState<Record<string, string>>({});
  const fetchedRef = useRef<Set<string>>(new Set());

  const fetchTip = useCallback(async (id: string, text: string, tag: string, flagCategory?: string) => {
    if (fetchedRef.current.has(id)) return;
    fetchedRef.current.add(id);
    setTips(prev => ({ ...prev, [id]: '__loading__' }));

    try {
      const { data, error } = await supabase.functions.invoke('coaching-tip', {
        body: { text, tag, flagCategory },
      });
      if (!error && data?.tip) {
        setTips(prev => ({ ...prev, [id]: data.tip }));
      } else {
        setTips(prev => ({ ...prev, [id]: '__error__' }));
      }
    } catch {
      setTips(prev => ({ ...prev, [id]: '__error__' }));
    }
  }, []);

  // Fetch tips for flagged signals on mount / when flagged signals change
  useEffect(() => {
    flaggedSignals.forEach(s => {
      if (!fetchedRef.current.has(s.id)) {
        fetchTip(s.id, s.text, s.tag, s.flagCategory);
      }
    });
  }, [flaggedSignals, fetchTip]);

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
          <div className="space-y-6">
            {/* Row 1: Calendar (left) + Radar (right) */}
            <div className="grid lg:grid-cols-2 gap-6">
              <SignalHeatmapCalendar signals={signals} />
              <SignalRadarChart tagCounts={tagCounts} totalSignals={totalSignals} />
            </div>

            {/* Row 2: Signal themes + Insight side by side */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Signal themes */}
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

              {/* Insight */}
              <div className="bg-gradient-to-br from-rose-soft to-blush-light rounded-2xl p-6 border border-blush/20">
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
            </div>
            {/* Flagged Review — spans full width */}

            {/* Flagged Review — spans full width */}
            {flaggedSignals.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-serif text-navy">Flagged for review</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1.5"
                      disabled={isReclassifying}
                      onClick={async () => {
                        setIsReclassifying(true);
                        await reclassifyFlaggedSignals();
                        setIsReclassifying(false);
                      }}
                    >
                      <RefreshCw className={`w-3 h-3 ${isReclassifying ? 'animate-spin' : ''}`} />
                      {isReclassifying ? 'Re-classifying…' : 'Re-classify'}
                    </Button>
                  </div>
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
                <div className="space-y-4">
                  {filteredFlagged.map(s => {
                    const tip = tips[s.id];
                    return (
                      <div key={s.id} className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-20 flex-shrink-0">{s.date}</span>
                          <p className="text-sm text-foreground line-clamp-1 flex-1">{s.text}</p>
                          <Badge variant="secondary" className={`${getTagColorClass(s.tag)} text-navy border-0 text-xs flex-shrink-0`}>
                            {s.tag}
                          </Badge>
                          <Select
                            value={s.flagCategory || 'Watch closely'}
                            onValueChange={(val) => updateSignal(s.id, { flagCategory: val as FlagCategory })}
                          >
                            <SelectTrigger className="w-44 h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FLAG_CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Coaching tip */}
                        {tip && tip !== '__error__' && (
                          <div className="flex items-start gap-2 ml-[calc(5rem+0.75rem)]">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                            {tip === '__loading__' ? (
                              <span className="text-xs text-muted-foreground italic">Generating coaching tip…</span>
                            ) : (
                              <p className="text-xs text-muted-foreground leading-relaxed italic">{tip}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
