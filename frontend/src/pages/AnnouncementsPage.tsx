import { useQuery } from '@tanstack/react-query';
import { announcementsApi } from '@/lib/api';
import { AnnouncementList } from '@/components/features/announcements/AnnouncementList';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { AnnouncementForm } from '@/components/features/announcements/AnnouncementForm';
import type { AnnouncementCreate } from '@/types';
import { toast } from 'sonner';

export default function AnnouncementsPage() {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => announcementsApi.getAnnouncements({ page_size: 50 }),
  });

  const announcements = data?.results || [];

  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (formData: AnnouncementCreate) => {
    setIsCreating(true);
    try {
      await announcementsApi.createAnnouncement(formData);
      toast.success('Announcement published');
      setShowCreate(false);
      refetch();
    } catch {
      toast.error('Failed to create announcement');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Stay updated with latest news"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Announcements' }]}
        actions={
          <Button onClick={() => setShowCreate(true)}>New Announcement</Button>
        }
      />

      {isLoading ? (
        <PageSpinner />
      ) : isError ? (
        <div className="text-center py-12 text-red-500">Failed to load announcements. Please try again.</div>
      ) : (
        <AnnouncementList
          announcements={announcements}
          onClick={(ann) => navigate(`/announcements/${ann.id}`)}
        />
      )}

      <DialogRoot open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Announcement</DialogTitle>
          </DialogHeader>
          <AnnouncementForm
            onSubmit={handleCreate}
            isLoading={isCreating}
          />
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
