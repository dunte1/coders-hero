export interface User {
  id: string;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar?: string;
  role?: Role;
  roles?: Role[];
  is_active: boolean;
  date_joined?: string;
  created_at?: string;
  last_login?: string;
  email_verified_at?: string | null;
}

export interface UserCreate {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  password: string;
  role_id?: number;
}

export interface UserUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar?: string;
  is_active?: boolean;
}

export interface Role {
  id: number;
  name: string;
  display_name?: string;
  description?: string;
  permissions: Permission[];
  users_count?: number;
}

export interface Permission {
  id: number;
  name: string;
  codename: string;
  display_name?: string;
  description?: string;
  group?: string;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  thumbnail?: string;
  instructor: User;
  category: Category;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  is_published: boolean;
  is_archived: boolean;
  enrollment_count: number;
  average_rating: number;
  duration_hours?: number;
  created_at: string;
  updated_at: string;
}

export interface CourseCreate {
  title: string;
  description: string;
  short_description?: string;
  thumbnail?: string;
  category_id: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
}

export interface CourseUpdate {
  title?: string;
  description?: string;
  short_description?: string;
  thumbnail?: string;
  category_id?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
  price?: number;
}

export interface CourseDetail extends Course {
  lessons: Lesson[];
  enrolled: boolean;
  progress?: number;
}

export interface Lesson {
  id: number;
  course: number;
  title: string;
  description?: string;
  content: string;
  video_url?: string;
  duration_minutes: number;
  order: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
}

export interface LessonCreate {
  title: string;
  description?: string;
  content: string;
  video_url?: string;
  duration_minutes: number;
  order?: number;
  is_free?: boolean;
}

export interface Enrollment {
  id: number;
  student: User;
  course: Course;
  enrolled_at: string;
  completed_at?: string;
  progress: number;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  course_count: number;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: User;
  project?: Project;
  due_date?: string;
  created_at: string;
  updated_at: string;
  created_by: User;
}

export interface TaskCreate {
  title: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'review' | 'completed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id?: number;
  project_id?: number;
  due_date?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'review' | 'completed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id?: number;
  due_date?: string;
}

export interface Project {
  id: number;
  name: string;
  slug: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
  start_date?: string;
  end_date?: string;
  budget?: number;
  progress: number;
  owner: User;
  member_count: number;
  task_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description: string;
  status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
  start_date?: string;
  end_date?: string;
  budget?: number;
}

export interface ProjectDetail extends Project {
  members: ProjectMember[];
  tasks: Task[];
}

export interface ProjectMember {
  id: number;
  user: User;
  role: string;
  joined_at: string;
}

export interface Employee {
  id: number;
  user: User;
  employee_id: string;
  department: Department;
  position: Position;
  hire_date: string;
  salary?: number;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  status: 'active' | 'on_leave' | 'terminated';
}

