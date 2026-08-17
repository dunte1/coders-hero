import { Link } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { buttonVariants } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useParentFees } from '@/hooks/useParentPortal';
import { formatDate } from '@/lib/utils';
import type { PortalPayment } from '@/types/portal';

type ReceiptRow = PortalPayment & { feeLabel: string; studentName: string };

export default function ParentReceiptsPage() {
  const { data, isLoading } = useParentFees();

  if (isLoading) return <PageSpinner />;

  const fees = data || [];
  const receipts: ReceiptRow[] = fees
    .flatMap((fee) =>
      (fee.payments || []).map((payment) => ({
        ...payment,
        feeLabel: fee.label,
        studentName: fee.student?.full_name || `Student #${fee.student_id}`,
      }))
    )
    .sort((a, b) => (a.paid_at < b.paid_at ? 1 : -1));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Receipts"
        description="Payment receipts and history for your children."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Parent Portal', href: '/parent' }, { label: 'Receipts' }]}
      />

      {receipts.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Receipt}
              title="No receipts yet"
              description="Payments you make will appear here with their receipts."
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment History ({receipts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4">Receipt No</th>
                    <th className="py-2 pr-4">Student</th>
                    <th className="py-2 pr-4">Fee</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Method</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {receipts.map((receipt) => (
                    <tr key={receipt.id}>
                      <td className="py-2.5 pr-4 font-mono text-xs font-semibold text-slate-900">
                        {receipt.receipt_no}
                      </td>
                      <td className="py-2.5 pr-4 font-medium text-slate-900">{receipt.studentName}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{receipt.feeLabel}</td>
                      <td className="py-2.5 pr-4 font-semibold text-slate-900">
                        ${Number(receipt.amount).toFixed(2)}
                      </td>
                      <td className="py-2.5 pr-4">
                        <Badge variant="secondary">{receipt.method}</Badge>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">{formatDate(receipt.paid_at)}</td>
                      <td className="py-2.5 text-right">
                        <Link
                          to={`/parent/receipts/${receipt.id}`}
                          className={buttonVariants({ variant: 'outline', size: 'sm' })}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
