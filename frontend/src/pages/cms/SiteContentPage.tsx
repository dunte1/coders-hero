import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ChevronUp, ChevronDown, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { cmsApi, getErrorMessage } from '@/lib/cmsApi';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { ImageInput } from '@/components/cms/ImageInput';
import { ConfirmDelete } from '@/components/cms/ConfirmDelete';
import type { SiteSection, SiteSectionInput, SiteSetting, SiteSettingsUpdate } from '@/types/cms';

const sectionSchema = z.object({
  section_key: z.string().min(1, 'Section key is required'),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  body: z.string().optional(),
  badge: z.string().optional(),
  button_label: z.string().optional(),
  button_url: z.string().optional(),
  image: z.string().optional(),
  is_active: z.boolean(),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

const SETTING_LABELS: Record<string, { label: string; help?: string }> = {
  'general.site_name': { label: 'Site Name', help: 'Site name shown in the header and footer' },
  'general.tagline': { label: 'Tagline', help: 'Short tagline shown under the site name' },
  'general.description': { label: 'Description', help: 'Used in page meta descriptions and about sections' },
  'general.phone': { label: 'Phone', help: 'Public contact phone number' },
  'general.email': { label: 'Email', help: 'Public contact email address' },
  'general.address': { label: 'Address', help: 'Physical address shown on the contact page' },
  'general.hours': { label: 'Opening Hours', help: 'Hours shown on the contact page' },
  'social.facebook': { label: 'Facebook URL', help: 'Link to your Facebook page' },
  'social.instagram': { label: 'Instagram URL', help: 'Link to your Instagram page' },
  'social.youtube': { label: 'YouTube URL', help: 'Link to your YouTube channel' },
  'social.linkedin': { label: 'LinkedIn URL', help: 'Link to your LinkedIn page' },
  'social.tiktok': { label: 'TikTok URL', help: 'Link to your TikTok profile' },
  'social.whatsapp': { label: 'WhatsApp Number', help: 'Number used for WhatsApp enquiries' },
  'seo.meta_title': { label: 'SEO Meta Title', help: 'Default title shown in search results' },
  'seo.meta_description': { label: 'SEO Meta Description', help: 'Default description shown in search results' },
  'seo.og_image': { label: 'Open Graph Image', help: 'Image used when the site is shared on social media' },
  'analytics.gtag_id': { label: 'Google Analytics ID', help: 'e.g. G-XXXXXXXXXX' },
};

const GROUP_LABELS: Record<string, string> = {
  general: 'General',
  contact: 'Contact',
  social: 'Socials',
  socials: 'Socials',
  seo: 'SEO',
  analytics: 'Analytics',
};

function humanizeKey(key: string): string {
  const parts = key.split('.');
  const name = parts[parts.length - 1];
  return name
    .replace(/[_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface SectionFormDialogProps {
  open: boolean;
  section: SiteSection | null;
  onClose: () => void;
  onSubmit: (id: number | undefined, data: SiteSectionInput) => void;
  isSaving: boolean;
}

function SectionFormDialog({ open, section, onClose, onSubmit, isSaving }: SectionFormDialogProps) {
  const { register, handleSubmit, setValue, watch, reset, formState } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      section_key: '',
      title: '',
      subtitle: '',
      body: '',
      badge: '',
      button_label: '',
      button_url: '',
      image: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        section_key: section?.section_key || '',
        title: section?.title || '',
        subtitle: section?.subtitle || '',
        body: section?.body || '',
        badge: section?.badge || '',
        button_label: section?.button_label || '',
        button_url: section?.button_url || '',
        image: section?.image_url || '',
        is_active: section?.is_active ?? true,
      });
    }
  }, [open, section, reset]);

  const onFormSubmit = (values: SectionFormValues) => {
    onSubmit(section?.id, {
      section_key: values.section_key,
      title: values.title || null,
      subtitle: values.subtitle || null,
      body: values.body || null,
      image: values.image || null,
      badge: values.badge || null,
      button_label: values.button_label || null,
      button_url: values.button_url || null,
      is_active: values.is_active,
    });
  };

  return (
    <DialogRoot open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-xl">
        <DialogHeader>
          <DialogTitle>{section ? 'Edit Section' : 'New Section'}</DialogTitle>
          <DialogDescription>
            Configure the content for this site section.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <Input
            label="Section Key"
            placeholder="e.g. hero, about, programs"
            disabled={!!section}
            error={formState.errors.section_key?.message}
            {...register('section_key')}
          />
          <Input
            label="Title"
            placeholder="Section heading"
            {...register('title')}
          />
          <Input
            label="Subtitle"
            placeholder="Supporting text"
            {...register('subtitle')}
          />
          <Textarea
            label="Body"
            rows={4}
            placeholder="Main body content"
            {...register('body')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Badge" placeholder="e.g. New" {...register('badge')} />
            <Input label="Button Label" placeholder="e.g. Learn more" {...register('button_label')} />
          </div>
          <Input
            label="Button URL"
            placeholder="/programs"
            {...register('button_url')}
          />
          <ImageInput
            label="Image"
            value={watch('image')}
            onChange={(value) => setValue('image', value)}
          />
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Active</p>
              <p className="text-xs text-slate-500">Show this section on the website</p>
            </div>
            <Switch checked={watch('is_active')} onCheckedChange={(v) => setValue('is_active', v)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isSaving}>
              {section ? 'Save Changes' : 'Create Section'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}

export default function SiteContentPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SiteSection | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['cms', 'sections'],
    queryFn: cmsApi.siteSections.get,
  });

  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ['cms', 'settings'],
    queryFn: cmsApi.siteSettings.get,
  });

  const [edits, setEdits] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settingsData) {
      setEdits((prev) => {
        const next = { ...prev };
        for (const setting of settingsData.settings) {
          next[setting.key] = prev[setting.key] ?? setting.value;
        }
        return next;
      });
    }
  }, [settingsData]);

  const saveSection = useMutation({
    mutationFn: ({ id, data }: { id?: number; data: SiteSectionInput }) =>
      id ? cmsApi.siteSections.update(id, data) : cmsApi.siteSections.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'sections'] });
      toast.success('Section saved successfully');
      setDialogOpen(false);
      setEditing(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      cmsApi.siteSections.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'sections'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const reorder = useMutation({
    mutationFn: (sections: SiteSection[]) =>
      cmsApi.siteSections.reorder(sections.map((s, i) => ({ id: s.id, sort_order: i }))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'sections'] });
      toast.success('Sections reordered');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteSection = useMutation({
    mutationFn: (id: number) => cmsApi.siteSections.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'sections'] });
      toast.success('Section deleted');
      setDeleteId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const saveSettings = useMutation({
    mutationFn: (payload: SiteSettingsUpdate[]) => cmsApi.siteSettings.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'settings'] });
      toast.success('Settings saved');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleSaveSettings = () => {
    if (!settingsData) return;
    const payload: SiteSettingsUpdate[] = settingsData.settings.map((s) => ({
      key: s.key,
      value: edits[s.key] ?? s.value,
      group: s.group,
      is_public: s.is_public,
    }));
    saveSettings.mutate(payload);
  };

  const filtered = (data || []).filter((s) => {
    const haystack = `${s.section_key} ${s.title || ''} ${s.subtitle || ''}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const move = (index: number, direction: -1 | 1) => {
    const list = data || [];
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    reorder.mutate(next);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Site Content"
        description="Manage website sections and global settings"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Site Content' }]}
      />

      <Tabs defaultValue="sections">
        <TabsList>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="sections">
          <div className="flex items-center justify-between gap-3 mb-4">
            <SearchInput
              placeholder="Search sections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              className="max-w-sm"
            />
            <Button
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Section
            </Button>
          </div>

          {isLoading ? (
            <PageSpinner />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No sections found"
              description="Try adjusting your search or create a new section"
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((section, index) => (
                <Card key={section.id} className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex flex-col gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={!!search || index === 0}
                          onClick={() => move(index, -1)}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={!!search || index === filtered.length - 1}
                          onClick={() => move(index, 1)}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{section.section_key}</Badge>
                          <span className="truncate text-sm font-semibold text-slate-900">
                            {section.title || 'Untitled section'}
                          </span>
                        </div>
                        {section.subtitle && (
                          <p className="mt-0.5 truncate text-xs text-slate-500">{section.subtitle}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={section.is_active}
                        onCheckedChange={(checked) =>
                          toggleActive.mutate({ id: section.id, is_active: checked })
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditing(section);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => setDeleteId(section.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          {settingsLoading ? (
            <PageSpinner />
          ) : !settingsData ? (
            <EmptyState title="No settings found" description="There are no site settings to display." />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {settingsData.groups.map((group) => {
                  const groupSettings = settingsData.settings.filter((s) => s.group === group);
                  return (
                    <Card key={group}>
                      <CardHeader>
                        <CardTitle className="text-base">
                          {GROUP_LABELS[group] || humanizeKey(group)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        {groupSettings.map((setting: SiteSetting) => {
                          const meta = SETTING_LABELS[setting.key];
                          return (
                            <div key={setting.id}>
                              <Input
                                label={meta?.label || humanizeKey(setting.key)}
                                value={edits[setting.key] ?? ''}
                                onChange={(e) =>
                                  setEdits((prev) => ({ ...prev, [setting.key]: e.target.value }))
                                }
                              />
                              {meta?.help && (
                                <p className="mt-1 text-xs text-slate-500">{meta.help}</p>
                              )}
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings} loading={saveSettings.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  Save all changes
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <SectionFormDialog
        open={dialogOpen}
        section={editing}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSubmit={(id, data) => saveSection.mutate({ id, data })}
        isSaving={saveSection.isPending}
      />

      <ConfirmDelete
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Section"
        description="Are you sure you want to delete this site section? This action cannot be undone."
        loading={deleteSection.isPending}
        onConfirm={() => {
          if (deleteId) deleteSection.mutate(deleteId);
        }}
      />
    </div>
  );
}
