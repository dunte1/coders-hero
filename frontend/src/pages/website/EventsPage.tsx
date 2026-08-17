import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { websiteApi } from '@/lib/websiteApi';
import { usePageMeta, formatSiteTitle } from '@/hooks/usePageMeta';
import { useCachedSiteName } from '@/hooks/useCachedSiteSettings';
import { usePageView } from '@/hooks/usePageView';
import { PageBanner } from '@/components/website/PageBanner';
import { Spinner } from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils';

const eventTypeColors: Record<string, string> = {
  workshop: 'bg-blue-100 text-blue-700',
  competition: 'bg-purple-100 text-purple-700',
  exhibition: 'bg-emerald-100 text-emerald-700',
  class: 'bg-amber-100 text-amber-700',
  meeting: 'bg-slate-100 text-slate-700',
  other: 'bg-slate-100 text-slate-700',
};

export default function EventsPage() {
  const siteName = useCachedSiteName();
  usePageMeta({ title: formatSiteTitle('Events', siteName) });
  usePageView();

  const { data: events, isLoading, isError } = useQuery({
    queryKey: ['website', 'events'],
    queryFn: () => websiteApi.events.list(),
  });

  return (
    <>
      <PageBanner
        badge="Events"
        title="Upcoming Events"
        subtitle="Stay updated with our latest workshops, competitions, exhibitions, and community events."
      />
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : isError || !events || events.length === 0 ? (
            <div className="py-20 text-center">
              <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg">No upcoming events at the moment.</p>
              <p className="text-slate-400 mt-2">Check back soon for new events!</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        eventTypeColors[event.event_type] ?? eventTypeColors.other
                      }`}
                    >
                      {event.event_type}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{event.title}</h3>
                  {event.description && (
                    <p className="text-sm text-slate-600 line-clamp-3 mb-4">{event.description}</p>
                  )}
                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>
                        {event.all_day
                          ? formatDate(event.starts_at)
                          : `${formatDate(event.starts_at)}${event.ends_at ? ` - ${formatDate(event.ends_at)}` : ''}`}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
