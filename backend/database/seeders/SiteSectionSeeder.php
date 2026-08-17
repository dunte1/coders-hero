<?php

namespace Database\Seeders;

use App\Models\SiteSection;
use Illuminate\Database\Seeder;

class SiteSectionSeeder extends Seeder
{
    public function run(): void
    {
        $sections = [
            [
                'section_key' => 'hero',
                'title' => 'Where Young Minds Code, Build & Innovate',
                'subtitle' => "Hands-on coding, robotics and STEM classes that turn curious kids into confident creators — for ages 5 to 17.",
                'body' => 'From Scratch to Python, LEGO robots to Arduino, our project-based programs make technology exciting, accessible and fun.',
                'badge' => 'Enrollments open for this season',
                'button_label' => 'Explore Programs',
                'button_url' => '/programs',
                'sort_order' => 10,
            ],
            [
                'section_key' => 'stats',
                'title' => 'The Coder\'s Hero difference in numbers',
                'subtitle' => null,
                'body' => null,
                'meta' => [
                    'stats' => [
                        ['value' => '500+', 'label' => 'Students taught'],
                        ['value' => '12', 'label' => 'Expert instructors'],
                        ['value' => '25+', 'label' => 'Programs & workshops'],
                        ['value' => '15', 'label' => 'Years combined experience'],
                    ],
                ],
                'sort_order' => 20,
            ],
            [
                'section_key' => 'services_intro',
                'title' => 'What we offer',
                'subtitle' => 'A complete learning ecosystem for future innovators.',
                'sort_order' => 30,
            ],
            [
                'section_key' => 'programs_intro',
                'title' => 'Explore our programs',
                'subtitle' => 'Structured, progressive tracks that grow with your child.',
                'sort_order' => 40,
            ],
            [
                'section_key' => 'robotics',
                'title' => 'Robotics: build it, program it, watch it come to life',
                'subtitle' => 'From LEGO WeDo to competition-grade robotics.',
                'body' => "Students design, build and program real robots while learning engineering principles, teamwork and problem-solving. Our robotics track ends with hands-on showcase battles and friendly competitions.",
                'badge' => 'Robotics',
                'button_label' => 'See Robotics Programs',
                'button_url' => '/programs?category=robotics',
                'image' => 'https://placehold.co/900x600/0EA5E9/ffffff.png?text=Robotics+Class',
                'sort_order' => 50,
            ],
            [
                'section_key' => 'coding',
                'title' => 'Coding: from blocks to real programming',
                'subtitle' => 'A progressive path from Scratch to Python and beyond.',
                'body' => "Kids start with visual block coding and graduate to text-based languages like Python, building games, apps and websites along the way. Every class ends with a project students are proud to share.",
                'badge' => 'Coding',
                'button_label' => 'See Coding Programs',
                'button_url' => '/programs?category=coding',
                'image' => 'https://placehold.co/900x600/8B5CF6/ffffff.png?text=Coding+Class',
                'sort_order' => 60,
            ],
            [
                'section_key' => 'gallery_intro',
                'title' => 'Inside our classroom',
                'subtitle' => 'A peek at the fun, focus and friendships.',
                'sort_order' => 70,
            ],
            [
                'section_key' => 'testimonials_intro',
                'title' => 'Loved by parents, loved by kids',
                'subtitle' => 'Don\'t just take our word for it.',
                'sort_order' => 80,
            ],
            [
                'section_key' => 'blog_intro',
                'title' => 'From the blog',
                'subtitle' => 'Tips, news and inspiration for young techies.',
                'sort_order' => 90,
            ],
            [
                'section_key' => 'cta',
                'title' => 'Ready to spark your child\'s curiosity?',
                'subtitle' => 'Book a free trial class today — no strings attached.',
                'button_label' => 'Book a Free Trial',
                'button_url' => '/contact',
                'sort_order' => 100,
            ],
            [
                'section_key' => 'footer',
                'title' => "Coder's Hero",
                'subtitle' => 'Inspiring the next generation of builders, coders and inventors.',
                'sort_order' => 110,
            ],
            [
                'section_key' => 'seo',
                'title' => "Coder's Hero — Coding, Robotics & STEM Classes for Kids",
                'subtitle' => 'Hands-on coding, robotics and STEM programs for kids aged 5-17. Learn Python, Scratch, LEGO robotics, Arduino and more with expert instructors.',
                'sort_order' => 120,
            ],
        ];

        foreach ($sections as $data) {
            SiteSection::updateOrCreate(
                ['section_key' => $data['section_key']],
                $data
            );
        }
    }
}
