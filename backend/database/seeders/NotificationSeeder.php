<?php

namespace Database\Seeders;

use App\Models\NotificationPreference;
use App\Models\NotificationTemplate;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'event' => 'attendance.alert',
                'name' => 'Attendance Alert',
                'description' => 'Notifies a student or parent when attendance is recorded or an absence is flagged.',
                'category' => 'attendance',
                'subject' => 'Attendance update for {{student_name}}',
                'body' => 'Hello {{user_name}}, attendance for {{student_name}} has been recorded as {{status}} on {{date}}.',
                'channels' => ['in_app', 'email'],
            ],
            [
                'event' => 'fee.reminder',
                'name' => 'Fee Reminder',
                'description' => 'Reminds a student or guardian about an outstanding or upcoming fee payment.',
                'category' => 'fees',
                'subject' => 'Fee reminder: {{amount}} due {{due_date}}',
                'body' => 'Hello {{user_name}}, your fee balance of {{amount}} is due by {{due_date}}. Please settle to keep your enrolment active.',
                'channels' => ['in_app', 'email', 'sms'],
            ],
            [
                'event' => 'invoice.issued',
                'name' => 'Invoice Issued',
                'description' => 'Notifies the invoice recipient when a new invoice is issued.',
                'category' => 'fees',
                'subject' => 'Invoice #{{invoice_number}} issued',
                'body' => 'Hello {{user_name}}, invoice #{{invoice_number}} for {{amount}} has been issued on {{date}}.',
                'channels' => ['in_app', 'email'],
            ],
            [
                'event' => 'assignment.published',
                'name' => 'Assignment Published',
                'description' => 'Notifies students when a new assignment is published for their class.',
                'category' => 'assignments',
                'subject' => 'New assignment: {{assignment_title}}',
                'body' => 'Hello {{user_name}}, a new assignment "{{assignment_title}}" for {{course_name}} is due on {{due_date}}.',
                'channels' => ['in_app', 'email'],
            ],
            [
                'event' => 'exam.scheduled',
                'name' => 'Exam Scheduled',
                'description' => 'Notifies students when an exam is scheduled or rescheduled.',
                'category' => 'exams',
                'subject' => 'Exam scheduled: {{exam_title}}',
                'body' => 'Hello {{user_name}}, the exam "{{exam_title}}" is scheduled for {{exam_date}} at {{exam_time}}.',
                'channels' => ['in_app', 'email'],
            ],
            [
                'event' => 'competition.announcement',
                'name' => 'Competition Announcement',
                'description' => 'Informs teams about competition updates, registration and results.',
                'category' => 'competitions',
                'subject' => 'Competition update: {{competition_name}}',
                'body' => 'Hello {{user_name}}, {{message}} for the competition "{{competition_name}}".',
                'channels' => ['in_app', 'email'],
            ],
            [
                'event' => 'certificate.issued',
                'name' => 'Certificate Issued',
                'description' => 'Notifies a student when a certificate is issued for a completed course.',
                'category' => 'certificates',
                'subject' => 'Certificate issued: {{course_name}}',
                'body' => 'Congratulations {{user_name}}! Your certificate for {{course_name}} has been issued on {{date}}.',
                'channels' => ['in_app', 'email'],
            ],
            [
                'event' => 'system.notification',
                'name' => 'System Notification',
                'description' => 'General system announcements and maintenance notices.',
                'category' => 'system',
                'subject' => 'System update',
                'body' => '{{message}}',
                'channels' => ['in_app', 'email'],
            ],
        ];

        foreach ($templates as $template) {
            NotificationTemplate::updateOrCreate(
                ['event' => $template['event']],
                $template
            );
        }

        $defaults = config('notifications.default_preferences');

        User::query()->each(function (User $user) use ($defaults) {
            foreach (array_keys(config('notifications.categories')) as $category) {
                NotificationPreference::updateOrCreate(
                    ['user_id' => $user->id, 'category' => $category],
                    [
                        'email' => $defaults['email'],
                        'sms' => $defaults['sms'],
                        'push' => $defaults['push'],
                        'in_app' => $defaults['in_app'],
                    ]
                );
            }
        });
    }
}
