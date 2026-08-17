import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Wallet, Pencil, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDelete } from '@/components/cms/ConfirmDelete';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/Dialog';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import {
  useStudentFees,
  useCreateFee,
  useUpdateFee,
  useDeleteFee,
  useFeePayments,
  useAddPayment,
  useDeletePayment,
} from '@/hooks/useStudents';
import { FeeStatusBadge, FEE_STATUSES, PAYMENT_METHODS } from '@/components/parent/PortalBadges';
import { formatDate } from '@/lib/utils';
import type { Fee } from '@/types/portal';

const feeSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  amount: z.string().min(1, 'Amount is required'),
  due_date: z.string().min(1, 'Due date is required'),
  status: z.string().min(1, 'Status is required'),
  note: z.string().optional(),
});

type FeeFormValues = z.infer<typeof feeSchema>;

function FeeFormDialog({ studentId, fee, onClose }: { studentId: number; fee?: Fee; onClose: () => void }) {
  const isEdit = !!fee;
  const createMutation = useCreateFee();
  const updateMutation = useUpdateFee();
  const pending = isEdit ? updateMutation.isPending : createMutation.isPending;

  const methods = useForm<FeeFormValues>({
    resolver: zodResolver(feeSchema),
    defaultValues: {
      label: fee?.label || '',
      amount: fee ? String(Number(fee.amount)) : '',
      due_date: fee?.due_date || new Date().toISOString().slice(0, 10),
      status: fee?.status || 'pending',
      note: fee?.note || '',
    },
  });

  const onSubmit = (values: FeeFormValues) => {
    const data = {
      label: values.label,
      amount: Number(values.amount),
      due_date: values.due_date,
      status: values.status as Fee['status'],
      note: values.note || null,
    };
    if (isEdit && fee) {
      updateMutation.mutate(
        { feeId: fee.id, data },
        { onSuccess: () => onClose() }
      );
    } else {
      createMutation.mutate(
        { studentId, data },
        { onSuccess: () => onClose() }
      );
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Label" placeholder="e.g. Term 1 Tuition" error={methods.formState.errors.label?.message} {...methods.register('label')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Amount" type="number" min="0.01" step="0.01" placeholder="0.00" error={methods.formState.errors.amount?.message} {...methods.register('amount')} />
          <Input label="Due Date" type="date" error={methods.formState.errors.due_date?.message} {...methods.register('due_date')} />
          <SelectRoot value={methods.watch('status')} onValueChange={(value) => methods.setValue('status', value)}>
            <SelectTrigger label="Status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {FEE_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </div>
        <Input label="Note (optional)" placeholder="Optional note" {...methods.register('note')} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={pending}>
            {isEdit ? 'Save Changes' : 'Create Fee'}
          </Button>
        </DialogFooter>
      </form>
    </FormProvider>
  );
}

const paymentSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  method: z.string().min(1, 'Method is required'),
  reference: z.string().optional(),
  paid_at: z.string().min(1, 'Payment date is required'),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

function AddPaymentDialog({ fee }: { fee: Fee }) {
  const addPaymentMutation = useAddPayment();
  const [open, setOpen] = useState(false);

  const methods = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: String(Number(fee.amount)),
      method: 'cash',
      reference: '',
      paid_at: new Date().toISOString().slice(0, 10),
    },
  });

  const onSubmit = (values: PaymentFormValues) => {
    addPaymentMutation.mutate(
      {
        feeId: fee.id,
        data: {
          amount: Number(values.amount),
          method: values.method as 'cash' | 'card' | 'bank_transfer' | 'online',
          reference: values.reference || null,
          paid_at: values.paid_at,
        },
      },
      {
        onSuccess: () => {
          methods.reset();
          setOpen(false);
        },
      }
    );
  };

  return (
    <DialogRoot open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <DollarSign className="mr-1 h-3.5 w-3.5" />
          Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment for {fee.label} (${Number(fee.amount).toFixed(2)}).
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Amount" type="number" min="0.01" step="0.01" error={methods.formState.errors.amount?.message} {...methods.register('amount')} />
              <Input label="Payment Date" type="date" error={methods.formState.errors.paid_at?.message} {...methods.register('paid_at')} />
            </div>
            <SelectRoot value={methods.watch('method')} onValueChange={(value) => methods.setValue('method', value)}>
              <SelectTrigger label="Method" error={methods.formState.errors.method?.message}>
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
            <Input label="Reference (optional)" {...methods.register('reference')} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={addPaymentMutation.isPending}>
                Record Payment
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </DialogRoot>
  );
}

