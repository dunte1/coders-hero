import { TaskCard } from './TaskCard';
import type { Task } from '@/types';

interface TaskBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: number, status: string) => void;
  onTaskClick: (task: Task) => void;
}

const columns = [
  { key: 'pending', label: 'Pending', color: 'bg-amber-50 border-amber-200' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-blue-50 border-blue-200' },
  { key: 'review', label: 'Review', color: 'bg-purple-50 border-purple-200' },
  { key: 'completed', label: 'Completed', color: 'bg-emerald-50 border-emerald-200' },
];

export function TaskBoard({ tasks, onStatusChange, onTaskClick }: TaskBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.key);
        return (
          <div key={col.key} className={`rounded-xl border-2 ${col.color} p-3`}>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="font-semibold text-slate-700 text-sm">{col.label}</h3>
              <span className="text-xs font-medium text-slate-500 bg-white rounded-full px-2 py-0.5">
                {columnTasks.length}
              </span>
            </div>
            <div className="space-y-2 min-h-[200px]">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={onStatusChange}
                  onClick={() => onTaskClick(task)}
                />
              ))}
              {columnTasks.length === 0 && (
                <div className="flex items-center justify-center h-24 text-sm text-slate-400">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
