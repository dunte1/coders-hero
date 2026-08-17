import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Clock, Users, Star } from 'lucide-react';
import type { Course } from '@/types';
import { formatCurrency, getInitials } from '@/lib/utils';

interface CourseCardProps {
  course: Course;
  progress?: number;
}

export function CourseCard({ course, progress }: CourseCardProps) {
  return (
    <Link to={`/courses/${course.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-200">
        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-4xl font-bold text-brand-600/30">
                {course.title.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge variant={course.is_published ? 'success' : 'secondary'}>
              {course.is_published ? 'Published' : 'Draft'}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
              {course.level}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="mb-2">
            <Badge variant="secondary" className="text-[10px]">
              {course.category?.name || 'Uncategorized'}
            </Badge>
          </div>
          <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2 group-hover:text-brand-600 transition-colors">
            {course.title}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={course.instructor?.avatar} />
              <AvatarFallback className="text-[10px]">
                {getInitials(
                  course.instructor?.first_name || 'I',
                  course.instructor?.last_name || 'N'
                )}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-slate-500">
              {course.instructor?.first_name} {course.instructor?.last_name}
            </span>
          </div>

          {progress !== undefined && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500">Progress</span>
                <span className="text-xs font-medium text-slate-700">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {course.enrollment_count}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {course.average_rating.toFixed(1)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {course.level}
            </div>
            <span className="font-semibold text-slate-900">
              {course.price > 0 ? formatCurrency(course.price) : 'Free'}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
