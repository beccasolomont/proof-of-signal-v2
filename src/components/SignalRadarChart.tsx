import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { SIGNAL_TAGS, SignalTag } from '@/lib/signalTagger';

const SHORT_LABELS: Record<string, string> = {
  'Org / Political Signal': 'Org / Political',
  'Constructive Feedback': 'Feedback',
  'Personal Milestone': 'Milestone',
  'Manager Signal': 'Manager',
  'Missed Credit': 'Missed Credit',
  'Recognition': 'Recognition',
};

const LABEL_COLORS: Record<SignalTag, string> = {
  'Recognition': 'hsl(340, 72%, 45%)',
  'Missed Credit': 'hsl(25, 70%, 45%)',
  'Constructive Feedback': 'hsl(200, 55%, 40%)',
  'Manager Signal': 'hsl(260, 50%, 45%)',
  'Org / Political Signal': 'hsl(170, 45%, 38%)',
  'Personal Milestone': 'hsl(45, 65%, 42%)',
};

interface SignalRadarChartProps {
  tagCounts: Record<string, number>;
  totalSignals: number;
}

const SignalRadarChart = ({ tagCounts, totalSignals }: SignalRadarChartProps) => {
  const maxCount = Math.max(...SIGNAL_TAGS.map(t => tagCounts[t] || 0), 1);
  const baseline = maxCount * 0.08;
  const outerOpacity = Math.min(0.45 + (maxCount / Math.max(totalSignals, 1)) * 0.5, 0.95);
  const innerOpacity = outerOpacity * 0.25;

  const data = SIGNAL_TAGS.map(tag => ({
    category: SHORT_LABELS[tag] || tag,
    fullTag: tag,
    value: (tagCounts[tag] || 0) + baseline,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTick = (props: any) => {
    const { x, y, payload } = props;
    const entry = data.find(d => d.category === payload.value);
    const color = entry ? LABEL_COLORS[entry.fullTag as SignalTag] : 'hsl(var(--muted-foreground))';
    return (
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600} fill={color}>
        {payload.value}
      </text>
    );
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 h-full flex flex-col">
      <h2 className="text-lg font-serif text-navy mb-2">Signal radar</h2>
      <div className="w-full flex-1 flex items-center justify-center min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="80%">
            <defs>
              <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(var(--navy))" stopOpacity={innerOpacity} />
                <stop offset="100%" stopColor="hsl(var(--navy))" stopOpacity={outerOpacity} />
              </radialGradient>
            </defs>
            <PolarGrid stroke="hsl(var(--border))" strokeWidth={1.5} />
            <PolarRadiusAxis domain={[0, maxCount + baseline]} tick={false} axisLine={false} />
            <PolarAngleAxis dataKey="category" tick={renderTick} />
            <Radar
              name="Signals"
              dataKey="value"
              stroke="hsl(var(--navy))"
              fill="url(#radarGradient)"
              strokeWidth={2.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SignalRadarChart;
