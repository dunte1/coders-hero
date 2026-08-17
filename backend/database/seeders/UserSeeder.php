<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use App\Models\Position;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $superAdmin = User::updateOrCreate(
            ['email' => 'superadmin@codershero.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );
        $superAdmin->assignRole('super_admin');

        $admin = User::updateOrCreate(
            ['email' => 'admin@codershero.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'phone' => '+1-555-0100',
                'is_active' => true,
            ]
        );
        $admin->assignRole('admin');

        $instructors = [
            ['name' => 'Sarah Johnson', 'email' => 'sarah@codershero.com', 'phone' => '+1-555-0101'],
            ['name' => 'Michael Chen', 'email' => 'michael@codershero.com', 'phone' => '+1-555-0102'],
            ['name' => 'Emily Davis', 'email' => 'emily@codershero.com', 'phone' => '+1-555-0103'],
        ];

        $instructorUsers = [];
        foreach ($instructors as $instructor) {
            $user = User::updateOrCreate(
                ['email' => $instructor['email']],
                array_merge($instructor, [
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'is_active' => true,
                ])
            );
            $user->assignRole('instructor');
            $instructorUsers[] = $user;
        }

        $employees = [
            ['name' => 'James Wilson', 'email' => 'james@codershero.com', 'phone' => '+1-555-0201', 'department' => 'Engineering', 'position' => 'Senior Developer', 'level' => 'senior'],
            ['name' => 'Jessica Brown', 'email' => 'jessica@codershero.com', 'phone' => '+1-555-0202', 'department' => 'Marketing', 'position' => 'Marketing Manager', 'level' => 'manager'],
            ['name' => 'David Lee', 'email' => 'david@codershero.com', 'phone' => '+1-555-0203', 'department' => 'Engineering', 'position' => 'Junior Developer', 'level' => 'entry'],
            ['name' => 'Amanda Garcia', 'email' => 'amanda@codershero.com', 'phone' => '+1-555-0204', 'department' => 'Design', 'position' => 'UI/UX Designer', 'level' => 'mid'],
            ['name' => 'Robert Taylor', 'email' => 'robert@codershero.com', 'phone' => '+1-555-0205', 'department' => 'Sales', 'position' => 'Sales Representative', 'level' => 'mid'],
            ['name' => 'Jennifer Martinez', 'email' => 'jennifer@codershero.com', 'phone' => '+1-555-0206', 'department' => 'Human Resources', 'position' => 'HR Director', 'level' => 'director'],
            ['name' => 'Christopher Anderson', 'email' => 'chris@codershero.com', 'phone' => '+1-555-0207', 'department' => 'Finance', 'position' => 'Financial Analyst', 'level' => 'mid'],
            ['name' => 'Michelle Thomas', 'email' => 'michelle@codershero.com', 'phone' => '+1-555-0208', 'department' => 'Operations', 'position' => 'Operations Manager', 'level' => 'manager'],
        ];

        foreach ($employees as $emp) {
            $user = User::updateOrCreate(
                ['email' => $emp['email']],
                [
                    'name' => $emp['name'],
                    'password' => Hash::make('password'),
                    'phone' => $emp['phone'],
                    'email_verified_at' => now(),
                    'is_active' => true,
                ]
            );
            $user->assignRole('employee');

            $department = Department::where('name', $emp['department'])->first();
            if ($department) {
                $position = Position::firstOrCreate(
                    ['name' => $emp['position'], 'department_id' => $department->id],
                    ['level' => $emp['level'], 'description' => "{$emp['position']} position in {$emp['department']}", 'is_active' => true]
                );

                $user->employee()->updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'employee_id' => 'EMP' . str_pad($user->id, 5, '0', STR_PAD_LEFT),
                        'department_id' => $department->id,
                        'position_id' => $position->id,
                        'hire_date' => now()->subMonths(rand(1, 36)),
                        'employment_type' => 'full_time',
                        'salary' => rand(50000, 120000),
                        'status' => 'active',
                    ]
                );
            }
        }

        $students = [
            ['name' => 'Alex Kim', 'email' => 'alex@example.com', 'phone' => '+1-555-0301'],
            ['name' => 'Rachel White', 'email' => 'rachel@example.com', 'phone' => '+1-555-0302'],
            ['name' => 'Tyler Johnson', 'email' => 'tyler@example.com', 'phone' => '+1-555-0303'],
            ['name' => 'Samantha Clark', 'email' => 'samantha@example.com', 'phone' => '+1-555-0304'],
            ['name' => 'Brandon Hall', 'email' => 'brandon@example.com', 'phone' => '+1-555-0305'],
        ];

        foreach ($students as $student) {
            $user = User::updateOrCreate(
                ['email' => $student['email']],
                array_merge($student, [
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'is_active' => true,
                ])
            );
            $user->assignRole('student');
        }
    }
}
