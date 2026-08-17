import { useMemo, useState } from 'react';
import { useStudentAttendance, useStudentMonthlyAttendance } from '@/hooks/useStudents';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { AttendanceStatusBadge } from '@/components/students/SisBadges';
import { formatDate } from '@/lib/utils';
import type { Attendance } from '@/types/students';

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function AttendanceTab({ studentId }: { studentId: number }) {
  const [month, setMonth] = useState(currentMonth());

  const { data: monthly } = useStudentMonthlyAttendance(studentId, month);
  const { data: records, isLoading } = useStudentAttendance(studentId, { per_page: 20 });

  const summary = useMemo(() => {
    const entry = monthly?.find((m) => m.month === month);
    return {
      present: entry?.present ?? 0,
      late: entry?.late ?? 0,
      absent: entry?.absent ?? 0,
      excused: entry?.excused ?? 0,
      total: entry?.total ?? 0,
    };
  }, [monthly, month]);

  const columns: Column<Attendance>[] = [
    {
      key: 'attendance_date',
      header: 'Date',
      render: (item) => <span className="text-sm text-slate-700">{formatDate(item.attendance_date)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <AttendanceStatusBadge status={item.status} />,
    },
    {
      key: 'check_in',
      header: 'Check In',
      render: (item) => <span className="text-sm text-slate-600">{item.check_in || '—'}</span>,
    },
    {
      key: 'check_out',
      header: 'Check Out',
      render: (item) => <span className="text-sm text-slate-600">{item.check_out || '—'}</span>,
    },
    {
      key: 'note',
      header: 'Note',
      render: (item) => <span className="max-w-[200px] truncate text-sm text-slate-500">{item.note || '—'}</span>,
    },
  ];

  const summaryCards = [
    { label: 'Present', value: summary.present, color: 'text-emerald-600' },
    { label: 'Late', value: summary.late, color: 'text-amber-600' },
    { label: 'Absent', value: summary.absent, color: 'text-red-600' },
    { label: 'Excused', value: summary.excused, color: 'text-slate-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {summaryCards.map((card) => (
            <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-sm text-slate-500">{card.label}</p>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="flex h-10 w-48 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Attendance</CardTitle>
          <CardDescription>
            {summary.total} record(s) in {month}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <PageSpinner />
          ) : (
            <DataTable
              columns={columns}
              data={records?.results || []}
              totalCount={records?.meta.total || 0}
              searchable={false}
              emptyTitle="No attendance records"
              emptyDescription="Attendance will appear here once recorded."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
