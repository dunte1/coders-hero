import type { PortalStudent } from './portal';

export type ClassStatus = 'active' | 'archived';
export type AssignmentStatus = 'draft' | 'published' | 'closed';
export type SubmissionStatus = 'submitted' | 'graded' | 'late' | 'returned';
export type ExamStatus = 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type ExamResultStatus = 'absent' | 'attempted' | 'graded';
export type GradeComponent = 'assignment' | 'exam' | 'quiz' | 'participation' | 'homework' | 'project' | 'final';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type EventType = 'class' | 'assignment' | 'exam' | 'meeting' | 'holiday' | 'activity' | 'other';

export interface TeacherDashboardSummary {
  classes_count: number;
  students_count: number;
  today_present: number;
  today_absent: number;
  today_unmarked: number;
  today_class_id?: number;
  ungraded_submissions: number;
  upcoming_assignments: Assignment[];
  upcoming_exams: Exam[];
  upcoming_events: CalendarEvent[];
}

export interface SchoolClass {
  id: number;
  teacher_user_id?: string;
  name: string;
  subject: string | null;
  description: string | null;
  room: string | null;
  color: string | null;
  schedule: unknown | null;
  status: ClassStatus;
  capacity: number | null;
  settings: unknown | null;
  students_count?: number;
  students?: StudentSummary[];
  created_at?: string;
  updated_at?: string;
}

export type StudentSummary = PortalStudent;

export interface ClassRosterEntry {
  student: StudentSummary;
  attendance_date: string;
  status: AttendanceStatus | 'unmarked';
  check_in: string | null;
  check_out: string | null;
  note: string | null;
  attendance_id: number | null;
}

export interface ClassAttendanceSummary {
  month: string;
  present: number;
  late: number;
  absent: number;
  excused: number;
  total: number;
  rate: number;
}

export interface Assignment {
  id: number;
  teacher_user_id?: string;
  class_id: number | null;
  course_id: number | null;
  title: string;
  description: string | null;
  instructions: string | null;
  type: string | null;
  max_score: number;
  due_at: string | null;
  published_at: string | null;
  status: AssignmentStatus;
  attachments?: unknown;
  settings?: unknown;
  submissions_count?: number;
  school_class?: { id: number; name: string; subject?: string | null } | null;
  course?: { id: number; title: string } | null;
  created_at?: string;
  updated_at?: string;
}

export interface AssignmentSubmission {
  id: number;
  assignment_id: number;
  student?: StudentSummary;
  content: string | null;
  file_path: string | null;
  file_name: string | null;
  status: SubmissionStatus;
  is_late: boolean;
  score: number | null;
  feedback: string | null;
  graded_by?: string | null;
  submitted_at: string;
  graded_at?: string | null;
}

export interface Exam {
  id: number;
  teacher_user_id?: string;
  class_id: number | null;
  course_id: number | null;
  title: string;
  description: string | null;
  type: string | null;
  scheduled_at: string | null;
  duration_minutes: number | null;
  total_marks: number;
  passing_marks: number;
  status: ExamStatus;
  results_count?: number;
  school_class?: { id: number; name: string } | null;
  results?: ExamResult[];
  created_at?: string;
  updated_at?: string;
}

export interface ExamResult {
  id: number;
  exam_id: number;
  student?: StudentSummary;
  marks_obtained: number | null;
  percentage: number | null;
  grade: string | null;
  remarks: string | null;
  status: ExamResultStatus;
  graded_at?: string | null;
}

export interface ExamResultSummary {
  total_students: number;
  graded: number;
  absent: number;
  average: number;
  highest: number;
  lowest: number;
  passed: number;
}

export interface GradebookEntry {
  id: number;
  class_id: number;
  course_id: number | null;
  student_id: number;
  component: GradeComponent;
  title: string;
  score: number;
  max_score: number;
  weight: number | null;
  percentage: number | null;
  graded_on: string | null;
  feedback: string | null;
  student?: StudentSummary;
  created_at?: string;
}

export interface StudentGradeSummary {
  student: StudentSummary;
  components: Record<string, { count: number; earned: number; possible: number; percentage: number }>;
  entries_count: number;
  overall_percentage: number;
  letter_grade: string;
}

export interface ClassGradeSummary {
  class: SchoolClass;
  students: Array<{
    student_id: number;
    name: string;
    student_code: string;
    entries_count: number;
    overall_percentage: number | null;
    letter_grade: string;
  }>;
  average: number;
  highest: number;
  lowest: number;
  passed_count: number;
}

