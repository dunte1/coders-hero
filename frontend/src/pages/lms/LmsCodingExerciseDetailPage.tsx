import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, RefreshCw, Lightbulb, Bug, Trophy, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { CodeEditor } from '@/components/lms/CodeEditor';
import {
  useCodingDebug,
  useCodingExercise,
  useCodingHint,
  useCodingLeaderboardForExercise,
  useSubmitCoding,
} from '@/hooks/useLms';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { CodingAiResult, CodingSubmission } from '@/types/lms';

const rankStyles: Record<number, string> = {
  1: 'bg-amber-100 text-amber-700',
  2: 'bg-slate-200 text-slate-700',
  3: 'bg-orange-100 text-orange-700',
};

export default function LmsCodingExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const exerciseId = Number(id);
  const { data: exercise, isLoading } = useCodingExercise(exerciseId);
  const submitCoding = useSubmitCoding(exerciseId);
  const codingHint = useCodingHint();
  const codingDebug = useCodingDebug();
  const { data: leaderboardData } = useCodingLeaderboardForExercise(exerciseId);

  const [code, setCode] = useState('');
  const [result, setResult] = useState<CodingSubmission | null>(null);
  const [aiError, setAiError] = useState('');
  const [aiResult, setAiResult] = useState<CodingAiResult | null>(null);

  useEffect(() => {
    if (exercise?.starter_code != null) {
      setCode(exercise.starter_code);
    }
  }, [exercise?.starter_code]);

  useEffect(() => {
    if (!result) return;
    const failed = result.result.find((r) => !r.passed);
    if (failed) {
      setAiError(
        `Test case ${failed.index + 1} failed.\nExpected: ${JSON.stringify(failed.expected)}\nActual: ${JSON.stringify(failed.actual)}`
      );
    }
  }, [result]);

  if (isLoading) return <Spinner />;
  if (!exercise) return <EmptyState title="Exercise not found" />;

  const exerciseLanguage = (exercise.language as 'python' | 'javascript') || 'python';
  const passedCount = result?.result.filter((r) => r.passed).length ?? 0;
  const leaderboard = leaderboardData?.leaderboard ?? [];

  const handleRun = () => {
    submitCoding.mutate(code, {
      onSuccess: (data) => setResult(data),
    });
  };

  const handleHint = () => {
    setAiResult(null);
    codingHint.mutate(
      { code, error_message: aiError },
      { onSuccess: setAiResult }
    );
  };

  const handleDebug = () => {
    setAiResult(null);
    codingDebug.mutate(
      { code, error_output: aiError },
      { onSuccess: setAiResult }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={exercise.title}
        description={exercise.description}
        breadcrumbs={[{ label: 'Coding Exercises', href: '/lms/coding-exercises' }, { label: exercise.title }]}
        actions={<StatusBadge status={exercise.difficulty} />}
      />

      <Link to="/lms/coding-exercises" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" />Back to exercises
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap">
              {exercise.instructions ?? 'Write a solution for this exercise.'}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>Language: {exercise.language ?? 'Python'}</span>
              <span>Test cases: {exercise.test_cases?.length ?? 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Solution</CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setCode(exercise.starter_code ?? '')}>
                <RefreshCw className="mr-1 h-3 w-3" />Reset
              </Button>
              <Button size="sm" onClick={handleRun} loading={submitCoding.isPending}>
                <Play className="mr-1 h-3 w-3" />Run Tests
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CodeEditor
              value={code}
              onChange={setCode}
              language={exerciseLanguage}
              height="320px"
              placeholder="# Write your solution here"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-brand-600" />AI Helper
            </CardTitle>
            {aiResult?.meta?.fallback && <Badge variant="secondary">offline hints</Badge>}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-slate-500">
              Stuck? Paste the error you're seeing and ask the AI for a hint or a debugging guide.
            </div>
            <textarea
              value={aiError}
              onChange={(e) => setAiError(e.target.value)}
              spellCheck={false}
              rows={3}
              className="w-full rounded-lg border border-slate-300 p-3 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
              placeholder="Error message or output (optional)"
            />
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleHint} loading={codingHint.isPending}>
                <Lightbulb className="mr-1 h-3 w-3" />Get Hint
              </Button>
              <Button size="sm" variant="outline" onClick={handleDebug} loading={codingDebug.isPending}>
                <Bug className="mr-1 h-3 w-3" />Debug My Code
              </Button>
            </div>
            {(codingHint.isPending || codingDebug.isPending) && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Spinner size="sm" /> AI is thinking...
              </div>
            )}
            {aiResult && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap">
                {aiResult.content}
              </div>
            )}
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>
                Results — {passedCount}/{result.result.length} passed
              </CardTitle>
              <StatusBadge status={result.status} />
            </CardHeader>
            <CardContent className="space-y-3">
              {result.result.map((r, i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-lg border p-3 text-sm',
                    r.passed ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
                  )}
                >
                  <p className="font-medium text-slate-900">Test case {i + 1}: {r.passed ? 'Passed' : 'Failed'}</p>
                  <p className="mt-1 text-slate-600">Input: {JSON.stringify(r.input)}</p>
                  <p className="text-slate-600">Expected: {JSON.stringify(r.expected)}</p>
                  {!r.passed && <p className="text-slate-600">Actual: {JSON.stringify(r.actual)}</p>}
                </div>
              ))}
              {result.feedback && (
                <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{result.feedback}</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />Leaderboard
          </CardTitle>
          {exercise.course_id && (
            <Link
              to={`/lms/coding-leaderboard?courseId=${exercise.course_id}`}
              className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
            >
              Full leaderboard <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-slate-500">No perfect submissions yet. Be the first!</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {leaderboard.map((entry, index) => (
                <div key={entry.user_id} className="flex items-center gap-3 py-2.5">
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      rankStyles[index + 1] ?? 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900">
                    {entry.user_name}
                  </span>
                  <span className="text-sm text-slate-500">{formatDate(entry.submitted_at)}</span>
                  <Badge variant="success">{entry.score}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
