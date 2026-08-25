import { useEffect, useState } from 'react';
import { useMyCertificates } from '@/hooks/useCertificates';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Award, Download, QrCode, ShieldCheck, ShieldX } from 'lucide-react';
import type { Certificate } from '@/types/certificates';
import { formatDate, downloadFile } from '@/lib/utils';
import { certificatesApi } from '@/lib/certificatesApi';

export default function MyCertificatesPage() {
  const [page, setPage] = useState(1);
  const [qrCertificate, setQrCertificate] = useState<Certificate | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const { data, isLoading } = useMyCertificates({ page, per_page: 9 });

  const certificates = data?.results || [];

  useEffect(() => {
    let cancelled = false;
    if (qrCertificate) {
      setQrImage(null);
      certificatesApi.qrCode(qrCertificate.verification_code)
        .then((res) => { if (!cancelled) setQrImage(res.qr_code_url); })
        .catch(() => undefined);
    }
    return () => { cancelled = true; };
  }, [qrCertificate]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates"
        description="Your earned course completion certificates"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Certificates' }]}
      />

      {isLoading ? (
        <PageSpinner />
      ) : certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Complete your enrolled courses to earn certificates of completion."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <Card key={cert.id} className="overflow-hidden">
                <div className="bg-gradient-to-r from-brand-600 to-brand-800 p-6 text-center">
                  <Award className="h-12 w-12 text-white/80 mx-auto mb-3" />
                  <h3 className="text-white font-bold text-lg line-clamp-2">{cert.course?.title}</h3>
                </div>
                <CardContent className="p-5">
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Certificate No.</span>
                      <span className="font-mono text-xs text-slate-700">{cert.certificate_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Issued</span>
                      <span className="text-slate-700">{cert.issued_at ? formatDate(cert.issued_at) : '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Status</span>
                      {cert.is_revoked ? (
                        <Badge variant="destructive">
                          <ShieldX className="h-3 w-3 mr-1" /> Revoked
                        </Badge>
                      ) : (
                        <Badge variant="success">
                          <ShieldCheck className="h-3 w-3 mr-1" /> Valid
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={cert.is_revoked}
                      onClick={() => downloadFile(
                        `/certificates/${cert.certificate_number}/download`,
                        `certificate-${cert.certificate_number}.pdf`
                      ).catch(() => {})}
                    >
                      <Download className="h-4 w-4 mr-1" /> PDF
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setQrCertificate(cert)}>
                      <QrCode className="h-4 w-4 mr-1" /> QR
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {data && data.meta.total > data.meta.per_page && (
            <Pagination
              currentPage={data.meta.current_page}
              totalPages={data.meta.last_page}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <DialogRoot open={!!qrCertificate} onOpenChange={(open) => !open && setQrCertificate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Certificate QR Code</DialogTitle>
            <DialogDescription>
              Share this code so anyone can verify your certificate.
            </DialogDescription>
          </DialogHeader>
          {qrCertificate && (
            <div className="flex flex-col items-center gap-4 py-4">
              {qrImage ? (
                <img src={qrImage} alt="Certificate QR code" className="h-48 w-48 rounded border border-slate-200" />
              ) : (
                <div className="h-48 w-48 rounded border border-slate-200 flex items-center justify-center text-slate-400">
                  Loading QR…
                </div>
              )}
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-slate-900">{qrCertificate.certificate_number}</p>
                <p className="text-xs text-slate-500 font-mono break-all px-4">{qrCertificate.verification_code}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
