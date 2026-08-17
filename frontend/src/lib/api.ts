import api from './axios';
import type { Page, PaginationMeta } from '@/types/cms';
import type {
  User,
  UserCreate,
  UserUpdate,
  Role,
  RoleCreate,
  RoleUpdate,
  Permission,
  PermissionCreate,
  PermissionUpdate,
  Course,
  CourseCreate,
  CourseUpdate,
  CourseDetail,
  Lesson,
  LessonCreate,
  Enrollment,
  Category,
  Task,
  TaskCreate,
  TaskUpdate,
  Project,
  ProjectCreate,
  ProjectDetail,
  ProjectMember,
  Employee,
  EmployeeCreate,
  Department,
  Position,
  Quiz,
  QuizCreate,
  QuizAttempt,
  QuizSubmission,
  Certificate,
  Announcement,
  Notification,
  NotificationStats,
  NotificationDeliveryLog,
  NotificationPreference,
  NotificationTemplate,
  NotificationTemplateInput,
  NotificationAdminSummary,
  FcmToken,
  NotificationBroadcastInput,
  DashboardStats,
  PaginatedResponse,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  LoginHistory,
  TwoFactorStatus,
  TwoFactorSetup,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyTwoFactorRequest,
  EmailVerificationResponse,
  ResetTokenValidation,
} from '@/types';

const handleResponse = <T>(response: { data: T }): T => response.data;

const unwrap = <T>(response: { data: { data: T } }): T => response.data.data;

const unwrapPage = <T>(response: { data: { data: T[]; meta: PaginationMeta } }): Page<T> => ({
  results: response.data.data,
  meta: response.data.meta,
});

export function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}

interface RawRole {
  id: number;
  name: string;
  display_name?: string;
  description?: string;
  permissions?: Permission[];
}

interface RawUser {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  phone?: string | null;
  is_active: boolean;
  initials?: string;
  last_login_at?: string | null;
  email_verified_at?: string | null;
  created_at: string;
  updated_at?: string;
  roles?: RawRole[];
}

interface LoginPayload {
  user: RawUser;
  token: string;
  requires_two_factor?: boolean;
}

function normalizeUser(raw: RawUser): User {
  const role = raw.roles && raw.roles.length > 0
    ? { ...raw.roles[0], permissions: raw.roles[0].permissions || [] }
    : { id: 0, name: 'user', permissions: [] as Permission[] };

  const parts = (raw.name || '').trim().split(/\s+/);
  const first_name = parts.shift() || '';
  const last_name = parts.join(' ');

  return {
    id: raw.id,
    email: raw.email,
    first_name,
    last_name,
    phone: raw.phone ?? undefined,
    avatar: raw.avatar ?? undefined,
    role,
    is_active: raw.is_active,
    date_joined: raw.created_at,
    last_login: raw.last_login_at ?? undefined,
    email_verified_at: raw.email_verified_at ?? null,
  };
}

const unwrapUser = (response: { data: { data: RawUser } }): User => normalizeUser(response.data.data);

const unwrapLogin = (response: { data: { data: LoginPayload } }): LoginResponse => ({
  user: normalizeUser(response.data.data.user),
  token: response.data.data.token,
  requires_two_factor: response.data.data.requires_two_factor,
});

