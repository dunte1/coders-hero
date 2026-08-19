<?php

namespace Database\Seeders;

use App\Models\AiTutorConversation;
use App\Models\AiTutorMessage;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Attendance;
use App\Models\Bookmark;
use App\Models\CalendarEvent;
use App\Models\CodingExercise;
use App\Models\CodingSubmission;
use App\Models\Course;
use App\Models\CourseRating;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\ForumPost;
use App\Models\ForumThread;
use App\Models\GradebookEntry;
use App\Models\Lesson;
use App\Models\LessonCompletion;
use App\Models\LessonNote;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use App\Models\VideoProgress;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TeacherLmsSeeder extends Seeder
{
    public function run(): void
    {
        $teacher = User::firstOrCreate(
            ['email' => 'teacher@codershero.com'],
            [
                'name' => 'Sarah Johnson',
                'password' => Hash::make('password'),
                'phone' => '+1-555-0301',
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );
        $teacher->assignRole('teacher');

        $students = Student::where('status', 'active')->take(12)->get();
        if ($students->isEmpty()) {
            $students = $this->seedStudents($teacher);
        }

        $course = Course::where('status', 'published')->first();
        if (!$course) {
            $course = Course::first();
        }

        $class = SchoolClass::updateOrCreate(
            ['name' => 'Grade 4 Coding & Robotics'],
            [
                'teacher_user_id' => $teacher->id,
                'subject' => 'Coding & Robotics',
                'description' => 'Introductory coding and robotics for Grade 4 students.',
                'room' => 'STEM Lab A',
                'color' => '#6366f1',
                'schedule' => ['days' => ['Mon', 'Wed', 'Fri'], 'time' => '09:00-10:00'],
                'status' => 'active',
                'capacity' => 24,
            ]
        );
        $class->students()->syncWithoutDetaching($students->pluck('id'));

        $classB = SchoolClass::updateOrCreate(
            ['name' => 'Grade 6 Python Basics'],
            [
                'teacher_user_id' => $teacher->id,
                'subject' => 'Python Programming',
                'description' => 'Learn the fundamentals of Python.',
                'room' => 'STEM Lab B',
                'color' => '#10b981',
                'schedule' => ['days' => ['Tue', 'Thu'], 'time' => '11:00-12:00'],
                'status' => 'active',
                'capacity' => 24,
            ]
        );
        $classB->students()->syncWithoutDetaching($students->pluck('id'));

        $this->seedAttendance($class, $students, $teacher);
        $this->seedAssignments($class, $students, $teacher);
        $this->seedExams($class, $students, $teacher);
        $this->seedGradebook($class, $students, $teacher);
        $this->seedLessonNotes($class, $teacher);
        $this->seedCalendarEvents($class, $teacher);

        if ($course) {
            $this->seedForum($course, $teacher);
            $this->seedCodingExercises($course, $teacher);
            $this->seedAiTutor($course, $teacher);
            $this->seedRatings($course, $teacher, $students);
            $this->seedVideoProgress($course, $teacher);
        }
    }

    private function seedStudents(User $teacher): \Illuminate\Support\Collection
    {
        $names = [
            ['Zara', 'Smith'], ['Leo', 'Brown'], ['Mia', 'Davis'],
            ['Noah', 'Wilson'], ['Ava', 'Taylor'], ['Liam', 'Moore'],
            ['Emma', 'Jones'], ['Ethan', 'Garcia'], ['Sofia', 'Martinez'],
            ['Oliver', 'Lee'], ['Isla', 'Walker'], ['Mason', 'Hall'],
        ];

        $students = collect();
        foreach ($names as $index => [$first, $last]) {
            $student = Student::updateOrCreate(
                ['student_id' => 'STU200' . str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT)],
                [
                    'first_name' => $first,
                    'last_name' => $last,
                    'gender' => in_array($index, [0, 2, 4, 6, 8, 10], true) ? 'female' : 'male',
                    'grade' => 'Grade 4',
                    'branch' => 'Main Campus',
                    'admission_date' => '2025-09-01',
                    'status' => 'active',
                    'qr_code' => 'CH|STU200' . str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT) . '|' . Str::uuid(),
                ]
            );
            $students->push($student);
        }

        return $students;
    }

    private function seedAttendance(SchoolClass $class, $students, User $teacher): void
    {
        foreach (range(1, 5) as $day) {
            $date = now()->subDays($day)->toDateString();
            foreach ($students as $index => $student) {
                $status = match ($index % 5) {
                    3 => 'late',
                    4 => 'absent',
                    default => 'present',
                };
                Attendance::updateOrCreate(
                    ['student_id' => $student->id, 'attendance_date' => $date],
                    [
                        'status' => $status,
                        'check_in' => $status === 'absent' ? null : '08:30',
                        'check_out' => $status === 'absent' ? null : '15:30',
                        'recorded_by' => $teacher->id,
                    ]
                );
            }
        }
    }

    private function seedAssignments(SchoolClass $class, $students, User $teacher): void
    {
        $assignments = [
            ['title' => 'Scratch Maze Project', 'type' => 'project', 'max_score' => 100, 'status' => 'published', 'due' => 3],
            ['title' => 'Python Loop Worksheet', 'type' => 'homework', 'max_score' => 50, 'status' => 'published', 'due' => 5],
            ['title' => 'Robotics Design Challenge', 'type' => 'classwork', 'max_score' => 80, 'status' => 'draft', 'due' => 10],
        ];

        foreach ($assignments as $data) {
            $assignment = Assignment::firstOrCreate(
                ['class_id' => $class->id, 'title' => $data['title']],
                [
                    'teacher_user_id' => $teacher->id,
                    'course_id' => null,
                    'description' => "Complete the {$data['title']} activity.",
                    'instructions' => "Follow the instructions in class and submit before the deadline.",
                    'type' => $data['type'],
                    'max_score' => $data['max_score'],
                    'due_at' => now()->addDays($data['due']),
                    'published_at' => $data['status'] === 'published' ? now() : null,
                    'status' => $data['status'],
                ]
            );

            if ($assignment->submissions()->count() === 0 && $data['status'] === 'published') {
                foreach ($students->take(8) as $index => $student) {
                    $assignment->submissions()->create([
                        'student_id' => $student->id,
                        'content' => "Here is my submission for {$assignment->title}.",
                        'status' => $index % 2 === 0 ? 'graded' : 'submitted',
                        'is_late' => $index === 5,
                        'score' => $index % 2 === 0 ? rand(60, $assignment->max_score) : null,
                        'feedback' => $index % 2 === 0 ? 'Great work! Watch your spelling.' : null,
                        'graded_by' => $index % 2 === 0 ? $teacher->id : null,
                        'submitted_at' => now()->subDay(),
                        'graded_at' => $index % 2 === 0 ? now() : null,
                    ]);
                }
            }
        }
    }

    private function seedExams(SchoolClass $class, $students, User $teacher): void
    {
        $exams = [
            ['title' => 'Term 1 Coding Exam', 'type' => 'test', 'total_marks' => 100, 'passing_marks' => 50, 'status' => 'completed'],
            ['title' => 'Python Midterm', 'type' => 'midterm', 'total_marks' => 100, 'passing_marks' => 55, 'status' => 'scheduled'],
        ];

        foreach ($exams as $data) {
            $exam = Exam::firstOrCreate(
                ['class_id' => $class->id, 'title' => $data['title']],
                [
                    'teacher_user_id' => $teacher->id,
                    'course_id' => null,
                    'description' => $data['title'],
                    'type' => $data['type'],
                    'scheduled_at' => now()->addDays(7),
                    'duration_minutes' => 60,
                    'total_marks' => $data['total_marks'],
                    'passing_marks' => $data['passing_marks'],
                    'status' => $data['status'],
                ]
            );

            if ($exam->results()->count() === 0 && $data['status'] === 'completed') {
                foreach ($students as $index => $student) {
                    if ($index % 6 === 5) {
                        $marks = null;
                        $status = 'absent';
                        $grade = null;
                        $percentage = null;
                    } else {
                        $marks = rand(40, 100);
                        $percentage = round(($marks / $data['total_marks']) * 100, 2);
                        $grade = $percentage >= 90 ? 'A' : ($percentage >= 75 ? 'B' : ($percentage >= 50 ? 'C' : 'F'));
                        $status = 'graded';
                    }
                    $exam->results()->create([
                        'student_id' => $student->id,
                        'marks_obtained' => $marks,
                        'percentage' => $percentage,
                        'grade' => $grade,
                        'remarks' => $marks !== null ? 'Good effort.' : 'Not attempted.',
                        'status' => $status,
                        'graded_by' => $marks !== null ? $teacher->id : null,
                        'graded_at' => $marks !== null ? now() : null,
                    ]);
                }
            }
        }
    }

    private function seedGradebook(SchoolClass $class, $students, User $teacher): void
    {
        $components = ['assignment', 'exam', 'quiz', 'participation', 'homework', 'project'];
        foreach ($students as $student) {
            foreach ($components as $component) {
                GradebookEntry::firstOrCreate(
                    [
                        'class_id' => $class->id,
                        'student_id' => $student->id,
                        'component' => $component,
                        'title' => ucfirst($component) . ' - Term 1',
                    ],
                    [
                        'teacher_user_id' => $teacher->id,
                        'course_id' => null,
                        'score' => rand(55, 100),
                        'max_score' => 100,
                        'weight' => match ($component) {
                            'exam' => 0.3,
                            'assignment' => 0.2,
                            'project' => 0.2,
                            'quiz' => 0.1,
                            'participation' => 0.1,
                            default => 0.1,
                        },
                        'graded_on' => now()->subDays(rand(1, 10)),
                        'feedback' => 'Keep it up!',
                    ]
                );
            }
        }
    }

    private function seedLessonNotes(SchoolClass $class, User $teacher): void
    {
        $notes = [
            ['title' => 'Scratch Basics - Day 1', 'content' => 'Covered sprites, costumes, and the motion blocks. Students built a simple animation.'],
            ['title' => 'Python Variables', 'content' => 'Introduced variables, strings and integers. Worked through practice exercises together.'],
        ];

        foreach ($notes as $note) {
            LessonNote::firstOrCreate(
                ['class_id' => $class->id, 'title' => $note['title']],
                [
                    'teacher_user_id' => $teacher->id,
                    'lesson_id' => null,
                    'content' => $note['content'],
                    'attachments' => null,
                    'note_date' => now()->subDays(rand(1, 7))->toDateString(),
                ]
            );
        }
    }

    private function seedCalendarEvents(SchoolClass $class, User $teacher): void
    {
        $events = [
            ['title' => 'Parent-Teacher Meeting', 'event_type' => 'meeting', 'days' => 3],
            ['title' => 'End of Term Assembly', 'event_type' => 'activity', 'days' => 14],
            ['title' => 'STEM Fair', 'event_type' => 'activity', 'days' => 21],
        ];

        foreach ($events as $event) {
            CalendarEvent::firstOrCreate(
                ['user_id' => $teacher->id, 'title' => $event['title']],
                [
                    'class_id' => $class->id,
                    'description' => $event['title'],
                    'event_type' => $event['event_type'],
                    'starts_at' => now()->addDays($event['days'])->setTime(10, 0),
                    'ends_at' => now()->addDays($event['days'])->setTime(11, 0),
                    'all_day' => false,
                    'location' => 'Main Hall',
                    'color' => '#f59e0b',
                ]
            );
        }
    }

    private function seedForum(Course $course, User $teacher): void
    {
        $thread = ForumThread::firstOrCreate(
            ['course_id' => $course->id, 'title' => 'Welcome to the course forum!'],
            [
                'user_id' => $teacher->id,
                'content' => "Welcome everyone! Introduce yourself and share what you're excited to learn this term.",
                'is_pinned' => true,
                'is_locked' => false,
                'views' => rand(20, 80),
            ]
        );

        if ($thread->posts()->count() === 0) {
            ForumPost::create([
                'thread_id' => $thread->id,
                'user_id' => $teacher->id,
                'content' => 'Looking forward to a great term with all of you!',
                'parent_id' => null,
            ]);
        }

        ForumThread::firstOrCreate(
            ['course_id' => $course->id, 'title' => 'How to install Python?'],
            [
                'user_id' => $teacher->id,
                'content' => 'Post questions about setting up your coding environment here.',
                'is_pinned' => false,
                'is_locked' => false,
                'views' => rand(5, 30),
            ]
        );
    }

    private function seedCodingExercises(Course $course, User $teacher): void
    {
        $lesson = Lesson::where('course_id', $course->id)->first();

        $exercises = [
            [
                'title' => 'Sum of Two Numbers',
                'description' => 'Write a function that returns the sum of two numbers.',
                'instructions' => 'Implement `add(a, b)` that returns `a + b`.',
                'starter_code' => "def add(a, b):\n    # your code here\n    pass",
                'solution_code' => "def add(a, b):\n    return a + b",
                'difficulty' => 'easy',
                'test_cases' => [
                    ['input' => [1, 2], 'expected' => 3],
                    ['input' => [5, 7], 'expected' => 12],
                    ['input' => [-1, 1], 'expected' => 0],
                ],
            ],
            [
                'title' => 'Even or Odd',
                'description' => 'Determine whether a number is even or odd.',
                'instructions' => 'Implement `is_even(n)` returning True if even.',
                'starter_code' => "def is_even(n):\n    # your code here\n    pass",
                'solution_code' => "def is_even(n):\n    return n % 2 == 0",
                'difficulty' => 'easy',
                'test_cases' => [
                    ['input' => [4], 'expected' => true],
                    ['input' => [7], 'expected' => false],
                    ['input' => [0], 'expected' => true],
                ],
            ],
            [
                'title' => 'Reverse a String',
                'description' => 'Return the reversed version of a string.',
                'instructions' => 'Implement `reverse(s)` that returns `s` reversed.',
                'starter_code' => "def reverse(s):\n    # your code here\n    pass",
                'solution_code' => "def reverse(s):\n    return s[::-1]",
                'difficulty' => 'medium',
                'test_cases' => [
                    ['input' => ['abc'], 'expected' => 'cba'],
                    ['input' => ['hello'], 'expected' => 'olleh'],
                    ['input' => [''], 'expected' => ''],
                ],
            ],
        ];

        foreach ($exercises as $data) {
            $exercise = CodingExercise::firstOrCreate(
                ['course_id' => $course->id, 'title' => $data['title']],
                array_merge($data, [
                    'lesson_id' => $lesson?->id,
                    'author_user_id' => $teacher->id,
                    'language' => 'python',
                    'status' => 'published',
                ])
            );

            if ($exercise->submissions()->count() === 0) {
                CodingSubmission::create([
                    'exercise_id' => $exercise->id,
                    'user_id' => $teacher->id,
                    'code' => $data['solution_code'],
                    'status' => 'correct',
                    'score' => 100,
                    'result' => array_map(fn ($tc) => [
                        'index' => 0,
                        'input' => $tc['input'],
                        'expected' => $tc['expected'],
                        'actual' => $tc['expected'],
                        'passed' => true,
                    ], $data['test_cases']),
                    'feedback' => 'All tests passed!',
                    'submitted_at' => now(),
                ]);
            }
        }
    }

    private function seedAiTutor(Course $course, User $teacher): void
    {
        $conversation = AiTutorConversation::firstOrCreate(
            ['user_id' => $teacher->id, 'title' => 'Help with Python loops'],
            [
                'course_id' => $course->id,
                'lesson_id' => null,
            ]
        );

        if ($conversation->messages()->count() === 0) {
            $conversation->messages()->create([
                'role' => 'user',
                'content' => "Can you explain how for loops work in Python?",
                'meta' => null,
            ]);
            $conversation->messages()->create([
                'role' => 'assistant',
                'content' => "A for loop iterates over a sequence like a list, tuple, or string. For example:\n\nfor i in range(5):\n    print(i)\n\nThis prints 0 through 4. Each iteration, `i` takes the next value from the sequence. You can also iterate over items directly:\n\nfor fruit in ['apple', 'banana']:\n    print(fruit)",
                'meta' => ['source' => 'seeded'],
            ]);
        }
    }

    private function seedRatings(Course $course, User $teacher, $students): void
    {
        $ratings = [[5, 'Excellent course, very engaging!'], [4, 'Great content, would love more practice problems.'], [5, 'My child loves this course!']];
        $users = $students->map(fn ($s) => $s->user_id)->filter();
        $reviewers = $users->push($teacher->id)->all();

        foreach ($ratings as $index => [$rating, $review]) {
            $user = $reviewers[$index % count($reviewers)] ?? $teacher->id;
            CourseRating::updateOrCreate(
                ['course_id' => $course->id, 'user_id' => $user],
                ['rating' => $rating, 'review' => $review]
            );
        }

        $count = CourseRating::where('course_id', $course->id)->count();
        $avg = $count > 0 ? CourseRating::where('course_id', $course->id)->avg('rating') : 0;
        $meta = $course->meta ?? [];
        $meta['average_rating'] = round((float) $avg, 2);
        $meta['ratings_count'] = $count;
        $course->update(['meta' => $meta]);
    }

    private function seedVideoProgress(Course $course, User $teacher): void
    {
        $lessons = Lesson::where('course_id', $course->id)->get();

        foreach ($lessons as $index => $lesson) {
            $completed = $index % 3 !== 2;
            $duration = $lesson->duration_minutes * 60 ?: 600;
            VideoProgress::updateOrCreate(
                ['lesson_id' => $lesson->id, 'user_id' => $teacher->id],
                [
                    'watched_seconds' => $completed ? $duration : (int) round($duration * 0.5),
                    'duration_seconds' => $duration,
                    'completed' => $completed,
                    'last_watched_at' => now()->subDays($index),
                ]
            );

            if ($completed) {
                LessonCompletion::firstOrCreate(
                    ['user_id' => $teacher->id, 'lesson_id' => $lesson->id],
                    [
                        'enrollment_id' => null,
                        'completed_at' => now()->subDays($index),
                        'time_spent_minutes' => $lesson->duration_minutes ?? 15,
                    ]
                );
            }
        }
    }
}
