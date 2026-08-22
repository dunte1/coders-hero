import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useUser, useUpdateUser } from '@/hooks/useUsers';
import { usersApi } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Camera } from 'lucide-react';
import { getInitials } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Valid email required'),
  name: z.string().min(2, 'Min 2 characters'),
  phone: z.string().optional(),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function UserEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useUser(id || '');
  const updateUser = useUpdateUser();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      email: user?.email || '',
      name: user?.name || '',
      phone: user?.phone || '',
      is_active: user?.is_active ?? true,
    },
  });

  if (isLoading) return <PageSpinner />;
  if (!user) return <div className="text-center py-12">User not found</div>;

  const passwordMismatch = confirmPassword && newPassword !== confirmPassword;

  const onAvatarSelect = async (file: File) => {
    setAvatarError(null);
    setAvatarUploading(true);
    try {
      await usersApi.uploadAvatar(user.id, file);
      queryClient.invalidateQueries({ queryKey: ['user', user.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch {
      setAvatarError('Failed to upload photo. Use a JPG/PNG/WebP under 2MB.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const onSubmit = (data: FormValues) => {
    if (newPassword && newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setPasswordError(null);

    updateUser.mutate(
      { id: user.id, data },
      {
        onSuccess: async () => {
          if (newPassword) {
            await usersApi.resetPassword(user.id, {
              password: newPassword,
              password_confirmation: confirmPassword,
            });
          }
          navigate('/users');
        },
        onError: (err: unknown) => {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
          setPasswordError(message || 'Save failed. Check the details and try again.');
        },
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Edit User"
        breadcrumbs={[{ label: 'Users', href: '/users' }, { label: 'Edit' }]}
      />

      <Card>
        <CardContent className="p-6 flex items-center gap-5">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-xl">{getInitials(user.name, '')}</AvatarFallback>
            </Avatar>
            {avatarUploading && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-xs text-white">…</span>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 rounded-full bg-primary text-primary-foreground p-1.5 shadow hover:opacity-90"
              aria-label="Change photo"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <p className="font-medium">Profile Photo</p>
            <p className="text-sm text-slate-500">JPG, PNG or WebP — max 2MB.</p>
            {avatarError && <p className="text-sm text-red-600 mt-1">{avatarError}</p>}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) onAvatarSelect(file);
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>User Details</CardTitle></CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Full Name" error={errors.name?.message} {...register('name')} />
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
            <Input label="Phone" type="tel" {...register('phone')} />
            <div className="flex items-center gap-3">
              <Switch
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
              <label className="text-sm font-medium">Active</label>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => navigate('/users')}>Cancel</Button>
              <Button type="submit" loading={updateUser.isPending}>Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={
              passwordError ||
              (passwordMismatch ? 'Passwords do not match' : undefined)
            }
          />
          <p className="text-xs text-slate-500">
            Saved together with your other changes when you click Save Changes above.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
