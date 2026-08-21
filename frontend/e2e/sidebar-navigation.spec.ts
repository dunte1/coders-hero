import { test, expect } from '@playwright/test';

const ADMIN_SIDEBAR_LINKS: { label: string; href: string }[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Overview', href: '/organization/overview' },
  { label: 'Branches', href: '/organization/branches' },
  { label: 'Partner Schools', href: '/organization/partner-schools' },
  { label: 'Academic Years', href: '/organization/academic-years' },
  { label: 'Student Dashboard', href: '/students/overview' },
  { label: 'All Students', href: '/students' },
  { label: 'Admissions', href: '/admissions' },
  { label: 'Guardians', href: '/guardians' },
  { label: 'Attendance', href: '/attendance' },
  { label: 'Attendance Reports', href: '/attendance/report' },
  { label: 'Appointments', href: '/appointments' },
  { label: 'Teacher Dashboard', href: '/teacher' },
  { label: 'Classes', href: '/teacher/classes' },
  { label: 'Assignments', href: '/teacher/assignments' },
  { label: 'Exams', href: '/teacher/exams' },
  { label: 'Gradebook', href: '/teacher/gradebook' },
  { label: 'Lesson Notes', href: '/teacher/lesson-notes' },
  { label: 'Calendar', href: '/teacher/calendar' },
  { label: 'Performance', href: '/teacher/analytics' },
  { label: 'Reports', href: '/teacher/reports' },
  { label: 'Courses', href: '/courses' },
  { label: 'Enrollments', href: '/academics/enrollments' },
  { label: 'My Courses', href: '/my-courses' },
  { label: 'Quizzes', href: '/quizzes' },
  { label: 'Forum', href: '/lms/forum' },
  { label: 'Bookmarks', href: '/lms/bookmarks' },
  { label: 'AI Tutor', href: '/lms/ai-tutor' },
  { label: 'Playground', href: '/lms/playground' },
  { label: 'Challenges', href: '/lms/coding-exercises' },
  { label: 'Leaderboard', href: '/lms/coding-leaderboard' },
  { label: 'Overview', href: '/robotics/dashboard' },
  { label: 'Equipment', href: '/robotics/equipment' },
  { label: 'Teams', href: '/robotics/teams' },
  { label: 'Projects', href: '/robotics/projects' },
  { label: 'Reservations', href: '/robotics/reservations' },
  { label: 'Maintenance', href: '/robotics/maintenance' },
  { label: 'Competitions', href: '/competitions' },
  { label: 'My Teams', href: '/competitions/my-teams' },
  { label: 'Finance Dashboard', href: '/finance' },
  { label: 'Invoices', href: '/finance/invoices' },
  { label: 'Payments', href: '/finance/payments' },
  { label: 'Outstanding Fees', href: '/finance/outstanding' },
  { label: 'Transactions', href: '/finance/transactions' },
  { label: 'Inbox', href: '/notifications' },
  { label: 'Notification Preferences', href: '/notifications/preferences' },
  { label: 'Announcements', href: '/announcements' },
  { label: 'Messages', href: '/chat' },
  { label: 'Administration Home', href: '/admin' },
  { label: 'Users', href: '/users' },
  { label: 'Roles', href: '/settings/roles' },
  { label: 'Permissions', href: '/settings/permissions' },
  { label: 'Activity Logs', href: '/admin/activity-logs' },
  { label: 'Audit Logs', href: '/admin/audit-logs' },
  { label: 'Login History', href: '/settings/login-history' },
  { label: 'System Health', href: '/admin/system-health' },
  { label: 'Backups', href: '/admin/backups' },
  { label: 'System Logs', href: '/admin/system-logs' },
  { label: 'General', href: '/settings/general' },
  { label: 'Branding', href: '/settings/branding' },
  { label: 'Localization', href: '/settings/localization' },
  { label: 'Academic', href: '/settings/academic' },
  { label: 'Notifications', href: '/settings/notifications' },
  { label: 'Integrations', href: '/settings/integrations' },
  { label: 'Security', href: '/settings/security' },
  { label: 'Storage', href: '/settings/storage' },
  { label: 'Backup', href: '/settings/backup' },
  { label: 'System', href: '/settings/system' },
  { label: 'Profile', href: '/profile' },
  { label: 'Two-Factor Authentication', href: '/settings/two-factor' },
  { label: 'My Certificates', href: '/certificates' },
  { label: 'AI Dashboard', href: '/ai' },
  { label: 'My Usage', href: '/ai/usage' },
  { label: 'Site Content', href: '/cms/site-content' },
  { label: 'Services', href: '/cms/services' },
  { label: 'Programs', href: '/cms/programs' },
  { label: 'Gallery', href: '/cms/gallery' },
  { label: 'Testimonials', href: '/cms/testimonials' },
  { label: 'Blog', href: '/cms/blog' },
  { label: 'FAQs', href: '/cms/faqs' },
  { label: 'Contact Messages', href: '/cms/contact-messages' },
  { label: 'Chat Widget', href: '/cms/chat-widget' },
  { label: 'Analytics', href: '/cms/analytics' },
  { label: 'Executive Dashboard', href: '/analytics' },
  { label: 'Reports', href: '/reports' },
  { label: 'Tasks', href: '/tasks' },
  { label: 'Projects', href: '/projects' },
];

test.describe('Sidebar Navigation', () => {
  for (const link of ADMIN_SIDEBAR_LINKS) {
    test(`navigates to ${link.href} without errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          if (
            !text.includes('favicon') &&
            !text.includes('404') &&
            !text.includes('Failed to load resource') &&
            !text.includes('WebSocket') &&
            !text.includes('HMR') &&
            !text.includes('Download the React DevTools')
          ) {
            errors.push(text);
          }
        }
      });
      page.on('pageerror', (err) => errors.push('PAGE_ERROR: ' + err.message));

      await page.goto(link.href, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1500);

      const body = page.locator('body');
      const bodyText = await body.textContent();
      expect(bodyText).toBeTruthy();

      const criticalErrors = errors.filter(
        (e) => !e.includes('Warning:') && !e.includes('DevTools')
      );
      expect(criticalErrors).toHaveLength(0);
    });
  }
});
