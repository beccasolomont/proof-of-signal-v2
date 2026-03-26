/**
 * PatternInsightCard — AI-generated insight + motivational quote for the Patterns page.
 * Fetches a holistic analysis based on ALL signals, not just one theme.
 */
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';

interface PatternInsight {
  insight: string;
  quote: string;
  checklist: { text: string; priority: 'high' | 'medium' | 'low' }[];
}

interface PatternInsightCardProps {
  tagCounts: Record<string, number>;
  onChecklistGenerated: (checklist: PatternInsight['checklist']) => void;
}

const PatternInsightCard = ({ tagCounts, onChecklistGenerated }: PatternInsightCardProps) => {
  const { signals, user } = useApp();
  const [insight, setInsight] = useState<string | null>(null);
  const [quote, setQuote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchInsight = useCallback(async () => {
    if (signals.length === 0) return;
    setLoading(true);
    setError(false);
    try {
      const flaggedSignals = signals.filter(s => s.flagged);
      const { data, error: fnError } = await supabase.functions.invoke('generate-pattern-insight', {
        body: {
          signals: signals.map(s => ({
            date: s.date,
            tag: s.tag,
            text: s.text,
            flagged: s.flagged,
            flagCategory: s.flagCategory,
          })),
          tagCounts,
          flaggedSignals: flaggedSignals.map(s => ({
            text: s.text,
            tag: s.tag,
            flagCategory: s.flagCategory,
          })),
          careerStage: user.careerStage,
          goals: user.goals,
        },
      });

      if (!fnError && data && !data.error) {
        if (data.insight) setInsight(data.insight);
        if (data.quote) setQuote(data.quote);
        if (data.checklist) onChecklistGenerated(data.checklist);
      } else {
        console.error('Pattern insight error:', fnError || data?.error);
        setError(true);
      }
    } catch (e) {
      console.error('Pattern insight fetch failed:', e);
      setError(true);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }, [signals, tagCounts, user.careerStage, user.goals, onChecklistGenerated]);

  useEffect(() => {
    if (!fetched && signals.length > 0) {
      fetchInsight();
    }
  }, [fetched, signals.length, fetchInsight]);


  return (
    <div className="bg-gradient-to-br from-rose-soft to-blush-light rounded-2xl p-6 border border-blush/20 flex flex-col h-full">
      <div className="flex items-start gap-3 flex-1">
        <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-primary-foreground text-xs font-bold">✦</span>
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-navy">What your signals suggest</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                disabled={loading}
                onClick={() => { setFetched(false); }}
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              </Button>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground italic">Analyzing all your signals…</p>
          ) : insight ? (
            <p className="text-sm text-muted-foreground italic">Analyzing all your signals…</p>
          ) : insight ? (
            <div className="flex flex-col flex-1">
              <p className="text-sm text-foreground leading-relaxed">{insight}</p>
              {quote && (
                <p className="text-xs text-muted-foreground italic mt-auto pt-4 border-t border-blush/20">
                  "{quote}"
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-foreground leading-relaxed">
              Based on your {signals.length} signals, patterns are emerging. Click refresh to generate insights.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatternInsightCard;
