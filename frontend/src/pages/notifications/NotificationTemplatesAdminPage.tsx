import { useState } from 'react';
import {
  useAdminNotificationTemplates,
  useCreateNotificationTemplate,
  useUpdateNotificationTemplate,
  useDeleteNotificationTemplate,
} from '@/hooks/useNotifications';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { SelectRoot, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { NotificationCategory, NotificationChannel, NotificationTemplate } from '@/types';
import { formatDateTime } from '@/lib/utils';

const categories: NotificationCategory[] = ['attendance', 'fees', 'assignments', 'exams', 'competitions', 'certificates', 'system'];
const channelOptions: NotificationChannel[] = ['in_app', 'email', 'sms', 'push'];

interface TemplateForm {
  name: string;
  event: string;
  category: NotificationCategory;
  description: string;
  subject: string;
  body: string;
  channels: NotificationChannel[];
  is_active: boolean;
}

const emptyTemplate: TemplateForm = {
  name: '',
  event: '',
  category: 'system',
  description: '',
  subject: '',
  body: '',
  channels: ['in_app', 'email'],
  is_active: true,
};

export default function NotificationTemplatesAdminPage() {
  const { data, isLoading } = useAdminNotificationTemplates();
  const createTemplate = useCreateNotificationTemplate();
  const updateTemplate = useUpdateNotificationTemplate();
  const deleteTemplate = useDeleteNotificationTemplate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NotificationTemplate | null>(null);
  const [form, setForm] = useState<TemplateForm>(emptyTemplate);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyTemplate);
    setDialogOpen(true);
  };

  const openEdit = (t: NotificationTemplate) => {
    setEditing(t);
    setForm({
      name: t.name,
      event: t.event,
      category: t.category,
      description: t.description ?? '',
      subject: t.subject ?? '',
      body: t.body,
      channels: (t.channels ?? []).length > 0 ? t.channels : ['in_app', 'email'],
      is_active: t.is_active,
    });
    setDialogOpen(true);
  };

  const toggleChannel = (channel: NotificationChannel) => {
    setForm((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  const save = () => {
    const payload = {
      name: form.name,
      event: form.event,
      category: form.category,
      description: form.description || null,
      subject: form.subject || null,
      body: form.body,
      channels: form.channels,
      is_active: form.is_active,
    };
    if (editing) {
      updateTemplate.mutate({ id: editing.id, data: payload }, { onSettled: () => setDialogOpen(false) });
    } else {
      createTemplate.mutate(payload, { onSettled: () => setDialogOpen(false) });
    }
  };

  const columns: Column<NotificationTemplate>[] = [
    {
      key: 'name',
      header: 'Template',
      render: (t) => (
        <div>
          <p className="text-sm font-medium text-slate-900">{t.name}</p>
          <p className="font-mono text-xs text-slate-500">{t.event}</p>
        </div>
      ),
    },
    { key: 'category', header: 'Category', render: (t) => <Badge variant="outline">{t.category}</Badge> },
    {
      key: 'channels',
      header: 'Channels',
      render: (t) => (
        <div className="flex flex-wrap gap-1">
          {(t.channels ?? []).map((channel) => (
            <Badge key={channel} variant="secondary">
              {channel}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) =>
        t.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (t) => (
        <div className="flex gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm(`Delete template "${t.name}"?`)) deleteTemplate.mutate(t.id);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Templates"
        description="Manage the templates used for each notification event"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Notifications', href: '/notifications' }, { label: 'Templates' }]}
      />

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Templates</p>
              <p className="text-xs text-slate-500">Placeholders like {'{{user_name}}'} are filled in at send time</p>
            </div>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1" />New Template
            </Button>
          </div>
          <DataTable
            columns={columns}
            data={data?.results ?? []}
            loading={isLoading}
            searchable={false}
            emptyTitle="No templates"
            emptyDescription="Create a notification template to get started."
          />
        </CardContent>
      </Card>

      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Template' : 'New Template'}</DialogTitle>
            <DialogDescription>Define the subject, body and channels for this event.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="t-name">Name</Label>
                <Input id="t-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-event">Event key</Label>
                <Input
                  id="t-event"
                  value={form.event}
                  onChange={(e) => setForm({ ...form, event: e.target.value })}
                  placeholder="e.g. course.enrolled"
                  disabled={!!editing}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <SelectRoot value={form.category} onValueChange={(v) => setForm({ ...form, category: v as NotificationCategory })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c.replace(/_/g, ' ').replace(/\b\w/g, (x) => x.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-desc">Description</Label>
                <Input id="t-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-subject">Subject</Label>
              <Input id="t-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. New update: {{message}}" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-body">Body</Label>
              <Textarea
                id="t-body"
                rows={6}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Hello {{user_name}}, {{message}}"
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label>Channels</Label>
              <div className="flex flex-wrap gap-2">
                {channelOptions.map((channel) => (
                  <label key={channel} className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.channels.includes(channel)}
                      onChange={() => toggleChannel(channel)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600"
                    />
                    {channel.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-brand-600"
              />
              Active
            </label>
            <p className="text-xs text-slate-400">
              Created {editing ? formatDateTime(editing.created_at) : '—'}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.name.trim() || !form.event.trim() || !form.body.trim()}>
              {editing ? 'Save Changes' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
