import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  GraduationCap,
  Bell,
  Wallet,
  FileText,
  Code2,
  CalendarDays,
  Receipt,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  useParentSummary,
  useParentFees,
  useParentAppointments,
  usePortalNotifications,
} from '@/hooks/useParentPortal';
import { getInitials } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const quickLinks = [
  { label: 'Attendance', href: '/parent/attendance', icon: CalendarCheck, description: 'Daily attendance and monthly summaries' },
  { label: 'Report Cards', href: '/parent/report-cards', icon: FileText, description: 'Term reports and subject results' },
  { label: 'Coding Progress', href: '/parent/progress', icon: Code2, description: 'Skills, levels and badges' },
  { label: 'Fees', href: '/parent/fees', icon: Wallet, description: 'Fee schedule and online payment' },
  { label: 'Receipts', href: '/parent/receipts', icon: Receipt, description: 'Payment receipts and history' },
  { label: 'Appointments', href: '/parent/appointments', icon: CalendarDays, description: 'Book meetings with teachers' },
  { label: 'Notifications', href: '/parent/notifications', icon: Bell, description: 'Announcements and updates' },
  { label: 'Messages', href: '/chat', icon: MessageSquare, description: 'Chat with your child\'s teachers' },
];

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const { data: summary, isLoading } = useParentSummary();
  const { data: fees } = useParentFees();
  const { data: appointments } = useParentAppointments();
  const { data: notifications } = usePortalNotifications('unread');

  if (isLoading) return <PageSpinner />;

  const students = summary?.students || [];
  const outstanding = (fees || [])
    .filter((fee) => fee.status === 'pending')
    .reduce((sum, fee) => sum + Number(fee.amount), 0);
  const upcoming = (appointments || []).filter(
    (appt) => appt.status === 'pending' || appt.status === 'confirmed'
  ).length;
  const unread = notifications?.meta?.total ?? notifications?.results?.length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parent Portal"
        description="Track attendance, academics, fees and communicate with teachers."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Parent Portal' }]}
      />

      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-lg font-semibold text-white">
            {getInitials(user?.first_name || 'P', user?.last_name || 'P')}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900">
              Welcome back, {user?.first_name || 'Parent'}!
            </h2>
            <p className="text-sm text-slate-500">
              {summary?.guardian
                ? `${summary.guardian.full_name} · ${students.length} registered ${students.length === 1 ? 'child' : 'children'}`
                : 'Stay on top of your child\'s learning journey.'}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard icon={GraduationCap} title="My Children" value={students.length} />
        <StatsCard icon={Wallet} title="Outstanding Fees" value={`$${outstanding.toFixed(2)}`} />
        <StatsCard icon={CalendarCheck} title="Upcoming Appointments" value={upcoming} />
        <StatsCard icon={Bell} title="Unread Notifications" value={unread} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Quick Access
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                to={link.href}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-brand-200 hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                  <Icon className="h-5 w-5 text-brand-600" />
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900">{link.label}</h4>
                  <ArrowRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-brand-600" />
                </div>
                <p className="mt-1 text-xs text-slate-500">{link.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {students.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            My Children
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {students.map((student) => (
              <Card key={student.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-xs font-medium text-brand-700">
                      {student.photo_url ? (
                        <img src={student.photo_url} alt={student.full_name} className="h-full w-full object-cover" />
                      ) : (
                        getInitials(student.first_name, student.last_name)
                      )}
                    </div>
                    <span>{student.full_name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500">
                    {student.student_id} · {[student.grade, student.branch].filter(Boolean).join(' · ') || 'No class assigned'}
                  </p>
                  {typeof student.outstanding_fees === 'number' && student.outstanding_fees > 0 && (
                    <p className="mt-2 text-xs font-medium text-amber-600">
                      {student.outstanding_fees} outstanding fee{student.outstanding_fees === 1 ? '' : 's'}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {students.length === 0 && (
        <Card>
          <CardContent>
            <EmptyState
              icon={GraduationCap}
              title="No children linked yet"
              description="There are no students linked to your guardian profile. Please contact the school office."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
