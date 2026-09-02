import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Award, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Certificate } from '@/types';
import { formatDate } from '@/lib/utils';

interface CertificateCardProps {
  certificate: Certificate;
  onDownload?: (cert: Certificate) => void;
}

export function CertificateCard({ certificate, onDownload }: CertificateCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 p-6 text-center">
        {certificate.badge_name ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${certificate.badge_color ?? '#6366f1'}20` }}
            >
              <ShieldCheck className="h-7 w-7" style={{ color: certificate.badge_color ?? '#6366f1' }} />
            </div>
            <span className="text-white/90 text-xs font-semibold uppercase tracking-wider">
              {certificate.badge_name}
            </span>
          </div>
        ) : (
          <Award className="h-12 w-12 text-white/80 mx-auto mb-3" />
        )}
        <h3 className="text-white font-bold text-lg">{certificate.course?.title}</h3>
      </div>
      <CardContent className="p-5">
        <div className="text-center mb-4">
          <p className="text-sm text-slate-500">Awarded to</p>
          <p className="font-semibold text-slate-900">
            {certificate.student?.first_name} {certificate.student?.last_name}
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Certificate ID</span>
            <span className="font-mono text-xs text-slate-700">{certificate.certificate_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Issued Date</span>
            <span className="text-slate-700">{formatDate(certificate.issued_at)}</span>
          </div>
          {certificate.expiry_date && (
            <div className="flex justify-between">
              <span className="text-slate-500">Expires</span>
              <span className="text-slate-700">{formatDate(certificate.expiry_date)}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Status</span>
            <Badge variant={certificate.is_valid ? 'success' : 'destructive'}>
              {certificate.is_valid ? 'Valid' : 'Expired'}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
          {onDownload && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onDownload(certificate)}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          )}
          <Button variant="outline" size="sm" className="flex-1">
            <ExternalLink className="h-4 w-4 mr-1" />
            Verify
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
