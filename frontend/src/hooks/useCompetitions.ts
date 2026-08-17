import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { competitionsApi, getErrorMessage } from '@/lib/competitionsApi';
import type {
  CompetitionCriterionInput,
  CompetitionInput,
  CompetitionScoreSubmissionInput,
  CompetitionTeamMemberInput,
  CompetitionTeamRegistrationInput,
  CompetitionTeamSubmissionInput,
} from '@/types/competitions';

// Competitions
export function useCompetitions(params?: { page?: number; type?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['competitions', 'list', params],
    queryFn: () => competitionsApi.list(params),
  });
}

export function useCompetition(id: number) {
  return useQuery({
    queryKey: ['competitions', 'item', id],
    queryFn: () => competitionsApi.item(id),
    enabled: !!id,
  });
}

export function useCompetitionSummary() {
  return useQuery({
    queryKey: ['competitions', 'summary'],
    queryFn: () => competitionsApi.summary(),
  });
}

export function useCreateCompetition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CompetitionInput) => competitionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['competitions', 'summary'] });
      toast.success('Competition created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateCompetition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CompetitionInput> }) => competitionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['competitions', 'item'] });
      toast.success('Competition updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteCompetition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => competitionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['competitions', 'summary'] });
      toast.success('Competition deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useChangeCompetitionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => competitionsApi.changeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['competitions', 'item'] });
      toast.success('Status updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Criteria (staff)
export function useCreateCriterion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ competitionId, data }: { competitionId: number; data: CompetitionCriterionInput }) =>
      competitionsApi.createCriterion(competitionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions', 'item'] });
      toast.success('Criterion added');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteCriterion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (criterionId: number) => competitionsApi.deleteCriterion(criterionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions', 'item'] });
      toast.success('Criterion removed');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Judges (staff)
export function useAssignJudge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ competitionId, data }: { competitionId: number; data: { user_id: string; title?: string | null } }) =>
      competitionsApi.assignJudge(competitionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions', 'item'] });
      toast.success('Judge assigned');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useRemoveJudge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ competitionId, userId }: { competitionId: number; userId: string }) =>
      competitionsApi.removeJudge(competitionId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions', 'item'] });
      toast.success('Judge removed');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Registration
export function useRegisterTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ competitionId, data }: { competitionId: number; data: CompetitionTeamRegistrationInput }) =>
      competitionsApi.register(competitionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions', 'item'] });
      queryClient.invalidateQueries({ queryKey: ['competitions', 'my-teams'] });
      toast.success('Team registered');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useMyCompetitionTeams() {
  return useQuery({
    queryKey: ['competitions', 'my-teams'],
    queryFn: () => competitionsApi.myTeams(),
  });
}

export function useCompetitionStudentOptions(search?: string) {
  return useQuery({
    queryKey: ['competitions', 'students', search ?? ''],
    queryFn: () => competitionsApi.studentOptions(search),
    placeholderData: (prev: { id: number; full_name: string; student_id: string; grade: string | null }[] | undefined) => prev,
  });
}

export function useCompetitionTeam(teamId: number) {
  return useQuery({
    queryKey: ['competitions', 'teams', teamId],
    queryFn: () => competitionsApi.team(teamId),
    enabled: !!teamId,
  });
}

export function useAddTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: number; data: CompetitionTeamMemberInput }) =>
      competitionsApi.addMember(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions', 'teams'] });
      queryClient.invalidateQueries({ queryKey: ['competitions', 'item'] });
      toast.success('Member added');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, studentId }: { teamId: number; studentId: number }) =>
      competitionsApi.removeMember(teamId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions', 'teams'] });
      queryClient.invalidateQueries({ queryKey: ['competitions', 'item'] });
      toast.success('Member removed');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useSubmitCompetitionTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: number; data: CompetitionTeamSubmissionInput }) =>
      competitionsApi.submitTeam(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions', 'teams'] });
      queryClient.invalidateQueries({ queryKey: ['competitions', 'item'] });
      toast.success('Project submitted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDisqualifyTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, disqualified }: { teamId: number; disqualified?: boolean }) =>
      competitionsApi.disqualifyTeam(teamId, disqualified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions', 'teams'] });
      queryClient.invalidateQueries({ queryKey: ['competitions', 'item'] });
      toast.success('Team status updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Judging
export function useCompetitionScores(competitionId: number) {
  return useQuery({
    queryKey: ['competitions', 'scores', competitionId],
    queryFn: () => competitionsApi.scores(competitionId),
    enabled: !!competitionId,
  });
}

export function useSubmitCompetitionScores() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ competitionId, data }: { competitionId: number; data: CompetitionScoreSubmissionInput }) =>
      competitionsApi.submitScores(competitionId, data),
    onSuccess: (_data, { competitionId }) => {
      queryClient.invalidateQueries({ queryKey: ['competitions', 'scores', competitionId] });
      queryClient.invalidateQueries({ queryKey: ['competitions', 'leaderboard', competitionId] });
      toast.success('Scores submitted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useVerifyCompetitionScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scoreId: number) => competitionsApi.verifyScore(scoreId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions', 'scores'] });
      toast.success('Score verified');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useCompetitionLeaderboard(competitionId: number, enabled = false) {
  return useQuery({
    queryKey: ['competitions', 'leaderboard', competitionId],
    queryFn: () => competitionsApi.leaderboard(competitionId),
    enabled: !!competitionId && enabled,
  });
}

export function useCompetitionResults(competitionId: number) {
  return useQuery({
    queryKey: ['competitions', 'results', competitionId],
    queryFn: () => competitionsApi.results(competitionId),
    enabled: !!competitionId,
  });
}
