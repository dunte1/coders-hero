import { useState } from 'react';
import { useTwoFactorStatus, useRegenerateRecoveryCodes, useDisableTwoFactor } from '@/hooks/useTwoFactor';
import { TwoFactorSetupForm } from '@/components/features/auth/TwoFactorSetupForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { CheckCircle2, Copy, ShieldCheck, ShieldOff } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

function RecoveryCodesDialog({
  open,
  codes,
  onClose,
}: {
  open: boolean;
  codes: string[];
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be unavailable; codes remain visible for manual copy
    }
  };

  return (
    <DialogRoot open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Recovery Codes</DialogTitle>
          <DialogDescription>
            Store these codes somewhere safe. Each code can only be used once.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="grid grid-cols-2 gap-2">
            {codes.map((code) => (
              <code
                key={code}
                className="rounded-md bg-white px-3 py-2 font-mono text-sm font-medium text-slate-800"
              >
                {code}
              </code>
            ))}
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={handleCopy}>
            {copied ? <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy all'}
          </Button>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}

export default function TwoFactorSetupPage() {
  const status = useTwoFactorStatus();
  const regenerate = useRegenerateRecoveryCodes();
  const disable = useDisableTwoFactor();

  const [showSetup, setShowSetup] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [newCodes, setNewCodes] = useState<string[]>([]);

  if (status.isLoading) return <PageSpinner />;

  if (!status.data) {
    return (
      <div className="text-center py-12 text-slate-500">
        Unable to load two-factor authentication status.
      </div>
    );
  }

  const enabled = status.data.enabled;

  const handleRegenerate = () => {
    regenerate.mutate(undefined, {
      onSuccess: (data) => setNewCodes(data.recovery_codes),
    });
  };

  const handleDisable = () => {
    if (!password) {
      setPasswordError('Enter your password to confirm');
      return;
    }
    setPasswordError(undefined);
    disable.mutate(
      { password },
      {
        onSuccess: () => {
          setDisableOpen(false);
          setPassword('');
        },
      }
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Two-Factor Authentication"
        description="Manage the extra layer of security on your account"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings', href: '/settings' },
          { label: 'Two-Factor Authentication' },
        ]}
      />

      {!enabled || showSetup ? (
        <TwoFactorSetupForm
          onComplete={() => {
            setShowSetup(false);
            status.refetch();
          }}
          onCancel={() => setShowSetup(false)}
        />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Two-Factor Authentication
              </CardTitle>
              <Badge variant="success">Enabled</Badge>
            </div>
            <CardDescription>
              Your account is protected by two-factor authentication.
              {status.data.confirmed_at && (
                <> Confirmed on {formatDateTime(status.data.confirmed_at)}.</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Two-factor authentication adds an extra step to your sign-in. Even if someone gets
              your password, they can't access your account without your authenticator app or a
              recovery code.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleRegenerate} loading={regenerate.isPending}>
                Regenerate recovery codes
              </Button>
              <Button
                variant="destructive"
                onClick={() => setDisableOpen(true)}
              >
                <ShieldOff className="mr-2 h-4 w-4" />
                Disable two-factor
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <DialogRoot open={disableOpen} onOpenChange={(next) => !next && setDisableOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication?</DialogTitle>
            <DialogDescription>
              Your account will no longer require a verification code at sign-in. Enter your
              password to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(undefined);
              }}
              error={passwordError}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable}
              loading={disable.isPending}
            >
              Disable two-factor
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <RecoveryCodesDialog
        open={newCodes.length > 0}
        codes={newCodes}
        onClose={() => setNewCodes([])}
      />
    </div>
  );
}
