import { useI18n } from '@/i18n';
import { PageHeader } from '@/components/ui/PageHeader';

export function SettingsLayout({ children, title, description }: { children: React.ReactNode; title: string; description?: string }) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t(title)}
        description={t(description ?? '')}
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings', href: '/settings' }]}
      />
      {children}
    </div>
  );
}
