import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserPlus, Trash2, CheckCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/Select';
import { DialogRoot, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getInitials } from '@/lib/utils';
import {
  useTeacherClass,
  useClassRoster,
  useRecordAttendance,
  useUpdateClass,
} from '@/hooks/useTeacher';
import { teacherApi } from '@/lib/teacherApi';
import { useQuery } from '@tanstack/react-query';
import type { AttendanceStatus } from '@/types/teacher';

const statusOptions: { value: AttendanceStatus; label: string }[] = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'excused', label: 'Excused' },
];

export default function TeacherClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const classId = Number(id);
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const { data: classData, isLoading: classLoading } = useTeacherClass(classId);
  const { data: rosterData, isLoading: rosterLoading } = useClassRoster(classId, date);
  const recordAttendance = useRecordAttendance(classId);
  const updateClass = useUpdateClass(classId);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);

  const { data: availableStudents } = useQuery({
    queryKey: ['teacher', 'available-students'],
    queryFn: () => teacherApi.availableStudents(),
  });

  const roster = rosterData?.roster ?? [];

  const entries = roster.map((r) => ({
    student_id: r.student.id,
    status: r.status === 'unmarked' ? ('present' as AttendanceStatus) : r.status,
  }));

  const handleSave = () => {
    recordAttendance.mutate({ date, entries });
  };

  const toggleSelect = (studentId: number) => {
    setSelected((prev) => (prev.includes(studentId) ? prev.filter((s) => s !== studentId) : [...prev, studentId]));
  };

  const handleAddStudents = () => {
    updateClass.mutate(
      { student_ids: selected },
      { onSuccess: () => { setOpen(false); setSelected([]); } }
    );
  };

  if (classLoading) return <Spinner />;
  if (!classData) return <EmptyState title="Class not found" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={classData.name}
        description={`${classData.subject || 'No subject'} ${classData.room ? `· ${classData.room}` : ''}`}
        breadcrumbs={[{ label: 'Classes', href: '/teacher/classes' }, { label: classData.name }]}
        actions={
          <DialogRoot open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><UserPlus className="mr-2 h-4 w-4" />Add Students</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Students</DialogTitle>
                <DialogDescription>Select students to add to this class.</DialogDescription>
              </DialogHeader>
              <div className="max-h-80 overflow-y-auto space-y-2">
                {(availableStudents ?? []).map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 cursor-pointer hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(s.id)}
                      onChange={() => toggleSelect(s.id)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600"
                    />
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-700">
                      {getInitials(s.first_name, s.last_name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{s.full_name}</p>
                      <p className="text-xs text-slate-500">{s.grade ?? 'No grade'}</p>
                    </div>
                  </label>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleAddStudents} loading={updateClass.isPending} disabled={selected.length === 0}>
                  Add {selected.length > 0 ? `(${selected.length})` : ''}
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogRoot>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Attendance</CardTitle>
            <div className="flex items-center gap-2">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
              <Button size="sm" onClick={handleSave} loading={recordAttendance.isPending}>
                <CheckCheck className="mr-2 h-4 w-4" />Save
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {rosterLoading ? (
              <Spinner />
            ) : roster.length === 0 ? (
              <EmptyState title="No students" description="Add students to take attendance." />
            ) : (
              <div className="divide-y divide-slate-100">
                {roster.map((r) => (
                  <div key={r.student.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-700">
                        {getInitials(r.student.first_name, r.student.last_name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{r.student.full_name}</p>
                        <p className="text-xs text-slate-500">{r.student.grade ?? 'No grade'}</p>
                      </div>
                    </div>
                    <SelectRoot
                      value={r.status === 'unmarked' ? 'present' : r.status}
                      onValueChange={(v) => {
                        const entry = roster.find((x) => x.student.id === r.student.id);
                        if (entry) {
                          entry.status = v as AttendanceStatus;
                        }
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Roster</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {roster.length === 0 ? (
              <EmptyState title="No students" description="This class has no students yet." />
            ) : (
              roster.map((r) => (
                <div key={r.student.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-700">
                      {getInitials(r.student.first_name, r.student.last_name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{r.student.full_name}</p>
                      <p className="text-xs text-slate-500">
                        {r.status === 'unmarked' ? 'Not marked' : (
                          <StatusBadge status={r.status} />
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      if (confirm('Remove this student from the class?')) {
                        teacherApi.removeClassStudent(classId, r.student.id).then(() => {
                          window.location.reload();
                        });
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
