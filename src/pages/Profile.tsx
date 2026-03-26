/**
 * Profile — user profile viewer/editor with demo reset (Diana only) and clean-account reset.
 */
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Edit2, RotateCcw, Trash2, Camera } from 'lucide-react';
import { MAX_GOALS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import CareerStageSelector from '@/components/CareerStageSelector';
import GoalSelector from '@/components/GoalSelector';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import dianaAvatar from '@/assets/diana-avatar.png';

const Profile = () => {
  const { user, signals, isDemoUser, setUser, resetToDemo, resetToClean } = useApp();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName);
  const [careerStage, setCareerStage] = useState(user.careerStage);
  const [goals, setGoals] = useState<string[]>(user.goals);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarSrc = isDemoUser ? dianaAvatar : user.avatarUrl || undefined;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const ext = file.name.split('.').pop();
      const path = `${session.user.id}/avatar.${ext}`;
      await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      setUser({ avatarUrl: publicUrl });
    } finally {
      setUploading(false);
    }
  };

  const save = () => {
    setUser({ firstName, careerStage, goals });
    setEditing(false);
  };

  const toggleGoal = (g: string) => {
    setGoals(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : prev.length < MAX_GOALS ? [...prev, g] : prev
    );
  };

  const firstSignal = signals[signals.length - 1];

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-8 md:px-16 lg:px-24 py-10 max-w-[1600px] mx-auto">
        {/* Avatar + Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="w-16 h-16">
                <AvatarImage src={avatarSrc} alt={user.firstName} />
                <AvatarFallback className="bg-rose-soft text-navy font-semibold text-lg">
                  {user.firstName ? user.firstName.charAt(0).toUpperCase() : '?'}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <h1 className="text-3xl font-serif text-navy">Your Profile</h1>
          </div>
          {!editing && (
            <Button variant="ghost" onClick={() => setEditing(true)} className="text-muted-foreground">
              <Edit2 className="w-4 h-4 mr-1" /> Edit
            </Button>
          )}
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 mb-8">
          <div className="space-y-6">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Name</label>
              {editing ? (
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} className="mt-1 rounded-xl" />
              ) : (
                <p className="text-foreground font-medium mt-1">{user.firstName || '—'}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Career Stage</label>
              {editing ? (
                <div className="mt-2">
                  <CareerStageSelector value={careerStage} onChange={setCareerStage} />
                </div>
              ) : (
                <p className="text-foreground font-medium mt-1">{user.careerStage || '—'}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Focus Areas</label>
              {editing ? (
                <div className="mt-2">
                  <GoalSelector selected={goals} onToggle={toggleGoal} />
                </div>
              ) : (
                <div className="flex gap-2 mt-1 flex-wrap">
                  {user.goals.length ? user.goals.map(g => (
                    <Badge key={g} variant="secondary" className="bg-rose-soft text-navy border-0">{g}</Badge>
                  )) : <span className="text-muted-foreground">—</span>}
                </div>
              )}
            </div>
          </div>
          {editing && (
            <div className="flex gap-3 mt-6">
              <Button onClick={save} className="bg-navy hover:bg-navy-light text-primary-foreground rounded-xl">Save</Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          )}
        </div>

        {/* First Signal */}
        {firstSignal && (
          <div className="bg-card rounded-2xl border border-border p-6 mb-8">
            <h2 className="text-lg font-serif text-navy mb-4">Your first signal</h2>
            <p className="text-sm text-foreground italic mb-3">"{firstSignal.text}"</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{firstSignal.date}</span>
              <Badge variant="secondary" className="bg-rose-soft text-navy border-0 text-xs">{firstSignal.tag}</Badge>
            </div>
          </div>
        )}

        {/* Demo Reset — only for Diana's demo account */}
        {isDemoUser && (
          <div className="border border-dashed border-border rounded-2xl p-6 text-center space-y-3 mb-8">
            <p className="text-sm text-muted-foreground mb-3">Demo account tools</p>
            <Button
              variant="outline"
              onClick={resetToDemo}
              className="rounded-xl text-muted-foreground hover:text-navy"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Reset to Diana's demo data
            </Button>
          </div>
        )}

        {/* Clean Reset */}
        <div className="border border-dashed border-border rounded-2xl p-6 text-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3 h-3 mr-1" /> Reset to clean account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset to clean account</AlertDialogTitle>
                <AlertDialogDescription>
                  This will clear all your signals and settings. Are you sure?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    resetToClean();
                    navigate('/onboarding');
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default Profile;
