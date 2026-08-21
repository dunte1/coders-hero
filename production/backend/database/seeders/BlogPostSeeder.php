<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Database\Seeder;

class BlogPostSeeder extends Seeder
{
    public function run(): void
    {
        $author = User::role('instructor')->first()
            ?? User::query()->whereHas('roles', fn ($q) => $q->where('name', 'admin'))->first()
            ?? User::first();

        $posts = [
            [
                'title' => 'Why Kids Should Learn to Code (Before They Learn to Drive)',
                'excerpt' => 'Coding teaches problem-solving, creativity and resilience. Here is why starting early gives your child a lifelong superpower.',
                'category' => 'Coding',
                'tags' => ['coding', 'education', 'kids'],
                'content' => '<p>Coding is often described as the new literacy — and for good reason. In a world where technology touches everything, knowing how to build software is a genuine superpower.</p><h2>It teaches problem-solving</h2><p>Programming is really just structured problem-solving. Kids learn to break big problems into small pieces, test ideas, and fix what does not work. That skill transfers to math, science and everyday life.</p><h2>It builds resilience</h2><p>Code rarely works the first time. Kids learn that failure is a step, not a stop. Debugging builds patience, focus and grit — qualities no app can replace.</p><h2>It is creative</h2><p>Coding is not just logic; it is imagination. A blank screen becomes a game, an animation, a robot that dances. Kids get to be creators, not just consumers.</p><p>At Coder\'s Hero we make this journey fun, project-based and age-appropriate — from Scratch blocks at age 6 to Python and robotics for teens.</p>',
                'status' => 'published',
                'is_featured' => true,
                'published_at_days_ago' => 3,
            ],
            [
                'title' => 'LEGO, Motors and Magic: A Parent\'s Guide to Robotics Classes',
                'excerpt' => 'Curious about robotics programs? Here is what your child will build, learn and take away from a robotics term with us.',
                'category' => 'Robotics',
                'tags' => ['robotics', 'LEGO', 'STEM'],
                'content' => '<p>Robotics is where the physical and the digital meet. Children design, build and program real machines — and the magic is watching something they built come to life.</p><h2>What kids actually do</h2><ul><li>Build models with LEGO WeDo, SPIKE and EV3 kits</li><li>Program motors, gears and sensors</li><li>Solve engineering challenges in small teams</li><li>Compete in friendly showcase battles</li></ul><h2>Why it matters</h2><p>Robotics builds engineering intuition, teamwork and perseverance. When a robot fails to complete a mission, the team debugs the design together — exactly how real engineers work.</p><h2>Beyond the classroom</h2><p>Our advanced students join the competition team, gaining tournament experience and portfolios that set them apart. It all starts with a single block.</p>',
                'status' => 'published',
                'is_featured' => true,
                'published_at_days_ago' => 10,
            ],
            [
                'title' => 'Scratch vs Python: Choosing the Right First Language',
                'excerpt' => 'Blocks or text? Here is how to decide what your young coder should start with — and why the answer changes as they grow.',
                'category' => 'Coding',
                'tags' => ['scratch', 'python', 'programming'],
                'content' => '<p>One of the most common questions we hear from parents: should my child start with Scratch or Python?</p><h2>Scratch: the perfect first step</h2><p>Scratch removes the friction of typing by letting kids snap blocks together. They learn sequencing, loops and conditionals while making animations and games — no syntax errors to crush their confidence.</p><h2>Python: real code, real power</h2><p>Around age 10-11, many children are ready to type real code. Python is readable and forgiving, making it the ideal text language. Suddenly, kids can build actual programs and games.</p><h2>Our recommendation</h2><p>Follow the child. Most of our students start with Scratch (ages 6-9) and graduate to Python (ages 10+). Some eager younger coders make the leap early — and that is great too.</p><p>Either way, the goal is the same: a child who thinks like a creator.</p>',
                'status' => 'published',
                'is_featured' => false,
                'published_at_days_ago' => 18,
            ],
            [
                'title' => '5 Signs Your Child Is Ready for STEM Classes',
                'excerpt' => 'Asking "why?" constantly, taking apart toys, building forts — here are the signals your little engineer is ready to level up.',
                'category' => 'STEM',
                'tags' => ['STEM', 'parenting', 'education'],
                'content' => '<p>Every child is curious, but some show an extra spark for how things work. Here are the signs your child is ready for structured STEM learning.</p><ul><li>They ask "why" and "how" about everything — and actually listen to the answers.</li><li>They love building with LEGO, blocks or anything stackable.</li><li>They take things apart to see what is inside.</li><li>They enjoy games and puzzles that involve logic.</li><li>They get frustrated but keep trying when something is hard.</li></ul><p>If you checked three or more, a trial class is a perfect next step. Our STEM Explorers program for ages 5-8 turns that curiosity into experiments, builds and big discoveries.</p>',
                'status' => 'published',
                'is_featured' => false,
                'published_at_days_ago' => 26,
            ],
            [
                'title' => 'From Screen Time to Build Time: The Game Development Journey',
                'excerpt' => 'Turn your child\'s love of video games into a passion for building them. Here is how game dev classes transform players into creators.',
                'category' => 'Coding',
                'tags' => ['gamedev', 'python', 'kids'],
                'content' => '<p>It is the classic parenting tension: screens. But what if screen time could become build time?</p><h2>Players become designers</h2><p>In our game development course, students stop asking "how do I unlock this level?" and start asking "how do I design a better level?" They plan, code and playtest their own games.</p><h2>Real skills, disguised as fun</h2><p>Building a game requires math, logic, design and debugging — all wrapped in an activity kids genuinely love. Our students use Python and Pygame to create everything from arcade classics to 2D adventures.</p><h2>Pride in the work</h2><p>The end-of-term Demo Day is unforgettable. Kids proudly show their games to family and friends — and quietly realize they built something from nothing.</p>',
                'status' => 'published',
                'is_featured' => false,
                'published_at_days_ago' => 35,
            ],
            [
                'title' => 'Parent FAQs: Everything You Wondered About Coder\'s Hero',
                'excerpt' => 'Class sizes, schedules, safety, refunds and more — straight answers to the questions we hear most often from new families.',
                'category' => 'General',
                'tags' => ['faq', 'enrollment', 'safety'],
                'content' => '<p>We love talking to parents. Here are the questions we are asked most often, answered honestly.</p><h2>What ages do you teach?</h2><p>Programs run for ages 5 to 17, with tracks matched to age and experience.</p><h2>How many kids per class?</h2><p>Six to ten. Small enough for real attention, big enough for teamwork.</p><h2>Do you provide equipment?</h2><p>Everything — computers, robotics kits, Arduino boards and materials.</p><h2>What if my child misses a class?</h2><p>We offer make-up sessions in another class time, space permitting.</p><h2>How are my children kept safe?</h2><p>Background-checked instructors, supervised classes, secure venue and a strict pick-up policy.</p><p>Have another question? Ask us on the contact page — a real human always answers.</p>',
                'status' => 'published',
                'is_featured' => false,
                'published_at_days_ago' => 42,
            ],
        ];

        foreach ($posts as $index => $data) {
            $publishedAtDaysAgo = $data['published_at_days_ago'];
            unset($data['published_at_days_ago']);

            $existing = BlogPost::where('slug', \Str::slug($data['title']))->first();

            $data['published_at'] = now()->subDays($publishedAtDaysAgo);
            $data['author_id'] = $author?->id;
            $data['views'] = 50 + ($index * 37) % 450;

            if ($existing) {
                $existing->update($data);
            } else {
                BlogPost::create($data);
            }
        }
    }
}
