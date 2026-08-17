import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, Download, Receipt } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useParentReceipt } from '@/hooks/useParentPortal';
import { parentApi } from '@/lib/parentApi';
import { getErrorMessage } from '@/lib/studentsApi';
import { useSiteBranding } from '@/hooks/usePublicSiteSettings';
import { formatDate, getInitials } from '@/lib/utils';
import { toast } from 'sonner';

export default function ParentReceiptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const receiptId = Number(id);
  const { data: receipt, isLoading, isError } = useParentReceipt(receiptId);
  const { siteName, logo, tagline, primaryColor } = useSiteBranding();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await parentApi.receiptPdf(receiptId);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) return <PageSpinner />;

  if (isError || !receipt) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            icon={Receipt}
            title="Receipt not found"
            description="This receipt could not be found or you do not have access to it."
          />
        </CardContent>
      </Card>
    );
  }

  const student = receipt.fee?.student;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Receipt ${receipt.receipt_no}`}
        description="Payment receipt for your child's fee."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Parent Portal', href: '/parent' },
          { label: 'Receipts', href: '/parent/receipts' },
          { label: receipt.receipt_no },
        ]}
        actions={
          <div className="flex gap-2">
            <Link to="/parent/receipts" className={buttonVariants({ variant: 'outline' })}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <Button variant="outline" loading={downloading} onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        }
      />

      <Card className="print-area">
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex min-w-0 items-center gap-2">
              {logo ? (
                <img src={logo} alt={siteName} className="h-9 w-9 shrink-0 rounded object-contain" />
              ) : (
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {siteName?.[0] ?? 'C'}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{siteName}</p>
                {tagline && <p className="truncate text-xs text-slate-500">{tagline}</p>}
              </div>
            </div>
            <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400">Payment Receipt</span>
          </div>
          <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-sm font-medium text-brand-700">
                {student?.photo_url ? (
                  <img src={student.photo_url} alt={student.full_name} className="h-full w-full object-cover" />
                ) : (
                  getInitials(student?.first_name || '', student?.last_name || '')
                )}
              </div>
              <div>
                <CardTitle className="font-mono text-lg">{receipt.receipt_no}</CardTitle>
                <p className="text-sm text-slate-500">Payment Receipt</p>
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              PAID
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Student</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {student?.full_name || `Student #${receipt.fee?.student_id ?? receipt.fee_id}`}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Fee</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">{receipt.fee?.label || `Fee #${receipt.fee_id}`}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Amount</dt>
              <dd className="mt-1 text-lg font-bold text-slate-900">${Number(receipt.amount).toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Method</dt>
              <dd className="mt-1">
                <Badge variant="secondary">{receipt.method}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Payment Date</dt>
              <dd className="mt-1 text-sm text-slate-900">{formatDate(receipt.paid_at)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Reference</dt>
              <dd className="mt-1 text-sm text-slate-900">{receipt.reference || '—'}</dd>
            </div>
          </dl>

          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
            <p>
              Thank you for your payment. This receipt is issued for the fee listed above and is
              the official record of payment for the {receipt.fee?.label || 'referenced'} fee.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
