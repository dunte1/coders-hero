import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Rocket, ArrowLeft, Eye, EyeOff, CheckCircle2, KeyRound } from 'lucide-react';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  });

type Values = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: tokenData, isLoading: validating } = useQuery({
    queryKey: ['validate-reset-token', token, email],
    queryFn: () => authApi.validateResetToken({ token: token!, email: email! }),
    enabled: !!(token && email),
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: (data: { password: string; password_confirm: string; token: string; email: string }) =>
      authApi.resetPassword({ password: data.password, password_confirm: data.password_confirm, token: data.token, email: data.email }),
    onSuccess: () => setSubmitted(true),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', password_confirm: '' },
  });

  const onSubmit = (data: Values) => {
    if (token && email) {
      mutation.mutate({ ...data, token, email });
    }
  };

  const isValid = tokenData && !(tokenData as any)?.data?.error;

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

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {validating ? (
            <div className="flex flex-col items-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
              <p className="mt-4 text-sm text-slate-500">Validating reset link...</p>
            </div>
          ) : submitted ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Password updated</h1>
              <p className="mt-2 text-sm text-slate-500">
                Your password has been reset successfully.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
              >
                Sign in with new password
              </Link>
            </div>
          ) : !isValid ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                <KeyRound className="h-6 w-6 text-red-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Invalid or expired link</h1>
              <p className="mt-2 text-sm text-slate-500">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link
                to="/forgot-password"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
              >
                Request new link
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
                  <KeyRound className="h-6 w-6 text-brand-600" />
                </div>
                <h1 className="text-xl font-bold text-slate-900">Set new password</h1>
                <p className="mt-2 text-sm text-slate-500">
                  Choose a strong password for your account
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="relative">
                  <Input
                    label="New password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-slate-400 transition-colors hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    label="Confirm password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    error={errors.password_confirm?.message}
                    {...register('password_confirm')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-[38px] text-slate-400 transition-colors hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {mutation.isError && (
                  <p className="text-sm text-red-600">
                    {(mutation.error as any)?.response?.data?.message || 'Failed to reset password. Please try again.'}
                  </p>
                )}

                <Button type="submit" className="w-full" loading={mutation.isPending}>
                  Reset Password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
