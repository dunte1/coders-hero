import { NavLink } from 'react-router-dom';
import { Settings, Image, Globe, GraduationCap, Bell, KeyRound, Shield, Save, Activity as ActivityIcon, UserRound } from 'lucide-react';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';

const items = [
  { label: 'General', href: '/settings/general', icon: Settings },
  { label: 'Branding', href: '/settings/branding', icon: Image },
  { label: 'Localization', href: '/settings/localization', icon: Globe },
  { label: 'Academic', href: '/settings/academic', icon: GraduationCap },
  { label: 'Notifications', href: '/settings/notifications', icon: Bell },
  { label: 'Integrations', href: '/settings/integrations', icon: KeyRound },
  { label: 'Security', href: '/settings/security', icon: Shield },
  { label: 'Storage', href: '/settings/storage', icon: Save },
  { label: 'Backup', href: '/settings/backup', icon: Save },
  { label: 'System', href: '/settings/system', icon: ActivityIcon },
  { label: 'Profile', href: '/profile', icon: UserRound },
];

export function SettingsNav() {
  const { t } = useI18n();

  return (
    <aside className="w-full shrink-0 lg:w-56">
      <nav className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 lg:flex-col lg:overflow-visible">
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/profile'}
            className={({ isActive }) =>
              cn(
                'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {t(item.label)}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export function SettingsLayout({ children, title, description }: { children: React.ReactNode; title: string; description?: string }) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <SettingsNav />
      <div className="min-w-0 flex-1 space-y-6">
        <PageHeader title={t(title)} description={t(description ?? '')} />
        {children}
      </div>
    </div>
  );
}
