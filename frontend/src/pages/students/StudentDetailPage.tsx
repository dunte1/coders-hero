import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CreditCard,
  GraduationCap,
  Pencil,
  RefreshCw,
  Shield,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ConfirmDelete } from '@/components/cms/ConfirmDelete';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { MedicalTab } from '@/components/students/MedicalTab';
import { DocumentsTab } from '@/components/students/DocumentsTab';
import { TimelineTab } from '@/components/students/TimelineTab';
import { AttendanceTab } from '@/components/students/AttendanceTab';
import { ReportCardsTab } from '@/components/students/ReportCardsTab';
import { CodingProgressTab } from '@/components/students/CodingProgressTab';
import { FeesTab } from '@/components/students/FeesTab';
import { StudentStatusBadge } from '@/components/students/SisBadges';
import {
  useStudent,
  useDeleteStudent,
  usePromoteStudent,
  useTransferStudent,
  useGraduateStudent,
} from '@/hooks/useStudents';
import { formatDate, getInitials } from '@/lib/utils';

const promoteSchema = z.object({
  new_grade: z.string().optional(),
});

const transferSchema = z.object({
  branch: z.string().min(1, 'Branch is required'),
  note: z.string().optional(),
});

const graduateSchema = z.object({
  graduation_date: z.string().optional(),
});

