import { useMemo, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { useAttendanceReport } from '@/hooks/useAttendances';
import { useStudentGrades } from '@/hooks/useStudents';
import { useDebounce } from '@/hooks/useDebounce';
import { downloadBlob, sisExports, getErrorMessage } from '@/lib/studentsApi';
import type { AttendanceReportRow } from '@/types/students';

function monthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AttendanceReportPage() {
  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(today());
  const [grade, setGrade] = useState('all');
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const debouncedSearch = useDebounce(search);
  const { data: grades } = useStudentGrades();

  const params = useMemo(() => {
    const p: Record<string, string | number | boolean> = { from, to };
    if (debouncedSearch) p.search = debouncedSearch;
    if (grade !== 'all') p.grade = grade;
    return p;
  }, [from, to, grade, debouncedSearch]);

  const { data, isLoading } = useAttendanceReport(params);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await sisExports.attendance({
        from,
        to,
        search: debouncedSearch || undefined,
        grade: grade === 'all' ? undefined : grade,
      });
      downloadBlob(blob, `attendance-${from}-to-${to}.csv`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const blob = await sisExports.attendancePdf({
        from,
        to,
        search: debouncedSearch || undefined,
        grade: grade === 'all' ? undefined : grade,
      });
      downloadBlob(blob, `attendance-${from}-to-${to}.pdf`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExportingPdf(false);
    }
  };

  const columns: Column<AttendanceReportRow>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (item) => (
        <div>
          <p className="font-medium text-slate-900">{item.student}</p>
          <p className="text-xs text-slate-500">{item.student_code}</p>
        </div>
      ),
    },
    {
      key: 'grade',
      header: 'Grade',
      render: (item) => <span className="text-sm text-slate-600">{item.grade || '—'}</span>,
    },
    {
      key: 'guardian',
      header: 'Guardian',
      render: (item) => <span className="text-sm text-slate-600">{item.guardian || '—'}</span>,
    },
    {
      key: 'present',
      header: 'Present',
      render: (item) => <span className="text-sm font-medium text-emerald-600">{item.present}</span>,
    },
    {
      key: 'late',
      header: 'Late',
      render: (item) => <span className="text-sm font-medium text-amber-600">{item.late}</span>,
    },
    {
      key: 'absent',
      header: 'Absent',
      render: (item) => <span className="text-sm font-medium text-red-600">{item.absent}</span>,
    },
    {
      key: 'excused',
      header: 'Excused',
      render: (item) => <span className="text-sm font-medium text-slate-600">{item.excused}</span>,
    },
    {
      key: 'rate',
      header: 'Rate',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${Math.min(item.rate, 100)}%` }}
            />
          </div>
          <span className="text-xs font-medium text-slate-600">{item.rate}%</span>
        </div>
      ),
    },
  ];

  const totals = data?.totals;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Report"
        description="Summary of attendance across a date range"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Attendance' }, { label: 'Report' }]}
        actions={
          <>
            <Button variant="outline" loading={exporting} onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" loading={exportingPdf} onClick={handleExportPdf}>
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Grade</label>
              <SelectRoot value={grade} onValueChange={setGrade}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {(grades || []).map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {totals && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-2xl font-bold text-emerald-700">{totals.present}</p>
            <p className="text-sm text-emerald-600">Present</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-2xl font-bold text-amber-700">{totals.late}</p>
            <p className="text-sm text-amber-600">Late</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-2xl font-bold text-red-700">{totals.absent}</p>
            <p className="text-sm text-red-600">Absent</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-2xl font-bold text-slate-700">{totals.excused}</p>
            <p className="text-sm text-slate-600">Excused</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <PageSpinner />
      ) : (
        <DataTable
          columns={columns}
          data={data?.students || []}
          totalCount={data?.records_count || 0}
          searchable={false}
          emptyTitle="No attendance data"
          emptyDescription="No records found for the selected date range."
        />
      )}
    </div>
  );
}
