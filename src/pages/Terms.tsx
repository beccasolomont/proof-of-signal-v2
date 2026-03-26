/**
 * Terms — standard terms of use page with disclaimers.
 */
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, AlertTriangle, Scale, ShieldCheck, Ban } from 'lucide-react';
import Footer from '@/components/Footer';

const sections = [
  {
    icon: FileText,
    title: 'Acceptance of Terms',
    content: `By accessing or using Proof of Signal ("the Service"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Service. We reserve the right to modify these terms at any time, and your continued use of the Service constitutes acceptance of any changes.`,
  },
  {
    icon: ShieldCheck,
    title: 'Use of the Service',
    content: `Proof of Signal is a professional development tool designed to help you capture, organize, and reflect on workplace signals. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to use the Service only for lawful purposes and in accordance with these terms.`,
  },
  {
    icon: AlertTriangle,
    title: 'Not Legal or Mental Health Advice',
    content: `The Service is a career development and self-reflection tool only. Nothing provided by Proof of Signal — including AI-generated insights, pattern analysis, coaching tips, or any other content — constitutes legal advice, mental health counseling, medical advice, or professional therapy. The Service is not a substitute for professional legal counsel, licensed mental health services, or emergency medical care.`,
  },
  {
    icon: Ban,
    title: 'Crisis & Emergency Disclaimer',
    content: `If you feel you are in crisis, experiencing a mental health emergency, or are in immediate danger, please stop using this application and seek proper support immediately. Contact emergency services (911 in the US), the 988 Suicide & Crisis Lifeline (call or text 988), or a licensed mental health professional. If you require legal assistance, please consult a qualified attorney. Proof of Signal is not equipped to handle emergencies of any kind.`,
  },
  {
    icon: Scale,
    title: 'Intellectual Property',
    content: `All content, features, and functionality of the Service — including text, graphics, logos, and software — are the property of Proof of Signal and are protected by intellectual property laws. Your signal entries and personal data remain yours. By using the Service, you grant us a limited license to process your data solely to provide and improve the Service.`,
  },
  {
    icon: FileText,
    title: 'Limitation of Liability',
    content: `Proof of Signal is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or secure. In no event shall Proof of Signal be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Service.`,
  },
  {
    icon: FileText,
    title: 'Termination',
    content: `We may suspend or terminate your access to the Service at any time, with or without cause, and with or without notice. Upon termination, your right to use the Service will immediately cease. You may delete your account at any time, which will result in the permanent removal of your data within 30 days.`,
  },
];

const Terms = () => (
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
          <Scale className="w-4 h-4" />
          Terms of Use
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-primary mb-4">
          Terms of Use
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Please read these terms carefully before using Proof of Signal. By using our service, you agree to be bound by these terms.
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
        <p className="text-primary font-serif text-xl mb-2">Questions about these terms?</p>
        <p className="text-muted-foreground">
          Contact us at{' '}
          <a href="mailto:legal@proofofsignal.com" className="text-accent hover:underline">
            legal@proofofsignal.com
          </a>
        </p>
      </div>
    </main>

    <Footer />
  </div>
);

export default Terms;
