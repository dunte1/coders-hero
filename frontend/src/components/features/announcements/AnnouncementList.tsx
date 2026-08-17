import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Pin, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import type { Announcement } from '@/types';
import { getInitials, formatRelativeDate } from '@/lib/utils';

interface AnnouncementListProps {
  announcements: Announcement[];
  onClick?: (announcement: Announcement) => void;
}

const priorityConfig: Record<string, { color: string; icon: typeof Info }> = {
  low: { color: 'bg-blue-100 text-blue-700', icon: Info },
  normal: { color: 'bg-slate-100 text-slate-700', icon: Info },
  high: { color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  urgent: { color: 'bg-red-100 text-red-700', icon: AlertTriangle },
};

export function AnnouncementList({ announcements, onClick }: AnnouncementListProps) {
  if (announcements.length === 0) {
    return (
      <div className="text-center py-12">
        <Info className="h-8 w-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No announcements</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {announcements.map((ann) => {
        const config = priorityConfig[ann.priority] || priorityConfig.normal;
        const Icon = config.icon;
        return (
          <Card
            key={ann.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onClick?.(ann)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 rounded-lg p-1.5 ${config.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {ann.is_pinned && (
                      <Pin className="h-3 w-3 text-brand-500" />
                    )}
                    <h3 className="font-medium text-slate-900">{ann.title}</h3>
                    <Badge className={config.color}>
                      {ann.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                    {ann.content}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={ann.author?.avatar} />
                        <AvatarFallback className="text-[8px]">
                          {getInitials(ann.author?.first_name || 'A', ann.author?.last_name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      {ann.author?.first_name} {ann.author?.last_name}
                    </div>
                    <span>{formatRelativeDate(ann.created_at)}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {ann.target_audience}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
