import { useState } from 'react';
import { useMyLeaveBalance, useMyLeaves, useMyCreateLeave, useMyCancelLeave } from '@/hooks/useHr';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { Plus, CalendarDays, X } from 'lucide-react';
import { LEAVE_TYPES } from '@/types/hr';
import type { LeaveRequestInput, LeaveType } from '@/types/hr';

const emptyForm: LeaveRequestInput = {
  leave_type: 'annual',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: new Date().toISOString().slice(0, 10),
  reason: null,
};

export default function HrMyLeavePage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<LeaveRequestInput>(emptyForm);

  const { data: balance, isLoading: balanceLoading } = useMyLeaveBalance();
  const { data, isLoading } = useMyLeaves({ page, per_page: 15 });
  const createLeave = useMyCreateLeave();
  const cancelLeave = useMyCancelLeave();

  const leaves = data?.results || [];

  const submit = () => {
    createLeave.mutate({ ...form, reason: form.reason || null }, { onSuccess: () => setDialogOpen(false) });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Leave"
        description="Request leave and review your requests"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'My HR', href: '/my/hr' }, { label: 'Leave' }]}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Request Leave
          </Button>
        }
      />

      {balanceLoading ? (
        <PageSpinner />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">Annual allowance</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{balance?.allowance ?? 0} days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">Used</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{balance?.used ?? 0} days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">Remaining</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">{balance?.remaining ?? 0} days</p>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading ? (
        <PageSpinner />
      ) : leaves.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No leave requests" description="Your leave requests will appear here." />
      ) : (
        <>
          <div className="space-y-3">
            {leaves.map((leave) => (
              <Card key={leave.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{leave.leave_type} leave</p>
                      <p className="text-sm text-slate-500">
                        {leave.start_date} → {leave.end_date} ({leave.days} day(s))
                      </p>
                      {leave.reason && <p className="mt-1 text-sm text-slate-500">{leave.reason}</p>}
                      {leave.review_note && (
                        <p className="mt-1 text-xs text-slate-400">Review note: {leave.review_note}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={leave.status} />
                      {(leave.status === 'pending' || leave.status === 'approved') && (
                        <Button variant="ghost" size="sm" onClick={() => cancelLeave.mutate(leave.id)}>
                          <X className="mr-1 h-3.5 w-3.5" /> Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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

      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Leave</DialogTitle>
            <DialogDescription>Submit a leave request for approval.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Leave type</Label>
              <SelectRoot
                value={form.leave_type}
                onValueChange={(v) => setForm({ ...form, leave_type: v as LeaveType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAVE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start date</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>End date</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Reason</Label>
              <Textarea
                value={form.reason ?? ''}
                onChange={(e) => setForm({ ...form, reason: e.target.value || null })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={submit} loading={createLeave.isPending}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
