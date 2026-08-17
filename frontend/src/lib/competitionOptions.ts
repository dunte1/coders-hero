import type { CompetitionStatus, CompetitionTeamStatus, CompetitionType } from '@/types/competitions';

export const COMPETITION_TYPES: { value: CompetitionType; label: string }[] = [
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'robotics_challenge', label: 'Robotics Challenge' },
  { value: 'ai_challenge', label: 'AI Challenge' },
  { value: 'web_design', label: 'Web Design' },
  { value: 'mobile_app', label: 'Mobile App' },
];

export const COMPETITION_STATUSES: { value: CompetitionStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'registration_open', label: 'Registration Open' },
  { value: 'registration_closed', label: 'Registration Closed' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const COMPETITION_STATUS_TRANSITIONS: Record<CompetitionStatus, CompetitionStatus[]> = {
  draft: ['registration_open', 'cancelled'],
  registration_open: ['registration_closed', 'cancelled'],
  registration_closed: ['ongoing', 'cancelled'],
  ongoing: ['completed', 'cancelled'],
  completed: [],
  cancelled: ['registration_open'],
};

export const COMPETITION_TEAM_STATUSES: { value: CompetitionTeamStatus; label: string }[] = [
  { value: 'registered', label: 'Registered' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'disqualified', label: 'Disqualified' },
];

export function competitionTypeLabel(type: CompetitionType): string {
  return COMPETITION_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function competitionStatusLabel(status: CompetitionStatus): string {
  return COMPETITION_STATUSES.find((s) => s.value === status)?.label ?? status;
}
