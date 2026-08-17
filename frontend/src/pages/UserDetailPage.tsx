import { useParams } from 'react-router-dom';
import { useUser } from '@/hooks/useUsers';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { getInitials, formatDate } from '@/lib/utils';
import { Mail, Phone, Calendar, Shield } from 'lucide-react';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading } = useUser(parseInt(id || '0'));

  if (isLoading) return <PageSpinner />;
  if (!user) return <div className="text-center py-12 text-slate-500">User not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${user.first_name} ${user.last_name}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Users', href: '/users' },
          { label: `${user.first_name} ${user.last_name}` },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-2xl">
                {getInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">{user.first_name} {user.last_name}</h2>
            <Badge className="mt-2">{user.role?.name || 'No Role'}</Badge>
            <Badge className={user.is_active ? 'bg-emerald-100 text-emerald-700 mt-2' : 'bg-red-100 text-red-700 mt-2'}>
              {user.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="text-slate-500">Email:</span>
              <span className="font-medium">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Phone:</span>
                <span className="font-medium">{user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-slate-500">Joined:</span>
              <span className="font-medium">{formatDate(user.date_joined)}</span>
            </div>
            {user.last_login && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Last Login:</span>
                <span className="font-medium">{formatDate(user.last_login)}</span>
              </div>
            )}
            {user.role?.permissions && user.role.permissions.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">Permissions</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {user.role.permissions.map((p) => (
                    <Badge key={p.id} variant="secondary" className="text-xs">
                      {p.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
