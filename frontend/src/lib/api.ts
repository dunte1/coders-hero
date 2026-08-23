import api from './axios';
import type { PaginationMeta } from '@/types/cms';
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
  StudentProject,
  ExamQuestion,
  ExamAttempt,
} from '@/types';

const handleResponse = <T>(response: { data: T }): T => {
  const body = response.data as any;
  if (body && typeof body === 'object' && 'data' in body) {
    return body.data;
  }
  return body;
};

const unwrap = <T>(response: { data: { data: T } }): T => response.data.data;

const unwrapPage = <T>(response: { data: any }): PaginatedResponse<T> => {
  const body = response.data;
  const items = body?.data ?? [];
  const meta = body?.meta ?? {};
  return {
    count: meta.total ?? items.length,
    next: body?.links?.next ?? null,
    previous: body?.links?.prev ?? null,
    results: items as T[],
  };
};

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
  id: string;
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
  const roles = (raw.roles ?? []).map((r) => ({ ...r, permissions: r.permissions || [] }));
  const role = roles.length > 0 ? roles[0] : { id: 0, name: 'user', permissions: [] as Permission[] };

  return {
    id: raw.id,
    email: raw.email,
    name: raw.name,
    phone: raw.phone ?? undefined,
    avatar: raw.avatar ?? undefined,
    role,
    roles,
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
    api.get<PaginatedResponse<LoginHistory>>('/admin/login-history/', { params }).then((r) => unwrapPage<LoginHistory>(r)),
  clearLoginHistory: () =>
    api.delete('/admin/login-history/').then(handleResponse),
};

