import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers, useDeleteUser } from '@/hooks/useUsers';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog';
import { getStatusColor } from '@/lib/utils';
import { Pencil, Trash2 } from 'lucide-react';
import type { User } from '@/types';

export default function UsersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useUsers({ page, search, page_size: 10 });
  const deleteUser = useDeleteUser();

  const columns: Column<User>[] = [
    {
      key: 'user',
      header: 'User',
      render: (item) => {
        const nameParts = (item.name ?? '').trim().split(/\s+/);
        const initials = `${nameParts[0]?.[0] ?? ''}${nameParts[1]?.[0] ?? ''}`.toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={item.avatar} />
              <AvatarFallback className="text-xs">
                {initials || '??'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-slate-900">{item.name || item.email}</p>
              <p className="text-xs text-slate-500">{item.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role',
      header: 'Role',
      render: (item) => {
        const role = Array.isArray(item.roles) ? item.roles[0] : item.role;
        return (
          <Badge variant="secondary">{role?.name || 'No Role'}</Badge>
        );
      },
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (item) => (
        <Badge className={getStatusColor(item.is_active ? 'active' : 'terminated')}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'date_joined',
      header: 'Joined',
      render: (item) => {
        const d = item.created_at ?? item.date_joined;
        if (!d) return <span className="text-slate-400">—</span>;
        return <span>{new Date(d).toLocaleDateString()}</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage platform users"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Users' }]}
        actions={
          <Button onClick={() => navigate('/users/create')}>Add User</Button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.results || []}
        totalCount={data?.count || 0}
        page={page}
        pageSize={10}
        loading={isLoading}
        searchPlaceholder="Search users..."
        onSearch={setSearch}
        onPageChange={setPage}
        emptyTitle="No users found"
        rowActions={(item) => (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate(`/users/${item.id}/edit`)}
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
        onRowClick={(item) => navigate(`/users/${item.id}`)}
      />

      <DialogRoot open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              loading={deleteUser.isPending}
              onClick={() => {
                if (deleteId) {
                  deleteUser.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
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
