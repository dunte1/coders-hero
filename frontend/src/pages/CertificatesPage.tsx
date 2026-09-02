import { useQuery } from '@tanstack/react-query';
import { certificatesApi } from '@/lib/api';
import { CertificateCard } from '@/components/features/certificates/CertificateCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Award } from 'lucide-react';
import { downloadFile } from '@/lib/utils';

export default function CertificatesPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => certificatesApi.getCertificates({ page_size: 50 }),
  });

  const certificates = data?.results || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates"
        description="Your earned certificates"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Certificates' }]}
      />

      {isLoading ? (
        <PageSpinner />
      ) : isError ? (
        <div className="text-center py-12 text-red-500">Failed to load certificates. Please try again.</div>
      ) : certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Complete courses to earn certificates"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <CertificateCard
              key={cert.id}
              certificate={cert}
              onDownload={async (c) => {
                try {
                  await downloadFile(`/api/certificates/${c.certificate_number}/download`, `certificate-${c.certificate_number}.pdf`);
                } catch (e) {
                  console.error('Download failed:', e);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
