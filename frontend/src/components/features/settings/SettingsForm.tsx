import { useState } from 'react';
import { useI18n } from '@/i18n';
import { useSiteSettings, useUpdateSiteSettings } from '@/hooks/useSiteSettings';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { PageSpinner } from '@/components/ui/Spinner';
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/Select';

export interface SettingsField {
  key: string;
  label: string;
  description?: string;
  type?: 'text' | 'textarea' | 'number' | 'switch' | 'select' | 'color' | 'password';
  options?: string[];
  placeholder?: string;
  default?: string;
  isPublic?: boolean;
}

interface SettingsFormProps {
  group: string;
  fields: SettingsField[];
  title?: string;
  description?: string;
}

export function SettingsForm({ group, fields, title, description }: SettingsFormProps) {
  const { t, setLanguage } = useI18n();
  const { data: settings, isLoading } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();

  const values = fields.reduce<Record<string, string>>((acc, field) => {
    const existing = settings?.settings.find((s) => s.key === field.key);
    acc[field.key] = existing?.value ?? field.default ?? '';
    return acc;
  }, {});

  const [form, setForm] = useState<Record<string, string>>(() => values);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  if (isLoading) return <PageSpinner />;

  const setValue = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    const payload = fields.map((field) => ({
      key: field.key,
      value: form[field.key] ?? field.default ?? '',
      group,
    }));

    // When the default language is changed, apply it to the UI chrome
    // immediately so the effect is visible without a reload.
    if (group === 'localization' && form['localization.language']) {
      const lang = form['localization.language'].toLowerCase();
      setLanguage(lang.startsWith('kiswahili') ? 'sw' : lang.startsWith('french') ? 'fr' : 'en');
    }

    updateSettings.mutate(payload, {
      onSuccess: () => setSavedAt(new Date().toLocaleTimeString()),
    });
  };

  return (
    <Card>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="space-y-5">
        {fields.map((field) => {
          const value = form[field.key] ?? '';
          return (
            <div key={field.key}>
              {field.type === 'switch' ? (
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t(field.label)}</Label>
                    {field.description && <p className="mt-0.5 text-sm text-slate-500">{field.description}</p>}
                  </div>
                  <Switch
                    checked={value === '1' || value === 'true'}
                    onCheckedChange={(checked) => setValue(field.key, checked ? '1' : '0')}
                  />
                </div>
              ) : field.type === 'select' ? (
                <SelectRoot value={value} onValueChange={(v) => setValue(field.key, v)}>
                  <SelectTrigger label={t(field.label)}>
                    <SelectValue placeholder={field.placeholder ?? 'Select...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options ?? []).map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              ) : field.type === 'textarea' ? (
                <Textarea
                  label={t(field.label)}
                  value={value}
                  placeholder={field.placeholder}
                  onChange={(e) => setValue(field.key, e.target.value)}
                  rows={3}
                />
              ) : (
                <Input
                  label={t(field.label)}
                  type={field.type === 'number' ? 'number' : field.type === 'color' ? 'color' : field.type === 'password' ? 'password' : 'text'}
                  value={field.type === 'color' && !value ? '#000000' : value}
                  placeholder={field.placeholder}
                  onChange={(e) => setValue(field.key, e.target.value)}
                />
              )}
              {field.description && field.type !== 'switch' && (
                <p className="mt-1 text-xs text-slate-500">{field.description}</p>
              )}
            </div>
          );
        })}
      </CardContent>
      <CardFooter className="border-t border-slate-100 flex items-center justify-between">
        {savedAt ? <p className="text-xs text-emerald-600">Saved at {savedAt}</p> : <span />}
        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? t('Saving') : t('Save Changes')}
        </Button>
      </CardFooter>
    </Card>
  );
}
