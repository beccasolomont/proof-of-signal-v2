

## Revised Plan: Email/Password Auth + Demo Account for Judges

### Overview
Add email/password authentication alongside existing Google OAuth and magic link. Create a pre-seeded Diana demo account. "Skip to demo" signs in with demo credentials and always navigates to the pre-filled onboarding flow (even if Diana's profile has `onboarding_complete = true`).

### Changes

**1. Add `DEMO_EMAIL` and `DEMO_PASSWORD` constants**
- File: `src/lib/constants.ts`
- Add `DEMO_EMAIL = 'diana@demo.proofofsignal.com'` and `DEMO_PASSWORD = 'DemoPass123!'`

**2. Add email/password fields to Auth page**
- File: `src/pages/Auth.tsx`
- Add a password `Input` below the email field
- Signup: `supabase.auth.signUp({ email, password })`
- Login: `supabase.auth.signInWithPassword({ email, password })`
- Keep Google OAuth and magic link as alternatives

**3. Create seed edge function for demo user**
- File: `supabase/functions/seed-demo-user/index.ts`
- Uses service role key to call `supabase.auth.admin.createUser()` with Diana's email, password, and `email_confirm: true`
- Inserts/updates Diana's profile (first_name, career_stage, goals, onboarding_complete = true)
- Inserts the 5 demo signals
- Idempotent — safe to run multiple times
- Run once to seed, then can be removed

**4. Update "Skip to demo" button (Index.tsx)**
- Call `supabase.auth.signInWithPassword()` with `DEMO_EMAIL` / `DEMO_PASSWORD`
- On success, navigate to `/onboarding` (not `/dashboard`) — always show the pre-filled onboarding flow
- Store a sessionStorage flag `demo_force_onboarding = true` so the redirect logic knows to go to onboarding

**5. Create onboarding exception for demo user**
- File: `src/hooks/useOnboardingRedirect.ts`
- After sign-in, if `sessionStorage.getItem('demo_force_onboarding')` is set, return `/onboarding` regardless of `onboarding_complete` status, then clear the flag
- This means: "Skip to demo" → always onboarding; Diana signing in normally via Auth page → goes to dashboard if onboarding is complete

**6. Pre-fill onboarding for demo user**
- File: `src/pages/Onboarding.tsx`
- When signed-in user email matches `DEMO_EMAIL`, pre-fill fields with Diana's data (name, career stage, goals, first signal text)
- User can still walk through and modify steps

**7. Remove in-memory demo mode from AppContext**
- File: `src/contexts/AppContext.tsx`
- Remove `isDemo`, `demoUser`, `demoSignals`, `resetToDemo` state and logic
- Add computed `isDemoUser` check: compare auth user email to `DEMO_EMAIL`
- Expose `isDemoUser` via context

**8. Update ProtectedRoute**
- File: `src/components/ProtectedRoute.tsx`
- Remove `isDemo` bypass — Diana is a real authenticated user

**9. Update AuthRedirect**
- File: `src/components/AuthRedirect.tsx`
- Remove `isDemo` reference

**10. Update Profile page**
- File: `src/pages/Profile.tsx`
- Show "Reset to Diana's demo data" only when `isDemoUser` is true
- Reset action: delete all Diana's signals, re-insert the 5 originals, reset profile fields

**11. Update Dashboard**
- File: `src/pages/Dashboard.tsx`
- Remove any `isDemo` conditional logic

**12. Database migration**
- Insert Diana's 5 demo signals (will run after seed function creates the auth user)

### Security
- No unauthenticated endpoints — demo uses standard `signInWithPassword`
- Demo credentials are intentionally public (shared with judges)
- Standard RLS applies to demo user like any other user
- No service role key exposed to clients

### For Judges
Share credentials: `diana@demo.proofofsignal.com` / `DemoPass123!` — or click "Skip to demo" on the landing page.