// Auth
export const authApi = {
  login: (data: LoginRequest) =>
    api.post<{ data: LoginPayload }>('/login', data).then(unwrapLogin),
  register: (data: RegisterRequest) =>
    api.post<{ user: User; message: string }>('/register/', data).then(handleResponse),
  logout: () => api.post('/logout/').then(handleResponse),
  getProfile: () => api.get<{ data: RawUser }>('/profile').then(unwrapUser),
  updateProfile: (data: Partial<UserUpdate>) =>
    api.put<{ data: RawUser }>('/profile', data).then(unwrapUser),
  changePassword: (data: { old_password: string; new_password: string }) =>
    api.post<{ message: string }>('/change-password/', data).then(handleResponse),
  sendEmailVerification: () =>
    api.post<EmailVerificationResponse>('/email/verification-notification/').then(handleResponse),
  resendEmailVerification: () =>
    api.post<EmailVerificationResponse>('/email/resend/').then(handleResponse),
  verifyEmail: (id: string, hash: string) =>
    api.get<EmailVerificationResponse>(`/email/verify/${id}/${hash}`).then(handleResponse),
  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post<{ message: string }>('/forgot-password/', data).then(handleResponse),
  resetPassword: (data: ResetPasswordRequest) =>
    api.post<{ message: string }>('/reset-password/', data).then(handleResponse),
  validateResetToken: (data: { token: string; email: string }) =>
    api.post<ResetTokenValidation>('/reset-password/validate/', data).then(handleResponse),
  getTwoFactorStatus: () =>
    api.get<TwoFactorStatus>('/two-factor/status/').then(handleResponse),
  enableTwoFactor: () =>
    api.post<TwoFactorSetup>('/two-factor/enable/').then(handleResponse),
  confirmTwoFactor: (code: string) =>
    api.post<TwoFactorStatus>('/two-factor/confirm/', { code }).then(handleResponse),
  disableTwoFactor: (data: { password: string }) =>
    api.post<TwoFactorStatus>('/two-factor/disable/', data).then(handleResponse),
  challengeTwoFactor: (data: VerifyTwoFactorRequest) =>
    api.post<{ data: LoginPayload }>('/two-factor/challenge', data).then(unwrapLogin),
  regenerateRecoveryCodes: () =>
    api.post<{ recovery_codes: string[] }>('/two-factor/recovery-codes/').then(handleResponse),
  uploadProfilePhoto: (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post<{ data: RawUser }>('/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(unwrapUser);
  },
  getLoginHistory: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<LoginHistory>>('/login-history/', { params }).then(handleResponse),
  clearLoginHistory: () =>
    api.delete('/login-history/').then(handleResponse),
};

// Roles
export const rolesApi = {
  getRoles: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<Role>>('/roles/', { params }).then(handleResponse),
  getRole: (id: number) =>
    api.get<Role>(`/roles/${id}/`).then(handleResponse),
  createRole: (data: RoleCreate) =>
    api.post<Role>('/roles/', data).then(handleResponse),
  updateRole: (id: number, data: RoleUpdate) =>
    api.patch<Role>(`/roles/${id}/`, data).then(handleResponse),
  deleteRole: (id: number) =>
    api.delete(`/roles/${id}/`).then(handleResponse),
  syncRolePermissions: (id: number, permissions: string[]) =>
    api.post<Role>(`/roles/${id}/permissions/`, { permissions }).then(handleResponse),
  getRolePermissions: (id: number) =>
    api.get<Permission[]>(`/roles/${id}/permissions/`).then(handleResponse),
  getRoleUsers: (id: number, params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<User>>(`/roles/${id}/users/`, { params }).then(handleResponse),
};

// Permissions
export const permissionsApi = {
  getPermissions: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<Permission>>('/permissions/', { params }).then(handleResponse),
  getPermission: (id: number) =>
    api.get<Permission>(`/permissions/${id}/`).then(handleResponse),
  getPermissionGroups: () =>
    api.get<string[]>('/permissions/groups/').then(handleResponse),
  createPermission: (data: PermissionCreate) =>
    api.post<Permission>('/permissions/', data).then(handleResponse),
  updatePermission: (id: number, data: PermissionUpdate) =>
    api.patch<Permission>(`/permissions/${id}/`, data).then(handleResponse),
  deletePermission: (id: number) =>
    api.delete(`/permissions/${id}/`).then(handleResponse),
};

// Login History
export const loginHistoryApi = {
  getAll: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<LoginHistory>>('/login-history/', { params }).then(handleResponse),
  getOne: (id: number) =>
    api.get<LoginHistory>(`/login-history/${id}/`).then(handleResponse),
  clearAll: () =>
    api.delete('/login-history/').then(handleResponse),
};

// Users
export const usersApi = {
  getUsers: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<User>>('/users/', { params }).then(handleResponse),
  getUser: (id: number) =>
    api.get<User>(`/users/${id}/`).then(handleResponse),
  createUser: (data: UserCreate) =>
    api.post<User>('/users/', data).then(handleResponse),
  updateUser: (id: number, data: UserUpdate) =>
    api.patch<User>(`/users/${id}/`, data).then(handleResponse),
  deleteUser: (id: number) =>
    api.delete(`/users/${id}/`).then(handleResponse),
  assignRole: (userId: number, roleId: number) =>
    api.post(`/users/${userId}/assign-role/`, { role_id: roleId }).then(handleResponse),
  removeRole: (userId: number) =>
    api.delete(`/users/${userId}/remove-role/`).then(handleResponse),
  toggleStatus: (userId: number) =>
    api.post(`/users/${userId}/toggle-status/`).then(handleResponse),
};

// Courses
export const coursesApi = {
  getCourses: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<Course>>('/courses/', { params }).then(handleResponse),
  getCourse: (id: number) =>
    api.get<CourseDetail>(`/courses/${id}/`).then(handleResponse),
  createCourse: (data: CourseCreate) =>
    api.post<Course>('/courses/', data).then(handleResponse),
  updateCourse: (id: number, data: CourseUpdate) =>
    api.patch<Course>(`/courses/${id}/`, data).then(handleResponse),
  deleteCourse: (id: number) =>
    api.delete(`/courses/${id}/`).then(handleResponse),
  publishCourse: (id: number) =>
    api.post(`/courses/${id}/publish/`).then(handleResponse),
  archiveCourse: (id: number) =>
    api.post(`/courses/${id}/archive/`).then(handleResponse),
  getCourseLessons: (courseId: number) =>
    api.get<Lesson[]>(`/courses/${courseId}/lessons/`).then(handleResponse),
};

// Lessons
export const lessonsApi = {
  getLessons: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<Lesson>>('/lessons/', { params }).then(handleResponse),
  createLesson: (courseId: number, data: LessonCreate) =>
    api.post<Lesson>(`/courses/${courseId}/lessons/`, data).then(handleResponse),
  updateLesson: (id: number, data: Partial<LessonCreate>) =>
    api.patch<Lesson>(`/lessons/${id}/`, data).then(handleResponse),
  deleteLesson: (id: number) =>
    api.delete(`/lessons/${id}/`).then(handleResponse),
  reorderLessons: (courseId: number, lessonIds: number[]) =>
    api.post(`/courses/${courseId}/lessons/reorder/`, { lesson_ids: lessonIds }).then(handleResponse),
};

// Enrollments
export const enrollmentsApi = {
  getEnrollments: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<Enrollment>>('/enrollments/', { params }).then(handleResponse),
  enroll: (courseId: number) =>
    api.post<Enrollment>('/enrollments/', { course_id: courseId }).then(handleResponse),
  unenroll: (enrollmentId: number) =>
    api.delete(`/enrollments/${enrollmentId}/`).then(handleResponse),
  getMyCourses: () =>
    api.get<PaginatedResponse<Enrollment>>('/enrollments/my-courses/').then(handleResponse),
  updateProgress: (enrollmentId: number, progress: number) =>
    api.patch(`/enrollments/${enrollmentId}/progress/`, { progress }).then(handleResponse),
};

// Categories
export const categoriesApi = {
  getCategories: () =>
    api.get<Category[]>('/categories/').then(handleResponse),
  createCategory: (data: { name: string; description?: string }) =>
    api.post<Category>('/categories/', data).then(handleResponse),
  updateCategory: (id: number, data: { name?: string; description?: string }) =>
    api.patch<Category>(`/categories/${id}/`, data).then(handleResponse),
  deleteCategory: (id: number) =>
    api.delete(`/categories/${id}/`).then(handleResponse),
};

// Tasks
export const tasksApi = {
  getTasks: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<Task>>('/tasks/', { params }).then(handleResponse),
  getTask: (id: number) =>
    api.get<Task>(`/tasks/${id}/`).then(handleResponse),
  createTask: (data: TaskCreate) =>
    api.post<Task>('/tasks/', data).then(handleResponse),
  updateTask: (id: number, data: TaskUpdate) =>
    api.patch<Task>(`/tasks/${id}/`, data).then(handleResponse),
  deleteTask: (id: number) =>
    api.delete(`/tasks/${id}/`).then(handleResponse),
  assignTask: (taskId: number, userId: number) =>
    api.post(`/tasks/${taskId}/assign/`, { user_id: userId }).then(handleResponse),
  changeTaskStatus: (taskId: number, status: string) =>
    api.post(`/tasks/${taskId}/change-status/`, { status }).then(handleResponse),
  getMyTasks: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<Task>>('/tasks/my-tasks/', { params }).then(handleResponse),
  getOverdueTasks: () =>
    api.get<PaginatedResponse<Task>>('/tasks/overdue/').then(handleResponse),
};

// Projects
export const projectsApi = {
  getProjects: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<Project>>('/projects/', { params }).then(handleResponse),
  getProject: (id: number) =>
    api.get<ProjectDetail>(`/projects/${id}/`).then(handleResponse),
  createProject: (data: ProjectCreate) =>
    api.post<Project>('/projects/', data).then(handleResponse),
  updateProject: (id: number, data: Partial<ProjectCreate>) =>
    api.patch<Project>(`/projects/${id}/`, data).then(handleResponse),
  deleteProject: (id: number) =>
    api.delete(`/projects/${id}/`).then(handleResponse),
  addProjectMember: (projectId: number, data: { user_id: number; role: string }) =>
    api.post<ProjectMember>(`/projects/${projectId}/members/`, data).then(handleResponse),
  removeProjectMember: (projectId: number, memberId: number) =>
    api.delete(`/projects/${projectId}/members/${memberId}/`).then(handleResponse),
  getProjectMembers: (projectId: number) =>
    api.get<ProjectMember[]>(`/projects/${projectId}/members/`).then(handleResponse),
};

// Employees
export const employeesApi = {
  getEmployees: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<Employee>>('/employees/', { params }).then(handleResponse),
  getEmployee: (id: number) =>
    api.get<Employee>(`/employees/${id}/`).then(handleResponse),
  createEmployee: (data: EmployeeCreate) =>
    api.post<Employee>('/employees/', data).then(handleResponse),
  updateEmployee: (id: number, data: Partial<EmployeeCreate>) =>
    api.patch<Employee>(`/employees/${id}/`, data).then(handleResponse),
  deleteEmployee: (id: number) =>
    api.delete(`/employees/${id}/`).then(handleResponse),
  getDirectory: () =>
    api.get<Employee[]>('/employees/directory/').then(handleResponse),
};

// Departments
export const departmentsApi = {
  getDepartments: () =>
    api.get<Department[]>('/departments/').then(handleResponse),
  createDepartment: (data: { name: string; description?: string }) =>
    api.post<Department>('/departments/', data).then(handleResponse),
  updateDepartment: (id: number, data: { name?: string; description?: string }) =>
    api.patch<Department>(`/departments/${id}/`, data).then(handleResponse),
  deleteDepartment: (id: number) =>
    api.delete(`/departments/${id}/`).then(handleResponse),
};

// Positions
export const positionsApi = {
  getPositions: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<Position>>('/positions/', { params }).then(handleResponse),
  createPosition: (data: { title: string; description?: string; department_id: number; min_salary?: number; max_salary?: number }) =>
    api.post<Position>('/positions/', data).then(handleResponse),
  updatePosition: (id: number, data: Partial<{ title: string; description?: string; department_id: number }>) =>
    api.patch<Position>(`/positions/${id}/`, data).then(handleResponse),
  deletePosition: (id: number) =>
    api.delete(`/positions/${id}/`).then(handleResponse),
};

// Quizzes
export const quizzesApi = {
  getQuizzes: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<Quiz>>('/quizzes/', { params }).then(handleResponse),
  createQuiz: (data: QuizCreate) =>
    api.post<Quiz>('/quizzes/', data).then(handleResponse),
  updateQuiz: (id: number, data: Partial<QuizCreate>) =>
    api.patch<Quiz>(`/quizzes/${id}/`, data).then(handleResponse),
  submitQuiz: (quizId: number, answers: QuizSubmission[]) =>
    api.post<QuizAttempt>(`/quizzes/${quizId}/submit/`, { answers }).then(handleResponse),
  getQuizAttempts: (quizId: number) =>
    api.get<QuizAttempt[]>(`/quizzes/${quizId}/attempts/`).then(handleResponse),
};

// Certificates
export const certificatesApi = {
  getCertificates: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<Certificate>>('/certificates/', { params }).then(handleResponse),
  getCertificate: (id: number) =>
    api.get<Certificate>(`/certificates/${id}/`).then(handleResponse),
  verifyCertificate: (certId: string) =>
    api.get<{ valid: boolean; student: string; course: string; issued_at: string }>(
      `/certificates/verify/${certId}/`
    ).then(handleResponse),
};

// Announcements
export const announcementsApi = {
  getAnnouncements: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<Announcement>>('/announcements/', { params }).then(handleResponse),
  createAnnouncement: (data: { title: string; content: string; priority: string; target_audience: string; is_pinned?: boolean }) =>
    api.post<Announcement>('/announcements/', data).then(handleResponse),
  updateAnnouncement: (id: number, data: Partial<{ title: string; content: string; priority: string; target_audience: string; is_pinned: boolean }>) =>
    api.patch<Announcement>(`/announcements/${id}/`, data).then(handleResponse),
  deleteAnnouncement: (id: number) =>
    api.delete(`/announcements/${id}/`).then(handleResponse),
};

// Notifications
export const notificationsApi = {
  getNotifications: (params?: Record<string, string | number | boolean>) =>
    api.get<{ data: Notification[]; meta: PaginationMeta }>('/notifications', { params }).then(unwrapPage),
  getUnreadNotifications: () =>
    api.get<{ data: Notification[] }>('/notifications/unread').then(unwrap<Notification[]>),
  markAsRead: (id: string) =>
    api.put(`/notifications/${id}/read`).then(handleResponse),
  markAllAsRead: () =>
    api.put('/notifications/read-all').then(handleResponse),
  deleteNotification: (id: string) =>
    api.delete(`/notifications/${id}`).then(handleResponse),
  getNotificationStats: () =>
    api.get<{ data: NotificationStats }>('/notifications/stats').then(unwrap<NotificationStats>),
  getPreferences: () =>
    api.get<{ data: NotificationPreference[] }>('/notification-preferences').then(unwrap<NotificationPreference[]>),
  updatePreferences: (preferences: NotificationPreference[]) =>
    api.put<{ data: NotificationPreference[] }>('/notification-preferences', { preferences }).then(unwrap<NotificationPreference[]>),
  getFcmTokens: () =>
    api.get<{ data: FcmToken[] }>('/fcm-tokens').then(unwrap<FcmToken[]>),
  registerFcmToken: (data: { token: string; device_name?: string; platform?: string }) =>
    api.post<{ data: FcmToken }>('/fcm-tokens', data).then(unwrap<FcmToken>),
  revokeFcmToken: (id: number) =>
    api.delete(`/fcm-tokens/${id}`).then(handleResponse),
  getTemplates: (params?: Record<string, string | number | boolean>) =>
    api.get<{ data: NotificationTemplate[]; meta: PaginationMeta }>('/notification-templates', { params }).then(unwrapPage),
};

// Notifications admin
export const notificationAdminApi = {
  getSummary: () =>
    api.get<{ data: NotificationAdminSummary }>('/admin/notifications/summary').then(unwrap<NotificationAdminSummary>),
  getDeliveries: (params?: Record<string, string | number | boolean>) =>
    api.get<{ data: NotificationDeliveryLog[]; meta: PaginationMeta }>('/admin/notifications/deliveries', { params }).then(unwrapPage),
  sendBroadcast: (data: NotificationBroadcastInput) =>
    api.post<{ data: Notification }>('/admin/notifications/send', data).then(unwrap<Notification>),
  retryDelivery: (id: number) =>
    api.post<{ data: NotificationDeliveryLog }>(`/admin/notifications/deliveries/${id}/retry`).then(unwrap<NotificationDeliveryLog>),
  getTemplates: (params?: Record<string, string | number | boolean>) =>
    api.get<{ data: NotificationTemplate[]; meta: PaginationMeta }>('/admin/notification-templates', { params }).then(unwrapPage),
  createTemplate: (data: NotificationTemplateInput) =>
    api.post<{ data: NotificationTemplate }>('/admin/notification-templates', data).then(unwrap<NotificationTemplate>),
  updateTemplate: (id: number, data: Partial<NotificationTemplateInput>) =>
    api.put<{ data: NotificationTemplate }>(`/admin/notification-templates/${id}`, data).then(unwrap<NotificationTemplate>),
  deleteTemplate: (id: number) =>
    api.delete(`/admin/notification-templates/${id}`).then(handleResponse),
};

// Dashboard
export const dashboardApi = {
  getDashboard: () =>
    api.get<{ data: DashboardStats }>('/dashboard').then(unwrap<DashboardStats>),
  getStats: (params?: Record<string, string | number | boolean>) =>
    api.get<{ data: Record<string, unknown> }>('/dashboard/stats', { params }).then(unwrap<Record<string, unknown>>),
};

// Reports
export const reportsApi = {
  getUserReport: (params?: Record<string, string | number | boolean>) =>
    api.get<Record<string, unknown>>('/reports/users/', { params }).then(handleResponse),
  getCourseReport: (params?: Record<string, string | number | boolean>) =>
    api.get<Record<string, unknown>>('/reports/courses/', { params }).then(handleResponse),
  getEnrollmentReport: (params?: Record<string, string | number | boolean>) =>
    api.get<Record<string, unknown>>('/reports/enrollments/', { params }).then(handleResponse),
};
