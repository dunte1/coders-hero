import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOutstandingBalances } from '@/hooks/useFinance';
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
import { AlertTriangle, ArrowRight } from 'lucide-react';

const formatKsh = (v: number | string | undefined) =>
  'KSh ' + Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const GRADES = Array.from({ length: 9 }, (_, i) => `Grade ${i + 1}`);

export default function OutstandingPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [grade, setGrade] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useOutstandingBalances({
    page,
    grade: grade === 'all' ? undefined : grade,
    search: search || undefined,
  });

  const rows = data?.results || [];
  const totalBalance = rows.reduce((sum, row) => sum + row.balance, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outstanding Balances"
        description="Students with open invoices"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Finance', href: '/finance' }, { label: 'Outstanding' }]}
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students..." className="w-full sm:w-64" />
        <SelectRoot value={grade} onValueChange={(v) => { setGrade(v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {GRADES.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
        <span className="ml-auto text-sm text-slate-500">
          Page total: <span className="font-semibold text-slate-900">{formatKsh(totalBalance)}</span>
        </span>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : rows.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="No outstanding balances" description="All student balances are settled. Great job!" />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 font-medium">Student</th>
                      <th className="px-4 py-3 font-medium">Grade</th>
                      <th className="px-4 py-3 font-medium text-right">Open Invoices</th>
                      <th className="px-4 py-3 font-medium text-right">Invoiced</th>
                      <th className="px-4 py-3 font-medium text-right">Paid</th>
                      <th className="px-4 py-3 font-medium text-right">Balance</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.student.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{row.student.full_name}</p>
                          <p className="text-xs text-slate-500">{row.student.student_id}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{row.student.grade ?? '—'}</td>
                        <td className="px-4 py-3 text-right text-slate-500">{row.open_invoices}</td>
                        <td className="px-4 py-3 text-right text-slate-900">{formatKsh(row.invoiced)}</td>
                        <td className="px-4 py-3 text-right text-emerald-600">{formatKsh(row.paid)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-red-600">{formatKsh(row.balance)}</td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/finance/invoices?student_id=${row.student.id}`)}
                          >
                            Invoices <ArrowRight className="h-4 w-4 ml-1" />
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
