import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { certificatesApi } from '@/lib/certificatesApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ShieldCheck, ShieldX, Search, Award, CalendarDays } from 'lucide-react';
import type { CertificateVerifyResult } from '@/types/certificates';
import { formatDate } from '@/lib/utils';

export default function CertificateVerifyPage() {
  const { code } = useParams<{ code?: string }>();
  const [input, setInput] = useState(code ?? '');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<CertificateVerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runVerify = async (value: string) => {
    if (!value.trim()) return;
    setVerifying(true);
    setError(null);
    setResult(null);
    try {
      const res = await certificatesApi.publicVerify(value.trim());
      setResult(res);
    } catch (e) {
      setError('No certificate matches that verification code. Please check and try again.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Certificate Verification</h1>
          <p className="text-sm text-slate-500">
            Enter the verification code printed on the certificate to confirm its authenticity.
          </p>
        </div>

        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verify-code">Verification Code</Label>
              <div className="flex gap-2">
                <Input
                  id="verify-code"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste the verification code"
                  onKeyDown={(e) => e.key === 'Enter' && runVerify(input)}
                  className="font-mono"
                />
                <Button onClick={() => runVerify(input)} disabled={verifying}>
                  {verifying ? <Spinner size="sm" /> : <Search className="h-4 w-4 mr-1" />}
                  Verify
                </Button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start gap-2">
                <ShieldX className="h-5 w-5 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {result && (
              <div className={`rounded-lg border p-5 ${result.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  {result.valid ? (
                    <Badge variant="success">
                      <ShieldCheck className="h-3 w-3 mr-1" /> Authentic Certificate
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <ShieldX className="h-3 w-3 mr-1" /> Revoked Certificate
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Certificate No.</span>
                    <span className="font-mono font-medium text-slate-800">{result.certificate_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Holder</span>
                    <span className="font-medium text-slate-800">{result.holder_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Course</span>
                    <span className="font-medium text-slate-800 text-right">{result.course}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Issued</span>
                    <span className="text-slate-800">{result.issued_at ? formatDate(result.issued_at) : '—'}</span>
                  </div>
                  {result.template_name && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Template</span>
                      <span className="text-slate-800">{result.template_name}</span>
                    </div>
                  )}
                  {result.revoked && result.revoked_reason && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Revoked reason</span>
                      <span className="text-red-700 text-right">{result.revoked_reason}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                    <span className="text-slate-500">Verifications</span>
                    <span className="text-slate-800">
                      <Award className="h-3.5 w-3.5 inline mr-1" />
                      {result.verification_count} check(s) including this one
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Coder's Hero ERP &amp; Learning Management System · Official verification service
        </p>
      </div>
    </div>
  );
}
