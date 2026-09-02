import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { reportsApi, reportsGeneratedApi } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Users, BookOpen, GraduationCap, FileText, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

function toMonthlyChart(data: Record<string, unknown>[], key: string, label: string) {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({
    name: ['January','February','March','April','May','June','July','August','September','October','November','December'][((item.month as number) - 1) % 12] ?? String(item.month),
    [label]: item[key] ?? item.count ?? 0,
  }));
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState('users');
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());

  const { data: generatedReports } = useQuery({
    queryKey: ['reports', 'generated', genMonth, genYear],
    queryFn: () => reportsGeneratedApi.listGenerated({ month: genMonth, year: genYear }),
  });

  const generateMutation = useMutation({
    mutationFn: () => reportsGeneratedApi.generateReport({ month: genMonth, year: genYear }),
    onSuccess: () => {
      toast.success('Report generated successfully');
    },
    onError: () => {
      toast.error('Failed to generate report');
    },
  });

  const handleDownload = async (reportId: number) => {
    try {
      const blob = await reportsGeneratedApi.downloadReport(reportId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download report');
    }
  };

  const { data: userReport, isLoading: userLoading, isError: userError } = useQuery({
    queryKey: ['report', 'users'],
    queryFn: () => reportsApi.getUserReport(),
    enabled: reportType === 'users',
  });

  const { data: courseReport, isLoading: courseLoading, isError: courseError } = useQuery({
    queryKey: ['report', 'courses'],
    queryFn: () => reportsApi.getCourseReport(),
    enabled: reportType === 'courses',
  });

  const { data: enrollmentReport, isLoading: enrollmentLoading, isError: enrollmentError } = useQuery({
    queryKey: ['report', 'enrollments'],
    queryFn: () => reportsApi.getEnrollmentReport(),
    enabled: reportType === 'enrollments',
  });

  const isLoading = userLoading || courseLoading || enrollmentLoading;

  const userData = (userReport as Record<string, unknown>) ?? {};
  const userChartData = toMonthlyChart(
    (userData.monthly as Record<string, unknown>[]) ?? [],
    'count',
    'users'
  );

  const courseData = (courseReport as Record<string, unknown>) ?? {};
  const courseChartData = toMonthlyChart(
    (courseData.monthly as Record<string, unknown>[]) ?? [],
    'count',
    'courses'
  );

  const enrollmentData = (enrollmentReport as Record<string, unknown>) ?? {};
  const enrollmentChartData = toMonthlyChart(
    (enrollmentData.monthly as Record<string, unknown>[]) ?? [],
    'count',
    'enrollments'
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Analytics and insights"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Reports' }]}
      />

      <Tabs value={reportType} onValueChange={setReportType}>
        <TabsList>
          <TabsTrigger value="users" className="gap-1.5">
            <Users className="h-4 w-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-1.5">
            <BookOpen className="h-4 w-4" /> Courses
          </TabsTrigger>
          <TabsTrigger value="enrollments" className="gap-1.5">
            <GraduationCap className="h-4 w-4" /> Enrollments
          </TabsTrigger>
        </TabsList>

        {isLoading && <PageSpinner />}

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Growth Report</CardTitle>
            </CardHeader>
            <CardContent>
              {userError ? (
                <p className="text-center py-8 text-red-500">Failed to load user report. Please try again.</p>
              ) : userChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center py-8 text-slate-500">No data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Course Performance Report</CardTitle>
            </CardHeader>
            <CardContent>
              {courseError ? (
                <p className="text-center py-8 text-red-500">Failed to load course report. Please try again.</p>
              ) : courseChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={courseChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="courses" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center py-8 text-slate-500">No data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollments">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Report</CardTitle>
            </CardHeader>
            <CardContent>
              {enrollmentError ? (
                <p className="text-center py-8 text-red-500">Failed to load enrollment report. Please try again.</p>
              ) : enrollmentChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={enrollmentChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="enrollments" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center py-8 text-slate-500">No data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generated Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Generated Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
              <select
                value={genMonth}
                onChange={(e) => setGenMonth(Number(e.target.value))}
                className="flex h-10 w-32 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
              <select
                value={genYear}
                onChange={(e) => setGenYear(Number(e.target.value))}
                className="flex h-10 w-24 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="gap-2"
            >
              {generateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              {generateMutation.isPending ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>

          {generatedReports?.results && generatedReports.results.length > 0 ? (
            <div className="space-y-2">
              {generatedReports.results.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {['January','February','March','April','May','June','July','August','September','October','November','December'][(report.month - 1) % 12]} {report.year} Report
                      </p>
                      {report.created_at && (
                        <p className="text-xs text-slate-500">
                          Generated {formatDate(report.created_at)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={report.status === 'ready' ? 'default' : 'secondary'}>
                      {report.status ?? 'ready'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(report.id)}
                      className="gap-1"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No reports generated"
              description="Select a month and year, then click Generate to create a report."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
