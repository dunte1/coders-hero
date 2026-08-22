import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';
import { useSiteBranding } from '@/hooks/usePublicSiteSettings';
import { cn } from '@/lib/utils';

interface AuthLogoProps {
  variant?: 'dark' | 'light';
  size?: 'md' | 'sm';
  className?: string;
}

export function AuthLogo({ variant = 'dark', size = 'md', className }: AuthLogoProps) {
  const { siteName, logoWide, logo } = useSiteBranding();
  const src = logoWide || logo;

  if (src) {
    return (
      <Link to="/" className={cn('inline-flex items-center', className)}>
        <img
          src={src}
          alt={siteName}
          className={cn('w-auto object-contain', size === 'md' ? 'h-12' : 'h-10')}
        />
      </Link>
    );
  }

  return (
    <Link to="/" className={cn('inline-flex items-center', size === 'md' ? 'gap-3' : 'gap-2', className)}>
      <span
        className={cn(
          'flex items-center justify-center text-white',
          size === 'md'
            ? 'h-12 w-12 rounded-2xl bg-white/15 backdrop-blur-sm'
            : 'h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600'
        )}
      >
        <Rocket className={size === 'md' ? 'h-6 w-6' : 'h-5 w-5'} />
      </span>
      <span
        className={cn(
          'font-display font-bold',
          size === 'md' ? 'text-2xl' : 'text-xl',
          variant === 'dark' ? 'text-white' : 'text-slate-900'
        )}
      >
        {siteName}
      </span>
    </Link>
  );
}
