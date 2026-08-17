import { Link } from 'react-router-dom';
import {
  TwoFactorChallengeForm,
  TwoFactorChallengeBackLink,
} from '@/components/features/auth/TwoFactorChallengeForm';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { GraduationCap, ShieldCheck } from 'lucide-react';

export default function TwoFactorChallengePage() {
  const requiresTwoFactor = useAuthStore((state) => state.requiresTwoFactor);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Secure your account</h1>
          <p className="mt-2 text-slate-500">
            Two-factor authentication is enabled on your account.
          </p>
        </div>

        {requiresTwoFactor ? (
          <>
            <TwoFactorChallengeForm />
            <TwoFactorChallengeBackLink />
          </>
        ) : (
          <Card>
            <CardHeader className="items-center text-center">
              <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <ShieldCheck className="h-7 w-7 text-emerald-600" />
              </div>
              <CardTitle className="text-xl">No verification needed</CardTitle>
              <CardDescription>
                Two-factor authentication is not required for this session. You can sign in
                directly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/login">
                <Button className="w-full">Go to login</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