export interface EmployeeCreate {
  user_id: number;
  employee_id: string;
  department_id: number;
  position_id: number;
  hire_date: string;
  salary?: number;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

export type EmployeeUpdate = Partial<Omit<EmployeeCreate, 'user_id'>>;

export interface Department {
  id: number;
  name: string;
  description?: string;
  head?: User;
  employee_count: number;
  created_at: string;
}

export interface Position {
  id: number;
  title: string;
  description?: string;
  department: Department;
  min_salary?: number;
  max_salary?: number;
  created_at: string;
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  course: Course;
  time_limit_minutes: number;
  passing_score: number;
  max_attempts: number;
  questions: QuizQuestion[];
  created_at: string;
}

export interface QuizCreate {
  title: string;
  description?: string;
  course_id: number;
  time_limit_minutes: number;
  passing_score: number;
  max_attempts: number;
  questions: QuizQuestionCreate[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correct_answer: string;
  points: number;
  order: number;
}

export interface QuizQuestionCreate {
  question: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correct_answer: string;
  points: number;
}

export interface QuizAttempt {
  id: number;
  quiz: Quiz;
  student: User;
  answers: QuizSubmission[];
  score: number;
  passed: boolean;
  started_at: string;
  completed_at?: string;
}

export interface QuizSubmission {
  question_id: number;
  answer: string;
}

export interface Certificate {
  id: number;
  certificate_number: string;
  student: User;
  course: Course;
  issued_at: string;
  expiry_date?: string;
  is_valid: boolean;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  author: User;
  target_audience: 'all' | 'students' | 'employees' | 'instructors';
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementCreate {
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  target_audience: 'all' | 'students' | 'employees' | 'instructors';
  is_pinned?: boolean;
}

export type AnnouncementUpdate = Partial<AnnouncementCreate>;

export type NotificationCategory =
  | 'attendance'
  | 'fees'
  | 'assignments'
  | 'exams'
  | 'competitions'
  | 'certificates'
  | 'system';

export interface NotificationDelivery {
  channel: 'in_app' | 'email' | 'sms' | 'push';
  status: 'queued' | 'sending' | 'delivered' | 'failed';
  delivered_at?: string | null;
  failed_at?: string | null;
  error_message?: string | null;
  retry_count: number;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  subject?: string | null;
  event?: string;
  category?: NotificationCategory;
  channel?: string;
  status?: string;
  link?: string;
  metadata?: Record<string, unknown> | null;
  is_read: boolean;
  read_at?: string | null;
  sent_at?: string | null;
  delivered_at?: string | null;
  failed_at?: string | null;
  deliveries?: NotificationDelivery[];
  created_at: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  today: number;
  this_week: number;
}

export interface NotificationPreference {
  category: NotificationCategory;
  email: boolean;
  sms: boolean;
  push: boolean;
  in_app: boolean;
}

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push';

export interface NotificationTemplate {
  id: number;
  event: string;
  name: string;
  description?: string | null;
  category: NotificationCategory;
  category_label?: string;
  subject?: string | null;
  body: string;
  channels: NotificationChannel[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplateInput {
  event: string;
  name: string;
  description?: string | null;
  category: NotificationCategory;
  subject?: string | null;
  body: string;
  channels?: NotificationChannel[];
  is_active?: boolean;
}

export interface NotificationDeliveryLog {
  id: number;
  notification_id: string;
  channel: NotificationChannel;
  status: 'queued' | 'sending' | 'delivered' | 'failed';
  provider_reference?: string | null;
  sent_at?: string | null;
  delivered_at?: string | null;
  failed_at?: string | null;
  error_message?: string | null;
  retry_count: number;
  last_retried_at?: string | null;
  metadata?: Record<string, unknown> | null;
  recipient?: { id: number; name?: string | null; email?: string | null } | null;
  subject?: string | null;
  body?: string | null;
  created_at: string;
}

export interface FcmToken {
  id: number;
  device_name?: string | null;
  platform?: string | null;
  is_active: boolean;
  last_used_at?: string | null;
  created_at: string;
}

export interface NotificationAdminSummary {
  notifications_total: number;
  notifications_last_week: number;
  deliveries: { queued: number; sending: number; delivered: number; failed: number };
  delivery_rate: number;
  by_category: Record<NotificationCategory, number>;
  active_templates: number;
  registered_devices: number;
}

export interface NotificationBroadcastInput {
  event: string;
  recipient_type: 'users' | 'role';
  recipient_ids?: number[];
  role?: string;
  data?: Record<string, unknown>;
  link?: string;
  channels?: NotificationChannel[];
}

export interface DashboardAttendanceSummary {
  date: string;
  present: number;
  late: number;
  absent: number;
  excused?: number;
  total: number;
}

export interface DashboardOverview {
  total_users?: number;
  active_users?: number;
  total_employees?: number;
  total_courses?: number;
  published_courses?: number;
  draft_courses?: number;
  total_enrollments?: number;
  active_enrollments?: number;
  completed_enrollments?: number;
  total_tasks?: number;
  pending_tasks?: number;
  completed_tasks?: number;
  overdue_tasks?: number;
  total_projects?: number;
  active_projects?: number;
  active_courses?: number;
  completed_courses?: number;
  total_students?: number;
  total_teachers?: number;
  active_schools?: number;
  revenue?: number;
  outstanding_fees?: number;
  competition_registrations?: number;
  completion_rate?: number;
  average_progress?: number;
  certificates?: number;
  projects?: number;
  attendance_summary?: DashboardAttendanceSummary;
  ai_interactions_30d?: number;
  ai_insights?: {
    total_interactions_30d: number;
    total_tokens_30d: number;
    total_cost_30d: number;
    avg_tokens_per_interaction: number;
    top_assistant: string | null;
    active_conversations_30d: number;
    unique_users_30d: number;
  };
}

export interface DashboardActivity {
  type: 'user_joined' | 'enrollment' | 'task' | 'announcement';
  message: string;
  user: {
    first_name: string;
    last_name: string;
    avatar?: string | null;
  };
  timestamp: string;
}

export interface DashboardUserRef {
  first_name?: string;
  last_name?: string;
  name?: string;
  avatar?: string | null;
}

export interface DashboardCourseRef {
  id: number;
  title: string;
  enrollments_count?: number;
}

export interface DashboardTaskRef {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string | null;
  created_at?: string;
  assignee?: DashboardUserRef | null;
  assigner?: DashboardUserRef | null;
}

export interface DashboardEnrollmentRef {
  id: number;
  enrolled_at: string;
  completed_at?: string | null;
  status?: string;
  progress?: number;
  user?: DashboardUserRef | null;
  course?: DashboardCourseRef | null;
}

export interface DashboardAnnouncementRef {
  id: number;
  title: string;
  is_pinned?: boolean;
  created_at: string;
  author?: DashboardUserRef | null;
}

export interface DashboardUpcomingEvent {
  id: number;
  title: string;
  event_type?: string;
  starts_at: string;
  location?: string | null;
  color?: string | null;
}

export interface DashboardMonthlyStat {
  month: number;
  year: number;
  count: number;
}

export interface DashboardStats {
  overview: DashboardOverview;
  // Admin dashboard
  course_popularity?: DashboardCourseRef[];
  enrollment_stats?: { monthly: DashboardMonthlyStat[] };
  completion_stats?: { monthly: DashboardMonthlyStat[] };
  recent_activity?: DashboardActivity[];
  upcoming_tasks?: DashboardTaskRef[];
  upcoming_events?: DashboardUpcomingEvent[];
  unread_notifications?: number;
  recent_notifications?: Notification[];
  // Chart data
  user_roles_distribution?: { name: string; value: number }[];
  enrollment_by_level?: { name: string; value: number }[];
  enrollment_by_month_12m?: { year: number; month: number; count: number }[];
  revenue_by_month_12m?: { year: number; month: number; total: number }[];
  // Instructor dashboard
  courses?: DashboardCourseRef[];
  recent_enrollments?: DashboardEnrollmentRef[];
  // Employee dashboard
  my_tasks?: DashboardTaskRef[];
  my_projects?: unknown[];
  recent_announcements?: DashboardAnnouncementRef[];
  // Student dashboard
  active_enrollments?: DashboardEnrollmentRef[];
  recent_completions?: DashboardEnrollmentRef[];
  recommended_courses?: DashboardCourseRef[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirm: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface RoutePermission {
  roles?: string[];
  permissions?: string[];
}

export interface LoginHistory {
  id: number;
  user: User;
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  platform?: string;
  browser?: string;
  location?: string;
  status: 'success' | 'failed' | 'expired';
  attempted_at: string;
  logged_in_at?: string;
  logged_out_at?: string;
  created_at: string;
}

export interface TwoFactorStatus {
  enabled: boolean;
  confirmed_at: string | null;
}

export interface TwoFactorSetup {
  secret: string;
  qr_code_url: string;
  otp_url?: string;
  recovery_codes: string[];
}

export interface RoleCreate {
  name: string;
  display_name: string;
  description?: string;
}

export interface RoleUpdate {
  name?: string;
  display_name?: string;
  description?: string;
}

export interface PermissionCreate {
  name: string;
  display_name: string;
  description?: string;
  group?: string;
}

export interface PermissionUpdate {
  name?: string;
  display_name?: string;
  description?: string;
  group?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface VerifyTwoFactorRequest {
  code?: string;
  recovery_code?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  requires_two_factor?: boolean;
}

export interface EmailVerificationResponse {
  message?: string;
}

export interface ResetTokenValidation {
  valid: boolean;
  email?: string;
  message?: string;
}

export interface StudentProject {
  id: number;
  student_id: string;
  user_id: string;
  title: string;
  slug: string;
  problem_statement?: string;
  description?: string;
  technologies?: string[];
  repo_url?: string;
  demo_url?: string;
  source_path?: string;
  version_number?: number;
  final_score?: number;
  is_published: boolean;
  published_at?: string;
  status: 'planning' | 'in_progress' | 'completed' | 'archived';
  media?: ProjectMedia[];
  reviews?: ProjectReview[];
  created_at: string;
  updated_at: string;
}

export interface ProjectMedia {
  id: number;
  type: 'image' | 'video';
  path: string;
  original_name?: string;
  sort_order: number;
}

export interface ProjectReview {
  id: number;
  reviewer_id: string;
  score?: number;
  feedback?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewer?: User;
  created_at: string;
}

export interface ExamQuestion {
  id: number;
  exam_id: number;
  question: string;
  options: string[];
  correct_answer: string;
  points: number;
  sort_order: number;
}

export interface ExamAttempt {
  id: number;
  exam_id: number;
  student_id: string;
  user_id: string;
  score?: number;
  total_points: number;
  earned_points: number;
  answers?: Record<number, string>;
  started_at?: string;
  submitted_at?: string;
  status: 'in_progress' | 'submitted' | 'graded';
  exam?: {
    id: number;
    title: string;
    type: string;
    total_marks: number;
    duration_minutes: number;
  };
  created_at: string;
}
