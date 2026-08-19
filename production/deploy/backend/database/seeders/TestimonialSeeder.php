<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $testimonials = [
            ['name' => 'Amira H.', 'role' => 'Parent of a Scratch student', 'avatar' => 'https://placehold.co/120x120/4F46E5/ffffff.png?text=AH', 'content' => "My daughter begged to go to 'coding club' every single week. Watching her explain loops and variables at dinner is priceless. The instructors are patient and genuinely inspiring.", 'rating' => 5, 'is_featured' => true, 'sort_order' => 10],
            ['name' => 'Marcus T.', 'role' => 'Parent of a Python student', 'avatar' => 'https://placehold.co/120x120/0EA5E9/ffffff.png?text=MT', 'content' => 'My son went from playing games to building them. The project-based approach keeps him engaged and the end-of-term demo day was amazing to see.', 'rating' => 5, 'is_featured' => true, 'sort_order' => 20],
            ['name' => 'Priya S.', 'role' => 'Parent of a LEGO Robotics student', 'avatar' => 'https://placehold.co/120x120/10B981/ffffff.png?text=PS', 'content' => 'The robotics program is fantastic. Small groups, real teamwork, and kids actually learning engineering — not just playing with toys.', 'rating' => 5, 'is_featured' => true, 'sort_order' => 30],
            ['name' => 'Liam B.', 'role' => 'STEM student', 'avatar' => 'https://placehold.co/120x120/F59E0B/ffffff.png?text=LB', 'content' => 'I love the experiments! We built a rocket and a slime circuit. Every class is something new and I always show my friends after.', 'rating' => 5, 'is_featured' => false, 'sort_order' => 40],
            ['name' => 'Sofia M.', 'role' => 'Parent of a competition team member', 'avatar' => 'https://placehold.co/120x120/EF4444/ffffff.png?text=SM', 'content' => 'The competition team completely changed my daughter\'s confidence. She presents to judges now like a pro. Worth every penny.', 'rating' => 5, 'is_featured' => true, 'sort_order' => 50],
            ['name' => 'Daniel K.', 'role' => 'Web development student', 'avatar' => 'https://placehold.co/120x120/8B5CF6/ffffff.png?text=DK', 'content' => 'I built my own website and it\'s actually live on the internet. My friends think I\'m a hacker now. This course is the best.', 'rating' => 5, 'is_featured' => false, 'sort_order' => 60],
        ];

        foreach ($testimonials as $data) {
            Testimonial::updateOrCreate(
                ['name' => $data['name']],
                $data
            );
        }
    }
}
