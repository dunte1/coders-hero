import { useNavigate } from 'react-router-dom';
import { useFinanceSummary, useExpensesByCategory } from '@/hooks/useFinance';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import {
  Wallet,
  Banknote,
  AlertTriangle,
  Receipt,
  FileText,
  Landmark,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

const formatKsh = (v: number | string | undefined) =>
  'KSh ' + Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const sections = [
  { label: 'Invoices', href: '/finance/invoices', icon: FileText, desc: 'Create, generate and manage invoices' },
  { label: 'Payments', href: '/finance/payments', icon: Banknote, desc: 'Receipts and collections' },
  { label: 'Outstanding', href: '/finance/outstanding', icon: AlertTriangle, desc: 'Student balances owing' },
  { label: 'Fee Structures', href: '/finance/fee-structures', icon: Wallet, desc: 'Standard fees by term and grade' },
  { label: 'Expenses', href: '/finance/expenses', icon: Receipt, desc: 'School expenditure' },
  { label: 'Budgets', href: '/finance/budgets', icon: Landmark, desc: 'Allocations by category' },
  { label: 'M-Pesa', href: '/finance/mpesa', icon: TrendingUp, desc: 'STK push and transaction logs' },
  { label: 'Transactions', href: '/finance/transactions', icon: Receipt, desc: 'Full payment and expense ledger' },
];

export default function FinanceOverviewPage() {
  const navigate = useNavigate();
  const { data: summary, isLoading } = useFinanceSummary();
  const { data: categories } = useExpensesByCategory();

  if (isLoading) return <PageSpinner />;

  const budgetUtilization = summary?.budget_utilization ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance"
        description="Invoicing, collections, expenses and M-Pesa reconciliation"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Finance' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={Wallet} title="Total Invoiced" value={formatKsh(summary?.total_invoiced)} />
        <StatsCard icon={Banknote} title="Collected" value={formatKsh(summary?.total_collected)} />
        <StatsCard icon={AlertTriangle} title="Outstanding" value={formatKsh(summary?.outstanding)} />
        <StatsCard icon={Receipt} title="Expenses" value={formatKsh(summary?.total_expenses)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900">Collections rate</h3>
            <p className="mt-1 text-3xl font-bold text-slate-900">{summary?.collections_rate ?? 0}%</p>
            <Progress value={summary?.collections_rate ?? 0} className="mt-3" />
            <p className="mt-2 text-sm text-slate-500">
              {summary?.invoice_counts?.paid ?? 0} paid · {summary?.invoice_counts?.partial ?? 0} partial ·{' '}
              {summary?.invoice_counts?.overdue ?? 0} overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900">Budget utilization</h3>
            <p className="mt-1 text-3xl font-bold text-slate-900">{budgetUtilization}%</p>
            <Progress value={budgetUtilization} className="mt-3" />
            <p className="mt-2 text-sm text-slate-500">
              {formatKsh(summary?.budget_spent)} of {formatKsh(summary?.budget_allocated)} spent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900">Expenses by category</h3>
            {!categories || categories.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No budget categories configured.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {categories.slice(0, 5).map((c) => (
                  <li key={c.category} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{c.category}</span>
                    <span className="font-medium text-slate-900">{formatKsh(c.spent)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map(({ label, href, icon: Icon, desc }) => (
          <Card key={href} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(href)}>
            <CardContent className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </div>
              <h4 className="mt-3 font-semibold text-slate-900">{label}</h4>
              <p className="mt-1 text-sm text-slate-500">{desc}</p>
              <Button variant="ghost" size="sm" className="mt-3 px-0 text-brand-600 hover:bg-transparent">
                Open <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
