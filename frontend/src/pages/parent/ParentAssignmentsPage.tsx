import { ClipboardList } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useParentAssignments } from '@/hooks/useParentPortal';
import { formatDate } from '@/lib/utils';

interface AssignmentItem {
  id: number;
  title: string;
  status: string;
  score: number | null;
  feedback: string | null;
  student_name?: string;
  submitted_at?: string | null;
  max_score?: number;
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  draft: 'outline',
  submitted: 'default',
  graded: 'success',
};

export default function ParentAssignmentsPage() {
  const { data, isLoading } = useParentAssignments(); const d: any = data;;

  if (isLoading) return <PageSpinner />;

  const assignments = Array.isArray(d) ? data : (d?.results ?? []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        description="View your child's assignment submissions and grades"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Parent Portal', href: '/parent' }, { label: 'Assignments' }]}
      />

      {assignments.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={ClipboardList}
              title="No assignments found"
              description="There are no assignment records to display."
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-3">Assignment</th>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Score</th>
                    <th className="px-6 py-3">Feedback</th>
                    <th className="px-6 py-3">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignments.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{item.title}</td>
                      <td className="px-6 py-4 text-slate-600">{item.student_name ?? 'â€”'}</td>
                      <td className="px-6 py-4">
                        <Badge variant={statusVariant[item.status] ?? 'secondary'}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {item.score != null ? `${item.score}${item.max_score ? ` / ${item.max_score}` : ''}` : 'â€”'}
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                        {item.feedback || 'â€”'}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {item.submitted_at ? formatDate(item.submitted_at) : 'â€”'}
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
