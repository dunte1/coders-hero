import type { Page, PaginationMeta } from './cms';

export type Gender = 'male' | 'female' | 'other';
export type StudentStatus = 'pending' | 'active' | 'suspended' | 'withdrawn' | 'transferred' | 'graduated';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type AdmissionStatus = 'new' | 'in_review' | 'approved' | 'admitted' | 'rejected';

export type GuardianRelationship = 'parent' | 'guardian' | 'relative' | 'other';

export interface Guardian {
  id: number;
  first_name: string;
  last_name: string;
  relationship: GuardianRelationship;
  phone: string | null;
  email: string | null;
  address: string | null;
  occupation: string | null;
  is_primary: boolean;
  notes: string | null;
  full_name: string;
  students_count?: number;
  students?: Student[];
  created_at: string;
  updated_at: string;
}

export interface GuardianInput {
  first_name: string;
  last_name: string;
  relationship?: GuardianRelationship;
  phone?: string;
  email?: string;
  address?: string;
  occupation?: string;
  is_primary?: boolean;
  notes?: string;
}

export type GuardianUpdate = Partial<Omit<GuardianInput, 'first_name' | 'last_name'>>;

export interface MedicalRecord {
  id: number;
  student_id: number;
  blood_type: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  allergies: string[] | null;
  conditions: string[] | null;
  medications: string[] | null;
  dietary_restrictions: string[] | null;
  doctor_name: string | null;
  doctor_phone: string | null;
  insurance_provider: string | null;
  insurance_policy_number: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecordInput {
  blood_type?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  allergies?: string[];
  conditions?: string[];
  medications?: string[];
  dietary_restrictions?: string[];
  doctor_name?: string;
  doctor_phone?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  notes?: string;
}

export interface Student {
  id: number;
  student_id: string;
  guardian_id: number | null;
  user_id: string | null;
  first_name: string;
  last_name: string;
  gender: Gender | null;
  date_of_birth: string | null;
  photo: string | null;
  photo_url: string | null;
  grade: string | null;
  branch: string | null;
  admission_date: string | null;
  status: StudentStatus;
  qr_code: string | null;
  graduation_date: string | null;
  medical_notes: string | null;
  full_name: string;
  age: number | null;
  guardian?: Guardian | null;
  medical_record?: MedicalRecord | null;
  created_at: string;
  updated_at: string;
}

export interface StudentDetail extends Student {
  guardian: Guardian | null;
  medical_record: MedicalRecord | null;
}

export interface StudentInput {
  guardian_id?: number | null;
  first_name: string;
  last_name: string;
  gender?: Gender | null;
  date_of_birth?: string | null;
  grade?: string | null;
  branch?: string | null;
  admission_date?: string | null;
  status?: StudentStatus;
  medical_notes?: string | null;
}

export type StudentUpdate = Partial<Omit<StudentInput, 'first_name' | 'last_name'>>;

export interface Attendance {
  id: number;
  student_id: number;
  attendance_date: string;
  status: AttendanceStatus;
  check_in: string | null;
  check_out: string | null;
  note: string | null;
  recorded_by: string | null;
  student?: Student | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceEntryInput {
  student_id: number;
  status: AttendanceStatus;
  check_in?: string | null;
  check_out?: string | null;
  note?: string | null;
}

export interface AttendanceReportRow {
  student_id: number;
  student: string;
  student_code: string;
  grade: string | null;
  guardian: string | null;
  present: number;
  late: number;
  absent: number;
  excused: number;
  total: number;
  rate: number;
}

export interface AttendanceReport {
  from: string;
  to: string;
  students: AttendanceReportRow[];
  totals: { present: number; late: number; absent: number; excused: number };
  records_count: number;
}

export interface MonthlyAttendance {
  month: string;
  present: number;
  late: number;
  absent: number;
  excused: number;
  total: number;
}

export interface StudentTimelineEntry {
  id: number;
  student_id: number;
  event_type: string;
  title: string;
  description: string | null;
  occurred_on: string;
  meta: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface StudentTimelineInput {
  event_type: string;
  title: string;
  description?: string;
  occurred_on?: string;
}

export interface StudentDocument {
  id: number;
  student_id: number;
  name: string;
  document_type: string;
  file_path: string;
  mime_type: string | null;
  size: number | null;
  url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Admission {
  id: number;
  application_number: string;
  student_id: number | null;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: Gender | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;
  program_of_interest: string | null;
  grade: string | null;
  preferred_branch: string | null;
  status: AdmissionStatus;
  applied_at: string;
  decided_at: string | null;
  notes: string | null;
  full_name: string;
  student?: Student | null;
  created_at: string;
  updated_at: string;
}

export interface AdmissionInput {
  first_name: string;
  last_name: string;
  date_of_birth?: string | null;
  gender?: Gender | null;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  program_of_interest?: string;
  grade?: string | null;
  preferred_branch?: string;
  status?: AdmissionStatus;
  notes?: string;
}

export type AdmissionUpdate = Partial<Omit<AdmissionInput, 'first_name' | 'last_name'>>;

export interface StudentOverview {
  total_students: number;
  active_students: number;
  pending_students: number;
  graduated_students: number;
  transferred_students: number;
  suspended_students: number;
  status_breakdown: { status: string; count: number }[];
  gender_breakdown: { gender: string; count: number }[];
  grade_breakdown: { grade: string; count: number }[];
  admitted_this_month: number;
  today_attendance: { present: number; absent: number; late: number; excused: number };
}

export interface SisListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  grade?: string;
  branch?: string;
  date?: string;
  from?: string;
  to?: string;
  type?: string;
}

export type { Page, PaginationMeta };
