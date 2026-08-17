import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoices, useFeeStructures, useGenerateInvoices } from '@/hooks/useFinance';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { Label } from '@/components/ui/Label';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Plus, FileText, Wand2, ArrowRight } from 'lucide-react';
import type { InvoiceStatus } from '@/types/finance';

const STATUSES: InvoiceStatus[] = ['draft', 'issued', 'partial', 'paid', 'overdue', 'void'];

const formatKsh = (v: number | string | undefined) =>
  'KSh ' + Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<InvoiceStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateForm, setGenerateForm] = useState({ fee_structure_id: 0, grade_level: '' });

  const { data, isLoading } = useInvoices({
    page,
    status: status === 'all' ? undefined : status,
    search: search || undefined,
  });
  const { data: structuresData } = useFeeStructures({ page: 1, per_page: 100 });
  const generateInvoices = useGenerateInvoices();

  const invoices = data?.results || [];
  const structures = structuresData?.results || [];

  const submitGenerate = () => {
    if (!generateForm.fee_structure_id) return;
    generateInvoices.mutate(
      {
        fee_structure_id: generateForm.fee_structure_id,
        grade_level: generateForm.grade_level || null,
      },
      {
        onSuccess: () => setGenerateOpen(false),
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Student invoices and balances"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Finance', href: '/finance' }, { label: 'Invoices' }]}
        actions={
          <>
            <Button variant="outline" onClick={() => setGenerateOpen(true)}>
              <Wand2 className="h-4 w-4 mr-1" /> Generate
            </Button>
            <Button onClick={() => navigate('/finance/invoices/new')}>
              <Plus className="h-4 w-4 mr-1" /> New Invoice
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoices..." className="w-full sm:w-64" />
        <SelectRoot value={status} onValueChange={(v) => { setStatus(v as InvoiceStatus | 'all'); setPage(1); }}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : invoices.length === 0 ? (
        <EmptyState icon={FileText} title="No invoices found" description="Create an invoice or generate from a fee structure." />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 font-medium">Invoice</th>
                      <th className="px-4 py-3 font-medium">Student</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Amount</th>
                      <th className="px-4 py-3 font-medium text-right">Paid</th>
                      <th className="px-4 py-3 font-medium text-right">Balance</th>
                      <th className="px-4 py-3 font-medium">Due</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer"
                        onClick={() => navigate(`/finance/invoices/${invoice.id}`)}
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">{invoice.invoice_no}</td>
                        <td className="px-4 py-3">{invoice.student?.full_name ?? '—'}</td>
                        <td className="px-4 py-3"><StatusBadge status={invoice.status} /></td>
                        <td className="px-4 py-3 text-right text-slate-900">{formatKsh(invoice.amount)}</td>
                        <td className="px-4 py-3 text-right text-emerald-600">{formatKsh(invoice.paid_amount)}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">{formatKsh(invoice.balance)}</td>
                        <td className="px-4 py-3 text-slate-500">{invoice.due_date ?? '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/finance/invoices/${invoice.id}`); }}>
                            View <ArrowRight className="h-4 w-4 ml-1" />
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

      <DialogRoot open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Invoices</DialogTitle>
            <DialogDescription>
              Create one invoice per active student from a fee structure. Skips students who already hold an open invoice for it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Fee Structure</Label>
              <SelectRoot
                value={generateForm.fee_structure_id ? String(generateForm.fee_structure_id) : undefined}
                onValueChange={(v) => setGenerateForm({ ...generateForm, fee_structure_id: Number(v) })}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Select a fee structure" /></SelectTrigger>
                <SelectContent>
                  {structures.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name} — KSh {Number(s.amount).toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
            <div>
              <Label>Grade Level (optional)</Label>
              <SelectRoot
                value={generateForm.grade_level || undefined}
                onValueChange={(v) => setGenerateForm({ ...generateForm, grade_level: v })}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="All grades" /></SelectTrigger>
                <SelectContent>
                  {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'].map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateOpen(false)}>Cancel</Button>
            <Button onClick={submitGenerate} loading={generateInvoices.isPending} disabled={!generateForm.fee_structure_id}>
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
