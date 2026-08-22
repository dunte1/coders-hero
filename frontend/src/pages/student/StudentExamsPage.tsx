import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useAvailableExams, useMyExamAttempts } from '@/hooks/useMyExams';
import { FileText, Clock, Award, CheckCircle } from 'lucide-react';
import type { ExamAttempt } from '@/types';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  in_progress: 'default',
  submitted: 'secondary',
  graded: 'default',
};

export default function StudentExamsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('available');
  const { data: examsData, isLoading: loadingExams } = useAvailableExams();
  const { data: attemptsData, isLoading: loadingAttempts } = useMyExamAttempts();

  if (loadingExams || loadingAttempts) return <PageSpinner />;

  const exams = (examsData?.results ?? []) as ExamAttempt[];
  const attempts = (attemptsData?.results ?? []) as ExamAttempt[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Exams"
        description="View available exams and your attempt history"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'My Exams' }]}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="available" className="gap-1.5">
            <FileText className="h-4 w-4" /> Available Exams
          </TabsTrigger>
          <TabsTrigger value="attempts" className="gap-1.5">
            <CheckCircle className="h-4 w-4" /> My Attempts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          {exams.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No exams available"
              description="There are no exams available at the moment."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {exams.map((attempt) => (
                <Card key={attempt.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 line-clamp-2">
                        {attempt.exam?.title ?? 'Exam'}
                      </h3>
                      <Badge variant="outline">{attempt.exam?.type ?? 'exam'}</Badge>
                    </div>

                    <div className="space-y-1 text-sm text-slate-500 mb-4">
                      {attempt.exam?.duration_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {attempt.exam.duration_minutes} minutes
                        </div>
                      )}
                      {attempt.exam?.total_marks != null && (
                        <div className="flex items-center gap-1">
                          <Award className="h-3.5 w-3.5" /> Total marks: {attempt.exam.total_marks}
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => navigate(`/student/exams/${attempt.exam?.id ?? attempt.id}/take`)}
                    >
                      Start Exam
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="attempts">
          {attempts.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No attempts yet"
              description="You haven't taken any exams yet."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {attempts.map((attempt) => (
                <Card key={attempt.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 line-clamp-2">
                        {attempt.exam?.title ?? 'Exam'}
                      </h3>
                      <Badge variant={statusVariant[attempt.status] ?? 'outline'}>
                        {attempt.status}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm text-slate-500">
                      {attempt.score != null && (
                        <div className="flex items-center gap-1">
                          <Award className="h-3.5 w-3.5" /> Score: {attempt.score} / {attempt.total_points}
                        </div>
                      )}
                      {attempt.submitted_at && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> Submitted: {new Date(attempt.submitted_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
