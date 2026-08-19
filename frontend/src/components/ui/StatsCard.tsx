import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

const colorMap = {
  brand: {
    bg: 'bg-brand-50',
    icon: 'text-brand-600',
    border: 'border-brand-100',
  },
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    border: 'border-amber-100',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    border: 'border-red-100',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-100',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-100',
  },
  slate: {
    bg: 'bg-slate-50',
    icon: 'text-slate-600',
    border: 'border-slate-200',
  },
} as const;

type ColorKey = keyof typeof colorMap;

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: ColorKey;
  className?: string;
}

export function StatsCard({ icon: Icon, title, value, trend, color = 'brand', className }: StatsCardProps) {
  const colors = colorMap[color] ?? colorMap.brand;

  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5',
        colors.border,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', colors.bg)}>
          <Icon className={cn('h-6 w-6', colors.icon)} />
        </div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        <p className="text-sm text-slate-500 mt-0.5">{title}</p>
      </div>
    </div>
  );
}
