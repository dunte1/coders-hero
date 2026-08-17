import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvoice, useIssueInvoice, useVoidInvoice, useRecordPayment, useStkPush } from '@/hooks/useFinance';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Input } from '@/components/ui/Input';
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
import { Banknote, Smartphone, FileText, Download } from 'lucide-react';
import { financeApi } from '@/lib/financeApi';
import { getErrorMessage } from '@/lib/studentsApi';
import { toast } from 'sonner';
import type { PaymentMethod } from '@/types/finance';

const formatKsh = (v: number | string | undefined) =>
  'KSh ' + Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'online', label: 'Online' },
  { value: 'mpesa', label: 'M-Pesa' },
];

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const invoiceId = Number(id);
  const navigate = useNavigate();

  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const issueInvoice = useIssueInvoice();
  const voidInvoice = useVoidInvoice();
  const recordPayment = useRecordPayment();
  const stkPush = useStkPush();

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [mpesaOpen, setMpesaOpen] = useState(false);

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      await financeApi.invoicePdf(invoiceId);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloadingPdf(false);
    }
  };
  const [payForm, setPayForm] = useState({ amount: 0, method: 'cash' as PaymentMethod, reference: '' });
  const [phone, setPhone] = useState('');

  if (isLoading) return <PageSpinner />;
  if (!invoice) return null;

  const openPay = () => {
    setPayForm({ amount: Number(invoice.balance) || 0, method: 'cash', reference: '' });
    setPayOpen(true);
  };

  const submitPay = () => {
    recordPayment.mutate(
      {
        id: invoiceId,
        data: {
          amount: payForm.amount,
          method: payForm.method,
          reference: payForm.reference || null,
        },
      },
      { onSuccess: () => setPayOpen(false) }
    );
  };

  const submitMpesa = () => {
    stkPush.mutate(
      { invoice_id: invoiceId, phone },
      { onSuccess: () => setMpesaOpen(false) }
    );
  };

  const openMpesa = () => {
    setPhone('');
    setMpesaOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={invoice.invoice_no}
        description={invoice.description ?? 'Invoice'}
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Finance', href: '/finance' }, { label: 'Invoices', href: '/finance/invoices' }, { label: invoice.invoice_no }]}
        actions={
          <>
            <Button variant="outline" loading={downloadingPdf} onClick={handleDownloadPdf}>
              <Download className="mr-1 h-4 w-4" /> Download PDF
            </Button>
            {invoice.status === 'draft' && (
              <Button onClick={() => issueInvoice.mutate(invoiceId)}>Issue Invoice</Button>
            )}
            {!['paid', 'void'].includes(invoice.status) && (
              <Button variant="outline" onClick={() => voidInvoice.mutate(invoiceId)}>Void</Button>
            )}
            {!['paid', 'void', 'draft'].includes(invoice.status) && (
              <>
                <Button variant="success" onClick={openPay}>
                  <Banknote className="h-4 w-4 mr-1" /> Record Payment
                </Button>
                <Button onClick={openMpesa}>
                  <Smartphone className="h-4 w-4 mr-1" /> Pay via M-Pesa
                </Button>
              </>
            )}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-5">
          <p className="text-sm text-slate-500">Student</p>
          <p className="mt-1 font-semibold text-slate-900">{invoice.student?.full_name ?? '—'}</p>
          <p className="text-xs text-slate-500">{invoice.student?.student_id}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-sm text-slate-500">Status</p>
          <div className="mt-1"><StatusBadge status={invoice.status} /></div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-sm text-slate-500">Amount</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{formatKsh(invoice.amount)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-sm text-slate-500">Balance</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{formatKsh(invoice.balance)}</p>
        </CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900 mb-3">Line items</h3>
            {(!invoice.items || invoice.items.length === 0) ? (
              <p className="text-sm text-slate-500">No line items.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                      <th className="py-2 font-medium">Description</th>
                      <th className="py-2 font-medium text-right">Qty</th>
                      <th className="py-2 font-medium text-right">Amount</th>
                      <th className="py-2 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-2">{item.description}</td>
                        <td className="py-2 text-right text-slate-500">{item.qty}</td>
                        <td className="py-2 text-right text-slate-500">{formatKsh(item.amount)}</td>
                        <td className="py-2 text-right font-medium">{formatKsh(item.total)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3} className="pt-2 text-right font-semibold">Total</td>
                      <td className="pt-2 text-right font-bold">{formatKsh(invoice.amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">Payments</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/finance/payments')}>
                View all <FileText className="h-4 w-4 ml-1" />
              </Button>
            </div>
            {(!invoice.payments || invoice.payments.length === 0) ? (
              <p className="text-sm text-slate-500">No payments recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {invoice.payments.map((payment) => (
                  <li key={payment.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium text-slate-900">{payment.receipt_no}</p>
                      <p className="text-xs text-slate-500 capitalize">
                        {payment.method.replace(/_/g, ' ')} · {payment.paid_at}
                      </p>
                    </div>
                    <span className="font-semibold text-emerald-600">{formatKsh(payment.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <DialogRoot open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Balance: {formatKsh(invoice.balance)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount (KSh)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={payForm.amount}
                onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Method</Label>
              <SelectRoot value={payForm.method} onValueChange={(v) => setPayForm({ ...payForm, method: v as PaymentMethod })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
            <div>
              <Label>Reference (optional)</Label>
              <Input value={payForm.reference} onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })} placeholder="e.g. bank transfer ref" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button onClick={submitPay} loading={recordPayment.isPending} disabled={!payForm.amount}>
              Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <DialogRoot open={mpesaOpen} onOpenChange={setMpesaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay via M-Pesa</DialogTitle>
            <DialogDescription>
              An STK push prompt will be sent to the phone. Amount: {formatKsh(invoice.balance)}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>M-Pesa Phone Number</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMpesaOpen(false)}>Cancel</Button>
            <Button onClick={submitMpesa} loading={stkPush.isPending} disabled={phone.length < 9}>
              Send STK Push
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
