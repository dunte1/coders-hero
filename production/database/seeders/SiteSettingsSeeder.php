<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['general.site_name', 'general', "Coder's Hero"],
            ['general.tagline', 'general', 'Where young minds code, build & innovate'],
            ['general.description', 'general', "Coder's Hero is a modern learning centre teaching children coding, robotics and STEM through hands-on, project-based programs."],
            ['general.phone', 'general', '+1 (555) 123-4567'],
            ['general.email', 'general', 'hello@codershero.com'],
            ['general.address', 'general', '123 Innovation Drive, Tech City'],
            ['general.hours', 'general', 'Mon - Fri: 3pm - 8pm · Sat: 9am - 2pm'],

            ['social.facebook', 'social', 'https://facebook.com/codershero'],
            ['social.instagram', 'social', 'https://instagram.com/codershero'],
            ['social.youtube', 'social', 'https://youtube.com/@codershero'],
            ['social.linkedin', 'social', 'https://linkedin.com/company/codershero'],
            ['social.tiktok', 'social', 'https://tiktok.com/@codershero'],
            ['social.whatsapp', 'social', '+15551234567'],

            ['seo.meta_title', 'seo', "Coder's Hero — Coding, Robotics & STEM Classes for Kids"],
            ['seo.meta_description', 'seo', 'Hands-on coding, robotics and STEM programs for kids aged 5-17. Learn Python, Scratch, LEGO robotics, Arduino and more with expert instructors.'],
            ['seo.og_image', 'seo', ''],

            ['analytics.gtag_id', 'analytics', ''],

            ['chat.widget_title', 'chat', 'Hi there! 👋'],
            ['chat.widget_subtitle', 'chat', 'Ask us anything about Coder\'s Hero'],
            ['chat.welcome_message', 'chat', "Hello! I'm the Coder's Hero assistant. Ask me about our coding or robotics programs, pricing or age groups!"],
            ['chat.primary_color', 'chat', '#00C8D7'],
            ['chat.enabled', 'chat', '1'],

            ['popup.enabled', 'popup', '1'],
            ['popup.title', 'popup', 'Free Trial Class Available!'],
            ['popup.body', 'popup', 'Give your child a head start in coding and robotics. Book a free trial class today!'],
            ['popup.button_text', 'popup', 'Book Free Trial'],
            ['popup.button_url', 'popup', '/free-trial'],
            ['popup.image', 'popup', ''],
            ['popup.delay_seconds', 'popup', '3'],

            ['branding.logo', 'branding', ''],
            ['branding.logo_wide', 'branding', ''],
            ['branding.logo_icon', 'branding', ''],
            ['branding.favicon', 'branding', ''],
            ['branding.primary_color', 'branding', '#00E5E5'],
            ['branding.secondary_color', 'branding', '#00C8D7'],
            ['branding.accent_color', 'branding', '#F59E0B'],
            ['branding.theme_mode', 'branding', 'light'],
            ['branding.font_family', 'branding', 'Inter'],
            ['branding.sidebar_bg_color', 'branding', '#0F172A'],
            ['branding.sidebar_text_color', 'branding', '#CBD5E1'],
            ['branding.sidebar_active_color', 'branding', '#00E5E5'],
            ['branding.sidebar_active_text_color', 'branding', '#FFFFFF'],
            ['branding.header_bg_color', 'branding', '#FFFFFF'],
            ['branding.header_border_color', 'branding', '#E2E8F0'],
        ];

        foreach ($settings as [$key, $group, $value]) {
            SiteSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'group' => $group, 'is_public' => true]
            );
        }
    }
}
