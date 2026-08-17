import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useRole,
  useRoleUsers,
  useSyncRolePermissions,
  useDeleteRole,
} from '@/hooks/useRoles';
import { usePermissions, usePermissionGroups } from '@/hooks/usePermissions';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { PermissionMatrix } from '@/components/features/auth/PermissionMatrix';
import { Separator } from '@/components/ui/Separator';
import { getInitials } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { Pencil, Shield, Trash2, Users } from 'lucide-react';
import type { User } from '@/types';

export default function RoleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const roleId = parseInt(id || '0', 10);
  const navigate = useNavigate();

  const { data: role, isLoading } = useRole(roleId);
  const { data: allPermissions, isLoading: permissionsLoading } = usePermissions({
    page_size: 200,
  });
  const { data: permissionGroups } = usePermissionGroups();
  const [selected, setSelected] = useState<string[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const { data: usersData, isLoading: usersLoading } = useRoleUsers(roleId, {
    page: usersPage,
    page_size: 10,
  });
  const syncPermissions = useSyncRolePermissions();
  const deleteRole = useDeleteRole();

  useEffect(() => {
    if (role?.permissions) {
      setSelected(role.permissions.map((permission) => permission.name));
    }
  }, [role]);

  if (isLoading) return <PageSpinner />;

  if (!role) {
    return (
      <div className="text-center py-12 text-slate-500">
        Role not found.{' '}
        <Link to="/settings/roles" className="font-medium text-brand-600">
          Back to roles
        </Link>
      </div>
    );
  }

  const handleSavePermissions = () => {
    syncPermissions.mutate({ id: roleId, permissions: selected });
  };

  const userColumns: Column<User>[] = [
    {
      key: 'user',
      header: 'User',
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={item.avatar} />
            <AvatarFallback className="text-xs">
              {getInitials(item.first_name, item.last_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-slate-900">
              {item.first_name} {item.last_name}
            </p>
            <p className="text-xs text-slate-500">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (item) => (
        <Badge variant={item.is_active ? 'success' : 'destructive'}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'date_joined',
      header: 'Joined',
      render: (item) => formatDate(item.date_joined),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={role.display_name || role.name}
        description={role.description}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings', href: '/settings' },
          { label: 'Roles', href: '/settings/roles' },
          { label: role.display_name || role.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (window.confirm('Delete this role? Users assigned this role will lose its permissions.')) {
                  deleteRole.mutate(roleId, {
                    onSuccess: () => navigate('/settings/roles'),
                  });
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4 text-red-500" />
              Delete
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-1.5 h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-brand-600" />
                  Role Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Name</p>
                  <p className="font-mono text-sm font-medium text-slate-900">{role.name}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-slate-500">Display Name</p>
                  <p className="text-sm font-medium text-slate-900">{role.display_name || role.name}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-slate-500">Description</p>
                  <p className="text-sm text-slate-700">{role.description || 'No description'}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-slate-500">Users Assigned</p>
                  <p className="text-sm font-medium text-slate-900">{role.users_count ?? 0}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-slate-500">Permissions</p>
                  <p className="text-sm font-medium text-slate-900">
                    {role.permissions.length} assigned
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Manage the role and the users who hold it.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/settings/roles" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit role details
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/users/create')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Assign a new user to this role
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardContent className="p-6">
              <DataTable
                columns={userColumns}
                data={usersData?.results || []}
                totalCount={usersData?.count || 0}
                page={usersPage}
                pageSize={10}
                loading={usersLoading}
                searchable={false}
                onPageChange={setUsersPage}
                emptyTitle="No users with this role"
                emptyDescription="Users will appear here once they are assigned this role."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>
                Toggle the permissions granted to this role. Changes are saved when you click Save.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {permissionsLoading || !allPermissions ? (
                <PageSpinner />
              ) : (
                <PermissionMatrix
                  permissions={allPermissions.results}
                  selected={selected}
                  onChange={setSelected}
                />
              )}
              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-500">
                  {selected.length} permission{selected.length === 1 ? '' : 's'} selected
                  {permissionGroups && permissionGroups.length > 0 && (
                    <> across {permissionGroups.length} group{permissionGroups.length === 1 ? '' : 's'}</>
                  )}
                </p>
                <Button onClick={handleSavePermissions} loading={syncPermissions.isPending}>
                  Save Permissions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
