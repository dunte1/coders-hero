import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2, CalendarDays, Clock, MapPin, Video, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/Select';
import { DialogRoot, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime } from '@/lib/utils';
import { classSessionsApi } from '@/lib/api';
import { useCalendarEvents, useCreateCalendarEvent, useDeleteCalendarEvent, useTeacherClasses } from '@/hooks/useTeacher';
import type { CalendarEvent, CalendarEventInput, EventType } from '@/types/teacher';

const eventTypes: { value: EventType; label: string }[] = [
  { value: 'class', label: 'Class' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'exam', label: 'Exam' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'activity', label: 'Activity' },
  { value: 'other', label: 'Other' },
];

export default function TeacherCalendarPage() {
  const { data, isLoading } = useCalendarEvents();
  const { data: classesData } = useTeacherClasses({ per_page: 100 });
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['teacher', 'class-sessions'],
    queryFn: () => classSessionsApi.getTeacherSessions({ per_page: 20 }),
  });
  const createEvent = useCreateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CalendarEventInput>({
    title: '',
    event_type: 'class',
    starts_at: '',
    all_day: false,
  });

  const events = data ?? [];

  const sorted = [...events].sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  const handleCreate = () => {
    createEvent.mutate(
      { ...form, class_id: form.class_id ?? null, all_day: form.all_day ?? false },
      { onSuccess: () => { setOpen(false); setForm({ title: '', event_type: 'class', starts_at: '', all_day: false }); } }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Manage your schedule and events."
        actions={
          <DialogRoot open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" />New Event</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Create Event</DialogTitle>
                <DialogDescription>Add an event to your calendar.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <Textarea label="Description" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SelectRoot value={form.event_type ?? 'class'} onValueChange={(v) => setForm({ ...form, event_type: v as EventType })}>
                    <SelectTrigger label="Type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                  <SelectRoot value={form.class_id ? String(form.class_id) : ''} onValueChange={(v) => setForm({ ...form, class_id: v ? Number(v) : null })}>
                    <SelectTrigger label="Class"><SelectValue placeholder="Optional class" /></SelectTrigger>
                    <SelectContent>
                      {(classesData?.results ?? []).map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Starts" type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
                  <Input label="Ends" type="datetime-local" value={form.ends_at ?? ''} onChange={(e) => setForm({ ...form, ends_at: e.target.value || null })} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Location" value={form.location ?? ''} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  <label className="flex items-center gap-2 pt-7 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.all_day ?? false}
                      onChange={(e) => setForm({ ...form, all_day: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600"
                    />
                    All day
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} loading={createEvent.isPending} disabled={!form.title || !form.starts_at}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </DialogRoot>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Spinner />
          ) : sorted.length === 0 ? (
            <EmptyState title="No events" description="Create an event to get started." />
          ) : (
            <div className="space-y-3">
              {sorted.map((ev) => (
                <EventRow key={ev.id} event={ev} onDelete={() => deleteEvent.mutate(ev.id)} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" /> Live Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <Spinner />
          ) : (sessionsData?.results ?? []).length === 0 ? (
            <EmptyState title="No live sessions" description="Upcoming class sessions will appear here." />
          ) : (
            <div className="space-y-3">
              {(sessionsData?.results ?? []).map((session: any) => (
                <div key={session.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                      <Video className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{session.title}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        {session.scheduled_at && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDateTime(session.scheduled_at)}
                          </span>
                        )}
                        {session.class_name && <span>{session.class_name}</span>}
                        {session.duration_minutes && <span>{session.duration_minutes} min</span>}
                      </div>
                    </div>
                  </div>
                  {session.join_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(session.join_url, '_blank')}
                      className="gap-1"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Join
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EventRow({ event, onDelete }: { event: CalendarEvent; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: event.color ?? '#e2e8f0' }}>
          <CalendarDays className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-slate-900">{event.title}</h3>
            <StatusBadge status={event.event_type} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDateTime(event.starts_at)}
            </span>
            {event.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {event.location}
              </span>
            )}
            {event.school_class && <span>{event.school_class.name}</span>}
          </div>
          {event.description && (
            <p className="mt-2 text-sm text-slate-600">{event.description}</p>
          )}
        </div>
      </div>
      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
