import { useMemo, useState } from 'react';
import {
  useAnalyticsOverview,
  useAnalyticsFilterOptions,
  useAttendanceAnalytics,
  useBranchAnalytics,
  useCompetitionAnalytics,
  useCourseAnalytics,
  useEnrollmentAnalytics,
  useProgressAnalytics,
  useRevenueAnalytics,
  useTeacherAnalytics,
} from '@/hooks/useAnalytics';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { ChartCard } from '@/components/charts/ChartCard';
import { BarChartCard } from '@/components/charts/BarChartCard';
import { LineChartCard } from '@/components/charts/LineChartCard';
import { PieChartCard } from '@/components/charts/PieChartCard';
import {
  Users,
  Wallet,
  AlertTriangle,
  GraduationCap,
  CalendarCheck,
  Trophy,
  BookOpen,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import type { AnalyticsFilters } from '@/types/analytics';

const formatMoney = (value?: number) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value ?? 0);

const monthLabel = (ym: string) => {
  const [y, m] = ym.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[Number(m) - 1]} ${y}`;
};

const toChartArray = (record?: Record<string, number>) =>
  Object.entries(record ?? {}).map(([key, value]) => ({ name: key, value }));

export default function AnalyticsDashboardPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [draftFrom, setDraftFrom] = useState('');
  const [draftTo, setDraftTo] = useState('');
  const [draftBranch, setDraftBranch] = useState('all');
  const [tab, setTab] = useState('overview');

  const { data: filterOptions } = useAnalyticsFilterOptions();

  const overview = useAnalyticsOverview(filters);
  const enrollments = useEnrollmentAnalytics(filters);
  const revenue = useRevenueAnalytics(filters);
  const attendance = useAttendanceAnalytics(filters);
  const courses = useCourseAnalytics(filters);
  const teachers = useTeacherAnalytics(filters);
  const competitions = useCompetitionAnalytics(filters);
  const branches = useBranchAnalytics(filters);
  const progress = useProgressAnalytics(filters);

  const activeQuery = {
    overview: overview,
    enrollments: enrollments,
    revenue: revenue,
    attendance: attendance,
    courses: courses,
    teachers: teachers,
    competitions: competitions,
    branches: branches,
    progress: progress,
  }[tab];

  const applyFilters = () => {
    setFilters({
      from: draftFrom || undefined,
      to: draftTo || undefined,
      branch: draftBranch === 'all' ? undefined : draftBranch,
    });
  };

  const clearFilters = () => {
    setDraftFrom('');
    setDraftTo('');
    setDraftBranch('all');
    setFilters({});
  };

  const enrollmentMonthly = useMemo(
    () => Object.entries(enrollments.data?.monthly ?? {}).map(([k, v]) => ({ name: monthLabel(k), value: v })),
    [enrollments.data]
  );

  const revenueMonthly = useMemo(
    () => Object.entries(revenue.data?.monthly ?? {}).map(([k, v]) => ({ name: monthLabel(k), value: v })),
    [revenue.data]
  );

  const attendanceDaily = useMemo(
    () => (attendance.data?.daily ?? []).map((d) => ({ name: d.date.slice(5), rate: d.rate })),
    [attendance.data]
  );

  const topCoursesData = useMemo(
    () => (courses.data?.top_courses ?? []).map((c) => ({ name: c.title, value: c.enrollments })),
    [courses.data]
  );

  const teacherData = useMemo(
    () => (teachers.data ?? []).map((t) => ({ name: t.name, enrollments: t.enrollments, completion: t.completion_rate })),
    [teachers.data]
  );

  const branchData = useMemo(
    () => (branches.data?.branches ?? []).map((b) => ({ name: b.branch, students: b.students, revenue: b.revenue })),
    [branches.data]
  );

  const progressData = useMemo(
    () => Object.entries(progress.data?.buckets ?? {}).map(([k, v]) => ({ name: k, value: v })),
    [progress.data]
  );

  const hasFilters = !!(filters.from || filters.to || filters.branch);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics Dashboard"
        description="Institutional insights across students, revenue, attendance and performance"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Analytics' }]}
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="an-from" className="text-xs">From</Label>
            <Input id="an-from" type="date" value={draftFrom} onChange={(e) => setDraftFrom(e.target.value)} className="w-[160px]" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="an-to" className="text-xs">To</Label>
            <Input id="an-to" type="date" value={draftTo} onChange={(e) => setDraftTo(e.target.value)} className="w-[160px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Branch</Label>
            <SelectRoot value={draftBranch} onValueChange={setDraftBranch}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All branches</SelectItem>
                {(filterOptions?.branches ?? []).map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>
          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              Apply
            </button>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reset
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Overview KPI cards */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard icon={Users} title="Total Students" value={overview.data?.total_students ?? 0} />
          <StatsCard icon={GraduationCap} title="Enrollments" value={overview.data?.total_enrollments ?? 0} />
          <StatsCard icon={Wallet} title="Revenue" value={formatMoney(overview.data?.total_revenue)} />
          <StatsCard icon={AlertTriangle} title="Outstanding Fees" value={formatMoney(overview.data?.outstanding_fees)} />
          <StatsCard icon={BookOpen} title="Course Completion" value={`${overview.data?.completion_rate ?? 0}%`} />
          <StatsCard icon={CalendarCheck} title="Attendance Rate" value={`${overview.data?.attendance_rate ?? 0}%`} />
          <StatsCard icon={Trophy} title="Active Competitions" value={overview.data?.active_competitions ?? 0} />
          <StatsCard icon={BookOpen} title="Total Courses" value={overview.data?.total_courses ?? 0} />
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        {activeQuery?.isLoading && <PageSpinner />}

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Monthly Enrollments" subtitle="New enrollments per month">
              <BarChartCard data={enrollmentMonthly} dataKey="value" color="#4f46e5" />
            </ChartCard>
            <ChartCard title="Monthly Revenue" subtitle="Payments received per month">
              <BarChartCard data={revenueMonthly} dataKey="value" color="#10b981" />
            </ChartCard>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Enrollment Status" subtitle="Active vs completed enrollments">
              <PieChartCard data={toChartArray(enrollments.data?.by_status)} />
            </ChartCard>
            <ChartCard title="Attendance Trend" subtitle="Daily attendance rate over the period">
              <LineChartCard data={attendanceDaily} dataKey="rate" color="#06b6d4" />
            </ChartCard>
          </div>
        </TabsContent>

        {/* Enrollments */}
        <TabsContent value="enrollments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Monthly Enrollment Trend" subtitle={`Total: ${enrollments.data?.total ?? 0}`}>
              <BarChartCard data={enrollmentMonthly} dataKey="value" color="#4f46e5" />
            </ChartCard>
            <ChartCard title="Enrollments by Status">
              <PieChartCard data={toChartArray(enrollments.data?.by_status)} />
            </ChartCard>
          </div>
          <ChartCard title="Enrollments by Grade" subtitle="Students and enrollments per grade">
            <div className="space-y-3">
              {Object.entries(enrollments.data?.by_grade ?? {}).map(([grade, info]) => (
                <div key={grade} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-2.5">
                  <span className="text-sm font-medium text-slate-800">{grade}</span>
                  <span className="text-sm text-slate-500">
                    {info.students} student(s) · {info.enrollments} enrollment(s)
                  </span>
                </div>
              ))}
              {Object.keys(enrollments.data?.by_grade ?? {}).length === 0 && (
                <p className="text-sm text-slate-500">No grade data available.</p>
              )}
            </div>
          </ChartCard>
        </TabsContent>

        {/* Revenue */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard icon={Wallet} title="Total Revenue" value={formatMoney(revenue.data?.total)} />
            <StatsCard icon={AlertTriangle} title="Outstanding Fees" value={formatMoney(revenue.data?.outstanding_total)} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Revenue by Month" subtitle="Collected payments per month">
              <BarChartCard data={revenueMonthly} dataKey="value" color="#10b981" />
            </ChartCard>
            <ChartCard title="Revenue by Payment Method">
              <PieChartCard data={toChartArray(revenue.data?.by_method)} />
            </ChartCard>
          </div>
          <ChartCard title="Outstanding by Invoice Status">
            <PieChartCard data={toChartArray(revenue.data?.outstanding)} />
          </ChartCard>
        </TabsContent>

        {/* Attendance */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard icon={CalendarCheck} title="Attendance Rate" value={`${attendance.data?.rate ?? 0}%`} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Daily Attendance Rate" subtitle="Percentage present or late per day">
              <LineChartCard data={attendanceDaily} dataKey="rate" color="#06b6d4" domain={[0, 100]} />
            </ChartCard>
            <ChartCard title="Attendance by Status">
              <PieChartCard data={toChartArray(attendance.data?.by_status)} />
            </ChartCard>
          </div>
        </TabsContent>

        {/* Courses */}
        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard icon={BookOpen} title="Completion Rate" value={`${courses.data?.completion_rate ?? 0}%`} />
            <StatsCard icon={GraduationCap} title="Total Enrollments" value={courses.data?.total_enrollments ?? 0} />
            <StatsCard icon={BookOpen} title="Completed" value={courses.data?.completed ?? 0} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Most Popular Courses" subtitle="Enrollments per top course">
              <BarChartCard data={topCoursesData} dataKey="value" color="#8b5cf6" />
            </ChartCard>
            <ChartCard title="Top Courses by Completion" subtitle="Completion rate of the most popular courses">
              <div className="space-y-3">
                {(courses.data?.top_courses ?? []).slice(0, 6).map((c) => (
                  <div key={c.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate pr-2 text-slate-700">{c.title}</span>
                      <span className="font-medium">{c.completion_rate}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-brand-600"
                        style={{ width: `${Math.min(c.completion_rate, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </TabsContent>

        {/* Teachers */}
        <TabsContent value="teachers" className="space-y-6">
          <ChartCard title="Teacher Performance" subtitle="Courses, enrollments and completion per instructor">
            <div className="space-y-4">
              {teacherData.map((t) => (
                <div key={t.name} className="rounded-lg border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <Badge variant="secondary">{t.completion}% completion</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-slate-50 p-2">
                      <p className="text-lg font-bold text-slate-900">{t.enrollments}</p>
                      <p className="text-xs text-slate-500">Enrollments</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                      <p className="text-lg font-bold text-slate-900">{t.completion}</p>
                      <p className="text-xs text-slate-500">Rate (%)</p>
                    </div>
                  </div>
                </div>
              ))}
              {teacherData.length === 0 && <p className="text-sm text-slate-500">No instructor data available.</p>}
            </div>
          </ChartCard>
        </TabsContent>

        {/* Competitions */}
        <TabsContent value="competitions" className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard icon={Trophy} title="Competitions" value={competitions.data?.total_competitions ?? 0} />
            <StatsCard icon={Trophy} title="Teams" value={competitions.data?.total_teams ?? 0} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Competitions by Type">
              <PieChartCard data={toChartArray(competitions.data?.by_type)} />
            </ChartCard>
            <ChartCard title="Teams by Status">
              <PieChartCard data={toChartArray(competitions.data?.by_status)} />
            </ChartCard>
          </div>
          <ChartCard title="Participation by Competition">
            <div className="space-y-3">
              {(competitions.data?.competitions ?? []).map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.type} · {c.status}</p>
                  </div>
                  <span className="text-sm text-slate-600">{c.teams} team(s) · {c.participants} participant(s)</span>
                </div>
              ))}
              {(competitions.data?.competitions ?? []).length === 0 && (
                <p className="text-sm text-slate-500">No competitions yet.</p>
              )}
            </div>
          </ChartCard>
        </TabsContent>

        {/* Branches */}
        <TabsContent value="branches" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Students by Branch">
              <BarChartCard data={branchData} dataKey="students" color="#f59e0b" />
            </ChartCard>
            <ChartCard title="Revenue by Branch">
              <BarChartCard data={branchData} dataKey="revenue" color="#10b981" />
            </ChartCard>
          </div>
          <ChartCard title="Branch Performance Details" subtitle={`${branches.data?.total_branches ?? 0} branch(es)`}>
            <div className="space-y-3">
              {(branches.data?.branches ?? []).map((b) => (
                <div key={b.branch} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{b.branch}</p>
                    <p className="text-xs text-slate-500">
                      {b.students} students · {b.active} active
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatMoney(b.revenue)}</p>
                    <p className="text-xs text-slate-500">{b.attendance_rate}% attendance</p>
                  </div>
                </div>
              ))}
              {(branches.data?.branches ?? []).length === 0 && (
                <p className="text-sm text-slate-500">No branch data available.</p>
              )}
            </div>
          </ChartCard>
        </TabsContent>

        {/* Progress */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard icon={GraduationCap} title="Enrollments Tracked" value={progress.data?.total ?? 0} />
            <StatsCard icon={BookOpen} title="Completed" value={progress.data?.completed ?? 0} />
            <StatsCard icon={BarChart3} title="Avg Progress" value={`${progress.data?.average_progress ?? 0}%`} />
          </div>
          <ChartCard title="Student Progress Distribution" subtitle="How far learners get through their courses">
            <div className="flex items-center gap-8">
              <div className="w-[55%]">
                <BarChartCard data={progressData} dataKey="value" color="#4f46e5" />
              </div>
              <div className="flex-1 space-y-2">
                {progressData.map((p) => (
                  <div key={p.name} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{p.name}</span>
                    <span className="font-medium">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
