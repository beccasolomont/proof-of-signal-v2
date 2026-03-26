/**
 * Shared application constants used across onboarding, profile, dashboard, and patterns pages.
 * Centralises user-facing strings that appear in multiple locations.
 */

/* ── Numeric limits ── */

/** Maximum character length for a signal's text body. */
export const MAX_SIGNAL_LENGTH = 500;

/** Maximum number of goals a user can select. */
export const MAX_GOALS = 2;

/** Minimum signals required before pattern insights unlock. */
export const MIN_SIGNALS_FOR_INSIGHT = 3;

/** Duration (ms) to show the "signal captured" confirmation before resetting. */
export const CONFIRMATION_TIMEOUT_MS = 2000;

/** Validation message shown when a user picks a future date. */
export const FUTURE_DATE_ERROR = 'Signals can only be logged for today or earlier.';

/** Returns true if the given YYYY-MM-DD string is strictly after today. */
export const isFutureDate = (dateStr: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(dateStr + 'T00:00:00');
  return selected > today;
};

/** Demo user first-name used to branch insight copy. */
export const DEMO_USER_NAME = 'Diana';

/** Demo account credentials (intentionally public — shared with judges). */
export const DEMO_EMAIL = 'diana@demo.proofofsignal.com';
export const DEMO_PASSWORD = 'DemoPass123!';

/** SessionStorage key used to force onboarding for demo users. */
export const DEMO_FORCE_ONBOARDING_KEY = 'demo_force_onboarding';

/** Default flag category assigned when no AI suggestion is available. */
export const DEFAULT_FLAG_CATEGORY = 'Watch closely';

/** Career stage options shown during onboarding and on the profile editor. */
export const CAREER_STAGES = [
  'Aspiring PM',
  'Associate / Junior PM',
  'Product Manager',
  'Senior PM',
  'Group PM / Director',
  'VP of Product / CPO',
] as const;

/** Growth-goal options (max 2 selectable). */
export const GOALS = [
  'Getting promoted',
  'Building executive presence',
  'Navigating stakeholder dynamics',
  'Transitioning into product',
  'Getting better at strategy',
  'Documenting my impact',
] as const;

/**
 * Contextual insight copy keyed by dominant signal tag.
 * Shown on the Dashboard insight card and the Patterns page.
 */
export const THEME_INSIGHTS: Record<string, string> = {
  'Recognition':
    "You're being seen at the right levels. The question now is whether your manager is connecting these moments to your readiness for the next step.",
  'Missed Credit':
    "A pattern worth watching: your contributions are landing, but the attribution isn't always following. That gap is worth naming — especially before a performance conversation.",
  'Manager Signal':
    "Your signals suggest a shift in your manager dynamic. Whether it's positive or concerning, it's worth paying attention to before your next 1:1.",
  'Constructive Feedback':
    "You're getting input. The question is whether you're capturing it in a way that shows growth over time — not just in the moment.",
  'Personal Milestone':
    "You're stepping up. Make sure these moments are on record — they're the evidence your promotion conversation needs.",
  'Org / Political Signal':
    "You're picking up on organizational dynamics early. That awareness is an asset — especially if you're navigating a shift in team or leadership.",
};

/**
 * Definitions for each signal tag, displayed in modals on the Patterns page.
 */
export const TAG_DEFINITIONS: Record<string, string> = {
  'Recognition':
    'Your contribution was acknowledged publicly or privately — a shoutout in a meeting, positive feedback from a stakeholder, or a peer crediting your work.',
  'Missed Credit':
    "Your idea, work, or contribution was attributed to someone else, or went unacknowledged entirely. Can be subtle — worth noting even when you're not sure.",
  'Constructive Feedback':
    'Input you received about an area to develop or improve. Includes formal feedback, informal coaching, or repeated observations from others.',
  'Manager Signal':
    "A shift in your manager's behavior, tone, or attention toward you — shorter 1:1s, change in communication style, new visibility or reduced access.",
  'Org / Political Signal':
    'An organizational dynamic worth tracking — restructuring, budget signals, stakeholder shifts, or changes in team direction that affect your position.',
  'Personal Milestone':
    'A meaningful moment in your own career progression — first time leading something, a stretch assignment, a door that opened.',
};

/**
 * Per-category badge colors using CSS variable names from index.css.
 * Returns Tailwind-compatible inline style objects for bg + text.
 */
export const TAG_COLORS: Record<string, string> = {
  'Recognition': 'bg-[hsl(var(--tag-recognition))]',
  'Missed Credit': 'bg-[hsl(var(--tag-missed-credit))]',
  'Constructive Feedback': 'bg-[hsl(var(--tag-constructive-feedback))]',
  'Manager Signal': 'bg-[hsl(var(--tag-manager-signal))]',
  'Org / Political Signal': 'bg-[hsl(var(--tag-org-political))]',
  'Personal Milestone': 'bg-[hsl(var(--tag-personal-milestone))]',
};

/** Returns the tag-specific bg class, falling back to rose-soft. */
export const getTagColorClass = (tag: string): string =>
  TAG_COLORS[tag] || 'bg-rose-soft';

/** Demo-mode Diana insight copy, shared by Dashboard and Patterns. */
export const DEMO_INSIGHT_TITLE = 'Your signals from this week';
export const DEMO_INSIGHT_BODY =
  "A pattern is emerging: you're generating recognition at the senior level (CPO, VP Design) at the same time you're noticing credit gaps at the peer level. That's worth paying attention to — especially before a promotion conversation.";
export const DEMO_INSIGHT_ACTION =
  "Suggested next action: Flag your top 3 recognition signals and bring them to your next 1:1. The question isn't whether you've done the work — it's whether your manager has seen it.";

/** Checklist item shape used by PatternInsightCard and PatternChecklist. */
export interface ChecklistItem {
  text: string;
  priority: 'high' | 'medium' | 'low';
}
