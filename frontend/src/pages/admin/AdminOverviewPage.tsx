import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Shield,
  KeyRound,
  History,
  Activity as ActivityIcon,
  Save,
  FileText,
  Database,
  TerminalSquare,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const tiles = [
  { label: 'Users', href: '/users', icon: Users, desc: 'Manage user accounts' },
  { label: 'Roles', href: '/settings/roles', icon: Shield, desc: 'Role definitions and assignment' },
  { label: 'Permissions', href: '/settings/permissions', icon: KeyRound, desc: 'Permission catalogue' },
  { label: 'Activity Logs', href: '/admin/activity-logs', icon: History, desc: 'Recent system activity' },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: Database, desc: 'Change history and audit trail' },
  { label: 'Login History', href: '/settings/login-history', icon: History, desc: 'Authentication events' },
  { label: 'System Health', href: '/admin/system-health', icon: ActivityIcon, desc: 'Environment and service status' },
  { label: 'Backups', href: '/admin/backups', icon: Save, desc: 'Database backups and downloads' },
  { label: 'System Logs', href: '/admin/system-logs', icon: TerminalSquare, desc: 'Application runtime logs' },
];

export default function AdminOverviewPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration"
        description="System administration, audit and maintenance tools"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Administration' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(({ label, href, icon: Icon, desc }) => (
          <Card key={href} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(href)}>
            <CardContent className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </div>
              <h4 className="mt-3 font-semibold text-slate-900">{label}</h4>
              <p className="mt-1 text-sm text-slate-500">{desc}</p>
              <Button variant="ghost" size="sm" className="mt-3 px-0 text-brand-600 hover:bg-transparent">
                Open <FileText className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
