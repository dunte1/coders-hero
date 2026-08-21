<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class WebsiteSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            SiteSettingsSeeder::class,
            SiteSectionSeeder::class,
            ServiceSeeder::class,
            ProgramSeeder::class,
            GalleryItemSeeder::class,
            TestimonialSeeder::class,
            FaqSeeder::class,
            BlogPostSeeder::class,
        ]);
    }
}
