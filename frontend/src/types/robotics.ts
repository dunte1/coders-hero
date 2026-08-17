export type RoboticsEquipmentType =
  | 'kit'
  | 'arduino_board'
  | 'lego_kit'
  | 'sensor'
  | 'microcontroller'
  | 'component';

export type RoboticsEquipmentCondition = 'new' | 'good' | 'fair' | 'poor';
export type RoboticsEquipmentStatus = 'active' | 'retired';
export type RoboticsTeamStatus = 'active' | 'inactive';
export type RoboticsTeamMemberRole = 'leader' | 'member';
export type RoboticsAssignmentStatus = 'assigned' | 'returned' | 'overdue';
export type RoboticsReservationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
export type RoboticsMaintenanceType = 'repair' | 'calibration' | 'inspection' | 'cleaning' | 'replacement';
export type RoboticsMaintenanceStatus = 'reported' | 'in_progress' | 'resolved';
export type RoboticsProjectCategory = 'class' | 'competition' | 'personal';
export type RoboticsProjectStatus = 'planning' | 'in_progress' | 'completed' | 'archived';
export type RoboticsSubmissionStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface NamedUser {
  id: string;
  name: string;
}

export interface RoboticsEquipment {
  id: number;
  name: string;
  type: RoboticsEquipmentType;
  sku: string | null;
  manufacturer: string | null;
  description: string | null;
  quantity_total: number;
  quantity_available: number;
  assigned_quantity?: number;
  location: string | null;
  condition: RoboticsEquipmentCondition;
  status: RoboticsEquipmentStatus;
  qr_code: string | null;
  qr_code_url?: string | null;
  open_maintenance_count?: number;
  active_assignments?: RoboticsAssignment[];
  maintenance_records?: RoboticsMaintenanceRecord[];
  pending_reservations?: RoboticsEquipmentReservation[];
  created_at?: string;
  updated_at?: string;
}

export interface RoboticsAssignable {
  id: number;
  name?: string | null;
  full_name?: string | null;
}

export interface RoboticsAssignment {
  id: number;
  equipment_id: number;
  assignable_type: string;
  assignable_id: number;
  quantity: number;
  assigned_at: string | null;
  expected_return_at: string | null;
  returned_at: string | null;
  note: string | null;
  status: RoboticsAssignmentStatus;
  equipment?: RoboticsEquipment | null;
  assignable?: RoboticsAssignable | null;
  assigned_by?: NamedUser | null;
  created_at?: string;
}

export interface RoboticsTeamMember extends RoboticsAssignable {
  role: RoboticsTeamMemberRole;
  pivot?: { role: RoboticsTeamMemberRole };
}

export interface RoboticsTeam {
  id: number;
  name: string;
  description: string | null;
  mentor_user_id: string | null;
  mentor?: NamedUser | null;
  status: RoboticsTeamStatus;
  members_count?: number;
  members?: RoboticsTeamMember[];
  projects?: RoboticsProject[];
  created_at?: string;
}

export interface RoboticsEquipmentReservation {
  id: number;
  equipment_id: number;
  team_id: number | null;
  reserved_by_user_id: string;
  quantity: number;
  start_at: string;
  end_at: string;
  purpose: string | null;
  status: RoboticsReservationStatus;
  equipment?: RoboticsEquipment | null;
  team?: RoboticsTeam | null;
  reserved_by?: NamedUser | null;
  reviewed_by?: NamedUser | null;
  created_at?: string;
}

export interface RoboticsMaintenanceRecord {
  id: number;
  equipment_id: number;
  recorded_by_user_id: string;
  type: RoboticsMaintenanceType;
  issue_description: string | null;
  resolution: string | null;
  status: RoboticsMaintenanceStatus;
  cost: string | null;
  maintenance_date: string | null;
  resolved_at: string | null;
  equipment?: RoboticsEquipment | null;
  recorded_by?: NamedUser | null;
  created_at?: string;
}

export interface RoboticsProjectStudent {
  id: number;
  full_name: string;
}

export interface RoboticsProject {
  id: number;
  team_id: number | null;
  student_id: number | null;
  title: string;
  description: string | null;
  category: RoboticsProjectCategory;
  status: RoboticsProjectStatus;
  start_date: string | null;
  deadline: string | null;
  completed_at: string | null;
  goals: string[] | null;
  team?: RoboticsTeam | null;
  student?: RoboticsProjectStudent | null;
  submissions_count?: number;
  submissions?: RoboticsProjectSubmission[];
  created_at?: string;
  updated_at?: string;
}

export interface RoboticsProjectSubmission {
  id: number;
  project_id: number;
  submitted_by_user_id: string | null;
  title: string | null;
  description: string | null;
  files: unknown[] | null;
  repo_url: string | null;
  demo_url: string | null;
  status: RoboticsSubmissionStatus;
  score: number | null;
  feedback: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  submitted_by?: NamedUser | null;
  reviewed_by?: NamedUser | null;
  created_at?: string;
}

export interface RoboticsSummary {
  total_equipment: number;
  active_equipment: number;
  retired_equipment: number;
  total_units: number;
  available_units: number;
  assigned_units: number;
  by_type: Partial<Record<RoboticsEquipmentType, number>>;
  open_maintenance: number;
  pending_reservations: number;
  teams: number;
  projects: number;
}

export interface RoboticsEquipmentInput {
  name: string;
  type: RoboticsEquipmentType;
  sku?: string | null;
  manufacturer?: string | null;
  description?: string | null;
  quantity_total: number;
  location?: string | null;
  condition?: RoboticsEquipmentCondition;
  status?: RoboticsEquipmentStatus;
}

export interface RoboticsAssignmentInput {
  assignable_type: 'student' | 'team';
  assignable_id: number;
  quantity: number;
  assigned_at?: string | null;
  expected_return_at?: string | null;
  note?: string | null;
}

export interface RoboticsReservationInput {
  equipment_id: number;
  team_id?: number | null;
  quantity: number;
  start_at: string;
  end_at: string;
  purpose?: string | null;
}

export interface RoboticsMaintenanceInput {
  equipment_id: number;
  type: RoboticsMaintenanceType;
  issue_description?: string | null;
  status?: RoboticsMaintenanceStatus;
  cost?: number | null;
  maintenance_date?: string | null;
}

export interface RoboticsTeamInput {
  name: string;
  description?: string | null;
  mentor_user_id?: string | null;
  status?: RoboticsTeamStatus;
}

export interface RoboticsProjectInput {
  team_id?: number | null;
  student_id?: number | null;
  title: string;
  description?: string | null;
  category: RoboticsProjectCategory;
  status?: RoboticsProjectStatus;
  start_date?: string | null;
  deadline?: string | null;
  goals?: string[] | null;
}

export interface RoboticsSubmissionInput {
  title?: string | null;
  description?: string | null;
  files?: unknown[] | null;
  repo_url?: string | null;
  demo_url?: string | null;
}

export interface RoboticsReviewInput {
  status: 'approved' | 'rejected';
  score?: number | null;
  feedback?: string | null;
}
