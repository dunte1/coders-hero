import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wallet, Receipt, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/Dialog';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { FeeStatusBadge, PAYMENT_METHODS } from '@/components/parent/PortalBadges';
import { useParentFees, usePayFee } from '@/hooks/useParentPortal';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Fee, PaymentMethod, PortalPayment } from '@/types/portal';

const paySchema = z.object({
  method: z.string().min(1, 'Payment method is required'),
  reference: z.string().optional(),
});

type PayFormValues = z.infer<typeof paySchema>;

function PayFeeDialog({ fee }: { fee: Fee }) {
  const payMutation = usePayFee();
  const [open, setOpen] = useState(false);
  const [payment, setPayment] = useState<PortalPayment | null>(null);

  const methods = useForm<PayFormValues>({
    resolver: zodResolver(paySchema),
    defaultValues: { method: 'online', reference: '' },
  });

  const { register, handleSubmit, setValue, watch, reset } = methods;

  const onFormSubmit = (values: PayFormValues) => {
    payMutation.mutate(
      {
        id: fee.id,
        data: {
          method: values.method as PaymentMethod,
          reference: values.reference || undefined,
        },
      },
      {
        onSuccess: (result) => {
          setPayment(result);
        },
      }
    );
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setPayment(null);
      reset({ method: 'online', reference: '' });
    }
  };

  return (
    <DialogRoot open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Wallet className="h-4 w-4" />
          Pay Now
        </Button>
      </DialogTrigger>
      <DialogContent>
        {payment ? (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
                Payment Successful
              </DialogTitle>
              <DialogDescription>
                Your payment for {fee.label} has been received.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-lg bg-emerald-50 p-4 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">Receipt Number</p>
              <p className="mt-1 font-mono text-lg font-bold text-emerald-800">{payment.receipt_no}</p>
              <p className="mt-2 text-sm font-semibold text-emerald-700">
                {formatCurrency(Number(payment.amount))} · {formatDate(payment.paid_at)}
              </p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Link to="/parent/receipts" className={buttonVariants()}>
                <Receipt className="h-4 w-4" />
                View Receipts
              </Link>
            </DialogFooter>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Pay Fee</DialogTitle>
              <DialogDescription>
                Paying {fee.label} for {fee.student?.full_name || 'student'} — {formatCurrency(Number(fee.amount))}.
              </DialogDescription>
            </DialogHeader>
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                <SelectRoot value={watch('method')} onValueChange={(value) => setValue('method', value)}>
                  <SelectTrigger label="Payment Method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method.charAt(0).toUpperCase() + method.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
                <Input
                  label="Reference (optional)"
                  placeholder="e.g. transaction reference"
                  {...register('reference')}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" loading={payMutation.isPending}>
                    Pay {formatCurrency(Number(fee.amount))}
                  </Button>
                </DialogFooter>
              </form>
            </FormProvider>
          </>
        )}
      </DialogContent>
    </DialogRoot>
  );
}

export default function ParentFeesPage() {
  const { data, isLoading } = useParentFees();

  if (isLoading) return <PageSpinner />;

  const fees = data || [];
  const pending = fees.filter((fee) => fee.status === 'pending');
  const paid = fees.filter((fee) => fee.status === 'paid');
  const waived = fees.filter((fee) => fee.status === 'waived');
  const outstandingTotal = pending.reduce((sum, fee) => sum + Number(fee.amount), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fees"
        description="Fee schedule and online payments for your children."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Parent Portal', href: '/parent' }, { label: 'Fees' }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(outstandingTotal)}</p>
            <p className="text-xs text-slate-500">{pending.length} unpaid fee{pending.length === 1 ? '' : 's'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">
              {paid.length}
            </p>
            <p className="text-xs text-slate-500">paid fee{paid.length === 1 ? '' : 's'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Waived</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-600">{waived.length}</p>
            <p className="text-xs text-slate-500">waived fee{waived.length === 1 ? '' : 's'}</p>
          </CardContent>
        </Card>
      </div>

      {fees.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Wallet}
              title="No fees assigned"
              description="There are no fees assigned to your children at this time."
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fee Schedule ({fees.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4">Student</th>
                    <th className="py-2 pr-4">Label</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Due Date</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fees.map((fee) => (
                    <tr key={fee.id}>
                      <td className="py-2.5 pr-4 font-medium text-slate-900">
                        {fee.student?.full_name || `Student #${fee.student_id}`}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-700">{fee.label}</td>
                      <td className="py-2.5 pr-4 font-semibold text-slate-900">
                        {formatCurrency(Number(fee.amount))}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">{formatDate(fee.due_date)}</td>
                      <td className="py-2.5 pr-4">
                        <FeeStatusBadge status={fee.status} />
                      </td>
                      <td className="py-2.5 text-right">
                        {fee.status === 'pending' ? (
                          <PayFeeDialog fee={fee} />
                        ) : (
                          <Link
                            to="/parent/receipts"
                            className={buttonVariants({ variant: 'outline', size: 'sm' })}
                          >
                            <Receipt className="h-4 w-4" />
                            Receipt
                          </Link>
                        )}
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
