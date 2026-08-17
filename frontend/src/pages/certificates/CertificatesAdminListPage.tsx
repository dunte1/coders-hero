import { useState } from 'react';
import { useAllCertificates, useRevokeCertificate, useUnrevokeCertificate, useBulkGenerate, useTemplateOptions } from '@/hooks/useCertificates';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { ShieldX, ShieldCheck, Download, Wand2, Search } from 'lucide-react';
import type { Certificate } from '@/types/certificates';
import { formatDate } from '@/lib/utils';
import { certificatesApi } from '@/lib/certificatesApi';

export default function CertificatesAdminListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [revokeTarget, setRevokeTarget] = useState<Certificate | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkCourseId, setBulkCourseId] = useState('');
  const [bulkTemplateId, setBulkTemplateId] = useState('none');
  const [bulkResult, setBulkResult] = useState<{ generated: number; skipped: number } | null>(null);

  const { data, isLoading } = useAllCertificates({ page, per_page: 15, search: appliedSearch || undefined, status });
  const revoke = useRevokeCertificate();
  const unrevoke = useUnrevokeCertificate();
  const bulk = useBulkGenerate();
  const { data: templates = [] } = useTemplateOptions();

  const certificates = data?.results || [];

  const columns: Column<Certificate>[] = [
    { key: 'number', header: 'Certificate No.', render: (c) => <span className="font-mono text-xs text-slate-700">{c.certificate_number}</span> },
    {
      key: 'holder',
      header: 'Holder',
      render: (c) => (
        <div>
          <p className="text-sm font-medium text-slate-900">{c.user?.name ?? '—'}</p>
          <p className="text-xs text-slate-500">{c.course?.title ?? ''}</p>
        </div>
      ),
    },
    { key: 'issued', header: 'Issued', render: (c) => <span className="text-sm text-slate-600">{c.issued_at ? formatDate(c.issued_at) : '—'}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (c) =>
        c.is_revoked ? (
          <Badge variant="destructive">Revoked</Badge>
        ) : (
          <Badge variant="success">Issued</Badge>
        ),
    },
    { key: 'verifications', header: 'Verifications', render: (c) => <span className="text-sm text-slate-600">{c.verifications_count ?? 0}</span> },
    {
      key: 'actions',
      header: 'Actions',
      render: (c) => (
        <div className="flex gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            title="Download PDF"
            onClick={() => window.open(certificatesApi.downloadUrl(c.certificate_number), '_blank')}
          >
            <Download className="h-4 w-4" />
          </Button>
          {c.is_revoked ? (
            <Button variant="ghost" size="sm" title="Reinstate" onClick={() => unrevoke.mutate(c.id)}>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" title="Revoke" onClick={() => setRevokeTarget(c)}>
              <ShieldX className="h-4 w-4 text-red-600" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Certificates"
        description="Manage issued certificates, revocations and bulk generation"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Certificates', href: '/admin/certificates' },
          { label: 'All Certificates' },
        ]}
        actions={
          <Button onClick={() => setBulkOpen(true)}>
            <Wand2 className="h-4 w-4 mr-1" />
            Bulk Generate
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] flex gap-2">
            <Input
              placeholder="Search by number or holder…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setAppliedSearch(search);
                  setPage(1);
                }
              }}
            />
            <Button variant="outline" onClick={() => { setAppliedSearch(search); setPage(1); }}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <SelectRoot value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="issued">Issued</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
            </SelectContent>
          </SelectRoot>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={certificates}
        totalCount={data?.meta.total ?? 0}
        page={data?.meta.current_page ?? 1}
        pageSize={data?.meta.per_page ?? 15}
        onPageChange={setPage}
        loading={isLoading}
        searchable={false}
        emptyTitle="No certificates"
        emptyDescription="No certificates match the current filters."
      />

      <DialogRoot open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Certificate</DialogTitle>
            <DialogDescription>
              Revoking makes this certificate show as invalid during verification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="revoke-reason">Reason (optional)</Label>
            <Textarea
              id="revoke-reason"
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="e.g. Issued in error, duplicate certificate…"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={revoke.isPending}
              onClick={() => {
                if (!revokeTarget) return;
                revoke.mutate({ id: revokeTarget.id, reason: revokeReason || null });
                setRevokeTarget(null);
                setRevokeReason('');
              }}
            >
              Revoke Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <DialogRoot open={bulkOpen} onOpenChange={(open) => { if (!open) { setBulkOpen(false); setBulkResult(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Generate Certificates</DialogTitle>
            <DialogDescription>
              Generate certificates for all completed enrollments in a course.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-course">Course ID</Label>
              <Input
                id="bulk-course"
                type="number"
                value={bulkCourseId}
                onChange={(e) => setBulkCourseId(e.target.value)}
                placeholder="e.g. 12"
              />
            </div>
            <div className="space-y-2">
              <Label>Template</Label>
              <SelectRoot value={bulkTemplateId} onValueChange={setBulkTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Default template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Default template</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
            {bulkResult && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                Generated {bulkResult.generated} certificate(s).
                {bulkResult.skipped > 0 && ` ${bulkResult.skipped} had certificates already.`}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setBulkOpen(false); setBulkResult(null); }}>Cancel</Button>
            <Button
              disabled={!bulkCourseId || bulk.isPending}
              onClick={() =>
                bulk.mutate(
                  { courseId: Number(bulkCourseId), templateId: bulkTemplateId === 'none' ? null : Number(bulkTemplateId) },
                  { onSuccess: (res) => setBulkResult(res) }
                )
              }
            >
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
