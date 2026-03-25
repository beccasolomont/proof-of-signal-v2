import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { SIGNAL_TAGS } from '@/lib/signalTagger';

const SHORT_LABELS: Record<string, string> = {
  'Org / Political Signal': 'Org / Political',
  'Constructive Feedback': 'Feedback',
  'Personal Milestone': 'Milestone',
  'Manager Signal': 'Manager',
  'Missed Credit': 'Missed Credit',
  'Recognition': 'Recognition',
};

interface SignalRadarChartProps {
  tagCounts: Record<string, number>;
  totalSignals: number;
}

const SignalRadarChart = ({ tagCounts, totalSignals }: SignalRadarChartProps) => {
  const data = SIGNAL_TAGS.map(tag => ({
    category: SHORT_LABELS[tag] || tag,
    count: tagCounts[tag] || 0,
  }));

  const maxCount = Math.max(...data.map(d => d.count), 1);
  // Outer opacity deepens with higher max frequency
  const outerOpacity = Math.min(0.35 + (maxCount / Math.max(totalSignals, 1)) * 0.55, 0.9);
  const innerOpacity = outerOpacity * 0.15;

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h2 className="text-lg font-serif text-navy mb-4">Signal radar</h2>
      <div className="w-full aspect-square max-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <defs>
              <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(var(--navy))" stopOpacity={innerOpacity} />
                <stop offset="100%" stopColor="hsl(var(--navy))" stopOpacity={outerOpacity} />
              </radialGradient>
            </defs>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Radar
              name="Signals"
              dataKey="count"
              stroke="hsl(var(--navy))"
              fill="url(#radarGradient)"
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SignalRadarChart;
