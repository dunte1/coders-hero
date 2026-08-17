import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePayment, useReversePayment } from '@/hooks/useFinance';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Download, Receipt } from 'lucide-react';
import { financeApi } from '@/lib/financeApi';
import { getErrorMessage } from '@/lib/studentsApi';
import { toast } from 'sonner';

const formatKsh = (v: number | string | undefined) =>
  'KSh ' + Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function PaymentDetailPage() {
  const { id } = useParams();
  const paymentId = Number(id);
  const { data: payment, isLoading } = usePayment(paymentId);
  const reversePayment = useReversePayment();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await financeApi.paymentPdf(paymentId);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) return <PageSpinner />;
  if (!payment) return null;

  const studentName = payment.invoice?.student?.full_name ?? payment.fee?.student?.full_name ?? '—';
  const invoiceNo = payment.invoice?.invoice_no ?? payment.fee?.label ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={payment.receipt_no}
        description="Official receipt"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Finance', href: '/finance' }, { label: 'Payments', href: '/finance/payments' }, { label: payment.receipt_no }]}
        actions={
          <>
            <Button variant="outline" loading={downloading} onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="destructive" onClick={() => reversePayment.mutate(paymentId)}>
              Reverse Payment
            </Button>
          </>
        }
      />

      <div className="mx-auto max-w-xl">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Coder's Hero</p>
                  <p className="text-xs text-slate-500">Official Receipt</p>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-900">{payment.receipt_no}</p>
            </div>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Student</dt><dd className="font-medium text-slate-900">{studentName}</dd></div>
              {invoiceNo && <div className="flex justify-between"><dt className="text-slate-500">Invoice</dt><dd className="font-medium text-slate-900">{invoiceNo}</dd></div>}
              <div className="flex justify-between"><dt className="text-slate-500">Paid on</dt><dd className="font-medium text-slate-900">{payment.paid_at}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Method</dt><dd className="font-medium text-slate-900 capitalize">{payment.method.replace(/_/g, ' ')}</dd></div>
              {payment.reference && <div className="flex justify-between"><dt className="text-slate-500">Reference</dt><dd className="font-medium text-slate-900">{payment.reference}</dd></div>}
              {payment.mpesa_transaction?.mpesa_receipt_number && (
                <div className="flex justify-between"><dt className="text-slate-500">M-Pesa Receipt</dt><dd className="font-medium text-slate-900">{payment.mpesa_transaction.mpesa_receipt_number}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-slate-500">Recorded by</dt><dd className="font-medium text-slate-900">{payment.paid_by?.name ?? 'System'}</dd></div>
            </dl>

            <div className="mt-6 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-500">Amount paid</span>
              <span className="text-2xl font-bold text-slate-900">{formatKsh(payment.amount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
