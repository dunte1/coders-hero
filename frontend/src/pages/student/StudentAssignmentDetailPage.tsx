import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentAssignmentsApi } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface AssignmentDetail {
  id: number;
  title: string;
  description: string;
  instructions: string | null;
  type: string;
  max_score: number;
  due_at: string | null;
  status: string;
  is_overdue: boolean;
  attachments: string[] | null;
  teacher: { id: number; name: string } | null;
  class: { id: number; name: string } | null;
  course: { id: number; title: string } | null;
  submission: {
    id: number;
    content: string;
    file_name: string | null;
    status: string;
    score: number | null;
    feedback: string | null;
    is_late: boolean;
    submitted_at: string;
    graded_at: string | null;
  } | null;
}

export default function StudentAssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const { data: assignment, isLoading } = useQuery({
    queryKey: ['student-assignment', id],
    queryFn: () => studentAssignmentsApi.show(Number(id)),
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: (formData: FormData) => studentAssignmentsApi.submit(Number(id), formData),
    onSuccess: () => {
      toast.success('Assignment submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['student-assignment', id] });
      queryClient.invalidateQueries({ queryKey: ['student-assignments'] });
      setContent('');
      setFile(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit assignment');
    },
  });

  const handleSubmit = () => {
    if (!content.trim() && !file) {
      toast.error('Please provide content or attach a file');
      return;
    }

    const formData = new FormData();
    if (content.trim()) formData.append('content', content);
    if (file) formData.append('file', file);
    submitMutation.mutate(formData);
  };

  if (isLoading) return <PageSpinner />;
  if (!assignment) return null;

  const a = assignment as AssignmentDetail;

  return (
    <div className="space-y-6">
      <PageHeader
        title={a.title}
        description={a.description}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Assignments', href: '/student/assignments' },
          { label: a.title },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {a.instructions && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-1">Instructions</h4>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{a.instructions}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Type:</span>{' '}
                  <span className="font-medium capitalize">{a.type}</span>
                </div>
                <div>
                  <span className="text-slate-500">Max Score:</span>{' '}
                  <span className="font-medium">{a.max_score}</span>
                </div>
                {a.teacher && (
                  <div>
                    <span className="text-slate-500">Teacher:</span>{' '}
                    <span className="font-medium">{a.teacher.name}</span>
                  </div>
                )}
                {a.class && (
                  <div>
                    <span className="text-slate-500">Class:</span>{' '}
                    <span className="font-medium">{a.class.name}</span>
                  </div>
                )}
                {a.course && (
                  <div>
                    <span className="text-slate-500">Course:</span>{' '}
                    <span className="font-medium">{a.course.title}</span>
                  </div>
                )}
                {a.due_at && (
                  <div>
                    <span className="text-slate-500">Due Date:</span>{' '}
                    <span className={`font-medium ${a.is_overdue ? 'text-red-600' : ''}`}>
                      {formatDate(a.due_at)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {!a.submission ? (
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Type your answer or paste a link to your work..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Attach a file (optional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept=".pdf,.doc,.docx,.txt,.zip"
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending || (!content.trim() && !file)}
                >
                  {submitMutation.isPending ? 'Submitting...' : 'Submit Assignment'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Your Submission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Status:</span>
                  <Badge variant={a.submission.status === 'graded' ? 'secondary' : 'default'}>
                    {a.submission.status === 'graded' ? 'Graded' : 'Submitted'}
                  </Badge>
                  {a.submission.is_late && <Badge variant="destructive">Late</Badge>}
                </div>
                {a.submission.content && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-1">Your Answer</h4>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded-md">
                      {a.submission.content}
                    </p>
                  </div>
                )}
                {a.submission.file_name && (
                  <div className="text-sm">
                    <span className="text-slate-500">File:</span>{' '}
                    <span className="font-medium">{a.submission.file_name}</span>
                  </div>
                )}
                <div className="text-sm text-slate-500">
                  Submitted: {formatDate(a.submission.submitted_at)}
                </div>
                {a.submission.status === 'graded' && (
                  <div className="border-t pt-4 mt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Score:</span>{' '}
                        <span className="font-medium text-lg">
                          {a.submission.score} / {a.max_score}
                        </span>
                      </div>
                      {a.submission.graded_at && (
                        <div>
                          <span className="text-slate-500">Graded:</span>{' '}
                          <span className="font-medium">{formatDate(a.submission.graded_at)}</span>
                        </div>
                      )}
                    </div>
                    {a.submission.feedback && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-slate-700 mb-1">Feedback</h4>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md">
                          {a.submission.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardContent className="pt-6">
              <Link to="/student/assignments">
                <Button variant="outline" className="w-full">Back to Assignments</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
