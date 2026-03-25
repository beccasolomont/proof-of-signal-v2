/**
 * Dashboard — main logged-in view.
 *
 * Shows a getting-started checklist, signal log form with confirmation state,
 * pattern insight card (navigates to Patterns), and a filterable signal timeline.
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { classifySignal, SIGNAL_TAGS } from '@/lib/signalTagger';
import {
  THEME_INSIGHTS,
  MAX_SIGNAL_LENGTH,
  CONFIRMATION_TIMEOUT_MS,
  MIN_SIGNALS_FOR_INSIGHT,
  DEMO_USER_NAME,
  FUTURE_DATE_ERROR,
  isFutureDate,
} from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lock, Filter, Tag, Plus, X } from 'lucide-react';
import { useVoiceInput } from '@/hooks/use-voice-input';
import { useToast } from '@/hooks/use-toast';
import VoiceInputButton from '@/components/VoiceInputButton';
import DemoInsight from '@/components/DemoInsight';
import EmptyState from '@/components/illustrations/EmptyState';
import SignalCard from '@/components/SignalCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signals, addSignal, updateSignal, deleteSignal, toggleFlag } = useApp();
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showContext, setShowContext] = useState(false);
  const [meeting, setMeeting] = useState('');
  const [attendees, setAttendees] = useState('');
  const [justLogged, setJustLogged] = useState(false);
  const [lastTag, setLastTag] = useState('');
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);

  const { supported: voiceSupported, listening, toggle: toggleVoice } = useVoiceInput((transcript) => {
    setText(prev => prev ? `${prev} ${transcript}`.slice(0, MAX_SIGNAL_LENGTH) : transcript.slice(0, MAX_SIGNAL_LENGTH));
  });

  const dateIsFuture = isFutureDate(date);

  /** Submit a new signal and show the confirmation state briefly. */
  const handleSubmit = async () => {
    if (isFutureDate(date)) {
      toast({ variant: 'destructive', title: 'Invalid date', description: FUTURE_DATE_ERROR });
      return;
    }
    setIsClassifying(true);
    try {
      const tag = await classifySignal(text);
      setLastTag(tag);
      const context = (meeting || attendees) ? { meeting, attendees } : undefined;
      addSignal({ text, date, tag, flagged: false, context });
      setText('');
      setMeeting('');
      setAttendees('');
      setShowContext(false);
      setJustLogged(true);
      setTimeout(() => setJustLogged(false), CONFIRMATION_TIMEOUT_MS);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to classify signal. Please try again.' });
    } finally {
      setIsClassifying(false);
    }
  };

  const signalCount = signals.length;
  const checklist = [
    { label: 'Tell us where you are', done: !!user.careerStage },
    { label: 'Log your first signal', done: signalCount >= 1 },
    { label: 'Log 2 more signals to unlock your first insight', done: signalCount >= MIN_SIGNALS_FOR_INSIGHT },
    { label: 'Try a coaching session', done: false, comingSoon: true },
  ];

  const showInsight = signalCount >= MIN_SIGNALS_FOR_INSIGHT;

  /** Determine the most frequent signal tag for insight copy. */
  const topTheme = useMemo(() => {
    const counts: Record<string, number> = {};
    signals.forEach(s => { counts[s.tag] = (counts[s.tag] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  }, [signals]);

  /** Extract unique attendee names from all signals for the filter chips. */
  const allAttendees = useMemo(() => {
    const names = new Set<string>();
    signals.forEach(s => {
      if (s.context?.attendees) {
        s.context.attendees.split(/[,;]/).forEach(name => {
          const trimmed = name.trim();
          if (trimmed) names.add(trimmed);
        });
      }
    });
    return Array.from(names).sort();
  }, [signals]);

  const displayedSignals = signals
    .filter(s => !showFlaggedOnly || s.flagged)
    .filter(s => !selectedAttendee || (s.context?.attendees?.toLowerCase().includes(selectedAttendee.toLowerCase())))
    .filter(s => !selectedTag || s.tag === selectedTag)
    .sort((a, b) => b.date.localeCompare(a.date));

  /** Group signals by month for visual separation. */
  const groupedSignals = useMemo(() => {
    const groups: { label: string; signals: typeof displayedSignals }[] = [];
    let currentLabel = '';
    for (const signal of displayedSignals) {
      const label = format(parseISO(signal.date), 'MMMM yyyy');
      if (label !== currentLabel) {
        currentLabel = label;
        groups.push({ label, signals: [signal] });
      } else {
        groups[groups.length - 1].signals.push(signal);
      }
    }
    return groups;
  }, [displayedSignals]);

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-8 md:px-16 lg:px-24 py-10 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-serif text-navy mb-1">
            {user.firstName ? (signals.length >= 2 ? `Welcome back, ${user.firstName}` : `Welcome, ${user.firstName}`) : 'Your Dashboard'}
          </h1>
          <p className="text-muted-foreground text-sm">Your signal record at a glance.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Checklist + Signal Form */}
          <div className="space-y-8">
            {/* Checklist */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-serif text-navy mb-4">Getting started</h2>
              <div className="space-y-3">
                {checklist.map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    {item.done ? (
                      <CheckCircle2 className="w-5 h-5 text-navy flex-shrink-0" />
                    ) : item.comingSoon ? (
                      <Lock className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0" />
                    )}
                    <span className={`text-sm ${item.done ? 'text-foreground' : item.comingSoon ? 'text-muted-foreground/40' : 'text-muted-foreground'}`}>
                      {item.label}
                      {item.comingSoon && (
                        <Badge variant="outline" className="ml-2 text-xs border-border text-muted-foreground/40">
                          Coming soon
                        </Badge>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Signal Form */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-serif text-navy mb-4">Log a signal</h2>
              {justLogged ? (
                <div className="text-center py-4 animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-rose-soft flex items-center justify-center mx-auto mb-3">
                    <span className="text-navy text-lg font-bold">✦</span>
                  </div>
                  <p className="font-medium font-serif text-navy mb-1">Signal captured.</p>
                  <p className="text-sm text-muted-foreground">
                    We've tagged this as <Badge variant="secondary" className="bg-rose-soft text-navy border-0 inline-flex">{lastTag}</Badge>. Log 2 more signals to start seeing patterns.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <Textarea
                      value={text}
                      onChange={e => setText(e.target.value.slice(0, MAX_SIGNAL_LENGTH))}
                      placeholder="What happened?"
                      className="rounded-xl min-h-[100px] pr-10"
                    />
                    {voiceSupported && (
                      <VoiceInputButton listening={listening} onToggle={toggleVoice} />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="rounded-xl w-40"
                      />
                      {dateIsFuture && (
                        <p className="text-xs text-destructive mt-1">{FUTURE_DATE_ERROR}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{text.length}/{MAX_SIGNAL_LENGTH}</span>
                  </div>
                  {/* Optional context — always visible */}
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      value={meeting}
                      onChange={e => setMeeting(e.target.value)}
                      placeholder="Meeting name (optional)"
                      className="rounded-xl text-sm"
                    />
                    <Input
                      value={attendees}
                      onChange={e => setAttendees(e.target.value)}
                      placeholder="Attendees (optional)"
                      className="rounded-xl text-sm"
                    />
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={!text.trim() || isClassifying || dateIsFuture}
                    className="w-full bg-navy hover:bg-navy-light text-primary-foreground rounded-xl py-5"
                  >
                    {isClassifying ? 'Classifying…' : 'Log signal'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Insight + Timeline */}
          <div className="space-y-8">
            {/* Insight Card */}
            {showInsight && (
              <div
                onClick={() => navigate('/patterns')}
                className="bg-gradient-to-br from-rose-soft to-blush-light rounded-2xl p-6 border border-blush/20 animate-fade-in cursor-pointer hover:shadow-md hover:border-blush/40 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-foreground text-xs font-bold">✦</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-navy mb-1">Pattern detected</h3>
                    {user.firstName === DEMO_USER_NAME ? (
                      <DemoInsight />
                    ) : (
                      <p className="text-sm text-foreground leading-relaxed">
                        {THEME_INSIGHTS[topTheme] || `You've logged ${signalCount} signals so far. As patterns emerge, you'll see personalized insights here.`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Signal Timeline */}
            <div>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <h2 className="text-lg font-serif text-navy">Your signals</h2>
                <div className="flex items-center gap-2 ml-auto flex-wrap">
                  {/* Tag filter */}
                  <Select
                    value={selectedTag || 'all'}
                    onValueChange={val => setSelectedTag(val === 'all' ? null : val)}
                  >
                    <SelectTrigger className="h-8 w-[160px] text-xs rounded-full border-border">
                      <Tag className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                      <SelectValue placeholder="All tags" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All tags</SelectItem>
                      {SIGNAL_TAGS.map(tag => (
                        <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {allAttendees.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {allAttendees.map(name => (
                        <button
                          key={name}
                          onClick={() => setSelectedAttendee(selectedAttendee === name ? null : name)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                            selectedAttendee === name
                              ? 'bg-navy text-primary-foreground border-navy'
                              : 'bg-card text-muted-foreground border-border hover:border-blush/40'
                          }`}
                        >
                          👥 {name}
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setShowFlaggedOnly(!showFlaggedOnly)}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${
                      showFlaggedOnly ? 'text-navy font-medium' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    {showFlaggedOnly ? 'Showing flagged' : 'Filter flagged'}
                  </button>
                </div>
              </div>

              {displayedSignals.length === 0 ? (
                <EmptyState
                  title={showFlaggedOnly || selectedTag ? 'No matching signals' : 'No signals yet'}
                  description={showFlaggedOnly || selectedTag ? 'Try adjusting your filters.' : 'Log your first signal above to start building your record.'}
                />
              ) : (
                <div className="space-y-6">
                  {groupedSignals.map(group => (
                    <div key={group.label}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{group.label}</span>
                        <Separator className="flex-1" />
                      </div>
                      <div className="space-y-3">
                        {group.signals.map(signal => (
                          <SignalCard
                            key={signal.id}
                            signal={signal}
                            onUpdate={updateSignal}
                            onDelete={deleteSignal}
                            onToggleFlag={toggleFlag}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
