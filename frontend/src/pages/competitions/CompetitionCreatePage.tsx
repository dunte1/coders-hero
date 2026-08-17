import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCompetition } from '@/hooks/useCompetitions';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { ArrowLeft } from 'lucide-react';
import { COMPETITION_TYPES, COMPETITION_STATUSES } from '@/lib/competitionOptions';
import type { CompetitionType, CompetitionStatus } from '@/types/competitions';

export default function CompetitionCreatePage() {
  const navigate = useNavigate();
  const createCompetition = useCreateCompetition();

  const [name, setName] = useState('');
  const [type, setType] = useState<CompetitionType>('hackathon');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [minTeamSize, setMinTeamSize] = useState('1');
  const [maxTeamSize, setMaxTeamSize] = useState('4');
  const [status, setStatus] = useState<CompetitionStatus>('draft');

  const handleSubmit = () => {
    createCompetition.mutate(
      {
        name,
        type,
        description: description || null,
        venue: venue || null,
        start_date: startDate || null,
        end_date: endDate || null,
        registration_deadline: deadline ? new Date(deadline).toISOString() : null,
        min_team_size: Number(minTeamSize) || null,
        max_team_size: Number(maxTeamSize) || null,
        status,
      },
      {
        onSuccess: (competition) => navigate(`/competitions/${competition.id}`),
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Competition"
        description="Set up a new coding or robotics competition"
        breadcrumbs={[{ label: 'Competitions', href: '/competitions' }, { label: 'New Competition' }]}
        actions={
          <Button variant="outline" onClick={() => navigate('/competitions')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        }
      />

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>You can add judging criteria and judges after creation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input label="Name *" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Campus Hackathon 2026" />
            </div>
            <SelectRoot value={type} onValueChange={(v) => setType(v as CompetitionType)}>
              <SelectTrigger label="Type *"><SelectValue /></SelectTrigger>
              <SelectContent>
                {COMPETITION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
            <SelectRoot value={status} onValueChange={(v) => setStatus(v as CompetitionStatus)}>
              <SelectTrigger label="Status"><SelectValue /></SelectTrigger>
              <SelectContent>
                {COMPETITION_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
            <div className="sm:col-span-2">
              <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe the competition..." />
            </div>
            <div className="sm:col-span-2">
              <Input label="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Innovation Hall" />
            </div>
            <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <Input label="Registration Deadline" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Min Team Size" type="number" min={1} value={minTeamSize} onChange={(e) => setMinTeamSize(e.target.value)} />
              <Input label="Max Team Size" type="number" min={1} value={maxTeamSize} onChange={(e) => setMaxTeamSize(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => navigate('/competitions')}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!name.trim() || createCompetition.isPending}>
              {createCompetition.isPending ? 'Creating...' : 'Create Competition'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
