<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'users' => [
                ['name' => 'view_users', 'display_name' => 'View Users', 'description' => 'View user list and profiles.'],
                ['name' => 'create_users', 'display_name' => 'Create Users', 'description' => 'Create new user accounts.'],
                ['name' => 'update_users', 'display_name' => 'Update Users', 'description' => 'Edit user profiles and details.'],
                ['name' => 'delete_users', 'display_name' => 'Delete Users', 'description' => 'Delete user accounts.'],
                ['name' => 'reset_passwords', 'display_name' => 'Reset Passwords', 'description' => 'Set or reset other users account passwords.'],
            ],
            'courses' => [
                ['name' => 'view_courses', 'display_name' => 'View Courses', 'description' => 'View course listings.'],
                ['name' => 'create_courses', 'display_name' => 'Create Courses', 'description' => 'Create new courses.'],
                ['name' => 'update_courses', 'display_name' => 'Update Courses', 'description' => 'Edit course details.'],
                ['name' => 'delete_courses', 'display_name' => 'Delete Courses', 'description' => 'Delete courses.'],
                ['name' => 'publish_courses', 'display_name' => 'Publish Courses', 'description' => 'Publish and unpublish courses.'],
            ],
            'enrollments' => [
                ['name' => 'view_enrollments', 'display_name' => 'View Enrollments', 'description' => 'View enrollment records.'],
                ['name' => 'create_enrollments', 'display_name' => 'Create Enrollments', 'description' => 'Enroll in courses.'],
                ['name' => 'cancel_enrollments', 'display_name' => 'Cancel Enrollments', 'description' => 'Cancel course enrollments.'],
            ],
            'tasks' => [
                ['name' => 'view_tasks', 'display_name' => 'View Tasks', 'description' => 'View tasks.'],
                ['name' => 'create_tasks', 'display_name' => 'Create Tasks', 'description' => 'Create new tasks.'],
                ['name' => 'update_tasks', 'display_name' => 'Update Tasks', 'description' => 'Edit task details.'],
                ['name' => 'delete_tasks', 'display_name' => 'Delete Tasks', 'description' => 'Delete tasks.'],
                ['name' => 'assign_tasks', 'display_name' => 'Assign Tasks', 'description' => 'Assign tasks to users.'],
            ],
            'projects' => [
                ['name' => 'view_projects', 'display_name' => 'View Projects', 'description' => 'View project listings.'],
                ['name' => 'create_projects', 'display_name' => 'Create Projects', 'description' => 'Create new projects.'],
                ['name' => 'update_projects', 'display_name' => 'Update Projects', 'description' => 'Edit project details.'],
                ['name' => 'delete_projects', 'display_name' => 'Delete Projects', 'description' => 'Delete projects.'],
                ['name' => 'manage_project_members', 'display_name' => 'Manage Project Members', 'description' => 'Add and remove project members.'],
            ],
            'employees' => [
                ['name' => 'view_employees', 'display_name' => 'View Employees', 'description' => 'View employee directory.'],
                ['name' => 'create_employees', 'display_name' => 'Create Employees', 'description' => 'Add new employees.'],
                ['name' => 'update_employees', 'display_name' => 'Update Employees', 'description' => 'Edit employee details.'],
                ['name' => 'delete_employees', 'display_name' => 'Delete Employees', 'description' => 'Remove employees.'],
                ['name' => 'onboard_employees', 'display_name' => 'Onboard Employees', 'description' => 'Onboard new employees.'],
                ['name' => 'offboard_employees', 'display_name' => 'Offboard Employees', 'description' => 'Offboard departing employees.'],
            ],
            'departments' => [
                ['name' => 'view_departments', 'display_name' => 'View Departments', 'description' => 'View department listings.'],
                ['name' => 'create_departments', 'display_name' => 'Create Departments', 'description' => 'Create new departments.'],
                ['name' => 'update_departments', 'display_name' => 'Update Departments', 'description' => 'Edit department details.'],
                ['name' => 'delete_departments', 'display_name' => 'Delete Departments', 'description' => 'Delete departments.'],
            ],
            'quizzes' => [
                ['name' => 'view_quizzes', 'display_name' => 'View Quizzes', 'description' => 'View quizzes.'],
                ['name' => 'create_quizzes', 'display_name' => 'Create Quizzes', 'description' => 'Create new quizzes.'],
                ['name' => 'update_quizzes', 'display_name' => 'Update Quizzes', 'description' => 'Edit quiz details.'],
                ['name' => 'delete_quizzes', 'display_name' => 'Delete Quizzes', 'description' => 'Delete quizzes.'],
                ['name' => 'attempt_quizzes', 'display_name' => 'Attempt Quizzes', 'description' => 'Take quizzes.'],
            ],
            'announcements' => [
                ['name' => 'view_announcements', 'display_name' => 'View Announcements', 'description' => 'View announcements.'],
                ['name' => 'create_announcements', 'display_name' => 'Create Announcements', 'description' => 'Create announcements.'],
                ['name' => 'update_announcements', 'display_name' => 'Update Announcements', 'description' => 'Edit announcements.'],
                ['name' => 'delete_announcements', 'display_name' => 'Delete Announcements', 'description' => 'Delete announcements.'],
            ],
            'reports' => [
                ['name' => 'view_reports', 'display_name' => 'View Reports', 'description' => 'View system reports.'],
                ['name' => 'export_reports', 'display_name' => 'Export Reports', 'description' => 'Export report data.'],
            ],
            'analytics' => [
                ['name' => 'view_analytics', 'display_name' => 'View Analytics', 'description' => 'View the analytics dashboard and insights.'],
                ['name' => 'export_analytics', 'display_name' => 'Export Analytics', 'description' => 'Export analytics data.'],
            ],
            'ai_platform' => [
                ['name' => 'use_ai_assistants', 'display_name' => 'Use AI Assistants', 'description' => 'Chat with AI assistants and use generation tools.'],
                ['name' => 'manage_ai_assistants', 'display_name' => 'Manage AI Assistants', 'description' => 'Create, edit and disable AI assistants.'],
                ['name' => 'manage_ai_prompt_templates', 'display_name' => 'Manage Prompt Templates', 'description' => 'Create, edit and delete AI prompt templates.'],
                ['name' => 'view_ai_usage', 'display_name' => 'View AI Usage', 'description' => 'View AI usage, token and cost analytics.'],
            ],
            'dashboard' => [
                ['name' => 'view_dashboard', 'display_name' => 'View Dashboard', 'description' => 'View personal dashboard.'],
                ['name' => 'view_admin_dashboard', 'display_name' => 'View Admin Dashboard', 'description' => 'View admin dashboard.'],
                ['name' => 'view_instructor_dashboard', 'display_name' => 'View Instructor Dashboard', 'description' => 'View instructor dashboard.'],
            ],
            'robotics' => [
                ['name' => 'view_robotics_lab', 'display_name' => 'View Robotics Lab', 'description' => 'View robotics laboratory pages.'],
                ['name' => 'view_robotics_equipment', 'display_name' => 'View Robotics Equipment', 'description' => 'View robotics equipment inventory.'],
                ['name' => 'create_robotics_equipment', 'display_name' => 'Create Robotics Equipment', 'description' => 'Add equipment to inventory.'],
                ['name' => 'update_robotics_equipment', 'display_name' => 'Update Robotics Equipment', 'description' => 'Edit equipment details.'],
                ['name' => 'delete_robotics_equipment', 'display_name' => 'Delete Robotics Equipment', 'description' => 'Remove equipment from inventory.'],
                ['name' => 'assign_robotics_equipment', 'display_name' => 'Assign Robotics Equipment', 'description' => 'Assign equipment to students or teams.'],
                ['name' => 'return_robotics_equipment', 'display_name' => 'Return Robotics Equipment', 'description' => 'Process equipment returns.'],
                ['name' => 'approve_robotics_reservations', 'display_name' => 'Approve Robotics Reservations', 'description' => 'Approve or reject equipment reservations.'],
                ['name' => 'manage_robotics_maintenance', 'display_name' => 'Manage Robotics Maintenance', 'description' => 'Create and resolve maintenance records.'],
                ['name' => 'manage_robotics_teams', 'display_name' => 'Manage Robotics Teams', 'description' => 'Create and manage robotics teams.'],
                ['name' => 'review_robotics_projects', 'display_name' => 'Review Robotics Projects', 'description' => 'Review and score project submissions.'],
            ],
            'competitions' => [
                ['name' => 'view_competitions', 'display_name' => 'View Competitions', 'description' => 'View competitions and details.'],
                ['name' => 'register_for_competitions', 'display_name' => 'Register for Competitions', 'description' => 'Register teams for competitions.'],
                ['name' => 'create_competitions', 'display_name' => 'Create Competitions', 'description' => 'Create new competitions.'],
                ['name' => 'update_competitions', 'display_name' => 'Update Competitions', 'description' => 'Edit competition details.'],
                ['name' => 'delete_competitions', 'display_name' => 'Delete Competitions', 'description' => 'Delete competitions.'],
                ['name' => 'manage_competition_criteria', 'display_name' => 'Manage Competition Criteria', 'description' => 'Add and update judging criteria.'],
                ['name' => 'manage_competition_judges', 'display_name' => 'Manage Competition Judges', 'description' => 'Assign and remove judges.'],
                ['name' => 'manage_competition_teams', 'display_name' => 'Manage Competition Teams', 'description' => 'Disqualify teams and manage registrations.'],
                ['name' => 'verify_competition_scores', 'display_name' => 'Verify Competition Scores', 'description' => 'Verify submitted judging scores.'],
                ['name' => 'score_competitions', 'display_name' => 'Score Competitions', 'description' => 'Submit scores for assigned competitions.'],
                ['name' => 'view_competition_leaderboard', 'display_name' => 'View Competition Leaderboard', 'description' => 'View competition leaderboards.'],
                ['name' => 'view_competition_results', 'display_name' => 'View Competition Results', 'description' => 'View final competition results.'],
            ],
            'settings' => [
                ['name' => 'view_settings', 'display_name' => 'View Settings', 'description' => 'View system settings.'],
                ['name' => 'update_settings', 'display_name' => 'Update Settings', 'description' => 'Update system settings.'],
            ],
            'students' => [
                ['name' => 'view_students', 'display_name' => 'View Students', 'description' => 'View student records.'],
                ['name' => 'create_students', 'display_name' => 'Create Students', 'description' => 'Create new student records.'],
                ['name' => 'update_students', 'display_name' => 'Update Students', 'description' => 'Edit student records.'],
                ['name' => 'delete_students', 'display_name' => 'Delete Students', 'description' => 'Delete student records.'],
            ],
            'guardians' => [
                ['name' => 'view_guardians', 'display_name' => 'View Guardians', 'description' => 'View guardian records.'],
                ['name' => 'create_guardians', 'display_name' => 'Create Guardians', 'description' => 'Create new guardian records.'],
                ['name' => 'update_guardians', 'display_name' => 'Update Guardians', 'description' => 'Edit guardian records.'],
                ['name' => 'delete_guardians', 'display_name' => 'Delete Guardians', 'description' => 'Delete guardian records.'],
            ],
            'admissions' => [
                ['name' => 'view_admissions', 'display_name' => 'View Admissions', 'description' => 'View admission records.'],
                ['name' => 'create_admissions', 'display_name' => 'Create Admissions', 'description' => 'Create new admission records.'],
                ['name' => 'update_admissions', 'display_name' => 'Update Admissions', 'description' => 'Edit admission records.'],
                ['name' => 'delete_admissions', 'display_name' => 'Delete Admissions', 'description' => 'Delete admission records.'],
            ],
            'student_documents' => [
                ['name' => 'view_student_documents', 'display_name' => 'View Student Documents', 'description' => 'View student documents.'],
                ['name' => 'upload_student_documents', 'display_name' => 'Upload Student Documents', 'description' => 'Upload student documents.'],
                ['name' => 'delete_student_documents', 'display_name' => 'Delete Student Documents', 'description' => 'Delete student documents.'],
            ],
            'roles_management' => [
                ['name' => 'view_roles', 'display_name' => 'View Roles', 'description' => 'View role list.'],
                ['name' => 'create_roles', 'display_name' => 'Create Roles', 'description' => 'Create new roles.'],
                ['name' => 'update_roles', 'display_name' => 'Update Roles', 'description' => 'Edit roles.'],
                ['name' => 'delete_roles', 'display_name' => 'Delete Roles', 'description' => 'Delete roles.'],
                ['name' => 'view_permissions', 'display_name' => 'View Permissions', 'description' => 'View permission list.'],
            ],
            'finance' => [
                ['name' => 'view_finance', 'display_name' => 'View Finance', 'description' => 'View financial reports and records.'],
                ['name' => 'manage_fee_structures', 'display_name' => 'Manage Fee Structures', 'description' => 'Create, edit and delete fee structures.'],
                ['name' => 'manage_invoices', 'display_name' => 'Manage Invoices', 'description' => 'Create, issue, void and generate invoices.'],
                ['name' => 'record_payments', 'display_name' => 'Record Payments', 'description' => 'Record payments and issue receipts.'],
                ['name' => 'reverse_payments', 'display_name' => 'Reverse Payments', 'description' => 'Reverse incorrectly recorded payments.'],
                ['name' => 'manage_expenses', 'display_name' => 'Manage Expenses', 'description' => 'Record and manage expenses.'],
                ['name' => 'manage_budgets', 'display_name' => 'Manage Budgets', 'description' => 'Create and manage budgets.'],
                ['name' => 'manage_mpesa', 'display_name' => 'Manage M-Pesa', 'description' => 'Initiate STK push and reconcile M-Pesa transactions.'],
            ],
            'hr' => [
                ['name' => 'view_hr', 'display_name' => 'View HR', 'description' => 'View HR overview and reports.'],
                ['name' => 'manage_contracts', 'display_name' => 'Manage Contracts', 'description' => 'Create, edit and terminate employee contracts.'],
                ['name' => 'manage_leave', 'display_name' => 'Manage Leave', 'description' => 'Approve and reject leave requests.'],
                ['name' => 'manage_attendance', 'display_name' => 'Manage Attendance', 'description' => 'Record and manage staff attendance.'],
                ['name' => 'manage_payroll', 'display_name' => 'Manage Payroll', 'description' => 'Run and manage payroll and payslips.'],
                ['name' => 'manage_performance_reviews', 'display_name' => 'Manage Performance Reviews', 'description' => 'Create and manage performance reviews.'],
                ['name' => 'manage_employee_documents', 'display_name' => 'Manage Employee Documents', 'description' => 'Upload and manage employee documents.'],
                ['name' => 'request_leave', 'display_name' => 'Request Leave', 'description' => 'Submit and cancel own leave requests.'],
                ['name' => 'view_own_payslips', 'display_name' => 'View Own Payslips', 'description' => 'View personal payslips.'],
                ['name' => 'view_own_attendance', 'display_name' => 'View Own Attendance', 'description' => 'View personal attendance records.'],
            ],
            'inventory' => [
                ['name' => 'view_inventory', 'display_name' => 'View Inventory', 'description' => 'View inventory overview, assets, stock and reports.'],
                ['name' => 'manage_asset_categories', 'display_name' => 'Manage Asset Categories', 'description' => 'Create, edit and delete asset categories.'],
                ['name' => 'manage_locations', 'display_name' => 'Manage Locations', 'description' => 'Create, edit and delete storage locations.'],
                ['name' => 'manage_assets', 'display_name' => 'Manage Assets', 'description' => 'Create, edit and delete tracked assets.'],
                ['name' => 'assign_assets', 'display_name' => 'Assign Assets', 'description' => 'Check assets out, check them back in and dispose of them.'],
                ['name' => 'manage_asset_maintenance', 'display_name' => 'Manage Asset Maintenance', 'description' => 'Create and resolve asset maintenance records.'],
                ['name' => 'manage_inventory_items', 'display_name' => 'Manage Stock Items', 'description' => 'Create, edit and delete stock items.'],
                ['name' => 'record_stock_movements', 'display_name' => 'Record Stock Movements', 'description' => 'Record stock in, out and adjustment movements.'],
            ],
            'library' => [
                ['name' => 'view_library', 'display_name' => 'View Library', 'description' => 'Browse the digital library catalog and read resources.'],
                ['name' => 'manage_library_resources', 'display_name' => 'Manage Library Resources', 'description' => 'Create, edit and delete library resources.'],
                ['name' => 'manage_library_categories', 'display_name' => 'Manage Library Categories', 'description' => 'Create, edit and delete library categories.'],
                ['name' => 'manage_library_authors', 'display_name' => 'Manage Library Authors', 'description' => 'Create, edit and delete library authors.'],
                ['name' => 'manage_library_borrowings', 'display_name' => 'Manage Borrowings', 'description' => 'View and manage resource borrowings.'],
                ['name' => 'manage_library_reservations', 'display_name' => 'Manage Reservations', 'description' => 'View and manage resource reservations.'],
                ['name' => 'library_download', 'display_name' => 'Download Resources', 'description' => 'Download library resources when download is allowed.'],
            ],
            'certificates' => [
                ['name' => 'view_certificates', 'display_name' => 'View Certificates', 'description' => 'View own and system certificates.'],
                ['name' => 'generate_certificates', 'display_name' => 'Generate Certificates', 'description' => 'Generate course certificates.'],
                ['name' => 'manage_certificate_templates', 'display_name' => 'Manage Certificate Templates', 'description' => 'Create, edit and delete certificate templates.'],
                ['name' => 'issue_certificates', 'display_name' => 'Issue Certificates', 'description' => 'Issue and bulk-generate certificates.'],
                ['name' => 'revoke_certificates', 'display_name' => 'Revoke Certificates', 'description' => 'Revoke and reinstate certificates.'],
                ['name' => 'verify_certificates', 'display_name' => 'Verify Certificates', 'description' => 'Verify certificates and view verification history.'],
            ],
            'notifications' => [
                ['name' => 'view_notifications', 'display_name' => 'View Notifications', 'description' => 'View own in-app notifications.'],
                ['name' => 'manage_notification_preferences', 'display_name' => 'Manage Notification Preferences', 'description' => 'Configure personal notification channel preferences.'],
                ['name' => 'manage_notification_templates', 'display_name' => 'Manage Notification Templates', 'description' => 'Create, edit and delete notification templates.'],
                ['name' => 'broadcast_notifications', 'display_name' => 'Broadcast Notifications', 'description' => 'Send notifications to users or roles.'],
                ['name' => 'view_notification_deliveries', 'display_name' => 'View Notification Deliveries', 'description' => 'View delivery logs, statuses and retry failures.'],
                ['name' => 'manage_push_tokens', 'display_name' => 'Manage Push Tokens', 'description' => 'Register and revoke push notification devices.'],
            ],
            'website' => [
                ['name' => 'manage_blog_posts', 'display_name' => 'Manage Blog Posts', 'description' => 'Create, edit, publish and delete blog posts.'],
                ['name' => 'manage_gallery_items', 'display_name' => 'Manage Gallery', 'description' => 'Upload, edit and remove gallery items.'],
                ['name' => 'manage_testimonials', 'display_name' => 'Manage Testimonials', 'description' => 'Create, edit and delete testimonials.'],
                ['name' => 'manage_faqs', 'display_name' => 'Manage FAQs', 'description' => 'Create, edit and delete frequently asked questions.'],
                ['name' => 'manage_programs_services', 'display_name' => 'Manage Programs & Services', 'description' => 'Create, edit and delete public programs and services.'],
                ['name' => 'manage_partner_schools', 'display_name' => 'Manage Partner Schools', 'description' => 'Create, edit and remove partner schools.'],
                ['name' => 'manage_site_content', 'display_name' => 'Manage Site Content', 'description' => 'Edit public website sections and content blocks.'],
                ['name' => 'manage_contact_messages', 'display_name' => 'Manage Contact Messages', 'description' => 'View, reply to and archive contact form messages.'],
                ['name' => 'manage_chat_widget', 'display_name' => 'Manage Chat Widget', 'description' => 'Configure the website chat widget settings.'],
                ['name' => 'manage_popup_ads', 'display_name' => 'Manage Popup Ads', 'description' => 'Configure the website popup announcement/ad.'],
                ['name' => 'manage_events', 'display_name' => 'Manage Events', 'description' => 'Create, edit and publish events.'],
                ['name' => 'view_website_analytics', 'display_name' => 'View Website Analytics', 'description' => 'View public website traffic analytics.'],
            ],
            'system_operations' => [
                ['name' => 'view_system_logs', 'display_name' => 'View System Logs', 'description' => 'View application system logs.'],
                ['name' => 'view_audit_logs', 'display_name' => 'View Audit Logs', 'description' => 'View audit trail of user actions.'],
                ['name' => 'view_system_health', 'display_name' => 'View System Health', 'description' => 'View system health checks and diagnostics.'],
                ['name' => 'manage_backups', 'display_name' => 'Manage Backups', 'description' => 'Create, download and delete backups.'],
                ['name' => 'restore_backups', 'display_name' => 'Restore Backups', 'description' => 'Restore the system from a backup.'],
                ['name' => 'toggle_maintenance_mode', 'display_name' => 'Toggle Maintenance Mode', 'description' => 'Enable or disable application maintenance mode.'],
                ['name' => 'view_login_history', 'display_name' => 'View Login History', 'description' => 'View user login history and sessions.'],
            ],
            'lms' => [
                ['name' => 'access_lms', 'display_name' => 'Access LMS', 'description' => 'Access the learning management system features.'],
                ['name' => 'manage_coding_exercises', 'display_name' => 'Manage Coding Exercises', 'description' => 'Create and manage coding exercises and playground content.'],
                ['name' => 'manage_forums', 'display_name' => 'Manage Forums', 'description' => 'Moderate forum threads and posts.'],
                ['name' => 'manage_gamification', 'display_name' => 'Manage Gamification', 'description' => 'Manage badges, streaks and points configuration.'],
            ],
            'appointments' => [
                ['name' => 'view_appointments', 'display_name' => 'View Appointments', 'description' => 'View appointment bookings.'],
                ['name' => 'manage_appointments', 'display_name' => 'Manage Appointments', 'description' => 'Confirm, reschedule and cancel appointments.'],
            ],
            'organization' => [
                ['name' => 'manage_branches', 'display_name' => 'Manage Branches', 'description' => 'Create, edit and deactivate branches.'],
                ['name' => 'manage_academic_years', 'display_name' => 'Manage Academic Years', 'description' => 'Create and manage academic years and terms.'],
            ],
            'academics' => [
                ['name' => 'view_student_attendance', 'display_name' => 'View Student Attendance', 'description' => 'View student attendance records and reports.'],
                ['name' => 'manage_student_attendance', 'display_name' => 'Manage Student Attendance', 'description' => 'Record and edit student attendance.'],
                ['name' => 'manage_exams', 'display_name' => 'Manage Exams', 'description' => 'Create, schedule and grade exams.'],
                ['name' => 'manage_gradebook', 'display_name' => 'Manage Gradebook', 'description' => 'Record and update student grades.'],
                ['name' => 'manage_assignments', 'display_name' => 'Manage Assignments', 'description' => 'Create assignments and grade submissions.'],
                ['name' => 'manage_report_cards', 'display_name' => 'Manage Report Cards', 'description' => 'Generate and publish student report cards.'],
            ],
            'student_projects' => [
                ['name' => 'view_student_projects', 'display_name' => 'View Student Projects', 'description' => 'View student project listings.'],
                ['name' => 'create_student_projects', 'display_name' => 'Create Student Projects', 'description' => 'Create new student projects.'],
                ['name' => 'update_student_projects', 'display_name' => 'Update Student Projects', 'description' => 'Edit student project details.'],
                ['name' => 'delete_student_projects', 'display_name' => 'Delete Student Projects', 'description' => 'Delete student projects.'],
                ['name' => 'publish_student_projects', 'display_name' => 'Publish Student Projects', 'description' => 'Publish and unpublish student projects.'],
                ['name' => 'review_student_projects', 'display_name' => 'Review Student Projects', 'description' => 'Review and score student projects.'],
                ['name' => 'view_public_projects', 'display_name' => 'View Public Projects', 'description' => 'View publicly published student projects.'],
            ],
            'student_exams' => [
                ['name' => 'view_available_exams', 'display_name' => 'View Available Exams', 'description' => 'View available exams for enrollment.'],
                ['name' => 'take_exams', 'display_name' => 'Take Exams', 'description' => 'Start and submit exam attempts.'],
                ['name' => 'view_exam_results', 'display_name' => 'View Exam Results', 'description' => 'View own exam results and attempts.'],
            ],
            'id_cards' => [
                ['name' => 'generate_id_cards', 'display_name' => 'Generate ID Cards', 'description' => 'Generate student and staff ID cards.'],
            ],
        ];

        foreach ($permissions as $group => $items) {
            foreach ($items as $permission) {
                Permission::updateOrCreate(
                    ['name' => $permission['name'], 'guard_name' => 'web'],
                    array_merge($permission, [
                        'guard_name' => 'web',
                        'group' => $group,
                    ])
                );
            }
        }

        $superAdmin = Role::where('name', 'super_admin')->first();
        $admin = Role::where('name', 'admin')->first();
        $instructor = Role::where('name', 'instructor')->first();
        $teacher = Role::where('name', 'teacher')->first();
        $employee = Role::where('name', 'employee')->first();
        $student = Role::where('name', 'student')->first();
        $judge = Role::where('name', 'judge')->first();
        $hrOfficer = Role::where('name', 'hr_officer')->first();
        $inventoryOfficer = Role::where('name', 'inventory_officer')->first();
        $librarian = Role::where('name', 'librarian')->first();

        $superAdmin?->syncPermissions(Permission::all());

        $admin?->syncPermissions(Permission::all());

        $instructor?->syncPermissions([
            'view_courses', 'create_courses', 'update_courses', 'publish_courses',
            'view_enrollments',
            'view_quizzes', 'create_quizzes', 'update_quizzes', 'delete_quizzes',
            'view_certificates', 'generate_certificates',
            'view_announcements',
            'view_dashboard', 'view_instructor_dashboard',
            'view_tasks', 'update_tasks',
            'view_projects',
            'view_reports',
            'view_robotics_lab', 'view_robotics_equipment', 'create_robotics_equipment',
            'update_robotics_equipment', 'assign_robotics_equipment', 'return_robotics_equipment',
            'approve_robotics_reservations', 'manage_robotics_maintenance',
            'manage_robotics_teams', 'review_robotics_projects',
            'view_competitions', 'create_competitions', 'update_competitions',
            'manage_competition_criteria', 'manage_competition_judges',
            'manage_competition_teams', 'verify_competition_scores',
            'view_competition_leaderboard', 'view_competition_results',
            'use_ai_assistants',
            'view_notifications', 'manage_notification_preferences',
            'review_student_projects',
        ]);

        $teacher?->syncPermissions([
            'view_courses',
            'view_enrollments',
            'view_certificates',
            'view_announcements',
            'view_dashboard',
            'view_reports',
            'view_robotics_lab', 'view_robotics_equipment', 'create_robotics_equipment',
            'update_robotics_equipment', 'delete_robotics_equipment',
            'assign_robotics_equipment', 'return_robotics_equipment',
            'approve_robotics_reservations', 'manage_robotics_maintenance',
            'manage_robotics_teams', 'review_robotics_projects',
            'view_competitions', 'create_competitions', 'update_competitions',
            'manage_competition_criteria', 'manage_competition_judges',
            'manage_competition_teams', 'verify_competition_scores',
            'view_competition_leaderboard', 'view_competition_results',
            'view_notifications', 'manage_notification_preferences',
            'review_student_projects',
        ]);

        $employee?->syncPermissions([
            'view_dashboard',
            'view_tasks', 'create_tasks', 'update_tasks',
            'view_projects', 'create_projects', 'update_projects',
            'view_courses',
            'view_announcements',
            'view_enrollments', 'create_enrollments',
            'view_certificates',
            'use_ai_assistants',
            'request_leave', 'view_own_payslips', 'view_own_attendance',
            'view_notifications', 'manage_notification_preferences',
        ]);

        $hrOfficer?->syncPermissions([
            'view_hr', 'manage_contracts', 'manage_leave', 'manage_attendance',
            'manage_payroll', 'manage_performance_reviews', 'manage_employee_documents',
            'view_employees', 'create_employees', 'update_employees', 'delete_employees',
            'onboard_employees', 'offboard_employees',
            'view_departments', 'create_departments', 'update_departments',
            'view_dashboard', 'view_announcements', 'view_reports',
            'request_leave', 'view_own_payslips', 'view_own_attendance',
            'view_notifications', 'manage_notification_preferences',
        ]);

        $student?->syncPermissions([
            'view_courses',
            'view_enrollments', 'create_enrollments', 'cancel_enrollments',
            'view_quizzes', 'attempt_quizzes',
            'view_certificates',
            'view_announcements',
            'view_dashboard',
            'view_robotics_lab', 'view_robotics_equipment',
            'view_competitions', 'register_for_competitions',
            'view_competition_leaderboard',
            'view_library', 'library_download',
            'use_ai_assistants',
            'view_notifications', 'manage_notification_preferences',
            'view_student_projects', 'create_student_projects', 'update_student_projects',
            'delete_student_projects', 'publish_student_projects', 'view_public_projects',
            'view_available_exams', 'take_exams', 'view_exam_results',
        ]);

        $judge?->syncPermissions([
            'view_competitions',
            'score_competitions',
            'view_competition_leaderboard',
            'view_competition_results',
        ]);

        $inventoryOfficer?->syncPermissions([
            'view_inventory', 'manage_asset_categories', 'manage_locations',
            'manage_assets', 'assign_assets', 'manage_asset_maintenance',
            'manage_inventory_items', 'record_stock_movements',
            'view_dashboard', 'view_announcements', 'view_reports',
        ]);

        $librarian?->syncPermissions([
            'view_library', 'manage_library_resources', 'manage_library_categories',
            'manage_library_authors', 'manage_library_borrowings', 'manage_library_reservations',
            'library_download',
            'view_dashboard', 'view_announcements', 'view_reports',
        ]);

        // Accountant: finance-focused permissions
        $accountant = Role::where('name', 'accountant')->first();
        $accountant?->syncPermissions([
            'view_finance', 'manage_fee_structures', 'manage_invoices', 'record_payments',
            'manage_expenses', 'manage_budgets', 'manage_mpesa',
            'view_dashboard', 'view_announcements', 'view_reports',
            'use_ai_assistants',
            'view_notifications', 'manage_notification_preferences',
        ]);

        // Director: broad oversight permissions
        $director = Role::where('name', 'director')->first();
        $director?->syncPermissions([
            'view_dashboard', 'view_admin_dashboard',
            'view_courses', 'view_enrollments',
            'view_users', 'view_employees',
            'view_competitions', 'view_competition_leaderboard', 'view_competition_results',
            'view_finance', 'view_reports', 'view_analytics',
            'view_robotics_lab',
            'view_library',
            'view_certificates', 'view_competitions',
            'view_notifications', 'manage_notification_preferences',
        ]);

        // Branch Manager: branch-scoped oversight
        $branchManager = Role::where('name', 'branch_manager')->first();
        $branchManager?->syncPermissions([
            'view_dashboard', 'view_admin_dashboard',
            'view_courses', 'view_enrollments',
            'view_users', 'view_employees',
            'view_competitions', 'view_competition_leaderboard', 'view_competition_results',
            'view_finance', 'view_reports', 'view_analytics',
            'view_robotics_lab',
            'view_library',
            'view_certificates',
            'view_notifications', 'manage_notification_preferences',
        ]);

        // School Admin: school-level operational access
        $schoolAdmin = Role::where('name', 'school_admin')->first();
        $schoolAdmin?->syncPermissions([
            'view_dashboard', 'view_admin_dashboard',
            'view_courses', 'create_courses', 'update_courses', 'publish_courses',
            'view_enrollments', 'create_enrollments',
            'view_users', 'create_users', 'update_users',
            'view_employees',
            'view_competitions', 'create_competitions', 'update_competitions',
            'manage_competition_criteria', 'manage_competition_judges', 'manage_competition_teams',
            'view_competition_leaderboard', 'view_competition_results',
            'view_finance', 'view_reports', 'view_analytics',
            'view_robotics_lab', 'view_robotics_equipment',
            'view_library',
            'view_certificates',
            'view_notifications', 'manage_notification_preferences',
            'use_ai_assistants',
        ]);

        // Parent: read-only access to child's progress
        $parent = Role::where('name', 'parent')->first();
        $parent?->syncPermissions([
            'view_courses',
            'view_enrollments',
            'view_certificates',
            'view_announcements',
            'view_dashboard',
            'view_notifications', 'manage_notification_preferences',
            'view_robotics_lab', 'view_robotics_equipment',
            'view_competitions', 'view_competition_leaderboard', 'view_competition_results',
            'view_library', 'library_download',
            'use_ai_assistants',
        ]);

        // Certificate management permissions for admin-adjacent roles.
        $instructor?->syncPermissions(array_merge($instructor?->getPermissionNames()->all() ?? [], [
            'view_certificates', 'issue_certificates',
        ]));

        $teacher?->syncPermissions(array_merge($teacher?->getPermissionNames()->all() ?? [], [
            'view_certificates', 'issue_certificates',
        ]));

        // Extended permissions (CMS, system ops, LMS, academics, appointments, organization, ID cards).
        $schoolAdmin?->syncPermissions(array_merge($schoolAdmin?->getPermissionNames()->all() ?? [], [
            'reset_passwords',
            'manage_blog_posts', 'manage_gallery_items', 'manage_testimonials', 'manage_faqs',
            'manage_programs_services', 'manage_partner_schools', 'manage_site_content',
            'manage_contact_messages', 'manage_chat_widget', 'manage_popup_ads', 'manage_events',
            'view_website_analytics',
            'view_appointments', 'manage_appointments',
            'view_student_attendance', 'manage_student_attendance',
            'manage_exams', 'manage_gradebook', 'manage_assignments', 'manage_report_cards',
            'generate_id_cards',
            'manage_academic_years',
            'access_lms',
        ]));

        $teacher?->syncPermissions(array_merge($teacher?->getPermissionNames()->all() ?? [], [
            'view_student_attendance', 'manage_student_attendance',
            'manage_exams', 'manage_gradebook', 'manage_assignments', 'manage_report_cards',
            'access_lms',
        ]));

        $instructor?->syncPermissions(array_merge($instructor?->getPermissionNames()->all() ?? [], [
            'access_lms', 'manage_coding_exercises', 'manage_forums',
        ]));

        $student?->syncPermissions(array_merge($student?->getPermissionNames()->all() ?? [], [
            'access_lms',
        ]));

        $employee?->syncPermissions(array_merge($employee?->getPermissionNames()->all() ?? [], [
            'access_lms',
        ]));

        $parent?->syncPermissions(array_merge($parent?->getPermissionNames()->all() ?? [], [
            'access_lms', 'view_student_attendance',
        ]));

        $director?->syncPermissions(array_merge($director?->getPermissionNames()->all() ?? [], [
            'view_appointments', 'view_student_attendance', 'view_website_analytics',
        ]));

        $branchManager?->syncPermissions(array_merge($branchManager?->getPermissionNames()->all() ?? [], [
            'view_appointments', 'view_student_attendance',
        ]));
    }
}