export interface LessonNote {
  id: number;
  teacher_user_id?: string;
  lesson_id: number | null;
  class_id: number | null;
  title: string;
  content: string;
  attachments: unknown[] | null;
  note_date: string;
  school_class?: { id: number; name: string } | null;
  lesson?: { id: number; title: string } | null;
  created_at?: string;
}

export interface CalendarEvent {
  id: number;
  user_id?: string;
  class_id: number | null;
  title: string;
  description: string | null;
  event_type: EventType;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  location: string | null;
  color: string | null;
  school_class?: { id: number; name: string } | null;
  created_at?: string;
}

export interface AnalyticsOverview {
  classes_count: number;
  students_count: number;
  assignments_count: number;
  published_assignments: number;
  exams_count: number;
  submissions: number;
  graded_submissions: number;
  completion_rate: number;
  recent_assignments: Assignment[];
}

export interface AttendanceTrendPoint {
  date: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  rate: number;
}

export interface GradeDistribution {
  A: number;
  B: number;
  C: number;
  D: number;
  F: number;
  ungraded: number;
}

export interface ClassPerformanceRow {
  id: number;
  name: string;
  subject: string | null;
  students_count: number;
  average: number;
  entries_count: number;
}

export interface ClassReportRow {
  student: StudentSummary;
  attendance_present: number;
  attendance_late: number;
  attendance_absent: number;
  attendance_rate: number;
  grade_entries: number;
  grade_percentage: number | null;
}

export interface ClassReport {
  class: SchoolClass;
  from: string;
  to: string;
  rows: ClassReportRow[];
}

export interface StudentReport {
  student: StudentSummary;
  class: SchoolClass;
  from: string;
  to: string;
  attendance: { present: number; late: number; absent: number; excused: number; rate: number };
  assignments: Array<{
    title: string;
    type: string | null;
    due_at: string | null;
    max_score: number;
    status: string;
    score: number | null;
    is_late: boolean;
  }>;
  exams: Array<{
    title: string;
    type: string | null;
    scheduled_at: string | null;
    total_marks: number;
    marks_obtained: number | null;
    percentage: number | null;
    grade: string | null;
    status: string;
  }>;
}

export interface TeacherReportSummary {
  classes_count: number;
  students_count: number;
  attendance_rate: number;
  assignments_count: number;
  submissions_count: number;
  graded_count: number;
  overdue_assignments: number;
}

// Input types
export interface ClassInput {
  name: string;
  subject?: string | null;
  description?: string | null;
  room?: string | null;
  color?: string | null;
  schedule?: unknown;
  status?: ClassStatus;
  capacity?: number | null;
  settings?: unknown;
  student_ids?: number[];
}

export interface AttendanceEntry {
  student_id: number;
  status: AttendanceStatus;
  check_in?: string | null;
  check_out?: string | null;
  note?: string | null;
}

export interface AssignmentInput {
  class_id?: number | null;
  course_id?: number | null;
  title: string;
  description?: string | null;
  instructions?: string | null;
  type?: string | null;
  max_score?: number;
  due_at?: string | null;
  status?: AssignmentStatus;
  attachments?: unknown;
  settings?: unknown;
}

export interface ExamInput {
  class_id?: number | null;
  course_id?: number | null;
  title: string;
  description?: string | null;
  type?: string | null;
  scheduled_at?: string | null;
  duration_minutes?: number | null;
  total_marks?: number;
  passing_marks?: number;
  status?: ExamStatus;
  settings?: unknown;
}

export interface ExamResultEntry {
  student_id: number;
  marks_obtained?: number | null;
  status?: ExamResultStatus;
  remarks?: string | null;
}

export interface GradebookEntryInput {
  student_id: number;
  component: GradeComponent;
  title: string;
  score: number;
  max_score: number;
  weight?: number | null;
  graded_on?: string | null;
  feedback?: string | null;
}

export interface LessonNoteInput {
  lesson_id?: number | null;
  class_id?: number | null;
  title: string;
  content: string;
  attachments?: unknown;
  note_date?: string;
}

export interface CalendarEventInput {
  class_id?: number | null;
  title: string;
  description?: string | null;
  event_type?: EventType;
  starts_at: string;
  ends_at?: string | null;
  all_day?: boolean;
  location?: string | null;
  color?: string | null;
}
