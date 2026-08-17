import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useLibraryResources,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
  useLibraryCategoryOptions,
  useLibraryAuthorOptions,
} from '@/hooks/useLibrary';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';
import type { LibraryResource, LibraryResourceType } from '@/types/library';

const typeLabel: Record<LibraryResourceType, string> = {
  ebook: 'E-Book',
  video: 'Video',
  notes: 'Notes',
  past_paper: 'Past Paper',
  coding_resource: 'Coding Resource',
  robotics_manual: 'Robotics Manual',
};

interface ResourceForm {
  title: string;
  resource_type: LibraryResourceType;
  category_id: string;
  author_id: string;
  description: string;
  language: string;
  is_public: boolean;
  download_allowed: boolean;
  is_active: boolean;
}

const emptyForm: ResourceForm = {
  title: '',
  resource_type: 'ebook',
  category_id: 'none',
  author_id: 'none',
  description: '',
  language: 'en',
  is_public: true,
  download_allowed: false,
  is_active: true,
};

export default function LibraryResourcesAdminPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'all' | LibraryResourceType>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LibraryResource | null>(null);
  const [form, setForm] = useState<ResourceForm>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useLibraryResources({ page, search, type });
  const createResource = useCreateResource();
  const updateResource = useUpdateResource();
  const deleteResource = useDeleteResource();
  const { data: categories = [] } = useLibraryCategoryOptions();
  const { data: authors = [] } = useLibraryAuthorOptions();

  const resources = data?.results || [];

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFile(null);
    setDialogOpen(true);
  };

  const openEdit = (r: LibraryResource) => {
    setEditing(r);
    setForm({
      title: r.title,
      resource_type: r.resource_type,
      category_id: r.category_id ? String(r.category_id) : 'none',
      author_id: r.author_id ? String(r.author_id) : 'none',
      description: r.description ?? '',
      language: r.language,
      is_public: r.is_public,
      download_allowed: r.download_allowed,
      is_active: r.is_active,
    });
    setFile(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('resource_type', form.resource_type);
      if (form.category_id !== 'none') data.append('category_id', form.category_id);
      if (form.author_id !== 'none') data.append('author_id', form.author_id);
      if (form.description) data.append('description', form.description);
      data.append('language', form.language);
      data.append('is_public', form.is_public ? '1' : '0');
      data.append('download_allowed', form.download_allowed ? '1' : '0');
      data.append('is_active', form.is_active ? '1' : '0');
      if (file) data.append('file', file);

      if (editing) {
        await updateResource.mutateAsync({ id: editing.id, data });
      } else {
        await createResource.mutateAsync(data);
      }
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r: LibraryResource) => {
    if (!window.confirm(`Delete resource "${r.title}"?`)) return;
    await deleteResource.mutateAsync(r.id);
  };

  const columns: Column<LibraryResource>[] = [
    { key: 'title', header: 'Title', render: (r) => <span className="font-medium text-slate-900">{r.title}</span> },
    { key: 'type', header: 'Type', render: (r) => <Badge variant="secondary">{typeLabel[r.resource_type]}</Badge> },
    { key: 'author', header: 'Author', render: (r) => r.author?.name ?? '—' },
    { key: 'category', header: 'Category', render: (r) => r.category?.name ?? '—' },
    {
      key: 'visibility',
      header: 'Visibility',
      render: (r) =>
        r.is_active ? (
          r.is_public ? <Badge variant="success">Public</Badge> : <Badge variant="warning">Private</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
    {
      key: 'download',
      header: 'Download',
      render: (r) =>
        r.download_url ? (
          <button
            className="text-slate-400 hover:text-brand-600"
            onClick={(e) => {
              e.stopPropagation();
              if (r.download_url) window.open(r.download_url, '_blank');
            }}
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources"
        description="Manage digital library resources"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Library', href: '/library/admin' },
          { label: 'Resources' },
        ]}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> New Resource
          </Button>
        }
      />

      <Card>
        <CardContent className="p-5">
          <DataTable
            columns={columns}
            data={resources}
            totalCount={data?.meta.total}
            page={data?.meta.current_page}
            pageSize={data?.meta.per_page}
            onPageChange={(p) => setPage(p)}
            onSearch={(q) => {
              setSearch(q);
              setPage(1);
            }}
            onRowClick={(r) => navigate(`/library/resources/${r.id}`)}
            loading={isLoading}
            emptyTitle="No resources"
            emptyDescription="Add e-books, videos, notes and other materials to the library."
            filters={
              <SelectRoot value={type} onValueChange={(v) => { setType(v as 'all' | LibraryResourceType); setPage(1); }}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {Object.entries(typeLabel).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            }
            rowActions={(r) => (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(r)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Resource' : 'New Resource'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update the resource details below.' : 'Add a new resource with an optional file.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Input label="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block">Type *</Label>
                <SelectRoot value={form.resource_type} onValueChange={(v) => setForm({ ...form, resource_type: v as LibraryResourceType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabel).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </div>
              <div>
                <Label className="mb-1.5 block">Category</Label>
                <SelectRoot value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block">Author</Label>
                <SelectRoot value={form.author_id} onValueChange={(v) => setForm({ ...form, author_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select author" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unknown author</SelectItem>
                    {authors.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </div>
              <Input label="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="en" />
            </div>
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div>
              <Label className="mb-1.5 block">File</Label>
              <input
                type="file"
                className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  ['is_public', 'Public'],
                  ['download_allowed', 'Downloadable'],
                  ['is_active', 'Active'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving} disabled={!form.title}>
              {editing ? 'Save Changes' : 'Create Resource'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
