import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  default: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function Spinner({ className, size = 'default' }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className={cn('animate-spin text-brand-600', sizeClasses[size], className)} />
    </div>
  );
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
