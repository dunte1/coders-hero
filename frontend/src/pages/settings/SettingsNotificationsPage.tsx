import { SettingsGroupPage } from '@/components/features/settings/SettingsGroupPage';
import { notificationsFields } from '@/components/features/settings/settingsFields';

export default function SettingsNotificationsPage() {
  return (
    <SettingsGroupPage
      group="notifications"
      title="Notification Settings"
      description="Channel preferences (email, SMS, push) and delivery defaults for the whole platform."
      fields={notificationsFields}
    />
  );
}
