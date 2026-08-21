import { useState } from 'react';
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
  Legend,
} from 'recharts';
import { BarChart3, Calendar, Users, CalendarCheck } from 'lucide-react';

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

export interface AttendanceSlice {
  name: string;
  value: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
}

const BRAND_COLORS = ['#00E5E5', '#00C8D7', '#0097A7', '#006B75', '#003D42'];
const PIE_COLORS = ['#00E5E5', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#94a3b8'];
const ATTENDANCE_COLORS = { present: '#10b981', late: '#f59e0b', absent: '#ef4444', excused: '#8b5cf6', total: '#94a3b8' };

type DateRange = '7d' | '30d' | '90d' | '12m';

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '12m', label: '12 months' },
];

function filterByRange<T extends { month?: string }>(data: T[], range: DateRange): T[] {
  if (range === '12m') return data;
  const monthCount = range === '7d' ? 1 : range === '30d' ? 3 : 6;
  return data.slice(-monthCount);
}

function DateRangeSelector({ value, onChange }: { value: DateRange; onChange: (v: DateRange) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
      {DATE_RANGE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            value === opt.value
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ChartEmpty({ label }: { label: string }) {
  return (
    <div className="flex h-[200px] flex-col items-center justify-center text-slate-400">
      <BarChart3 className="mb-2 h-8 w-8" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
}

export function EnrollmentChart({ data }: { data: EnrollmentChartData[] }) {
  const [range, setRange] = useState<DateRange>('12m');
  const filtered = filterByRange(data, range);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Enrollment Trends</CardTitle>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5" />
          <DateRangeSelector value={range} onChange={setRange} />
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <ChartEmpty label="No enrollment data yet" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={filtered} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="enrollments" name="Enrollments" fill="#00E5E5" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function CourseStatsChart({ data }: { data: CourseStatsChartData[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

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
            <div className="relative shrink-0">
              <ResponsiveContainer width={220} height={220}>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    strokeWidth={3}
                    stroke="#fff"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-900">{total}</span>
                <span className="text-xs text-slate-500">total</span>
              </div>
            </div>
            <div className="flex-1 min-w-0 space-y-2.5">
              {data.map((item, index) => {
                const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                        />
                        <span className="truncate text-slate-600">{item.name}</span>
                      </div>
                      <span className="font-semibold text-slate-900 tabular-nums">{item.value}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CompletionChart({ data }: { data: CompletionChartData[] }) {
  const [range, setRange] = useState<DateRange>('12m');
  const filtered = filterByRange(data, range);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Completion Rate Trend</CardTitle>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5" />
          <DateRangeSelector value={range} onChange={setRange} />
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <ChartEmpty label="No completion data yet" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={filtered} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="completions"
                name="Completions"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4, stroke: '#fff' }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function AttendanceDoughnut({ data }: { data: AttendanceSlice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <CalendarCheck className="h-4 w-4 text-brand-600" />
        <CardTitle className="text-base">Today&apos;s Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <ChartEmpty label="No attendance data today" />
        ) : (
          <div className="flex items-center gap-6">
            <div className="relative shrink-0">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={data.filter((d) => d.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={75}
                    strokeWidth={3}
                    stroke="#fff"
                  >
                    {data.filter((d) => d.value > 0).map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={ATTENDANCE_COLORS[entry.name as keyof typeof ATTENDANCE_COLORS] ?? '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-900">{total}</span>
                <span className="text-[10px] text-slate-500">total</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {data.filter((d) => d.value > 0).map((item) => {
                const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                const color = ATTENDANCE_COLORS[item.name as keyof typeof ATTENDANCE_COLORS] ?? '#94a3b8';
                return (
                  <div key={item.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-sm text-slate-600 capitalize">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                      <span className="text-xs text-slate-400">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function UserRolesPie({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <Users className="h-4 w-4 text-brand-600" />
        <CardTitle className="text-base">Users by Role</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <ChartEmpty label="No user role data" />
        ) : (
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="relative shrink-0">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={68}
                    strokeWidth={3}
                    stroke="#fff"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`role-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-900">{total}</span>
                <span className="text-[10px] text-slate-500">users</span>
              </div>
            </div>
            <div className="flex-1 min-w-0 max-h-[180px] overflow-y-auto space-y-1.5 pr-1">
              {data.map((item, index) => {
                const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                const color = PIE_COLORS[index % PIE_COLORS.length];
                return (
                  <div key={item.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                      <span className="truncate text-sm text-slate-600 capitalize">{item.name.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                      <span className="text-xs text-slate-400">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function EnrollmentByLevelBar({ data }: { data: { name: string; value: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Enrollments by Level</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <ChartEmpty label="No enrollment level data" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Enrollments" radius={[6, 6, 0, 0]} maxBarSize={56}>
                {data.map((_, index) => (
                  <Cell key={`level-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function RevenueChart({ data }: { data: { year: number; month: number; total: number }[] }) {
  const [range, setRange] = useState<DateRange>('12m');
  const chartData = data
    .map((d) => ({ month: `${MONTHS[d.month - 1]} ${d.year}`, revenue: d.total }))
    .filter((_, i, arr) => {
      if (range === '12m') return true;
      const months = range === '7d' ? 1 : range === '30d' ? 3 : 6;
      return i >= arr.length - months;
    });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Revenue Trend</CardTitle>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5" />
          <DateRangeSelector value={range} onChange={setRange} />
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <ChartEmpty label="No revenue data yet" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5E5" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#00C8D7" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
                      <p className="text-xs font-medium text-slate-500">{label}</p>
                      <p className="text-sm font-semibold text-slate-900">
                        KES {payload[0].value?.toLocaleString()}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="revenue" name="Revenue" fill="url(#revenueGradient)" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
