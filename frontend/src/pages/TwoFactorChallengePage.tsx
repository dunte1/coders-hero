import { Link } from 'react-router-dom';
import { Rocket, Shield } from 'lucide-react';
import { TwoFactorChallengeForm } from '@/components/features/auth/TwoFactorChallengeForm';

export default function TwoFactorChallengePage() {
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

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm auth-entrance">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
              <Shield className="h-6 w-6 text-brand-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Two-Factor Authentication</h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>
          <TwoFactorChallengeForm />
        </div>
      </div>
    </div>
  );
}
