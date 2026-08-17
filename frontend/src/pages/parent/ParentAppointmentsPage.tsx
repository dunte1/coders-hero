import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarDays, Plus, Trash2, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/Dialog';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { ConfirmDelete } from '@/components/cms/ConfirmDelete';
import { AppointmentStatusBadge } from '@/components/parent/PortalBadges';
import {
  useParentAppointments,
  useParentTeachers,
  useParentChildren,
  useCreateAppointment,
  useCancelAppointment,
  useDeleteAppointment,
} from '@/hooks/useParentPortal';
import { formatDateTime, getInitials } from '@/lib/utils';

const appointmentSchema = z
  .object({
    student_id: z.string().optional(),
    teacher_user_id: z.string().min(1, 'Teacher is required'),
    scheduled_at: z.string().min(1, 'Date and time are required'),
    duration_minutes: z.string().min(1, 'Duration is required'),
    reason: z.string().min(1, 'Reason is required').max(255),
    notes: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.scheduled_at && new Date(values.scheduled_at) <= new Date()) {
      ctx.addIssue({
        code: 'custom',
        path: ['scheduled_at'],
        message: 'Appointment must be in the future',
      });
    }
  });

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

function BookAppointmentDialog() {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateAppointment();
  const { data: teachers } = useParentTeachers();
  const { data: children } = useParentChildren();

  const methods = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      student_id: '',
      teacher_user_id: '',
      scheduled_at: '',
      duration_minutes: '30',
      reason: '',
      notes: '',
    },
  });

  const { register, handleSubmit, setValue, watch, reset } = methods;

  const onFormSubmit = (values: AppointmentFormValues) => {
    createMutation.mutate(
      {
        student_id: values.student_id ? Number(values.student_id) : null,
        teacher_user_id: values.teacher_user_id,
        scheduled_at: values.scheduled_at,
        duration_minutes: Number(values.duration_minutes),
        reason: values.reason,
        notes: values.notes || undefined,
      },
      {
        onSuccess: () => {
          reset({
            student_id: '',
            teacher_user_id: '',
            scheduled_at: '',
            duration_minutes: '30',
            reason: '',
            notes: '',
          });
          setOpen(false);
        },
      }
    );
  };

  return (
    <DialogRoot open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Book Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>
            Schedule a meeting with your child&apos;s teacher.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectRoot value={watch('student_id')} onValueChange={(value) => setValue('student_id', value)}>
                <SelectTrigger label="Student (optional)">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {children?.map((student) => (
                    <SelectItem key={student.id} value={String(student.id)}>
                      {student.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
              <SelectRoot value={watch('teacher_user_id')} onValueChange={(value) => setValue('teacher_user_id', value)}>
                <SelectTrigger label="Teacher" error={methods.formState.errors.teacher_user_id?.message}>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers?.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Date & Time"
                type="datetime-local"
                error={methods.formState.errors.scheduled_at?.message}
                {...register('scheduled_at')}
              />
              <SelectRoot value={watch('duration_minutes')} onValueChange={(value) => setValue('duration_minutes', value)}>
                <SelectTrigger label="Duration" error={methods.formState.errors.duration_minutes?.message}>
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  {['15', '30', '45', '60', '90', '120'].map((duration) => (
                    <SelectItem key={duration} value={duration}>
                      {duration} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
            <Input
              label="Reason"
              placeholder="e.g. Discuss progress in mathematics"
              error={methods.formState.errors.reason?.message}
              {...register('reason')}
            />
            <Textarea
              label="Notes (optional)"
              rows={2}
              placeholder="Anything the teacher should know"
              {...register('notes')}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" loading={createMutation.isPending}>
                Book Appointment
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </DialogRoot>
  );
}

export default function ParentAppointmentsPage() {
  const { data, isLoading } = useParentAppointments();
  const cancelMutation = useCancelAppointment();
  const deleteMutation = useDeleteAppointment();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  if (isLoading) return <PageSpinner />;

  const appointments = data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Book and manage meetings with your child's teachers."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Parent Portal', href: '/parent' }, { label: 'Appointments' }]}
        actions={<BookAppointmentDialog />}
      />

      {appointments.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={CalendarDays}
              title="No appointments"
              description="Book an appointment with a teacher to get started."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-xs font-medium text-brand-700">
                      {appointment.teacher?.avatar ? (
                        <img src={appointment.teacher.avatar} alt={appointment.teacher.name} className="h-full w-full object-cover" />
                      ) : (
                        getInitials(appointment.teacher?.name || 'T', '')
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">{appointment.teacher?.name || 'Teacher'}</CardTitle>
                      <p className="text-xs text-slate-500">
                        {appointment.student?.full_name || 'General'} · {appointment.duration_minutes} min
                      </p>
                    </div>
                  </div>
                  <AppointmentStatusBadge status={appointment.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                  {formatDateTime(appointment.scheduled_at)}
                </p>
                <p className="text-sm text-slate-700">{appointment.reason}</p>
                {appointment.notes && <p className="text-xs text-slate-500">{appointment.notes}</p>}
                <div className="flex gap-2 pt-2">
                  {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      loading={cancelMutation.isPending}
                      onClick={() => cancelMutation.mutate(appointment.id)}
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setDeleteId(appointment.id)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