// Roles
export const rolesApi = {
  getRoles: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<Role>>('/admin/roles/', { params }).then((r) => unwrapPage<Role>(r)),
  getRole: (id: number) =>
    api.get<Role>(`/admin/roles/${id}/`).then(handleResponse),
  createRole: (data: RoleCreate) =>
    api.post<Role>('/admin/roles/', data).then(handleResponse),
  updateRole: (id: number, data: RoleUpdate) =>
    api.put<Role>(`/admin/roles/${id}/`, data).then(handleResponse),
  deleteRole: (id: number) =>
    api.delete(`/admin/roles/${id}/`).then(handleResponse),
  syncRolePermissions: (id: number, permissions: string[]) =>
    api.post<Role>(`/admin/roles/${id}/permissions/`, { permissions }).then(handleResponse),
  getRolePermissions: (id: number) =>
    api.get<Permission[]>(`/admin/roles/${id}/permissions/`).then(handleResponse),
  getRoleUsers: (id: number, params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<User>>(`/admin/roles/${id}/users/`, { params }).then((r) => unwrapPage<User>(r)),
};

// Permissions
export const permissionsApi = {
  getPermissions: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<Permission>>('/admin/permissions/', { params }).then((r) => unwrapPage<Permission>(r)),
  getPermission: (id: number) =>
    api.get<Permission>(`/admin/permissions/${id}/`).then(handleResponse),
  getPermissionGroups: () =>
    api.get<string[]>('/admin/permissions/groups/').then(handleResponse),
  createPermission: (data: PermissionCreate) =>
    api.post<Permission>('/admin/permissions/', data).then(handleResponse),
  updatePermission: (id: number, data: PermissionUpdate) =>
    api.put<Permission>(`/admin/permissions/${id}/`, data).then(handleResponse),
  deletePermission: (id: number) =>
    api.delete(`/admin/permissions/${id}/`).then(handleResponse),
};

// Login History
export const loginHistoryApi = {
  getAll: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<LoginHistory>>('/admin/login-history/', { params }).then((r) => unwrapPage<LoginHistory>(r)),
  getOne: (id: number) =>
    api.get<LoginHistory>(`/admin/login-history/${id}/`).then(handleResponse),
  clearAll: () =>
    api.delete('/admin/login-history/').then(handleResponse),
};

// Users
export const usersApi = {
  getUsers: (params?: Record<string, string | number | boolean>) =>
    api.get(`/admin/users`, { params }).then((r) => unwrapPage<User>(r)),
  getUser: (id: string | number) =>
    api.get(`/admin/users/${id}`).then((r) => handleResponse<User>(r)),
  createUser: (data: UserCreate) =>
    api.post('/admin/users', data).then((r) => handleResponse<User>(r)),
  updateUser: (id: string | number, data: UserUpdate) =>
    api.put(`/admin/users/${id}`, data).then((r) => handleResponse<User>(r)),
  deleteUser: (id: string | number) =>
    api.delete(`/admin/users/${id}`).then(handleResponse),
  assignRole: (userId: string | number, roleName: string) =>
    api.post(`/admin/users/${userId}/assign-role`, { role: roleName }).then(handleResponse),
  removeRole: (userId: string | number, roleName: string) =>
    api.delete(`/admin/users/${userId}/remove-role`, { data: { role: roleName } }).then(handleResponse),
  toggleStatus: (userId: string | number) =>
    api.post(`/admin/users/${userId}/toggle-status`).then(handleResponse),
  resetPassword: (userId: string | number, data: { password: string; password_confirmation: string }) =>
    api.put(`/admin/users/${userId}/password`, data).then(handleResponse),
  uploadAvatar: (userId: string | number, file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post(`/admin/users/${userId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => handleResponse<User>(r));
  },
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
    api.get<PaginatedResponse<Employee>>('/admin/employees/', { params }).then((r) => unwrapPage<Employee>(r)),
  getEmployee: (id: number) =>
    api.get<Employee>(`/admin/employees/${id}/`).then(handleResponse),
  createEmployee: (data: EmployeeCreate) =>
    api.post<Employee>('/admin/employees/', data).then(handleResponse),
  updateEmployee: (id: number, data: Partial<EmployeeCreate>) =>
    api.put<Employee>(`/admin/employees/${id}/`, data).then(handleResponse),
  deleteEmployee: (id: number) =>
    api.delete(`/admin/employees/${id}/`).then(handleResponse),
  getDirectory: () =>
    api.get<Employee[]>('/admin/employees/directory/').then(handleResponse),
};

// Departments
export const departmentsApi = {
  getDepartments: () =>
    api.get<Department[]>('/admin/departments/').then(handleResponse),
  createDepartment: (data: { name: string; description?: string }) =>
    api.post<Department>('/admin/departments/', data).then(handleResponse),
  updateDepartment: (id: number, data: { name?: string; description?: string }) =>
    api.put<Department>(`/admin/departments/${id}/`, data).then(handleResponse),
  deleteDepartment: (id: number) =>
    api.delete(`/admin/departments/${id}/`).then(handleResponse),
};

// Positions
export const positionsApi = {
  getPositions: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<Position>>('/admin/positions/', { params }).then((r) => unwrapPage<Position>(r)),
  createPosition: (data: { title: string; description?: string; department_id: number; min_salary?: number; max_salary?: number }) =>
    api.post<Position>('/admin/positions/', data).then(handleResponse),
  updatePosition: (id: number, data: Partial<{ title: string; description?: string; department_id: number }>) =>
    api.put<Position>(`/admin/positions/${id}/`, data).then(handleResponse),
  deletePosition: (id: number) =>
    api.delete(`/admin/positions/${id}/`).then(handleResponse),
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
    api.get<PaginatedResponse<Certificate>>('/certificates/', { params }).then((r) => unwrapPage<Certificate>(r)),
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
    api.get<{ data: Notification[]; meta: PaginationMeta }>('/notifications', { params }).then((r) => unwrapPage<Notification>(r)),
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
    api.get<{ data: NotificationTemplate[]; meta: PaginationMeta }>('/notification-templates', { params }).then((r) => unwrapPage<NotificationTemplate>(r)),
};

// Notifications admin
export const notificationAdminApi = {
  getSummary: () =>
    api.get<{ data: NotificationAdminSummary }>('/admin/notifications/summary').then(unwrap<NotificationAdminSummary>),
  getDeliveries: (params?: Record<string, string | number | boolean>) =>
    api.get<{ data: NotificationDeliveryLog[]; meta: PaginationMeta }>('/admin/notifications/deliveries', { params }).then((r) => unwrapPage<NotificationDeliveryLog>(r)),
  sendBroadcast: (data: NotificationBroadcastInput) =>
    api.post<{ data: Notification }>('/admin/notifications/send', data).then(unwrap<Notification>),
  retryDelivery: (id: number) =>
    api.post<{ data: NotificationDeliveryLog }>(`/admin/notifications/deliveries/${id}/retry`).then(unwrap<NotificationDeliveryLog>),
  getTemplates: (params?: Record<string, string | number | boolean>) =>
    api.get<{ data: NotificationTemplate[]; meta: PaginationMeta }>('/admin/notification-templates', { params }).then((r) => unwrapPage<NotificationTemplate>(r)),
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

// Student Assignments
export const studentAssignmentsApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    api.get('/student/assignments', { params }).then(unwrapPage),
  show: (id: number) =>
    api.get(`/student/assignments/${id}`).then(unwrap),
  submit: (id: number, data: FormData) =>
    api.post(`/student/assignments/${id}/submit`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(unwrap),
  mySubmissions: (params?: Record<string, string | number | boolean>) =>
    api.get('/student/assignments/my-submissions', { params }).then(unwrapPage),
};

// Student Projects
export const studentProjectsApi = {
  getAll: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<StudentProject>>('/student/projects', { params }).then(r => unwrapPage<StudentProject>(r)),
  get: (id: number) =>
    api.get(`/student/projects/${id}`).then(r => handleResponse<StudentProject>(r)),
  create: (data: Partial<StudentProject>) =>
    api.post('/student/projects', data).then(r => handleResponse<StudentProject>(r)),
  update: (id: number, data: Partial<StudentProject>) =>
    api.put(`/student/projects/${id}`, data).then(r => handleResponse<StudentProject>(r)),
  delete: (id: number) =>
    api.delete(`/student/projects/${id}`).then(handleResponse),
  publish: (id: number) =>
    api.post(`/student/projects/${id}/publish`).then(r => handleResponse<StudentProject>(r)),
  unpublish: (id: number) =>
    api.post(`/student/projects/${id}/unpublish`).then(r => handleResponse<StudentProject>(r)),
  uploadMedia: (id: number, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post(`/student/projects/${id}/media`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => handleResponse(r));
  },
  deleteMedia: (id: number, mediaId: number) =>
    api.delete(`/student/projects/${id}/media/${mediaId}`).then(handleResponse),
  review: (projectId: number, data: { score: number; feedback?: string; status: string }) =>
    api.post(`/projects/${projectId}/reviews`, data).then(r => handleResponse(r)),
  publicList: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<StudentProject>>('/public/projects', { params }).then(r => unwrapPage<StudentProject>(r)),
};

// Student Exams
export const studentExamsApi = {
  getAvailable: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<ExamAttempt>>('/student/exams', { params }).then(r => unwrapPage<ExamAttempt>(r)),
  getExam: (id: number) =>
    api.get(`/student/exams/${id}`).then(r => handleResponse<{id:number;title:string;questions:ExamQuestion[];duration_minutes:number;total_marks:number}>(r)),
  startAttempt: (id: number) =>
    api.post(`/student/exams/${id}/start`).then(r => handleResponse<ExamAttempt>(r)),
  submitAttempt: (id: number, answers: Record<number, string>) =>
    api.post(`/student/exams/${id}/submit`, { answers }).then(r => handleResponse<ExamAttempt>(r)),
  getAttempts: () =>
    api.get<PaginatedResponse<ExamAttempt>>('/student/exams/attempts').then(r => unwrapPage<ExamAttempt>(r)),
};

// Student Assignments — upload source
export const studentAssignmentUploadApi = {
  submitWithFile: (id: number, formData: FormData) =>
    api.post(`/student/assignments/${id}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(unwrap),
};

// Student Projects — source zip upload
export const studentProjectSourceApi = {
  uploadSource: (id: number, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post(`/student/projects/${id}/source`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => handleResponse(r));
  },
};

// Parent Announcements
export const parentAnnouncementsApi = {
  getAll: (params?: Record<string, string | number | boolean>) =>
    api.get('/parent/announcements', { params }).then(r => unwrapPage(r)),
};

// Reports — generated
export const reportsGeneratedApi = {
  generateReport: (data: { month: number; year: number }) =>
    api.post('/admin/reports/generated', data).then(r => handleResponse(r)),
  downloadReport: (id: number) =>
    api.get(`/reports/download/${id}`, { responseType: 'blob' }).then(r => r.data),
  listGenerated: (params?: Record<string, string | number | boolean>) =>
    api.get('/admin/reports/generated', { params }).then(r => unwrapPage(r)),
};

// Class Sessions (Live Classes)
export const classSessionsApi = {
  getTeacherSessions: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<any>>('/teacher/class-sessions', { params }).then(r => unwrapPage(r)),
  createSession: (data: any) =>
    api.post('/teacher/class-sessions', data).then(r => handleResponse(r)),
  updateSession: (id: number, data: any) =>
    api.put(`/teacher/class-sessions/${id}`, data).then(r => handleResponse(r)),
  deleteSession: (id: number) =>
    api.delete(`/teacher/class-sessions/${id}`).then(handleResponse),
  getStudentSessions: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<any>>('/student/class-sessions', { params }).then(r => unwrapPage(r)),
};

// Public Portfolio
export const publicPortfolioApi = {
  getStudent: (studentId: string) =>
    api.get(`/public/portfolio/${studentId}`).then(r => handleResponse(r)),
};

// CRM Leads
export const leadsApi = {
  getAll: (params?: Record<string, string | number | boolean>) =>
    api.get('/crm/leads', { params }).then(r => unwrapPage(r)),
  get: (id: number) =>
    api.get(`/crm/leads/${id}`).then(r => handleResponse(r)),
  create: (data: Record<string, unknown>) =>
    api.post('/crm/leads', data).then(r => handleResponse(r)),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/crm/leads/${id}`, data).then(r => handleResponse(r)),
  delete: (id: number) =>
    api.delete(`/crm/leads/${id}`).then(handleResponse),
  changeStatus: (id: number, status: string) =>
    api.put(`/crm/leads/${id}/status`, { status }).then(r => handleResponse(r)),
};

// Finance — expense approval
export const expenseApprovalApi = {
  approve: (id: number) =>
    api.post(`/finance/expenses/${id}/approve`).then(r => handleResponse(r)),
  reject: (id: number, reason: string) =>
    api.post(`/finance/expenses/${id}/reject`, { reason }).then(r => handleResponse(r)),
};

// Organization — School Contracts
export const contractsApi = {
  getAll: (params?: Record<string, string | number | boolean>) =>
    api.get('/organization/contracts', { params }).then(r => unwrapPage(r)),
  get: (id: number) =>
    api.get(`/organization/contracts/${id}`).then(r => handleResponse(r)),
  create: (data: Record<string, unknown>) =>
    api.post('/organization/contracts', data).then(r => handleResponse(r)),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/organization/contracts/${id}`, data).then(r => handleResponse(r)),
  delete: (id: number) =>
    api.delete(`/organization/contracts/${id}`).then(handleResponse),
};

// Inventory — Suppliers
export const suppliersApi = {
  getAll: (params?: Record<string, string | number | boolean>) =>
    api.get('/inventory/suppliers', { params }).then(r => unwrapPage(r)),
  get: (id: number) =>
    api.get(`/inventory/suppliers/${id}`).then(r => handleResponse(r)),
  create: (data: Record<string, unknown>) =>
    api.post('/inventory/suppliers', data).then(r => handleResponse(r)),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/inventory/suppliers/${id}`, data).then(r => handleResponse(r)),
  delete: (id: number) =>
    api.delete(`/inventory/suppliers/${id}`).then(handleResponse),
};

// Inventory — Purchase Orders
export const purchaseOrdersApi = {
  getAll: (params?: Record<string, string | number | boolean>) =>
    api.get('/inventory/purchase-orders', { params }).then(r => unwrapPage(r)),
  get: (id: number) =>
    api.get(`/inventory/purchase-orders/${id}`).then(r => handleResponse(r)),
  create: (data: Record<string, unknown>) =>
    api.post('/inventory/purchase-orders', data).then(r => handleResponse(r)),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/inventory/purchase-orders/${id}`, data).then(r => handleResponse(r)),
  updateStatus: (id: number, status: string) =>
    api.put(`/inventory/purchase-orders/${id}/status`, { status }).then(r => handleResponse(r)),
};

// Search
export const searchApi = {
  search: (params: { q: string; type?: string }) =>
    api.get('/admin/search', { params }).then((res) => res.data.data),
};
