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

/** Category colors matching the brand palette CSS variables. */
const TAG_FILL_COLORS: Record<SignalTag, string> = {
  'Recognition': 'hsl(340, 72%, 90%)',
  'Missed Credit': 'hsl(25, 70%, 92%)',
  'Constructive Feedback': 'hsl(200, 50%, 90%)',
  'Manager Signal': 'hsl(260, 45%, 92%)',
  'Org / Political Signal': 'hsl(170, 40%, 90%)',
  'Personal Milestone': 'hsl(45, 65%, 90%)',
};

/** Darker saturated versions for stronger visual weight. */
const TAG_STROKE_COLORS: Record<SignalTag, string> = {
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
  const domain = maxCount + baseline;

  // Shared data structure — all categories present on every series
  const baseData = SIGNAL_TAGS.map(tag => ({
    category: SHORT_LABELS[tag] || tag,
    fullTag: tag,
  }));

  // Build one Radar series per category: only that category gets its real value,
  // all others sit at baseline so the shape fans out per-segment.
  const series = SIGNAL_TAGS.map(activeTag => ({
    tag: activeTag,
    data: baseData.map(d => ({
      ...d,
      value: d.fullTag === activeTag ? (tagCounts[activeTag] || 0) + baseline : baseline,
    })),
  }));

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h2 className="text-lg font-serif text-navy mb-4">Signal radar</h2>
      <div className="w-full aspect-square max-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={baseData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarRadiusAxis domain={[0, domain]} tick={false} axisLine={false} />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            {series.map(({ tag, data }) => (
              <Radar
                key={tag}
                name={SHORT_LABELS[tag] || tag}
                data={data}
                dataKey="value"
                stroke={TAG_STROKE_COLORS[tag]}
                fill={TAG_FILL_COLORS[tag]}
                fillOpacity={0.7}
                strokeWidth={1.5}
              />
            ))}
            {/* Outer navy stroke for the combined shape */}
            <Radar
              name="Outline"
              data={SIGNAL_TAGS.map(tag => ({
                category: SHORT_LABELS[tag] || tag,
                value: (tagCounts[tag] || 0) + baseline,
              }))}
              dataKey="value"
              stroke="hsl(var(--navy))"
              fill="none"
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SignalRadarChart;
