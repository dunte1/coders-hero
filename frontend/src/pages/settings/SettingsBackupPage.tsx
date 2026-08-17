import { SettingsGroupPage } from '@/components/features/settings/SettingsGroupPage';
import { backupFields } from '@/components/features/settings/settingsFields';

export default function SettingsBackupPage() {
  return (
    <SettingsGroupPage
      group="backup"
      title="Backup Settings"
      description="Automatic backup schedule, retention and what gets included."
      fields={backupFields}
    />
  );
}
