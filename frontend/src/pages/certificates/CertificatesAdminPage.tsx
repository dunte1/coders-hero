import { useCertificateSummary } from '@/hooks/useCertificates';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Award, FileCheck, FileX2, LayoutTemplate, Eye, Activity } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function CertificatesAdminPage() {
  const { data, isLoading } = useCertificateSummary();

  if (isLoading) return <PageSpinner />;

  const summary = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates"
        description="Issue, verify and manage course completion certificates"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Certificates', href: '/admin/certificates' }]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Award} title="Total Certificates" value={summary?.total_certificates ?? 0} />
        <StatsCard icon={FileCheck} title="Issued" value={summary?.issued_certificates ?? 0} />
        <StatsCard icon={FileX2} title="Revoked" value={summary?.revoked_certificates ?? 0} />
        <StatsCard icon={LayoutTemplate} title="Active Templates" value={summary?.active_templates ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-brand-600" />
              Verification Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!summary?.recent_verifications?.length ? (
              <p className="text-sm text-slate-500">No verification checks recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {summary.recent_verifications.map((v) => (
                  <div key={v.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {v.certificate?.certificate_number ?? `#${v.certificate_id}`}
                      </p>
                      <p className="text-xs text-slate-500">IP: {v.verifier_ip ?? 'unknown'}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant={v.outcome === 'valid' ? 'success' : 'destructive'}>{v.outcome}</Badge>
                      <p className="text-xs text-slate-500">{formatDateTime(v.verified_at ?? '')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-600" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Total verifications</p>
              <p className="text-2xl font-bold text-slate-900">{summary?.total_verifications ?? 0}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Total templates</p>
              <p className="text-2xl font-bold text-slate-900">{summary?.total_templates ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
