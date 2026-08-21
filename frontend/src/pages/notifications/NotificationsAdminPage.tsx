import { useMemo, useState } from 'react';
import {
  useAdminNotificationSummary,
  useAdminNotificationDeliveries,
  useRetryNotificationDelivery,
  useSendNotificationBroadcast,
  useNotificationTemplates,
} from '@/hooks/useNotifications';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { SelectRoot, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Bell, Send, RefreshCw, Users, Smartphone, LayoutTemplate, TrendingUp } from 'lucide-react';
import type { NotificationDeliveryLog, NotificationChannel, NotificationTemplate } from '@/types';
import { formatDateTime } from '@/lib/utils';

const channelOptions: NotificationChannel[] = ['in_app', 'email', 'sms', 'push'];

const roleOptions = ['student', 'teacher', 'instructor', 'employee', 'hr_officer', 'librarian', 'parent', 'admin', 'super_admin'];

const deliveryStatusVariant: Record<string, 'success' | 'warning' | 'secondary' | 'destructive'> = {
  delivered: 'success',
  sending: 'warning',
  queued: 'secondary',
  failed: 'destructive',
};

export default function NotificationsAdminPage() {
  const [tab, setTab] = useState('overview');
  const [page, setPage] = useState(1);
  const [sendDialog, setSendDialog] = useState(false);

  const { data: summary, isLoading: summaryLoading } = useAdminNotificationSummary();
  const { data: deliveries, isLoading: deliveriesLoading } = useAdminNotificationDeliveries({ page, per_page: 15 });
  const { data: templatesData } = useNotificationTemplates();

  const retryDelivery = useRetryNotificationDelivery();
  const sendBroadcast = useSendNotificationBroadcast();

  // Broadcast form state
  const [event, setEvent] = useState('');
  const [recipientType, setRecipientType] = useState<'role' | 'users'>('role');
  const [role, setRole] = useState('student');
  const [recipientIds, setRecipientIds] = useState('');
  const [link, setLink] = useState('');
  const [channels, setChannels] = useState<NotificationChannel[]>(['in_app', 'email']);

  const toggleChannel = (channel: NotificationChannel) => {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  const openSendDialog = () => {
    const templates = ((templatesData as any)?.results ?? []) as NotificationTemplate[];
    setEvent(templates[0]?.event ?? '');
    setRecipientType('role');
    setRole('student');
    setRecipientIds('');
    setLink('');
    setChannels(['in_app', 'email']);
    setSendDialog(true);
  };

  const submitBroadcast = () => {
    sendBroadcast.mutate(
      {
        event,
        recipient_type: recipientType,
        role: recipientType === 'role' ? role : undefined,
        recipient_ids:
          recipientType === 'users'
            ? recipientIds.split(',').map((id) => Number(id.trim())).filter((n) => !Number.isNaN(n))
            : undefined,
        link: link || undefined,
        channels,
      },
      { onSettled: () => setSendDialog(false) }
    );
  };

  const deliveriesColumns: Column<NotificationDeliveryLog>[] = useMemo(
    () => [
      {
        key: 'recipient',
        header: 'Recipient',
        render: (d) => (
          <div>
            <p className="text-sm font-medium text-slate-900">{d.recipient?.name ?? '—'}</p>
            <p className="text-xs text-slate-500">{d.recipient?.email ?? ''}</p>
          </div>
        ),
      },
      {
        key: 'subject',
        header: 'Subject',
        render: (d) => (
          <div className="max-w-[220px]">
            <p className="text-sm text-slate-700 truncate">{d.subject ?? '—'}</p>
            {d.error_message && <p className="text-xs text-red-500 truncate">{d.error_message}</p>}
          </div>
        ),
      },
      {
        key: 'channel',
        header: 'Channel',
        render: (d) => <Badge variant="outline">{d.channel}</Badge>,
      },
      {
        key: 'status',
        header: 'Status',
        render: (d) => (
          <Badge variant={deliveryStatusVariant[d.status] ?? 'secondary'}>{d.status}</Badge>
        ),
      },
      { key: 'retry_count', header: 'Retries', render: (d) => <span className="text-sm text-slate-600">{d.retry_count}</span> },
      { key: 'created_at', header: 'When', render: (d) => <span className="text-xs text-slate-500">{formatDateTime(d.created_at)}</span> },
      {
        key: 'actions',
        header: '',
        render: (d) =>
          d.status !== 'delivered' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => retryDelivery.mutate(d.id)}
              disabled={retryDelivery.isPending}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Retry
            </Button>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          ),
      },
    ],
    [retryDelivery]
  );

  const d = summary?.deliveries;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications Administration"
        description="Delivery tracking, broadcasts and channel health"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Notifications', href: '/notifications' }, { label: 'Administration' }]}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <div />
            <Button size="sm" onClick={openSendDialog}>
              <Send className="h-4 w-4 mr-1" />Send Notification
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard icon={Bell} title="Total Notifications" value={summary?.notifications_total ?? 0} />
            <StatsCard icon={TrendingUp} title="Last 7 Days" value={summary?.notifications_last_week ?? 0} />
            <StatsCard icon={Smartphone} title="Registered Devices" value={summary?.registered_devices ?? 0} />
            <StatsCard icon={LayoutTemplate} title="Active Templates" value={summary?.active_templates ?? 0} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivery Status</p>
                {summaryLoading ? (
                  <PageSpinner />
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[
                      { label: 'Queued', value: d?.queued ?? 0, variant: 'secondary' as const },
                      { label: 'Sending', value: d?.sending ?? 0, variant: 'warning' as const },
                      { label: 'Delivered', value: d?.delivered ?? 0, variant: 'success' as const },
                      { label: 'Failed', value: d?.failed ?? 0, variant: 'destructive' as const },
                    ].map((row) => (
                      <div key={row.label} className="rounded-lg border border-slate-100 p-3">
                        <p className="text-2xl font-bold text-slate-900">{row.value}</p>
                        <p className="text-xs text-slate-500">
                          <Badge variant={row.variant}>{row.label}</Badge>
                        </p>
                      </div>
                    ))}
                    <div className="rounded-lg border border-slate-100 p-3 col-span-2">
                      <p className="text-2xl font-bold text-slate-900">{summary?.delivery_rate ?? 0}%</p>
                      <p className="text-xs text-slate-500">Delivery rate</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">By Category</p>
                {summaryLoading ? (
                  <PageSpinner />
                ) : (
                  <div className="space-y-2">
                    {Object.keys(summary?.by_category ?? {}).length === 0 ? (
                      <p className="text-sm text-slate-500">No notifications yet.</p>
                    ) : (
                      Object.entries(summary?.by_category ?? {}).map(([category, total]) => (
                        <div key={category} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                          <span className="text-sm font-medium capitalize text-slate-900">{category.replace(/_/g, ' ')}</span>
                          <span className="text-sm text-slate-600">{total}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deliveries" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Delivery Log</p>
                  <p className="text-xs text-slate-500">Per-channel delivery status for every notification</p>
                </div>
                <Button size="sm" onClick={openSendDialog}>
                  <Send className="h-4 w-4 mr-1" />Send Notification
                </Button>
              </div>
              <DataTable
                columns={deliveriesColumns}
                data={((deliveries as any)?.results ?? []) as NotificationDeliveryLog[]}
                totalCount={(deliveries as any)?.meta?.total ?? 0}
                page={(deliveries as any)?.meta?.current_page ?? 1}
                pageSize={(deliveries as any)?.meta?.per_page ?? 15}
                onPageChange={setPage}
                loading={deliveriesLoading}
                searchable={false}
                emptyTitle="No deliveries"
                emptyDescription="Deliveries will appear here once notifications are sent."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Send dialog */}
      <DialogRoot open={sendDialog} onOpenChange={setSendDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>Broadcast a templated notification to a role or specific users.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Event template</Label>
              <SelectRoot value={event} onValueChange={setEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an event template" />
                </SelectTrigger>
                <SelectContent>
                  {(templatesData?.results ?? []).map((t) => (
                    <SelectItem key={t.id} value={t.event}>
                      {t.name} ({t.event})
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>

            <div className="space-y-2">
              <Label>Recipient type</Label>
              <SelectRoot
                value={recipientType}
                onValueChange={(v) => setRecipientType(v as 'role' | 'users')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Recipient type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="users">Specific users</SelectItem>
                </SelectContent>
              </SelectRoot>
            </div>

            {recipientType === 'role' ? (
              <div className="space-y-2">
                <Label>Role</Label>
                <SelectRoot value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="recipient-ids">User IDs (comma-separated)</Label>
                <Input
                  id="recipient-ids"
                  value={recipientIds}
                  onChange={(e) => setRecipientIds(e.target.value)}
                  placeholder="1, 2, 3"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="broadcast-link">Link (optional)</Label>
              <Input id="broadcast-link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="/courses/1" />
            </div>

            <div className="space-y-2">
              <Label>Channels</Label>
              <div className="flex flex-wrap gap-2">
                {channelOptions.map((channel) => (
                  <label
                    key={channel}
                    className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={channels.includes(channel)}
                      onChange={() => toggleChannel(channel)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600"
                    />
                    {channel.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendDialog(false)}>Cancel</Button>
            <Button
              onClick={submitBroadcast}
              disabled={!event || sendBroadcast.isPending || (recipientType === 'users' && !recipientIds.trim())}
            >
              <Users className="h-4 w-4 mr-1" />
              {sendBroadcast.isPending ? 'Sending…' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
