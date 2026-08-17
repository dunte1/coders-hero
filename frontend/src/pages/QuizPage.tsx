import { useQuery } from '@tanstack/react-query';
import { quizzesApi } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Clock, HelpCircle, Award } from 'lucide-react';

export default function QuizPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: () => quizzesApi.getQuizzes({ page_size: 50 }),
  });

  const quizzes = data?.results || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quizzes"
        description="Test your knowledge"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Quizzes' }]}
      />

      {isLoading ? (
        <PageSpinner />
      ) : quizzes.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No quizzes available</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <h3 className="font-semibold text-slate-900 mb-2">{quiz.title}</h3>
                {quiz.description && (
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">{quiz.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <HelpCircle className="h-3.5 w-3.5" />
                    {quiz.questions?.length || 0} questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {quiz.time_limit_minutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" />
                    {quiz.passing_score}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{quiz.course?.title || 'General'}</Badge>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/quizzes/${quiz.id}/take`)}
                  >
                    Start Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
