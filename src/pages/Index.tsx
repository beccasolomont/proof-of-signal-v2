/**
 * Index — marketing landing page.
 * Presents the product value proposition, feature overview, social proof, and CTA.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_FORCE_ONBOARDING_KEY } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import HeroIllustration from '@/components/illustrations/HeroIllustration';
import FeatureIcon from '@/components/illustrations/FeatureIcons';
import AvatarSilhouettes from '@/components/illustrations/AvatarSilhouettes';
import SignalWavePattern from '@/components/illustrations/SignalWavePattern';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';

const features = [
  {
    type: 'capture' as const,
    title: 'Capture what matters',
    description: 'Log moments from meetings, decisions, and interactions — the ones that shape your trajectory but rarely make it into a performance review.',
  },
  {
    type: 'patterns' as const,
    title: 'See patterns emerge',
    description: 'Over time, your signals reveal themes: where you lead, where you get overlooked, and where your influence is growing.',
  },
  {
    type: 'growth' as const,
    title: 'Own your narrative',
    description: 'Walk into reviews, 1:1s, and negotiations with a record — not a feeling. Your career story, backed by evidence.',
  },
];

const testimonials = [
  {
    quote: "I used to walk into reviews with nothing but vibes. Now I have a record that speaks for me.",
    name: "Diana K.",
    role: "Senior PM",
  },
  {
    quote: "It took three signals before I saw the pattern — my ideas kept getting credited to someone else.",
    name: "Sarah A.",
    role: "Product Lead",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSkipToDemo = async () => {
    setDemoLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });
      if (error) {
        toast({ variant: 'destructive', title: 'Demo unavailable', description: error.message });
      } else {
        sessionStorage.setItem(DEMO_FORCE_ONBOARDING_KEY, 'true');
        navigate('/onboarding');
      }
    } catch {
      toast({ variant: 'destructive', title: 'Demo unavailable', description: 'Something went wrong.' });
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      {/* Hero — full-bleed */}
      <section className="relative overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/hero-bg.jpeg)', backgroundPosition: 'center 30%' }}
        />
        {/* White overlay fading toward bottom */}
        <div className="absolute inset-0 bg-background/[0.78]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
        <div className="relative w-full px-6 sm:px-12 md:px-[100px] pt-20 pb-24 lg:pt-32 lg:pb-40">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-[1600px] mx-auto">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-primary leading-[1.1] mb-8">
                Your career,<br />on record.
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg mb-10 leading-relaxed">
                The professional development tool for women in product management. 
                Capture signals, reveal patterns, and build the evidence your career deserves.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground px-10 py-7 text-lg rounded-2xl shadow-lg shadow-accent/25 transition-all hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5"
                >
                  Get started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleSkipToDemo}
                  disabled={demoLoading}
                  className="px-10 py-7 text-lg rounded-2xl border-primary/20 text-primary hover:bg-primary/5"
                >
                  {demoLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                  Skip to demo
                </Button>
              </div>
            </div>
            <div className="hidden lg:flex justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <HeroIllustration />
            </div>
          </div>
        </div>
        <SignalWavePattern className="absolute bottom-0 left-0 w-full h-28" />
      </section>

      {/* Features — full width with vibrant cards */}
      <section className="py-28 bg-rose-soft">
        <div className="w-full px-8 md:px-16 lg:px-24">
          <div className="max-w-[1600px] mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-serif text-primary mb-5">How it works</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                A simple practice that compounds. Three minutes today becomes months of evidence tomorrow.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <div
                  key={f.type}
                  className="bg-background rounded-3xl p-10 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in border border-border/50"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className="flex justify-center mb-7">
                    <FeatureIcon type={f.type} />
                  </div>
                  <h3 className="text-2xl font-serif text-primary mb-4 text-center">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-center">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof — full width */}
      <section className="py-28">
        <div className="w-full px-8 md:px-16 lg:px-24">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-center gap-5 mb-14">
              <AvatarSilhouettes />
              <p className="text-muted-foreground">Trusted by product managers building their case.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
              {testimonials.map(t => (
                <div key={t.name} className="bg-background rounded-3xl p-10 border-2 border-blush-light/60 hover:border-accent/40 transition-colors">
                  <p className="text-foreground text-lg leading-relaxed mb-8 italic">"{t.quote}"</p>
                  <div>
                    <p className="font-bold text-primary">{t.name}</p>
                    <p className="text-muted-foreground text-sm">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA — full-bleed gradient */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-navy to-navy-light" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(340_80%_65%/0.15),transparent_60%)]" />
        <div className="relative w-full px-8 md:px-16 lg:px-24 text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-primary-foreground mb-6">
            Start building your record
          </h2>
          <p className="text-primary-foreground/70 text-lg max-w-lg mx-auto mb-10">
            It takes 60 seconds to log your first signal. Your future self will thank you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-10 py-7 text-lg rounded-2xl shadow-lg shadow-accent/30 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Get started — it's free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-8 text-primary-foreground/60 text-sm">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Free to use</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Takes 2 minutes</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
