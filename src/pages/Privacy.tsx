/**
 * Privacy — standard data privacy and security notice page.
 */
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Server, Trash2 } from 'lucide-react';
import Footer from '@/components/Footer';

const sections = [
  {
    icon: Eye,
    title: 'Information We Collect',
    content: `We collect information you provide directly, including your name, email address, career stage, professional goals, and signal entries. We also collect usage data such as login timestamps and feature interactions to improve the service.`,
  },
  {
    icon: Lock,
    title: 'How We Use Your Data',
    content: `Your data is used solely to provide and improve the Proof of Signal service. Signal entries and career data are used to generate personalized insights and pattern analysis. We do not sell, rent, or share your personal data with third parties for marketing purposes.`,
  },
  {
    icon: Server,
    title: 'Data Storage & Security',
    content: `All data is encrypted in transit (TLS 1.2+) and at rest (AES-256). Our infrastructure is hosted on enterprise-grade cloud providers with SOC 2 compliance. Access to production data is restricted to authorized personnel with multi-factor authentication.`,
  },
  {
    icon: Shield,
    title: 'Your Rights',
    content: `You have the right to access, correct, or delete your personal data at any time. You may export your data or request a complete account deletion by contacting us. We respond to all data requests within 30 days in accordance with applicable privacy regulations.`,
  },
  {
    icon: Trash2,
    title: 'Data Retention',
    content: `We retain your data for as long as your account is active or as needed to provide you services. If you delete your account, all personal data and signal entries are permanently removed within 30 days. Anonymized, aggregated data may be retained for analytics purposes.`,
  },
];

const Privacy = () => (
  <div className="min-h-screen bg-background flex flex-col">
    {/* Header */}
    <div className="w-full bg-background border-b border-border/50">
      <div className="w-full px-6 md:px-16 lg:px-24 max-w-[1600px] mx-auto flex items-center h-14">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>

    {/* Content */}
    <main className="flex-1 w-full px-6 md:px-16 lg:px-24 max-w-[900px] mx-auto py-16 md:py-24">
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <Shield className="w-4 h-4" />
          Privacy &amp; Security
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-primary mb-4">
          Data Privacy &amp; Security Notice
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          At Proof of Signal, your privacy is foundational to our product. This notice explains how we collect, use, and protect your information.
        </p>
        <p className="text-muted-foreground text-sm mt-3">
          Last updated: March 26, 2026
        </p>
      </div>

      <div className="space-y-10">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <section key={s.title} className="bg-card rounded-2xl border border-border/50 p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-serif text-primary mb-3">{s.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{s.content}</p>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-14 bg-rose-soft rounded-2xl p-8 text-center">
        <p className="text-primary font-serif text-xl mb-2">Questions about your data?</p>
        <p className="text-muted-foreground">
          Contact us at{' '}
          <a href="mailto:privacy@proofofsignal.com" className="text-accent hover:underline">
            privacy@proofofsignal.com
          </a>
        </p>
      </div>
    </main>

    <Footer />
  </div>
);

export default Privacy;
