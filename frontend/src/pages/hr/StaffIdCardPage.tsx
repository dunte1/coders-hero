import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { Printer, Download } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useHrEmployee } from '@/hooks/useHr';
import { hrApi } from '@/lib/hrApi';
import { downloadBlob, getErrorMessage } from '@/lib/studentsApi';
import { formatDate, getInitials } from '@/lib/utils';
import { toast } from 'sonner';

export default function StaffIdCardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const employeeId = id ? parseInt(id, 10) : null;

  const { data: employee, isLoading } = useHrEmployee(employeeId as number);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await hrApi.idCardPdf(employeeId as number);
      downloadBlob(blob, `id-card-${employee?.employee_id ?? 'staff'}.pdf`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (employee?.qr_code) {
      QRCode.toDataURL(employee.qr_code, { width: 180, margin: 1 })
        .then(setQrUrl)
        .catch(() => setQrUrl(null));
    } else {
      setQrUrl(null);
    }
  }, [employee?.qr_code]);

  if (!employeeId) return null;
  if (isLoading) return <PageSpinner />;
  if (!employee) return <div className="py-12 text-center text-slate-500">Employee not found</div>;

  const fullName = employee.user?.name ?? 'Unknown';
  const employeeIdCode = employee.employee_id ?? '';
  const departmentName = employee.department?.name ?? '—';
  const positionName = employee.position?.name ?? '—';

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #id-card-print, #id-card-print * { visibility: visible; }
          #id-card-print { position: absolute; left: 0; top: 0; }
          #print-toolbar { display: none !important; }
        }
      `}</style>

      <div id="print-toolbar">
        <PageHeader
          title="Staff ID Card"
          description={`QR-scannable ID for ${fullName}`}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'HR', href: '/hr' },
            { label: 'Employees', href: '/hr/employees' },
            { label: fullName, href: `/hr/employees/${employeeId}` },
            { label: 'ID Card' },
          ]}
          actions={
            <>
              <Button variant="outline" onClick={() => navigate(`/hr/employees/${employeeId}`)}>
                Back to Profile
              </Button>
              <Button variant="outline" loading={downloading} onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Print Card
              </Button>
            </>
          }
        />
      </div>

      <div id="id-card-print" className="flex justify-center">
        <div className="w-[380px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="bg-brand-600 p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold">Coder&apos;s Hero</p>
                <p className="text-xs text-brand-100">Staff Identification Card</p>
              </div>
              <div className="rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold">
                {employee.status?.toUpperCase() ?? 'ACTIVE'}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-50 text-xl font-medium text-brand-700">
                {employee.photo_url ? (
                  <img src={employee.photo_url} alt={fullName} className="h-full w-full object-cover" />
                ) : (
                  getInitials(fullName.split(' ')[0] ?? '', fullName.split(' ').slice(1).join(' '))
                )}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-slate-900">{fullName}</p>
                <p className="text-sm text-slate-500">{employeeIdCode}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">Department</p>
                <p className="font-medium text-slate-900">{departmentName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Position</p>
                <p className="font-medium text-slate-900">{positionName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Employment Type</p>
                <p className="font-medium text-slate-900 capitalize">
                  {employee.employment_type?.replace('_', ' ') ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Hire Date</p>
                <p className="font-medium text-slate-900">
                  {employee.hire_date ? formatDate(employee.hire_date) : '—'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-end justify-between border-t border-slate-100 pt-4">
              <div>
                {employee.qr_code && (
                  <p className="mb-1 text-[10px] text-slate-400">Scan to verify</p>
                )}
                {qrUrl ? (
                  <img src={qrUrl} alt="QR code" className="h-24 w-24" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-slate-50 text-xs text-slate-400">
                    No QR code
                  </div>
                )}
              </div>
              <div className="text-right text-[10px] text-slate-400">
                <p>Scan this code to verify</p>
                <p>staff identity.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
