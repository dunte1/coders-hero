<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        $faqs = [
            ['question' => 'What ages are your programs for?', 'answer' => 'Our programs are designed for children aged 5 to 17. STEM Explorers starts at age 5, Scratch and LEGO Robotics suit ages 6-10, while Python, Arduino and our competition team are perfect for older kids and teens.', 'category' => 'general', 'sort_order' => 10],
            ['question' => 'Does my child need any coding experience to start?', 'answer' => 'Not at all. We place students by age and experience level. Beginners start with visual block coding and progress naturally, so every child learns at the right pace.', 'category' => 'general', 'sort_order' => 20],
            ['question' => 'How big are the classes?', 'answer' => 'We keep classes small — typically 6 to 10 students — so every child gets individual attention from an expert instructor.', 'category' => 'general', 'sort_order' => 30],
            ['question' => 'How much do the programs cost?', 'answer' => 'Term fees vary by program, from $160 for our youngest STEM explorers to $420 for the competition season. Many families book multiple terms and we offer sibling discounts. Contact us for the full pricing guide.', 'category' => 'pricing', 'sort_order' => 40],
            ['question' => 'Do you offer a free trial class?', 'answer' => 'Yes! We offer a free trial class so your child can experience a session before you commit. Just fill out the contact form and we will arrange a time.', 'category' => 'general', 'sort_order' => 50],
            ['question' => 'What is the class schedule?', 'answer' => 'We run weekday afternoon and evening classes (3pm - 8pm) and Saturday morning sessions. Each program meets once or twice a week, depending on the track.', 'category' => 'general', 'sort_order' => 60],
            ['question' => 'What equipment and materials are provided?', 'answer' => 'Everything is provided — computers, LEGO robotics kits, Arduino boards, components and all project materials. Students just bring their curiosity!', 'category' => 'programs', 'sort_order' => 70],
            ['question' => 'What will my child actually learn in the coding track?', 'answer' => 'The coding track takes children from Scratch block coding to Python and JavaScript. They learn programming logic, debugging, and build real games, apps and websites they can share.', 'category' => 'programs', 'sort_order' => 80],
            ['question' => 'What will my child learn in the robotics track?', 'answer' => 'Students build and program robots using LEGO WeDo, SPIKE and Arduino. They learn engineering, sensors, motors, and teamwork — progressing to our competition team for advanced builders.', 'category' => 'programs', 'sort_order' => 90],
            ['question' => 'Are your instructors qualified?', 'answer' => 'Yes. Our instructors have strong STEM backgrounds and are trained teachers or experienced engineers and programmers. Every instructor is background-checked and loves working with kids.', 'category' => 'safety', 'sort_order' => 100],
            ['question' => 'How do you keep children safe?', 'answer' => 'Safety comes first. All classes are supervised, instructors are background-checked, our venue is secure, and we have a strict pick-up policy. Tools and components are chosen to be child-friendly.', 'category' => 'safety', 'sort_order' => 110],
            ['question' => 'How do I enroll my child?', 'answer' => 'Easy! Use the contact form on our website, call us, or visit in person. We will match your child to the right program and book a free trial class.', 'category' => 'enrollment', 'sort_order' => 120],
            ['question' => 'What happens at the end of a term?', 'answer' => 'We host a Demo Day where students present their projects to family and friends, and they take home certificates and portfolios of their work.', 'category' => 'general', 'sort_order' => 130],
        ];

        foreach ($faqs as $data) {
            Faq::updateOrCreate(
                ['question' => $data['question']],
                $data
            );
        }
    }
}
