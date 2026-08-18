import { useNavigate } from 'react-router-dom';
import { useCreateTask } from '@/hooks/useTasks';
import { TaskForm } from '@/components/features/tasks/TaskForm';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

export default function TaskCreatePage() {
  const navigate = useNavigate();
  const { mutate: createTask, isPending } = useCreateTask();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Create Task</h1>
        <p className="text-muted-foreground">Create a new task for your team.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <div className="p-6">
          <TaskForm
            onSubmit={(data) => {
              createTask(data, {
                onSuccess: () => navigate('/tasks'),
              });
            }}
            isLoading={isPending}
          />
        </div>
      </Card>
    </div>
  );
}
