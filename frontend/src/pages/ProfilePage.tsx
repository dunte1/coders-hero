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
import {
  Camera,
  History,
  KeyRound,
  Mail,
  ShieldCheck,
  Calendar,
  Clock,
  Trash2,
} from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2),
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

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="h-8 w-24 rounded bg-slate-200" />
      </div>

      {/* Avatar card skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="h-24 w-24 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-40 rounded bg-slate-200" />
              <div className="h-4 w-56 rounded bg-slate-200" />
              <div className="flex gap-2">
                <div className="h-6 w-20 rounded-full bg-slate-200" />
                <div className="h-6 w-28 rounded-full bg-slate-200" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form skeleton */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="h-6 w-40 rounded bg-slate-200" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 rounded bg-slate-200" />
            <div className="h-10 rounded bg-slate-200" />
          </div>
          <div className="h-10 rounded bg-slate-200" />
          <div className="h-10 rounded bg-slate-200" />
          <div className="flex justify-end">
            <div className="h-10 w-32 rounded bg-slate-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  const { user, profile, setUser, resendEmailVerification, isLoading: authLoading } = useAuth();
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
      name: user?.name || '',
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

  const handleRemovePhoto = async () => {
    try {
      const updated = await authApi.updateProfile({ avatar: '' } as Partial<{ avatar: string }>);
      setUser(updated);
      setAvatarPreview(null);
      setAvatarFile(null);
      toast.success('Profile photo removed');
    } catch {
      toast.error('Failed to remove photo');
    }
  };

  const handleResendVerification = () => {
    if (resendCooldown > 0 || resendEmailVerification.isPending) return;
    resendEmailVerification.mutate();
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  };

  if (authLoading || !user) {
    return <ProfileSkeleton />;
  }

  const emailVerified = !!(user.email_verified_at || profile?.email_verified_at);
  const studentId = profile?.student_id ?? user.student_id;
  const employeeId = profile?.employee_id ?? user.employee_id;
  const memberSince = (profile?.date_joined ?? user.date_joined) ? new Date(profile?.date_joined ?? user.date_joined!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null;
  const lastLogin = (profile?.last_login ?? user.last_login) ? new Date(profile?.last_login ?? user.last_login!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Profile"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Profile' }]}
      />

      <EmailVerificationBanner />

      {/* Avatar + Account Info Card */}
      <Card>
        <CardContent className="mb-6 p-6 flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative group">
            <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
              <AvatarImage src={avatarPreview || user.avatar} />
              <AvatarFallback className="text-2xl bg-brand-100 text-brand-700">
                {getInitials(user.name || 'User')}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow-md transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
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
            <h2 className="text-xl font-bold text-slate-900">
              {user.name}
            </h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{user.role?.display_name || user.role?.name}</Badge>
              {studentId && <Badge variant="outline">{studentId}</Badge>}
              {employeeId && <Badge variant="outline">{employeeId}</Badge>}
              <Badge variant={emailVerified ? 'success' : 'warning'}>
                {emailVerified ? 'Email verified' : 'Email not verified'}
              </Badge>
            </div>
            {/* Account metadata */}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
              {memberSince && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Member since {memberSince}</span>
                </div>
              )}
              {lastLogin && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Last login {lastLogin}</span>
                </div>
              )}
            </div>
          </div>

          {/* Avatar actions */}
          <div className="flex flex-col gap-2">
            {avatarFile && (
              <>
                <Button size="sm" onClick={handleUploadPhoto} loading={uploading}>
                  Upload Photo
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
            {!avatarFile && (user.avatar || avatarPreview) && (
              <Button
                size="sm"
                variant="outline"
                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={handleRemovePhoto}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Remove
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
            <Input label="Name" error={profileErrors.name?.message} {...regProfile('name')} />
            <div>
              <Input
                label="Email"
                type="email"
                error={profileErrors.email?.message}
                {...regProfile('email')}
                readOnly
                className="bg-slate-50 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-slate-400">
                Contact support to change your email address.
              </p>
            </div>
            <Input label="Phone" type="tel" placeholder="+1-555-0000" {...regProfile('phone')} />
            <div className="flex justify-end">
              <Button type="submit" loading={isUpdating}>Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>
            Manage your email verification, two-factor authentication and sign-in activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Email Verification */}
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

          {/* Two-Factor Authentication */}
          <Link to="/settings/two-factor" className="block">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 group">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-500">
                    Add an extra layer of security to your account.
                  </p>
                </div>
              </div>
              <KeyRound className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
          </Link>

          {/* Login History */}
          <Link to="/settings/login-history" className="block">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 group">
              <div className="flex items-center gap-3">
                <History className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Login History</p>
                  <p className="text-xs text-slate-500">Review your recent sign-in activity.</p>
                </div>
              </div>
              <History className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
          </Link>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Enter your current password and choose a new one.</CardDescription>
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
