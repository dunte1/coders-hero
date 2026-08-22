import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUsers';
import { usersApi } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { KeyRound } from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils';
import { Mail, Phone, Calendar, Shield } from 'lucide-react';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const userId = id || '';
  const { data: user, isLoading } = useUser(userId);
  const queryClient = useQueryClient();

  const [pwOpen, setPwOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetPassword = useMutation({
    mutationFn: () => usersApi.resetPassword(userId, { password, password_confirmation: confirmation }),
    onSuccess: () => {
      setPwOpen(false);
      setPassword('');
      setConfirmation('');
      setError(null);
      setSuccess('Password updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response?.data?.errors?.password?.[0] ??
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to update password.';
      setError(message);
    },
  });

  if (isLoading) return <PageSpinner />;
  if (!user) return <div className="text-center py-12 text-slate-500">User not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${user.first_name} ${user.last_name}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Users', href: '/users' },
          { label: user.name || user.email },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-2xl">
                {getInitials(user.name, '')}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">{user.name || user.email}</h2>
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
              <span className="font-medium">{formatDate(user.date_joined ?? '')}</span>
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

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent>
            {success && (
              <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-sm text-emerald-700">{success}</p>
            )}
            <Button variant="outline" onClick={() => { setPwOpen(true); setError(null); }}>
              <KeyRound className="mr-2 h-4 w-4" /> Reset Password
            </Button>
          </CardContent>
        </Card>
      </div>

      <DialogRoot open={pwOpen} onOpenChange={(open) => { setPwOpen(open); if (!open) setError(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {user.name || user.email}. They will use it on their next sign-in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-sm text-red-700">{error}</p>
            )}
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              error={confirmation && password !== confirmation ? 'Passwords do not match' : undefined}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwOpen(false)}>Cancel</Button>
            <Button
              onClick={() => resetPassword.mutate()}
              loading={resetPassword.isPending}
              disabled={!password || password.length < 8 || password !== confirmation}
            >
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
