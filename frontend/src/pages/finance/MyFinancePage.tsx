import { useState } from 'react';
import { useMyInvoices, useMyOutstanding, useStkPush, useStripeCheckout } from '@/hooks/useFinance';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Smartphone, Wallet, CreditCard } from 'lucide-react';

const formatKsh = (v: number | string | undefined) =>
  'KSh ' + Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function MyFinancePage() {
  const { data: invoices, isLoading: invoicesLoading } = useMyInvoices();
  const { data: outstanding, isLoading: outstandingLoading } = useMyOutstanding();
  const stkPush = useStkPush();
  const stripeCheckout = useStripeCheckout();

  const [payFor, setPayFor] = useState<{ id: number; label: string; amount: number } | null>(null);
  const [phone, setPhone] = useState('');

  const invoiceList = invoices ?? [];
  const outstandingList = outstanding ?? [];
  const totalOutstanding = outstandingList.reduce((sum, row) => sum + Number(row.balance ?? 0), 0);

  const submit = () => {
    if (!payFor) return;
    stkPush.mutate(
      { invoice_id: payFor.id, phone },
      { onSuccess: () => { setPayFor(null); setPhone(''); } }
    );
  };

  if (invoicesLoading || outstandingLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Finance"
        description="Your invoices and outstanding balance"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'My Finance' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-5">
          <p className="text-sm text-slate-500">Total Invoices</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{invoiceList.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-sm text-slate-500">Paid</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {formatKsh(invoiceList.reduce((s, i) => s + Number(i.paid_amount ?? 0), 0))}
          </p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-sm text-slate-500">Outstanding Balance</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{formatKsh(totalOutstanding)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-sm text-slate-500">Open Invoices</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {invoiceList.filter((i) => ['issued', 'partial', 'overdue'].includes(i.status)).length}
          </p>
        </CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <h3 className="mb-3 font-semibold text-slate-900">Invoices</h3>
          {invoiceList.length === 0 ? (
            <EmptyState icon={Wallet} title="No invoices" description="You have no invoices yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 font-medium">Invoice</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 font-medium text-right">Amount</th>
                    <th className="py-2 font-medium text-right">Balance</th>
                    <th className="py-2 font-medium text-right">Due Date</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {invoiceList.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 font-medium text-slate-900">{invoice.invoice_no}</td>
                      <td className="py-2"><StatusBadge status={invoice.status} /></td>
                      <td className="py-2 text-right text-slate-900">{formatKsh(invoice.amount)}</td>
                      <td className="py-2 text-right font-medium text-slate-900">{formatKsh(invoice.balance)}</td>
                      <td className="py-2 text-right text-slate-500">{invoice.due_date ?? '—'}</td>
                      <td className="py-2 text-right">
                        {!['paid', 'void', 'draft'].includes(invoice.status) && Number(invoice.balance) > 0 && (
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="outline" onClick={() => stripeCheckout.mutate(invoice.id)} loading={stripeCheckout.isPending}>
                              <CreditCard className="h-4 w-4 mr-1" /> Card
                            </Button>
                            <Button size="sm" onClick={() => { setPayFor({ id: invoice.id, label: invoice.invoice_no, amount: Number(invoice.balance) }); setPhone(''); }}>
                              <Smartphone className="h-4 w-4 mr-1" /> M-Pesa
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <DialogRoot open={!!payFor} onOpenChange={(o) => !o && setPayFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay {payFor?.label}</DialogTitle>
            <DialogDescription>Amount: {formatKsh(payFor?.amount ?? 0)}. An STK push prompt will be sent.</DialogDescription>
          </DialogHeader>
          <div>
            <Label>M-Pesa Phone Number</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayFor(null)}>Cancel</Button>
            <Button onClick={submit} loading={stkPush.isPending} disabled={phone.length < 9}>
              Send STK Push
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
