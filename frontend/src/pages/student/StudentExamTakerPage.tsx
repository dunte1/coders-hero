import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useExamDetail, useStartExamAttempt, useSubmitExamAttempt } from '@/hooks/useMyExams';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function StudentExamTakerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: examData, isLoading: loadingExam } = useExamDetail(Number(id));
  const startMutation = useStartExamAttempt();
  const submitMutation = useSubmitExamAttempt();

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [attemptStarted, setAttemptStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const exam = examData as any;
  const questions = exam?.questions ?? [];

  useEffect(() => {
    if (exam && !attemptStarted && !submitted) {
      startMutation.mutate(Number(id), {
        onSuccess: () => {
          setAttemptStarted(true);
          setTimeLeft((exam.duration_minutes ?? 30) * 60);
        },
      });
    }
  }, [exam]);

  useEffect(() => {
    if (!attemptStarted || submitted || timeLeft <= 0) return;
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
  }, [attemptStarted, submitted, timeLeft]);

  const handleAnswer = useCallback((questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (submitted) return;
    submitMutation.mutate(
      { id: Number(id), answers },
      {
        onSuccess: (data) => {
          setResult(data);
          setSubmitted(true);
        },
      }
    );
  }, [id, answers, submitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loadingExam) return <PageSpinner />;
  if (!exam) return null;

  if (submitted && result) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Exam Result"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'My Exams', href: '/student/exams' },
            { label: 'Result' },
          ]}
        />
        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
            <h2 className="text-2xl font-bold text-slate-900">Exam Submitted</h2>
            <div className="text-4xl font-bold text-slate-900">
              {result.earned_points ?? result.score ?? 0} / {result.total_points ?? exam.total_marks ?? 0}
            </div>
            <p className="text-slate-500">Your exam has been graded successfully.</p>
            <Button onClick={() => navigate('/student/exams')}>Back to Exams</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={exam.title ?? 'Exam'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'My Exams', href: '/student/exams' },
          { label: 'Take Exam' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Badge variant={timeLeft < 300 ? 'destructive' : 'secondary'} className="gap-1 text-base px-3 py-1">
              <Clock className="h-4 w-4" /> {formatTime(timeLeft)}
            </Badge>
            <Button onClick={() => setShowConfirm(true)} disabled={submitMutation.isPending}>
              Submit Exam
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question navigation sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q: any, idx: number) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`h-9 rounded-md text-sm font-medium transition-colors ${
                      idx === currentQuestion
                        ? 'bg-blue-600 text-white'
                        : answers[q.id]
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-xs text-slate-500">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded bg-blue-600" /> Current
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" /> Answered
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current question */}
        <div className="lg:col-span-3">
          {questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-slate-400">Question {currentQuestion + 1} of {questions.length}</span>
                  <Badge variant="outline">{questions[currentQuestion].points} pts</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-900 font-medium">{questions[currentQuestion].question}</p>

                <div className="space-y-2">
                  {questions[currentQuestion].options.map((option: string, optIdx: number) => {
                    const letter = String.fromCharCode(65 + optIdx);
                    const isSelected = answers[questions[currentQuestion].id] === option;
                    return (
                      <label
                        key={optIdx}
                        className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${questions[currentQuestion].id}`}
                          checked={isSelected}
                          onChange={() => handleAnswer(questions[currentQuestion].id, option)}
                          className="mt-0.5"
                        />
                        <span className="text-sm">
                          <span className="font-medium text-slate-500">{letter}.</span>{' '}
                          {option}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </Button>
                  {currentQuestion < questions.length - 1 ? (
                    <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
                      Next
                    </Button>
                  ) : (
                    <Button onClick={() => setShowConfirm(true)}>
                      Review & Submit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
                <div>
                  <h3 className="font-semibold text-slate-900">Submit Exam?</h3>
                  <p className="text-sm text-slate-500">
                    {Object.keys(answers).length} of {questions.length} questions answered.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowConfirm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? 'Submitting...' : 'Confirm Submit'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
