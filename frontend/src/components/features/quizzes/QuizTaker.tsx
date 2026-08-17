import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Clock, CheckCircle2 } from 'lucide-react';
import type { Quiz, QuizSubmission } from '@/types';

interface QuizTakerProps {
  quiz: Quiz;
  onSubmit: (answers: QuizSubmission[]) => void;
  isSubmitting?: boolean;
}

export function QuizTaker({ quiz, onSubmit, isSubmitting }: QuizTakerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.time_limit_minutes * 60);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    const submissions: QuizSubmission[] = Object.entries(answers).map(
      ([questionId, answer]) => ({
        question_id: parseInt(questionId),
        answer,
      })
    );
    onSubmit(submissions);
  }, [submitted, answers, onSubmit]);

  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted, handleSubmit]);

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectAnswer = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  if (!currentQuestion) {
    return <p className="text-center py-8">No questions available.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{quiz.title}</h2>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-500" />
          <span
            className={`font-mono text-sm font-medium ${
              timeLeft < 60 ? 'text-red-600' : 'text-slate-700'
            }`}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Progress value={progress} className="flex-1" />
        <Badge variant="secondary">
          {currentIndex + 1} / {questions.length}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Question {currentIndex + 1}
            <span className="text-slate-400 font-normal ml-2">
              ({currentQuestion.points} pts)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-900 font-medium">{currentQuestion.question}</p>

          {currentQuestion.question_type === 'multiple_choice' &&
            currentQuestion.options && (
              <div className="space-y-2">
                {currentQuestion.options.filter(Boolean).map((option, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectAnswer(currentQuestion.id, option)}
                    className={`w-full rounded-lg border-2 p-3 text-left text-sm transition-colors ${
                      answers[currentQuestion.id] === option
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

          {currentQuestion.question_type === 'true_false' && (
            <div className="flex gap-3">
              {['true', 'false'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => selectAnswer(currentQuestion.id, val)}
                  className={`flex-1 rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                    answers[currentQuestion.id] === val
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {val.charAt(0).toUpperCase() + val.slice(1)}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.question_type === 'short_answer' && (
            <input
              type="text"
              placeholder="Type your answer..."
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => selectAnswer(currentQuestion.id, e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((prev) => prev - 1)}
        >
          Previous
        </Button>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <CheckCircle2 className="h-4 w-4" />
          {answeredCount} of {questions.length} answered
        </div>

        {currentIndex === questions.length - 1 ? (
          <Button onClick={handleSubmit} loading={isSubmitting}>
            Submit Quiz
          </Button>
        ) : (
          <Button onClick={() => setCurrentIndex((prev) => prev + 1)}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
