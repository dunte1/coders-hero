import { useSystemHealth } from '@/hooks/useAdmin';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Activity as ActivityIcon, Database, HardDrive, Server, Clock, MemoryStick } from 'lucide-react';

function Row({ label, value, badge }: { label: string; value: React.ReactNode; badge?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      {badge ? (
        <Badge variant={value === 'OK' ? 'success' : value === 'WARNING' ? 'warning' : 'destructive'}>{value as string}</Badge>
      ) : (
        <span className="font-medium text-slate-900">{value}</span>
      )}
    </div>
  );
}

export default function SystemHealthPage() {
  const { data, isLoading } = useSystemHealth();

  if (isLoading || !data) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Health"
        description="Environment, services and performance overview"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Administration', href: '/admin' }, { label: 'System Health' }]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Server className="h-4 w-4 text-brand-600" /> Application
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Name" value={data.app.name} />
            <Row label="Environment" value={data.app.env} />
            <Row label="Debug mode" value={data.app.debug ? 'ON' : 'OFF'} />
            <Row label="Application URL" value={data.app.url} />
            <Row label="Laravel version" value={data.app.version} />
            <Row label="PHP version" value={data.app.php_version} />
            <Row label="Timezone" value={data.app.timezone} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4 text-brand-600" /> Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Connection" value={data.database.connection} />
            <Row label="Driver" value={data.database.driver} />
            <Row label="Status" value={data.database.healthy ? 'OK' : 'ERROR'} badge />
            <Row label="Cache driver" value={data.cache} />
            <Row label="Queue driver" value={data.queue} />
            <Row label="Session driver" value={data.session} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-brand-600" /> Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Default disk" value={data.storage.disk} />
            <Row label="Storage writable" value={data.storage.writable ? 'OK' : 'ERROR'} badge />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <ActivityIcon className="h-4 w-4 text-brand-600" /> System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Memory used" value={`${data.system.memory_used_mb} MB`} />
            <Row label="Request time" value={data.system.request_time} />
            <Row label="Server time" value={new Date(data.system.server_time).toLocaleString()} />
          </CardContent>
        </Card>
      </div>

      <p className="flex items-center gap-2 text-sm text-slate-500">
        <Clock className="h-4 w-4" /> Last refreshed {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
}
