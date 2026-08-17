<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'super_admin',
                'display_name' => 'Super Admin',
                'description' => 'Full system access with all permissions.',
                'guard_name' => 'web',
            ],
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'System administrator with broad access.',
                'guard_name' => 'web',
            ],
            [
                'name' => 'instructor',
                'display_name' => 'Instructor',
                'description' => 'Course instructor who can manage courses and quizzes.',
                'guard_name' => 'web',
            ],
            [
                'name' => 'teacher',
                'display_name' => 'Teacher',
                'description' => 'Teacher who manages classes, assignments, exams and grades.',
                'guard_name' => 'web',
            ],
            [
                'name' => 'employee',
                'display_name' => 'Employee',
                'description' => 'Company employee with standard access.',
                'guard_name' => 'web',
            ],
            [
                'name' => 'student',
                'display_name' => 'Student',
                'description' => 'Student who can enroll in courses.',
                'guard_name' => 'web',
            ],
            [
                'name' => 'parent',
                'display_name' => 'Parent',
                'description' => 'Parent or guardian with access to the Parent Portal.',
                'guard_name' => 'web',
            ],
            [
                'name' => 'judge',
                'display_name' => 'Judge',
                'description' => 'External or internal judge who scores competition teams.',
                'guard_name' => 'web',
            ],
            [
                'name' => 'hr_officer',
                'display_name' => 'HR Officer',
                'description' => 'Human resources officer who manages employees, contracts, leave, attendance and payroll.',
                'guard_name' => 'web',
            ],
            [
                'name' => 'inventory_officer',
                'display_name' => 'Inventory Officer',
                'description' => 'Inventory officer who manages assets, stock items and locations.',
                'guard_name' => 'web',
            ],
            [
                'name' => 'librarian',
                'display_name' => 'Librarian',
                'description' => 'Librarian who manages the digital library, resources and borrowings.',
                'guard_name' => 'web',
            ],
            [
                'name' => 'director',
                'display_name' => 'Director',
                'description' => 'School director with cross-branch oversight and reporting access.',
                'guard_name' => 'web',
            ],
            [
                'name' => 'branch_manager',
                'display_name' => 'Branch Manager',
                'description' => 'Branch manager with operational access scoped to their branch.',
                'guard_name' => 'web',
            ],
            [
                'name' => 'school_admin',
                'display_name' => 'School Admin',
                'description' => 'School-level administrator with broad academic and operational access.',
                'guard_name' => 'web',
            ],
            [
                'name' => 'accountant',
                'display_name' => 'Accountant',
                'description' => 'Accountant who manages finance, invoices, payments and budgets.',
                'guard_name' => 'web',
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role['name'], 'guard_name' => $role['guard_name']],
                $role
            );
        }
    }
}
