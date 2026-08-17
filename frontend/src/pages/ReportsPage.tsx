import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Users, BookOpen, GraduationCap } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function toMonthlyChart(data: Record<string, unknown>[], key: string, label: string) {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({
    name: MONTHS[((item.month as number) - 1) % 12] ?? String(item.month),
    [label]: item[key] ?? item.count ?? 0,
  }));
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState('users');

  const { data: userReport, isLoading: userLoading } = useQuery({
    queryKey: ['report', 'users'],
    queryFn: () => reportsApi.getUserReport(),
    enabled: reportType === 'users',
  });

  const { data: courseReport, isLoading: courseLoading } = useQuery({
    queryKey: ['report', 'courses'],
    queryFn: () => reportsApi.getCourseReport(),
    enabled: reportType === 'courses',
  });

  const { data: enrollmentReport, isLoading: enrollmentLoading } = useQuery({
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
              {userChartData.length > 0 ? (
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
              {courseChartData.length > 0 ? (
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
              {enrollmentChartData.length > 0 ? (
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
    </div>
  );
}
