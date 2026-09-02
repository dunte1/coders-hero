<?php

namespace Database\Seeders;

use App\Models\Popup;
use Illuminate\Database\Seeder;

class PopupSeeder extends Seeder
{
    public function run(): void
    {
        Popup::firstOrCreate(
            ['title' => 'Free Trial Class Available!'],
            [
                'body' => 'Give your child a head start in coding and robotics. Book a free trial class today!',
                'button_text' => 'Book Free Trial',
                'button_url' => '/free-trial',
                'type' => 'advert',
                'animation_style' => 'fade',
                'overlay_style' => 'dark',
                'frequency' => 'once_per_session',
                'active' => true,
                'sort_order' => 0,
            ]
        );
    }
}