type PromoteValues = z.infer<typeof promoteSchema>;
type TransferValues = z.infer<typeof transferSchema>;
type GraduateValues = z.infer<typeof graduateSchema>;

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-medium text-slate-900">{value || '—'}</span>
    </div>
  );
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const studentId = id ? parseInt(id, 10) : null;

  const { data: student, isLoading } = useStudent(studentId as number);
  const deleteMutation = useDeleteStudent();
  const promoteMutation = usePromoteStudent();
  const transferMutation = useTransferStudent();
  const graduateMutation = useGraduateStudent();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [graduateOpen, setGraduateOpen] = useState(false);

  const promoteMethods = useForm<PromoteValues>({ resolver: zodResolver(promoteSchema), defaultValues: { new_grade: '' } });
  const transferMethods = useForm<TransferValues>({ resolver: zodResolver(transferSchema), defaultValues: { branch: '', note: '' } });
  const graduateMethods = useForm<GraduateValues>({ resolver: zodResolver(graduateSchema), defaultValues: { graduation_date: '' } });

  if (!studentId) return null;
  if (isLoading) return <PageSpinner />;
  if (!student) return <div className="py-12 text-center text-slate-500">Student not found</div>;

  const guardian = student.guardian;

  const handlePromote = (values: PromoteValues) => {
    promoteMutation.mutate(
      { id: studentId, newGrade: values.new_grade || undefined },
      { onSuccess: () => setPromoteOpen(false) }
    );
  };

  const handleTransfer = (values: TransferValues) => {
    transferMutation.mutate(
      { id: studentId, branch: values.branch, note: values.note || undefined },
      { onSuccess: () => setTransferOpen(false) }
    );
  };

  const handleGraduate = (values: GraduateValues) => {
    graduateMutation.mutate(
      { id: studentId, graduationDate: values.graduation_date || undefined },
      { onSuccess: () => setGraduateOpen(false) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={student.full_name}
        description={`Student ID: ${student.student_id}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Students', href: '/students' },
          { label: student.full_name },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(`/students/${studentId}/id-card`)}>
              <CreditCard className="mr-2 h-4 w-4" />
              ID Card
            </Button>
            <Button variant="outline" onClick={() => setPromoteOpen(true)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Promote
            </Button>
            <Button variant="outline" onClick={() => setTransferOpen(true)}>
              <Shield className="mr-2 h-4 w-4" />
              Transfer
            </Button>
            <Button variant="outline" onClick={() => setGraduateOpen(true)}>
              <GraduationCap className="mr-2 h-4 w-4" />
              Graduate
            </Button>
            <Button variant="outline" onClick={() => navigate(`/students/${studentId}/edit`)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-lg font-medium text-brand-700">
          {student.photo_url ? (
            <img src={student.photo_url} alt={student.full_name} className="h-full w-full object-cover" />
          ) : (
            getInitials(student.first_name, student.last_name)
          )}
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{student.full_name}</h2>
            <p className="text-sm text-slate-500">
              {[student.grade, student.branch].filter(Boolean).join(' · ') || 'No grade / branch assigned'}
            </p>
          </div>
          <StudentStatusBadge status={student.status} />
          <span className="text-xs text-slate-400">Admitted {student.admission_date ? formatDate(student.admission_date) : '—'}</span>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="report-cards">Report Cards</TabsTrigger>
          <TabsTrigger value="progress">Coding Progress</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100">
                <DetailRow label="Student ID" value={student.student_id} />
                <DetailRow label="Gender" value={student.gender} />
                <DetailRow label="Date of Birth" value={student.date_of_birth ? formatDate(student.date_of_birth) : null} />
                <DetailRow label="Age" value={student.age != null ? `${student.age} years` : null} />
                <DetailRow label="Grade" value={student.grade} />
                <DetailRow label="Branch" value={student.branch} />
                <DetailRow label="Status" value={student.status} />
                <DetailRow label="Admission Date" value={student.admission_date ? formatDate(student.admission_date) : null} />
                <DetailRow label="Graduation Date" value={student.graduation_date ? formatDate(student.graduation_date) : null} />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-base">Guardian</CardTitle>
                  {guardian && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-brand-600"
                      onClick={() => navigate(`/guardians/${guardian.id}/edit`)}
                    >
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {guardian ? (
                    <div className="divide-y divide-slate-100">
                      <DetailRow label="Name" value={guardian.full_name} />
                      <DetailRow label="Relationship" value={guardian.relationship} />
                      <DetailRow label="Phone" value={guardian.phone} />
                      <DetailRow label="Email" value={guardian.email} />
                      <DetailRow label="Address" value={guardian.address} />
                      <DetailRow label="Occupation" value={guardian.occupation} />
                    </div>
                  ) : (
                    <p className="py-6 text-center text-sm text-slate-500">No guardian assigned.</p>
                  )}
                </CardContent>
              </Card>

              {student.medical_notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Medical Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">{student.medical_notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="report-cards">
          <ReportCardsTab studentId={studentId} />
        </TabsContent>

        <TabsContent value="progress">
          <CodingProgressTab studentId={studentId} />
        </TabsContent>

        <TabsContent value="fees">
          <FeesTab studentId={studentId} />
        </TabsContent>

        <TabsContent value="medical">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Medical Record</CardTitle>
            </CardHeader>
            <CardContent>
              <MedicalTab studentId={studentId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsTab studentId={studentId} />
        </TabsContent>

        <TabsContent value="timeline">
          <TimelineTab studentId={studentId} />
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceTab studentId={studentId} />
        </TabsContent>
      </Tabs>

      <ConfirmDelete
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Student"
        description="Are you sure you want to delete this student? This action cannot be undone."
        loading={deleteMutation.isPending}
        onConfirm={() => {
          deleteMutation.mutate(studentId, { onSuccess: () => navigate('/students') });
        }}
      />

      <DialogRoot open={promoteOpen} onOpenChange={setPromoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote Student</DialogTitle>
            <DialogDescription>
              Promote {student.full_name} to the next grade level.
            </DialogDescription>
          </DialogHeader>
          <FormProvider {...promoteMethods}>
            <form onSubmit={promoteMethods.handleSubmit(handlePromote)} className="space-y-4">
              <Input
                label="New Grade"
                placeholder={student.grade ? `Current: ${student.grade}` : 'e.g. Grade 4'}
                {...promoteMethods.register('new_grade')}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPromoteOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={promoteMutation.isPending}>
                  Promote
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </DialogRoot>

      <DialogRoot open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Student</DialogTitle>
            <DialogDescription>
              Move {student.full_name} to a different branch.
            </DialogDescription>
          </DialogHeader>
          <FormProvider {...transferMethods}>
            <form onSubmit={transferMethods.handleSubmit(handleTransfer)} className="space-y-4">
              <Input
                label="New Branch"
                placeholder="e.g. Main Campus"
                error={transferMethods.formState.errors.branch?.message}
                {...transferMethods.register('branch')}
              />
              <Textarea
                label="Note"
                rows={2}
                placeholder="Optional transfer note"
                {...transferMethods.register('note')}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setTransferOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={transferMutation.isPending}>
                  Transfer
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </DialogRoot>

      <DialogRoot open={graduateOpen} onOpenChange={setGraduateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Graduated</DialogTitle>
            <DialogDescription>
              Mark {student.full_name} as graduated from Coder&apos;s Hero.
            </DialogDescription>
          </DialogHeader>
          <FormProvider {...graduateMethods}>
            <form onSubmit={graduateMethods.handleSubmit(handleGraduate)} className="space-y-4">
              <Input label="Graduation Date" type="date" {...graduateMethods.register('graduation_date')} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setGraduateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={graduateMutation.isPending}>
                  Graduate
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
