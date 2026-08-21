<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Web Development', 'description' => 'Frontend and backend web development courses.', 'icon' => 'globe', 'color' => '#3B82F6', 'is_active' => true, 'sort_order' => 1],
            ['name' => 'Mobile Development', 'description' => 'iOS and Android mobile app development.', 'icon' => 'smartphone', 'color' => '#10B981', 'is_active' => true, 'sort_order' => 2],
            ['name' => 'Data Science', 'description' => 'Data analysis, ML, and AI courses.', 'icon' => 'bar-chart', 'color' => '#8B5CF6', 'is_active' => true, 'sort_order' => 3],
            ['name' => 'Cloud & DevOps', 'description' => 'Cloud computing and DevOps practices.', 'icon' => 'cloud', 'color' => '#F59E0B', 'is_active' => true, 'sort_order' => 4],
            ['name' => 'Database', 'description' => 'Database management and optimization.', 'icon' => 'database', 'color' => '#EF4444', 'is_active' => true, 'sort_order' => 5],
            ['name' => 'Security', 'description' => 'Cybersecurity and ethical hacking.', 'icon' => 'shield', 'color' => '#EC4899', 'is_active' => true, 'sort_order' => 6],
            ['name' => 'Software Engineering', 'description' => 'Software architecture and best practices.', 'icon' => 'code', 'color' => '#6366F1', 'is_active' => true, 'sort_order' => 7],
            ['name' => 'Design', 'description' => 'UI/UX design and graphic design.', 'icon' => 'palette', 'color' => '#F97316', 'is_active' => true, 'sort_order' => 8],
            ['name' => 'Business', 'description' => 'Business strategy and management.', 'icon' => 'briefcase', 'color' => '#14B8A6', 'is_active' => true, 'sort_order' => 9],
            ['name' => 'Languages', 'description' => 'Programming language fundamentals.', 'icon' => 'terminal', 'color' => '#A855F7', 'is_active' => true, 'sort_order' => 10],
            ['name' => 'Coding', 'description' => 'Block-based and visual programming for beginners.', 'icon' => 'puzzle', 'color' => '#34D399', 'is_active' => true, 'sort_order' => 11],
            ['name' => 'Programming', 'description' => 'General-purpose programming courses.', 'icon' => 'code', 'color' => '#60A5FA', 'is_active' => true, 'sort_order' => 12],
            ['name' => 'AI & Data Science', 'description' => 'Artificial intelligence and advanced data science.', 'icon' => 'brain', 'color' => '#C084FC', 'is_active' => true, 'sort_order' => 13],
            ['name' => 'Robotics', 'description' => 'Robotics engineering, competition, and hardware.', 'icon' => 'bot', 'color' => '#FB923C', 'is_active' => true, 'sort_order' => 14],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => \Illuminate\Support\Str::slug($category['name'])],
                $category
            );
        }
    }
}
