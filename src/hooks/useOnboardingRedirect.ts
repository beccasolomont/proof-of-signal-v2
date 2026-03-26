/**
 * useOnboardingRedirect — checks a user's onboarding status and returns
 * the appropriate redirect path ('/dashboard' or '/onboarding').
 *
 * Supports a sessionStorage flag 'demo_force_onboarding' that forces
 * redirection to /onboarding regardless of profile status (used by "Skip to demo").
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
        // Check for demo force-onboarding flag
        const forceOnboarding = sessionStorage.getItem('demo_force_onboarding');
        if (forceOnboarding === 'true') {
          sessionStorage.removeItem('demo_force_onboarding');
          setRedirectPath('/onboarding');
          return;
        }

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
