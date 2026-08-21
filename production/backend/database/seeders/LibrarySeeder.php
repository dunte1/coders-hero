<?php

namespace Database\Seeders;

use App\Models\LibraryAuthor;
use App\Models\LibraryCategory;
use App\Models\LibraryResource;
use App\Models\User;
use Illuminate\Database\Seeder;

class LibrarySeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'superadmin@codershero.com')->first();
        $adminId = $admin?->id;

        $categories = [
            'E-Books' => 'Digital books on coding, robotics and general studies.',
            'Videos' => 'Recorded lessons and tutorials.',
            'Notes' => 'Class notes and study guides.',
            'Past Papers' => 'Previous exams and assessments.',
            'Coding Resources' => 'Reference materials, cheat sheets and project guides.',
            'Robotics Manuals' => 'Guides and manuals for robotics kits and hardware.',
        ];

        $categoryIds = [];

        foreach ($categories as $name => $description) {
            $category = LibraryCategory::updateOrCreate(
                ['name' => $name],
                [
                    'description' => $description,
                    'is_active' => true,
                    'created_by_user_id' => $adminId,
                ]
            );
            $categoryIds[$name] = $category->id;
        }

        $authors = [
            ['name' => 'Sarah Johnson', 'bio' => 'Lead coding instructor and curriculum author.'],
            ['name' => 'David Ochieng', 'bio' => 'Robotics engineer and STEM lab coordinator.'],
            ['name' => 'Coder\'s Hero Team', 'bio' => 'Curriculum development team at Coder\'s Hero.'],
        ];

        $authorIds = [];

        foreach ($authors as $author) {
            $model = LibraryAuthor::updateOrCreate(
                ['name' => $author['name']],
                [
                    'bio' => $author['bio'],
                    'created_by_user_id' => $adminId,
                ]
            );
            $authorIds[$author['name']] = $model->id;
        }

        $resources = [
            [
                'title' => 'Introduction to Python - Student Handbook',
                'category' => 'E-Books',
                'author' => 'Sarah Johnson',
                'type' => 'ebook',
                'description' => 'A beginner-friendly handbook covering variables, loops, functions and small projects.',
                'is_public' => true,
                'download_allowed' => true,
                'language' => 'en',
            ],
            [
                'title' => 'Scratch Project Workbook',
                'category' => 'Notes',
                'author' => 'Coder\'s Hero Team',
                'type' => 'notes',
                'description' => 'Step-by-step workbook for building games and animations in Scratch.',
                'is_public' => true,
                'download_allowed' => false,
                'language' => 'en',
            ],
            [
                'title' => 'LEGO Mindstorms EV3 Build Guide',
                'category' => 'Robotics Manuals',
                'author' => 'David Ochieng',
                'type' => 'robotics_manual',
                'description' => 'Assembly and programming guide for the LEGO Mindstorms EV3 kits.',
                'is_public' => false,
                'download_allowed' => false,
                'language' => 'en',
            ],
            [
                'title' => 'HTML & CSS Cheat Sheet',
                'category' => 'Coding Resources',
                'author' => 'Coder\'s Hero Team',
                'type' => 'coding_resource',
                'description' => 'Quick reference for common HTML tags and CSS properties.',
                'is_public' => true,
                'download_allowed' => true,
                'language' => 'en',
            ],
            [
                'title' => 'Grade 6 Coding Assessment - Term 1',
                'category' => 'Past Papers',
                'author' => 'Sarah Johnson',
                'type' => 'past_paper',
                'description' => 'End of term assessment for the Grade 6 coding class.',
                'is_public' => false,
                'download_allowed' => false,
                'language' => 'en',
            ],
            [
                'title' => 'Arduino Sensor Video Tutorial',
                'category' => 'Videos',
                'author' => 'David Ochieng',
                'type' => 'video',
                'description' => 'Walkthrough of wiring and reading common sensors with Arduino.',
                'is_public' => true,
                'download_allowed' => false,
                'language' => 'en',
            ],
        ];

        foreach ($resources as $data) {
            LibraryResource::updateOrCreate(
                ['slug' => \Illuminate\Support\Str::slug($data['title']) . '-' . \Illuminate\Support\Str::lower(\Illuminate\Support\Str::random(4))],
                [
                    'title' => $data['title'],
                    'category_id' => $categoryIds[$data['category']] ?? null,
                    'author_id' => $authorIds[$data['author']] ?? null,
                    'description' => $data['description'],
                    'resource_type' => $data['type'],
                    'file_path' => null,
                    'file_size' => null,
                    'mime_type' => null,
                    'cover_image' => null,
                    'language' => $data['language'] ?? 'en',
                    'is_public' => $data['is_public'],
                    'download_allowed' => $data['download_allowed'],
                    'is_active' => true,
                    'view_count' => rand(5, 120),
                    'created_by_user_id' => $adminId,
                ]
            );
        }
    }
}
