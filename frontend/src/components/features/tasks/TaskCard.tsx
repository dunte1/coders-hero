import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Calendar, ArrowRight } from 'lucide-react';
import type { Task } from '@/types';
import { getInitials, getPriorityColor, formatRelativeDate } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: number, status: string) => void;
  onClick?: () => void;
}

const nextStatus: Record<string, string> = {
  pending: 'in_progress',
  in_progress: 'review',
  review: 'completed',
  completed: 'completed',
};

export function TaskCard({ task, onStatusChange, onClick }: TaskCardProps) {
  const next = nextStatus[task.status];

  return (
    <div
      className="rounded-lg bg-white border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-slate-900 line-clamp-2 flex-1">
          {task.title}
        </h4>
        <Badge className={`ml-2 shrink-0 ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </Badge>
      </div>

      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee.avatar} />
              <AvatarFallback className="text-[9px]">
                {getInitials(task.assignee.first_name, task.assignee.last_name)}
              </AvatarFallback>
            </Avatar>
          )}
          {task.due_date && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Calendar className="h-3 w-3" />
              {formatRelativeDate(task.due_date)}
            </span>
          )}
        </div>
        {onStatusChange && next !== task.status && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(task.id, next);
            }}
            className="flex items-center gap-1 text-[11px] text-brand-600 hover:text-brand-700 font-medium"
          >
            Move <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
