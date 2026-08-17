import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLibraryResource, useBorrowResource, useReserveResource } from '@/hooks/useLibrary';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import {
  ArrowLeft,
  Download,
  BookOpen,
  CalendarClock,
  Eye,
} from 'lucide-react';
import type { LibraryResourceType } from '@/types/library';

const typeLabel: Record<LibraryResourceType, string> = {
  ebook: 'E-Book',
  video: 'Video',
  notes: 'Notes',
  past_paper: 'Past Paper',
  coding_resource: 'Coding Resource',
  robotics_manual: 'Robotics Manual',
};

const formatDate = (v?: string | null) => (v ? new Date(v).toLocaleDateString() : '—');

export default function LibraryResourceDetailPage() {
  const { id } = useParams();
  const resourceId = Number(id);
  const navigate = useNavigate();

  const [borrowOpen, setBorrowOpen] = useState(false);
  const [dueAt, setDueAt] = useState('');
  const [reserveOpen, setReserveOpen] = useState(false);
  const [reserveNote, setReserveNote] = useState('');

  const { data: resource, isLoading } = useLibraryResource(resourceId);
  const borrowResource = useBorrowResource();
  const reserveResource = useReserveResource();

  if (isLoading) return <PageSpinner />;
  if (!resource) return null;

  const canBorrow = resource.is_active && resource.is_public && !resource.is_borrowed;

  const handleBorrow = async () => {
    await borrowResource.mutateAsync({ id: resourceId, data: { due_at: dueAt || null } });
    setBorrowOpen(false);
    setDueAt('');
  };

  const handleReserve = async () => {
    await reserveResource.mutateAsync({ id: resourceId, data: { note: reserveNote || null } });
    setReserveOpen(false);
    setReserveNote('');
  };

  const handleDownload = () => {
    if (resource.download_url) {
      window.open(resource.download_url, '_blank');
    }
  };

  const handleRead = () => {
    if (resource.stream_url) {
      window.open(resource.stream_url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={resource.title}
        description={typeLabel[resource.resource_type]}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Library', href: '/library' },
          { label: resource.title },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/library')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            {resource.download_url && (
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            )}
            {resource.stream_url && (
              <Button variant="outline" onClick={handleRead}>
                <Eye className="h-4 w-4 mr-2" /> Open
              </Button>
            )}
            {canBorrow && (
              <Button onClick={() => setBorrowOpen(true)}>
                <BookOpen className="h-4 w-4 mr-2" /> Borrow
              </Button>
            )}
            {!canBorrow && resource.is_active && resource.is_public && (
              <Button variant="secondary" onClick={() => setReserveOpen(true)}>
                <CalendarClock className="h-4 w-4 mr-2" /> Reserve
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-900">About this resource</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {resource.description ?? 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          {resource.stream_url && resource.resource_type === 'video' && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-slate-900">Preview</h3>
                <video
                  src={resource.stream_url}
                  controls
                  className="mt-3 w-full rounded-lg bg-slate-900"
                  style={{ maxHeight: 360 }}
                />
              </CardContent>
            </Card>
          )}

          {resource.stream_url && resource.resource_type !== 'video' && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-slate-900">Read</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {resource.mime_type === 'application/pdf' ? 'This is a PDF document.' : 'Open this resource to view its contents.'}
                </p>
                <Button className="mt-3" variant="outline" onClick={handleRead}>
                  <Eye className="h-4 w-4 mr-2" /> Open resource
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-900">Details</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Type</dt>
                  <dd className="font-medium text-slate-900">{typeLabel[resource.resource_type]}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Author</dt>
                  <dd className="font-medium text-slate-900">{resource.author?.name ?? '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Category</dt>
                  <dd className="font-medium text-slate-900">{resource.category?.name ?? '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Language</dt>
                  <dd className="font-medium text-slate-900 uppercase">{resource.language}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">File size</dt>
                  <dd className="font-medium text-slate-900">{resource.file_size_human ?? '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Views</dt>
                  <dd className="font-medium text-slate-900">{resource.view_count}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Status</dt>
                  <dd>
                    {resource.is_borrowed ? <Badge variant="warning">Borrowed</Badge> : <Badge variant="success">Available</Badge>}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {resource.active_borrowing && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-slate-900">Currently borrowed by</h3>
                <p className="mt-2 text-lg font-bold text-slate-900">{resource.active_borrowing.user?.name ?? 'Unknown'}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Since {formatDate(resource.active_borrowing.borrowed_at)}
                  {resource.active_borrowing.due_at ? ` · Due ${formatDate(resource.active_borrowing.due_at)}` : ''}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Borrow dialog */}
      <DialogRoot open={borrowOpen} onOpenChange={setBorrowOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Borrow Resource</DialogTitle>
            <DialogDescription>Borrow this resource from the library.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              label="Due Date (optional)"
              type="date"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBorrowOpen(false)}>Cancel</Button>
            <Button onClick={handleBorrow} loading={borrowResource.isPending}>Borrow</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Reserve dialog */}
      <DialogRoot open={reserveOpen} onOpenChange={setReserveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reserve Resource</DialogTitle>
            <DialogDescription>
              This resource is currently borrowed. Reserve it and you will be notified when it is returned.
            </DialogDescription>
          </DialogHeader>
          <Textarea label="Note" value={reserveNote} onChange={(e) => setReserveNote(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReserveOpen(false)}>Cancel</Button>
            <Button onClick={handleReserve} loading={reserveResource.isPending}>Reserve</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
