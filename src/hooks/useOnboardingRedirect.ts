/**
 * useOnboardingRedirect — checks a user's onboarding status and returns
 * the appropriate redirect path ('/dashboard' or '/onboarding').
 *
 * Extracted from Auth.tsx and AuthRedirect.tsx to eliminate duplication.
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export function useOnboardingRedirect(user: User | null, loading: boolean, skip = false) {
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (loading || skip || !user) {
      setRedirectPath(null);
      return;
    }

    const check = async () => {
      setChecking(true);
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('id', user.id)
          .single();

        setRedirectPath(profile?.onboarding_complete ? '/dashboard' : '/onboarding');
      } catch {
        setRedirectPath('/onboarding');
      } finally {
        setChecking(false);
      }
    };

    check();
  }, [user, loading, skip]);

  return { redirectPath, checking };
}
