/**
 * Auth — dual-mode page supporting Create Account (signup) and Sign In (login).
 * Supports Google OAuth, magic link, and email/password authentication.
 * Redirects authenticated users based on onboarding status.
 */
import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AuthMode = 'signup' | 'login';
type AuthMethod = 'password' | 'magic-link';

const Auth = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState<AuthMode>(
    searchParams.get('mode') === 'login' ? 'login' : 'signup'
  );
  const [method, setMethod] = useState<AuthMethod>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { user: profile, loading: profileLoading } = useApp();

  // Check for demo force-onboarding flag
  const forceOnboarding = sessionStorage.getItem('demo_force_onboarding');
  const redirectPath = (!loading && !profileLoading && user)
    ? (forceOnboarding === 'true'
      ? (() => { sessionStorage.removeItem('demo_force_onboarding'); return '/onboarding'; })()
      : (profile.onboardingComplete ? '/dashboard' : '/onboarding'))
    : null;

  // Notify returning users who landed on signup
  if (redirectPath === '/dashboard' && mode === 'signup') {
    toast({
      title: 'Welcome back!',
      description: "Looks like you already have an account — we've signed you in.",
    });
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast({ variant: 'destructive', title: 'Sign-in failed', description: String(result.error) });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Sign-in failed', description: 'Something went wrong.' });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailPassword = async () => {
    if (!email.trim() || !password.trim()) return;
    setSending(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) {
          toast({ variant: 'destructive', title: 'Signup failed', description: error.message });
        } else {
          toast({ title: 'Check your email', description: 'We sent you a confirmation link.' });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast({ variant: 'destructive', title: 'Sign-in failed', description: error.message });
        }
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Something went wrong.' });
    } finally {
      setSending(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      } else {
        setSent(true);
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to send magic link.' });
    } finally {
      setSending(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isSignup = mode === 'signup';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <div className="text-center">
          <p className="text-sm font-bold tracking-[0.25em] uppercase text-accent mb-3">Proof of Signal</p>
          <h1 className="text-3xl font-serif text-primary mb-2">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isSignup
              ? 'Start building your signal record.'
              : 'Sign in to access your signal record.'}
          </p>
        </div>

        {/* Google OAuth */}
        <Button
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full py-6 rounded-xl text-base border-border hover:border-accent/40"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          Continue with Google
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Method toggle */}
        <div className="flex justify-center gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setMethod('password')}
            className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
              method === 'password' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setMethod('magic-link')}
            className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
              method === 'magic-link' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Magic link
          </button>
        </div>

        {/* Magic Link — sent state */}
        {method === 'magic-link' && sent ? (
          <div className="text-center py-4 animate-fade-in">
            <Mail className="w-8 h-8 text-accent mx-auto mb-3" />
            <p className="font-serif text-primary text-lg mb-1">Check your email</p>
            <p className="text-sm text-muted-foreground">
              We sent a sign-in link to <span className="font-medium text-foreground">{email}</span>
            </p>
            <Button variant="ghost" onClick={() => setSent(false)} className="mt-4 text-xs text-muted-foreground">
              Try a different email
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="rounded-xl py-6"
              onKeyDown={e => e.key === 'Enter' && (method === 'password' ? handleEmailPassword() : handleMagicLink())}
            />
            {method === 'password' && (
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="rounded-xl py-6 pr-10"
                  onKeyDown={e => e.key === 'Enter' && handleEmailPassword()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}
            <Button
              onClick={method === 'password' ? handleEmailPassword : handleMagicLink}
              disabled={!email.trim() || (method === 'password' && !password.trim()) || sending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-xl text-base"
            >
              {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {method === 'password'
                ? (isSignup ? 'Create account' : 'Sign in')
                : 'Send magic link'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Mode toggle footer */}
        <p className="text-center text-sm text-muted-foreground">
          {isSignup ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-accent hover:underline font-medium"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              New here?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-accent hover:underline font-medium"
              >
                Create an account
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Auth;
