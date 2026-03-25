

## Signal Category Color Proposal

Your brand palette centers on **navy** (hsl 220, 58%, 28%), **blush/rose** (hsl 340, 80%, 70%), and soft neutrals. The six category colors below are derived from that foundation — each is distinct enough for visual separation while staying harmonious with the brand.

### Proposed colors

| Signal Category        | Background              | Text        | Rationale                                    |
|------------------------|-------------------------|-------------|----------------------------------------------|
| **Recognition**        | `hsl(340, 72%, 90%)`    | Navy        | Rose-soft — already your secondary; warm, positive |
| **Missed Credit**      | `hsl(25, 70%, 92%)`     | Navy        | Warm amber tint — subtle caution without alarm |
| **Constructive Feedback** | `hsl(200, 50%, 90%)` | Navy        | Cool blue — neutral, developmental tone      |
| **Manager Signal**     | `hsl(260, 45%, 92%)`    | Navy        | Muted lavender — watchful, distinct from blue |
| **Org / Political Signal** | `hsl(170, 40%, 90%)` | Navy        | Soft teal — organizational, strategic feel   |
| **Personal Milestone** | `hsl(45, 65%, 90%)`     | Navy        | Warm gold — celebratory but restrained       |

### Implementation plan

1. **Add a `TAG_COLORS` constant** in `src/lib/constants.ts` mapping each tag to its `bg` and `text` class (or inline HSL values).

2. **Create a helper** `getTagColor(tag: string)` that returns the appropriate classes, falling back to the existing `bg-rose-soft text-navy` for unknown tags.

3. **Apply in three locations** (badge styling only, no layout or behavior changes):
   - `SignalCard.tsx` — the inline tag badge
   - `Patterns.tsx` — the theme distribution badges and flagged-signal badges
   - `Dashboard.tsx` — if tag badges appear in the timeline

4. **Add CSS variables** for each category color in `src/index.css` (both light and dark themes) so dark mode stays consistent.

All changes are purely cosmetic — badge background colors shift per category. No new UI elements, no behavior changes.

