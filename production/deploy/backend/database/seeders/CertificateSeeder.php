<?php

namespace Database\Seeders;

use App\Models\CertificateTemplate;
use App\Models\User;
use Illuminate\Database\Seeder;

class CertificateSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'superadmin@codershero.com')->first();
        $adminId = $admin?->id;

        $templates = [
            [
                'name' => 'Course Completion',
                'description' => 'Standard certificate for completing a course.',
                'accent_color' => '#6366f1',
                'font_family' => 'DejaVu Sans',
                'signature_name' => 'Sarah Johnson',
                'signature_title' => 'Head of Learning',
                'is_default' => true,
                'body_html' => null,
            ],
            [
                'name' => 'Coding Excellence',
                'description' => 'Certificate for outstanding performance in coding courses.',
                'accent_color' => '#059669',
                'font_family' => 'DejaVu Sans',
                'signature_name' => 'David Ochieng',
                'signature_title' => 'STEM Coordinator',
                'is_default' => false,
                'body_html' => null,
            ],
            [
                'name' => 'Robotics Achievement',
                'description' => 'Certificate awarded for robotics project completion.',
                'accent_color' => '#f59e0b',
                'font_family' => 'DejaVu Sans',
                'signature_name' => 'David Ochieng',
                'signature_title' => 'STEM Coordinator',
                'is_default' => false,
                'body_html' => null,
            ],
        ];

        foreach ($templates as $data) {
            CertificateTemplate::updateOrCreate(
                ['slug' => \Illuminate\Support\Str::slug($data['name'])],
                array_merge($data, [
                    'is_active' => true,
                    'created_by_user_id' => $adminId,
                ])
            );
        }
    }
}
