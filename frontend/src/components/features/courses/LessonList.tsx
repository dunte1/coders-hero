import { GripVertical, Play, Clock, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Lesson } from '@/types';

interface LessonListProps {
  lessons: Lesson[];
  onEdit?: (lesson: Lesson) => void;
  onDelete?: (lessonId: number) => void;
  onReorder?: (lessonIds: number[]) => void;
}

export function LessonList({ lessons, onEdit, onDelete }: LessonListProps) {
  const sorted = [...lessons].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-2">
      {sorted.map((lesson, index) => (
        <div
          key={lesson.id}
          className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="cursor-grab text-slate-400 hover:text-slate-600">
              <GripVertical className="h-4 w-4" />
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 text-sm font-medium shrink-0">
              {index + 1}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium text-slate-900 truncate">
                {lesson.title}
              </h4>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {lesson.duration_minutes} min
                </span>
                {lesson.is_free && (
                  <span className="text-emerald-600 font-medium">Free</span>
                )}
                {lesson.video_url && (
                  <span className="flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    Video
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(lesson)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete(lesson.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
