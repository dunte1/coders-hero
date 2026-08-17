import { useMemo, useState } from 'react';
import { useFinanceTransactions } from '@/hooks/useFinance';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { ArrowDownLeft, ArrowUpRight, BookOpen } from 'lucide-react';
import type { TransactionRow } from '@/types/finance';

const formatKsh = (v: number | string | undefined) =>
  'KSh ' + Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TYPE_LABELS: Record<string, string> = {
  payment: 'Payment',
  expense: 'Expense',
};

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [direction, setDirection] = useState<'in' | 'out' | 'all'>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useFinanceTransactions({ page });

  const filtered = useMemo(() => {
    const rows = data?.results ?? [];
    return rows.filter((txn) => {
      if (direction !== 'all' && txn.direction !== direction) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return [txn.reference, txn.description, txn.method]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [data, direction, search]);

  const rows: TransactionRow[] = filtered;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction Ledger"
        description="Every payment and expense"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Finance', href: '/finance' }, { label: 'Transactions' }]}
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search references..." className="w-full sm:w-64" />
        <SelectRoot value={direction} onValueChange={(v) => { setDirection(v as 'in' | 'out' | 'all'); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Directions</SelectItem>
            <SelectItem value="in">Inflows</SelectItem>
            <SelectItem value="out">Outflows</SelectItem>
          </SelectContent>
        </SelectRoot>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : rows.length === 0 ? (
        <EmptyState icon={BookOpen} title="No transactions" description="Financial activity will appear here." />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <ul>
                {rows.map((txn) => (
                  <li key={txn.id} className="flex items-center gap-4 border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-slate-50">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${txn.direction === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {txn.direction === 'in' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">
                        {TYPE_LABELS[txn.type] ?? txn.type}
                        <span className="ml-2 text-xs text-slate-400">{txn.reference ?? ''}</span>
                      </p>
                      <p className="text-xs text-slate-500">{txn.description}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${txn.direction === 'in' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {txn.direction === 'in' ? '+' : '-'}{formatKsh(txn.amount)}
                      </p>
                      <p className="text-xs text-slate-500">{txn.date}</p>
                    </div>
                  </li>
                ))}
              </ul>
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
