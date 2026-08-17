import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Calendar, AlertTriangle } from 'lucide-react';
import { formatDate, getPriorityColor } from '@/lib/utils';

interface Deadline {
  id: number;
  title: string;
  type: 'task' | 'quiz' | 'project';
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export function UpcomingDeadlines() {
  const deadlines: Deadline[] = [
    {
      id: 1,
      title: 'Final Project Submission',
      type: 'project',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
      priority: 'urgent',
    },
    {
      id: 2,
      title: 'React Hooks Quiz',
      type: 'quiz',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
      priority: 'high',
    },
    {
      id: 3,
      title: 'Database Schema Review',
      type: 'task',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      priority: 'medium',
    },
    {
      id: 4,
      title: 'API Documentation Update',
      type: 'task',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
      priority: 'low',
    },
  ];

  const typeLabels: Record<string, string> = {
    task: 'Task',
    quiz: 'Quiz',
    project: 'Project',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {deadlines.map((deadline) => (
            <div
              key={deadline.id}
              className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors"
            >
              <div className="rounded-lg bg-brand-50 p-1.5">
                <Calendar className="h-4 w-4 text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {deadline.title}
                </p>
                <p className="text-xs text-slate-500">
                  {typeLabels[deadline.type]} &middot; Due {formatDate(deadline.dueDate)}
                </p>
              </div>
              <Badge className={getPriorityColor(deadline.priority)}>
                {deadline.priority === 'urgent' && (
                  <AlertTriangle className="h-3 w-3 mr-1" />
                )}
                {deadline.priority}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
