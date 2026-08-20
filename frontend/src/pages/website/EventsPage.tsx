import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Download, ArrowRight } from 'lucide-react';
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

const addToCalendar = (event: { title: string; description?: string | null; starts_at: string; ends_at?: string | null; location?: string | null }) => {
  const formatIcsDate = (d: string) => new Date(d).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', "PRODID:-//Coder's Hero//Events//EN",
    'BEGIN:VEVENT',
    `DTSTART:${formatIcsDate(event.starts_at)}`,
    `DTEND:${formatIcsDate(event.ends_at || event.starts_at)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description || ''}`,
    event.location ? `LOCATION:${event.location}` : '',
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean).join('\n');
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
};

export default function EventsPage() {
  const siteName = useCachedSiteName();
  usePageMeta({
    title: formatSiteTitle('Events', siteName),
    description: 'Stay updated with upcoming coding workshops, robotics competitions, exhibitions, and community events at Coder\'s Hero.',
  });
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
                  <button
                    type="button"
                    onClick={() => addToCalendar(event)}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Add to Calendar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-white">Don't Miss Our Events</h2>
          <p className="mt-3 text-brand-100">Join our next workshop or competition and let your child explore technology.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link to="/free-trial" className="inline-flex h-12 items-center rounded-xl bg-white px-8 text-sm font-semibold text-brand-600 hover:bg-brand-50 transition-colors">
              Book a Free Trial
            </Link>
            <Link to="/contact" className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-white px-8 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
              Contact Us<ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
