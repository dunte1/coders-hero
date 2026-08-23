import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { useStudentProject, useCreateStudentProject, useUpdateStudentProject } from '@/hooks/useMyProjects';
import { studentProjectSourceApi } from '@/lib/api';
import { X, Upload, FileArchive, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function StudentProjectFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const queryClient = useQueryClient();

  const { data: existingProject, isLoading: loadingProject } = useStudentProject(Number(id));
  const createMutation = useCreateStudentProject();
  const updateMutation = useUpdateStudentProject();

  const [title, setTitle] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [status, setStatus] = useState<'planning' | 'in_progress' | 'completed' | 'archived'>('planning');
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUploading, setSourceUploading] = useState(false);
  const [sourceUploaded, setSourceUploaded] = useState(false);

  useEffect(() => {
    if (existingProject) {
      const p = existingProject as any;
      setTitle(p.title ?? '');
      setProblemStatement(p.problem_statement ?? '');
      setDescription(p.description ?? '');
      setTechnologies(p.technologies ?? []);
      setRepoUrl(p.repo_url ?? '');
      setDemoUrl(p.demo_url ?? '');
      setStatus(p.status ?? 'planning');
    }
  }, [existingProject]);

  if (isEdit && loadingProject) return <PageSpinner />;

  const handleAddTech = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = techInput.trim().replace(/,/g, '');
      if (val && !technologies.includes(val)) {
        setTechnologies([...technologies, val]);
      }
      setTechInput('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechnologies(technologies.filter((t) => t !== tech));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      problem_statement: problemStatement || undefined,
      description: description || undefined,
      technologies: technologies.length > 0 ? technologies : undefined,
      repo_url: repoUrl || undefined,
      demo_url: demoUrl || undefined,
      status,
    };

    const afterSave = async (projectId: number) => {
      if (sourceFile && projectId) {
        setSourceUploading(true);
        try {
          await studentProjectSourceApi.uploadSource(projectId, sourceFile);
          toast.success('Source code uploaded');
          setSourceUploaded(true);
          queryClient.invalidateQueries({ queryKey: ['student-projects'] });
        } catch {
          toast.error('Project saved but source upload failed');
        }
        setSourceUploading(false);
      }
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: Number(id), data: payload },
        {
          onSuccess: async () => {
            await afterSave(Number(id));
            navigate('/student/projects');
          },
        }
      );
    } else {
      createMutation.mutate(payload as any, {
        onSuccess: async (created: any) => {
          await afterSave(created?.id ?? Number(id));
          navigate('/student/projects');
        },
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Project' : 'New Project'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'My Projects', href: '/student/projects' },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
      />

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Project title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Problem Statement</label>
              <Textarea
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="What problem does this project solve?"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Technologies</label>
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={handleAddTech}
                placeholder="Type a technology and press Enter"
              />
              {technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {technologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="gap-1 pr-1">
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(tech)}
                        className="ml-1 rounded-full hover:bg-slate-200 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Repository URL</label>
                <Input
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Demo URL</label>
                <Input
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Source Code (zip/rar/tar.gz, max 50MB)
              </label>
              <input
                type="file"
                accept=".zip,.rar,.tar.gz"
                onChange={(e) => {
                  setSourceFile(e.target.files?.[0] ?? null);
                  setSourceUploaded(false);
                }}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {sourceFile && (
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-md">
                  <FileArchive className="h-4 w-4 text-blue-500" />
                  <span>{sourceFile.name}</span>
                  <span className="text-slate-400">({(sourceFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  {sourceUploaded && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                </div>
              )}
              {sourceUploading && (
                <p className="mt-1 text-xs text-blue-600">Uploading source code...</p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={isPending || !title.trim()}>
                {isPending ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/student/projects')}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
