import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface LessonMaterial {
  id: number;
  title: string;
  content?: string | null;
  note_date?: string | null;
  lesson?: { id: number; title: string } | null;
  class?: { id: number; name: string } | null;
  teacher?: { id: number; name: string } | null;
  attachments: { name?: string; size?: number | null; url?: string }[];
}

export function useMyClasses() {
  return useQuery({
    queryKey: ['student-classes'],
    queryFn: () => api.get('/student/classes').then(r => r.data),
  });
}

export function useMyLessonMaterials(classId?: number) {
  return useQuery({
    queryKey: ['student-lesson-materials', classId ?? 'all'],
    queryFn: () =>
      api
        .get<{ data: LessonMaterial[] }>('/student/lesson-notes', {
          params: classId ? { class_id: classId } : undefined,
        })
        .then(r => r.data.data),
  });
}
