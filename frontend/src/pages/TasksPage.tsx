import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks, useChangeTaskStatus } from '@/hooks/useTasks';
import { TaskBoard } from '@/components/features/tasks/TaskBoard';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { LayoutGrid, List } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { getPriorityColor, getStatusColor } from '@/lib/utils';
import type { Task } from '@/types';

export default function TasksPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<'board' | 'list'>('board');
  const { data, isLoading, isError } = useTasks();
  const changeStatus = useChangeTaskStatus();

  const tasks = data?.results || [];

  const listColumns: Column<Task>[] = [
    {
      key: 'title',
      header: 'Task',
      sortable: true,
      render: (item) => <span className="font-medium text-slate-900">{item.title}</span>,
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (item) => <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <Badge className={getStatusColor(item.status)}>{item.status.replace(/_/g, ' ')}</Badge>,
    },
    {
      key: 'assignee',
      header: 'Assignee',
      render: (item) => item.assignee ? `${item.assignee.first_name} ${item.assignee.last_name}` : 'Unassigned',
    },
    {
      key: 'due_date',
      header: 'Due Date',
      render: (item) => item.due_date ? new Date(item.due_date).toLocaleDateString() : '-',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Manage and track all tasks"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Tasks' }]}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
              <Button variant={view === 'board' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('board')}>
                <LayoutGrid className="h-4 w-4 mr-1" /> Board
              </Button>
              <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('list')}>
                <List className="h-4 w-4 mr-1" /> List
              </Button>
            </div>
            <Button onClick={() => navigate('/tasks/create')}>New Task</Button>
          </div>
        }
      />

      {isLoading ? (
        <PageSpinner />
      ) : isError ? (
        <EmptyState title="Could not load tasks" description="Please try again later." />
      ) : view === 'board' ? (
        <TaskBoard
          tasks={tasks}
          onStatusChange={(taskId, status) => changeStatus.mutate({ id: taskId, status })}
          onTaskClick={(task) => navigate(`/tasks/${task.id}`)}
        />
      ) : (
        <DataTable
          columns={listColumns}
          data={tasks}
          totalCount={data?.count || 0}
          onRowClick={(item) => navigate(`/tasks/${item.id}`)}
        />
      )}
    </div>
  );
}
