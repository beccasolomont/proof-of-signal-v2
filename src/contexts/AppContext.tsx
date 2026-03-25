/**
 * AppContext — global application state provider.
 *
 * Dual-mode storage:
 *  - Demo mode: in-memory only (no DB writes), Diana's preset data
 *  - Authenticated mode: reads/writes to Supabase profiles + signals tables
 */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
}

interface AppState {
  user: UserProfile;
  signals: Signal[];
  customTags: string[];
  isDemo: boolean;
  loading: boolean;
  setUser: (user: Partial<UserProfile>) => void;
  addSignal: (signal: Omit<Signal, 'id'>) => void;
  updateSignal: (id: string, updates: Partial<Signal>) => void;
  deleteSignal: (id: string) => void;
  toggleFlag: (id: string) => void;
  addCustomTag: (tag: string) => void;
  removeCustomTag: (tag: string) => void;
  resetToDemo: () => void;
  resetToClean: () => void;
  loadUserData: (authUser: User) => Promise<void>;
}

const defaultUser: UserProfile = {
  firstName: '',
  careerStage: '',
  goals: [],
  onboardingComplete: false,
};

const demoUser: UserProfile = {
  firstName: 'Diana',
  careerStage: 'Senior PM (4–10 years)',
  goals: ['Getting promoted', 'Building executive presence'],
  onboardingComplete: true,
};

const demoSignals: Signal[] = [
  {
    id: 'demo-1',
    text: 'Stakeholder review went well — CPO mentioned the roadmap framing by name in the all-hands recap. I didn\'t know she was going to reference it.',
    date: '2025-03-18',
    tag: 'Recognition',
    flagged: true,
  },
  {
    id: 'demo-2',
    text: 'Felt like my idea about the discovery sprint structure got picked up in the PM sync without attribution. Not sure if I\'m reading into it.',
    date: '2025-03-19',
    tag: 'Missed Credit',
    flagged: true,
  },
  {
    id: 'demo-3',
    text: '1:1 with my manager was shorter than usual. He moved through the agenda fast and didn\'t ask follow-up questions. Not sure what to make of it.',
    date: '2025-03-20',
    tag: 'Manager Signal',
    flagged: false,
  },
  {
    id: 'demo-4',
    text: 'Led my first cross-functional roadmap review with design + eng + data. It ran long but nobody left. That felt like something.',
    date: '2025-03-21',
    tag: 'Personal Milestone',
    flagged: true,
  },
  {
    id: 'demo-5',
    text: 'Got feedback in writing from the VP of Design that my framing of the Q2 priorities was \'unusually clear for this stage of planning.\' Saved the email.',
    date: '2025-03-22',
    tag: 'Recognition',
    flagged: true,
  },
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
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);

  /** Load profile + signals from Supabase for the authenticated user. */
  const loadUserData = useCallback(async (au: User) => {
    setAuthUser(au);
    setIsDemo(false);
    setLoading(true);
    try {
      // Load profile
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
        });
      }

      // Load signals
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
        // Use setTimeout to avoid potential Supabase deadlock
        setTimeout(() => loadUserData(session.user), 0);
      } else {
        setAuthUser(null);
        if (!isDemo) {
          setUserState(defaultUser);
          setSignals([]);
        }
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

    if (authUser && !isDemo) {
      await supabase.from('profiles').update({
        first_name: newUser.firstName,
        career_stage: newUser.careerStage,
        goals: newUser.goals,
        onboarding_complete: newUser.onboardingComplete,
      }).eq('id', authUser.id);
    }
  };

  const addSignal = async (signal: Omit<Signal, 'id'>) => {
    if (authUser && !isDemo) {
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

    if (authUser && !isDemo) {
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

  const toggleFlag = async (id: string) => {
    const signal = signals.find(s => s.id === id);
    if (!signal) return;
    const newFlagged = !signal.flagged;
    // Auto-assign category from tag mapping when flagging
    const autoCategory = newFlagged && !signal.flagCategory
      ? TAG_TO_FLAG_CATEGORY[signal.tag] || 'Watch closely'
      : undefined;
    const updates: Partial<Signal> = { flagged: newFlagged };
    if (autoCategory) updates.flagCategory = autoCategory;

    setSignals(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));

    if (authUser && !isDemo) {
      const dbUpdates: Record<string, string | boolean> = { flagged: newFlagged };
      if (autoCategory) dbUpdates.flag_category = autoCategory;
      await supabase.from('signals').update(dbUpdates).eq('id', id);
    }
  };

  const deleteSignal = async (id: string) => {
    setSignals(prev => prev.filter(s => s.id !== id));

    if (authUser && !isDemo) {
      await supabase.from('signals').delete().eq('id', id);
    }
  };

  /** Load the built-in Diana demo dataset (in-memory only). */
  const resetToDemo = () => {
    setIsDemo(true);
    setUserState(demoUser);
    setSignals(demoSignals);
  };

  /** Wipe all data and return to a fresh state. */
  const resetToClean = async () => {
    if (authUser && !isDemo) {
      await supabase.from('signals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('profiles').update({
        first_name: '',
        career_stage: '',
        goals: [],
        onboarding_complete: false,
      }).eq('id', authUser.id);
    }
    setIsDemo(false);
    setUserState(defaultUser);
    setSignals([]);
  };

  return (
    <AppContext.Provider value={{
      user, signals, isDemo, loading,
      setUser, addSignal, updateSignal, deleteSignal, toggleFlag,
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
