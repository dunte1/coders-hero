import { useState } from 'react';
import { Plus, Users as UsersIcon, Trash2, UserPlus } from 'lucide-react';
import {
  useRoboticsTeams,
  useRoboticsTeam,
  useCreateTeam,
  useAddTeamMember,
  useRemoveTeamMember,
  useStudentOptions,
} from '@/hooks/useRobotics';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/Dialog';
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/Select';
import { isRoboticsStaff } from '@/lib/roboticsUtils';
import type { RoboticsTeam, RoboticsTeamMember } from '@/types/robotics';

export default function RoboticsTeamsPage() {
  const { user } = useAuth();
  const isStaff = isRoboticsStaff(user?.role?.name);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [manageId, setManageId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data, isLoading } = useRoboticsTeams({ search: search || undefined });
  const { data: team } = useRoboticsTeam(manageId ?? 0);
  const { data: students } = useStudentOptions();
  const createTeam = useCreateTeam();
  const addMember = useAddTeamMember();
  const removeMember = useRemoveTeamMember();

  const [memberForm, setMemberForm] = useState({ student_id: '', role: 'member' });

  const handleCreate = () => {
    createTeam.mutate(
      { name, description: description || null },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setName('');
          setDescription('');
        },
      }
    );
  };

  const handleAddMember = () => {
    if (!manageId || !memberForm.student_id) return;
    addMember.mutate(
      { teamId: manageId, data: { student_id: Number(memberForm.student_id), role: memberForm.role as 'leader' | 'member' } },
      {
        onSuccess: () => {
          setMemberForm({ student_id: '', role: 'member' });
        },
      }
    );
  };

  const columns: Column<RoboticsTeam>[] = [
    {
      key: 'name',
      header: 'Team',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <UsersIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-slate-900">{item.name}</p>
            <p className="text-xs text-slate-500">{item.mentor?.name ?? 'No mentor'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'members_count',
      header: 'Members',
      render: (item) => <span className="text-slate-700">{item.members_count ?? 0}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Robotics Teams"
        description="Teams, members and mentors"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Robotics Lab', href: '/robotics/dashboard' }, { label: 'Teams' }]}
        actions={
          isStaff && (
            <DialogRoot open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Create Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Team</DialogTitle>
                  <DialogDescription>Start a new robotics team.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <Input label="Team name *" value={name} onChange={(e) => setName(e.target.value)} />
                  <div>
                    <Textarea className="mt-1.5" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleCreate} disabled={!name || createTeam.isPending}>
                    {createTeam.isPending ? 'Creating...' : 'Create Team'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </DialogRoot>
          )
        }
      />

      <DataTable
        columns={columns}
        data={data?.results ?? []}
        totalCount={data?.meta.total ?? 0}
        page={page}
        pageSize={data?.meta.per_page ?? 10}
        onPageChange={setPage}
        searchPlaceholder="Search teams..."
        onSearch={(q) => {
          setSearch(q);
          setPage(1);
        }}
        rowActions={
          isStaff
            ? (item) => (
                <Button variant="ghost" size="sm" onClick={() => setManageId(item.id)}>
                  <UserPlus className="h-4 w-4 mr-1" /> Members
                </Button>
              )
            : undefined
        }
      />

      <DialogRoot open={manageId !== null} onOpenChange={(o) => { if (!o) setManageId(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage {team?.name ?? 'team'}</DialogTitle>
            <DialogDescription>Add or remove team members.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <SelectRoot value={memberForm.student_id} onValueChange={(v) => setMemberForm({ ...memberForm, student_id: v })}>
                <SelectTrigger label="Student">
                  <SelectValue placeholder="Select student..." />
                </SelectTrigger>
                <SelectContent>
                  {(students ?? []).map((s: { id: number; full_name: string }) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
              <div>
                <SelectRoot value={memberForm.role} onValueChange={(v) => setMemberForm({ ...memberForm, role: v })}>
                  <SelectTrigger label="Role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="leader">Leader</SelectItem>
                  </SelectContent>
                </SelectRoot>
              </div>
            </div>
            <Button onClick={handleAddMember} disabled={!memberForm.student_id || addMember.isPending} className="w-full">
              <UserPlus className="h-4 w-4 mr-2" /> Add Member
            </Button>
          </div>
          <div className="mt-2">
            <p className="mb-2 text-sm font-medium text-slate-700">Current members</p>
            {(team?.members?.length ?? 0) === 0 ? (
              <p className="text-sm text-slate-500">No members yet.</p>
            ) : (
              <ul className="space-y-2">
                {team?.members?.map((m: RoboticsTeamMember) => (
                  <li key={m.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 text-sm">
                    <div>
                      <p className="font-medium text-slate-900">{m.name ?? m.full_name}</p>
                      <p className="text-xs text-slate-500 capitalize">{(m.pivot?.role ?? m.role ?? 'member').replace(/_/g, ' ')}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      onClick={() => removeMember.mutate({ teamId: manageId!, studentId: m.id })}
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
