import { useState } from 'react';
import { useMpesaTransactions } from '@/hooks/useFinance';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { Smartphone } from 'lucide-react';
import type { MpesaStatus } from '@/types/finance';

const formatKsh = (v: number | string | undefined) =>
  'KSh ' + Number(v ?? 0).toLocaleString();

export default function MpesaTransactionsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<MpesaStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useMpesaTransactions({
    page,
    status: status === 'all' ? undefined : status,
    search: search || undefined,
  });

  const transactions = data?.results || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="M-Pesa Transactions"
        description="STK push requests, receipts and reconciliation status"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Finance', href: '/finance' }, { label: 'M-Pesa' }]}
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search receipt, phone..." className="w-full sm:w-64" />
        <SelectRoot value={status} onValueChange={(v) => { setStatus(v as MpesaStatus | 'all'); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </SelectRoot>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : transactions.length === 0 ? (
        <EmptyState icon={Smartphone} title="No M-Pesa transactions" description="STK push requests will appear here." />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 font-medium">Phone</th>
                      <th className="px-4 py-3 font-medium">Student</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Amount</th>
                      <th className="px-4 py-3 font-medium">M-Pesa Receipt</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => (
                      <tr key={txn.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{txn.phone_number ?? '—'}</td>
                        <td className="px-4 py-3">
                          {txn.invoice?.student?.full_name ?? txn.fee?.student?.full_name ?? '—'}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={txn.status} /></td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">{formatKsh(txn.amount)}</td>
                        <td className="px-4 py-3 text-slate-500">{txn.mpesa_receipt_number ?? '—'}</td>
                        <td className="px-4 py-3 text-slate-500">
                          {txn.created_at ? new Date(txn.created_at).toLocaleDateString() : '—'}
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
