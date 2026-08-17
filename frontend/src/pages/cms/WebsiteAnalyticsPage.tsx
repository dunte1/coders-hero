import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Archive, Eye, FileText, Inbox, MailOpen, Monitor, Smartphone, Users } from 'lucide-react';
import { cmsApi } from '@/lib/cmsApi';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import type { AnalyticsData } from '@/types/cms';

function ViewsAreaChart({ data }: { data: AnalyticsData['views_by_day'] }) {
  const chartData = data.map((day) => ({
    ...day,
    label: format(parseISO(day.date), 'MMM d'),
  }));

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Page Views</CardTitle>
        <CardDescription>Daily page views over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#4f46e5"
              strokeWidth={2}
              fill="url(#viewsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function TopPagesCard({ data }: { data: AnalyticsData['top_pages'] }) {
  const max = Math.max(...data.map((page) => page.views), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Pages</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No page views recorded yet.</p>
        ) : (
          data.map((page) => (
            <div key={page.path}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-xs text-slate-600 truncate">{page.path}</span>
                <span className="font-medium text-slate-900">{page.views}</span>
              </div>
              <Progress value={(page.views / max) * 100} className="mt-1.5" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function DevicesCard({ data }: { data: AnalyticsData['devices'] }) {
  const total = data.mobile + data.desktop;
  const mobilePercent = total > 0 ? Math.round((data.mobile / total) * 100) : 0;
  const desktopPercent = total > 0 ? Math.round((data.desktop / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Devices</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <Smartphone className="h-4 w-4" /> Mobile
            </span>
            <span className="font-medium text-slate-900">{mobilePercent}%</span>
          </div>
          <Progress value={mobilePercent} className="mt-1.5" />
        </div>
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <Monitor className="h-4 w-4" /> Desktop
            </span>
            <span className="font-medium text-slate-900">{desktopPercent}%</span>
          </div>
          <Progress
            value={desktopPercent}
            className="mt-1.5"
            indicatorClassName="bg-slate-400"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function BlogCard({ data }: { data: AnalyticsData['blog'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" /> Blog
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
          <span className="text-sm text-slate-600">Total views</span>
          <span className="font-semibold text-slate-900">{data.total_views}</span>
        </div>
        {data.top_posts.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top posts</p>
            {data.top_posts.map((post) => (
              <div key={post.slug} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-slate-700">{post.title}</span>
                <span className="text-xs text-slate-500 shrink-0">{post.views} views</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContactStatsCard({ data }: { data: AnalyticsData['contact_message_stats'] }) {
  const items = [
    { label: 'New', value: data.new, icon: MailOpen, color: 'bg-blue-500' },
    { label: 'Read', value: data.read, icon: Eye, color: 'bg-slate-400' },
    { label: 'Replied', value: data.replied, icon: Inbox, color: 'bg-emerald-500' },
    { label: 'Archived', value: data.archived, icon: Archive, color: 'bg-amber-500' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Contact Messages</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${item.color}`} />
              <span className="text-sm text-slate-600">{item.label}</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function WebsiteAnalyticsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['cms', 'analytics', 'site'],
    queryFn: cmsApi.analytics.site,
  });

  if (isLoading) return <PageSpinner />;
  if (isError || !data) {
    return (
      <div className="py-12 text-center text-slate-500">
        Failed to load analytics data.
      </div>
    );
  }

  const { totals } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website Analytics"
        description="Traffic and engagement across the public website"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Analytics' }]}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-7">
        <StatsCard icon={Eye} title="Page Views" value={totals.page_views} />
        <StatsCard icon={Users} title="Unique Visitors" value={totals.unique_visitors} />
        <StatsCard icon={Eye} title="Views Today" value={totals.page_views_today} />
        <StatsCard icon={Eye} title="Last 7 Days" value={totals.page_views_7d} />
        <StatsCard icon={Eye} title="Last 30 Days" value={totals.page_views_30d} />
        <StatsCard icon={Inbox} title="Messages" value={totals.contact_messages} />
        <StatsCard icon={MailOpen} title="Unread" value={totals.unread_contact_messages} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ViewsAreaChart data={data.views_by_day} />
        <TopPagesCard data={data.top_pages} />
        <DevicesCard data={data.devices} />
        <BlogCard data={data.blog} />
        <ContactStatsCard data={data.contact_message_stats} />
      </div>
    </div>
  );
}
