import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { studentAssignmentsApi } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { ClipboardList, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface Assignment {
  id: number;
  title: string;
  description: string;
  type: string;
  max_score: number;
  due_at: string | null;
  status: string;
  is_overdue: boolean;
  teacher: { id: number; name: string } | null;
  class: { id: number; name: string } | null;
  course: { id: number; title: string } | null;
  submission: {
    id: number;
    status: string;
    score: number | null;
    submitted_at: string;
  } | null;
}

function SubmissionStatusBadge({ assignment }: { assignment: Assignment }) {
  if (!assignment.submission) {
    return (
      <Badge variant={assignment.is_overdue ? 'destructive' : 'secondary'}>
        {assignment.is_overdue ? 'Overdue' : 'Not Submitted'}
      </Badge>
    );
  }

  const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    submitted: { variant: 'default', label: 'Submitted' },
    graded: { variant: 'secondary', label: 'Graded' },
  };

  const config = statusMap[assignment.submission.status] ?? { variant: 'outline' as const, label: assignment.submission.status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export default function StudentAssignmentsPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['student-assignments', search, tab],
    queryFn: () =>
      studentAssignmentsApi.list({
        search: search || undefined,
        status: tab === 'pending' ? 'pending' : undefined,
      }),
  });

  const submitMutation = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      studentAssignmentsApi.submit(id, formData),
    onSuccess: () => {
      toast.success('Assignment submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['student-assignments'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit assignment');
    },
  });

  const assignments = (data?.results as Assignment[]) ?? [];

  const filteredAssignments = assignments.filter((a) => {
    if (tab === 'pending') return !a.submission;
    if (tab === 'submitted') return a.submission && a.submission.status !== 'graded';
    if (tab === 'graded') return a.submission?.status === 'graded';
    return true;
  });

  const handleSubmit = (id: number) => {
    const formData = new FormData();
    formData.append('content', 'Submitted via portal');
    submitMutation.mutate({ id, formData });
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Assignments"
        description="View and submit your assignments"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Assignments' }]}
      />

      <div className="flex items-center gap-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search assignments..." className="w-80" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all" className="gap-1.5">
            <ClipboardList className="h-4 w-4" /> All
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="h-4 w-4" /> Pending
          </TabsTrigger>
          <TabsTrigger value="submitted" className="gap-1.5">
            <CheckCircle className="h-4 w-4" /> Submitted
          </TabsTrigger>
          <TabsTrigger value="graded" className="gap-1.5">
            <AlertTriangle className="h-4 w-4" /> Graded
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {filteredAssignments.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No assignments found"
              description="There are no assignments matching your filter."
            />
          ) : (
            <div className="grid gap-4">
              {filteredAssignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            to={`/student/assignments/${assignment.id}`}
                            className="font-medium text-slate-900 hover:text-blue-600 truncate"
                          >
                            {assignment.title}
                          </Link>
                          <SubmissionStatusBadge assignment={assignment} />
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                          {assignment.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          {assignment.teacher && <span>By {assignment.teacher.name}</span>}
                          {assignment.class && <span>Class: {assignment.class.name}</span>}
                          {assignment.course && <span>Course: {assignment.course.title}</span>}
                          {assignment.due_at && (
                            <span className={assignment.is_overdue ? 'text-red-500' : ''}>
                              Due: {formatDate(assignment.due_at)}
                            </span>
                          )}
                          {assignment.max_score && <span>Max score: {assignment.max_score}</span>}
                        </div>
                        {assignment.submission?.score != null && (
                          <div className="mt-2 text-sm font-medium text-emerald-600">
                            Score: {assignment.submission.score} / {assignment.max_score}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link to={`/student/assignments/${assignment.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                        {!assignment.submission && !assignment.is_overdue && (
                          <Button
                            size="sm"
                            onClick={() => handleSubmit(assignment.id)}
                            disabled={submitMutation.isPending}
                          >
                            Submit
                          </Button>
                        )}
                      </div>
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
