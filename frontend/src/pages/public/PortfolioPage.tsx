import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { publicPortfolioApi } from '@/lib/api';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Globe, Award, BookOpen, FolderKanban, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface PortfolioData {
  student: { id: string; name: string; avatar?: string; email?: string };
  enrolled_courses: { id: number; title: string; progress: number; enrolled_at: string }[];
  published_projects: {
    id: number;
    title: string;
    description?: string;
    technologies?: string[];
    is_published: boolean;
    media?: { id: number; type: string; path: string }[];
    created_at: string;
  }[];
  certificates: { id: number; certificate_id: string; course: { title: string }; issued_at: string }[];
}

export default function PortfolioPage() {
  const { studentId } = useParams<{ studentId: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['portfolio', studentId],
    queryFn: () => publicPortfolioApi.getStudent(studentId!),
    enabled: !!studentId,
  });

  if (isLoading) return <PageSpinner />;

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-slate-900 mb-2">Portfolio Not Found</h1>
            <p className="text-slate-500">This student portfolio is not available or the link is invalid.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const portfolio = data as unknown as PortfolioData;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          {portfolio.student.avatar && (
            <img
              src={portfolio.student.avatar}
              alt={portfolio.student.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white/30 object-cover"
            />
          )}
          <h1 className="text-3xl font-bold mb-2">{portfolio.student.name}</h1>
          {portfolio.student.email && (
            <p className="text-blue-100 text-sm">{portfolio.student.email}</p>
          )}
          <div className="flex justify-center gap-4 mt-4 text-sm text-blue-100">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" /> {portfolio.enrolled_courses.length} courses
            </span>
            <span className="flex items-center gap-1">
              <FolderKanban className="h-4 w-4" /> {portfolio.published_projects.length} projects
            </span>
            <span className="flex items-center gap-1">
              <Award className="h-4 w-4" /> {portfolio.certificates.length} certificates
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 -mt-8">
        {/* Courses */}
        {portfolio.enrolled_courses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" /> Enrolled Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {portfolio.enrolled_courses.map((course) => (
                  <div key={course.id} className="border border-slate-200 rounded-lg p-3">
                    <p className="font-medium text-slate-900 text-sm">{course.title}</p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects */}
        {portfolio.published_projects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5" /> Published Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {portfolio.published_projects.map((project) => (
                <div key={project.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{project.title}</h3>
                      {project.description && (
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{project.description}</p>
                      )}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.technologies.map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 shrink-0">{formatDate(project.created_at)}</p>
                  </div>
                  {project.media && project.media.length > 0 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto">
                      {project.media.slice(0, 4).map((m) => (
                        <div key={m.id} className="w-20 h-20 rounded-md overflow-hidden border border-slate-200 shrink-0">
                          {m.type === 'image' ? (
                            <img src={m.path} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <video src={m.path} className="w-full h-full object-cover" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Certificates */}
        {portfolio.certificates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" /> Certificates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {portfolio.certificates.map((cert) => (
                  <div key={cert.id} className="border border-slate-200 rounded-lg p-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 shrink-0">
                      <Award className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">{cert.course.title}</p>
                      <p className="text-xs text-slate-500">{formatDate(cert.issued_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
