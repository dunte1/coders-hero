import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Save } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { useStudents } from '@/hooks/useStudents';
import { useAttendanceList, useBulkAttendance } from '@/hooks/useAttendances';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { AttendanceStatus } from '@/types/students';

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; active: string }[] = [
  { value: 'present', label: 'Present', active: 'border-emerald-600 bg-emerald-50 text-emerald-700' },
  { value: 'late', label: 'Late', active: 'border-amber-600 bg-amber-50 text-amber-700' },
  { value: 'absent', label: 'Absent', active: 'border-red-600 bg-red-50 text-red-700' },
  { value: 'excused', label: 'Excused', active: 'border-slate-600 bg-slate-100 text-slate-700' },
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AttendancePage() {
  const [date, setDate] = useState(today());
  const [statuses, setStatuses] = useState<Record<number, AttendanceStatus>>({});

  const { data: studentsData, isLoading: studentsLoading } = useStudents({
    status: 'active',
    per_page: 500,
  });

  const { data: existingData, isLoading: existingLoading } = useAttendanceList({
    date,
    per_page: 500,
  });

  const students = useMemo(() => studentsData?.results || [], [studentsData]);
  const existingMap = useMemo(() => {
    const map: Record<number, AttendanceStatus> = {};
    for (const record of existingData?.results || []) {
      map[record.student_id] = record.status;
    }
    return map;
  }, [existingData]);

  useEffect(() => {
    const next: Record<number, AttendanceStatus> = {};
    for (const student of students) {
      next[student.id] = existingMap[student.id] || 'present';
    }
    setStatuses(next);
  }, [students, existingMap]);

  const bulkMutation = useBulkAttendance();

  const setStatus = (studentId: number, status: AttendanceStatus) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const next: Record<number, AttendanceStatus> = {};
    for (const student of students) {
      next[student.id] = 'present';
    }
    setStatuses(next);
  };

  const handleSave = () => {
    const entries = students.map((student) => ({
      student_id: student.id,
      status: statuses[student.id] || 'present',
    }));
    bulkMutation.mutate({ date, entries });
  };

  if (studentsLoading) return <PageSpinner />;

  const savedCount = Object.keys(existingMap).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Register"
        description="Record daily attendance for active students"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Attendance' }]}
        actions={
          <>
            <Button variant="outline" onClick={markAllPresent}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark All Present
            </Button>
            <Button onClick={handleSave} loading={bulkMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              Save Attendance
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Register</CardTitle>
            <CardDescription>
              {students.length} active student(s) · {savedCount} already recorded
            </CardDescription>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex h-10 w-44 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </CardHeader>
        <CardContent>
          {existingLoading ? (
            <PageSpinner />
          ) : students.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              No active students to mark. Create a student first.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {students.map((student) => (
                <div key={student.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-xs font-medium text-brand-700">
                      {student.photo_url ? (
                        <img src={student.photo_url} alt={student.full_name} className="h-full w-full object-cover" />
                      ) : (
                        getInitials(student.first_name, student.last_name)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{student.full_name}</p>
                      <p className="text-xs text-slate-500">
                        {student.student_id} · {student.grade || 'No grade'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_OPTIONS.map((option) => {
                      const selected = statuses[student.id] === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setStatus(student.id, option.value)}
                          className={cn(
                            'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                            selected
                              ? option.active
                              : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                          )}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
