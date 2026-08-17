import { useState } from 'react';
import { useVerifications } from '@/hooks/useCertificates';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Eye } from 'lucide-react';
import type { CertificateVerification } from '@/types/certificates';
import { formatDateTime } from '@/lib/utils';

export default function CertificateVerificationsPage() {
  const [page, setPage] = useState(1);
  const [outcome, setOutcome] = useState('all');
  const { data, isLoading } = useVerifications({ page, per_page: 20, outcome });

  const verifications = data?.results || [];

  const columns: Column<CertificateVerification>[] = [
    {
      key: 'certificate',
      header: 'Certificate',
      render: (v) => (
        <div>
          <p className="font-mono text-xs text-slate-700">
            {v.certificate?.certificate_number ?? `#${v.certificate_id}`}
          </p>
          <p className="text-xs text-slate-500">{v.certificate?.course?.title ?? ''}</p>
        </div>
      ),
    },
    { key: 'holder', header: 'Holder', render: (v) => <span className="text-sm text-slate-800">{v.certificate?.user?.name ?? '—'}</span> },
    {
      key: 'outcome',
      header: 'Outcome',
      render: (v) =>
        v.outcome === 'valid' ? (
          <Badge variant="success">Valid</Badge>
        ) : (
          <Badge variant="destructive">Revoked</Badge>
        ),
    },
    { key: 'ip', header: 'Verifier IP', render: (v) => <span className="font-mono text-xs text-slate-600">{v.verifier_ip ?? '—'}</span> },
    { key: 'verified_at', header: 'Verified At', render: (v) => <span className="text-sm text-slate-600">{formatDateTime(v.verified_at ?? '')}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verification History"
        description="Every public verification check performed against issued certificates"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Certificates', href: '/admin/certificates' },
          { label: 'Verifications' },
        ]}
      />

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            {['all', 'valid', 'revoked'].map((o) => (
              <button
                key={o}
                onClick={() => { setOutcome(o); setPage(1); }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  outcome === o ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {o === 'all' ? 'All' : o === 'valid' ? 'Valid' : 'Revoked'}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={verifications}
        totalCount={data?.meta.total ?? 0}
        page={data?.meta.current_page ?? 1}
        pageSize={data?.meta.per_page ?? 20}
        onPageChange={setPage}
        loading={isLoading}
        searchable={false}
        emptyTitle="No verification checks"
        emptyDescription="Verification activity will appear here once certificates are checked."
      />
    </div>
  );
}
