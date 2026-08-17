import { SettingsGroupPage } from '@/components/features/settings/SettingsGroupPage';
import { generalFields } from '@/components/features/settings/settingsFields';

export default function SettingsGeneralPage() {
  return (
    <SettingsGroupPage
      group="general"
      title="General Settings"
      description="Core organisation information shown across the platform and marketing site."
      fields={generalFields}
    />
  );
}
