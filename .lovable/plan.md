

## Plan: Update Dashboard Pattern Detected Section

### Changes

**1. Create a static signal icon component**
- File: `src/components/illustrations/SignalIcon.tsx` (new)
- A simplified, non-animated version of the hero SVG — concentric rings + core dot, rendered in a single color (navy)
- Sized to fit in the 32x32 icon area currently occupied by the `✦` character

**2. Update the Pattern Detected card icon**
- File: `src/pages/Dashboard.tsx` (lines 251-254)
- Replace the `✦` span with the new `SignalIcon` component inside the existing rounded circle

**3. Separate "Suggested next action" into its own CTA bubble**
- File: `src/components/DemoInsight.tsx`
- Remove `DEMO_INSIGHT_ACTION` from the insight body
- The insight card keeps only the title + body text

- File: `src/pages/Dashboard.tsx`
- Add a new card directly below the Pattern Detected card (still inside the right column)
- Distinct CTA styling: white/card background, stronger border (navy or blush), a directional icon (e.g. `ArrowRight`), and a bolder visual weight to differentiate it from the passive insight card
- Render only when `showInsight` is true and the user is the demo user (or when there's a suggested action)
- Content: `DEMO_INSIGHT_ACTION` text with a clear action-oriented design

### Technical Details

**SignalIcon SVG** — 3 concentric circles + center dot, all `currentColor`, no animation:
```text
  ○ outer ring (stroke)
  ○ middle ring (stroke)
  ○ inner ring (stroke)
  ● core dot (fill)
```

**CTA card styling** — visually distinct from the gradient insight card:
- `bg-card` with `border-2 border-navy/20` and a left accent stripe or icon highlight
- Uses `ArrowRight` lucide icon to signal actionability
- Not clickable/navigating — purely informational CTA text

