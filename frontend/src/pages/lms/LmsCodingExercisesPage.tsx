import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Code2, Bookmark } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/Select';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useCodingExercises } from '@/hooks/useLms';
import { useToggleBookmark } from '@/hooks/useLms';
import type { CodingExercise } from '@/types/lms';
import type { Column } from '@/components/ui/DataTable';

const difficultyColors: Record<string, 'success' | 'warning' | 'destructive'> = {
  easy: 'success',
  medium: 'warning',
  hard: 'destructive',
};

export default function LmsCodingExercisesPage() {
  const courseId = Number(new URLSearchParams(window.location.search).get('course_id') ?? 0);
  const [page, setPage] = useState(1);
  const [difficulty, setDifficulty] = useState('');
  const { data, isLoading } = useCodingExercises(courseId || 1, { page, difficulty: difficulty || undefined });
  const toggleBookmark = useToggleBookmark();

  const exercises = data?.results ?? [];

  const columns: Column<CodingExercise>[] = [
    {
      key: 'title',
      header: 'Exercise',
      render: (e) => (
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-brand-600" />
          <Link to={`/lms/coding-exercises/${e.id}`} className="font-medium text-slate-900 hover:text-brand-600">
            {e.title}
          </Link>
        </div>
      ),
    },
    {
      key: 'difficulty',
      header: 'Difficulty',
      render: (e) => <StatusBadge status={e.difficulty} className={`bg-${difficultyColors[e.difficulty]}`} />,
    },
    { key: 'language', header: 'Language', render: (e) => e.language ?? 'Python' },
    {
      key: 'user_submissions_count',
      header: 'My Attempts',
      render: (e) => e.user_submissions_count ?? 0,
    },
    {
      key: 'submissions_count',
      header: 'Total Submissions',
      render: (e) => e.submissions_count ?? 0,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coding Exercises"
        description="Practice coding problems tied to your course."
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Exercises</CardTitle>
          <SelectRoot value={difficulty} onValueChange={(v) => { setDifficulty(v); setPage(1); }}>
            <SelectTrigger className="w-40"><SelectValue placeholder="All difficulties" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </SelectRoot>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={exercises}
            totalCount={data?.meta.total ?? 0}
            page={page}
            onPageChange={setPage}
            loading={isLoading}
            searchable={false}
            emptyTitle="No exercises"
            rowActions={(e) => (
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleBookmark.mutate({ type: 'lesson', id: e.id })}
              >
                <Bookmark className="mr-1 h-3 w-3" />Save
              </Button>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
