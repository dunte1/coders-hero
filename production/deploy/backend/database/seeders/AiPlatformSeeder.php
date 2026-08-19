<?php

namespace Database\Seeders;

use App\Models\AiAssistant;
use App\Models\AiPromptTemplate;
use Illuminate\Database\Seeder;

class AiPlatformSeeder extends Seeder
{
    public function run(): void
    {
        $assistants = [
            [
                'slug' => 'student-tutor',
                'name' => 'Student Tutor',
                'description' => 'Explains concepts, answers questions and helps students master their courses.',
                'category' => 'student',
                'icon' => 'GraduationCap',
                'system_prompt' => "You are the Student Tutor in Coder's Hero. You help students understand concepts by guiding them to answers rather than doing the work for them. Explain ideas clearly, give concrete examples, and check understanding. Keep responses concise and use Markdown formatting. Always encourage students to try problems themselves first.",
            ],
            [
                'slug' => 'teacher-assistant',
                'name' => 'Teacher Assistant',
                'description' => 'Generates lesson plans, quizzes and teaching materials to save teachers time.',
                'category' => 'teacher',
                'icon' => 'BookOpen',
                'system_prompt' => "You are the Teacher Assistant in Coder's Hero. You help teachers create lesson plans, generate quizzes and exam questions, suggest activities, and prepare teaching materials. Align your output with curriculum goals and grade levels. Be practical, structured and ready to adapt to the teacher's needs.",
            ],
            [
                'slug' => 'parent-assistant',
                'name' => 'Parent Assistant',
                'description' => 'Summarizes student performance and helps parents support their children.',
                'category' => 'parent',
                'icon' => 'Users',
                'system_prompt' => "You are the Parent Assistant in Coder's Hero. You help parents understand their child's academic performance, attendance and progress. Summarize reports in plain language, suggest supportive actions, and never disclose sensitive information about other students. Be warm, encouraging and practical.",
            ],
            [
                'slug' => 'admin-assistant',
                'name' => 'Admin Assistant',
                'description' => 'Answers operational questions and helps administrators manage the school.',
                'category' => 'admin',
                'icon' => 'Briefcase',
                'system_prompt' => "You are the Admin Assistant in Coder's Hero. You help school administrators with operational questions about enrollments, fees, staff, reports and platform usage. Provide clear, data-oriented answers and practical suggestions. Respect confidentiality of staff and student records.",
            ],
            [
                'slug' => 'coding-mentor',
                'name' => 'Coding Mentor',
                'description' => 'Debugs code, reviews solutions and recommends next programming lessons.',
                'category' => 'coding',
                'icon' => 'Code2',
                'system_prompt' => "You are the Coding Mentor in Coder's Hero. You debug student code, review solutions, explain programming concepts and recommend practice exercises. Read code carefully, point out bugs with clear explanations, and guide students toward fixes instead of handing them the answer. Use code blocks with language hints.",
            ],
            [
                'slug' => 'robotics-coach',
                'name' => 'Robotics Coach',
                'description' => 'Guides robotics projects, sensors and competition strategy.',
                'category' => 'robotics',
                'icon' => 'Bot',
                'system_prompt' => "You are the Robotics Coach in Coder's Hero. You help students and teachers with robotics projects: sensors, actuators, wiring, code and competition strategy. Encourage safe practices, step-by-step debugging, and hands-on experimentation. Explain both the hardware and software sides clearly.",
            ],
        ];

        foreach ($assistants as $assistant) {
            AiAssistant::updateOrCreate(
                ['slug' => $assistant['slug']],
                $assistant + ['created_by_user_id' => null]
            );
        }

        $templates = [
            [
                'slug' => 'generate-quiz',
                'name' => 'Generate Quiz',
                'description' => 'Create a quiz for a given topic, level and number of questions.',
                'category' => 'teacher',
                'template' => "Create a quiz on the topic \"{{ topic }}\" for {{ level }} level.\n\nRequirements:\n- {{ num_questions }} questions\n- Mix of multiple choice and short answer\n- Include an answer key with brief explanations\n- Label each question with the skill it tests\n\nFormat as a numbered list, then an Answer Key section.",
                'variables' => ['topic', 'level', 'num_questions'],
            ],
            [
                'slug' => 'lesson-plan',
                'name' => 'Generate Lesson Plan',
                'description' => 'Build a structured lesson plan for a topic and duration.',
                'category' => 'teacher',
                'template' => "Create a lesson plan for \"{{ topic }}\" for {{ grade }} lasting {{ duration }} minutes.\n\nInclude: learning objectives, materials needed, an engaging hook, step-by-step activities with time allocations, differentiation ideas, and a short assessment. Keep it practical for a classroom setting.",
                'variables' => ['topic', 'grade', 'duration'],
            ],
            [
                'slug' => 'debug-code',
                'name' => 'Debug Code',
                'description' => 'Explain bugs in a code snippet and suggest fixes.',
                'category' => 'coding',
                'template' => "Here is a code snippet in {{ language }}:\n\n```{{ language }}\n{{ code }}\n```\n\nDescribe: (1) what the code is trying to do, (2) any bugs you can spot, (3) the fix for each bug, and (4) a corrected version. Guide the learner to understand the root cause rather than just pasting the fix.",
                'variables' => ['language', 'code'],
            ],
            [
                'slug' => 'suggest-project',
                'name' => 'Suggest Project',
                'description' => 'Propose a project idea based on skills and level.',
                'category' => 'student',
                'template' => "Suggest a {{ skill }}-focused project for a {{ level }} learner.\n\nGive: a short project description, the learning outcomes, a step-by-step build plan, and 2-3 stretch goals to level it up. The project should be achievable with common tools and take roughly {{ duration }} to complete.",
                'variables' => ['skill', 'level', 'duration'],
            ],
            [
                'slug' => 'recommend-next-lesson',
                'name' => 'Recommend Next Lesson',
                'description' => 'Recommend what to learn next based on recent progress.',
                'category' => 'student',
                'template' => "A student recently completed: \"{{ completed }}\" and is currently working on \"{{ current }}\" with {{ progress }}% progress.\n\nRecommend the next best learning step. Consider their momentum, prerequisites, and a good challenge level. Explain why you recommend it and suggest one concrete activity.",
                'variables' => ['completed', 'current', 'progress'],
            ],
            [
                'slug' => 'summarize-performance',
                'name' => 'Summarize Student Performance',
                'description' => 'Turn performance metrics into a readable summary.',
                'category' => 'parent',
                'template' => "Summarize this student's performance:\n\n- Attendance rate: {{ attendance }}%\n- Average progress: {{ progress }}%\n- Completed courses: {{ completed }}\n- Active courses: {{ active }}\n- Overall grade: {{ grade }}\n\nWrite 3-4 sentences in plain language a parent will understand: strengths, areas to watch, and one concrete suggestion to help them improve.",
                'variables' => ['attendance', 'progress', 'completed', 'active', 'grade'],
            ],
        ];

        foreach ($templates as $template) {
            AiPromptTemplate::updateOrCreate(
                ['slug' => $template['slug']],
                $template + ['created_by_user_id' => null]
            );
        }
    }
}
