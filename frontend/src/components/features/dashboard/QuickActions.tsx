import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  BookOpen,
  Megaphone,
  ClipboardList,
  FolderKanban,
  GraduationCap,
  Settings,
  BarChart3,
  FileText,
  Award,
  ClipboardCheck,
  CreditCard,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface QuickAction {
  label: string;
  icon: LucideIcon;
  href: string;
  color: string;
  bgColor: string;
}

const adminActions: QuickAction[] = [
  { label: 'Add Student', icon: UserPlus, href: '/students/create', color: 'text-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100' },
  { label: 'New Course', icon: BookOpen, href: '/courses/create', color: 'text-emerald-600', bgColor: 'bg-emerald-50 hover:bg-emerald-100' },
  { label: 'Announcement', icon: Megaphone, href: '/announcements/create', color: 'text-amber-600', bgColor: 'bg-amber-50 hover:bg-amber-100' },
  { label: 'Create Task', icon: ClipboardList, href: '/tasks/create', color: 'text-purple-600', bgColor: 'bg-purple-50 hover:bg-purple-100' },
  { label: 'Projects', icon: FolderKanban, href: '/projects', color: 'text-indigo-600', bgColor: 'bg-indigo-50 hover:bg-indigo-100' },
  { label: 'Reports', icon: BarChart3, href: '/reports', color: 'text-rose-600', bgColor: 'bg-rose-50 hover:bg-rose-100' },
];

const instructorActions: QuickAction[] = [
  { label: 'New Course', icon: BookOpen, href: '/courses/create', color: 'text-emerald-600', bgColor: 'bg-emerald-50 hover:bg-emerald-100' },
  { label: 'My Courses', icon: GraduationCap, href: '/courses', color: 'text-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100' },
  { label: 'Announcement', icon: Megaphone, href: '/announcements/create', color: 'text-amber-600', bgColor: 'bg-amber-50 hover:bg-amber-100' },
  { label: 'Settings', icon: Settings, href: '/settings', color: 'text-slate-600', bgColor: 'bg-slate-50 hover:bg-slate-100' },
];

const studentActions: QuickAction[] = [
  { label: 'My Courses', icon: GraduationCap, href: '/my-courses', color: 'text-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100' },
  { label: 'Assignments', icon: FileText, href: '/student/assignments', color: 'text-purple-600', bgColor: 'bg-purple-50 hover:bg-purple-100' },
  { label: 'Certificates', icon: Award, href: '/certificates', color: 'text-amber-600', bgColor: 'bg-amber-50 hover:bg-amber-100' },
  { label: 'Settings', icon: Settings, href: '/settings', color: 'text-slate-600', bgColor: 'bg-slate-50 hover:bg-slate-100' },
];

const parentActions: QuickAction[] = [
  { label: 'My Children', icon: Users, href: '/parent', color: 'text-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100' },
  { label: 'Attendance', icon: ClipboardCheck, href: '/parent/attendance', color: 'text-emerald-600', bgColor: 'bg-emerald-50 hover:bg-emerald-100' },
  { label: 'Fees', icon: CreditCard, href: '/parent/fees', color: 'text-red-600', bgColor: 'bg-red-50 hover:bg-red-100' },
  { label: 'Report Cards', icon: GraduationCap, href: '/parent/report-cards', color: 'text-purple-600', bgColor: 'bg-purple-50 hover:bg-purple-100' },
  { label: 'Settings', icon: Settings, href: '/settings', color: 'text-slate-600', bgColor: 'bg-slate-50 hover:bg-slate-100' },
];

interface QuickActionsProps {
  userRole?: string;
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const navigate = useNavigate();
  const role = userRole?.toLowerCase();
  const isAdmin = role === 'admin' || role === 'super_admin' || role === 'director' || role === 'branch_manager' || role === 'school_admin';
  const isStudent = role === 'student';
  const isParent = role === 'parent';

  let actions = instructorActions;
  if (isAdmin) actions = adminActions;
  else if (isStudent) actions = studentActions;
  else if (isParent) actions = parentActions;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-slate-500 mr-1">Quick Actions:</span>
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => navigate(action.href)}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150 ${action.bgColor} ${action.color} hover:shadow-sm active:scale-[0.97]`}
        >
          <action.icon className="h-4 w-4" />
          {action.label}
        </button>
      ))}
    </div>
  );
}
