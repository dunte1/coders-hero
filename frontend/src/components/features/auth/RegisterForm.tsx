import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Rocket, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const registerSchema = z
  .object({
    first_name: z.string().min(2, 'First name must be at least 2 characters'),
    last_name: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirm: z.string(),
    agree_to_terms: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the Terms of Service' }),
    }),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Very Weak', color: 'bg-red-500' };
  if (score === 2) return { score, label: 'Weak', color: 'bg-orange-500' };
  if (score === 3) return { score, label: 'Fair', color: 'bg-yellow-500' };
  if (score === 4) return { score, label: 'Strong', color: 'bg-lime-500' };
  return { score, label: 'Very Strong', color: 'bg-emerald-500' };
}

export function RegisterForm() {
  const { register: registerUser, isRegistering } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      password_confirm: '',
    },
  });

  const watchedPassword = watch('password');
  const passwordStrength = useMemo(() => getPasswordStrength(watchedPassword || ''), [watchedPassword]);

  const onSubmit = (data: RegisterFormValues) => {
    registerUser(data);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel - Branding */}
      <div className="hidden w-1/2 items-center justify-center bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 lg:flex">
        <div className="max-w-md px-8">
          <Link to="/" className="mb-10 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-sm">
              <Rocket className="h-6 w-6" />
            </span>
            <span className="font-display text-2xl font-bold text-white">Coder's Hero</span>
          </Link>
          <h2 className="font-display text-3xl font-bold text-white leading-tight hero-fade-up hero-fade-up-delay-1">
            Start your coding journey today
          </h2>
          <p className="mt-4 text-lg text-brand-100 hero-fade-up hero-fade-up-delay-2">
            Join thousands of students learning to code, build robots, and create with technology.
          </p>
          <div className="mt-10 space-y-4">
            {[
              'Free account with no credit card',
              'Access to beginner courses',
              'Join community competitions',
              'Track your learning progress',
            ].map((text) => (
              <div key={text} className="flex items-center gap-3 text-brand-100">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
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
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white">
                <Rocket className="h-5 w-5" />
              </span>
              <span className="font-display text-xl font-bold text-slate-900">Coder's Hero</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="mt-2 text-sm text-slate-500">
              Get started with your free account in seconds
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                placeholder="John"
                error={errors.first_name?.message}
                {...register('first_name')}
              />
              <Input
                label="Last name"
                placeholder="Doe"
                error={errors.last_name?.message}
                {...register('last_name')}
              />
            </div>
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Phone (optional)"
              type="tel"
              placeholder="+254 700 000000"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <div className="relative">
              <Input
                label="Password"
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
                aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {watchedPassword && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-1.5 flex-1 rounded-full transition-colors',
                        i <= passwordStrength.score ? passwordStrength.color : 'bg-slate-200'
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Password strength: <span className="font-medium">{passwordStrength.label}</span>
                </p>
              </div>
            )}

            {/* Terms of Service */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('agree_to_terms')}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-slate-600">
                I agree to the{' '}
                <Link to="/terms" className="text-brand-600 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>
              </span>
            </label>
            {errors.agree_to_terms && (
              <p className="text-sm text-red-600">{errors.agree_to_terms.message}</p>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold shadow-sm shadow-brand-600/20 hover:shadow-md hover:shadow-brand-600/30"
              loading={isRegistering}
            >
              Create Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-600 transition-colors hover:text-brand-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
