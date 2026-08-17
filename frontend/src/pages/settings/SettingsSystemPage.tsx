import { SettingsGroupPage } from '@/components/features/settings/SettingsGroupPage';
import { systemFields } from '@/components/features/settings/settingsFields';

export default function SettingsSystemPage() {
  return (
    <SettingsGroupPage
      group="system"
      title="System Settings"
      description="Environment, maintenance mode, debug and application URLs."
      fields={systemFields}
    />
  );
}
