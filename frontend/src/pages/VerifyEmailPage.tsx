import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { CheckCircle2, GraduationCap, MailWarning } from 'lucide-react';

type VerifyState = 'verifying' | 'success' | 'error';

export default function VerifyEmailPage() {
  const { id, hash } = useParams<{ id: string; hash: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, resendEmailVerification } = useAuth();
  const [state, setState] = useState<VerifyState>('verifying');

  useEffect(() => {
    if (!id || !hash) {
      setState('error');
      return;
    }
    let cancelled = false;
    authApi
      .verifyEmail(id, hash)
      .then(() => {
        if (!cancelled) setState('success');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [id, hash]);

  const destinationLabel = isAuthenticated ? 'Go to dashboard' : 'Go to login';

  const handleContinue = () => {
    navigate(isAuthenticated ? '/dashboard' : '/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Email Verification</h1>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          {state === 'verifying' && (
            <div className="space-y-4">
              <PageSpinner />
              <p className="text-sm text-slate-500">Verifying your email address...</p>
            </div>
          )}

          {state === 'success' && (
            <div className="space-y-4">
              <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
              <h2 className="text-lg font-semibold text-slate-900">Email verified!</h2>
              <p className="text-sm text-slate-500">
                Your email address has been successfully verified. You can now access all features
                of the platform.
              </p>
              <Button className="w-full" onClick={handleContinue}>
                {destinationLabel}
              </Button>
            </div>
          )}

          {state === 'error' && (
            <div className="space-y-4">
              <MailWarning className="mx-auto h-14 w-14 text-amber-500" />
              <h2 className="text-lg font-semibold text-slate-900">Verification failed</h2>
              <p className="text-sm text-slate-500">
                The verification link is invalid or has expired. Request a new verification email
                to continue.
              </p>
              <Button
                className="w-full"
                onClick={() => resendEmailVerification.mutate()}
                loading={resendEmailVerification.isPending}
              >
                Resend verification email
              </Button>
              <p className="text-sm text-slate-500">
                <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
                  Back to login
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
