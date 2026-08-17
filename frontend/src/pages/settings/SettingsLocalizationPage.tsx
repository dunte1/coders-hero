import { SettingsGroupPage } from '@/components/features/settings/SettingsGroupPage';
import { localizationFields } from '@/components/features/settings/settingsFields';

export default function SettingsLocalizationPage() {
  return (
    <SettingsGroupPage
      group="localization"
      title="Localization"
      description="Country, currency, timezone and date/time formats used across the system."
      fields={localizationFields}
    />
  );
}
