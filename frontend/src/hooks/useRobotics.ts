import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage, roboticsApi } from '@/lib/roboticsApi';
import type {
  RoboticsAssignmentInput,
  RoboticsEquipmentInput,
  RoboticsMaintenanceInput,
  RoboticsProjectInput,
  RoboticsReservationInput,
  RoboticsReviewInput,
  RoboticsSubmissionInput,
  RoboticsTeamInput,
} from '@/types/robotics';

// Summary
export function useRoboticsSummary() {
  return useQuery({
    queryKey: ['robotics', 'summary'],
    queryFn: () => roboticsApi.summary(),
  });
}

// Equipment
export function useRoboticsEquipment(params?: { page?: number; type?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['robotics', 'equipment', params],
    queryFn: () => roboticsApi.equipment(params),
  });
}

export function useRoboticsEquipmentItem(id: number) {
  return useQuery({
    queryKey: ['robotics', 'equipment', id],
    queryFn: () => roboticsApi.equipmentItem(id),
    enabled: !!id,
  });
}

export function useScanEquipment(enabled = false, qrCode?: string) {
  return useQuery({
    queryKey: ['robotics', 'equipment', 'scan', qrCode],
    queryFn: () => roboticsApi.scanEquipment(qrCode ?? ''),
    enabled: enabled && !!qrCode,
    retry: false,
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoboticsEquipmentInput) => roboticsApi.createEquipment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['robotics', 'equipment'] });
      queryClient.invalidateQueries({ queryKey: ['robotics', 'summary'] });
      toast.success('Equipment added to inventory');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RoboticsEquipmentInput> }) => roboticsApi.updateEquipment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['robotics', 'equipment'] });
      queryClient.invalidateQueries({ queryKey: ['robotics', 'summary'] });
      toast.success('Equipment updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => roboticsApi.deleteEquipment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['robotics', 'equipment'] });
      queryClient.invalidateQueries({ queryKey: ['robotics', 'summary'] });
      toast.success('Equipment removed');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useRegenerateQr() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => roboticsApi.regenerateQr(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['robotics', 'equipment'] });
      toast.success('QR code regenerated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Assignments (staff)
export function useRoboticsAssignments(params?: { status?: string; equipment_id?: number }) {
  return useQuery({
    queryKey: ['robotics', 'assignments', params],
    queryFn: () => roboticsApi.assignments(params),
  });
}

export function useAssignEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ equipmentId, data }: { equipmentId: number; data: RoboticsAssignmentInput }) =>
      roboticsApi.assignEquipment(equipmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['robotics', 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['robotics', 'equipment'] });
      queryClient.invalidateQueries({ queryKey: ['robotics', 'summary'] });
      toast.success('Equipment assigned');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useReturnEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: number) => roboticsApi.returnEquipment(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['robotics', 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['robotics', 'equipment'] });
      queryClient.invalidateQueries({ queryKey: ['robotics', 'summary'] });
      toast.success('Equipment returned');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Reservations
export function useRoboticsReservations(params?: { status?: string }) {
  return useQuery({
    queryKey: ['robotics', 'reservations', params],
    queryFn: () => roboticsApi.reservations(params),
  });
}

export function useMyRoboticsReservations(params?: { status?: string }) {
  return useQuery({
    queryKey: ['robotics', 'reservations', 'mine', params],
    queryFn: () => roboticsApi.myReservations(params),
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoboticsReservationInput) => roboticsApi.createReservation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['robotics', 'reservations'] });
      toast.success('Reservation request submitted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => roboticsApi.cancelReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['robotics', 'reservations'] });
      toast.success('Reservation cancelled');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useReviewReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'approve' | 'reject' | 'complete' }) => {
      if (action === 'approve') return roboticsApi.approveReservation(id);
      if (action === 'reject') return roboticsApi.rejectReservation(id);
      return roboticsApi.completeReservation(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['robotics', 'reservations'] });
      toast.success('Reservation updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Maintenance (staff)
export function useRoboticsMaintenance(params?: { status?: string; equipment_id?: number }) {
  return useQuery({
    queryKey: ['robotics', 'maintenance', params],
    queryFn: () => roboticsApi.maintenance(params),
  });
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoboticsMaintenanceInput) => roboticsApi.createMaintenance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['robotics', 'maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['robotics', 'equipment'] });
      queryClient.invalidateQueries({ queryKey: ['robotics', 'summary'] });
      toast.success('Maintenance record created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useResolveMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { resolution?: string | null; cost?: number | null } }) =>
      roboticsApi.resolveMaintenance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['robotics', 'maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['robotics', 'equipment'] });
      queryClient.invalidateQueries({ queryKey: ['robotics', 'summary'] });
      toast.success('Maintenance marked as resolved');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Teams
export function useRoboticsTeams(params?: { search?: string }) {
  return useQuery({
    queryKey: ['robotics', 'teams', params],
    queryFn: () => roboticsApi.teams(params),
  });
}

export function useRoboticsTeam(id: number) {
  return useQuery({
    queryKey: ['robotics', 'teams', id],
    queryFn: () => roboticsApi.team(id),
    enabled: !!id,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoboticsTeamInput) => roboticsApi.createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['robotics', 'teams'] });
      queryClient.invalidateQueries({ queryKey: ['robotics', 'summary'] });
      toast.success('Team created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RoboticsTeamInput> }) => roboticsApi.updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['robotics', 'teams'] });
      toast.success('Team updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useAddTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: number; data: { student_id: number; role?: 'leader' | 'member' } }) =>
      roboticsApi.addTeamMember(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['robotics', 'teams'] });
      toast.success('Member added to team');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, studentId }: { teamId: number; studentId: number }) =>
      roboticsApi.removeTeamMember(teamId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['robotics', 'teams'] });
      toast.success('Member removed from team');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useStudentOptions() {
  return useQuery({
    queryKey: ['robotics', 'students'],
    queryFn: () => roboticsApi.studentOptions(),
  });
}

// Projects
export function useRoboticsProjects(params?: { category?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['robotics', 'projects', params],
    queryFn: () => roboticsApi.projects(params),
  });
}

export function useRoboticsProject(id: number) {
  return useQuery({
    queryKey: ['robotics', 'projects', id],
    queryFn: () => roboticsApi.project(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoboticsProjectInput) => roboticsApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['robotics', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['robotics', 'summary'] });
      toast.success('Project created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RoboticsProjectInput> }) => roboticsApi.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['robotics', 'projects'] });
      toast.success('Project updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => roboticsApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['robotics', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['robotics', 'summary'] });
      toast.success('Project deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useSubmitProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoboticsSubmissionInput }) => roboticsApi.submitProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['robotics', 'projects'] });
      toast.success('Project submission created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useReviewProjectSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, submissionId, data }: { projectId: number; submissionId: number; data: RoboticsReviewInput }) =>
      roboticsApi.reviewProjectSubmission(projectId, submissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['robotics', 'projects'] });
      toast.success('Submission reviewed');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}
