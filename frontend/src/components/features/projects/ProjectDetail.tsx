import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { TaskCard } from '@/components/features/tasks/TaskCard';
import { formatDate, getInitials, formatCurrency } from '@/lib/utils';
import type { ProjectDetail as ProjectDetailType } from '@/types';

interface ProjectDetailProps {
  project: ProjectDetailType;
  onTaskClick: (taskId: number) => void;
}

export function ProjectDetail({ project, onTaskClick }: ProjectDetailProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{project.name}</h2>
            <p className="text-sm text-slate-500 mt-1">{project.description}</p>
          </div>
          <StatusBadge status={project.status} />
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-slate-500">Progress</span>
            <span className="text-sm font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Start Date</span>
            <p className="font-medium">{project.start_date ? formatDate(project.start_date) : '-'}</p>
          </div>
          <div>
            <span className="text-slate-500">End Date</span>
            <p className="font-medium">{project.end_date ? formatDate(project.end_date) : '-'}</p>
          </div>
          <div>
            <span className="text-slate-500">Budget</span>
            <p className="font-medium">{project.budget ? formatCurrency(project.budget) : '-'}</p>
          </div>
          <div>
            <span className="text-slate-500">Owner</span>
            <p className="font-medium">{project.owner?.first_name} {project.owner?.last_name}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tasks ({project.tasks?.length || 0})</TabsTrigger>
          <TabsTrigger value="members">Members ({project.members?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-3">
          {project.tasks && project.tasks.length > 0 ? (
            project.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task.id)}
              />
            ))
          ) : (
            <p className="text-sm text-slate-500 py-8 text-center">No tasks yet</p>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-3">
          {project.members && project.members.length > 0 ? (
            project.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.user.avatar} />
                  <AvatarFallback>
                    {getInitials(member.user.first_name, member.user.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {member.user.first_name} {member.user.last_name}
                  </p>
                  <p className="text-xs text-slate-500">{member.user.email}</p>
                </div>
                <Badge variant="secondary">{member.role}</Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 py-8 text-center">No members yet</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
