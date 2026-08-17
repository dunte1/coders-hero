import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { Printer, Download } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useStudent } from '@/hooks/useStudents';
import { downloadBlob, studentsApi, getErrorMessage } from '@/lib/studentsApi';
import { formatDate, getInitials } from '@/lib/utils';
import { toast } from 'sonner';

export default function StudentIdCardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const studentId = id ? parseInt(id, 10) : null;

  const { data: student, isLoading } = useStudent(studentId as number);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await studentsApi.idCardPdf(studentId as number);
      downloadBlob(blob, `id-card-${student?.student_id ?? 'student'}.pdf`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (student?.qr_code) {
      QRCode.toDataURL(student.qr_code, { width: 180, margin: 1 })
        .then(setQrUrl)
        .catch(() => setQrUrl(null));
    } else {
      setQrUrl(null);
    }
  }, [student?.qr_code]);

  if (!studentId) return null;
  if (isLoading) return <PageSpinner />;
  if (!student) return <div className="py-12 text-center text-slate-500">Student not found</div>;

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
          title="Student ID Card"
          description={`QR-scannable ID for ${student.full_name}`}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Students', href: '/students' },
            { label: student.full_name, href: `/students/${studentId}` },
            { label: 'ID Card' },
          ]}
          actions={
            <>
              <Button variant="outline" onClick={() => navigate(`/students/${studentId}`)}>
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
                <p className="text-xs text-brand-100">Student Identification Card</p>
              </div>
              <div className="rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold">
                {student.status.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-50 text-xl font-medium text-brand-700">
                {student.photo_url ? (
                  <img src={student.photo_url} alt={student.full_name} className="h-full w-full object-cover" />
                ) : (
                  getInitials(student.first_name, student.last_name)
                )}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-slate-900">{student.full_name}</p>
                <p className="text-sm text-slate-500">{student.student_id}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">Grade</p>
                <p className="font-medium text-slate-900">{student.grade || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Branch</p>
                <p className="font-medium text-slate-900">{student.branch || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Date of Birth</p>
                <p className="font-medium text-slate-900">
                  {student.date_of_birth ? formatDate(student.date_of_birth) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Valid From</p>
                <p className="font-medium text-slate-900">
                  {student.admission_date ? formatDate(student.admission_date) : '—'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-end justify-between border-t border-slate-100 pt-4">
              <div>
                {student.qr_code && (
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
                <p>student identity.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
