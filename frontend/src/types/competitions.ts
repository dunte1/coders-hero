export type CompetitionType =
  | 'hackathon'
  | 'robotics_challenge'
  | 'ai_challenge'
  | 'web_design'
  | 'mobile_app';

export type CompetitionStatus =
  | 'draft'
  | 'registration_open'
  | 'registration_closed'
  | 'ongoing'
  | 'completed'
  | 'cancelled';

export type CompetitionTeamStatus = 'registered' | 'submitted' | 'disqualified';
export type CompetitionTeamMemberRole = 'leader' | 'member';

export interface NamedUser {
  id: string;
  name: string;
  title?: string | null;
}

export interface CompetitionStudent {
  id: number;
  full_name: string;
  student_id?: string | null;
}

export interface CompetitionCriterion {
  id: number;
  competition_id: number;
  name: string;
  description: string | null;
  max_score: number;
  weight: number;
  sort_order: number;
}

export interface CompetitionTeam {
  id: number;
  competition_id: number;
  name: string;
  project_title: string | null;
  description: string | null;
  status: CompetitionTeamStatus;
  leader_student_id: number;
  submission_url: string | null;
  members_count?: number;
  is_leader?: boolean;
  leader?: CompetitionStudent | null;
  members?: CompetitionStudent[] | null;
  competition?: Competition | null;
  scores?: CompetitionScore[] | null;
  created_at?: string;
}

export interface CompetitionScore {
  id: number;
  competition_id: number;
  competition_team_id: number;
  criterion_id: number;
  judge_user_id: string;
  score: number;
  remarks: string | null;
  submitted_at: string | null;
  verified_by_user_id: string | null;
  verified_at: string | null;
  team?: CompetitionTeam | null;
  criterion?: CompetitionCriterion | null;
  judge?: NamedUser | null;
  verified_by?: NamedUser | null;
}

export interface Competition {
  id: number;
  name: string;
  slug: string;
  type: CompetitionType;
  description: string | null;
  rules: string[] | null;
  venue: string | null;
  start_date: string | null;
  end_date: string | null;
  registration_deadline: string | null;
  min_team_size: number;
  max_team_size: number;
  status: CompetitionStatus;
  created_by_user_id: string | null;
  created_by?: NamedUser | null;
  teams_count?: number;
  criteria_count?: number;
  judges?: NamedUser[] | null;
  criteria?: CompetitionCriterion[] | null;
  teams?: CompetitionTeam[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface CompetitionRankingBreakdown {
  criterion_id: number;
  name: string;
  max_score: number;
  weight: number;
  average_score: number | null;
  judge_count: number;
}

export interface CompetitionRanking {
  rank: number;
  team: {
    id: number;
    name: string;
    project_title: string | null;
    status: CompetitionTeamStatus;
    submission_url: string | null;
    member_count: number;
    leader: CompetitionStudent | null;
    members: CompetitionStudent[];
  };
  total_score: number;
  max_score: number;
  score_count: number;
  verified_count: number;
  percentage: number;
  breakdown: CompetitionRankingBreakdown[];
}

export interface CompetitionLeaderboard {
  competition: { id: number; name: string; status: CompetitionStatus };
  criteria: { id: number; name: string; max_score: number; weight: number }[];
  rankings: CompetitionRanking[];
}

export interface CompetitionSummary {
  total_competitions: number;
  active_competitions: number;
  completed_competitions: number;
  total_teams: number;
  total_participants: number;
  total_judges: number;
  by_status: Partial<Record<CompetitionStatus, number>>;
  by_type: Partial<Record<CompetitionType, number>>;
}

export interface CompetitionInput {
  name: string;
  type: CompetitionType;
  description?: string | null;
  rules?: string[] | null;
  venue?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  registration_deadline?: string | null;
  min_team_size?: number | null;
  max_team_size?: number | null;
  status?: CompetitionStatus;
}

export interface CompetitionCriterionInput {
  name: string;
  description?: string | null;
  max_score: number;
  weight?: number;
  sort_order?: number;
}

export interface CompetitionTeamRegistrationInput {
  name: string;
  project_title?: string | null;
  description?: string | null;
}

export interface CompetitionTeamMemberInput {
  student_id: number;
  role?: CompetitionTeamMemberRole;
}

export interface CompetitionTeamSubmissionInput {
  submission_url: string;
  project_title?: string | null;
}

export interface CompetitionScoreEntry {
  criterion_id: number;
  score: number;
  remarks?: string | null;
}

export interface CompetitionScoreSubmissionInput {
  team_id: number;
  scores: CompetitionScoreEntry[];
}
