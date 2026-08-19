import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Settings as SettingsIcon, Image, Globe, GraduationCap, Bell, KeyRound, Shield, Save, Activity as ActivityIcon, UserRound, Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

const sections = [
  { label: 'General', href: '/settings/general', icon: SettingsIcon, desc: 'Organisation details' },
  { label: 'Branding', href: '/settings/branding', icon: Image, desc: 'Logo, colours and fonts' },
  { label: 'Localization', href: '/settings/localization', icon: Globe, desc: 'Currency, timezone, formats' },
  { label: 'Academic', href: '/settings/academic', icon: GraduationCap, desc: 'Grading and terms' },
  { label: 'Notifications', href: '/settings/notifications', icon: Bell, desc: 'Email, SMS and push' },
  { label: 'Integrations', href: '/settings/integrations', icon: KeyRound, desc: 'SMTP, M-Pesa, AI providers' },
  { label: 'Security', href: '/settings/security', icon: Shield, desc: 'Auth and password policies' },
  { label: 'Storage', href: '/settings/storage', icon: Save, desc: 'Files and uploads' },
  { label: 'Backup', href: '/settings/backup', icon: Save, desc: 'Schedules and retention' },
  { label: 'System', href: '/settings/system', icon: ActivityIcon, desc: 'Environment and maintenance' },
  { label: 'Profile', href: '/profile', icon: UserRound, desc: 'Your personal details' },
  { label: 'Two-Factor Authentication', href: '/settings/two-factor', icon: Shield, desc: 'Extra account security' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme } = useUIStore();

  const isAdmin = ['admin', 'super_admin'].includes(user?.role?.name?.toLowerCase() ?? '');

  const themes = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  const visibleSections = sections.filter((s) => isAdmin || s.href === '/profile' || s.href === '/settings/two-factor');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account and, if you're an administrator, platform-wide configuration."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleSections.map(({ label, href, icon: Icon, desc }) => (
          <Card key={href} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(href)}>
            <CardContent className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </div>
              <h4 className="mt-3 font-semibold text-slate-900">{label}</h4>
              <p className="mt-1 text-sm text-slate-500">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {themes.map((t) => {
              const Icon = t.icon;
              return (
                <Button
                  key={t.value}
                  variant={theme === t.value ? 'default' : 'outline'}
                  className={cn('flex items-center gap-2')}
                  onClick={() => setTheme(t.value)}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-slate-500">Receive email updates for important events</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/notifications/preferences')}>Configure</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-slate-500">Receive browser push notifications</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/notifications/preferences')}>Configure</Button>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
