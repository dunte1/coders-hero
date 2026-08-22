import React from 'react';
import type { RoutePermission } from '@/types';

export interface RouteConfig {
  path: string;
  element: React.LazyExoticComponent<React.ComponentType>;
  meta?: {
    title?: string;
    public?: boolean;
    layout?: 'website';
  } & RoutePermission;
}

export const routes: RouteConfig[] = [
  // Marketing website
  {
    path: '/',
    element: React.lazy(() => import('@/pages/website/HomePage')),
    meta: { title: 'Home', public: true, layout: 'website' },
  },
  {
    path: '/services',
    element: React.lazy(() => import('@/pages/website/ServicesPage')),
    meta: { title: 'Services', public: true, layout: 'website' },
  },
  {
    path: '/about',
    element: React.lazy(() => import('@/pages/website/AboutPage')),
    meta: { title: 'About Us', public: true, layout: 'website' },
  },
  {
    path: '/programs',
    element: React.lazy(() => import('@/pages/website/ProgramsPage')),
    meta: { title: 'Programs', public: true, layout: 'website' },
  },
  {
    path: '/programs/:slug',
    element: React.lazy(() => import('@/pages/website/ProgramDetailPage')),
    meta: { title: 'Program', public: true, layout: 'website' },
  },
  {
    path: '/robotics',
    element: React.lazy(() => import('@/pages/website/RoboticsPage')),
    meta: { title: 'Robotics', public: true, layout: 'website' },
  },
  {
    path: '/coding',
    element: React.lazy(() => import('@/pages/website/CodingPage')),
    meta: { title: 'Coding', public: true, layout: 'website' },
  },
  {
    path: '/gallery',
    element: React.lazy(() => import('@/pages/website/GalleryPage')),
    meta: { title: 'Gallery', public: true, layout: 'website' },
  },
  {
    path: '/testimonials',
    element: React.lazy(() => import('@/pages/website/TestimonialsPage')),
    meta: { title: 'Testimonials', public: true, layout: 'website' },
  },
  {
    path: '/blog',
    element: React.lazy(() => import('@/pages/website/BlogPage')),
    meta: { title: 'Blog', public: true, layout: 'website' },
  },
  {
    path: '/blog/:slug',
    element: React.lazy(() => import('@/pages/website/BlogDetailPage')),
    meta: { title: 'Blog Post', public: true, layout: 'website' },
  },
  {
    path: '/faqs',
    element: React.lazy(() => import('@/pages/website/FaqPage')),
    meta: { title: 'FAQs', public: true, layout: 'website' },
  },
  {
    path: '/events',
    element: React.lazy(() => import('@/pages/website/EventsPage')),
    meta: { title: 'Events', public: true, layout: 'website' },
  },
  {
    path: '/courses-catalog',
    element: React.lazy(() => import('@/pages/website/PublicCoursesPage')),
    meta: { title: 'Courses', public: true, layout: 'website' },
  },
  {
    path: '/register',
    element: React.lazy(() => import('@/pages/website/RegistrationPage')),
    meta: { title: 'Online Registration', public: true, layout: 'website' },
  },
  {
    path: '/contact',
    element: React.lazy(() => import('@/pages/website/ContactPage')),
    meta: { title: 'Contact', public: true, layout: 'website' },
  },
  {
    path: '/free-trial',
    element: React.lazy(() => import('@/pages/website/FreeTrialPage')),
    meta: { title: 'Book a Free Trial', public: true, layout: 'website' },
  },
  {
    path: '/school-partnerships',
    element: React.lazy(() => import('@/pages/website/PartnerSchoolsPage')),
    meta: { title: 'School Partnerships', public: true, layout: 'website' },
  },

  // Public auth routes
  {
    path: '/login',
    element: React.lazy(() => import('@/pages/LoginPage')),
    meta: { title: 'Login', public: true },
  },
  {
    path: '/verify-email',
    element: React.lazy(() => import('@/pages/VerifyEmailPage')),
    meta: { title: 'Verify Email', public: true },
  },
  {
    path: '/forgot-password',
    element: React.lazy(() => import('@/pages/ForgotPasswordPage')),
    meta: { title: 'Forgot Password', public: true },
  },
  {
    path: '/reset-password',
    element: React.lazy(() => import('@/pages/ResetPasswordPage')),
    meta: { title: 'Reset Password', public: true },
  },
  {
    path: '/two-factor/challenge',
    element: React.lazy(() => import('@/pages/TwoFactorChallengePage')),
    meta: { title: 'Two-Factor Authentication', public: true },
  },

  // Dashboard
  {
    path: '/dashboard',
    element: React.lazy(() => import('@/pages/DashboardPage')),
    meta: { title: 'Dashboard' },
  },

  // Courses
  {
    path: '/courses',
    element: React.lazy(() => import('@/pages/CoursesPage')),
    meta: { title: 'Courses' },
  },
  {
    path: '/courses/create',
    element: React.lazy(() => import('@/pages/CourseCreatePage')),
    meta: { title: 'Create Course', roles: ['admin', 'instructor', 'school_admin'] },
  },
  {
    path: '/courses/:id',
    element: React.lazy(() => import('@/pages/CourseDetailPage')),
    meta: { title: 'Course Detail' },
  },
  {
    path: '/courses/:id/edit',
    element: React.lazy(() => import('@/pages/CourseEditPage')),
    meta: { title: 'Edit Course', roles: ['admin', 'instructor', 'school_admin'] },
  },

  // My Courses
  {
    path: '/my-courses',
    element: React.lazy(() => import('@/pages/MyCoursesPage')),
    meta: { title: 'My Courses' },
  },

  // Users
  {
    path: '/users',
    element: React.lazy(() => import('@/pages/UsersPage')),
    meta: { title: 'Users', roles: ['admin', 'school_admin'] },
  },
  {
    path: '/users/create',
    element: React.lazy(() => import('@/pages/UserCreatePage')),
    meta: { title: 'Create User', roles: ['admin', 'school_admin'] },
  },
  {
    path: '/users/:id',
    element: React.lazy(() => import('@/pages/UserDetailPage')),
    meta: { title: 'User Detail', roles: ['admin', 'school_admin'] },
  },
  {
    path: '/users/:id/edit',
    element: React.lazy(() => import('@/pages/UserEditPage')),
    meta: { title: 'Edit User', roles: ['admin', 'school_admin'] },
  },

  // Tasks
  {
    path: '/tasks/create',
    element: React.lazy(() => import('@/pages/TaskCreatePage')),
    meta: { title: 'Create Task' },
  },
  {
    path: '/tasks',
    element: React.lazy(() => import('@/pages/TasksPage')),
    meta: { title: 'Tasks' },
  },
  {
    path: '/tasks/:id',
    element: React.lazy(() => import('@/pages/TaskDetailPage')),
    meta: { title: 'Task Detail' },
  },

  // Projects
  {
    path: '/projects',
    element: React.lazy(() => import('@/pages/ProjectsPage')),
    meta: { title: 'Projects' },
  },
  {
    path: '/projects/create',
    element: React.lazy(() => import('@/pages/ProjectCreatePage')),
    meta: { title: 'Create Project', roles: ['admin', 'manager'] },
  },
  {
    path: '/projects/:id',
    element: React.lazy(() => import('@/pages/ProjectDetailPage')),
    meta: { title: 'Project Detail' },
  },
  {
    path: '/projects/:id/edit',
    element: React.lazy(() => import('@/pages/ProjectEditPage')),
    meta: { title: 'Edit Project', roles: ['admin', 'manager'] },
  },

  // Employees
  {
    path: '/employees',
    element: React.lazy(() => import('@/pages/EmployeesPage')),
    meta: { title: 'Employees', roles: ['admin', 'manager'] },
  },
  {
    path: '/employees/create',
    element: React.lazy(() => import('@/pages/EmployeeCreatePage')),
    meta: { title: 'Add Employee', roles: ['admin', 'manager'] },
  },
  {
    path: '/employees/:id',
    element: React.lazy(() => import('@/pages/EmployeeDetailPage')),
    meta: { title: 'Employee Detail', roles: ['admin', 'manager'] },
  },
  {
    path: '/employees/:id/edit',
    element: React.lazy(() => import('@/pages/EmployeeEditPage')),
    meta: { title: 'Edit Employee', roles: ['admin', 'manager'] },
  },

  // Quizzes
  {
    path: '/quizzes',
    element: React.lazy(() => import('@/pages/QuizPage')),
    meta: { title: 'Quizzes' },
  },
  {
    path: '/quizzes/:id/take',
    element: React.lazy(() => import('@/pages/QuizTakerPage')),
    meta: { title: 'Take Quiz' },
  },

  // Certificates
  {
    path: '/certificates',
    element: React.lazy(() => import('@/pages/certificates/MyCertificatesPage')),
    meta: { title: 'Certificates' },
  },
  {
    path: '/verify-certificate',
    element: React.lazy(() => import('@/pages/certificates/CertificateVerifyPage')),
    meta: { title: 'Verify Certificate', public: true },
  },
  {
    path: '/verify-certificate/:code',
    element: React.lazy(() => import('@/pages/certificates/CertificateVerifyPage')),
    meta: { title: 'Verify Certificate', public: true },
  },

  // Certificate Management
  {
    path: '/admin/certificates',
    element: React.lazy(() => import('@/pages/certificates/CertificatesAdminPage')),
    meta: { title: 'Certificate Management', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/admin/certificates/all',
    element: React.lazy(() => import('@/pages/certificates/CertificatesAdminListPage')),
    meta: { title: 'All Certificates', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/admin/certificates/templates',
    element: React.lazy(() => import('@/pages/certificates/CertificateTemplatesPage')),
    meta: { title: 'Certificate Templates', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/admin/certificates/verifications',
    element: React.lazy(() => import('@/pages/certificates/CertificateVerificationsPage')),
    meta: { title: 'Verification History', roles: ['admin', 'super_admin'] },
  },

  // Competitions
  {
    path: '/competitions',
    element: React.lazy(() => import('@/pages/competitions/CompetitionsPage')),
    meta: { title: 'Competitions' },
  },
  {
    path: '/competitions/my-teams',
    element: React.lazy(() => import('@/pages/competitions/MyCompetitionsPage')),
    meta: { title: 'My Competitions' },
  },
  {
    path: '/competitions/create',
    element: React.lazy(() => import('@/pages/competitions/CompetitionCreatePage')),
    meta: { title: 'New Competition', roles: ['admin', 'super_admin', 'teacher', 'instructor'] },
  },
  {
    path: '/competitions/:id',
    element: React.lazy(() => import('@/pages/competitions/CompetitionDetailPage')),
    meta: { title: 'Competition Detail' },
  },
  {
    path: '/competitions/:id/manage',
    element: React.lazy(() => import('@/pages/competitions/CompetitionManagePage')),
    meta: { title: 'Manage Competition', roles: ['admin', 'super_admin', 'teacher', 'instructor'] },
  },
  {
    path: '/competitions/:id/judge',
    element: React.lazy(() => import('@/pages/competitions/JudgeScoringPage')),
    meta: { title: 'Judge Scoring', roles: ['judge'] },
  },
  {
    path: '/competitions/:id/leaderboard',
    element: React.lazy(() => import('@/pages/competitions/CompetitionLeaderboardPage')),
    meta: { title: 'Leaderboard' },
  },

  // Announcements
  {
    path: '/announcements',
    element: React.lazy(() => import('@/pages/AnnouncementsPage')),
    meta: { title: 'Announcements' },
  },
  {
    path: '/announcements/:id',
    element: React.lazy(() => import('@/pages/AnnouncementDetailPage')),
    meta: { title: 'Announcement' },
  },

  // Notifications
  {
    path: '/notifications',
    element: React.lazy(() => import('@/pages/NotificationsPage')),
    meta: { title: 'Notifications' },
  },
  {
    path: '/notifications/preferences',
    element: React.lazy(() => import('@/pages/NotificationPreferencesPage')),
    meta: { title: 'Notification Preferences' },
  },

  // Notification administration
  {
    path: '/admin/notifications',
    element: React.lazy(() => import('@/pages/notifications/NotificationsAdminPage')),
    meta: { title: 'Notifications Administration', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/admin/notifications/templates',
    element: React.lazy(() => import('@/pages/notifications/NotificationTemplatesAdminPage')),
    meta: { title: 'Notification Templates', roles: ['admin', 'super_admin'] },
  },

  // Profile
  {
    path: '/profile',
    element: React.lazy(() => import('@/pages/ProfilePage')),
    meta: { title: 'Profile' },
  },

  // Settings
  {
    path: '/settings',
    element: React.lazy(() => import('@/pages/SettingsPage')),
    meta: { title: 'Settings' },
  },
  {
    path: '/settings/two-factor',
    element: React.lazy(() => import('@/pages/TwoFactorSetupPage')),
    meta: { title: 'Two-Factor Authentication' },
  },
  {
    path: '/settings/login-history',
    element: React.lazy(() => import('@/pages/LoginHistoryPage')),
    meta: { title: 'Login History' },
  },
  {
    path: '/settings/roles',
    element: React.lazy(() => import('@/pages/RolesPage')),
    meta: { title: 'Roles', roles: ['super_admin', 'admin'] },
  },
  {
    path: '/settings/roles/:id',
    element: React.lazy(() => import('@/pages/RoleDetailPage')),
    meta: { title: 'Role Detail', roles: ['super_admin', 'admin'] },
  },
  {
    path: '/settings/permissions',
    element: React.lazy(() => import('@/pages/PermissionsPage')),
    meta: { title: 'Permissions', roles: ['super_admin', 'admin'] },
  },

  // AI Platform
  {
    path: '/ai',
    element: React.lazy(() => import('@/pages/ai/AiPlatformPage')),
    meta: { title: 'AI Platform' },
  },
  {
    path: '/ai/conversations/:conversationId',
    element: React.lazy(() => import('@/pages/ai/AiPlatformPage')),
    meta: { title: 'AI Conversation' },
  },
  {
    path: '/ai/usage',
    element: React.lazy(() => import('@/pages/ai/AiUsagePage')),
    meta: { title: 'My AI Usage' },
  },
  {
    path: '/admin/ai',
    element: React.lazy(() => import('@/pages/ai/AiAdminPage')),
    meta: { title: 'AI Administration', roles: ['admin', 'super_admin'] },
  },

  // Analytics
  {
    path: '/analytics',
    element: React.lazy(() => import('@/pages/analytics/AnalyticsDashboardPage')),
    meta: { title: 'Analytics', roles: ['admin', 'super_admin', 'director', 'branch_manager', 'school_admin', 'accountant'] },
  },

  // Reports
  {
    path: '/reports',
    element: React.lazy(() => import('@/pages/ReportsPage')),
    meta: { title: 'Reports', roles: ['admin', 'director', 'branch_manager', 'school_admin', 'accountant'] },
  },

  // Website CMS
  {
    path: '/cms/site-content',
    element: React.lazy(() => import('@/pages/cms/SiteContentPage')),
    meta: { title: 'Site Content', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/cms/services',
    element: React.lazy(() => import('@/pages/cms/ServicesAdminPage')),
    meta: { title: 'Services', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/cms/programs',
    element: React.lazy(() => import('@/pages/cms/ProgramsAdminPage')),
    meta: { title: 'Programs', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/cms/programs/new',
    element: React.lazy(() => import('@/pages/cms/ProgramEditPage')),
    meta: { title: 'New Program', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/cms/programs/:id/edit',
    element: React.lazy(() => import('@/pages/cms/ProgramEditPage')),
    meta: { title: 'Edit Program', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/cms/gallery',
    element: React.lazy(() => import('@/pages/cms/GalleryAdminPage')),
    meta: { title: 'Gallery', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/cms/testimonials',
    element: React.lazy(() => import('@/pages/cms/TestimonialsAdminPage')),
    meta: { title: 'Testimonials', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/cms/blog',
    element: React.lazy(() => import('@/pages/cms/BlogAdminPage')),
    meta: { title: 'Blog', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/cms/blog/new',
    element: React.lazy(() => import('@/pages/cms/BlogEditPage')),
    meta: { title: 'New Post', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/cms/blog/:id/edit',
    element: React.lazy(() => import('@/pages/cms/BlogEditPage')),
    meta: { title: 'Edit Post', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/cms/faqs',
    element: React.lazy(() => import('@/pages/cms/FaqsAdminPage')),
    meta: { title: 'FAQs', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/cms/contact-messages',
    element: React.lazy(() => import('@/pages/cms/ContactMessagesPage')),
    meta: { title: 'Contact Messages', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/cms/chat-widget',
    element: React.lazy(() => import('@/pages/cms/ChatWidgetSettingsPage')),
    meta: { title: 'Chat Widget', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/cms/analytics',
    element: React.lazy(() => import('@/pages/cms/WebsiteAnalyticsPage')),
    meta: { title: 'Website Analytics', roles: ['admin', 'super_admin'] },
  },

  // Student Information System
  {
    path: '/students',
    element: React.lazy(() => import('@/pages/students/StudentsPage')),
    meta: { title: 'Students', roles: ['admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/students/overview',
    element: React.lazy(() => import('@/pages/students/StudentsOverviewPage')),
    meta: { title: 'Student Dashboard', roles: ['admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/organization/overview',
    element: React.lazy(() => import('@/pages/students/StudentsOverviewPage')),
    meta: { title: 'Organization Overview', roles: ['admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/organization/branches',
    element: React.lazy(() => import('@/pages/organization/BranchesPage')),
    meta: { title: 'Branches', roles: ['admin', 'super_admin', 'director', 'branch_manager'] },
  },
  {
    path: '/organization/partner-schools',
    element: React.lazy(() => import('@/pages/organization/PartnerSchoolsPage')),
    meta: { title: 'Partner Schools', roles: ['admin', 'super_admin', 'director', 'school_admin'] },
  },
  {
    path: '/organization/academic-years',
    element: React.lazy(() => import('@/pages/organization/AcademicYearsPage')),
    meta: { title: 'Academic Years', roles: ['admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/students/create',
    element: React.lazy(() => import('@/pages/students/StudentCreatePage')),
    meta: { title: 'New Student', roles: ['admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/students/:id',
    element: React.lazy(() => import('@/pages/students/StudentDetailPage')),
    meta: { title: 'Student Detail', roles: ['admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/students/:id/edit',
    element: React.lazy(() => import('@/pages/students/StudentEditPage')),
    meta: { title: 'Edit Student', roles: ['admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/students/:id/id-card',
    element: React.lazy(() => import('@/pages/students/StudentIdCardPage')),
    meta: { title: 'Student ID Card', roles: ['admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },

  {
    path: '/admissions',
    element: React.lazy(() => import('@/pages/students/AdmissionsPage')),
    meta: { title: 'Admissions', roles: ['admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/admissions/new',
    element: React.lazy(() => import('@/pages/students/AdmissionFormPage')),
    meta: { title: 'New Application', roles: ['admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/admissions/:id/edit',
    element: React.lazy(() => import('@/pages/students/AdmissionFormPage')),
    meta: { title: 'Edit Application', roles: ['admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },

  {
    path: '/guardians',
    element: React.lazy(() => import('@/pages/students/GuardiansPage')),
    meta: { title: 'Guardians', roles: ['admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/guardians/new',
    element: React.lazy(() => import('@/pages/students/GuardianFormPage')),
    meta: { title: 'New Guardian', roles: ['admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/guardians/:id/edit',
    element: React.lazy(() => import('@/pages/students/GuardianFormPage')),
    meta: { title: 'Edit Guardian', roles: ['admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },

  {
    path: '/attendance',
    element: React.lazy(() => import('@/pages/students/AttendancePage')),
    meta: { title: 'Attendance', roles: ['admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/attendance/report',
    element: React.lazy(() => import('@/pages/students/AttendanceReportPage')),
    meta: { title: 'Attendance Report', roles: ['admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },

  // Parent Portal
  {
    path: '/parent',
    element: React.lazy(() => import('@/pages/parent/ParentDashboardPage')),
    meta: { title: 'Parent Portal', roles: ['parent', 'admin', 'super_admin'] },
  },
  {
    path: '/parent/attendance',
    element: React.lazy(() => import('@/pages/parent/ParentAttendancePage')),
    meta: { title: 'Attendance', roles: ['parent', 'admin', 'super_admin'] },
  },
  {
    path: '/parent/report-cards',
    element: React.lazy(() => import('@/pages/parent/ParentReportCardsPage')),
    meta: { title: 'Report Cards', roles: ['parent', 'admin', 'super_admin'] },
  },
  {
    path: '/parent/report-cards/:id',
    element: React.lazy(() => import('@/pages/parent/ParentReportCardDetailPage')),
    meta: { title: 'Report Card', roles: ['parent', 'admin', 'super_admin'] },
  },
  {
    path: '/parent/progress',
    element: React.lazy(() => import('@/pages/parent/ParentProgressPage')),
    meta: { title: 'Coding Progress', roles: ['parent', 'admin', 'super_admin'] },
  },
  {
    path: '/parent/fees',
    element: React.lazy(() => import('@/pages/parent/ParentFeesPage')),
    meta: { title: 'Fees', roles: ['parent', 'admin', 'super_admin'] },
  },
  {
    path: '/parent/receipts',
    element: React.lazy(() => import('@/pages/parent/ParentReceiptsPage')),
    meta: { title: 'Receipts', roles: ['parent', 'admin', 'super_admin'] },
  },
  {
    path: '/parent/receipts/:id',
    element: React.lazy(() => import('@/pages/parent/ParentReceiptDetailPage')),
    meta: { title: 'Receipt', roles: ['parent', 'admin', 'super_admin'] },
  },
  {
    path: '/parent/appointments',
    element: React.lazy(() => import('@/pages/parent/ParentAppointmentsPage')),
    meta: { title: 'Appointments', roles: ['parent', 'admin', 'super_admin'] },
  },
  {
    path: '/parent/notifications',
    element: React.lazy(() => import('@/pages/parent/ParentNotificationsPage')),
    meta: { title: 'Notifications', roles: ['parent', 'admin', 'super_admin'] },
  },

  // Teacher Portal
  {
    path: '/teacher',
    element: React.lazy(() => import('@/pages/teacher/TeacherDashboardPage')),
    meta: { title: 'Teacher Dashboard', roles: ['teacher', 'instructor', 'admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/teacher/classes',
    element: React.lazy(() => import('@/pages/teacher/TeacherClassesPage')),
    meta: { title: 'Classes', roles: ['teacher', 'instructor', 'admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/teacher/classes/:id',
    element: React.lazy(() => import('@/pages/teacher/TeacherClassDetailPage')),
    meta: { title: 'Class Detail', roles: ['teacher', 'instructor', 'admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/teacher/assignments',
    element: React.lazy(() => import('@/pages/teacher/TeacherAssignmentsPage')),
    meta: { title: 'Assignments', roles: ['teacher', 'instructor', 'admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/teacher/assignments/:id',
    element: React.lazy(() => import('@/pages/teacher/TeacherAssignmentDetailPage')),
    meta: { title: 'Assignment Detail', roles: ['teacher', 'instructor', 'admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/teacher/exams',
    element: React.lazy(() => import('@/pages/teacher/TeacherExamsPage')),
    meta: { title: 'Exams', roles: ['teacher', 'instructor', 'admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/teacher/exams/:id',
    element: React.lazy(() => import('@/pages/teacher/TeacherExamDetailPage')),
    meta: { title: 'Exam Detail', roles: ['teacher', 'instructor', 'admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/teacher/gradebook',
    element: React.lazy(() => import('@/pages/teacher/TeacherGradebookPage')),
    meta: { title: 'Gradebook', roles: ['teacher', 'instructor', 'admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/teacher/lesson-notes',
    element: React.lazy(() => import('@/pages/teacher/TeacherLessonNotesPage')),
    meta: { title: 'Lesson Notes', roles: ['teacher', 'instructor', 'admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/teacher/calendar',
    element: React.lazy(() => import('@/pages/teacher/TeacherCalendarPage')),
    meta: { title: 'Calendar', roles: ['teacher', 'instructor', 'admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/teacher/analytics',
    element: React.lazy(() => import('@/pages/teacher/TeacherAnalyticsPage')),
    meta: { title: 'Analytics', roles: ['teacher', 'instructor', 'admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/teacher/reports',
    element: React.lazy(() => import('@/pages/teacher/TeacherReportsPage')),
    meta: { title: 'Reports', roles: ['teacher', 'instructor', 'admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },
  {
    path: '/teacher/reports/classes/:classId/students/:studentId',
    element: React.lazy(() => import('@/pages/teacher/TeacherStudentReportPage')),
    meta: { title: 'Student Report', roles: ['teacher', 'instructor', 'admin', 'super_admin', 'director', 'branch_manager', 'school_admin'] },
  },

  // LMS (forum, coding, AI tutor, bookmarks, course player)
  {
    path: '/lms/forum',
    element: React.lazy(() => import('@/pages/lms/LmsForumPage')),
    meta: { title: 'Forum' },
  },
  {
    path: '/lms/forum/threads/:id',
    element: React.lazy(() => import('@/pages/lms/LmsForumThreadPage')),
    meta: { title: 'Thread' },
  },
  {
    path: '/lms/coding-exercises',
    element: React.lazy(() => import('@/pages/lms/LmsCodingExercisesPage')),
    meta: { title: 'Coding Exercises' },
  },
  {
    path: '/lms/coding-exercises/:id',
    element: React.lazy(() => import('@/pages/lms/LmsCodingExerciseDetailPage')),
    meta: { title: 'Coding Exercise' },
  },
  {
    path: '/lms/playground',
    element: React.lazy(() => import('@/pages/lms/LmsPlaygroundPage')),
    meta: { title: 'Coding Playground' },
  },
  {
    path: '/lms/coding-leaderboard',
    element: React.lazy(() => import('@/pages/lms/LmsLeaderboardPage')),
    meta: { title: 'Coding Leaderboard' },
  },
  {
    path: '/lms/ai-tutor',
    element: React.lazy(() => import('@/pages/lms/LmsAiTutorPage')),
    meta: { title: 'AI Tutor' },
  },
  {
    path: '/lms/ai-tutor/conversations/:conversationId',
    element: React.lazy(() => import('@/pages/lms/LmsAiTutorPage')),
    meta: { title: 'AI Tutor' },
  },
  {
    path: '/lms/bookmarks',
    element: React.lazy(() => import('@/pages/lms/LmsBookmarksPage')),
    meta: { title: 'Bookmarks' },
  },
  {
    path: '/lms/courses/:id/player',
    element: React.lazy(() => import('@/pages/lms/LmsCoursePlayerPage')),
    meta: { title: 'Course Player' },
  },
  {
    path: '/lms/analytics',
    element: React.lazy(() => import('@/pages/lms/StudentAnalyticsPage')),
    meta: { title: 'My Analytics' },
  },
  {
    path: '/lms/achievements',
    element: React.lazy(() => import('@/pages/lms/AchievementsPage')),
    meta: { title: 'Achievements' },
  },

  // Messages (parents, teachers, admins)
  {
    path: '/chat',
    element: React.lazy(() => import('@/pages/parent/ChatPage')),
    meta: { title: 'Messages', roles: ['parent', 'teacher', 'admin', 'super_admin'] },
  },

  // Appointments management (admin)
  {
    path: '/appointments',
    element: React.lazy(() => import('@/pages/parent/AdminAppointmentsPage')),
    meta: { title: 'Appointments', roles: ['admin', 'super_admin'] },
  },

  // Human Resources
  {
    path: '/hr',
    element: React.lazy(() => import('@/pages/hr/HrOverviewPage')),
    meta: { title: 'HR', roles: ['admin', 'super_admin', 'hr_officer'] },
  },
  {
    path: '/hr/employees',
    element: React.lazy(() => import('@/pages/hr/HrEmployeesPage')),
    meta: { title: 'Employees', roles: ['admin', 'super_admin', 'hr_officer'] },
  },
  {
    path: '/hr/employees/:id',
    element: React.lazy(() => import('@/pages/hr/HrEmployeeDetailPage')),
    meta: { title: 'Employee Detail', roles: ['admin', 'super_admin', 'hr_officer'] },
  },
  {
    path: '/hr/employees/:id/edit',
    element: React.lazy(() => import('@/pages/hr/HrEmployeeEditPage')),
    meta: { title: 'Edit Employee', roles: ['admin', 'super_admin', 'hr_officer'] },
  },
  {
    path: '/hr/employees/:id/id-card',
    element: React.lazy(() => import('@/pages/hr/StaffIdCardPage')),
    meta: { title: 'Staff ID Card', roles: ['admin', 'super_admin', 'hr_officer'] },
  },
  {
    path: '/hr/contracts',
    element: React.lazy(() => import('@/pages/hr/HrContractsPage')),
    meta: { title: 'Contracts', roles: ['admin', 'super_admin', 'hr_officer'] },
  },
  {
    path: '/hr/leaves',
    element: React.lazy(() => import('@/pages/hr/HrLeavesPage')),
    meta: { title: 'Leave', roles: ['admin', 'super_admin', 'hr_officer'] },
  },
  {
    path: '/hr/attendance',
    element: React.lazy(() => import('@/pages/hr/HrAttendancePage')),
    meta: { title: 'Attendance', roles: ['admin', 'super_admin', 'hr_officer'] },
  },
  {
    path: '/hr/payrolls',
    element: React.lazy(() => import('@/pages/hr/HrPayrollPage')),
    meta: { title: 'Payroll', roles: ['admin', 'super_admin', 'hr_officer'] },
  },
  {
    path: '/hr/payrolls/:id',
    element: React.lazy(() => import('@/pages/hr/HrPayrollDetailPage')),
    meta: { title: 'Payroll Detail', roles: ['admin', 'super_admin', 'hr_officer'] },
  },
  {
    path: '/hr/reviews',
    element: React.lazy(() => import('@/pages/hr/HrReviewsPage')),
    meta: { title: 'Performance Reviews', roles: ['admin', 'super_admin', 'hr_officer'] },
  },
  {
    path: '/hr/documents',
    element: React.lazy(() => import('@/pages/hr/HrDocumentsPage')),
    meta: { title: 'Documents', roles: ['admin', 'super_admin', 'hr_officer'] },
  },
  {
    path: '/hr/reports',
    element: React.lazy(() => import('@/pages/hr/HrReportsPage')),
    meta: { title: 'HR Reports', roles: ['admin', 'super_admin', 'hr_officer'] },
  },

  // HR self-service (employees)
  {
    path: '/my/hr',
    element: React.lazy(() => import('@/pages/hr/HrMyOverviewPage')),
    meta: { title: 'My HR', roles: ['employee', 'admin', 'super_admin'] },
  },
  {
    path: '/my/hr/leaves',
    element: React.lazy(() => import('@/pages/hr/HrMyLeavePage')),
    meta: { title: 'My Leave', roles: ['employee', 'admin', 'super_admin'] },
  },
  {
    path: '/my/hr/payslips',
    element: React.lazy(() => import('@/pages/hr/HrMyPayslipsPage')),
    meta: { title: 'My Payslips', roles: ['employee', 'admin', 'super_admin'] },
  },
  {
    path: '/my/hr/payslips/:id',
    element: React.lazy(() => import('@/pages/hr/HrMyPayslipDetailPage')),
    meta: { title: 'My Payslip', roles: ['employee', 'admin', 'super_admin'] },
  },

  // Digital Library
  {
    path: '/library',
    element: React.lazy(() => import('@/pages/library/LibraryCatalogPage')),
    meta: { title: 'Library' },
  },
  {
    path: '/library/resources/:id',
    element: React.lazy(() => import('@/pages/library/LibraryResourceDetailPage')),
    meta: { title: 'Resource' },
  },
  {
    path: '/library/mine',
    element: React.lazy(() => import('@/pages/library/MyLibraryPage')),
    meta: { title: 'My Library' },
  },
  {
    path: '/library/admin',
    element: React.lazy(() => import('@/pages/library/LibraryAdminOverviewPage')),
    meta: { title: 'Library Management', roles: ['admin', 'super_admin', 'librarian'] },
  },
  {
    path: '/library/admin/resources',
    element: React.lazy(() => import('@/pages/library/LibraryResourcesAdminPage')),
    meta: { title: 'Resources', roles: ['admin', 'super_admin', 'librarian'] },
  },
  {
    path: '/library/admin/borrowings',
    element: React.lazy(() => import('@/pages/library/LibraryBorrowingsAdminPage')),
    meta: { title: 'Borrowings', roles: ['admin', 'super_admin', 'librarian'] },
  },
  {
    path: '/library/admin/reservations',
    element: React.lazy(() => import('@/pages/library/LibraryReservationsAdminPage')),
    meta: { title: 'Reservations', roles: ['admin', 'super_admin', 'librarian'] },
  },
  {
    path: '/library/admin/categories',
    element: React.lazy(() => import('@/pages/library/LibraryCategoriesAdminPage')),
    meta: { title: 'Categories', roles: ['admin', 'super_admin', 'librarian'] },
  },
  {
    path: '/library/admin/authors',
    element: React.lazy(() => import('@/pages/library/LibraryAuthorsAdminPage')),
    meta: { title: 'Authors', roles: ['admin', 'super_admin', 'librarian'] },
  },

  // Inventory
  {
    path: '/inventory',
    element: React.lazy(() => import('@/pages/inventory/InventoryOverviewPage')),
    meta: { title: 'Inventory', roles: ['admin', 'super_admin', 'inventory_officer'] },
  },
  {
    path: '/inventory/assets',
    element: React.lazy(() => import('@/pages/inventory/AssetsPage')),
    meta: { title: 'Assets', roles: ['admin', 'super_admin', 'inventory_officer'] },
  },
  {
    path: '/inventory/assets/:id',
    element: React.lazy(() => import('@/pages/inventory/AssetDetailPage')),
    meta: { title: 'Asset Detail', roles: ['admin', 'super_admin', 'inventory_officer'] },
  },
  {
    path: '/inventory/items',
    element: React.lazy(() => import('@/pages/inventory/ItemsPage')),
    meta: { title: 'Stock Items', roles: ['admin', 'super_admin', 'inventory_officer'] },
  },
  {
    path: '/inventory/maintenance',
    element: React.lazy(() => import('@/pages/inventory/MaintenancePage')),
    meta: { title: 'Maintenance', roles: ['admin', 'super_admin', 'inventory_officer'] },
  },
  {
    path: '/inventory/categories',
    element: React.lazy(() => import('@/pages/inventory/CategoriesPage')),
    meta: { title: 'Categories', roles: ['admin', 'super_admin', 'inventory_officer'] },
  },
  {
    path: '/inventory/locations',
    element: React.lazy(() => import('@/pages/inventory/LocationsPage')),
    meta: { title: 'Locations', roles: ['admin', 'super_admin', 'inventory_officer'] },
  },

  // Finance
  {
    path: '/finance',
    element: React.lazy(() => import('@/pages/finance/FinanceOverviewPage')),
    meta: { title: 'Finance', roles: ['admin', 'super_admin', 'accountant'] },
  },
  {
    path: '/finance/mine',
    element: React.lazy(() => import('@/pages/finance/MyFinancePage')),
    meta: { title: 'My Finance', roles: ['student', 'parent'] },
  },
  {
    path: '/finance/invoices',
    element: React.lazy(() => import('@/pages/finance/InvoicesPage')),
    meta: { title: 'Invoices', roles: ['admin', 'super_admin', 'accountant'] },
  },
  {
    path: '/finance/invoices/new',
    element: React.lazy(() => import('@/pages/finance/InvoiceCreatePage')),
    meta: { title: 'New Invoice', roles: ['admin', 'super_admin', 'accountant'] },
  },
  {
    path: '/finance/invoices/:id',
    element: React.lazy(() => import('@/pages/finance/InvoiceDetailPage')),
    meta: { title: 'Invoice Detail', roles: ['admin', 'super_admin', 'accountant'] },
  },
  {
    path: '/finance/payments',
    element: React.lazy(() => import('@/pages/finance/PaymentsPage')),
    meta: { title: 'Payments', roles: ['admin', 'super_admin', 'accountant'] },
  },
  {
    path: '/finance/payments/:id',
    element: React.lazy(() => import('@/pages/finance/PaymentDetailPage')),
    meta: { title: 'Payment Detail', roles: ['admin', 'super_admin', 'accountant'] },
  },
  {
    path: '/finance/expenses',
    element: React.lazy(() => import('@/pages/finance/ExpensesPage')),
    meta: { title: 'Expenses', roles: ['admin', 'super_admin', 'accountant'] },
  },
  {
    path: '/finance/budgets',
    element: React.lazy(() => import('@/pages/finance/BudgetsPage')),
    meta: { title: 'Budgets', roles: ['admin', 'super_admin', 'accountant'] },
  },
  {
    path: '/finance/mpesa',
    element: React.lazy(() => import('@/pages/finance/MpesaTransactionsPage')),
    meta: { title: 'M-Pesa Transactions', roles: ['admin', 'super_admin', 'accountant'] },
  },
  {
    path: '/finance/outstanding',
    element: React.lazy(() => import('@/pages/finance/OutstandingPage')),
    meta: { title: 'Outstanding Balances', roles: ['admin', 'super_admin', 'accountant'] },
  },
  {
    path: '/finance/transactions',
    element: React.lazy(() => import('@/pages/finance/TransactionsPage')),
    meta: { title: 'Transactions', roles: ['admin', 'super_admin', 'accountant'] },
  },
  {
    path: '/finance/fee-structures',
    element: React.lazy(() => import('@/pages/finance/FeeStructuresPage')),
    meta: { title: 'Fee Structures', roles: ['admin', 'super_admin', 'accountant'] },
  },
  {
    path: '/subscriptions',
    element: React.lazy(() => import('@/pages/finance/SubscriptionsPage')),
    meta: { title: 'Subscription' },
  },

  // Academics
  {
    path: '/academics/enrollments',
    element: React.lazy(() => import('@/pages/academics/AcademicsEnrollmentsPage')),
    meta: { title: 'Enrollments', roles: ['admin', 'super_admin'] },
  },

  // Student Assignments
  {
    path: '/student/assignments',
    element: React.lazy(() => import('@/pages/student/StudentAssignmentsPage')),
    meta: { title: 'My Assignments', roles: ['student'] },
  },
  {
    path: '/student/assignments/:id',
    element: React.lazy(() => import('@/pages/student/StudentAssignmentDetailPage')),
    meta: { title: 'Assignment Detail', roles: ['student'] },
  },

  // Student Projects
  {
    path: '/student/projects',
    element: React.lazy(() => import('@/pages/student/StudentProjectsPage')),
    meta: { title: 'My Projects', roles: ['student'] },
  },
  {
    path: '/student/projects/create',
    element: React.lazy(() => import('@/pages/student/StudentProjectFormPage')),
    meta: { title: 'New Project', roles: ['student'] },
  },
  {
    path: '/student/projects/:id',
    element: React.lazy(() => import('@/pages/student/StudentProjectDetailPage')),
    meta: { title: 'Project', roles: ['student'] },
  },
  {
    path: '/student/projects/:id/edit',
    element: React.lazy(() => import('@/pages/student/StudentProjectFormPage')),
    meta: { title: 'Edit Project', roles: ['student'] },
  },

  // Student Exams
  {
    path: '/student/exams',
    element: React.lazy(() => import('@/pages/student/StudentExamsPage')),
    meta: { title: 'My Exams', roles: ['student'] },
  },
  {
    path: '/student/exams/:id/take',
    element: React.lazy(() => import('@/pages/student/StudentExamTakerPage')),
    meta: { title: 'Take Exam', roles: ['student'] },
  },

  // Student Classes
  {
    path: '/student/classes',
    element: React.lazy(() => import('@/pages/student/StudentClassesPage')),
    meta: { title: 'My Classes', roles: ['student'] },
  },

  // Parent Portal extensions
  {
    path: '/parent/assignments',
    element: React.lazy(() => import('@/pages/parent/ParentAssignmentsPage')),
    meta: { title: 'Assignments', roles: ['parent'] },
  },
  {
    path: '/parent/courses',
    element: React.lazy(() => import('@/pages/parent/ParentCoursesPage')),
    meta: { title: 'Courses', roles: ['parent'] },
  },
  {
    path: '/parent/projects',
    element: React.lazy(() => import('@/pages/parent/ParentProjectsPage')),
    meta: { title: 'Projects', roles: ['parent'] },
  },
  {
    path: '/parent/competitions',
    element: React.lazy(() => import('@/pages/parent/ParentCompetitionsPage')),
    meta: { title: 'Competitions', roles: ['parent'] },
  },
  {
    path: '/parent/certificates',
    element: React.lazy(() => import('@/pages/parent/ParentCertificatesPage')),
    meta: { title: 'Certificates', roles: ['parent'] },
  },

  // Innovation Marketplace
  {
    path: '/marketplace',
    element: React.lazy(() => import('@/pages/public/MarketplacePage')),
    meta: { title: 'Innovation Marketplace' },
  },

  // School Admin Dashboard
  {
    path: '/school',
    element: React.lazy(() => import('@/pages/school/SchoolDashboardPage')),
    meta: { title: 'School Dashboard', roles: ['school_admin', 'admin', 'super_admin'] },
  },

  // Robotics Lab
  {
    path: '/robotics/dashboard',
    element: React.lazy(() => import('@/pages/robotics/RoboticsOverviewPage')),
    meta: { title: 'Robotics Dashboard', roles: ['admin', 'super_admin', 'instructor', 'teacher', 'student'] },
  },
  {
    path: '/robotics/equipment',
    element: React.lazy(() => import('@/pages/robotics/RoboticsEquipmentPage')),
    meta: { title: 'Robotics Equipment', roles: ['admin', 'super_admin', 'instructor', 'teacher'] },
  },
  {
    path: '/robotics/equipment/:id',
    element: React.lazy(() => import('@/pages/robotics/RoboticsEquipmentDetailPage')),
    meta: { title: 'Robotics Equipment', roles: ['admin', 'super_admin', 'instructor', 'teacher'] },
  },
  {
    path: '/robotics/teams',
    element: React.lazy(() => import('@/pages/robotics/RoboticsTeamsPage')),
    meta: { title: 'Robotics Teams', roles: ['admin', 'super_admin', 'instructor', 'teacher', 'student'] },
  },
  {
    path: '/robotics/projects',
    element: React.lazy(() => import('@/pages/robotics/RoboticsProjectsPage')),
    meta: { title: 'Robotics Projects', roles: ['admin', 'super_admin', 'instructor', 'teacher', 'student'] },
  },
  {
    path: '/robotics/reservations',
    element: React.lazy(() => import('@/pages/robotics/RoboticsReservationsPage')),
    meta: { title: 'Robotics Reservations', roles: ['admin', 'super_admin', 'instructor', 'teacher', 'student'] },
  },
  {
    path: '/robotics/maintenance',
    element: React.lazy(() => import('@/pages/robotics/RoboticsMaintenancePage')),
    meta: { title: 'Robotics Maintenance', roles: ['admin', 'super_admin', 'instructor', 'teacher'] },
  },

  // Settings
  {
    path: '/settings/general',
    element: React.lazy(() => import('@/pages/settings/SettingsGeneralPage')),
    meta: { title: 'General Settings', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/settings/branding',
    element: React.lazy(() => import('@/pages/settings/SettingsBrandingPage')),
    meta: { title: 'Branding Settings', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/settings/localization',
    element: React.lazy(() => import('@/pages/settings/SettingsLocalizationPage')),
    meta: { title: 'Localization Settings', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/settings/academic',
    element: React.lazy(() => import('@/pages/settings/SettingsAcademicPage')),
    meta: { title: 'Academic Settings', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/settings/notifications',
    element: React.lazy(() => import('@/pages/settings/SettingsNotificationsPage')),
    meta: { title: 'Notification Settings', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/settings/integrations',
    element: React.lazy(() => import('@/pages/settings/SettingsIntegrationsPage')),
    meta: { title: 'Integration Settings', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/settings/security',
    element: React.lazy(() => import('@/pages/settings/SettingsSecurityPage')),
    meta: { title: 'Security Settings', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/settings/storage',
    element: React.lazy(() => import('@/pages/settings/SettingsStoragePage')),
    meta: { title: 'Storage Settings', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/settings/backup',
    element: React.lazy(() => import('@/pages/settings/SettingsBackupPage')),
    meta: { title: 'Backup Settings', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/settings/system',
    element: React.lazy(() => import('@/pages/settings/SettingsSystemPage')),
    meta: { title: 'System Settings', roles: ['admin', 'super_admin'] },
  },

  // Administration
  {
    path: '/admin',
    element: React.lazy(() => import('@/pages/admin/AdminOverviewPage')),
    meta: { title: 'Administration', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/admin/activity-logs',
    element: React.lazy(() => import('@/pages/admin/ActivityLogsPage')),
    meta: { title: 'Activity Logs', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/admin/audit-logs',
    element: React.lazy(() => import('@/pages/admin/AuditLogsPage')),
    meta: { title: 'Audit Logs', roles: ['admin', 'super_admin'] },
  },
  {
    path: '/admin/system-health',
    element: React.lazy(() => import('@/pages/admin/SystemHealthPage')),
    meta: { title: 'System Health', roles: ['super_admin'] },
  },
  {
    path: '/admin/backups',
    element: React.lazy(() => import('@/pages/admin/BackupsPage')),
    meta: { title: 'Backups', roles: ['super_admin'] },
  },
  {
    path: '/admin/system-logs',
    element: React.lazy(() => import('@/pages/admin/SystemLogsPage')),
    meta: { title: 'System Logs', roles: ['super_admin'] },
  },

  // 404
  {
    path: '*',
    element: React.lazy(() => import('@/pages/NotFoundPage')),
    meta: { title: 'Not Found', public: true },
  },
];
