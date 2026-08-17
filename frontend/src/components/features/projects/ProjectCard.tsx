import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Users, CheckSquare } from 'lucide-react';
import type { Project } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
              {project.name}
            </h3>
            <Badge className={getStatusColor(project.status)}>
              {project.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </Badge>
          </div>

          <p className="text-sm text-slate-500 line-clamp-2 mb-4">
            {project.description}
          </p>

          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Progress</span>
              <span className="text-xs font-medium text-slate-700">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-1.5" />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {project.member_count} members
            </div>
            <div className="flex items-center gap-1">
              <CheckSquare className="h-3.5 w-3.5" />
              {project.task_count} tasks
            </div>
            {project.end_date && (
              <span>Due {formatDate(project.end_date)}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
