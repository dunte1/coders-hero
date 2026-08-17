import api from '@/lib/axios';
import type { Page, PaginationMeta } from '@/types/cms';
import type {
  RoboticsAssignment,
  RoboticsAssignmentInput,
  RoboticsEquipment,
  RoboticsEquipmentInput,
  RoboticsEquipmentReservation,
  RoboticsMaintenanceInput,
  RoboticsMaintenanceRecord,
  RoboticsProject,
  RoboticsProjectInput,
  RoboticsProjectSubmission,
  RoboticsReservationInput,
  RoboticsReviewInput,
  RoboticsSubmissionInput,
  RoboticsSummary,
  RoboticsTeam,
  RoboticsTeamInput,
} from '@/types/robotics';

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;

const unwrapPage = <T>(res: { data: { data: T[]; meta: PaginationMeta } }): Page<T> => ({
  results: res.data.data,
  meta: res.data.meta,
});

export const roboticsApi = {
  // Summary
  summary: () => api.get<{ data: RoboticsSummary }>('/robotics/summary').then(unwrap<RoboticsSummary>),

  // Equipment
  equipment: (params?: { page?: number; per_page?: number; type?: string; status?: string; search?: string }) =>
    api.get<{ data: RoboticsEquipment[]; meta: PaginationMeta }>('/robotics/equipment', { params }).then(unwrapPage<RoboticsEquipment>),

  equipmentItem: (id: number) =>
    api.get<{ data: RoboticsEquipment }>(`/robotics/equipment/${id}`).then(unwrap<RoboticsEquipment>),

  scanEquipment: (qrCode: string) =>
    api.get<{ data: RoboticsEquipment }>(`/robotics/equipment/scan/${encodeURIComponent(qrCode)}`).then(unwrap<RoboticsEquipment>),

  createEquipment: (data: RoboticsEquipmentInput) =>
    api.post<{ data: RoboticsEquipment }>('/robotics/equipment', data).then(unwrap<RoboticsEquipment>),

  updateEquipment: (id: number, data: Partial<RoboticsEquipmentInput>) =>
    api.put<{ data: RoboticsEquipment }>(`/robotics/equipment/${id}`, data).then(unwrap<RoboticsEquipment>),

  deleteEquipment: (id: number) =>
    api.delete<{ data: null }>(`/robotics/equipment/${id}`).then(() => undefined),

  regenerateQr: (id: number) =>
    api.put<{ data: { id: number; name: string; qr_code: string; qr_code_url: string } }>(`/robotics/equipment/${id}/qr`).then(unwrap<{ id: number; name: string; qr_code: string; qr_code_url: string }>),

  // Assignments (staff)
  assignments: (params?: { page?: number; per_page?: number; status?: string; equipment_id?: number }) =>
    api.get<{ data: RoboticsAssignment[]; meta: PaginationMeta }>('/robotics/assignments', { params }).then(unwrapPage<RoboticsAssignment>),

  assignEquipment: (equipmentId: number, data: RoboticsAssignmentInput) =>
    api.post<{ data: RoboticsAssignment }>(`/robotics/equipment/${equipmentId}/assign`, data).then(unwrap<RoboticsAssignment>),

  returnEquipment: (assignmentId: number) =>
    api.put<{ data: RoboticsAssignment }>(`/robotics/assignments/${assignmentId}/return`).then(unwrap<RoboticsAssignment>),

  // Reservations
  reservations: (params?: { page?: number; per_page?: number; status?: string; equipment_id?: number }) =>
    api.get<{ data: RoboticsEquipmentReservation[]; meta: PaginationMeta }>('/robotics/reservations', { params }).then(unwrapPage<RoboticsEquipmentReservation>),

  myReservations: (params?: { page?: number; per_page?: number; status?: string }) =>
    api.get<{ data: RoboticsEquipmentReservation[]; meta: PaginationMeta }>('/robotics/reservations/mine', { params }).then(unwrapPage<RoboticsEquipmentReservation>),

  createReservation: (data: RoboticsReservationInput) =>
    api.post<{ data: RoboticsEquipmentReservation }>('/robotics/reservations', data).then(unwrap<RoboticsEquipmentReservation>),

  cancelReservation: (id: number) =>
    api.put<{ data: RoboticsEquipmentReservation }>(`/robotics/reservations/${id}/cancel`).then(unwrap<RoboticsEquipmentReservation>),

  approveReservation: (id: number) =>
    api.put<{ data: RoboticsEquipmentReservation }>(`/robotics/reservations/${id}/approve`).then(unwrap<RoboticsEquipmentReservation>),

  rejectReservation: (id: number) =>
    api.put<{ data: RoboticsEquipmentReservation }>(`/robotics/reservations/${id}/reject`).then(unwrap<RoboticsEquipmentReservation>),

  completeReservation: (id: number) =>
    api.put<{ data: RoboticsEquipmentReservation }>(`/robotics/reservations/${id}/complete`).then(unwrap<RoboticsEquipmentReservation>),

  // Maintenance (staff)
  maintenance: (params?: { page?: number; per_page?: number; status?: string; equipment_id?: number }) =>
    api.get<{ data: RoboticsMaintenanceRecord[]; meta: PaginationMeta }>('/robotics/maintenance', { params }).then(unwrapPage<RoboticsMaintenanceRecord>),

  createMaintenance: (data: RoboticsMaintenanceInput) =>
    api.post<{ data: RoboticsMaintenanceRecord }>('/robotics/maintenance', data).then(unwrap<RoboticsMaintenanceRecord>),

  updateMaintenance: (id: number, data: Partial<RoboticsMaintenanceInput>) =>
    api.put<{ data: RoboticsMaintenanceRecord }>(`/robotics/maintenance/${id}`, data).then(unwrap<RoboticsMaintenanceRecord>),

  resolveMaintenance: (id: number, data: { resolution?: string | null; cost?: number | null }) =>
    api.put<{ data: RoboticsMaintenanceRecord }>(`/robotics/maintenance/${id}/resolve`, data).then(unwrap<RoboticsMaintenanceRecord>),

  deleteMaintenance: (id: number) =>
    api.delete<{ data: null }>(`/robotics/maintenance/${id}`).then(() => undefined),

  // Teams
  teams: (params?: { page?: number; per_page?: number; search?: string }) =>
    api.get<{ data: RoboticsTeam[]; meta: PaginationMeta }>('/robotics/teams', { params }).then(unwrapPage<RoboticsTeam>),

  team: (id: number) => api.get<{ data: RoboticsTeam }>(`/robotics/teams/${id}`).then(unwrap<RoboticsTeam>),

  createTeam: (data: RoboticsTeamInput) =>
    api.post<{ data: RoboticsTeam }>('/robotics/teams', data).then(unwrap<RoboticsTeam>),

  updateTeam: (id: number, data: Partial<RoboticsTeamInput>) =>
    api.put<{ data: RoboticsTeam }>(`/robotics/teams/${id}`, data).then(unwrap<RoboticsTeam>),

  deleteTeam: (id: number) =>
    api.delete<{ data: null }>(`/robotics/teams/${id}`).then(() => undefined),

  addTeamMember: (teamId: number, data: { student_id: number; role?: 'leader' | 'member' }) =>
    api.post<{ data: RoboticsTeam }>(`/robotics/teams/${teamId}/members`, data).then(unwrap<RoboticsTeam>),

  removeTeamMember: (teamId: number, studentId: number) =>
    api.delete<{ data: RoboticsTeam }>(`/robotics/teams/${teamId}/members/${studentId}`).then(unwrap<RoboticsTeam>),

  studentOptions: () =>
    api.get<{ data: Array<{ id: number; full_name: string; grade: string | null }> }>('/robotics/students').then(unwrap<Array<{ id: number; full_name: string; grade: string | null }>>),

  // Projects
  projects: (params?: { page?: number; per_page?: number; category?: string; status?: string; search?: string }) =>
    api.get<{ data: RoboticsProject[]; meta: PaginationMeta }>('/robotics/projects', { params }).then(unwrapPage<RoboticsProject>),

  project: (id: number) => api.get<{ data: RoboticsProject }>(`/robotics/projects/${id}`).then(unwrap<RoboticsProject>),

  createProject: (data: RoboticsProjectInput) =>
    api.post<{ data: RoboticsProject }>('/robotics/projects', data).then(unwrap<RoboticsProject>),

  updateProject: (id: number, data: Partial<RoboticsProjectInput>) =>
    api.put<{ data: RoboticsProject }>(`/robotics/projects/${id}`, data).then(unwrap<RoboticsProject>),

  deleteProject: (id: number) =>
    api.delete<{ data: null }>(`/robotics/projects/${id}`).then(() => undefined),

  projectSubmissions: (id: number) =>
    api.get<{ data: RoboticsProjectSubmission[] }>(`/robotics/projects/${id}/submissions`).then(unwrap<RoboticsProjectSubmission[]>),

  submitProject: (id: number, data: RoboticsSubmissionInput) =>
    api.post<{ data: RoboticsProjectSubmission }>(`/robotics/projects/${id}/submit`, data).then(unwrap<RoboticsProjectSubmission>),

  reviewProjectSubmission: (projectId: number, submissionId: number, data: RoboticsReviewInput) =>
    api.put<{ data: RoboticsProjectSubmission }>(`/robotics/projects/${projectId}/submissions/${submissionId}/review`, data).then(unwrap<RoboticsProjectSubmission>),
};

export { getErrorMessage } from '@/lib/studentsApi';
