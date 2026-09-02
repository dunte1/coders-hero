import { useState } from 'react';
import { Download, CreditCard } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/lib/utils';
import { toast } from 'sonner';

async function downloadIdCard(): Promise<void> {
  const res = await fetch('/api/my/id-card/pdf', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'my-id-card.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export default function MyIdCardPage() {
  const { user, profile } = useAuth();
  const [downloading, setDownloading] = useState(false);

  const studentId = profile?.student_id ?? user?.student_id;
  const name = user?.name ?? 'Student';

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadIdCard();
      toast.success('ID card downloaded');
    } catch {
      toast.error('Failed to download ID card');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="My ID Card"
        description="Download your student identification card"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'My ID Card' }]}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
              <CreditCard className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
              {studentId && (
                <Badge variant="outline" className="mt-1">{studentId}</Badge>
              )}
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={handleDownload} loading={downloading} className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Download ID Card PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
