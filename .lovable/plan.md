

## Plan: Replace Diana Demo Signal Data

### What changes
Replace the 5 existing demo signals with the new 15-signal, 6-week arc in **three locations**:

**1. `src/contexts/AppContext.tsx`** — Update `DEMO_SIGNALS_DATA` array (lines 75–105)
- Replace the 5 entries with the 15 new signals
- This array is used by `resetToDemo()` to re-insert Diana's data

**2. `supabase/functions/seed-demo-user/index.ts`** — Update `demoSignals` array (lines 59–95)
- Replace the 5 entries with the 15 new signals
- This is the edge function that seeds/resets Diana's account

**3. `src/pages/Onboarding.tsx`** — Update the pre-filled signal text (line 50)
- Change from the old first signal text to: `"CPO referenced my roadmap framing by name in the all-hands recap. I didn't know she was going to do that."`
- This is what appears in the onboarding flow when "Skip to demo" is used

### Note on demo-15
The last signal in the provided data is missing `tag` and `flagged` fields. I'll set `tag: 'Personal Milestone'` and `flagged: true` to fit the narrative arc of Diana reflecting on her journey before the promotion conversation.

### No other changes
Field names, structure, RLS policies, and all other behavior remain identical.

