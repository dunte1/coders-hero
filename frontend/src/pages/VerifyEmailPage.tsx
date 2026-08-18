import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Rocket, Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const hash = searchParams.get('hash');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  const { mutate: verify } = useMutation({
    mutationFn: () => authApi.verifyEmail(id!, hash!),
    onSuccess: () => setStatus('success'),
    onError: () => setStatus('error'),
  });

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendEmailVerification(),
  });

  useEffect(() => {
    if (id && hash) {
      verify();
    } else {
      setStatus('error');
    }
  }, [id, hash]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white">
              <Rocket className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-bold text-slate-900">Coder's Hero</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          {status === 'verifying' && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
                <Mail className="h-6 w-6 text-brand-600 animate-pulse" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Verifying your email...</h1>
              <p className="mt-2 text-sm text-slate-500">Please wait a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Email verified!</h1>
              <p className="mt-2 text-sm text-slate-500">
                Your email has been verified. You can now access all features.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
              >
                Continue to Sign In
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-7 w-7 text-red-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Verification failed</h1>
              <p className="mt-2 text-sm text-slate-500">
                This verification link is invalid or has expired.
              </p>
              <div className="mt-6 space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  loading={resendMutation.isPending}
                  onClick={() => resendMutation.mutate()}
                >
                  Resend verification email
                </Button>
                {resendMutation.isSuccess && (
                  <p className="text-sm text-emerald-600">Verification email sent!</p>
                )}
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
