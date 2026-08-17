<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'name' => 'Robotics & LEGO Engineering',
                'short_description' => 'Build and program real robots with LEGO WeDo, SPIKE and EV3 — developing engineering and problem-solving skills.',
                'icon' => 'Bot',
                'features' => ['LEGO WeDo, SPIKE & EV3', 'Sensors, motors & gears', 'Team challenges & showcase battles', 'Beginner to competition level'],
                'sort_order' => 10,
            ],
            [
                'name' => 'Coding for Kids',
                'short_description' => 'A progressive coding curriculum from visual block coding to Python, JavaScript and real-world projects.',
                'icon' => 'Code2',
                'features' => ['Scratch & block coding', 'Python & JavaScript', 'Game and app building', 'Project portfolios'],
                'sort_order' => 20,
            ],
            [
                'name' => 'STEM & Science Exploration',
                'short_description' => 'Hands-on experiments and engineering challenges that make physics, math and science come alive.',
                'icon' => 'FlaskConical',
                'features' => ['Hands-on experiments', 'Engineering challenges', 'Math-in-motion activities', 'Critical thinking focus'],
                'sort_order' => 30,
            ],
            [
                'name' => 'Game Development',
                'short_description' => 'Design and code your own games — from platformers to 2D adventures — while learning logic and design.',
                'icon' => 'Gamepad2',
                'features' => ['Scratch, Python & engines', 'Game design fundamentals', 'Sprite & level design', 'Publish your own games'],
                'sort_order' => 40,
            ],
            [
                'name' => 'App Development',
                'short_description' => 'Build mobile-friendly apps and web experiences, learning UI/UX, logic and product thinking.',
                'icon' => 'Smartphone',
                'features' => ['App prototypes & builds', 'UI/UX fundamentals', 'Project-based learning', 'Showcase at demo day'],
                'sort_order' => 50,
            ],
            [
                'name' => 'AI & Machine Learning for Teens',
                'short_description' => 'Introduce teens to artificial intelligence, chat assistants and machine learning with hands-on projects.',
                'icon' => 'BrainCircuit',
                'features' => ['AI fundamentals', 'Hands-on ML projects', 'Ethics & responsible AI', 'Python for AI'],
                'sort_order' => 60,
            ],
        ];

        foreach ($services as $index => $data) {
            Service::updateOrCreate(
                ['slug' => \Str::slug($data['name'])],
                $data
            );
        }
    }
}
