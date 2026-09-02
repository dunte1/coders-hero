<?php

namespace Database\Seeders;

use App\Models\CodingLanguage;
use Illuminate\Database\Seeder;

class CodingLanguageSeeder extends Seeder
{
    public function run(): void
    {
        $languages = [
            [
                'name' => 'Python',
                'slug' => 'python',
                'icon' => '🐍',
                'piston_language' => 'python',
                'entry_file' => 'main.py',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'JavaScript',
                'slug' => 'javascript',
                'icon' => '🟨',
                'piston_language' => 'javascript',
                'entry_file' => 'main.js',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'TypeScript',
                'slug' => 'typescript',
                'icon' => '🔵',
                'piston_language' => 'typescript',
                'entry_file' => 'main.ts',
                'is_active' => false,
                'sort_order' => 3,
            ],
            [
                'name' => 'Java',
                'slug' => 'java',
                'icon' => '☕',
                'piston_language' => 'java',
                'entry_file' => 'Main.java',
                'is_active' => false,
                'sort_order' => 4,
            ],
            [
                'name' => 'C++',
                'slug' => 'cpp',
                'icon' => '⚙️',
                'piston_language' => 'c++',
                'entry_file' => 'main.cpp',
                'is_active' => false,
                'sort_order' => 5,
            ],
            [
                'name' => 'Go',
                'slug' => 'go',
                'icon' => '🐹',
                'piston_language' => 'go',
                'entry_file' => 'main.go',
                'is_active' => false,
                'sort_order' => 6,
            ],
            [
                'name' => 'Rust',
                'slug' => 'rust',
                'icon' => '🦀',
                'piston_language' => 'rust',
                'entry_file' => 'main.rs',
                'is_active' => false,
                'sort_order' => 7,
            ],
            [
                'name' => 'Ruby',
                'slug' => 'ruby',
                'icon' => '💎',
                'piston_language' => 'ruby',
                'entry_file' => 'main.rb',
                'is_active' => false,
                'sort_order' => 8,
            ],
        ];

        foreach ($languages as $language) {
            CodingLanguage::updateOrCreate(
                ['slug' => $language['slug']],
                $language
            );
        }
    }
}
