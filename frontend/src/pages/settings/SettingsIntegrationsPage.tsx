import { SettingsGroupPage } from '@/components/features/settings/SettingsGroupPage';
import { integrationsFields } from '@/components/features/settings/settingsFields';

export default function SettingsIntegrationsPage() {
  return (
    <SettingsGroupPage
      group="integrations"
      title="Integrations"
      description="SMTP, M-Pesa, Africa's Talking, OpenAI and Firebase credentials. Values are stored encrypted-ready in site settings."
      fields={integrationsFields}
    />
  );
}
