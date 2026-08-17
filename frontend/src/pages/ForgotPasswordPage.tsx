import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { GraduationCap, MailCheck } from 'lucide-react';
import { toast } from 'sonner';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      await authApi.forgotPassword({ email: values.email });
      setEmail(values.email);
      setSubmitted(true);
    } catch (error: { response?: { data?: { detail?: string } } } | unknown) {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Forgot password</h1>
          <p className="mt-2 text-slate-500">
            Coder's Hero ERP & LMS
          </p>
        </div>

        {submitted ? (
          <Card>
            <CardHeader className="items-center text-center">
              <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <MailCheck className="h-7 w-7 text-emerald-600" />
              </div>
              <CardTitle className="text-xl">Check your email</CardTitle>
              <CardDescription>
                If an account exists for <span className="font-medium text-slate-700">{email}</span>,
                we've sent a link to reset your password. The link expires in a short time, so check
                your inbox soon.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Back to login
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="w-full text-center text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Didn't get the email? Try again
              </button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Reset your password</CardTitle>
              <CardDescription>
                Enter the email address associated with your account and we'll send you a reset
                link.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Button type="submit" className="w-full" loading={isSubmitting}>
                  Send reset link
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-slate-500">
                Remembered your password?{' '}
                <Link
                  to="/login"
                  className="font-medium text-brand-600 hover:text-brand-700"
                >
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
