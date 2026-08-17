import { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EmailVerificationBanner } from '@/components/features/auth/EmailVerificationBanner';
import { getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import { Camera, History, KeyRound, Mail, ShieldCheck } from 'lucide-react';

const profileSchema = z.object({
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
});

const passwordSchema = z
  .object({
    old_password: z.string().min(1, 'Current password is required'),
    new_password: z.string().min(8, 'Min 8 characters'),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const RESEND_COOLDOWN_SECONDS = 60;

export default function ProfilePage() {
  const { user, setUser, resendEmailVerification } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const { register: regProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const { register: regPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors }, reset: resetPassword } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileForm) => {
    setIsUpdating(true);
    try {
      const updated = await authApi.updateProfile(data);
      setUser(updated);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      await authApi.changePassword({ old_password: data.old_password, new_password: data.new_password });
      toast.success('Password changed');
      resetPassword();
    } catch {
      toast.error('Failed to change password');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleUploadPhoto = async () => {
    if (!avatarFile) return;
    setUploading(true);
    try {
      const updated = await authApi.uploadProfilePhoto(avatarFile);
      setUser(updated);
      toast.success('Profile photo updated');
      setAvatarFile(null);
      setAvatarPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleResendVerification = () => {
    if (resendCooldown > 0 || resendEmailVerification.isPending) return;
    resendEmailVerification.mutate();
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const emailVerified = !!user?.email_verified_at;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Profile"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Profile' }]}
      />

      <EmailVerificationBanner />

      <Card>
        <CardContent className="mb-6 p-6 flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarPreview || user?.avatar} />
              <AvatarFallback className="text-2xl">
                {getInitials(user?.first_name || 'U', user?.last_name || 'U')}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow-md transition-colors hover:bg-brand-700"
              aria-label="Change profile photo"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold">
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="secondary">{user?.role?.name}</Badge>
              <Badge variant={emailVerified ? 'success' : 'warning'}>
                {emailVerified ? 'Email verified' : 'Email not verified'}
              </Badge>
            </div>
          </div>
          {avatarFile && (
            <div className="flex flex-col gap-2">
              <Button size="sm" onClick={handleUploadPhoto} loading={uploading}>
                Upload Photo
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setAvatarFile(null);
                  setAvatarPreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" error={profileErrors.first_name?.message} {...regProfile('first_name')} />
              <Input label="Last Name" error={profileErrors.last_name?.message} {...regProfile('last_name')} />
            </div>
            <Input label="Email" type="email" error={profileErrors.email?.message} {...regProfile('email')} />
            <Input label="Phone" type="tel" {...regProfile('phone')} />
            <div className="flex justify-end">
              <Button type="submit" loading={isUpdating}>Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>
            Manage your email verification, two-factor authentication and sign-in activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900">Email Verification</p>
                <p className="text-xs text-slate-500">
                  {emailVerified ? 'Your email address is verified.' : 'Verify your email to unlock all features.'}
                </p>
              </div>
            </div>
            {emailVerified ? (
              <Badge variant="success">Verified</Badge>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendVerification}
                loading={resendEmailVerification.isPending}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend'}
              </Button>
            )}
          </div>

          <Link to="/settings/two-factor" className="block">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-500">
                    Add an extra layer of security to your account.
                  </p>
                </div>
              </div>
              <KeyRound className="h-4 w-4 text-slate-300" />
            </div>
          </Link>

          <Link to="/settings/login-history" className="block">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <History className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Login History</p>
                  <p className="text-xs text-slate-500">Review your recent sign-in activity.</p>
                </div>
              </div>
              <History className="h-4 w-4 text-slate-300" />
            </div>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
            <Input label="Current Password" type="password" error={passwordErrors.old_password?.message} {...regPassword('old_password')} />
            <Input label="New Password" type="password" error={passwordErrors.new_password?.message} {...regPassword('new_password')} />
            <Input label="Confirm New Password" type="password" error={passwordErrors.confirm_password?.message} {...regPassword('confirm_password')} />
            <div className="flex justify-end">
              <Button type="submit">Change Password</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
