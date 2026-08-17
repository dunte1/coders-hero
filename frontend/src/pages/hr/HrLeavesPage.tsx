import { useState } from 'react';
import {
  useHrLeaves,
  useHrEmployees,
  useCreateLeave,
  useReviewLeave,
  useCancelLeave,
} from '@/hooks/useHr';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
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
import { Plus, CalendarDays, Check, X } from 'lucide-react';
import { LEAVE_TYPES } from '@/types/hr';
import type { LeaveRequest, LeaveRequestInput, LeaveType } from '@/types/hr';

const emptyForm: LeaveRequestInput = {
  employee_id: undefined,
  leave_type: 'annual',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: new Date().toISOString().slice(0, 10),
  reason: null,
};

export default function HrLeavesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<LeaveRequest | null>(null);
  const [note, setNote] = useState('');
  const [form, setForm] = useState<LeaveRequestInput>(emptyForm);

  const { data, isLoading } = useHrLeaves({
    page,
    per_page: 15,
    status: status || undefined,
    leave_type: leaveType || undefined,
    search: search || undefined,
  });
  const { data: employeesData } = useHrEmployees({ per_page: 200 });
  const createLeave = useCreateLeave();
  const reviewLeave = useReviewLeave();
  const cancelLeave = useCancelLeave();

  const employees = employeesData?.results || [];
  const leaves = data?.results || [];

  const submitCreate = () => {
    if (!form.employee_id) return;
    createLeave.mutate({ ...form, reason: form.reason || null }, { onSuccess: () => setCreateOpen(false) });
  };

  const submitReview = (approve: boolean) => {
    if (!reviewTarget) return;
    reviewLeave.mutate(
      { id: reviewTarget.id, data: { status: approve ? 'approved' : 'rejected', note: note || null } },
      { onSuccess: () => { setReviewTarget(null); setNote(''); } }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Requests"
        description="Review and manage employee leave"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'HR', href: '/hr' }, { label: 'Leave' }]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> New Request
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by employee..."
          className="w-full sm:w-64"
        />
        <SelectRoot value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger label="Status" className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            {['pending', 'approved', 'rejected', 'cancelled'].map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
        <SelectRoot value={leaveType} onValueChange={(v) => { setLeaveType(v); setPage(1); }}>
          <SelectTrigger label="Type" className="w-40">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All types</SelectItem>
            {LEAVE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : leaves.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No leave requests" description="Leave requests will appear here." />
      ) : (
        <>
          <div className="space-y-3">
            {leaves.map((leave) => (
              <Card key={leave.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {leave.employee?.user?.name ?? 'Unknown employee'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {leave.leave_type} · {leave.start_date} → {leave.end_date} ({leave.days} day(s))
                        {leave.reviewed_by ? ` · Reviewed by ${leave.reviewed_by.name}` : ''}
                      </p>
                      {leave.reason && <p className="mt-1 text-sm text-slate-500">{leave.reason}</p>}
                      {leave.review_note && (
                        <p className="mt-1 text-xs text-slate-400">Review note: {leave.review_note}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={leave.status} />
                      {leave.status === 'pending' && (
                        <>
                          <Button variant="success" size="sm" onClick={() => reviewLeave.mutate({ id: leave.id, data: { status: 'approved' } })}>
                            <Check className="mr-1 h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { setReviewTarget(leave); setNote(''); }}>
                            <X className="mr-1 h-3.5 w-3.5" /> Reject
                          </Button>
                        </>
                      )}
                      {leave.status === 'pending' && (
                        <Button variant="ghost" size="sm" onClick={() => cancelLeave.mutate(leave.id)}>
                          Cancel
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

      <DialogRoot open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Leave Request</DialogTitle>
            <DialogDescription>Submit a leave request on behalf of an employee.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Employee</Label>
              <SelectRoot
                value={form.employee_id ? String(form.employee_id) : undefined}
                onValueChange={(v) => setForm({ ...form, employee_id: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.user?.name ?? e.employee_id} ({e.employee_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
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
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={submitCreate} loading={createLeave.isPending} disabled={!form.employee_id}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <DialogRoot open={!!reviewTarget} onOpenChange={(open) => { if (!open) setReviewTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject leave request</DialogTitle>
            <DialogDescription>Optionally add a note for the employee.</DialogDescription>
          </DialogHeader>
          <div>
            <Label>Note</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Reason for rejection..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => submitReview(false)} loading={reviewLeave.isPending}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
