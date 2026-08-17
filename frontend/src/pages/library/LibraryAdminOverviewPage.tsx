import { useNavigate } from 'react-router-dom';
import { useLibrarySummary } from '@/hooks/useLibrary';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  BookOpen,
  FileText,
  CalendarClock,
  AlertTriangle,
  Users,
  ArrowRight,
  Library as LibraryIcon,
} from 'lucide-react';

const sections = [
  { label: 'Resources', href: '/library/admin/resources', icon: FileText, desc: 'Manage e-books, videos, notes and more' },
  { label: 'Borrowings', href: '/library/admin/borrowings', icon: BookOpen, desc: 'Active loans, overdue items and returns' },
  { label: 'Reservations', href: '/library/admin/reservations', icon: CalendarClock, desc: 'Pending and fulfilled reservations' },
  { label: 'Categories', href: '/library/admin/categories', icon: LibraryIcon, desc: 'Organise resources by category' },
  { label: 'Authors', href: '/library/admin/authors', icon: Users, desc: 'Manage resource authors' },
];

export default function LibraryAdminOverviewPage() {
  const navigate = useNavigate();
  const { data: summary, isLoading } = useLibrarySummary();

  if (isLoading) return <PageSpinner />;

  const typeLabels: Record<string, string> = {
    ebook: 'E-Books',
    video: 'Videos',
    notes: 'Notes',
    past_paper: 'Past Papers',
    coding_resource: 'Coding Resources',
    robotics_manual: 'Robotics Manuals',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library Management"
        description="Digital resources, borrowings and reservations"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Library', href: '/library/admin' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={FileText} title="Total Resources" value={summary?.total_resources ?? 0} />
        <StatsCard icon={BookOpen} title="Active Borrowings" value={summary?.active_borrowings ?? 0} />
        <StatsCard icon={AlertTriangle} title="Overdue" value={summary?.overdue_borrowings ?? 0} />
        <StatsCard icon={CalendarClock} title="Pending Reservations" value={summary?.pending_reservations ?? 0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900">Resources by type</h3>
            {!summary?.resources_by_type || Object.keys(summary.resources_by_type).length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No resources yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {Object.entries(summary.resources_by_type).map(([type, count]) => (
                  <li key={type} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{typeLabels[type] ?? type}</span>
                    <span className="font-medium text-slate-900">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900">Catalog health</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-slate-600">Active resources</span>
                <span className="font-medium text-slate-900">{summary?.active_resources ?? 0}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600">Public resources</span>
                <span className="font-medium text-slate-900">{summary?.public_resources ?? 0}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600">Categories</span>
                <span className="font-medium text-slate-900">{summary?.total_categories ?? 0}</span>
              </li>
              <li className="flex justify-between border-t border-slate-100 pt-2">
                <span className="text-slate-600">Total reads</span>
                <span className="font-medium text-slate-900">{summary?.total_reads ?? 0}</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900">Student catalog</h3>
            <p className="mt-2 text-sm text-slate-500">Students and parents can browse the public catalog and borrow resources.</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/library')}>
              View catalog <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {sections.map(({ label, href, icon: Icon, desc }) => (
          <Card key={href} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(href)}>
            <CardContent className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </div>
              <h4 className="mt-3 font-semibold text-slate-900">{label}</h4>
              <p className="mt-1 text-sm text-slate-500">{desc}</p>
              <Button variant="ghost" size="sm" className="mt-3 px-0 text-brand-600 hover:bg-transparent">
                Open <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
