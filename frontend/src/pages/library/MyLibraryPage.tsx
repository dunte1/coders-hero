import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyBorrowings, useMyReservations, useMyHistory, useCancelMyReservation } from '@/hooks/useLibrary';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { BookOpen, CalendarClock, History } from 'lucide-react';

const formatDate = (v?: string | null) => (v ? new Date(v).toLocaleDateString() : '—');

export default function MyLibraryPage() {
  const navigate = useNavigate();
  const [borrowPage, setBorrowPage] = useState(1);
  const [reservePage, setReservePage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  const { data: borrowingsData, isLoading: borrowingsLoading } = useMyBorrowings({ page: borrowPage, per_page: 10 });
  const { data: reservationsData, isLoading: reservationsLoading } = useMyReservations({ page: reservePage, per_page: 10 });
  const { data: historyData, isLoading: historyLoading } = useMyHistory({ page: historyPage, per_page: 10 });
  const cancelReservation = useCancelMyReservation();

  const handleCancel = async (id: number) => {
    if (!window.confirm('Cancel this reservation?')) return;
    await cancelReservation.mutateAsync(id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Library"
        description="Your borrowings, reservations and reading history"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Library', href: '/library' }, { label: 'My Library' }]}
      />

      <Tabs defaultValue="borrowings">
        <TabsList>
          <TabsTrigger value="borrowings">Borrowings</TabsTrigger>
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
          <TabsTrigger value="history">Reading History</TabsTrigger>
        </TabsList>

        <TabsContent value="borrowings">
          {borrowingsLoading ? (
            <PageSpinner />
          ) : !borrowingsData?.results || borrowingsData.results.length === 0 ? (
            <Card><CardContent><EmptyState icon={BookOpen} title="No borrowings" description="Borrow resources from the catalog to see them here." action={{ label: 'Browse Library', onClick: () => navigate('/library') }} /></CardContent></Card>
          ) : (
            <Card>
              <CardContent className="p-5">
                <div className="divide-y divide-slate-100">
                  {borrowingsData.results.map((b) => (
                    <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <button
                          className="text-sm font-medium text-slate-900 hover:text-brand-600 truncate"
                          onClick={() => navigate(`/library/resources/${b.resource_id}`)}
                        >
                          {b.resource?.title ?? `Resource #${b.resource_id}`}
                        </button>
                        <p className="text-xs text-slate-500">
                          Borrowed {formatDate(b.borrowed_at)}
                          {b.due_at ? ` · Due ${formatDate(b.due_at)}` : ''}
                          {b.returned_at ? ` · Returned ${formatDate(b.returned_at)}` : ''}
                        </p>
                      </div>
                      {b.status === 'overdue' ? (
                        <Badge variant="destructive">Overdue</Badge>
                      ) : b.status === 'returned' ? (
                        <Badge variant="secondary">Returned</Badge>
                      ) : (
                        <Badge variant="success">Borrowed</Badge>
                      )}
                    </div>
                  ))}
                </div>
                {borrowingsData.meta.last_page > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={borrowingsData.meta.current_page}
                      totalPages={borrowingsData.meta.last_page}
                      onPageChange={setBorrowPage}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reservations">
          {reservationsLoading ? (
            <PageSpinner />
          ) : !reservationsData?.results || reservationsData.results.length === 0 ? (
            <Card><CardContent><EmptyState icon={CalendarClock} title="No reservations" description="Reserve borrowed resources to get notified when they are returned." /></CardContent></Card>
          ) : (
            <Card>
              <CardContent className="p-5">
                <div className="divide-y divide-slate-100">
                  {reservationsData.results.map((r) => (
                    <div key={r.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <button
                          className="text-sm font-medium text-slate-900 hover:text-brand-600 truncate"
                          onClick={() => navigate(`/library/resources/${r.resource_id}`)}
                        >
                          {r.resource?.title ?? `Resource #${r.resource_id}`}
                        </button>
                        <p className="text-xs text-slate-500">
                          Reserved {formatDate(r.reserved_at)}
                          {r.expires_at ? ` · Expires ${formatDate(r.expires_at)}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.status === 'pending' ? (
                          <Badge variant="warning">Pending</Badge>
                        ) : r.status === 'fulfilled' ? (
                          <Badge variant="success">Fulfilled</Badge>
                        ) : (
                          <Badge variant="secondary">Cancelled</Badge>
                        )}
                        {r.status === 'pending' && (
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleCancel(r.id)}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {reservationsData.meta.last_page > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={reservationsData.meta.current_page}
                      totalPages={reservationsData.meta.last_page}
                      onPageChange={setReservePage}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          {historyLoading ? (
            <PageSpinner />
          ) : !historyData?.results || historyData.results.length === 0 ? (
            <Card><CardContent><EmptyState icon={History} title="No reading history" description="Resources you open will appear here." /></CardContent></Card>
          ) : (
            <Card>
              <CardContent className="p-5">
                <div className="divide-y divide-slate-100">
                  {historyData.results.map((h) => (
                    <div key={h.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <button
                          className="text-sm font-medium text-slate-900 hover:text-brand-600 truncate"
                          onClick={() => navigate(`/library/resources/${h.resource_id}`)}
                        >
                          {h.resource?.title ?? `Resource #${h.resource_id}`}
                        </button>
                        <p className="text-xs text-slate-500">Last read {formatDate(h.read_at)}</p>
                      </div>
                      <span className="text-xs text-slate-400">{h.times_read}×</span>
                    </div>
                  ))}
                </div>
                {historyData.meta.last_page > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={historyData.meta.current_page}
                      totalPages={historyData.meta.last_page}
                      onPageChange={setHistoryPage}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
