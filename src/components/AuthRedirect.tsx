/**
 * AuthRedirect — handles magic link returns on the root route.
 * If authenticated, checks onboarding status and redirects accordingly.
 * Otherwise renders children (landing page).
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingRedirect } from '@/hooks/useOnboardingRedirect';
import { Loader2 } from 'lucide-react';

const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { redirectPath, checking } = useOnboardingRedirect(user, loading);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default AuthRedirect;
