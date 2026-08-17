import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, FileText } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useParentReportCard } from '@/hooks/useParentPortal';
import { formatDateTime, getInitials } from '@/lib/utils';

export default function ParentReportCardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const cardId = Number(id);
  const { data: card, isLoading, isError } = useParentReportCard(cardId);

  if (isLoading) return <PageSpinner />;

  if (isError || !card) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            icon={FileText}
            title="Report card not found"
            description="This report card could not be found or you do not have access to it."
          />
        </CardContent>
      </Card>
    );
  }

  const student = card.student;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${card.term} Report Card`}
        description={`${card.academic_year} · ${student?.full_name ?? 'Student'}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Parent Portal', href: '/parent' },
          { label: 'Report Cards', href: '/parent/report-cards' },
          { label: card.term },
        ]}
        actions={
          <div className="flex gap-2">
            <Link to="/parent/report-cards" className={buttonVariants({ variant: 'outline' })}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        }
      />

      <Card className="print-area">
        <CardHeader className="border-b border-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-sm font-medium text-brand-700">
                {student?.photo_url ? (
                  <img src={student.photo_url} alt={student.full_name} className="h-full w-full object-cover" />
                ) : (
                  getInitials(student?.first_name || '', student?.last_name || '')
                )}
              </div>
              <div>
                <CardTitle>{card.term} — {card.academic_year}</CardTitle>
                <p className="text-sm text-slate-500">
                  {student?.full_name} {student?.grade ? `· ${student.grade}` : ''} {student?.branch ? `· ${student.branch}` : ''}
                </p>
              </div>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-brand-700">
                  {card.average_score != null ? Number(card.average_score) : '—'}
                </p>
                <p className="text-xs text-slate-500">Average</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{card.overall_grade || '—'}</p>
                <p className="text-xs text-slate-500">Overall Grade</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-4">Subject</th>
                  <th className="py-2 pr-4">Score</th>
                  <th className="py-2 pr-4">Grade</th>
                  <th className="py-2">Teacher Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {card.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 pr-4 font-medium text-slate-900">{item.subject}</td>
                    <td className="py-2.5 pr-4 text-slate-700">{item.score != null ? Number(item.score) : '—'}</td>
                    <td className="py-2.5 pr-4">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {item.grade || '—'}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-600">{item.teacher_comment || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {card.teacher_notes && (
            <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
              <p className="mb-1 font-semibold">Teacher&apos;s Notes</p>
              <p>{card.teacher_notes}</p>
            </div>
          )}

          <p className="text-xs text-slate-400">Issued {formatDateTime(card.issued_at)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
