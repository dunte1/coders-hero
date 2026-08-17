import { useParams } from 'react-router-dom';
import { useTask } from '@/hooks/useTasks';
import { useChangeTaskStatus } from '@/hooks/useTasks';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { getInitials, formatDate, getPriorityColor } from '@/lib/utils';
import { Calendar, User, ArrowRight } from 'lucide-react';

const nextStatus: Record<string, string> = {
  pending: 'in_progress',
  in_progress: 'review',
  review: 'completed',
};

const statusLabels: Record<string, string> = {
  in_progress: 'Start Progress',
  review: 'Submit for Review',
  completed: 'Mark Complete',
};

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: task, isLoading } = useTask(parseInt(id || '0'));
  const changeStatus = useChangeTaskStatus();

  if (isLoading) return <PageSpinner />;
  if (!task) return <div className="text-center py-12 text-slate-500">Task not found</div>;

  const next = nextStatus[task.status];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title={task.title}
        breadcrumbs={[
          { label: 'Tasks', href: '/tasks' },
          { label: task.title },
        ]}
        actions={
          next && (
            <Button onClick={() => changeStatus.mutate({ id: task.id, status: next })}>
              <ArrowRight className="h-4 w-4 mr-1" />
              {statusLabels[next]}
            </Button>
          )
        }
      />

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <StatusBadge status={task.status} />
            <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
          </div>

          {task.description && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-1">Description</h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            {task.assignee && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Assignee:</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assignee.avatar} />
                    <AvatarFallback className="text-[9px]">
                      {getInitials(task.assignee.first_name, task.assignee.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  {task.assignee.first_name} {task.assignee.last_name}
                </div>
              </div>
            )}
            {task.due_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Due:</span>
                {formatDate(task.due_date)}
              </div>
            )}
          </div>

          <div className="text-xs text-slate-400 pt-4 border-t">
            Created: {formatDate(task.created_at)} &middot; Updated: {formatDate(task.updated_at)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
