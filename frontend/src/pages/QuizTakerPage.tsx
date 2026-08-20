import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { quizzesApi } from '@/lib/api';
import { QuizTaker } from '@/components/features/quizzes/QuizTaker';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { QuizSubmission } from '@/types';

export default function QuizTakerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => quizzesApi.getQuizzes({}).then((res) => res.results.find((q) => q.id === parseInt(id || '0'))),
    enabled: !!id,
  });

  if (isLoading) return <PageSpinner />;
  if (!quiz) return (
    <div className="flex flex-col items-center justify-center py-20">
      <EmptyState
        icon={HelpCircle}
        title="Quiz not found"
        description="The quiz you're looking for doesn't exist or has been removed."
      />
    </div>
  );

  const handleSubmit = async (answers: QuizSubmission[]) => {
    try {
      const result = await quizzesApi.submitQuiz(quiz.id, answers);
      toast.success(`Quiz completed! Score: ${result.score}%`);
      navigate('/quizzes');
    } catch {
      toast.error('Failed to submit quiz');
    }
  };

  return <QuizTaker quiz={quiz} onSubmit={handleSubmit} />;
}
