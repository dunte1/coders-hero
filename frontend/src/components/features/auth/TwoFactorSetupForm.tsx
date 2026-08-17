import { useState } from 'react';
import { useEnableTwoFactor, useConfirmTwoFactor } from '@/hooks/useTwoFactor';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { CheckCircle2, Copy, KeyRound, QrCode, ShieldCheck, Smartphone } from 'lucide-react';
import type { TwoFactorSetup } from '@/types';

interface TwoFactorSetupFormProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

type SetupStep = 'intro' | 'qr' | 'codes';

export function TwoFactorSetupForm({ onComplete, onCancel }: TwoFactorSetupFormProps) {
  const [step, setStep] = useState<SetupStep>('intro');
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | undefined>();
  const [copied, setCopied] = useState(false);

  const enable = useEnableTwoFactor();
  const confirm = useConfirmTwoFactor();

  const handleEnable = () => {
    enable.mutate(undefined, {
      onSuccess: (data) => {
        setSetup(data);
        setStep('qr');
      },
    });
  };

  const handleConfirm = () => {
    if (!/^\d{6}$/.test(code)) {
      setCodeError('Enter the 6-digit code shown in your authenticator app');
      return;
    }
    setCodeError(undefined);
    confirm.mutate(code, {
      onSuccess: () => setStep('codes'),
    });
  };

  const handleCopyCodes = async () => {
    if (!setup) return;
    try {
      await navigator.clipboard.writeText(setup.recovery_codes.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be unavailable; codes remain visible for manual copy
    }
  };

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
          {step === 'intro' && <ShieldCheck className="h-7 w-7 text-brand-600" />}
          {step === 'qr' && <QrCode className="h-7 w-7 text-brand-600" />}
          {step === 'codes' && <CheckCircle2 className="h-7 w-7 text-emerald-600" />}
        </div>
        <CardTitle className="text-xl">
          {step === 'intro' && 'Two-Factor Authentication'}
          {step === 'qr' && 'Scan the QR Code'}
          {step === 'codes' && 'Save Your Recovery Codes'}
        </CardTitle>
        <CardDescription>
          {step === 'intro' &&
            'Add an extra layer of security to your account using an authenticator app like Google Authenticator, Authy, or 1Password.'}
          {step === 'qr' &&
            'Scan the code with your authenticator app, then enter the 6-digit code it generates to confirm setup.'}
          {step === 'codes' &&
            'Recovery codes let you access your account if you lose your device. Store them somewhere safe — they are shown only once.'}
        </CardDescription>
      </CardHeader>

      {step === 'intro' && (
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
              <p className="text-sm text-slate-600">
                Use an authenticator app on your phone to generate time-based verification codes.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
              <p className="text-sm text-slate-600">
                Recovery codes will be generated after you confirm setup. Keep them in a safe place.
              </p>
            </div>
          </div>
        </CardContent>
      )}

      {step === 'qr' && setup && (
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <img
              src={setup.qr_code_url}
              alt="QR code for two-factor authentication"
              className="h-48 w-48 rounded-lg border border-slate-200"
            />
            <p className="text-xs text-slate-500">
              Or manually enter this code in your authenticator app:
            </p>
            <code className="rounded-lg bg-slate-100 px-4 py-2 font-mono text-sm font-semibold tracking-widest text-slate-800">
              {setup.secret}
            </code>
          </div>
          <div className="space-y-2">
            <Input
              label="Verification Code"
              placeholder="000000"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, ''));
                setCodeError(undefined);
              }}
              error={codeError}
            />
          </div>
        </CardContent>
      )}

      {step === 'codes' && setup && (
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid grid-cols-2 gap-2">
              {setup.recovery_codes.map((recoveryCode) => (
                <code
                  key={recoveryCode}
                  className="rounded-md bg-white px-3 py-2 font-mono text-sm font-medium text-slate-800"
                >
                  {recoveryCode}
                </code>
              ))}
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleCopyCodes}>
            {copied ? <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy all codes'}
          </Button>
        </CardContent>
      )}

      <CardFooter className="flex-col gap-3 pt-0">
        {step === 'intro' && (
          <Button className="w-full" onClick={handleEnable} loading={enable.isPending}>
            Enable Two-Factor Authentication
          </Button>
        )}
        {step === 'qr' && (
          <>
            <Button className="w-full" onClick={handleConfirm} loading={confirm.isPending}>
              Verify and Enable
            </Button>
            <Button variant="ghost" className="w-full" onClick={onCancel}>
              Cancel
            </Button>
          </>
        )}
        {step === 'codes' && (
          <Button className="w-full" onClick={onComplete}>
            I have saved my codes
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
