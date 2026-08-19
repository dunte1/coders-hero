<?php

namespace Database\Seeders;

use App\Models\GalleryItem;
use Illuminate\Database\Seeder;

class GalleryItemSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['title' => 'Robotics Showcase Battle', 'description' => 'Students test their robots in the end-of-term showcase.', 'category' => 'Robotics', 'image' => 'https://placehold.co/800x600/0EA5E9/ffffff.png?text=Robotics+Showcase', 'sort_order' => 10],
            ['title' => 'Scratch Game Jam', 'description' => 'Young coders build original games in a one-day jam.', 'category' => 'Coding', 'image' => 'https://placehold.co/800x600/8B5CF6/ffffff.png?text=Game+Jam', 'sort_order' => 20],
            ['title' => 'LEGO WeDo Build Session', 'description' => 'Designing moving models with gears and sensors.', 'category' => 'Robotics', 'image' => 'https://placehold.co/800x600/10B981/ffffff.png?text=LEGO+Build', 'sort_order' => 30],
            ['title' => 'Python Bootcamp', 'description' => 'Teens pair up for the Python capstone project.', 'category' => 'Coding', 'image' => 'https://placehold.co/800x600/6366F1/ffffff.png?text=Python+Bootcamp', 'sort_order' => 40],
            ['title' => 'STEM Experiment Day', 'description' => 'Balloon rockets and slime circuits in the wonder lab.', 'category' => 'STEM', 'image' => 'https://placehold.co/800x600/84CC16/ffffff.png?text=STEM+Day', 'sort_order' => 50],
            ['title' => 'Arduino Night Lights', 'description' => 'Students solder and program their own light displays.', 'category' => 'Robotics', 'image' => 'https://placehold.co/800x600/EF4444/ffffff.png?text=Arduino+Night', 'sort_order' => 60],
            ['title' => 'Demo Day', 'description' => 'Families gather for our end-of-season project fair.', 'category' => 'Events', 'image' => 'https://placehold.co/800x600/F59E0B/ffffff.png?text=Demo+Day', 'sort_order' => 70],
            ['title' => 'Web Design Portfolio', 'description' => 'Students present the websites they built from scratch.', 'category' => 'Coding', 'image' => 'https://placehold.co/800x600/0D9488/ffffff.png?text=Web+Portfolio', 'sort_order' => 80],
            ['title' => 'Competition Team Practice', 'description' => 'Practising tournament missions with precision.', 'category' => 'Robotics', 'image' => 'https://placehold.co/800x600/1D4ED8/ffffff.png?text=Team+Practice', 'sort_order' => 90],
            ['title' => 'Kid Inventors Workshop', 'description' => 'From crazy ideas to working prototypes.', 'category' => 'Events', 'image' => 'https://placehold.co/800x600/E11D48/ffffff.png?text=Inventor+Workshop', 'sort_order' => 100],
            ['title' => 'Hour of Code', 'description' => 'Our annual community coding celebration.', 'category' => 'Coding', 'image' => 'https://placehold.co/800x600/0284C7/ffffff.png?text=Hour+of+Code', 'sort_order' => 110],
            ['title' => 'Science Fair Winners', 'description' => 'Celebrating our national science fair medalists.', 'category' => 'Events', 'image' => 'https://placehold.co/800x600/7C3AED/ffffff.png?text=Science+Fair', 'sort_order' => 120],
        ];

        foreach ($items as $data) {
            GalleryItem::updateOrCreate(
                ['title' => $data['title']],
                $data
            );
        }
    }
}
