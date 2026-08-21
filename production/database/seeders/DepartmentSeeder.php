<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'Engineering', 'description' => 'Software engineering and development.', 'is_active' => true],
            ['name' => 'Marketing', 'description' => 'Marketing and brand management.', 'is_active' => true],
            ['name' => 'Sales', 'description' => 'Sales and business development.', 'is_active' => true],
            ['name' => 'Human Resources', 'description' => 'HR management and employee relations.', 'is_active' => true],
            ['name' => 'Finance', 'description' => 'Financial planning and accounting.', 'is_active' => true],
            ['name' => 'Operations', 'description' => 'Business operations and logistics.', 'is_active' => true],
            ['name' => 'Support', 'description' => 'Customer support and success.', 'is_active' => true],
            ['name' => 'Design', 'description' => 'UI/UX and graphic design.', 'is_active' => true],
            ['name' => 'Product', 'description' => 'Product management and strategy.', 'is_active' => true],
            ['name' => 'Legal', 'description' => 'Legal affairs and compliance.', 'is_active' => true],
        ];

        foreach ($departments as $index => $department) {
            Department::updateOrCreate(
                ['slug' => \Str::slug($department['name'])],
                array_merge($department, [
                    'slug' => \Str::slug($department['name']),
                    'sort_order' => $index + 1,
                ])
            );
        }
    }
}
