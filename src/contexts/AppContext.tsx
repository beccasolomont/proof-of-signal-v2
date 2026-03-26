/**
 * AppContext — global application state provider.
 *
 * All data is persisted to the database via Supabase.
 * Demo mode is determined by whether the authenticated user's email matches DEMO_EMAIL.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DEMO_EMAIL } from '@/lib/constants';
import { getCustomTags as loadCustomTags, setCustomTags as saveCustomTags, clearCustomTags } from '@/lib/storage';
import type { User } from '@supabase/supabase-js';

/** Categories that can be assigned to flagged signals for review. */
export const FLAG_CATEGORIES = ['Promotion evidence', 'Performance review', 'Difficult conversation', 'Watch closely', 'Growth area'] as const;
export type FlagCategory = typeof FLAG_CATEGORIES[number];

/** Deterministic tag → flag-category mapping used when a signal is first flagged. */
export const TAG_TO_FLAG_CATEGORY: Record<string, FlagCategory> = {
  'Recognition': 'Promotion evidence',
  'Missed Credit': 'Watch closely',
  'Personal Milestone': 'Promotion evidence',
  'Manager Signal': 'Watch closely',
  'Org / Political Signal': 'Difficult conversation',
  'Constructive Feedback': 'Growth area',
};

/** A single career signal logged by the user. */
export interface Signal {
  id: string;
  text: string;
  date: string;
  tag: string;
  flagged: boolean;
  flagCategory?: FlagCategory;
  context?: {
    meeting?: string;
    attendees?: string;
  };
}

/** Stored user profile data. */
export interface UserProfile {
  firstName: string;
  careerStage: string;
  goals: string[];
  onboardingComplete: boolean;
  avatarUrl: string;
}

interface AppState {
  user: UserProfile;
  signals: Signal[];
  customTags: string[];
  isDemo: boolean;
  isDemoUser: boolean;
  loading: boolean;
  setUser: (user: Partial<UserProfile>) => void;
  addSignal: (signal: Omit<Signal, 'id'>) => void;
  updateSignal: (id: string, updates: Partial<Signal>) => void;
  deleteSignal: (id: string) => void;
  toggleFlag: (id: string) => void;
  reclassifyFlaggedSignals: () => Promise<void>;
  addCustomTag: (tag: string) => void;
  removeCustomTag: (tag: string) => void;
  resetToDemo: () => Promise<void>;
  resetToClean: () => Promise<void>;
  loadUserData: (authUser: User) => Promise<void>;
}

const defaultUser: UserProfile = {
  firstName: '',
  careerStage: '',
  goals: [],
  onboardingComplete: false,
  avatarUrl: '',
};

/** Demo signal data used for seeding and resetting. */
const DEMO_SIGNALS_DATA = [
  { text: "CPO referenced my roadmap framing by name in the all-hands recap. I didn't know she was going to do that.", date: '2026-02-03', tag: 'Recognition', flagged: true },
  { text: 'Ran the Q1 planning kickoff for the first time without a co-lead. It went long but the room stayed with it.', date: '2026-02-06', tag: 'Personal Milestone', flagged: true },
  { text: "My framework for prioritizing the discovery backlog got picked up in the eng sync — presented as the team's approach, not mine specifically. Not sure how to feel about that.", date: '2026-02-11', tag: 'Missed Credit', flagged: true },
  { text: "1:1 with my manager felt different today. He was distracted, moved through the agenda fast, didn't ask follow-up questions. Not sure if it's me or something else going on.", date: '2026-02-18', tag: 'Manager Signal', flagged: false },
  { text: "Got pulled into an exec design review I'm not usually in. Nobody explained why. Just got the calendar invite.", date: '2026-02-20', tag: 'Org / Political Signal', flagged: false },
  { text: "Peer asked me to review their roadmap before they took it to leadership. First time someone's done that.", date: '2026-02-24', tag: 'Recognition', flagged: false },
  { text: 'Told in my review feedback to "work on executive presence." No examples. No definition of what that means at my level. Just the phrase.', date: '2026-02-27', tag: 'Constructive Feedback', flagged: true },
  { text: 'Led my first cross-functional roadmap review with design, eng, and data all in the room. It ran over but nobody left.', date: '2026-03-04', tag: 'Personal Milestone', flagged: true },
  { text: "My idea about restructuring the discovery sprint cadence got brought up in the PM sync by someone else. No attribution. Not sure if I'm reading into it.", date: '2026-03-07', tag: 'Missed Credit', flagged: true },
  { text: 'Manager asked me to present the Q2 priorities directly to the VP instead of him doing it. He said "you know this better than I do."', date: '2026-03-10', tag: 'Recognition', flagged: true },
  { text: 'Reorg rumors. Two people on adjacent teams have been told their roles are "under review." Nobody has said anything to me directly.', date: '2026-03-13', tag: 'Org / Political Signal', flagged: false },
  { text: 'VP of Design said my framing of the Q2 priorities was "unusually clear for this stage of planning." Saved the email.', date: '2026-03-18', tag: 'Recognition', flagged: true },
  { text: 'Stakeholder review went well. CPO mentioned the roadmap framing by name in the all-hands recap afterward.', date: '2026-03-19', tag: 'Recognition', flagged: true },
  { text: '1:1 with my manager was shorter than usual again. He moved through the agenda fast and rescheduled our next two.', date: '2026-03-20', tag: 'Manager Signal', flagged: false },
  { text: 'Promotion conversation with my manager is in two weeks. I have 6 weeks of signals. The pattern is clearer than I expected.', date: '2026-03-22', tag: 'Personal Milestone', flagged: true },
];

