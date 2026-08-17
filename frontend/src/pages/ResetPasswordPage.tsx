import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { GraduationCap, KeyRound, ShieldX } from 'lucide-react';
import { toast } from 'sonner';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

type TokenState = 'validating' | 'valid' | 'invalid' | 'submitted';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const [tokenState, setTokenState] = useState<TokenState>('validating');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', password_confirmation: '' },
  });

  useEffect(() => {
    if (!token || !email) {
      setTokenState('invalid');
      return;
    }
    let cancelled = false;
    authApi
      .validateResetToken({ token, email })
      .then((response) => {
        if (!cancelled) setTokenState(response.valid ? 'valid' : 'invalid');
      })
      .catch(() => {
        if (!cancelled) setTokenState('invalid');
      });
    return () => {
      cancelled = true;
    };
  }, [token, email]);

  const onSubmit = async (values: ResetPasswordValues) => {
    try {
      await authApi.resetPassword({
        token,
        email,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });
      setTokenState('submitted');
    } catch (error: { response?: { data?: { detail?: string } } } | unknown) {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail || 'Failed to reset password. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Reset password</h1>
          <p className="mt-2 text-slate-500">
            Coder's Hero ERP & LMS
          </p>
        </div>

        {tokenState === 'validating' && (
          <Card>
            <CardContent className="py-10">
              <PageSpinner />
              <p className="mt-2 text-center text-sm text-slate-500">
                Validating your reset link...
              </p>
            </CardContent>
          </Card>
        )}

        {tokenState === 'invalid' && (
          <Card>
            <CardHeader className="items-center text-center">
              <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <ShieldX className="h-7 w-7 text-red-600" />
              </div>
              <CardTitle className="text-xl">Invalid reset link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired. Request a new link to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/forgot-password">
                <Button className="w-full">Request a new link</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Back to login
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {tokenState === 'valid' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-brand-600" />
                Choose a new password
              </CardTitle>
              <CardDescription>
                Set a new password for <span className="font-medium text-slate-700">{email}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Min. 8 characters"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Repeat your password"
                  error={errors.password_confirmation?.message}
                  {...register('password_confirmation')}
                />
                <Button type="submit" className="w-full" loading={isSubmitting}>
                  Reset password
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {tokenState === 'submitted' && (
          <Card>
            <CardHeader className="items-center text-center">
              <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <KeyRound className="h-7 w-7 text-emerald-600" />
              </div>
              <CardTitle className="text-xl">Password reset successfully</CardTitle>
              <CardDescription>
                Your password has been changed. Sign in with your new password to continue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/login" state={{ email }}>
                <Button className="w-full">Go to login</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
