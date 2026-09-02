import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { AuthLogo } from '@/components/features/auth/AuthLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CopyrightFooter } from '@/components/ui/CopyrightFooter';
import { Eye, EyeOff, ArrowRight, Shield, BookOpen, Users, AlertTriangle, Info } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login, isLoggingIn } = useAuth();
  const location = useLocation();
  const stateEmail = (location.state as { email?: string } | null)?.email;
  const sessionExpired = (location.state as { sessionExpired?: boolean } | null)?.sessionExpired;
  const signedOut = (location.state as { signedOut?: boolean } | null)?.signedOut;
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: stateEmail || '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel - Branding */}
      <div className="hidden w-1/2 items-center justify-center bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 lg:flex">
        <div className="max-w-md px-8">
          <AuthLogo variant="dark" className="mb-10" />
          <h2 className="font-display text-3xl font-bold text-white leading-tight hero-fade-up hero-fade-up-delay-1">
            Welcome to the future of education
          </h2>
          <p className="mt-4 text-lg text-brand-100 hero-fade-up hero-fade-up-delay-2">
            Access your courses, track progress, and connect with instructors.
          </p>
          <div className="mt-10 space-y-4">
            {[
              { icon: BookOpen, text: 'Access 50+ coding and robotics courses' },
              { icon: Shield, text: 'Secure learning environment' },
              { icon: Users, text: 'Join 500+ students worldwide' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-brand-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex w-full items-center justify-center bg-white p-6 lg:w-1/2">
        <div className="w-full max-w-md auth-entrance">
          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <AuthLogo variant="light" size="sm" />
          </div>

          {/* Session Expired / Signed Out Banners */}
          {sessionExpired && (
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">Session Expired</p>
                <p className="text-xs text-amber-700">Your session has expired. Please sign in again.</p>
              </div>
            </div>
          )}
          {signedOut && (
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <Info className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Signed Out</p>
                <p className="text-xs text-blue-700">You have been signed out successfully.</p>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Sign in to your account</h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter your credentials to access your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-slate-400 transition-colors hover:text-slate-600"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold shadow-sm shadow-brand-600/20 hover:shadow-md hover:shadow-brand-600/30"
              loading={isLoggingIn}
            >
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-brand-600 transition-colors hover:text-brand-700"
            >
              Create one free
            </Link>
          </p>
          <CopyrightFooter />
        </div>
      </div>
    </div>
  );
}

