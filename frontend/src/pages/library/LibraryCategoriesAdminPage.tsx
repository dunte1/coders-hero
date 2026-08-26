import { useState } from 'react';
import { useLibraryCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useLibrary';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDelete } from '@/components/cms/ConfirmDelete';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { LibraryCategory } from '@/types/library';
import type { CategoryInput } from '@/lib/libraryApi';

const emptyForm: CategoryInput = { name: '', description: null, is_active: true };

export default function LibraryCategoriesAdminPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LibraryCategory | null>(null);
  const [form, setForm] = useState<CategoryInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LibraryCategory | null>(null);

  const { data, isLoading } = useLibraryCategories({ page });
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const categories = data?.results || [];

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (c: LibraryCategory) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description, is_active: c.is_active });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      if (editing) {
        await updateCategory.mutateAsync({ id: editing.id, data: form });
      } else {
        await createCategory.mutateAsync(form);
      }
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: LibraryCategory) => {
    setDeleteTarget(c);
  };

  const columns: Column<LibraryCategory>[] = [
    { key: 'name', header: 'Name', render: (c) => <span className="font-medium text-slate-900">{c.name}</span> },
    { key: 'slug', header: 'Slug', render: (c) => <span className="font-mono text-xs text-slate-500">{c.slug}</span> },
    { key: 'description', header: 'Description', render: (c) => <span className="text-slate-600">{c.description ?? '—'}</span> },
    { key: 'resources', header: 'Resources', render: (c) => c.resources_count ?? 0 },
    { key: 'active', header: 'Active', render: (c) => (c.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organise library resources by category"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Library', href: '/library/admin' },
          { label: 'Categories' },
        ]}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> New Category
          </Button>
        }
      />

      <Card>
        <CardContent className="p-5">
          <DataTable
            columns={columns}
            data={categories}
            totalCount={data?.meta.total}
            page={data?.meta.current_page}
            pageSize={data?.meta.per_page}
            onPageChange={(p) => setPage(p)}
            loading={isLoading}
            emptyTitle="No categories"
            emptyDescription="Create categories to organise resources."
            rowActions={(c) => (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(c)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Category' : 'New Category'}</DialogTitle>
            <DialogDescription>Categories group library resources together.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. E-Books" />
            <Textarea label="Description" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value || null })} />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.is_active ?? true}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-brand-600"
              />
              Active category
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving} disabled={!form.name}>
              {editing ? 'Save Changes' : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <ConfirmDelete
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleteCategory.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteCategory.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}