function PaymentList({ feeId }: { feeId: number }) {
  const { data, isLoading } = useFeePayments(feeId);
  const deletePaymentMutation = useDeletePayment();
  const [deletePaymentId, setDeletePaymentId] = useState<number | null>(null);

  if (isLoading) return <p className="py-2 text-xs text-slate-400">Loading payments...</p>;

  const payments = data || [];

  if (payments.length === 0) {
    return <p className="py-2 text-xs text-slate-400">No payments recorded yet.</p>;
  }

  return (
    <div className="space-y-2">
      {payments.map((payment) => (
        <div key={payment.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
          <div>
            <p className="font-mono text-xs font-semibold text-slate-700">{payment.receipt_no}</p>
            <p className="text-xs text-slate-500">
              {formatDate(payment.paid_at)} · {payment.method}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">${Number(payment.amount).toFixed(2)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-500"
              onClick={() => setDeletePaymentId(payment.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
      <ConfirmDelete
        open={!!deletePaymentId}
        onOpenChange={() => setDeletePaymentId(null)}
        title="Delete Payment"
        description="Are you sure you want to delete this payment? This action cannot be undone."
        loading={deletePaymentMutation.isPending}
        onConfirm={() => {
          if (deletePaymentId) {
            deletePaymentMutation.mutate(deletePaymentId);
          }
        }}
      />
    </div>
  );
}

export function FeesTab({ studentId }: { studentId: number }) {
  const { data, isLoading } = useStudentFees(studentId);
  const deleteMutation = useDeleteFee();
  const [createOpen, setCreateOpen] = useState(false);
  const [editFee, setEditFee] = useState<Fee | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  if (isLoading) return <PageSpinner />;

  const fees = data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">
          {fees.length} fee{fees.length === 1 ? '' : 's'}
        </p>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          New Fee
        </Button>
      </div>

      {fees.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Wallet}
              title="No fees assigned"
              description="Create a fee to track payments for this student."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {fees.map((fee) => (
            <Card key={fee.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{fee.label}</CardTitle>
                    <p className="text-xs text-slate-500">Due {formatDate(fee.due_date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-900">${Number(fee.amount).toFixed(2)}</span>
                    <FeeStatusBadge status={fee.status} />
                    <Button variant="ghost" size="sm" onClick={() => setEditFee(fee)}>
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setDeleteId(fee.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {fee.note && <p className="text-xs text-slate-500">{fee.note}</p>}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payments</p>
                    <AddPaymentDialog fee={fee} />
                  </div>
                  <PaymentList feeId={fee.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DialogRoot open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Fee</DialogTitle>
            <DialogDescription>Create a fee for this student.</DialogDescription>
          </DialogHeader>
          <FeeFormDialog studentId={studentId} onClose={() => setCreateOpen(false)} />
        </DialogContent>
      </DialogRoot>

      <DialogRoot open={!!editFee} onOpenChange={(open) => !open && setEditFee(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Fee</DialogTitle>
            <DialogDescription>Update this fee&apos;s details.</DialogDescription>
          </DialogHeader>
          {editFee && <FeeFormDialog studentId={studentId} fee={editFee} onClose={() => setEditFee(null)} />}
        </DialogContent>
      </DialogRoot>

      <ConfirmDelete
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Fee"
        description="Are you sure you want to delete this fee? This action cannot be undone."
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
      />
    </div>
  );
}
