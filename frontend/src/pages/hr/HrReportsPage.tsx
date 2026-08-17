import { useState } from 'react';
import {
  useHeadcountReport,
  useLeaveReport,
  useAttendanceReport,
  usePayrollReport,
  useExportEmployees,
  useExportLeave,
  useExportAttendance,
  useExportEmployeesPdf,
  useExportLeavePdf,
  useExportAttendancePdf,
} from '@/hooks/useHr';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Download, FileText, BarChart3 } from 'lucide-react';

const formatKsh = (v: number | string | undefined) =>
  'KSh ' + Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Breakdown({ title, data }: { title: string; data: Record<string, number> | undefined }) {
  const entries = Object.entries(data ?? {});
  if (entries.length === 0) return null;
  return (
    <div>
      <h4 className="text-sm font-medium text-slate-900">{title}</h4>
      <ul className="mt-2 space-y-1.5">
        {entries.map(([key, value]) => (
          <li key={key} className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{key.replace(/_/g, ' ')}</span>
            <span className="font-medium text-slate-900">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function startOfMonth(): string {
  return new Date().toISOString().slice(0, 8) + '01';
}

export default function HrReportsPage() {
  const [tab, setTab] = useState('headcount');
  const [leaveFrom, setLeaveFrom] = useState(startOfMonth());
  const [leaveTo, setLeaveTo] = useState(today());
  const [attFrom, setAttFrom] = useState(startOfMonth());
  const [attTo, setAttTo] = useState(today());
  const [payrollMonth, setPayrollMonth] = useState(new Date().toISOString().slice(0, 7));

  const { data: headcount, isLoading: headcountLoading } = useHeadcountReport();
  const { data: leave, isLoading: leaveLoading } = useLeaveReport({ from: leaveFrom, to: leaveTo });
  const { data: attendance, isLoading: attendanceLoading } = useAttendanceReport({ from: attFrom, to: attTo });
  const { data: payroll, isLoading: payrollLoading } = usePayrollReport({ month: payrollMonth });

  const exportEmployees = useExportEmployees();
  const exportEmployeesPdf = useExportEmployeesPdf();
  const exportLeave = useExportLeave();
  const exportLeavePdf = useExportLeavePdf();
  const exportAttendance = useExportAttendance();
  const exportAttendancePdf = useExportAttendancePdf();

  return (
    <div className="space-y-6">
      <PageHeader
        title="HR Reports"
        description="Headcount, leave, attendance and payroll reports"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'HR', href: '/hr' }, { label: 'Reports' }]}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="headcount">Headcount</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="headcount">
          {headcountLoading ? (
            <PageSpinner />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Total employees: <span className="font-semibold text-slate-900">{headcount?.total ?? 0}</span></p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => exportEmployees.mutate(undefined)} loading={exportEmployees.isPending}>
                    <Download className="mr-1 h-4 w-4" /> Export CSV
                  </Button>
                  <Button variant="outline" onClick={() => exportEmployeesPdf.mutate(undefined)} loading={exportEmployeesPdf.isPending}>
                    <FileText className="mr-1 h-4 w-4" /> Export PDF
                  </Button>
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                <Card>
                  <CardContent className="p-5">
                    <Breakdown title="By department" data={headcount?.by_department} />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <Breakdown title="By status" data={headcount?.by_status} />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <Breakdown title="By employment type" data={headcount?.by_type} />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="leave">
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div>
              <Label>From</Label>
              <Input type="date" value={leaveFrom} onChange={(e) => setLeaveFrom(e.target.value)} className="w-40" />
            </div>
            <div>
              <Label>To</Label>
              <Input type="date" value={leaveTo} onChange={(e) => setLeaveTo(e.target.value)} className="w-40" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => exportLeave.mutate({ from: leaveFrom, to: leaveTo })} loading={exportLeave.isPending}>
                <Download className="mr-1 h-4 w-4" /> Export CSV
              </Button>
              <Button variant="outline" onClick={() => exportLeavePdf.mutate({ from: leaveFrom, to: leaveTo })} loading={exportLeavePdf.isPending}>
                <FileText className="mr-1 h-4 w-4" /> Export PDF
              </Button>
            </div>
          </div>
          {leaveLoading ? (
            <PageSpinner />
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardContent className="p-5">
                  <h4 className="text-sm font-medium text-slate-900">Summary</h4>
                  <div className="mt-3 space-y-2 text-sm">
                    <p className="flex justify-between"><span className="text-slate-600">Total requests</span><span className="font-medium">{leave?.total_requests ?? 0}</span></p>
                    <p className="flex justify-between"><span className="text-slate-600">Approved days</span><span className="font-medium">{leave?.approved_days ?? 0}</span></p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <Breakdown title="By type" data={leave?.by_type} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <Breakdown title="By status" data={leave?.by_status} />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="attendance">
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div>
              <Label>From</Label>
              <Input type="date" value={attFrom} onChange={(e) => setAttFrom(e.target.value)} className="w-40" />
            </div>
            <div>
              <Label>To</Label>
              <Input type="date" value={attTo} onChange={(e) => setAttTo(e.target.value)} className="w-40" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => exportAttendance.mutate({ from: attFrom, to: attTo })} loading={exportAttendance.isPending}>
                <Download className="mr-1 h-4 w-4" /> Export CSV
              </Button>
              <Button variant="outline" onClick={() => exportAttendancePdf.mutate({ from: attFrom, to: attTo })} loading={exportAttendancePdf.isPending}>
                <FileText className="mr-1 h-4 w-4" /> Export PDF
              </Button>
            </div>
          </div>
          {attendanceLoading ? (
            <PageSpinner />
          ) : !attendance || attendance.staff.length === 0 ? (
            <EmptyState icon={BarChart3} title="No attendance records" description="No records found for the selected range." />
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                        <th className="px-4 py-3">Employee</th>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3">Present</th>
                        <th className="px-4 py-3">Late</th>
                        <th className="px-4 py-3">Absent</th>
                        <th className="px-4 py-3">Half day</th>
                        <th className="px-4 py-3">Leave</th>
                        <th className="px-4 py-3">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attendance.staff.map((row) => (
                        <tr key={row.employee_id}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-900">{row.employee_name}</p>
                            <p className="text-xs text-slate-500">{row.employee_code}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{row.department}</td>
                          <td className="px-4 py-3 text-slate-700">{row.present}</td>
                          <td className="px-4 py-3 text-slate-700">{row.late}</td>
                          <td className="px-4 py-3 text-slate-700">{row.absent}</td>
                          <td className="px-4 py-3 text-slate-700">{row.half_day}</td>
                          <td className="px-4 py-3 text-slate-700">{row.leave}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{row.rate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payroll">
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div>
              <Label>Month</Label>
              <Input type="month" value={payrollMonth} onChange={(e) => setPayrollMonth(e.target.value)} className="w-40" />
            </div>
          </div>
          {payrollLoading ? (
            <PageSpinner />
          ) : !payroll || payroll.payrolls.length === 0 ? (
            <EmptyState icon={BarChart3} title="No payrolls" description="No payrolls found for the selected month." />
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="p-5">
                    <p className="text-sm text-slate-500">Gross</p>
                    <p className="mt-1 text-xl font-bold text-slate-900">{formatKsh(payroll.totals.gross)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <p className="text-sm text-slate-500">Deductions</p>
                    <p className="mt-1 text-xl font-bold text-slate-900">{formatKsh(payroll.totals.deductions)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <p className="text-sm text-slate-500">Net</p>
                    <p className="mt-1 text-xl font-bold text-slate-900">{formatKsh(payroll.totals.net)}</p>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Payrolls</CardTitle>
                  <CardDescription>All payroll runs for {payrollMonth}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                          <th className="px-4 py-3">Payroll</th>
                          <th className="px-4 py-3">Month</th>
                          <th className="px-4 py-3">Gross</th>
                          <th className="px-4 py-3">Net</th>
                          <th className="px-4 py-3">Employees</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payroll.payrolls.map((p) => (
                          <tr key={p.id}>
                            <td className="px-4 py-3 font-mono font-medium text-slate-900">{p.payroll_no}</td>
                            <td className="px-4 py-3 text-slate-600">{p.month}</td>
                            <td className="px-4 py-3 text-slate-700">{formatKsh(p.gross_total)}</td>
                            <td className="px-4 py-3 text-slate-900">{formatKsh(p.net_total)}</td>
                            <td className="px-4 py-3 text-slate-700">{p.employees}</td>
                            <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
