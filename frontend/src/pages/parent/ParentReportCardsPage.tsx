import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useParentReportCards } from '@/hooks/useParentPortal';
import { formatDate, getInitials } from '@/lib/utils';
import type { ReportCard } from '@/types/portal';

export default function ParentReportCardsPage() {
  const { data, isLoading } = useParentReportCards();

  if (isLoading) return <PageSpinner />;

  const cards = data || [];
  const byStudent = cards.reduce<Record<number, ReportCard[]>>((acc, card) => {
    const id = card.student?.id ?? card.student_id;
    if (!acc[id]) acc[id] = [];
    acc[id].push(card);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report Cards"
        description="Academic reports for your children."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Parent Portal', href: '/parent' }, { label: 'Report Cards' }]}
      />

      {cards.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={FileText}
              title="No report cards yet"
              description="Report cards will appear here once they are issued."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(byStudent).map(([studentId, studentCards]) => {
            const student = studentCards[0].student;
            return (
              <Card key={studentId}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-xs font-medium text-brand-700">
                      {student?.photo_url ? (
                        <img src={student.photo_url} alt={student.full_name} className="h-full w-full object-cover" />
                      ) : (
                        getInitials(student?.first_name || '', student?.last_name || '')
                      )}
                    </div>
                    <span>{student?.full_name || 'Student'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {studentCards.map((card) => (
                      <Link
                        key={card.id}
                        to={`/parent/report-cards/${card.id}`}
                        className="group rounded-lg border border-slate-200 p-4 transition-all hover:border-brand-300 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{card.term}</p>
                            <p className="text-xs text-slate-500">{card.academic_year}</p>
                          </div>
                          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-sm font-bold text-brand-700">
                            {card.average_score != null ? Number(card.average_score) : '—'}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          Issued {formatDate(card.issued_at)} · {card.items_count} subjects
                        </p>
                        {card.overall_grade && (
                          <p className="mt-2 text-xs font-semibold text-emerald-600">
                            Overall grade: {card.overall_grade}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
