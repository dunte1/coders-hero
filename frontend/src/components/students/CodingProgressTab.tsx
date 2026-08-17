import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Code2, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDelete } from '@/components/cms/ConfirmDelete';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import {
  useStudentProgress,
  useSaveCodingProgress,
  useUpdateCodingProgress,
  useDeleteCodingProgress,
} from '@/hooks/useStudents';
import type { CodingProgress } from '@/types/portal';

const progressSchema = z.object({
  skill: z.string().min(1, 'Skill is required'),
  level: z.string().min(1, 'Level is required'),
  progress: z.string().min(1, 'Progress is required'),
  badge: z.string().optional(),
  notes: z.string().optional(),
});

type ProgressFormValues = z.infer<typeof progressSchema>;

function toDefaults(skill?: CodingProgress): ProgressFormValues {
  return {
    skill: skill?.skill || '',
    level: skill ? String(skill.level) : '1',
    progress: skill ? String(skill.progress) : '0',
    badge: skill?.badge || '',
    notes: skill?.notes || '',
  };
}

function ProgressFormDialog({
  studentId,
  skill,
  onClose,
}: {
  studentId: number;
  skill?: CodingProgress;
  onClose: () => void;
}) {
  const isEdit = !!skill;
  const saveMutation = useSaveCodingProgress();
  const updateMutation = useUpdateCodingProgress();
  const pending = isEdit ? updateMutation.isPending : saveMutation.isPending;

  const methods = useForm<ProgressFormValues>({
    resolver: zodResolver(progressSchema),
    defaultValues: toDefaults(skill),
  });

  const onSubmit = (values: ProgressFormValues) => {
    const data = {
      skill: values.skill,
      level: Number(values.level),
      progress: Number(values.progress),
      badge: values.badge || null,
      notes: values.notes || null,
    };
    if (isEdit && skill) {
      updateMutation.mutate(
        { progressId: skill.id, data },
        { onSuccess: () => onClose() }
      );
    } else {
      saveMutation.mutate(
        { studentId, data },
        { onSuccess: () => onClose() }
      );
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Skill" placeholder="e.g. Python Loops" error={methods.formState.errors.skill?.message} {...methods.register('skill')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Level" type="number" min="1" max="20" error={methods.formState.errors.level?.message} {...methods.register('level')} />
          <Input label="Progress (%)" type="number" min="0" max="100" error={methods.formState.errors.progress?.message} {...methods.register('progress')} />
        </div>
        <Input label="Badge (optional)" placeholder="e.g. Loop Master" {...methods.register('badge')} />
        <Textarea label="Notes (optional)" rows={2} {...methods.register('notes')} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={pending}>
            {isEdit ? 'Save Changes' : 'Add Skill'}
          </Button>
        </DialogFooter>
      </form>
    </FormProvider>
  );
}

function levelLabel(level: number): string {
  if (level <= 1) return 'Beginner';
  if (level <= 3) return 'Intermediate';
  return 'Advanced';
}

export function CodingProgressTab({ studentId }: { studentId: number }) {
  const { data, isLoading } = useStudentProgress(studentId);
  const deleteMutation = useDeleteCodingProgress();
  const [createOpen, setCreateOpen] = useState(false);
  const [editSkill, setEditSkill] = useState<CodingProgress | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  if (isLoading) return <PageSpinner />;

  const skills = data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">
          {skills.length} skill{skills.length === 1 ? '' : 's'}
        </p>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add Skill
        </Button>
      </div>

      {skills.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Code2}
              title="No coding progress"
              description="Record coding skills and progress for this student."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <Card key={skill.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm">{skill.skill}</CardTitle>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Level {skill.level} · {levelLabel(skill.level)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditSkill(skill)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500"
                      onClick={() => setDeleteId(skill.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>Progress</span>
                  <span className="font-semibold text-slate-700">{skill.progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.min(Math.max(Number(skill.progress) || 0, 0), 100)}%` }} />
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {skill.badge && <Badge variant="secondary">{skill.badge}</Badge>}
                </div>
                {skill.notes && <p className="text-xs text-slate-500">{skill.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DialogRoot open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Coding Skill</DialogTitle>
            <DialogDescription>Record a coding skill with progress for this student.</DialogDescription>
          </DialogHeader>
          <ProgressFormDialog studentId={studentId} onClose={() => setCreateOpen(false)} />
        </DialogContent>
      </DialogRoot>

      <DialogRoot open={!!editSkill} onOpenChange={(open) => !open && setEditSkill(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Coding Skill</DialogTitle>
            <DialogDescription>Update this skill&apos;s progress.</DialogDescription>
          </DialogHeader>
          {editSkill && <ProgressFormDialog studentId={studentId} skill={editSkill} onClose={() => setEditSkill(null)} />}
        </DialogContent>
      </DialogRoot>

      <ConfirmDelete
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Coding Skill"
        description="Are you sure you want to delete this coding progress entry? This action cannot be undone."
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
      />
    </div>
  );
}
