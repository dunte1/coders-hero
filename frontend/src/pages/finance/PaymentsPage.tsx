import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayments } from '@/hooks/useFinance';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { Banknote, ArrowRight } from 'lucide-react';
import type { PaymentMethod } from '@/types/finance';

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'online', label: 'Online' },
  { value: 'mpesa', label: 'M-Pesa' },
];

const formatKsh = (v: number | string | undefined) =>
  'KSh ' + Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function PaymentsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [method, setMethod] = useState<PaymentMethod | 'all'>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading } = usePayments({
    page,
    method: method === 'all' ? undefined : method,
    search: search || undefined,
  });

  const payments = data?.results || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Collections and receipts"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Finance', href: '/finance' }, { label: 'Payments' }]}
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search receipts..." className="w-full sm:w-64" />
        <SelectRoot value={method} onValueChange={(v) => { setMethod(v as PaymentMethod | 'all'); setPage(1); }}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            {METHODS.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : payments.length === 0 ? (
        <EmptyState icon={Banknote} title="No payments found" description="Recorded payments will appear here." />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 font-medium">Receipt</th>
                      <th className="px-4 py-3 font-medium">Student</th>
                      <th className="px-4 py-3 font-medium">Method</th>
                      <th className="px-4 py-3 font-medium text-right">Amount</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer"
                        onClick={() => navigate(`/finance/payments/${payment.id}`)}
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">{payment.receipt_no}</td>
                        <td className="px-4 py-3">
                          {payment.invoice?.student?.full_name ?? payment.fee?.student?.full_name ?? '—'}
                        </td>
                        <td className="px-4 py-3 capitalize">{payment.method.replace(/_/g, ' ')}</td>
                        <td className="px-4 py-3 text-right font-medium text-emerald-600">{formatKsh(payment.amount)}</td>
                        <td className="px-4 py-3 text-slate-500">{payment.paid_at}</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/finance/payments/${payment.id}`); }}>
                            Receipt <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          {data?.meta && data.meta.last_page > 1 && (
            <Pagination
              currentPage={data.meta.current_page}
              totalPages={data.meta.last_page}
              onPageChange={setPage}
              totalCount={data.meta.total}
              pageSize={data.meta.per_page}
            />
          )}
        </>
      )}
    </div>
  );
}
