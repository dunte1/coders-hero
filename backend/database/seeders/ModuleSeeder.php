<?php

namespace Database\Seeders;

use App\Models\Module;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    public function run(): void
    {
        $modules = [
            ['name' => 'Dashboard', 'slug' => 'dashboard', 'description' => 'Main dashboard with overview stats.', 'icon' => 'home', 'route' => '/dashboard', 'is_active' => true, 'sort_order' => 1],
            ['name' => 'Users', 'slug' => 'users', 'description' => 'User management system.', 'icon' => 'users', 'route' => '/admin/users', 'is_active' => true, 'sort_order' => 2],
            ['name' => 'Courses', 'slug' => 'courses', 'description' => 'Learning management system courses.', 'icon' => 'book-open', 'route' => '/courses', 'is_active' => true, 'sort_order' => 3],
            ['name' => 'Enrollments', 'slug' => 'enrollments', 'description' => 'Course enrollment management.', 'icon' => 'user-plus', 'route' => '/enrollments', 'is_active' => true, 'sort_order' => 4],
            ['name' => 'Tasks', 'slug' => 'tasks', 'description' => 'Task management system.', 'icon' => 'check-square', 'route' => '/tasks', 'is_active' => true, 'sort_order' => 5],
            ['name' => 'Projects', 'slug' => 'projects', 'description' => 'Project management module.', 'icon' => 'folder', 'route' => '/projects', 'is_active' => true, 'sort_order' => 6],
            ['name' => 'Employees', 'slug' => 'employees', 'description' => 'Employee directory and management.', 'icon' => 'briefcase', 'route' => '/admin/employees', 'is_active' => true, 'sort_order' => 7],
            ['name' => 'Departments', 'slug' => 'departments', 'description' => 'Department organization.', 'icon' => 'building', 'route' => '/admin/departments', 'is_active' => true, 'sort_order' => 8],
            ['name' => 'Quizzes', 'slug' => 'quizzes', 'description' => 'Quiz and assessment management.', 'icon' => 'clipboard', 'route' => '/quizzes', 'is_active' => true, 'sort_order' => 9],
            ['name' => 'Certificates', 'slug' => 'certificates', 'description' => 'Course completion certificates.', 'icon' => 'award', 'route' => '/certificates', 'is_active' => true, 'sort_order' => 10],
            ['name' => 'Announcements', 'slug' => 'announcements', 'description' => 'System announcements and notices.', 'icon' => 'megaphone', 'route' => '/announcements', 'is_active' => true, 'sort_order' => 11],
            ['name' => 'Reports', 'slug' => 'reports', 'description' => 'System reports and analytics.', 'icon' => 'bar-chart', 'route' => '/admin/reports', 'is_active' => true, 'sort_order' => 12],
            ['name' => 'Settings', 'slug' => 'settings', 'description' => 'System settings and configuration.', 'icon' => 'settings', 'route' => '/settings', 'is_active' => true, 'sort_order' => 13],
            ['name' => 'Finance', 'slug' => 'finance', 'description' => 'Financial management including invoices, payments, expenses and budgets.', 'icon' => 'wallet', 'route' => '/finance', 'is_active' => true, 'sort_order' => 14],
            ['name' => 'Human Resources', 'slug' => 'human-resources', 'description' => 'HR management including employees, contracts, leave, attendance and payroll.', 'icon' => 'users', 'route' => '/hr', 'is_active' => true, 'sort_order' => 15],
        ];

        foreach ($modules as $module) {
            Module::updateOrCreate(
                ['slug' => $module['slug']],
                $module
            );
        }
    }
}
