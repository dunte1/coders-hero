<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Database\Seeder;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::role('super_admin')->first() ?? User::first();

        $announcements = [
            [
                'title' => 'Welcome to Coder\'s Hero ERP & LMS!',
                'body' => 'We are excited to announce the launch of our new enterprise resource planning and learning management system. Explore the platform and start your learning journey today!',
                'priority' => 'high',
                'is_pinned' => true,
                'published_at' => now(),
                'expires_at' => now()->addMonths(3),
                'target_roles' => null,
            ],
            [
                'title' => 'New Course: Laravel 12 Masterclass',
                'body' => 'We have just released a comprehensive Laravel 12 course. Enroll now and learn the latest features of this popular PHP framework. The course includes 40 hours of content, hands-on projects, and a certificate of completion.',
                'priority' => 'normal',
                'is_pinned' => false,
                'published_at' => now()->subDays(3),
                'expires_at' => now()->addMonths(1),
                'target_roles' => ['student', 'employee'],
            ],
            [
                'title' => 'System Maintenance Notice',
                'body' => 'Scheduled maintenance will be performed this weekend from Saturday 10 PM to Sunday 6 AM UTC. During this time, the system may be temporarily unavailable. We apologize for any inconvenience.',
                'priority' => 'urgent',
                'is_pinned' => true,
                'published_at' => now()->subDays(1),
                'expires_at' => now()->addDays(7),
                'target_roles' => null,
            ],
            [
                'title' => 'Employee Performance Reviews',
                'body' => 'Annual performance reviews will be conducted next month. Please ensure your goals and achievements are up to date in the system. Contact HR if you have any questions.',
                'priority' => 'normal',
                'is_pinned' => false,
                'published_at' => now()->subDays(7),
                'expires_at' => now()->addMonth(),
                'target_roles' => ['employee'],
            ],
            [
                'title' => 'New Instructor Workshop',
                'body' => 'We are hosting a workshop for instructors on creating engaging online content. Join us to learn best practices for course creation, student engagement, and assessment design.',
                'priority' => 'normal',
                'is_pinned' => false,
                'published_at' => now()->subDays(5),
                'expires_at' => now()->addMonths(1),
                'target_roles' => ['instructor', 'admin'],
            ],
        ];

        foreach ($announcements as $announcement) {
            Announcement::updateOrCreate(
                ['title' => $announcement['title']],
                array_merge($announcement, [
                    'author_id' => $admin->id,
                ])
            );
        }
    }
}
