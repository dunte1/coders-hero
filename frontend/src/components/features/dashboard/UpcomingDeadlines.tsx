import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Calendar, AlertTriangle, CalendarClock } from 'lucide-react';
import { formatDate, getPriorityColor } from '@/lib/utils';

export interface DeadlineItem {
  id: number;
  title: string;
  kind: 'task' | 'event';
  dueDate?: string | null;
  priority?: string;
  location?: string | null;
  eventType?: string;
}

interface UpcomingDeadlinesProps {
  items: DeadlineItem[];
}

export function UpcomingDeadlines({ items }: UpcomingDeadlinesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upcoming Deadlines &amp; Events</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <CalendarClock className="mb-2 h-8 w-8" />
            <p className="text-sm">Nothing scheduled</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={`${item.kind}-${item.id}`}
                className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors"
              >
                <div className="rounded-lg bg-brand-50 p-1.5">
                  <Calendar className="h-4 w-4 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.kind === 'task' ? 'Task' : 'Event'}
                    {item.location ? ` · ${item.location}` : ''}
                    {item.dueDate ? ` · Due ${formatDate(item.dueDate)}` : ''}
                  </p>
                </div>
                {item.kind === 'task' && item.priority && (
                  <Badge className={getPriorityColor(item.priority)}>
                    {item.priority === 'urgent' && (
                      <AlertTriangle className="h-3 w-3 mr-1" />
                    )}
                    {item.priority}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
