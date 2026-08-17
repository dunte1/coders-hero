import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from '@/hooks/useRoles';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { RoleForm } from '@/components/features/auth/RoleForm';
import { Pencil, Trash2, Shield } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Role, RoleCreate } from '@/types';

export default function RolesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useRoles({ page, search, page_size: 10 });
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const openCreate = () => {
    setEditingRole(null);
    setDialogOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setDialogOpen(true);
  };

  const handleSubmit = (values: RoleCreate) => {
    if (editingRole) {
      updateRole.mutate(
        { id: editingRole.id, data: values },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setEditingRole(null);
          },
        }
      );
    } else {
      createRole.mutate(values, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  const columns: Column<Role>[] = [
    {
      key: 'role',
      header: 'Role',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
            <Shield className="h-4 w-4 text-brand-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900">{item.display_name || item.name}</p>
            <p className="text-xs font-mono text-slate-500">{item.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'users_count',
      header: 'Users',
      className: 'text-center',
      render: (item) => (
        <Badge variant="secondary">{item.users_count ?? 0}</Badge>
      ),
    },
    {
      key: 'permissions',
      header: 'Permissions',
      render: (item) => (
        <span className="text-sm text-slate-600">
          {item.permissions.length} permission{item.permissions.length === 1 ? '' : 's'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (item) => {
        const created = (item as unknown as { created_at?: string }).created_at;
        return created ? formatDate(created) : '—';
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles"
        description="Manage roles and their permissions"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings', href: '/settings' },
          { label: 'Roles' },
        ]}
        actions={<Button onClick={openCreate}>Add Role</Button>}
      />

      <DataTable
        columns={columns}
        data={data?.results || []}
        totalCount={data?.count || 0}
        page={page}
        pageSize={10}
        loading={isLoading}
        searchPlaceholder="Search roles..."
        onSearch={setSearch}
        onPageChange={setPage}
        emptyTitle="No roles found"
        emptyDescription="Create a role to start assigning permissions."
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
        onRowClick={(item) => navigate(`/settings/roles/${item.id}`)}
      />

      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit Role' : 'Add Role'}</DialogTitle>
            <DialogDescription>
              {editingRole
                ? 'Update the role details below.'
                : 'Create a new role and assign permissions to it.'}
            </DialogDescription>
          </DialogHeader>
          <RoleForm
            role={editingRole}
            onSubmit={handleSubmit}
            isLoading={createRole.isPending || updateRole.isPending}
          />
        </DialogContent>
      </DialogRoot>

      <DialogRoot open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this role? Users assigned this role will lose its
              permissions. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={deleteRole.isPending}
              onClick={() => {
                if (deleteId) {
                  deleteRole.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
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
