import { SettingsGroupPage } from '@/components/features/settings/SettingsGroupPage';
import { securityFields } from '@/components/features/settings/settingsFields';

export default function SettingsSecurityPage() {
  return (
    <SettingsGroupPage
      group="security"
      title="Security Settings"
      description="Registration, authentication and password policy controls."
      fields={securityFields}
    />
  );
}
