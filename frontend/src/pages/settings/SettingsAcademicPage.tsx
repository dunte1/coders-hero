import { SettingsGroupPage } from '@/components/features/settings/SettingsGroupPage';
import { academicFields } from '@/components/features/settings/settingsFields';

export default function SettingsAcademicPage() {
  return (
    <SettingsGroupPage
      group="academic"
      title="Academic Settings"
      description="Term labels, grading scheme, pass marks and promotion rules."
      fields={academicFields}
    />
  );
}
