import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarDays, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDelete } from '@/components/cms/ConfirmDelete';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { APPOINTMENT_STATUSES } from '@/components/parent/PortalBadges';
import { useAdminAppointments, useUpdateAdminAppointment, useDeleteAdminAppointment } from '@/hooks/useParentPortal';
import { formatDateTime } from '@/lib/utils';
import type { Appointment, AppointmentStatus } from '@/types/portal';
const notesSchema = z.object({
  notes: z.string().optional(),
});

type NotesFormValues = z.infer<typeof notesSchema>;

export default function AdminAppointmentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('all');
  const [notesAppointment, setNotesAppointment] = useState<Appointment | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useAdminAppointments({ page, status: status === 'all' ? undefined : status });
  const updateMutation = useUpdateAdminAppointment();
  const deleteMutation = useDeleteAdminAppointment();

  const notesMethods = useForm<NotesFormValues>({
    resolver: zodResolver(notesSchema),
    defaultValues: { notes: '' },
  });

  const openNotesDialog = (appointment: Appointment) => {
    notesMethods.reset({ notes: appointment.notes || '' });
    setNotesAppointment(appointment);
  };

  const onSaveNotes = (values: NotesFormValues) => {
    if (!notesAppointment) return;
    updateMutation.mutate(
      { id: notesAppointment.id, data: { notes: values.notes || null } },
      { onSuccess: () => setNotesAppointment(null) }
    );
  };

  const changeStatus = (appointment: Appointment, nextStatus: string) => {
    updateMutation.mutate({ id: appointment.id, data: { status: nextStatus as AppointmentStatus } });
  };

  if (isLoading) return <PageSpinner />;

  const appointments = data?.results || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Manage parent-teacher appointments."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Appointments' }]}
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">All Appointments ({meta?.total ?? appointments.length})</CardTitle>
          <div className="w-44">
            <SelectRoot value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {APPOINTMENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {appointments.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No appointments"
              description="No appointments match the current filter."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4">Student</th>
                    <th className="py-2 pr-4">Guardian</th>
                    <th className="py-2 pr-4">Teacher</th>
                    <th className="py-2 pr-4">Scheduled</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="py-2.5 pr-4 font-medium text-slate-900">
                        {appointment.student?.full_name || '—'}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">
                        {appointment.guardian?.full_name || '—'}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">{appointment.teacher?.name || '—'}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{formatDateTime(appointment.scheduled_at)}</td>
                      <td className="py-2.5 pr-4">
                        <SelectRoot
                          value={appointment.status}
                          onValueChange={(value) => changeStatus(appointment, value)}
                        >
                          <SelectTrigger className="h-8 min-w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {APPOINTMENT_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </SelectRoot>
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openNotesDialog(appointment)}>
                            Notes
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => setDeleteId(appointment.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {meta && meta.last_page > 1 && (
            <Pagination
              currentPage={meta.current_page}
              totalPages={meta.last_page}
              onPageChange={setPage}
              totalCount={meta.total}
              pageSize={meta.per_page}
            />
          )}
        </CardContent>
      </Card>

      <DialogRoot open={!!notesAppointment} onOpenChange={(open) => !open && setNotesAppointment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Notes</DialogTitle>
            <DialogDescription>
              {notesAppointment?.student?.full_name
                ? `Notes for ${notesAppointment.student.full_name}'s appointment with ${notesAppointment.teacher?.name || 'teacher'}.`
                : 'Add or update notes for this appointment.'}
            </DialogDescription>
          </DialogHeader>
          <FormProvider {...notesMethods}>
            <form onSubmit={notesMethods.handleSubmit(onSaveNotes)} className="space-y-4">
              <Textarea
                label="Notes"
                rows={4}
                placeholder="Internal notes about this appointment"
                {...notesMethods.register('notes')}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setNotesAppointment(null)}>
                  Cancel
                </Button>
                <Button type="submit" loading={updateMutation.isPending}>
                  Save Notes
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </DialogRoot>

      <ConfirmDelete
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Appointment"
        description="Are you sure you want to delete this appointment? This action cannot be undone."
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
      />
    </div>
  );
}
