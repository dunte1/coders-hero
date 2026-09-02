import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { codingLanguagesApi, getErrorMessage } from '@/lib/codingLanguagesApi';
import type { CodingLanguageItem } from '@/lib/codingLanguagesApi';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Code2, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface LanguageForm {
  name: string;
  slug: string;
  icon: string;
  piston_language: string;
  entry_file: string;
  is_active: boolean;
}

const EMPTY_FORM: LanguageForm = {
  name: '',
  slug: '',
  icon: '',
  piston_language: '',
  entry_file: '',
  is_active: true,
};

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function CodingLanguagesAdminPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CodingLanguageItem | null>(null);
  const [deleting, setDeleting] = useState<CodingLanguageItem | null>(null);
  const [form, setForm] = useState<LanguageForm>(EMPTY_FORM);
  const [slugEdited, setSlugEdited] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coding-languages', page, search],
    queryFn: () => codingLanguagesApi.list({ page, per_page: 15, ...(search ? { search } : {}) }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => codingLanguagesApi.create(payload as any),
    onSuccess: () => {
      toast.success('Language created');
      queryClient.invalidateQueries({ queryKey: ['admin-coding-languages'] });
      setDialogOpen(false);
    },
    onError: (e: any) => toast.error(getErrorMessage(e)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => codingLanguagesApi.update(id, data as any),
    onSuccess: () => {
      toast.success('Language updated');
      queryClient.invalidateQueries({ queryKey: ['admin-coding-languages'] });
      setDialogOpen(false);
    },
    onError: (e: any) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => codingLanguagesApi.delete(id),
    onSuccess: () => {
      toast.success('Language deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-coding-languages'] });
      setDeleteDialogOpen(false);
      setDeleting(null);
    },
    onError: (e: any) => toast.error(getErrorMessage(e)),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      codingLanguagesApi.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coding-languages'] });
    },
    onError: (e: any) => toast.error(getErrorMessage(e)),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSlugEdited(false);
    setDialogOpen(true);
  };

  const openEdit = (lang: CodingLanguageItem) => {
    setEditing(lang);
    setForm({
      name: lang.name ?? '',
      slug: lang.slug ?? '',
      icon: lang.icon ?? '',
      piston_language: lang.piston_language ?? '',
      entry_file: lang.entry_file ?? '',
      is_active: lang.is_active ?? true,
    });
    setSlugEdited(true);
    setDialogOpen(true);
  };

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugEdited ? prev.slug : toSlug(value),
    }));
  };

  const handleSlugChange = (value: string) => {
    setSlugEdited(true);
    setForm((prev) => ({ ...prev, slug: value }));
  };

  const handleSave = () => {
    const payload: Record<string, unknown> = {
      name: form.name,
      slug: form.slug,
      icon: form.icon || null,
      piston_language: form.piston_language || null,
      entry_file: form.entry_file || null,
      is_active: form.is_active,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteClick = (lang: CodingLanguageItem) => {
    setDeleting(lang);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleting) {
      deleteMutation.mutate(deleting.id);
    }
  };

  const handleToggleActive = (lang: CodingLanguageItem) => {
    toggleActiveMutation.mutate({ id: lang.id, is_active: !lang.is_active });
  };

  const columns: Column<CodingLanguageItem>[] = [
    {
      key: 'icon',
      header: 'Icon',
      render: (l) => (
        <span className="text-xl">{l.icon || '—'}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (l) => (
        <div>
          <p className="font-medium text-slate-900">{l.name}</p>
          <p className="text-xs text-slate-500">{l.slug}</p>
        </div>
      ),
    },
    {
      key: 'piston_language',
      header: 'Piston Language',
      render: (l) => <span className="text-sm text-slate-600">{l.piston_language || '—'}</span>,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (l) => (
        <Badge variant={l.is_active ? 'default' : 'secondary'}>
          {l.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coding Languages"
        description="Manage programming languages available in the coding lab"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Coding Languages' }]}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Language
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={(data?.results ?? []) as any[]}
        totalCount={data?.meta?.total ?? 0}
        page={page}
        pageSize={15}
        onPageChange={setPage}
        onSearch={setSearch}
        searchPlaceholder="Search languages..."
        rowActions={(l) => (
          <div className="flex items-center gap-1">
            <Switch
              checked={l.is_active}
              onCheckedChange={() => handleToggleActive(l)}
              aria-label={`Toggle ${l.name}`}
            />
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openEdit(l)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7 text-red-600 hover:bg-red-50" onClick={() => handleDeleteClick(l)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        emptyTitle="No languages found"
        emptyDescription="Add your first coding language to get started."
      />

      {/* Create / Edit Dialog */}
      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Language' : 'New Language'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update the coding language details.' : 'Add a new programming language to the coding lab.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Python"
              />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="e.g. python"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Icon (Emoji)</Label>
                <Input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="e.g. 🐍"
                />
              </div>
              <div>
                <Label>Piston Language</Label>
                <Input
                  value={form.piston_language}
                  onChange={(e) => setForm({ ...form, piston_language: e.target.value })}
                  placeholder="e.g. python"
                />
              </div>
            </div>
            <div>
              <Label>Entry File</Label>
              <Input
                value={form.entry_file}
                onChange={(e) => setForm({ ...form, entry_file: e.target.value })}
                placeholder="e.g. main.py"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={!form.name.trim() || !form.slug.trim() || createMutation.isPending || updateMutation.isPending}
            >
              {editing ? 'Save Changes' : 'Create Language'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Delete Confirmation Dialog */}
      <DialogRoot open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Language</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleting?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} loading={deleteMutation.isPending}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
