<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $instructors = User::role('instructor')->get();
        $categories = Category::all();

        $courses = [
            [
                'title' => 'Complete Laravel 12 Masterclass',
                'description' => 'Master Laravel 12 from scratch. Learn routing, controllers, views, Eloquent ORM, authentication, API development, testing, and deployment. This comprehensive course covers everything you need to become a Laravel expert.',
                'objectives' => ['Understand Laravel 12 fundamentals', 'Build RESTful APIs', 'Implement authentication', 'Write tests', 'Deploy applications'],
                'prerequisites' => ['Basic PHP knowledge', 'HTML/CSS basics'],
                'category' => 'Web Development',
                'instructor_index' => 0,
                'level' => 'beginner',
                'duration_hours' => 40.0,
                'price' => 99.99,
                'is_featured' => true,
                'status' => 'published',
                'lessons' => [
                    ['title' => 'Introduction to Laravel', 'content' => 'Welcome to Laravel 12...', 'type' => 'video', 'duration_minutes' => 30, 'is_free' => true],
                    ['title' => 'Setting Up Your Environment', 'content' => 'Let\'s set up your development environment...', 'type' => 'text', 'duration_minutes' => 45],
                    ['title' => 'Routing Basics', 'content' => 'Learn about Laravel routing...', 'type' => 'video', 'duration_minutes' => 60],
                    ['title' => 'Controllers and Views', 'content' => 'Understanding MVC pattern in Laravel...', 'type' => 'video', 'duration_minutes' => 55],
                    ['title' => 'Eloquent ORM', 'content' => 'Working with databases using Eloquent...', 'type' => 'video', 'duration_minutes' => 70],
                    ['title' => 'Authentication', 'content' => 'Building authentication system...', 'type' => 'video', 'duration_minutes' => 50],
                    ['title' => 'API Development', 'content' => 'Creating RESTful APIs...', 'type' => 'video', 'duration_minutes' => 65],
                    ['title' => 'Testing', 'content' => 'Writing tests for your application...', 'type' => 'text', 'duration_minutes' => 40],
                    ['title' => 'Laravel Final Exam', 'content' => 'Test your knowledge...', 'type' => 'quiz', 'duration_minutes' => 30],
                ],
            ],
            [
                'title' => 'React & TypeScript Advanced Patterns',
                'description' => 'Deep dive into advanced React patterns with TypeScript. Learn custom hooks, HOCs, render props, compound components, state machines, and performance optimization techniques.',
                'objectives' => ['Master advanced React patterns', 'Use TypeScript effectively', 'Optimize performance', 'Build scalable applications'],
                'prerequisites' => ['React basics', 'TypeScript basics', 'JavaScript ES6+'],
                'category' => 'Web Development',
                'instructor_index' => 1,
                'level' => 'advanced',
                'duration_hours' => 35.0,
                'price' => 129.99,
                'is_featured' => true,
                'status' => 'published',
                'lessons' => [
                    ['title' => 'TypeScript Fundamentals for React', 'content' => 'TypeScript basics...', 'type' => 'video', 'duration_minutes' => 45, 'is_free' => true],
                    ['title' => 'Advanced Component Patterns', 'content' => 'Component composition...', 'type' => 'video', 'duration_minutes' => 60],
                    ['title' => 'Custom Hooks Deep Dive', 'content' => 'Building reusable hooks...', 'type' => 'video', 'duration_minutes' => 55],
                    ['title' => 'Performance Optimization', 'content' => 'React performance tips...', 'type' => 'text', 'duration_minutes' => 40],
                    ['title' => 'State Management Patterns', 'content' => 'Advanced state management...', 'type' => 'video', 'duration_minutes' => 50],
                    ['title' => 'React Final Assessment', 'content' => 'Comprehensive assessment...', 'type' => 'quiz', 'duration_minutes' => 45],
                ],
            ],
            [
                'title' => 'Python for Data Science',
                'description' => 'Learn Python programming for data science. Cover NumPy, Pandas, Matplotlib, Seaborn, Scikit-learn, and basic machine learning concepts.',
                'objectives' => ['Learn Python for data analysis', 'Master NumPy and Pandas', 'Create data visualizations', 'Build ML models'],
                'prerequisites' => ['Basic programming knowledge'],
                'category' => 'Data Science',
                'instructor_index' => 2,
                'level' => 'intermediate',
                'duration_hours' => 45.0,
                'price' => 149.99,
                'is_featured' => true,
                'status' => 'published',
                'lessons' => [
                    ['title' => 'Python Basics Review', 'content' => 'Quick Python refresher...', 'type' => 'video', 'duration_minutes' => 40, 'is_free' => true],
                    ['title' => 'NumPy Arrays', 'content' => 'Working with NumPy...', 'type' => 'video', 'duration_minutes' => 55],
                    ['title' => 'Pandas DataFrames', 'content' => 'Data manipulation with Pandas...', 'type' => 'video', 'duration_minutes' => 65],
                    ['title' => 'Data Visualization', 'content' => 'Creating charts and graphs...', 'type' => 'video', 'duration_minutes' => 50],
                    ['title' => 'Introduction to ML', 'content' => 'Machine learning basics...', 'type' => 'text', 'duration_minutes' => 45],
                    ['title' => 'Data Science Project', 'content' => 'Hands-on project...', 'type' => 'assignment', 'duration_minutes' => 120],
                ],
            ],
            [
                'title' => 'Docker & Kubernetes for DevOps',
                'description' => 'Master containerization with Docker and orchestration with Kubernetes. Learn CI/CD pipelines, microservices deployment, and cloud-native development.',
                'objectives' => ['Master Docker containers', 'Deploy with Kubernetes', 'Set up CI/CD', 'Manage microservices'],
                'prerequisites' => ['Linux basics', 'Command line proficiency'],
                'category' => 'Cloud & DevOps',
                'instructor_index' => 0,
                'level' => 'intermediate',
                'duration_hours' => 30.0,
                'price' => 119.99,
                'is_featured' => false,
                'status' => 'published',
                'lessons' => [
                    ['title' => 'Introduction to Containers', 'content' => 'What are containers...', 'type' => 'video', 'duration_minutes' => 35, 'is_free' => true],
                    ['title' => 'Docker Fundamentals', 'content' => 'Docker basics...', 'type' => 'video', 'duration_minutes' => 50],
                    ['title' => 'Docker Compose', 'content' => 'Multi-container apps...', 'type' => 'video', 'duration_minutes' => 45],
                    ['title' => 'Kubernetes Basics', 'content' => 'K8s introduction...', 'type' => 'video', 'duration_minutes' => 60],
                ],
            ],
            [
                'title' => 'UX Design Principles',
                'description' => 'Learn the fundamentals of user experience design. Cover research methods, wireframing, prototyping, usability testing, and design systems.',
                'objectives' => ['Understand UX principles', 'Conduct user research', 'Create wireframes and prototypes', 'Conduct usability tests'],
                'prerequisites' => ['None'],
                'category' => 'Design',
                'instructor_index' => 2,
                'level' => 'beginner',
                'duration_hours' => 25.0,
                'price' => 79.99,
                'is_featured' => false,
                'status' => 'published',
                'lessons' => [
                    ['title' => 'What is UX Design?', 'content' => 'Introduction to UX...', 'type' => 'video', 'duration_minutes' => 25, 'is_free' => true],
                    ['title' => 'User Research Methods', 'content' => 'Research techniques...', 'type' => 'text', 'duration_minutes' => 40],
                    ['title' => 'Wireframing', 'content' => 'Creating wireframes...', 'type' => 'video', 'duration_minutes' => 45],
                ],
            ],
        ];

        foreach ($courses as $courseData) {
            $category = $categories->where('name', $courseData['category'])->first();
            $instructor = $instructors[$courseData['instructor_index']];

            $lessonsData = $courseData['lessons'];
            unset($courseData['lessons']);
            unset($courseData['category'], $courseData['instructor_index']);

            $course = Course::firstOrCreate(
                ['slug' => \Str::slug($courseData['title'])],
                array_merge($courseData, [
                    'slug' => \Str::slug($courseData['title']),
                    'category_id' => $category->id,
                    'instructor_id' => $instructor->id,
                    'published_at' => $courseData['status'] === 'published' ? now()->subDays(rand(1, 30)) : null,
                ])
            );

            foreach ($lessonsData as $index => $lessonData) {
                $lesson = $course->lessons()->firstOrCreate(
                    ['slug' => \Str::slug($lessonData['title'])],
                    [
                        'module_name' => 'Module ' . (intdiv($index, 3) + 1),
                        'title' => $lessonData['title'],
                        'slug' => \Str::slug($lessonData['title']),
                        'content' => $lessonData['content'],
                        'type' => $lessonData['type'],
                        'duration_minutes' => $lessonData['duration_minutes'],
                        'sort_order' => $index + 1,
                        'is_free' => $lessonData['is_free'] ?? false,
                    ]
                );

                if ($lessonData['type'] === 'quiz') {
                    $quiz = $lesson->quiz()->firstOrCreate(
                        ['title' => $lessonData['title']],
                        [
                            'title' => $lessonData['title'],
                            'description' => 'Test your knowledge on this topic.',
                            'passing_score' => 70,
                            'time_limit_minutes' => 30,
                            'max_attempts' => 3,
                            'is_randomized' => false,
                        ]
                    );

                    if ($quiz->questions()->count() === 0) {
                        $quiz->questions()->createMany([
                            [
                                'question' => 'What is the primary purpose of this module?',
                                'type' => 'multiple_choice',
                                'options' => ['Learning basics', 'Advanced concepts', 'Review', 'Assessment'],
                                'correct_answer' => 'Assessment',
                                'explanation' => 'This module tests your understanding.',
                                'points' => 1,
                                'sort_order' => 1,
                            ],
                            [
                                'question' => 'True or False: Practice makes perfect.',
                                'type' => 'true_false',
                                'options' => ['True', 'False'],
                                'correct_answer' => 'True',
                                'explanation' => 'Consistent practice improves skills.',
                                'points' => 1,
                                'sort_order' => 2,
                            ],
                        ]);
                    }
                }
            }
        }
    }
}
