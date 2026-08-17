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
import { BarChart3 } from 'lucide-react';

export interface EnrollmentChartData {
  month: string;
  enrollments: number;
}

export interface CourseStatsChartData {
  name: string;
  value: number;
}

export interface CompletionChartData {
  month: string;
  completions: number;
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#94a3b8'];

function ChartEmpty({ label }: { label: string }) {
  return (
    <div className="flex h-[200px] flex-col items-center justify-center text-slate-400">
      <BarChart3 className="mb-2 h-8 w-8" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EnrollmentChart({ data }: { data: EnrollmentChartData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Enrollment Trends</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <ChartEmpty label="No enrollment data yet" />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="enrollments" name="Enrollments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function CourseStatsChart({ data }: { data: CourseStatsChartData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Course Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <ChartEmpty label="No course data yet" />
        ) : (
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  strokeWidth={2}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 min-w-0 space-y-2">
              {data.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="truncate text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CompletionChart({ data }: { data: CompletionChartData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Completion Rate Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <ChartEmpty label="No completion data yet" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="completions"
                name="Completions"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
