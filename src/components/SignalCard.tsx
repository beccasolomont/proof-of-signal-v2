/**
 * SignalCard — renders a single signal with inline tag selector, edit/delete modals, and flag toggle.
 *
 * Props:
 * - `signal` — the Signal object to display
 * - `onUpdate` — callback to persist field edits
 * - `onDelete` — callback to remove the signal
 * - `onToggleFlag` — callback to toggle the flagged state
 */
import { useState } from 'react';
import { Signal, useApp } from '@/contexts/AppContext';
import { SIGNAL_TAGS } from '@/lib/signalTagger';
import { getTagColorClass, MAX_SIGNAL_LENGTH } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Star, Pencil, Trash2 } from 'lucide-react';

interface SignalCardProps {
  signal: Signal;
  onUpdate: (id: string, updates: Partial<Signal>) => void;
  onDelete: (id: string) => void;
  onToggleFlag: (id: string) => void;
}

const SignalCard = ({ signal, onUpdate, onDelete, onToggleFlag }: SignalCardProps) => {
  const { customTags } = useApp();
  const allTags = [...SIGNAL_TAGS, ...customTags];
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editText, setEditText] = useState(signal.text);
  const [editDate, setEditDate] = useState(signal.date);
  const [editTag, setEditTag] = useState(signal.tag);
  const [editMeeting, setEditMeeting] = useState(signal.context?.meeting || '');
  const [editAttendees, setEditAttendees] = useState(signal.context?.attendees || '');

  /** Reset edit fields to current signal values and open the edit modal. */
  const openEdit = () => {
    setEditText(signal.text);
    setEditDate(signal.date);
    setEditTag(signal.tag);
    setEditMeeting(signal.context?.meeting || '');
    setEditAttendees(signal.context?.attendees || '');
    setEditing(true);
  };

  /** Persist edits and close the modal. */
  const saveEdit = () => {
    const context = (editMeeting || editAttendees) ? { meeting: editMeeting, attendees: editAttendees } : undefined;
    onUpdate(signal.id, { text: editText, date: editDate, tag: editTag, context });
    setEditing(false);
  };

  return (
    <>
      <div className="group bg-card rounded-xl border border-border p-5 transition-colors hover:border-blush/40">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground line-clamp-2 mb-2">{signal.text}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">{signal.date}</span>
              <Select
                value={signal.tag}
                onValueChange={val => onUpdate(signal.id, { tag: val })}
              >
                <SelectTrigger className="h-auto p-0 border-0 shadow-none w-auto">
                  <Badge variant="secondary" className={`${getTagColorClass(signal.tag)} text-navy border-0 cursor-pointer text-xs`}>
                    {signal.tag}
                  </Badge>
                </SelectTrigger>
                <SelectContent>
                  {allTags.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {signal.context?.meeting && (
                <span className="text-xs text-muted-foreground">📍 {signal.context.meeting}</span>
              )}
              {signal.context?.attendees && (
                <span className="text-xs text-muted-foreground">👥 {signal.context.attendees}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={openEdit}
              className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
            </button>
            <button
              onClick={() => onToggleFlag(signal.id)}
              className="p-1 transition-colors"
            >
              <Star
                className={`w-4 h-4 ${signal.flagged ? 'fill-navy text-navy' : 'text-muted-foreground/30 hover:text-muted-foreground'}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-serif text-navy">Edit signal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editText}
              onChange={e => setEditText(e.target.value.slice(0, MAX_SIGNAL_LENGTH))}
              className="rounded-xl min-h-[100px]"
            />
            <div className="flex items-center gap-3">
              <Input
                type="date"
                value={editDate}
                onChange={e => setEditDate(e.target.value)}
                className="rounded-xl w-40"
              />
              <Select value={editTag} onValueChange={setEditTag}>
                <SelectTrigger className="rounded-xl flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allTags.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={editMeeting}
                onChange={e => setEditMeeting(e.target.value)}
                placeholder="Meeting name"
                className="rounded-xl text-sm"
              />
              <Input
                value={editAttendees}
                onChange={e => setEditAttendees(e.target.value)}
                placeholder="Attendees"
                className="rounded-xl text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={!editText.trim()} className="bg-navy hover:bg-navy-light text-primary-foreground rounded-xl">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-serif text-navy">Delete this signal?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This can't be undone.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => { onDelete(signal.id); setConfirmDelete(false); }}
              className="rounded-xl"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SignalCard;
