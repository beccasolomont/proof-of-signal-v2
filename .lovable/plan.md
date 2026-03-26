

## Fix: Flagged signal rows overflowing on mobile

**Problem**: The flagged signal row (line 171) uses `flex items-center gap-3` with fixed-width children (`w-20`, `w-44`) that overflow the card on small screens.

**Changes** — single file: `src/pages/Patterns.tsx`

1. **Signal row container (line 171)**: Change from `flex items-center gap-3` to `flex flex-wrap items-center gap-2 sm:gap-3` so children wrap on small screens.

2. **Date span (line 172)**: Keep `w-20 flex-shrink-0` on desktop but allow wrapping naturally — no change needed since flex-wrap handles it.

3. **Signal text (line 173)**: Add `min-w-0` to prevent flex overflow: `text-sm text-foreground line-clamp-1 flex-1 min-w-0`.

4. **Tag badge (line 174-176)**: Remove `flex-shrink-0` so it can wrap; it's already sized by content.

5. **Category dropdown (line 181)**: Change `w-44` to `w-44 max-w-full min-w-0` so it constrains within the card on mobile.

6. **Coaching tip margin (line 193)**: Change `ml-[calc(5rem+0.75rem)]` to `ml-0 sm:ml-[calc(5rem+0.75rem)]` so it doesn't offset on mobile.

7. **Header section (line 136)**: Change to `flex flex-wrap items-center justify-between gap-3 mb-4` so the title/button and filter dropdown wrap on mobile.

No desktop layout changes. No other components affected.

