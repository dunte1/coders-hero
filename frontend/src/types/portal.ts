export type PortalFeeStatus = 'pending' | 'paid' | 'waived';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'online';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PortalAttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface PortalGuardian {
  id: number;
  user_id?: string | null;
  first_name: string;
  last_name: string;
  relationship: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  occupation: string | null;
  is_primary: boolean;
  full_name: string;
  students_count?: number;
}

export interface PortalStudent {
  id: number;
  student_id: string;
  guardian_id?: number | null;
  first_name: string;
  last_name: string;
  full_name: string;
  grade: string | null;
  branch: string | null;
  status: string;
  photo_url: string | null;
  outstanding_fees?: number;
}

export interface ParentSummary {
  guardian: PortalGuardian | null;
  students: PortalStudent[];
}

export interface TeacherContact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
}

export interface PortalAttendanceRecord {
  id: number;
  student_id: number;
  attendance_date: string;
  status: PortalAttendanceStatus;
  check_in: string | null;
  check_out: string | null;
  note: string | null;
  recorded_by: string | null;
}

export interface AttendanceSummary {
  present: number;
  late: number;
  absent: number;
  excused: number;
  total: number;
}

export interface ParentAttendanceChild {
  student: PortalStudent;
  month: string;
  summary: AttendanceSummary;
  records: PortalAttendanceRecord[];
}

export interface ParentAttendance {
  month: string;
  children: ParentAttendanceChild[];
}

export interface ReportCardItem {
  id: number;
  report_card_id?: number;
  subject: string;
  score: number | null;
  grade: string | null;
  teacher_comment: string | null;
}

export interface ReportCard {
  id: number;
  student_id: number;
  term: string;
  academic_year: string;
  issued_at: string;
  overall_grade: string | null;
  average_score: string | number | null;
  teacher_notes: string | null;
  items_count: number;
  student?: PortalStudent;
  items: ReportCardItem[];
}

export interface CodingSkill {
  id: number;
  student_id: number;
  skill: string;
  level: number;
  progress: number;
  badge: string | null;
  notes: string | null;
  student?: PortalStudent;
  updated_at?: string;
}

export type CodingProgress = CodingSkill;

export interface ProgressGroup {
  skills: CodingSkill[];
  average_progress: number;
  total_skills: number;
  completed_skills: number;
}

export type ParentProgress = Record<string, ProgressGroup>;

export interface PortalPayment {
  id: number;
  fee_id: number;
  receipt_no: string;
  amount: string | number;
  method: PaymentMethod;
  reference: string | null;
  paid_at: string;
  paid_by_user_id: string | null;
  fee?: Fee & { student?: PortalStudent };
  created_at: string;
}

export interface Fee {
  id: number;
  student_id: number;
  label: string;
  amount: string | number;
  due_date: string;
  status: PortalFeeStatus;
  note: string | null;
  student?: PortalStudent;
  payments?: PortalPayment[];
}

export interface Appointment {
  id: number;
  guardian_id: number;
  student_id: number | null;
  teacher_user_id: string;
  scheduled_at: string;
  duration_minutes: number;
  reason: string;
  notes: string | null;
  status: AppointmentStatus;
  student?: PortalStudent | null;
  teacher?: TeacherContact | null;
  guardian?: PortalGuardian | null;
  created_at?: string;
}

export interface AppointmentInput {
  student_id?: number | null;
  teacher_user_id: string;
  scheduled_at: string;
  duration_minutes?: number;
  reason: string;
  notes?: string;
}

export interface PayFeeInput {
  method?: PaymentMethod;
  reference?: string;
}

export interface PortalNotification {
  id: string;
  type: string;
  data: { title?: string; message?: string; [key: string]: unknown };
  read_at: string | null;
  created_at: string;
}

export interface ConversationUser {
  id: string;
  name: string;
}

export interface Conversation {
  id: number;
  guardian_user_id: string;
  teacher_user_id: string;
  student_id: number | null;
  last_message_at: string | null;
  unread_count: number;
  last_message: string | null;
  last_message_at_formatted: string | null;
  guardianUser?: ConversationUser | null;
  teacherUser?: ConversationUser | null;
  student?: { id: number; first_name: string; last_name: string } | null;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_user_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
  sender?: ConversationUser;
}

export interface ConversationDetail {
  conversation: Conversation;
  messages: ChatMessage[];
}

export interface StartConversationInput {
  teacher_user_id: string;
  student_id?: number | null;
  body: string;
}

export interface ReportCardInput {
  term: string;
  academic_year: string;
  issued_at: string;
  overall_grade?: string | null;
  average_score?: number | null;
  teacher_notes?: string | null;
  items: ReportCardItemInput[];
}

export interface ReportCardItemInput {
  subject: string;
  score?: number | null;
  grade?: string | null;
  teacher_comment?: string | null;
}

export interface CodingProgressInput {
  skill: string;
  level: number;
  progress: number;
  badge?: string | null;
  notes?: string | null;
}

export interface FeeInput {
  label: string;
  amount: number;
  due_date: string;
  status?: PortalFeeStatus;
  note?: string | null;
}

export interface AdminPaymentInput {
  method: PaymentMethod;
  amount: number;
  reference?: string | null;
  paid_at?: string;
}

export interface AppointmentAdminUpdate {
  status?: AppointmentStatus;
  scheduled_at?: string;
  duration_minutes?: number;
  notes?: string | null;
}
