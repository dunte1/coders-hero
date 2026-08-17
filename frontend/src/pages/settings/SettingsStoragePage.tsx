import { SettingsGroupPage } from '@/components/features/settings/SettingsGroupPage';
import { storageFields } from '@/components/features/settings/settingsFields';

export default function SettingsStoragePage() {
  return (
    <SettingsGroupPage
      group="storage"
      title="Storage Settings"
      description="File storage driver (local, S3 or R2) and upload limits."
      fields={storageFields}
    />
  );
}
