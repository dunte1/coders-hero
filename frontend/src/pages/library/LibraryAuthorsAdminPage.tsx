import { useState } from 'react';
import { useLibraryAuthors, useCreateAuthor, useUpdateAuthor, useDeleteAuthor } from '@/hooks/useLibrary';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { DataTable, type Column } from '@/components/ui/DataTable';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { LibraryAuthor } from '@/types/library';
import type { AuthorInput } from '@/lib/libraryApi';

const emptyForm: AuthorInput = { name: '', bio: null };

export default function LibraryAuthorsAdminPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LibraryAuthor | null>(null);
  const [form, setForm] = useState<AuthorInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useLibraryAuthors({ page });
  const createAuthor = useCreateAuthor();
  const updateAuthor = useUpdateAuthor();
  const deleteAuthor = useDeleteAuthor();

  const authors = data?.results || [];

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (a: LibraryAuthor) => {
    setEditing(a);
    setForm({ name: a.name, bio: a.bio });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      if (editing) {
        await updateAuthor.mutateAsync({ id: editing.id, data: form });
      } else {
        await createAuthor.mutateAsync(form);
      }
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (a: LibraryAuthor) => {
    if (!window.confirm(`Delete author "${a.name}"?`)) return;
    await deleteAuthor.mutateAsync(a.id);
  };

  const columns: Column<LibraryAuthor>[] = [
    { key: 'name', header: 'Name', render: (a) => <span className="font-medium text-slate-900">{a.name}</span> },
    { key: 'bio', header: 'Bio', render: (a) => <span className="text-slate-600">{a.bio ?? '—'}</span> },
    { key: 'resources', header: 'Resources', render: (a) => a.resources_count ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Authors"
        description="Manage resource authors"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Library', href: '/library/admin' },
          { label: 'Authors' },
        ]}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> New Author
          </Button>
        }
      />

      <Card>
        <CardContent className="p-5">
          <DataTable
            columns={columns}
            data={authors}
            totalCount={data?.meta.total}
            page={data?.meta.current_page}
            pageSize={data?.meta.per_page}
            onPageChange={(p) => setPage(p)}
            loading={isLoading}
            emptyTitle="No authors"
            emptyDescription="Add authors for your library resources."
            rowActions={(a) => (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(a)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(a)}>
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
            <DialogTitle>{editing ? 'Edit Author' : 'New Author'}</DialogTitle>
            <DialogDescription>Authors are credited on library resources.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Textarea label="Bio" value={form.bio ?? ''} onChange={(e) => setForm({ ...form, bio: e.target.value || null })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving} disabled={!form.name}>
              {editing ? 'Save Changes' : 'Create Author'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
