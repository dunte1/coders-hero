import { useState } from 'react';
import {
  usePermissions,
  usePermissionGroups,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
} from '@/hooks/usePermissionManagement';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { PermissionForm } from '@/components/features/auth/PermissionForm';
import { Pencil, Trash2 } from 'lucide-react';
import type { Permission, PermissionCreate } from '@/types';

export default function PermissionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const params: Record<string, string | number | boolean> = {
    page,
    search,
    page_size: 20,
  };
  if (groupFilter !== 'all') {
    params.group = groupFilter;
  }
  const { data, isLoading } = usePermissions(params);
  const { data: groups } = usePermissionGroups();
  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const deletePermission = useDeletePermission();

  const openCreate = () => {
    setEditingPermission(null);
    setDialogOpen(true);
  };

  const openEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setDialogOpen(true);
  };

  const handleSubmit = (values: PermissionCreate) => {
    if (editingPermission) {
      updatePermission.mutate(
        { id: editingPermission.id, data: values },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setEditingPermission(null);
          },
        }
      );
    } else {
      createPermission.mutate(values, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  const columns: Column<Permission>[] = [
    {
      key: 'permission',
      header: 'Permission',
      render: (item) => (
        <div>
          <p className="font-medium text-slate-900">{item.display_name || item.name}</p>
          <p className="font-mono text-xs text-slate-500">{item.name}</p>
        </div>
      ),
    },
    {
      key: 'group',
      header: 'Group',
      render: (item) =>
        item.group ? <Badge variant="secondary">{item.group}</Badge> : <span className="text-slate-400">—</span>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (item) => (
        <span className="text-sm text-slate-600">{item.description || '—'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permissions"
        description="Manage the granular permissions available across the platform"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings', href: '/settings' },
          { label: 'Permissions' },
        ]}
        actions={<Button onClick={openCreate}>Add Permission</Button>}
      />

      <DataTable
        columns={columns}
        data={data?.results || []}
        totalCount={data?.count || 0}
        page={page}
        pageSize={20}
        loading={isLoading}
        searchPlaceholder="Search permissions..."
        onSearch={setSearch}
        onPageChange={setPage}
        emptyTitle="No permissions found"
        emptyDescription="Create a permission to make it available when configuring roles."
        filters={
          <SelectRoot value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All groups</SelectItem>
              {(groups || []).map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        }
        rowActions={(item) => (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => openEdit(item)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500"
              onClick={() => setDeleteId(item.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      />

      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPermission ? 'Edit Permission' : 'Add Permission'}
            </DialogTitle>
            <DialogDescription>
              {editingPermission
                ? 'Update the permission details below.'
                : 'Create a new permission that can be assigned to roles.'}
            </DialogDescription>
          </DialogHeader>
          <PermissionForm
            permission={editingPermission}
            groups={groups || []}
            onSubmit={handleSubmit}
            isLoading={createPermission.isPending || updatePermission.isPending}
          />
        </DialogContent>
      </DialogRoot>

      <DialogRoot open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Permission</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this permission? It will be removed from all roles
              that use it. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={deletePermission.isPending}
              onClick={() => {
                if (deleteId) {
                  deletePermission.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
