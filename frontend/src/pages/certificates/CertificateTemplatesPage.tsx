import { useState } from 'react';
import {
  useTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
} from '@/hooks/useCertificates';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import type { CertificateTemplate, TemplateInput } from '@/types/certificates';
import { ConfirmDelete } from '@/components/cms/ConfirmDelete';

interface TemplateForm extends TemplateInput {
  name: string;
  signature_image_file?: File | null;
}

const emptyForm: TemplateForm = {
  name: '',
  description: '',
  body_html: '',
  accent_color: '#6366f1',
  font_family: 'DejaVu Sans',
  signature_name: '',
  signature_title: '',
  is_default: false,
  is_active: true,
};

export default function CertificateTemplatesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CertificateTemplate | null>(null);
  const [form, setForm] = useState<TemplateForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useTemplates({ per_page: 50 });
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const templates = data?.results || [];

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (t: CertificateTemplate) => {
    setEditing(t);
    setForm({
      name: t.name,
      description: t.description ?? '',
      body_html: t.body_html ?? '',
      accent_color: t.accent_color,
      font_family: t.font_family,
      signature_name: t.signature_name ?? '',
      signature_title: t.signature_title ?? '',
      is_default: t.is_default,
      is_active: t.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    setSaving(true);
    const fd = new FormData();
    fd.append('name', form.name);
    if (form.description) fd.append('description', form.description);
    if (form.body_html) fd.append('body_html', form.body_html);
    if (form.accent_color) fd.append('accent_color', form.accent_color);
    if (form.font_family) fd.append('font_family', form.font_family);
    if (form.signature_name) fd.append('signature_name', form.signature_name);
    if (form.signature_title) fd.append('signature_title', form.signature_title);
    fd.append('is_default', form.is_default ? '1' : '0');
    fd.append('is_active', form.is_active ? '1' : '0');

    if (form.signature_image_file instanceof File) {
      fd.append('signature_image', form.signature_image_file);
    }

    const onSettled = () => {
      setSaving(false);
      setDialogOpen(false);
    };
    if (editing) {
      fd.append('_method', 'PUT');
      updateTemplate.mutate({ id: editing.id, data: fd as unknown as Partial<CertificateTemplate> }, { onSettled });
    } else {
      createTemplate.mutate(fd as unknown as CertificateTemplate, { onSettled });
    }
  };

  const columns: Column<CertificateTemplate>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (t) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900">{t.name}</span>
          {t.is_default && (
            <Badge variant="success">
              <Star className="h-3 w-3 mr-1" /> Default
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'signature',
      header: 'Signature',
      render: (t) => (
        <div>
          <p className="text-sm text-slate-800">{t.signature_name ?? '—'}</p>
          <p className="text-xs text-slate-500">{t.signature_title ?? ''}</p>
        </div>
      ),
    },
    { key: 'used', header: 'Used', render: (t) => <span className="text-sm text-slate-600">{t.certificates_count ?? 0}</span> },
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
            disabled={t.certificates_count && t.certificates_count > 0 ? true : false}
            onClick={() => setConfirmDeleteId(t.id)}
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
        title="Certificate Templates"
        description="Design the certificate layouts used when issuing certificates"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Certificates', href: '/admin/certificates' },
          { label: 'Templates' },
        ]}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" />
            New Template
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={templates}
        totalCount={data?.meta.total ?? 0}
        page={data?.meta.current_page ?? 1}
        pageSize={data?.meta.per_page ?? 50}
        loading={isLoading}
        searchable={false}
        emptyTitle="No templates"
        emptyDescription="Create a certificate template to get started."
      />

      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Template' : 'New Template'}</DialogTitle>
            <DialogDescription>
              Placeholders: {'{{ holder }}'}, {'{{ course }}'}, {'{{ certificate_number }}'}, {'{{ verification_code }}'}, {'{{ issued_at }}'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tpl-name">Name</Label>
                <Input id="tpl-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Standard Certificate" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tpl-color">Accent Color</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={form.accent_color}
                    onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                    className="h-9 w-12 rounded border border-slate-200 bg-white cursor-pointer"
                  />
                  <Input value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tpl-desc">Description</Label>
              <Input id="tpl-desc" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tpl-body">Body HTML</Label>
              <Textarea
                id="tpl-body"
                rows={7}
                value={form.body_html ?? ''}
                onChange={(e) => setForm({ ...form, body_html: e.target.value })}
                placeholder={'<h1>Certificate of Completion</h1><h2>{{ holder }}</h2>…'}
                className="font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tpl-sig-name">Signature Name</Label>
                <Input id="tpl-sig-name" value={form.signature_name ?? ''} onChange={(e) => setForm({ ...form, signature_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tpl-sig-title">Signature Title</Label>
                <Input id="tpl-sig-title" value={form.signature_title ?? ''} onChange={(e) => setForm({ ...form, signature_title: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Signature Image</Label>
              <p className="text-xs text-slate-500">Upload a signature image (PNG, JPG, or SVG). If no image is uploaded, the signature name will be displayed as text.</p>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setForm({ ...form, signature_image_file: file });
                }}
                className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
              />
              {editing && (form as TemplateForm).signature_image_file === undefined && (form as TemplateForm).signature_name && (
                <p className="text-xs text-slate-400 mt-1">Current: text signature only. Upload an image to replace.</p>
              )}
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600"
                />
                Default template
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600"
                />
                Active
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <ConfirmDelete
        open={!!confirmDeleteId}
        onOpenChange={() => setConfirmDeleteId(null)}
        title="Delete Template"
        description="Are you sure you want to delete this template?"
        loading={deleteTemplate.isPending}
        onConfirm={() => {
          if (confirmDeleteId) deleteTemplate.mutate(confirmDeleteId, { onSettled: () => setConfirmDeleteId(null) });
        }}
      />
    </div>
  );
}
