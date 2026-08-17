import api from '@/lib/axios';
import type { Page, PaginationMeta } from '@/types/cms';
import type {
  Competition,
  CompetitionCriterion,
  CompetitionCriterionInput,
  CompetitionInput,
  CompetitionLeaderboard,
  CompetitionScore,
  CompetitionScoreSubmissionInput,
  CompetitionSummary,
  CompetitionTeam,
  CompetitionTeamMemberInput,
  CompetitionTeamRegistrationInput,
  CompetitionTeamSubmissionInput,
} from '@/types/competitions';

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;

const unwrapPage = <T>(res: { data: { data: T[]; meta: PaginationMeta } }): Page<T> => ({
  results: res.data.data,
  meta: res.data.meta,
});

export const competitionsApi = {
  // Competitions
  list: (params?: { page?: number; per_page?: number; type?: string; status?: string; search?: string }) =>
    api.get<{ data: Competition[]; meta: PaginationMeta }>('/competitions', { params }).then(unwrapPage<Competition>),

  item: (id: number) =>
    api.get<{ data: Competition }>(`/competitions/${id}`).then(unwrap<Competition>),

  summary: () =>
    api.get<{ data: CompetitionSummary }>('/competitions/summary').then(unwrap<CompetitionSummary>),

  create: (data: CompetitionInput) =>
    api.post<{ data: Competition }>('/competitions', data).then(unwrap<Competition>),

  update: (id: number, data: Partial<CompetitionInput>) =>
    api.put<{ data: Competition }>(`/competitions/${id}`, data).then(unwrap<Competition>),

  delete: (id: number) =>
    api.delete<{ data: null }>(`/competitions/${id}`).then(() => undefined),

  changeStatus: (id: number, status: string) =>
    api.put<{ data: Competition }>(`/competitions/${id}/status`, { status }).then(unwrap<Competition>),

  // Criteria (staff)
  createCriterion: (competitionId: number, data: CompetitionCriterionInput) =>
    api.post<{ data: CompetitionCriterion }>(`/competitions/${competitionId}/criteria`, data).then(unwrap<CompetitionCriterion>),

  updateCriterion: (criterionId: number, data: Partial<CompetitionCriterionInput>) =>
    api.put<{ data: CompetitionCriterion }>(`/competitions/criteria/${criterionId}`, data).then(unwrap<CompetitionCriterion>),

  deleteCriterion: (criterionId: number) =>
    api.delete<{ data: null }>(`/competitions/criteria/${criterionId}`).then(() => undefined),

  // Judges (staff)
  assignJudge: (competitionId: number, data: { user_id: string; title?: string | null }) =>
    api.post<{ data: Competition }>(`/competitions/${competitionId}/judges`, data).then(unwrap<Competition>),

  removeJudge: (competitionId: number, userId: string) =>
    api.delete<{ data: Competition }>(`/competitions/${competitionId}/judges/${userId}`).then(unwrap<Competition>),

  // Registration
  studentOptions: (search?: string) =>
    api
      .get<{ data: { id: number; full_name: string; student_id: string; grade: string | null }[] }>('/competitions/students', {
        params: search ? { search } : undefined,
      })
      .then(unwrap<{ id: number; full_name: string; student_id: string; grade: string | null }[]>),

  register: (competitionId: number, data: CompetitionTeamRegistrationInput) =>
    api.post<{ data: CompetitionTeam }>(`/competitions/${competitionId}/register`, data).then(unwrap<CompetitionTeam>),

  myTeams: () =>
    api.get<{ data: CompetitionTeam[] }>('/competitions/teams/mine').then(unwrap<CompetitionTeam[]>),

  team: (teamId: number) =>
    api.get<{ data: CompetitionTeam }>(`/competitions/teams/${teamId}`).then(unwrap<CompetitionTeam>),

  addMember: (teamId: number, data: CompetitionTeamMemberInput) =>
    api.post<{ data: CompetitionTeam }>(`/competitions/teams/${teamId}/members`, data).then(unwrap<CompetitionTeam>),

  removeMember: (teamId: number, studentId: number) =>
    api.delete<{ data: CompetitionTeam }>(`/competitions/teams/${teamId}/members/${studentId}`).then(unwrap<CompetitionTeam>),

  submitTeam: (teamId: number, data: CompetitionTeamSubmissionInput) =>
    api.post<{ data: CompetitionTeam }>(`/competitions/teams/${teamId}/submit`, data).then(unwrap<CompetitionTeam>),

  disqualifyTeam: (teamId: number, disqualified = true) =>
    api.put<{ data: CompetitionTeam }>(`/competitions/teams/${teamId}/disqualify`, { disqualified }).then(unwrap<CompetitionTeam>),

  // Judging
  scores: (competitionId: number) =>
    api.get<{ data: CompetitionScore[] }>(`/competitions/${competitionId}/scores`).then(unwrap<CompetitionScore[]>),

  submitScores: (competitionId: number, data: CompetitionScoreSubmissionInput) =>
    api.post<{ data: CompetitionTeam }>(`/competitions/${competitionId}/scores`, data).then(unwrap<CompetitionTeam>),

  verifyScore: (scoreId: number) =>
    api.put<{ data: CompetitionScore }>(`/competitions/scores/${scoreId}/verify`).then(unwrap<CompetitionScore>),

  leaderboard: (competitionId: number) =>
    api.get<{ data: CompetitionLeaderboard }>(`/competitions/${competitionId}/leaderboard`).then(unwrap<CompetitionLeaderboard>),

  results: (competitionId: number) =>
    api.get<{ data: CompetitionLeaderboard }>(`/competitions/${competitionId}/results`).then(unwrap<CompetitionLeaderboard>),
};

export { getErrorMessage } from '@/lib/studentsApi';
