import { Badge } from './Badge';
import { getStatusColor } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

function getVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' {
  const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
    active: 'success',
    completed: 'success',
    published: 'success',
    pending: 'warning',
    in_progress: 'default',
    review: 'default',
    on_hold: 'warning',
    planning: 'secondary',
    archived: 'secondary',
    draft: 'secondary',
    terminated: 'destructive',
    on_leave: 'warning',
  };
  return map[status] || 'secondary';
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={getVariant(status)} className={className}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${getStatusColor(status).split(' ')[0].replace('100', '500')}`} />
      {status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
    </Badge>
  );
}
