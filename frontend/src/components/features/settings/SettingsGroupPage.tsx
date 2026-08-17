import { SettingsLayout } from '@/components/features/settings/SettingsNav';
import { SettingsForm, type SettingsField } from '@/components/features/settings/SettingsForm';

interface SettingsGroupPageProps {
  group: string;
  title: string;
  description: string;
  fields: SettingsField[];
}

export function SettingsGroupPage({ group, title, description, fields }: SettingsGroupPageProps) {
  return (
    <SettingsLayout title={title} description={description}>
      <SettingsForm group={group} fields={fields} title={title} description={description} />
    </SettingsLayout>
  );
}
