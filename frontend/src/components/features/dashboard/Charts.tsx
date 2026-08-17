import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const enrollmentData = [
  { month: 'Jan', enrollments: 45 },
  { month: 'Feb', enrollments: 62 },
  { month: 'Mar', enrollments: 78 },
  { month: 'Apr', enrollments: 56 },
  { month: 'May', enrollments: 89 },
  { month: 'Jun', enrollments: 95 },
  { month: 'Jul', enrollments: 110 },
  { month: 'Aug', enrollments: 125 },
];

const courseStatsData = [
  { name: 'Web Dev', value: 35, color: '#3b82f6' },
  { name: 'Data Science', value: 25, color: '#10b981' },
  { name: 'Mobile', value: 20, color: '#f59e0b' },
  { name: 'DevOps', value: 15, color: '#8b5cf6' },
  { name: 'Other', value: 5, color: '#94a3b8' },
];

const completionTrend = [
  { week: 'W1', rate: 65 },
  { week: 'W2', rate: 68 },
  { week: 'W3', rate: 72 },
  { week: 'W4', rate: 70 },
  { week: 'W5', rate: 75 },
  { week: 'W6', rate: 78 },
  { week: 'W7', rate: 82 },
  { week: 'W8', rate: 85 },
];

export function EnrollmentChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Enrollment Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={enrollmentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="enrollments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function CourseStatsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Course Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <ResponsiveContainer width="50%" height={200}>
            <PieChart>
              <Pie
                data={courseStatsData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                strokeWidth={2}
              >
                {courseStatsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 flex-1">
            {courseStatsData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CompletionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Completion Rate Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={completionTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} domain={[60, 90]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
