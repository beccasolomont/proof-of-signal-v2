/**
 * AuthRedirect — handles magic link / OAuth returns on the root route.
 * If authenticated, checks onboarding status via AppContext and redirects accordingly.
 * Otherwise renders children (landing page).
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';
import { DEMO_FORCE_ONBOARDING_KEY } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user: authUser, loading: authLoading } = useAuth();
  const { user: profile, loading: profileLoading } = useApp();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authUser) {
    return <>{children}</>;
  }

  // Check for demo force-onboarding flag
  const forceOnboarding = sessionStorage.getItem(DEMO_FORCE_ONBOARDING_KEY);
  if (forceOnboarding === 'true') {
    sessionStorage.removeItem(DEMO_FORCE_ONBOARDING_KEY);
    return <Navigate to="/onboarding" replace />;
  }

  return <Navigate to={profile.onboardingComplete ? '/dashboard' : '/onboarding'} replace />;
};

export default AuthRedirect;
