import { Award } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useParentCertificates } from '@/hooks/useParentPortal';
import { formatDate } from '@/lib/utils';

interface CertificateItem {
  id: number;
  title: string;
  issued_at?: string | null;
  student_name?: string | null;
}

export default function ParentCertificatesPage() {
  const { data, isLoading } = useParentCertificates(); const d: any = data;;

  if (isLoading) return <PageSpinner />;

  const certificates = Array.isArray(d) ? data : (d?.results ?? []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates"
        description="Certificates earned by your child"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Parent Portal', href: '/parent' }, { label: 'Certificates' }]}
      />

      {certificates.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Award}
              title="No certificates yet"
              description="Your child has not earned any certificates yet."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert: any) => (
            <Card key={cert.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-base">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                    <Award className="h-5 w-5 text-amber-600" />
                  </div>
                  <span>{cert.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {cert.student_name && (
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Student:</span> {cert.student_name}
                  </p>
                )}
                {cert.issued_at && (
                  <p className="text-sm text-slate-500">
                    Issued: {formatDate(cert.issued_at)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
