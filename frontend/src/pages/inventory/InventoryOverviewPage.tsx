import { useNavigate } from 'react-router-dom';
import { useInventorySummary } from '@/hooks/useInventory';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import {
  Boxes,
  Package,
  Cpu,
  MapPin,
  Wrench,
  AlertTriangle,
  DollarSign,
  ArrowRight,
  QrCode,
} from 'lucide-react';

const formatMoney = (v: number | undefined) =>
  'KSh ' + Number(v ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 });

const sections = [
  { label: 'Assets', href: '/inventory/assets', icon: Cpu, desc: 'Laptops, robotics kits and equipment' },
  { label: 'Stock Items', href: '/inventory/items', icon: Package, desc: 'Consumables and tracked supplies' },
  { label: 'Maintenance', href: '/inventory/maintenance', icon: Wrench, desc: 'Repairs and servicing records' },
  { label: 'Categories', href: '/inventory/categories', icon: Boxes, desc: 'Asset and item categories' },
  { label: 'Locations', href: '/inventory/locations', icon: MapPin, desc: 'Stores, labs and campuses' },
];

export default function InventoryOverviewPage() {
  const navigate = useNavigate();
  const { data: summary, isLoading, isError } = useInventorySummary();

  if (isLoading) return <PageSpinner />;
  if (isError || !summary) return (
    <div className="space-y-6">
      <PageHeader title="Inventory" description="Assets, stock items, locations and maintenance" breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Inventory' }]} />
      <EmptyState title="Could not load inventory data" description="Please try again later." />
    </div>
  );

  const statusColors: Record<string, string> = {
    available: 'bg-emerald-500',
    assigned: 'bg-blue-500',
    in_maintenance: 'bg-amber-500',
    disposed: 'bg-slate-400',
    lost: 'bg-red-500',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Assets, stock items, locations and maintenance"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Inventory' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={Cpu} title="Total Assets" value={summary?.total_assets ?? 0} />
        <StatsCard icon={Package} title="Stock Units" value={summary?.total_stock_units ?? 0} />
        <StatsCard icon={AlertTriangle} title="Low Stock Items" value={summary?.low_stock_items ?? 0} />
        <StatsCard icon={DollarSign} title="Stock Value" value={formatMoney(summary?.stock_value)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900">Assets by status</h3>
            {!summary?.assets_by_status || Object.keys(summary.assets_by_status).length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No assets registered yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {Object.entries(summary.assets_by_status).map(([status, count]) => (
                  <li key={status} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className={`h-2 w-2 rounded-full ${statusColors[status] ?? 'bg-slate-400'}`} />
                      {status.replace(/_/g, ' ')}
                    </span>
                    <span className="font-medium text-slate-900">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900">Asset availability</h3>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {summary?.total_assets
                ? Math.round(((summary.available_assets ?? 0) / summary.total_assets) * 100)
                : 0}
              %
            </p>
            <Progress
              value={summary?.total_assets ? ((summary.available_assets ?? 0) / summary.total_assets) * 100 : 0}
              className="mt-3"
            />
            <p className="mt-2 text-sm text-slate-500">
              {summary?.available_assets ?? 0} available · {summary?.assigned_assets ?? 0} assigned ·{' '}
              {summary?.in_maintenance_assets ?? 0} in maintenance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900">Overview</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-slate-600">Categories</span>
                <span className="font-medium text-slate-900">{summary?.categories ?? 0}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600">Locations</span>
                <span className="font-medium text-slate-900">{summary?.locations ?? 0}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600">Open maintenance</span>
                <span className="font-medium text-slate-900">{summary?.open_maintenance ?? 0}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600">Disposed assets</span>
                <span className="font-medium text-slate-900">{summary?.disposed_assets ?? 0}</span>
              </li>
              <li className="flex justify-between border-t border-slate-100 pt-2">
                <span className="flex items-center gap-1 text-slate-600">
                  <QrCode className="h-4 w-4" /> QR tracked assets
                </span>
                <span className="font-medium text-slate-900">{summary?.total_assets ?? 0}</span>
              </li>
            </ul>
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
