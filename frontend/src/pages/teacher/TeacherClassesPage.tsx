import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/Select';
import { DialogRoot, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTeacherClasses, useCreateClass, useDeleteClass } from '@/hooks/useTeacher';
import type { ClassInput } from '@/types/teacher';

export default function TeacherClassesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('active');
  const { data, isLoading } = useTeacherClasses({ page, search, status });
  const createClass = useCreateClass();
  const deleteClass = useDeleteClass();
  const [form, setForm] = useState<ClassInput>({ name: '', subject: '', room: '', capacity: 30, status: 'active' });
  const [open, setOpen] = useState(false);

  const classes = data?.results ?? [];

  const handleCreate = () => {
    createClass.mutate(
      { ...form, capacity: form.capacity ?? 30 },
      { onSuccess: () => { setOpen(false); setForm({ name: '', subject: '', room: '', capacity: 30, status: 'active' }); } }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description="Manage your classes, rosters and attendance."
        actions={
          <DialogRoot open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" />New Class</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Class</DialogTitle>
                <DialogDescription>Add a new class you teach.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Grade 7 Robotics" />
                <Input label="Subject" value={form.subject ?? ''} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Robotics" />
                <Input label="Room" value={form.room ?? ''} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="e.g. Room 12" />
                <Input label="Capacity" type="number" value={form.capacity ?? ''} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} loading={createClass.isPending}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </DialogRoot>
        }
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>My Classes</CardTitle>
          <div className="flex items-center gap-3">
            <Input placeholder="Search classes..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-56" />
            <SelectRoot value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </SelectRoot>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Spinner />
          ) : classes.length === 0 ? (
            <EmptyState title="No classes found" description="Create your first class to get started." />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {classes.map((c) => (
                <Card key={c.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: c.color ?? '#e2e8f0' }}>
                        <Users className="h-5 w-5 text-slate-600" />
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-900">{c.name}</h3>
                    <p className="text-sm text-slate-500">
                      {c.subject || 'No subject'} {c.room ? `· ${c.room}` : ''}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-slate-500">{c.students_count ?? 0} students</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => deleteClass.mutate(c.id)}
                        >
                          Delete
                        </Button>
                        <Link to={`/teacher/classes/${c.id}`}>
                          <Button variant="outline" size="sm">
                            Open <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
