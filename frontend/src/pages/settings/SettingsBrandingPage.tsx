import { useState, useEffect } from 'react';
import { useSiteSettings, useUpdateSiteSettings } from '@/hooks/useSiteSettings';
import { brandingFields } from '@/components/features/settings/settingsFields';
import { ImageCropper } from '@/components/ui/ImageCropper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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

export default function SettingsBrandingPage() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const getValue = (key: string, def = '') => {
    return settings?.settings.find((s) => s.key === key)?.value ?? def;
  };

  const [logo, setLogo] = useState('');
  const [favicon, setFavicon] = useState('');
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      setLogo(getValue('branding.logo'));
      setFavicon(getValue('branding.favicon'));
      const initial: Record<string, string> = {};
      brandingFields.forEach((f) => {
        if (f.key !== 'branding.logo' && f.key !== 'branding.favicon') {
          initial[f.key] = getValue(f.key, f.default ?? '');
        }
      });
      setForm(initial);
    }
  }, [settings]);

  if (isLoading) return <PageSpinner />;

  const setValue = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    const payload = [
      { key: 'branding.logo', value: logo, group: 'branding' },
      { key: 'branding.favicon', value: favicon, group: 'branding' },
      ...brandingFields
        .filter((f) => f.key !== 'branding.logo' && f.key !== 'branding.favicon')
        .map((f) => ({
          key: f.key,
          value: form[f.key] ?? f.default ?? '',
          group: 'branding',
        })),
    ];
    updateSettings.mutate(payload, {
      onSuccess: () => setSavedAt(new Date().toLocaleTimeString()),
    });
  };

  const nonImageFields = brandingFields.filter(
    (f) => f.key !== 'branding.logo' && f.key !== 'branding.favicon'
  );

  return (
    <div className="space-y-6">
      {/* Logo & Favicon */}
      <Card>
        <CardHeader>
          <CardTitle>Logo & Favicon</CardTitle>
          <CardDescription>
            Upload a logo shown in the sidebar, navbar and footer. The favicon appears in browser tabs.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <ImageCropper
            value={logo || null}
            onChange={setLogo}
            label="Logo"
            aspect={1}
            circular={false}
            hint="Square or landscape image. Recommended: 200x200px or larger."
          />
          <ImageCropper
            value={favicon || null}
            onChange={setFavicon}
            label="Favicon"
            aspect={1}
            circular={false}
            hint="Square image, ideally 64x64px or 128x128px."
          />
        </CardContent>
      </Card>

      {/* Colors & Typography */}
      <Card>
        <CardHeader>
          <CardTitle>Colours & Typography</CardTitle>
          <CardDescription>
            Customise the primary palette, system chrome (sidebar, header) and font family.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Brand palette */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Brand Palette</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {nonImageFields.filter((f) => !f.key.includes('sidebar') && !f.key.includes('header') && f.key !== 'branding.theme_mode' && f.key !== 'branding.font_family').map((field) => {
                const value = form[field.key] ?? '';
                return (
                  <div key={field.key}>
                    <Label>{field.label}</Label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="color"
                        value={value || '#000000'}
                        onChange={(e) => setValue(field.key, e.target.value)}
                        className="h-9 w-9 cursor-pointer rounded border border-slate-200"
                      />
                      <Input
                        value={value}
                        onChange={(e) => setValue(field.key, e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System chrome */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">System Chrome</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {nonImageFields.filter((f) => f.key.includes('sidebar') || f.key.includes('header')).map((field) => {
                const value = form[field.key] ?? '';
                return (
                  <div key={field.key}>
                    <Label>{field.label}</Label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="color"
                        value={value || '#000000'}
                        onChange={(e) => setValue(field.key, e.target.value)}
                        className="h-9 w-9 cursor-pointer rounded border border-slate-200"
                      />
                      <Input
                        value={value}
                        onChange={(e) => setValue(field.key, e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Theme & Font */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Theme & Font</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {nonImageFields.filter((f) => f.key === 'branding.theme_mode' || f.key === 'branding.font_family').map((field) => {
                const value = form[field.key] ?? '';
                if (field.type === 'switch') {
                  return (
                    <div key={field.key} className="flex items-center justify-between">
                      <Label>{field.label}</Label>
                      <Switch
                        checked={value === '1' || value === 'true'}
                        onCheckedChange={(checked) => setValue(field.key, checked ? '1' : '0')}
                      />
                    </div>
                  );
                }
                if (field.type === 'select') {
                  return (
                    <div key={field.key}>
                      <SelectRoot value={value} onValueChange={(v) => setValue(field.key, v)}>
                        <SelectTrigger label={field.label}>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {(field.options ?? []).map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectRoot>
                    </div>
                  );
                }
                return (
                  <div key={field.key}>
                    <Label>{field.label}</Label>
                    <Input
                      value={value}
                      onChange={(e) => setValue(field.key, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-slate-100 flex items-center justify-between">
          {savedAt ? <p className="text-xs text-emerald-600">Saved at {savedAt}</p> : <span />}
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
