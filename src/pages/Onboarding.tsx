/**
 * Onboarding — 5-step narrative flow for new users.
 *
 * Steps: Welcome → Name & Career Stage → Goals (max 2) → Signal Example → First Signal.
 * Profile data is only committed to storage on final signal submission.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { classifySignal } from '@/lib/signalTagger';
import { MAX_SIGNAL_LENGTH } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useVoiceInput } from '@/hooks/use-voice-input';
import { useToast } from '@/hooks/use-toast';
import VoiceInputButton from '@/components/VoiceInputButton';
import CareerStageSelector from '@/components/CareerStageSelector';
import GoalSelector from '@/components/GoalSelector';
import HeroIllustration from '@/components/illustrations/HeroIllustration';

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const { user, setUser, addSignal } = useApp();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [careerStage, setCareerStage] = useState(user.careerStage);
  const [goals, setGoals] = useState<string[]>([]);
  const [signalText, setSignalText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [assignedTag, setAssignedTag] = useState('');
  const [swappedIn, setSwappedIn] = useState<string | null>(null);
  const [swappedOut, setSwappedOut] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);

  const { supported: voiceSupported, listening, toggle: toggleVoice } = useVoiceInput((transcript) => {
    setSignalText(prev => prev ? `${prev} ${transcript}`.slice(0, MAX_SIGNAL_LENGTH) : transcript.slice(0, MAX_SIGNAL_LENGTH));
  });

  const next = () => setStep(s => s + 1);
  const prev = () => setStep(s => s - 1);

  const { toast } = useToast();

  /** Toggle a goal; if 2 already selected, replace the least-recently-selected one. */
  const toggleGoal = (g: string) => {
    setGoals(prev => {
      if (prev.includes(g)) return prev.filter(x => x !== g);
      if (prev.length < 2) return [...prev, g];
      // Replace least-recently-selected (first in array)
      const replaced = prev[0];
      const next = [prev[1], g];
      setSwappedOut(replaced);
      setSwappedIn(g);
      setTimeout(() => { setSwappedIn(null); setSwappedOut(null); }, 300);
      toast({
        description: `Replaced "${replaced}" — undo`,
        action: (
          <Button
            variant="ghost"
            size="sm"
            className="text-navy hover:text-navy-light"
            onClick={() => setGoals([replaced, g])}
          >
            Undo
          </Button>
        ),
      });
      return next;
    });
  };

  /** Submit the first signal and finalise the onboarding profile. */
  const submitSignal = async () => {
    setIsClassifying(true);
    try {
      const tag = await classifySignal(signalText);
      setAssignedTag(tag);
      addSignal({ text: signalText, date: new Date().toISOString().split('T')[0], tag, flagged: false });
      setUser({ firstName, careerStage, goals, onboardingComplete: true });
      setSubmitted(true);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to classify signal. Please try again.' });
    } finally {
      setIsClassifying(false);
    }
  };

  const getGoalExtraClassName = (g: string) =>
    `${swappedIn === g ? 'animate-goal-swap-in' : ''} ${swappedOut === g ? 'animate-goal-shake' : ''}`;

  const canProceed = [
    true, // welcome
    firstName.trim() && careerStage, // name + career
    goals.length > 0, // goals
    true, // example (read only)
    signalText.trim().length > 0, // first signal
  ];

  const steps = [
    // OB-01: Welcome
    <div key="welcome" className="flex flex-col items-center text-center animate-fade-in">
      <div className="w-40 h-28 mb-8">
        <HeroIllustration />
      </div>
      <h1 className="text-3xl md:text-4xl font-serif text-navy mb-4">Proof of Signal</h1>
      <p className="text-lg text-muted-foreground mb-10">Your career, on record.</p>
      <Button onClick={next} className="bg-navy hover:bg-navy-light text-primary-foreground px-8 py-6 text-base rounded-xl">
        Get started <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </div>,

    // OB-02: Name & Career Stage
    <div key="name" className="max-w-md w-full animate-fade-in">
      <h2 className="text-2xl font-serif text-navy mb-2">Let's start with you</h2>
      <p className="text-sm text-muted-foreground mb-8">
        This helps us surface what's most relevant to you. You can change it anytime.
      </p>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">First name</label>
          <Input
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="Your first name"
            className="rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Where are you in your career?</label>
          <CareerStageSelector value={careerStage} onChange={setCareerStage} />
        </div>
      </div>
    </div>,

    // OB-03: Goals
    <div key="goals" className="max-w-md w-full animate-fade-in">
      <h2 className="text-2xl font-serif text-navy mb-2">What's most on your mind?</h2>
      <p className="text-sm text-muted-foreground mb-8">
        Pick up to 2 goals. We'll go from there.
      </p>
      <GoalSelector selected={goals} onToggle={toggleGoal} getExtraClassName={getGoalExtraClassName} />
    </div>,

    // OB-04: Signal Example
    <div key="example" className="max-w-md w-full animate-fade-in">
      <h2 className="text-2xl font-serif text-navy mb-2">This is what a signal looks like</h2>
      <p className="text-sm text-muted-foreground mb-8">
        Signals are moments worth remembering. Here's a real one:
      </p>
      {/* Illustration */}
      <div className="flex justify-center mb-6">
        <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-navy">
          <rect x="30" y="10" width="60" height="55" rx="4" fill="hsl(var(--rose-soft))" stroke="currentColor" strokeWidth="1.5" />
          <line x1="40" y1="25" x2="80" y2="25" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <line x1="40" y1="33" x2="75" y2="33" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <line x1="40" y1="41" x2="70" y2="41" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <line x1="40" y1="49" x2="65" y2="49" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <rect x="85" y="5" width="4" height="30" rx="1" fill="currentColor" transform="rotate(15 87 20)" opacity="0.7" />
          <polygon points="84,35 88,35 86,42" fill="currentColor" transform="rotate(15 86 38)" opacity="0.7" />
          <circle cx="22" cy="20" r="2" fill="currentColor" opacity="0.3" />
          <circle cx="100" cy="50" r="1.5" fill="currentColor" opacity="0.25" />
          <circle cx="15" cy="55" r="1" fill="currentColor" opacity="0.2" />
        </svg>
      </div>
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        <p className="text-foreground leading-relaxed mb-4 italic">
          "Felt like my idea in the roadmap meeting got picked up by someone else without credit. Wasn't sure if I imagined it."
        </p>
        <Badge variant="secondary" className="bg-rose-soft text-navy border-0">
          Missed Credit
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mt-6 text-center">
        Proof of Signal reads what you write and tags it. Patterns emerge over time.
      </p>
    </div>,

    // OB-05: First Signal
    <div key="signal" className="max-w-md w-full animate-fade-in">
      {!submitted ? (
        <>
          <h2 className="text-2xl font-serif text-navy mb-2">Log your first signal</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Something worth remembering from your last meeting or interaction.
          </p>
          <div className="relative">
            <Textarea
              value={signalText}
              onChange={e => setSignalText(e.target.value.slice(0, MAX_SIGNAL_LENGTH))}
              placeholder="What happened?"
              className="rounded-xl min-h-[120px] pr-10"
            />
            {voiceSupported && (
              <VoiceInputButton listening={listening} onToggle={toggleVoice} />
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-6 text-right">{signalText.length}/{MAX_SIGNAL_LENGTH}</p>
          <Button
            onClick={submitSignal}
            disabled={!signalText.trim() || isClassifying}
            className="w-full bg-navy hover:bg-navy-light text-primary-foreground py-6 rounded-xl"
          >
            {isClassifying ? 'Classifying…' : 'Log signal'}
          </Button>
        </>
      ) : (
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-rose-soft flex items-center justify-center mx-auto mb-6">
            <span className="text-navy text-2xl font-bold">✦</span>
          </div>
          <p className="text-xl font-serif text-navy mb-2">Signal captured.</p>
          <p className="text-sm text-muted-foreground mb-8">
            We've tagged this as <Badge variant="secondary" className="bg-rose-soft text-navy border-0 inline-flex">{assignedTag}</Badge>. Log 2 more signals to start seeing patterns.
          </p>
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-navy hover:bg-navy-light text-primary-foreground py-6 rounded-xl"
          >
            Go to your dashboard <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      )}
    </div>,
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-6">
        <div className="max-w-md mx-auto flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-navy' : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        {steps[step]}
      </div>

      {/* Navigation */}
      {step > 0 && step < steps.length - 1 && (
        <div className="px-6 pb-8">
          <div className="max-w-md mx-auto flex justify-between">
            <Button variant="ghost" onClick={prev} className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            {step < 4 && (
              <Button
                onClick={next}
                disabled={!canProceed[step]}
                className="bg-navy hover:bg-navy-light text-primary-foreground rounded-xl px-6"
              >
                Continue <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}
      {step === 4 && !submitted && (
        <div className="px-6 pb-8">
          <div className="max-w-md mx-auto">
            <Button variant="ghost" onClick={prev} className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
