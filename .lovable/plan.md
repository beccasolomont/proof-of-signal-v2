

## Add Radar Chart to Patterns Page

### What
A radar/spider chart visualizing the six signal categories, where each axis length reflects frequency and fill color deepens with higher counts. Placed in the existing 2-column grid alongside the current "Signal themes" bar chart card.

### Layout Change
The current 2-column grid has: (1) Signal themes bar chart, (2) Insight card. The radar chart will be added as a third card. New layout:
- Row 1: Signal themes (left), Radar chart (right)
- Row 2: Insight card (full width)
- Row 3: Flagged review (full width, as before)

### Implementation

**1. New component: `src/components/SignalRadarChart.tsx`**
- Accepts `tagCounts: Record<string, number>` as a prop
- Uses Recharts `RadarChart`, `PolarGrid`, `PolarAngleAxis`, `Radar` from the already-installed `recharts` package
- Data: array of `{ category: string, count: number }` for all 6 `SIGNAL_TAGS` (including zeros)
- Radar fill uses navy (`hsl(220, 58%, 28%)`) with opacity derived from max frequency — the higher the max count, the deeper/more opaque the fill (range 0.3–0.8)
- Stroke in navy, grid lines in muted border color
- Wrapped in `ChartContainer` from `src/components/ui/chart.tsx` for consistent styling
- Compact, no external legend needed (axis labels serve as legend)

**2. Update `src/pages/Patterns.tsx`**
- Import `SignalRadarChart`
- Pass the existing `tagCounts` object to the new component
- Move the insight card to span full width (`lg:col-span-2`)
- Radar chart takes the right column in row 1

### Technical Details
- Recharts is already a project dependency (used by `chart.tsx`)
- All 6 categories always shown on axes (even with 0 count) for consistent shape
- Fill opacity calculated as: `0.3 + (maxCount / totalSignals) * 0.5`, clamped to 0.8
- Category labels shortened for readability on small viewports (e.g., "Org / Political Signal" → "Org / Political")
- No new dependencies needed

