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

  const chartData = [
    { name: 'Jan', value: 45 },
    { name: 'Feb', value: 62 },
    { name: 'Mar', value: 78 },
    { name: 'Apr', value: 56 },
    { name: 'May', value: 89 },
    { name: 'Jun', value: 95 },
  ];

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
              {userReport && typeof userReport === 'object' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
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
              {courseReport && typeof courseReport === 'object' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
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
              {enrollmentReport && typeof enrollmentReport === 'object' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
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
