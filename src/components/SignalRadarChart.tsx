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
  'Recognition': 'hsl(340, 72%, 70%)',
  'Missed Credit': 'hsl(25, 70%, 72%)',
  'Constructive Feedback': 'hsl(200, 50%, 70%)',
  'Manager Signal': 'hsl(260, 45%, 72%)',
  'Org / Political Signal': 'hsl(170, 40%, 70%)',
  'Personal Milestone': 'hsl(45, 65%, 70%)',
};

interface SignalRadarChartProps {
  tagCounts: Record<string, number>;
  totalSignals: number;
}

const SignalRadarChart = ({ tagCounts, totalSignals }: SignalRadarChartProps) => {
  const maxCount = Math.max(...SIGNAL_TAGS.map(t => tagCounts[t] || 0), 1);
  const baseline = maxCount * 0.08;
  const outerOpacity = Math.min(0.35 + (maxCount / Math.max(totalSignals, 1)) * 0.55, 0.9);
  const innerOpacity = outerOpacity * 0.15;

  const data = SIGNAL_TAGS.map(tag => ({
    category: SHORT_LABELS[tag] || tag,
    fullTag: tag,
    value: (tagCounts[tag] || 0) + baseline,
  }));

  const renderTick = (props: any) => {
    const { x, y, payload } = props;
    const entry = data.find(d => d.category === payload.value);
    const color = entry ? LABEL_COLORS[entry.fullTag as SignalTag] : 'hsl(var(--muted-foreground))';
    return (
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={500} fill={color}>
        {payload.value}
      </text>
    );
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h2 className="text-lg font-serif text-navy mb-4">Signal radar</h2>
      <div className="w-full flex items-center justify-center" style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <defs>
              <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(var(--navy))" stopOpacity={innerOpacity} />
                <stop offset="100%" stopColor="hsl(var(--navy))" stopOpacity={outerOpacity} />
              </radialGradient>
            </defs>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarRadiusAxis domain={[0, maxCount + baseline]} tick={false} axisLine={false} />
            <PolarAngleAxis dataKey="category" tick={renderTick} />
            <Radar
              name="Signals"
              dataKey="value"
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
