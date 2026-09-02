import {
  Activity as ActivityIcon,
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Boxes,
  Briefcase,
  Building2,
  CalendarCheck,
  CheckSquare,
  ClipboardList,
  Code2,
  Coins,
  Cpu,
  CreditCard,
  Eye as EyeIcon,
  FileText,
  FolderKanban,
  Globe,
  GraduationCap,
  HelpCircle as HelpCircleIcon,
  History,
  IdCard,
  Image,
  KeyRound,
  LayoutDashboard,
  LayoutGrid as LayoutGridIcon,
  LayoutTemplate,
  Library,
  Mail,
  MapPin,
  Megaphone,
  MessageSquare,
  Newspaper,
  Package,
  Receipt,
  Save,
  Settings,
  Shield,
  ShoppingCart,
  Smartphone,
  Star,
  Target,
  Trophy,
  UserCheck,
  UserRound,
  Users,
  UsersRound,
  Wallet,
  Wrench,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavRole =
  | 'super_admin'
  | 'admin'
  | 'director'
  | 'branch_manager'
  | 'school_admin'
  | 'teacher'
  | 'instructor'
  | 'employee'
  | 'student'
  | 'parent'
  | 'judge'
  | 'hr_officer'
  | 'inventory_officer'
  | 'librarian'
  | 'accountant';

export interface NavEntry {
  label: string;
  href?: string;
  icon?: LucideIcon;
  roles?: NavRole[];
  permission?: string;
  children?: NavEntry[];
}

export const ALL_ROLES: NavRole[] = [
  'super_admin',
  'admin',
  'director',
  'branch_manager',
  'school_admin',
  'teacher',
  'instructor',
  'employee',
  'student',
  'parent',
  'judge',
  'hr_officer',
  'inventory_officer',
  'librarian',
  'accountant',
];

export const STAFF_ROLES: NavRole[] = [
  'super_admin',
  'admin',
  'director',
  'branch_manager',
  'school_admin',
  'teacher',
  'instructor',
  'employee',
  'hr_officer',
  'inventory_officer',
  'librarian',
  'accountant',
];

export const ADMIN_ROLES: NavRole[] = ['super_admin', 'admin', 'school_admin'];

const ACADEMICS_ROLES: NavRole[] = ['super_admin', 'admin', 'director', 'branch_manager', 'school_admin', 'teacher', 'instructor'];
const TEACHER_ROLES: NavRole[] = ['super_admin', 'admin', 'director', 'school_admin', 'teacher', 'instructor'];
const SIS_ROLES: NavRole[] = ['super_admin', 'admin', 'director', 'branch_manager', 'school_admin'];
const LEARNER_ROLES: NavRole[] = ['super_admin', 'admin', 'teacher', 'instructor', 'student', 'parent'];
const CODING_ROLES: NavRole[] = ['super_admin', 'admin', 'teacher', 'instructor', 'student'];
const ROBOTICS_ROLES: NavRole[] = ['super_admin', 'admin', 'teacher', 'instructor', 'student'];
const HR_ROLES: NavRole[] = ['super_admin', 'admin', 'hr_officer'];
const OVERSIGHT_ROLES: NavRole[] = ['super_admin', 'admin', 'director'];
const FINANCE_ADMIN_ROLES: NavRole[] = ['super_admin', 'admin', 'accountant'];
const ROBOTICS_MANAGE_ROLES: NavRole[] = ['super_admin', 'admin', 'teacher', 'instructor'];
const MESSAGING_ROLES: NavRole[] = ['parent', 'teacher', 'instructor', 'admin', 'super_admin'];
const INVENTORY_ROLES: NavRole[] = ['super_admin', 'admin', 'inventory_officer'];
const LIBRARY_MANAGE_ROLES: NavRole[] = ['super_admin', 'admin', 'librarian'];
const FINANCE_ROLES: NavRole[] = ['super_admin', 'admin', 'director', 'accountant', 'student', 'parent'];
const CMS_ROLES: NavRole[] = ['super_admin', 'admin'];
const CERT_MANAGE_ROLES: NavRole[] = ['super_admin', 'admin'];
const COMMUNICATION_ROLES: NavRole[] = [
  'super_admin', 'admin', 'director', 'branch_manager', 'school_admin',
  'teacher', 'instructor', 'employee', 'student', 'parent', 'judge',
  'hr_officer', 'inventory_officer', 'librarian', 'accountant',
];

export const navigation: NavEntry[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: COMMUNICATION_ROLES,
  },

  // Organization (Phase 3: Branch & Partner School management not yet implemented)
  {
    label: 'Organization',
    icon: Building2,
    roles: SIS_ROLES,
    children: [
      { label: 'School Dashboard', href: '/school', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'school_admin'] },
      { label: 'Overview', href: '/organization/overview', icon: LayoutDashboard },
      { label: 'Branches', href: '/organization/branches', icon: Building2 },
      { label: 'Partner Schools', href: '/organization/partner-schools', icon: GraduationCap },
      { label: 'Academic Years', href: '/organization/academic-years', icon: CalendarCheck },
      { label: 'Contracts', href: '/organization/contracts', icon: FileText, roles: OVERSIGHT_ROLES },
    ],
  },

  {
    label: 'Students',
    icon: UsersRound,
    roles: SIS_ROLES,
    children: [
      { label: 'Student Dashboard', href: '/students/overview', icon: LayoutDashboard },
      { label: 'All Students', href: '/students', icon: Users },
      { label: 'Admissions', href: '/admissions', icon: ClipboardList },
      { label: 'Guardians', href: '/guardians', icon: UserRound },
      { label: 'Attendance', href: '/attendance', icon: CalendarCheck },
      { label: 'Attendance Reports', href: '/attendance/report', icon: BarChart3 },
      { label: 'Appointments', href: '/appointments', icon: CalendarCheck },
    ],
  },

  {
    label: 'Parents',
    icon: Users,
    roles: ['parent'],
    children: [
      { label: 'Dashboard', href: '/parent', icon: LayoutDashboard },
      { label: 'Attendance', href: '/parent/attendance', icon: CalendarCheck },
      { label: 'Report Cards', href: '/parent/report-cards', icon: FileText },
      { label: 'Coding Progress', href: '/parent/progress', icon: Code2 },
      { label: 'Fees', href: '/parent/fees', icon: Wallet },
      { label: 'Receipts', href: '/parent/receipts', icon: Receipt },
      { label: 'Appointments', href: '/parent/appointments', icon: CalendarCheck },
      { label: 'Notifications', href: '/parent/notifications', icon: Bell },
      { label: 'Assignments', href: '/parent/assignments', icon: ClipboardList },
      { label: 'Courses', href: '/parent/courses', icon: BookOpen },
      { label: 'Projects', href: '/parent/projects', icon: FolderKanban },
      { label: 'Competitions', href: '/parent/competitions', icon: Trophy },
      { label: 'Certificates', href: '/parent/certificates', icon: Award },
      { label: 'Announcements', href: '/parent/announcements', icon: Megaphone },
    ],
  },

  {
    label: 'Teachers',
    icon: UserCheck,
    roles: TEACHER_ROLES,
    children: [
      { label: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
      { label: 'Classes', href: '/teacher/classes', icon: BookOpen },
      { label: 'Assignments', href: '/teacher/assignments', icon: ClipboardList },
      { label: 'Exams', href: '/teacher/exams', icon: FileText },
      { label: 'Gradebook', href: '/teacher/gradebook', icon: BarChart3 },
      { label: 'Lesson Notes', href: '/teacher/lesson-notes', icon: FileText },
      { label: 'Calendar', href: '/teacher/calendar', icon: CalendarCheck },
      { label: 'Performance', href: '/teacher/analytics', icon: BarChart3 },
      { label: 'Reports', href: '/teacher/reports', icon: FileText },
    ],
  },

  {
    label: 'Academics',
    icon: GraduationCap,
    roles: ACADEMICS_ROLES,
    children: [
      { label: 'Courses', href: '/courses', icon: BookOpen },
      { label: 'Enrollments', href: '/academics/enrollments', icon: UserRound, roles: ['super_admin', 'admin'] },
    ],
  },

  {
    label: 'Learning / LMS',
    icon: BookOpen,
    roles: LEARNER_ROLES,
    children: [
      { label: 'My Courses', href: '/my-courses', icon: GraduationCap },
      { label: 'My Classes', href: '/student/classes', icon: BookOpen, roles: ['student'] },
      { label: 'My Assignments', href: '/student/assignments', icon: ClipboardList, roles: ['student'] },
      { label: 'My Projects', href: '/student/projects', icon: FolderKanban, roles: ['student'] },
      { label: 'My Exams', href: '/student/exams', icon: FileText, roles: ['student'] },
      { label: 'My ID Card', href: '/my/id-card', icon: IdCard, roles: ['student'] },
      { label: 'My Progress', href: '/lms/analytics', icon: BarChart3, roles: ['student'] },
      { label: 'Quizzes', href: '/quizzes', icon: FileText },
      { label: 'Forum', href: '/lms/forum', icon: MessageSquare },
      { label: 'Bookmarks', href: '/lms/bookmarks', icon: BookOpen },
      { label: 'AI Tutor', href: '/lms/ai-tutor', icon: Bot },
      { label: 'Marketplace', href: '/marketplace', icon: Globe, roles: ['student'] },
    ],
  },

  {
    label: 'Coding Lab',
    icon: Code2,
    roles: CODING_ROLES,
    children: [
      { label: 'Playground', href: '/lms/playground', icon: Code2 },
      { label: 'Challenges', href: '/lms/coding-exercises', icon: CheckSquare },
      { label: 'Leaderboard', href: '/lms/coding-leaderboard', icon: Trophy },
    ],
  },

  {
    label: 'Coding Languages',
    href: '/admin/coding-languages',
    icon: Code2,
    roles: ['admin', 'super_admin'],
  },

  {
    label: 'Robotics Lab',
    icon: Cpu,
    roles: ROBOTICS_ROLES,
    children: [
      { label: 'Overview', href: '/robotics/dashboard', icon: LayoutDashboard },
      { label: 'Equipment', href: '/robotics/equipment', icon: Cpu, roles: ROBOTICS_MANAGE_ROLES },
      { label: 'Teams', href: '/robotics/teams', icon: Users },
      { label: 'Projects', href: '/robotics/projects', icon: FolderKanban },
      { label: 'Reservations', href: '/robotics/reservations', icon: CalendarCheck },
      { label: 'Maintenance', href: '/robotics/maintenance', icon: Wrench, roles: ROBOTICS_MANAGE_ROLES },
    ],
  },

  {
    label: 'Competitions',
    icon: Trophy,
    roles: ['super_admin', 'admin', 'teacher', 'instructor', 'student', 'judge'],
    children: [
      { label: 'Competitions', href: '/competitions', icon: Trophy },
      { label: 'My Teams', href: '/competitions/my-teams', icon: Users },
    ],
  },

  {
    label: 'Finance',
    icon: Wallet,
    roles: FINANCE_ROLES,
    children: [
      { label: 'Dashboard', href: '/finance', icon: LayoutDashboard, roles: FINANCE_ADMIN_ROLES },
      { label: 'Fee Structures', href: '/finance/fee-structures', icon: ClipboardList, permission: 'manage_fee_structures' },
      { label: 'Invoices', href: '/finance/invoices', icon: FileText, permission: 'manage_invoices' },
      { label: 'Payments', href: '/finance/payments', icon: Receipt, permission: 'record_payments' },
      { label: 'Expenses', href: '/finance/expenses', icon: XCircle, permission: 'manage_expenses' },
      { label: 'Budgets', href: '/finance/budgets', icon: BarChart3, permission: 'manage_budgets' },
      { label: 'M-Pesa', href: '/finance/mpesa', icon: Smartphone, permission: 'manage_mpesa' },
      { label: 'Outstanding Fees', href: '/finance/outstanding', icon: AlertTriangle, roles: FINANCE_ADMIN_ROLES },
      { label: 'Transactions', href: '/finance/transactions', icon: CreditCard, roles: FINANCE_ADMIN_ROLES },
      { label: 'My Finance', href: '/finance/mine', icon: Wallet, roles: ['student', 'parent'] },
    ],
  },

  {
    label: 'Human Resources',
    icon: Briefcase,
    roles: HR_ROLES,
    children: [
      { label: 'Dashboard', href: '/hr', icon: LayoutDashboard },
      { label: 'Employees', href: '/hr/employees', icon: Users },
      { label: 'Contracts', href: '/hr/contracts', icon: FileText, permission: 'manage_contracts' },
      { label: 'Leave', href: '/hr/leaves', icon: CalendarCheck, permission: 'manage_leave' },
      { label: 'Attendance', href: '/hr/attendance', icon: CalendarCheck, permission: 'manage_attendance' },
      { label: 'Payroll', href: '/hr/payrolls', icon: Wallet, permission: 'manage_payroll' },
      { label: 'Performance', href: '/hr/reviews', icon: Star, permission: 'manage_performance_reviews' },
      { label: 'Documents', href: '/hr/documents', icon: FileText, permission: 'manage_employee_documents' },
      { label: 'Reports', href: '/hr/reports', icon: BarChart3 },
    ],
  },

  {
    label: 'My HR',
    icon: UserCheck,
    roles: ['employee', 'super_admin', 'admin'],
    children: [
      { label: 'My Overview', href: '/my/hr', icon: LayoutDashboard },
      { label: 'My Leave', href: '/my/hr/leaves', icon: CalendarCheck },
      { label: 'My Payslips', href: '/my/hr/payslips', icon: Receipt },
    ],
  },

  {
    label: 'Inventory',
    icon: Boxes,
    roles: INVENTORY_ROLES,
    children: [
      { label: 'Dashboard', href: '/inventory', icon: LayoutDashboard },
      { label: 'Assets', href: '/inventory/assets', icon: Cpu, permission: 'manage_assets' },
      { label: 'Stock Items', href: '/inventory/items', icon: Package, permission: 'manage_inventory_items' },
      { label: 'Maintenance', href: '/inventory/maintenance', icon: Wrench, permission: 'manage_asset_maintenance' },
      { label: 'Categories', href: '/inventory/categories', icon: Boxes, permission: 'manage_asset_categories' },
      { label: 'Locations', href: '/inventory/locations', icon: MapPin, permission: 'manage_locations' },
      { label: 'Suppliers', href: '/inventory/suppliers', icon: Users },
      { label: 'Purchase Orders', href: '/inventory/purchase-orders', icon: ShoppingCart },
    ],
  },

  {
    label: 'Library',
    icon: Library,
    roles: ['super_admin', 'admin', 'teacher', 'instructor', 'student', 'parent', 'employee', 'librarian'],
    children: [
      { label: 'Catalog', href: '/library', icon: Library },
      { label: 'My Library', href: '/library/mine', icon: BookOpen },
      { label: 'Overview', href: '/library/admin', icon: LayoutDashboard, roles: LIBRARY_MANAGE_ROLES },
      { label: 'Resources', href: '/library/admin/resources', icon: FileText, roles: LIBRARY_MANAGE_ROLES, permission: 'manage_library_resources' },
      { label: 'Borrowings', href: '/library/admin/borrowings', icon: BookOpen, roles: LIBRARY_MANAGE_ROLES, permission: 'manage_library_borrowings' },
      { label: 'Reservations', href: '/library/admin/reservations', icon: CalendarCheck, roles: LIBRARY_MANAGE_ROLES, permission: 'manage_library_reservations' },
      { label: 'Categories', href: '/library/admin/categories', icon: BookOpen, roles: LIBRARY_MANAGE_ROLES, permission: 'manage_library_categories' },
      { label: 'Authors', href: '/library/admin/authors', icon: Users, roles: LIBRARY_MANAGE_ROLES, permission: 'manage_library_authors' },
    ],
  },

  {
    label: 'Certificates',
    icon: Award,
    roles: ['super_admin', 'admin', 'teacher', 'instructor', 'student', 'employee'],
    children: [
      { label: 'My Certificates', href: '/certificates', icon: Award },
      { label: 'Overview', href: '/admin/certificates', icon: LayoutDashboard, roles: CERT_MANAGE_ROLES },
      { label: 'All Certificates', href: '/admin/certificates/all', icon: FileText, roles: CERT_MANAGE_ROLES },
      { label: 'Templates', href: '/admin/certificates/templates', icon: LayoutTemplate, roles: CERT_MANAGE_ROLES },
      { label: 'Verifications', href: '/admin/certificates/verifications', icon: EyeIcon, roles: CERT_MANAGE_ROLES },
    ],
  },

  {
    label: 'AI Platform',
    icon: Bot,
    roles: COMMUNICATION_ROLES,
    children: [
      { label: 'AI Dashboard', href: '/ai', icon: Bot },
      { label: 'My Usage', href: '/ai/usage', icon: Coins },
      { label: 'Administration', href: '/admin/ai', icon: Settings, roles: ADMIN_ROLES },
    ],
  },

  {
    label: 'Website / CMS',
    icon: Globe,
    roles: CMS_ROLES,
    children: [
      { label: 'Site Content', href: '/cms/site-content', icon: Globe },
      { label: 'Services', href: '/cms/services', icon: LayoutGridIcon },
      { label: 'Programs', href: '/cms/programs', icon: GraduationCap },
      { label: 'Gallery', href: '/cms/gallery', icon: Image },
      { label: 'Testimonials', href: '/cms/testimonials', icon: Star },
      { label: 'Blog', href: '/cms/blog', icon: Newspaper },
      { label: 'FAQs', href: '/cms/faqs', icon: HelpCircleIcon },
      { label: 'Contact Messages', href: '/cms/contact-messages', icon: Mail },
      { label: 'Chat Widget', href: '/cms/chat-widget', icon: MessageSquare },
      { label: 'Popups', href: '/cms/popups', icon: Megaphone },
      { label: 'Careers / Jobs', href: '/cms/jobs', icon: Briefcase },
      { label: 'Job Applications', href: '/cms/jobs/applications', icon: ClipboardList },
      { label: 'Analytics', href: '/cms/analytics', icon: BarChart3 },
    ],
  },

  {
    label: 'Communication',
    icon: MessageSquare,
    roles: COMMUNICATION_ROLES,
    children: [
      { label: 'Inbox', href: '/notifications', icon: Bell },
      { label: 'Notification Preferences', href: '/notifications/preferences', icon: Settings },
      { label: 'Announcements', href: '/announcements', icon: Bell },
      { label: 'Messages', href: '/chat', icon: MessageSquare, roles: MESSAGING_ROLES },
      { label: 'Administration', href: '/admin/notifications', icon: LayoutTemplate, roles: ADMIN_ROLES },
      { label: 'Templates', href: '/admin/notifications/templates', icon: FileText, roles: ADMIN_ROLES },
    ],
  },

  {
    label: 'Project Management',
    icon: FolderKanban,
    roles: ['super_admin', 'admin', 'employee'],
    children: [
      { label: 'Tasks', href: '/tasks', icon: CheckSquare },
      { label: 'Projects', href: '/projects', icon: FolderKanban },
    ],
  },

  {
    label: 'CRM',
    href: '/crm/leads',
    icon: Target,
    roles: OVERSIGHT_ROLES,
  },

  {
    label: 'Reports & Analytics',
    icon: BarChart3,
    roles: ['super_admin', 'admin', 'director', 'branch_manager', 'school_admin', 'accountant'],
    children: [
      { label: 'Executive Dashboard', href: '/analytics', icon: BarChart3 },
      { label: 'Reports', href: '/reports', icon: FileText },
    ],
  },

  {
    label: 'Administration',
    icon: Shield,
    roles: ADMIN_ROLES,
    children: [
      { label: 'Administration Home', href: '/admin', icon: LayoutDashboard },
      { label: 'Users', href: '/users', icon: Users, permission: 'view_users' },
      { label: 'Roles', href: '/settings/roles', icon: Shield, permission: 'view_roles' },
      { label: 'Permissions', href: '/settings/permissions', icon: KeyRound, permission: 'view_permissions' },
      { label: 'Activity Logs', href: '/admin/activity-logs', icon: History },
      { label: 'Audit Logs', href: '/admin/audit-logs', icon: History },
      { label: 'Login History', href: '/settings/login-history', icon: KeyRound },
      { label: 'System Health', href: '/admin/system-health', icon: ActivityIcon, roles: ['super_admin'] },
      { label: 'Backups', href: '/admin/backups', icon: Save, roles: ['super_admin'] },
      { label: 'System Logs', href: '/admin/system-logs', icon: FileText, roles: ['super_admin'] },
    ],
  },

  {
    label: 'Support',
    icon: HelpCircleIcon,
    roles: ['student', 'teacher', 'instructor', 'employee', 'parent', 'admin', 'super_admin'],
    children: [
      { label: 'Help & Support', href: '/support', icon: HelpCircleIcon },
    ],
  },

  {
    label: 'Settings',
    icon: Settings,
    roles: COMMUNICATION_ROLES,
    children: [
      { label: 'General', href: '/settings/general', icon: Settings, roles: ADMIN_ROLES },
      { label: 'Branding', href: '/settings/branding', icon: Image, roles: ADMIN_ROLES },
      { label: 'Localization', href: '/settings/localization', icon: Globe, roles: ADMIN_ROLES },
      { label: 'Academic', href: '/settings/academic', icon: GraduationCap, roles: ADMIN_ROLES },
      { label: 'Notifications', href: '/settings/notifications', icon: Bell, roles: ADMIN_ROLES },
      { label: 'Integrations', href: '/settings/integrations', icon: KeyRound, roles: ADMIN_ROLES },
      { label: 'Security', href: '/settings/security', icon: Shield, roles: ADMIN_ROLES },
      { label: 'Storage', href: '/settings/storage', icon: Save, roles: ADMIN_ROLES },
      { label: 'Backup', href: '/settings/backup', icon: Save, roles: ADMIN_ROLES },
      { label: 'System', href: '/settings/system', icon: ActivityIcon, roles: ADMIN_ROLES },
      { label: 'Profile', href: '/profile', icon: UserRound },
      { label: 'Two-Factor Authentication', href: '/settings/two-factor', icon: KeyRound },
    ],
  },
];
