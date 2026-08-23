import { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  useStudentProject,
  usePublishStudentProject,
  useUnpublishStudentProject,
} from '@/hooks/useMyProjects';
import { studentProjectsApi } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Globe,
  Lock,
  ExternalLink,
  Upload,
  Trash2,
  FileText,
  Award,
  Hash,
} from 'lucide-react';
import type { StudentProject, ProjectMedia } from '@/types';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  planning: 'outline',
  in_progress: 'default',
  completed: 'secondary',
  archived: 'destructive',
};

export default function StudentProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: project, isLoading } = useStudentProject(Number(id));
  const publishMutation = usePublishStudentProject();
  const unpublishMutation = useUnpublishStudentProject();

  if (isLoading) return <PageSpinner />;
  if (!project) return null;

  const p = project as unknown as StudentProject;

  const handleUploadMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await studentProjectsApi.uploadMedia(p.id, file);
      toast.success('Media uploaded');
      queryClient.invalidateQueries({ queryKey: ['student-project', p.id] });
    } catch {
      toast.error('Failed to upload media');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteMedia = async (mediaId: number) => {
    if (!confirm('Delete this media file?')) return;
    try {
      await studentProjectsApi.deleteMedia(p.id, mediaId);
      toast.success('Media deleted');
      queryClient.invalidateQueries({ queryKey: ['student-project', p.id] });
    } catch {
      toast.error('Failed to delete media');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={p.title}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'My Projects', href: '/student/projects' },
          { label: p.title },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {p.is_published ? (
              <Button
                variant="outline"
                onClick={() => unpublishMutation.mutate(p.id)}
                disabled={unpublishMutation.isPending}
                className="gap-2"
              >
                <Lock className="h-4 w-4" /> Unpublish
              </Button>
            ) : (
              <Button
                onClick={() => publishMutation.mutate(p.id)}
                disabled={publishMutation.isPending}
                className="gap-2"
              >
                <Globe className="h-4 w-4" /> Publish
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate(`/student/projects/${p.id}/edit`)}>
              Edit
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant[p.status] ?? 'outline'}>
                  {p.status.replace('_', ' ')}
                </Badge>
                {p.version_number != null && p.version_number > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <Hash className="h-3 w-3" /> Version {p.version_number}
                  </Badge>
                )}
                {p.is_published && (
                  <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    <Globe className="h-3 w-3 mr-1" /> Published
                  </Badge>
                )}
                {p.final_score != null && (
                  <Badge variant="secondary">
                    <Award className="h-3 w-3 mr-1" /> Score: {p.final_score}
                  </Badge>
                )}
              </div>

              {p.problem_statement && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-1">Problem Statement</h4>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{p.problem_statement}</p>
                </div>
              )}

              {p.description && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-1">Description</h4>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{p.description}</p>
                </div>
              )}

              {p.technologies && p.technologies.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-1">Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {p.technologies.map((tech) => (
                      <Badge key={tech} variant="outline">{tech}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm">
                {p.repo_url && (
                  <a
                    href={p.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" /> Repository
                  </a>
                )}
                {p.demo_url && (
                  <a
                    href={p.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" /> Live Demo
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Media Gallery */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Media
              </CardTitle>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleUploadMedia}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1"
                >
                  <Upload className="h-3.5 w-3.5" /> Upload
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {p.media && p.media.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {p.media.map((m: ProjectMedia) => (
                    <div key={m.id} className="relative group rounded-md overflow-hidden border border-slate-200">
                      {m.type === 'image' ? (
                        <img
                          src={m.path}
                          alt={m.original_name ?? 'Media'}
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <video
                          src={m.path}
                          className="w-full h-32 object-cover"
                          controls
                        />
                      )}
                      <button
                        onClick={() => handleDeleteMedia(m.id)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No media uploaded yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Reviews */}
          {p.reviews && p.reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {p.reviews.map((review) => (
                  <div key={review.id} className="border border-slate-100 rounded-md p-3">
                    <div className="flex items-center gap-2 mb-1">
                      {review.score != null && (
                        <Badge variant="secondary">Score: {review.score}</Badge>
                      )}
                      <Badge variant={review.status === 'approved' ? 'default' : review.status === 'rejected' ? 'destructive' : 'outline'}>
                        {review.status}
                      </Badge>
                    </div>
                    {review.feedback && (
                      <p className="text-sm text-slate-600">{review.feedback}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button variant="outline" className="w-full" onClick={() => navigate('/student/projects')}>
                Back to Projects
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
