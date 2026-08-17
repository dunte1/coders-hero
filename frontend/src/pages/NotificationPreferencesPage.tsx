import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { Bell, Mail, MessageSquare, Smartphone, Trash2 } from 'lucide-react';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useFcmTokens,
  useRegisterFcmToken,
  useRevokeFcmToken,
} from '@/hooks/useNotifications';
import type { NotificationCategory, NotificationChannel, NotificationPreference } from '@/types';
import { formatDateTime } from '@/lib/utils';

const categories: Array<{ value: NotificationCategory; label: string; description: string }> = [
  { value: 'attendance', label: 'Attendance', description: 'Class attendance and absence alerts' },
  { value: 'fees', label: 'Fees', description: 'Invoices, payments and fee reminders' },
  { value: 'assignments', label: 'Assignments', description: 'Assignment published and due-date reminders' },
  { value: 'exams', label: 'Exams', description: 'Exam schedules and result announcements' },
  { value: 'competitions', label: 'Competitions', description: 'Competition announcements and updates' },
  { value: 'certificates', label: 'Certificates', description: 'Certificate issuance and validation' },
  { value: 'system', label: 'System', description: 'System and account notices' },
];

const channels: Array<{ value: NotificationChannel; label: string; icon: typeof Bell }> = [
  { value: 'in_app', label: 'In-app', icon: Bell },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'sms', label: 'SMS', icon: MessageSquare },
  { value: 'push', label: 'Push', icon: Smartphone },
];

export default function NotificationPreferencesPage() {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();
  const { data: tokens, isLoading: tokensLoading } = useFcmTokens();
  const registerFcmToken = useRegisterFcmToken();
  const revokeFcmToken = useRevokeFcmToken();

  const [prefs, setPrefs] = useState<Record<string, NotificationPreference>>({});
  const [deviceName, setDeviceName] = useState('');

  useEffect(() => {
    if (preferences) {
      const next: Record<string, NotificationPreference> = {};
      for (const pref of preferences) {
        next[pref.category] = pref;
      }
      setPrefs(next);
    }
  }, [preferences]);

  const toggle = (category: NotificationCategory, channel: NotificationChannel, value: boolean) => {
    setPrefs((prev) => {
      const current = prev[category] ?? {
        category,
        email: true,
        sms: false,
        push: false,
        in_app: true,
      };
      return { ...prev, [category]: { ...current, [channel]: value } };
    });
  };

  const save = () => {
    const payload = categories.map((c) => {
      const current = prefs[c.value] ?? { category: c.value, email: true, sms: false, push: false, in_app: true };
      return {
        category: c.value,
        email: current.email,
        sms: current.sms,
        push: current.push,
        in_app: current.in_app,
      } as NotificationPreference;
    });
    updatePreferences.mutate(payload);
  };

  const hasChanges = categories.some((c) => {
    const loaded = preferences?.find((p) => p.category === c.value);
    const current = prefs[c.value];
    if (!loaded || !current) return false;
    return (
      loaded.email !== current.email ||
      loaded.sms !== current.sms ||
      loaded.push !== current.push ||
      loaded.in_app !== current.in_app
    );
  });

  if (isLoading || tokensLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <PageSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Notification Preferences"
        description="Choose how you want to be notified for each category"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Notifications', href: '/notifications' }, { label: 'Preferences' }]}
      />

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div>
              <CardTitle>Channels per category</CardTitle>
              <p className="text-xs text-slate-500">Turn channels on or off for each notification category</p>
            </div>
            <Button size="sm" onClick={save} disabled={!hasChanges || updatePreferences.isPending}>
              {updatePreferences.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100">
            <div className="bg-slate-50 p-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Category</div>
            {channels.map((ch) => (
              <div key={ch.value} className="bg-slate-50 p-3 text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ch.icon className="h-3.5 w-3.5" />
                {ch.label}
              </div>
            ))}
          </div>

          <div className="divide-y divide-slate-100">
            {categories.map((cat) => {
              const current = prefs[cat.value] ?? { category: cat.value, email: true, sms: false, push: false, in_app: true };
              return (
                <div key={cat.value} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100">
                  <div className="bg-white p-3">
                    <p className="text-sm font-medium text-slate-900">{cat.label}</p>
                    <p className="text-xs text-slate-500">{cat.description}</p>
                  </div>
                  {channels.map((ch) => (
                    <div key={ch.value} className="bg-white p-3 flex items-center justify-between lg:justify-center">
                      <Switch
                        checked={current[ch.value]}
                        onCheckedChange={(value) => toggle(cat.value, ch.value, value)}
                        aria-label={`${cat.label} ${ch.label}`}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <CardTitle>Push devices</CardTitle>
            <p className="text-xs text-slate-500">Devices registered to receive push notifications</p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5 flex-1 min-w-[220px]">
              <Label htmlFor="device-name">Device name</Label>
              <Input
                id="device-name"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g. My phone"
              />
            </div>
            <Button
              onClick={() => {
                if (!deviceName.trim()) return;
                registerFcmToken.mutate({
                  token: `manual-${Date.now()}`,
                  device_name: deviceName.trim(),
                  platform: 'web',
                });
                setDeviceName('');
              }}
              disabled={!deviceName.trim() || registerFcmToken.isPending}
            >
              Register device
            </Button>
          </div>

          <div className="space-y-2">
            {(tokens ?? []).length === 0 && (
              <p className="text-sm text-slate-500">No push devices registered yet.</p>
            )}
            {(tokens ?? []).map((token) => (
              <div key={token.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{token.device_name ?? 'Device'}</p>
                    <p className="text-xs text-slate-500">
                      {token.platform ?? 'Unknown platform'} · {token.last_used_at ? `Last used ${formatDateTime(token.last_used_at)}` : 'Never used'}
                    </p>
                  </div>
                  <Badge variant={token.is_active ? 'success' : 'secondary'}>{token.is_active ? 'Active' : 'Revoked'}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700"
                  onClick={() => revokeFcmToken.mutate(token.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
