import { useState } from 'react';
import type { ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useHrEmployee,
  useHrContracts,
  useHrLeaves,
  useHrDocuments,
} from '@/hooks/useHr';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Pencil,
  FileText,
  Briefcase,
  CalendarDays,
  Wallet,
  Download,
  IdCard,
} from 'lucide-react';
import { hrApi } from '@/lib/hrApi';
import { getInitials } from '@/lib/utils';

function DetailItem({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm text-slate-900">{value ?? '—'}</p>
    </div>
  );
}

export default function HrEmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const employeeId = Number(id);

  const { data: employee, isLoading } = useHrEmployee(employeeId);
  const { data: contractsData, isLoading: contractsLoading } = useHrContracts({ employee_id: employeeId, per_page: 50 });
  const { data: leavesData, isLoading: leavesLoading } = useHrLeaves({ employee_id: employeeId, per_page: 50 });
  const { data: documentsData, isLoading: documentsLoading } = useHrDocuments({ employee_id: employeeId, per_page: 50 });

  if (isLoading) return <PageSpinner />;

  if (!employee) {
    return (
      <EmptyState
        title="Employee not found"
        action={{ label: 'Back to employees', onClick: () => navigate('/hr/employees') }}
      />
    );
  }

  const openDownload = (docId: number) => {
    hrApi.downloadDocument(docId);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={employee.user?.name ?? employee.employee_id}
        description={`${employee.employee_id} · ${employee.position?.name ?? 'No position'}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'HR', href: '/hr' },
          { label: 'Employees', href: '/hr/employees' },
          { label: employee.user?.name ?? employee.employee_id },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(`/hr/employees/${employee.id}/id-card`)}>
              <IdCard className="mr-1 h-4 w-4" /> ID Card
            </Button>
            <Button onClick={() => navigate(`/hr/employees/${employee.id}/edit`)}>
              <Pencil className="mr-1 h-4 w-4" /> Edit
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-base font-semibold text-brand-700">
              {employee.user?.avatar ? (
                <img src={employee.user.avatar} alt={employee.user.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                getInitials((employee.user?.name ?? employee.employee_id).split(' ')[0], (employee.user?.name ?? employee.employee_id).split(' ')[1] ?? '')
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{employee.user?.name}</h2>
                <StatusBadge status={employee.status} />
              </div>
              <p className="text-sm text-slate-500">
                {employee.department?.name ?? 'No department'} · {employee.employment_type}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Briefcase className="h-4 w-4" /> {employee.tenure ?? '—'}
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Wallet className="h-4 w-4" />
              {employee.active_contract?.salary != null
                ? 'KSh ' + Number(employee.active_contract.salary).toLocaleString()
                : 'No salary set'}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contracts">Contracts ({employee.contracts_count ?? 0})</TabsTrigger>
          <TabsTrigger value="leave">Leave ({employee.leaves_count ?? 0})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({employee.documents_count ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact &amp; personal</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <DetailItem label="Email" value={employee.user?.email} />
                <DetailItem label="Phone" value={employee.user?.phone} />
                <DetailItem label="Gender" value={employee.gender} />
                <DetailItem label="Date of birth" value={employee.date_of_birth} />
                <DetailItem label="National ID" value={employee.national_id} />
                <DetailItem label="Address" value={employee.address} />
                <DetailItem label="Emergency contact" value={employee.emergency_contact} />
                <DetailItem label="Emergency phone" value={employee.emergency_phone} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Employment</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <DetailItem label="Hire date" value={employee.hire_date} />
                <DetailItem label="Employment type" value={employee.employment_type} />
                <DetailItem label="Department" value={employee.department?.name} />
                <DetailItem label="Position" value={employee.position?.name} />
                <DetailItem label="Bank" value={employee.bank_name} />
                <DetailItem label="Bank account" value={employee.bank_account_number} />
                <DetailItem label="Salary" value={employee.salary != null ? 'KSh ' + Number(employee.salary).toLocaleString() : '—'} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contracts">
          {contractsLoading ? (
            <PageSpinner />
          ) : !contractsData || contractsData.results.length === 0 ? (
            <EmptyState icon={FileText} title="No contracts" description="This employee has no employment contracts yet." />
          ) : (
            <div className="space-y-3">
              {contractsData.results.map((contract) => (
                <Card key={contract.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {contract.contract_no ?? `Contract #${contract.id}`}
                        </p>
                        <p className="text-sm text-slate-500">
                          {contract.type} · {contract.start_date}
                          {contract.end_date ? ` → ${contract.end_date}` : ''}
                          {contract.signed_on ? ` · Signed ${contract.signed_on}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {contract.salary != null && (
                          <span className="text-sm font-medium text-slate-900">
                            KSh {Number(contract.salary).toLocaleString()}
                          </span>
                        )}
                        <StatusBadge status={contract.status} />
                      </div>
                    </div>
                    {contract.notes && <p className="mt-2 text-sm text-slate-500">{contract.notes}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="leave">
          {leavesLoading ? (
            <PageSpinner />
          ) : !leavesData || leavesData.results.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No leave requests" description="This employee has no leave requests yet." />
          ) : (
            <div className="space-y-3">
              {leavesData.results.map((leave) => (
                <Card key={leave.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{leave.leave_type} leave</p>
                        <p className="text-sm text-slate-500">
                          {leave.start_date} → {leave.end_date} ({leave.days} day(s))
                        </p>
                      </div>
                      <StatusBadge status={leave.status} />
                    </div>
                    {leave.reason && <p className="mt-2 text-sm text-slate-500">{leave.reason}</p>}
                    {leave.review_note && (
                      <p className="mt-1 text-xs text-slate-400">Review note: {leave.review_note}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents">
          {documentsLoading ? (
            <PageSpinner />
          ) : !documentsData || documentsData.results.length === 0 ? (
            <EmptyState icon={FileText} title="No documents" description="This employee has no uploaded documents." />
          ) : (
            <div className="space-y-3">
              {documentsData.results.map((document) => (
                <Card key={document.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{document.title}</p>
                          <p className="text-sm text-slate-500">
                            {document.category} · {document.file_name} · {document.size_human ?? '—'}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => openDownload(document.id)}>
                        <Download className="mr-1 h-4 w-4" /> Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