const AppContext = createContext<AppState | undefined>(undefined);

/** Convert a Supabase signal row to our Signal interface. */
function rowToSignal(row: {
  id: string;
  text: string;
  date: string;
  tag: string;
  flagged: boolean;
  flag_category?: string | null;
  meeting?: string | null;
  attendees?: string | null;
}): Signal {
  return {
    id: row.id,
    text: row.text,
    date: row.date,
    tag: row.tag,
    flagged: row.flagged,
    flagCategory: (row.flag_category as FlagCategory) || undefined,
    context: (row.meeting || row.attendees)
      ? { meeting: row.meeting || undefined, attendees: row.attendees || undefined }
      : undefined,
  };
}

/** Provides global app state (user + signals) to the component tree. */
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<UserProfile>(defaultUser);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [customTags, setCustomTags] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('customSignalTags') || '[]'); } catch { return []; }
  });
  const [loading, setLoading] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);

  const isDemoUser = authUser?.email === DEMO_EMAIL;
  // Keep isDemo for backward compat — same as isDemoUser
  const isDemo = isDemoUser;

  /** Load profile + signals from Supabase for the authenticated user. */
  const loadUserData = useCallback(async (au: User) => {
    setAuthUser(au);
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', au.id)
        .single();

      if (profile) {
        setUserState({
          firstName: profile.first_name,
          careerStage: profile.career_stage,
          goals: profile.goals || [],
          onboardingComplete: profile.onboarding_complete,
          avatarUrl: (profile as any).avatar_url || '',
        });
      }

      const { data: sigs } = await supabase
        .from('signals')
        .select('*')
        .eq('user_id', au.id)
        .order('created_at', { ascending: false });

      setSignals(sigs ? sigs.map(rowToSignal) : []);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setTimeout(() => loadUserData(session.user), 0);
      } else {
        setAuthUser(null);
        setUserState(defaultUser);
        setSignals([]);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setUser = async (updates: Partial<UserProfile>) => {
    const newUser = { ...user, ...updates };
    setUserState(newUser);

    if (authUser) {
      await supabase.from('profiles').update({
        first_name: newUser.firstName,
        career_stage: newUser.careerStage,
        goals: newUser.goals,
        onboarding_complete: newUser.onboardingComplete,
        avatar_url: newUser.avatarUrl,
      } as any).eq('id', authUser.id);
    }
  };

  const addSignal = async (signal: Omit<Signal, 'id'>) => {
    if (authUser) {
      const { data, error } = await supabase.from('signals').insert({
        user_id: authUser.id,
        text: signal.text,
        date: signal.date,
        tag: signal.tag,
        flagged: signal.flagged,
        flag_category: signal.flagCategory || null,
        meeting: signal.context?.meeting || null,
        attendees: signal.context?.attendees || null,
      }).select().single();

      if (data && !error) {
        setSignals(prev => [rowToSignal(data), ...prev]);
      }
    } else {
      const newSignal: Signal = { ...signal, id: crypto.randomUUID() };
      setSignals(prev => [newSignal, ...prev]);
    }
  };

  const updateSignal = async (id: string, updates: Partial<Signal>) => {
    setSignals(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));

    if (authUser) {
      const dbUpdates: Record<string, string | boolean | null> = {};
      if (updates.text !== undefined) dbUpdates.text = updates.text;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.tag !== undefined) dbUpdates.tag = updates.tag;
      if (updates.flagged !== undefined) dbUpdates.flagged = updates.flagged;
      if (updates.flagCategory !== undefined) dbUpdates.flag_category = updates.flagCategory;
      if (updates.context !== undefined) {
        dbUpdates.meeting = updates.context.meeting || null;
        dbUpdates.attendees = updates.context.attendees || null;
      }
      await supabase.from('signals').update(dbUpdates).eq('id', id);
    }
  };

  /** Ask AI for a flag category suggestion; falls back to deterministic mapping. */
  const suggestFlagCategory = useCallback(async (text: string, tag: string): Promise<FlagCategory> => {
    try {
      const { data, error } = await supabase.functions.invoke('suggest-flag-category', {
        body: { text, tag },
      });
      if (!error && data?.category && FLAG_CATEGORIES.includes(data.category)) {
        return data.category as FlagCategory;
      }
    } catch {
      // fall through to deterministic
    }
    return TAG_TO_FLAG_CATEGORY[tag] || 'Watch closely';
  }, []);

  const toggleFlag = async (id: string) => {
    const signal = signals.find(s => s.id === id);
    if (!signal) return;
    const newFlagged = !signal.flagged;
    const updates: Partial<Signal> = { flagged: newFlagged };

    // Optimistic: set a temporary category, then replace with AI suggestion
    if (newFlagged && !signal.flagCategory) {
      const fallback = TAG_TO_FLAG_CATEGORY[signal.tag] || 'Watch closely';
      updates.flagCategory = fallback;
    }

    setSignals(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));

    if (authUser) {
      const dbUpdates: Record<string, string | boolean> = { flagged: newFlagged };
      if (updates.flagCategory) dbUpdates.flag_category = updates.flagCategory;
      await supabase.from('signals').update(dbUpdates).eq('id', id);
    }

    // Fire AI suggestion in background and update if different
    if (newFlagged) {
      suggestFlagCategory(signal.text, signal.tag).then(async (aiCategory) => {
        setSignals(prev => prev.map(s => s.id === id ? { ...s, flagCategory: aiCategory } : s));
        if (authUser) {
          await supabase.from('signals').update({ flag_category: aiCategory }).eq('id', id);
        }
      });
    }
  };

  const deleteSignal = async (id: string) => {
    setSignals(prev => prev.filter(s => s.id !== id));

    if (authUser) {
      await supabase.from('signals').delete().eq('id', id);
    }
  };

  const addCustomTag = (tag: string) => {
    setCustomTags(prev => {
      if (prev.includes(tag)) return prev;
      const updated = [...prev, tag];
      localStorage.setItem('customSignalTags', JSON.stringify(updated));
      return updated;
    });
  };

  const removeCustomTag = (tag: string) => {
    setCustomTags(prev => {
      const updated = prev.filter(t => t !== tag);
      localStorage.setItem('customSignalTags', JSON.stringify(updated));
      return updated;
    });
  };

  /** Reset Diana's demo account to original seed data. */
  const resetToDemo = async () => {
    if (!authUser || !isDemoUser) return;

    // Delete all signals
    await supabase.from('signals').delete().eq('user_id', authUser.id);

    // Reset profile
    await supabase.from('profiles').update({
      first_name: 'Diana',
      career_stage: 'Senior PM',
      goals: ['Getting promoted', 'Building executive presence'],
      onboarding_complete: true,
    }).eq('id', authUser.id);

    // Re-insert demo signals
    const inserts = DEMO_SIGNALS_DATA.map(s => ({
      user_id: authUser.id,
      text: s.text,
      date: s.date,
      tag: s.tag,
      flagged: s.flagged,
    }));
    await supabase.from('signals').insert(inserts);

    // Reload
    await loadUserData(authUser);
  };

  /** Wipe all data and return to a fresh state. */
  const resetToClean = async () => {
    if (authUser) {
      await supabase.from('signals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('profiles').update({
        first_name: '',
        career_stage: '',
        goals: [],
        onboarding_complete: false,
      }).eq('id', authUser.id);
    }
    setUserState(defaultUser);
    setSignals([]);
    setCustomTags([]);
    localStorage.removeItem('customSignalTags');
  };

  /** Re-run AI flag category classification on all flagged signals. */
  const reclassifyFlaggedSignals = useCallback(async () => {
    const flagged = signals.filter(s => s.flagged);
    const results = await Promise.allSettled(
      flagged.map(async (s) => {
        const category = await suggestFlagCategory(s.text, s.tag);
        return { id: s.id, category };
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { id, category } = result.value;
        setSignals(prev => prev.map(s => s.id === id ? { ...s, flagCategory: category } : s));
        if (authUser) {
          await supabase.from('signals').update({ flag_category: category }).eq('id', id);
        }
      }
    }
  }, [signals, suggestFlagCategory, authUser]);

  return (
    <AppContext.Provider value={{
      user, signals, customTags, isDemo, isDemoUser, loading,
      setUser, addSignal, updateSignal, deleteSignal, toggleFlag,
      reclassifyFlaggedSignals,
      addCustomTag, removeCustomTag,
      resetToDemo, resetToClean, loadUserData,
    }}>
      {children}
    </AppContext.Provider>
  );
};

/** Access the global app state. Must be used inside <AppProvider>. */
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
