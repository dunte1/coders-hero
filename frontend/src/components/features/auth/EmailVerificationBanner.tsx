import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { X, MailWarning } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailVerificationBannerProps {
  className?: string;
}

const RESEND_COOLDOWN_SECONDS = 60;

export function EmailVerificationBanner({ className }: EmailVerificationBannerProps) {
  const { user, resendEmailVerification } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (dismissed || !user || user.email_verified_at) {
    return null;
  }

  const handleResend = () => {
    if (cooldown > 0 || resendEmailVerification.isPending) return;
    resendEmailVerification.mutate();
    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const cooldownLabel = cooldown > 0 ? `(${cooldown}s)` : '';

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <MailWarning className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-medium text-amber-900">Verify your email address</p>
          <p className="text-sm text-amber-700">
            Your email <span className="font-medium">{user.email}</span> has not been verified yet.
            Some features may be unavailable until you confirm your address.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleResend}
          loading={resendEmailVerification.isPending}
          disabled={cooldown > 0}
        >
          {cooldown > 0 ? `Resend ${cooldownLabel}` : 'Resend verification email'}
        </Button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-md p-1 text-amber-500 transition-colors hover:bg-amber-100 hover:text-amber-700"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
