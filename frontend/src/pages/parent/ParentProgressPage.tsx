import { Code2, Award } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useParentProgress } from '@/hooks/useParentPortal';
import { getInitials } from '@/lib/utils';
import type { CodingSkill, ProgressGroup } from '@/types/portal';

function levelLabel(level: number): string {
  if (level <= 1) return 'Beginner';
  if (level <= 3) return 'Intermediate';
  return 'Advanced';
}

function SkillCard({ skill }: { skill: CodingSkill }) {
  const progress = Math.min(Math.max(Number(skill.progress) || 0, 0), 100);
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-slate-900">{skill.skill}</p>
          <p className="mt-0.5 text-xs text-slate-500">Level {skill.level} · {levelLabel(skill.level)}</p>
        </div>
        {skill.badge && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            <Award className="h-3 w-3" />
            {skill.badge}
          </span>
        )}
      </div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>Progress</span>
          <span className="font-semibold text-slate-700">{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      {skill.notes && <p className="mt-2 text-xs text-slate-500">{skill.notes}</p>}
    </div>
  );
}

function StudentProgressCard({ group, studentName, photoUrl }: { group: ProgressGroup; studentName?: string; photoUrl?: string | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-xs font-medium text-brand-700">
            {photoUrl ? <img src={photoUrl} alt={studentName || ''} className="h-full w-full object-cover" /> : getInitials(studentName || '', '')}
          </div>
          <span>{studentName || 'Student'}</span>
          <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            {Math.round(group.average_progress)}% avg
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-slate-500">
          {group.completed_skills} of {group.total_skills} skills completed
        </p>
        {group.skills.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">No coding progress recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ParentProgressPage() {
  const { data, isLoading } = useParentProgress();

  if (isLoading) return <PageSpinner />;

  const groups = data || {};
  const entries = Object.entries(groups);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coding Progress"
        description="Skills, levels and badges for your children."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Parent Portal', href: '/parent' }, { label: 'Coding Progress' }]}
      />

      {entries.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Code2}
              title="No progress recorded"
              description="Coding progress will appear here as your children complete skills."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {entries.map(([studentId, group]) => {
            const firstSkill = group.skills[0];
            return (
              <StudentProgressCard
                key={studentId}
                group={group}
                studentName={firstSkill?.student?.full_name}
                photoUrl={firstSkill?.student?.photo_url}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
