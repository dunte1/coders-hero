<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Bookmark;
use App\Models\Certificate;
use App\Models\Conversation;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\ExamResult;
use App\Models\Fee;
use App\Models\Guardian;
use App\Models\Lesson;
use App\Models\LessonCompletion;
use App\Models\LibraryBorrowing;
use App\Models\LibraryResource;
use App\Models\Notification;
use App\Models\Student;
use App\Models\StudentProject;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MobileAppSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        $this->seedStudents();
        $this->seedEnrollments();
        $this->seedAssignments();
        $this->seedExams();
        $this->seedProjects();
        $this->seedCertificates();
        $this->seedNotifications();
        $this->seedConversations();
        $this->seedFees();
        $this->seedBookmarks();
        $this->seedLessonCompletions();
        $this->seedLibraryBorrowings();

        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $this->command->info('MobileAppSeeder complete.');
    }

    private function seedStudents(): void
    {
        $parent = User::where('email', 'parent@codershero.com')->first();
        if (!$parent) return;

        $guardian = Guardian::firstOrCreate(
            ['user_id' => $parent->id],
            [
                'first_name' => 'Jane', 'last_name' => 'Doe',
                'relationship' => 'parent', 'phone' => '+1-555-0401',
                'email' => 'jane@codershero.com', 'is_primary' => true,
            ]
        );

        $studentsData = [
            ['sid' => 'STU-001', 'fn' => 'Alex', 'ln' => 'Morgan', 'email' => 'alex@example.com', 'gender' => 'male', 'grade' => 'Grade 5'],
            ['sid' => 'STU-002', 'fn' => 'Zara', 'ln' => 'Doe', 'email' => 'zara@example.com', 'gender' => 'female', 'grade' => 'Grade 4'],
            ['sid' => 'STU-003', 'fn' => 'Leo', 'ln' => 'Doe', 'email' => 'leo@example.com', 'gender' => 'male', 'grade' => 'Grade 2'],
            ['sid' => 'STU-004', 'fn' => 'Mia', 'ln' => 'Chen', 'email' => 'mia@example.com', 'gender' => 'female', 'grade' => 'Grade 5'],
            ['sid' => 'STU-005', 'fn' => 'Noah', 'ln' => 'Williams', 'email' => 'noah@example.com', 'gender' => 'male', 'grade' => 'Grade 6'],
        ];

        foreach ($studentsData as $d) {
            $user = User::updateOrCreate(['email' => $d['email']], [
                'name' => $d['fn'] . ' ' . $d['ln'],
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
            ]);
            $user->assignRole('student');

            Student::updateOrCreate(['student_id' => $d['sid']], [
                'user_id' => $user->id,
                'guardian_id' => $guardian->id,
                'first_name' => $d['fn'], 'last_name' => $d['ln'],
                'gender' => $d['gender'], 'grade' => $d['grade'],
                'branch' => 'Main Campus', 'status' => 'active',
                'admission_date' => '2024-09-01',
                'qr_code' => 'CH|' . $d['sid'] . '|' . Str::uuid(),
            ]);
        }
    }

    private function seedEnrollments(): void
    {
        $courses = Course::where('status', 'published')->get();
        $students = Student::where('status', 'active')->whereNotNull('user_id')->get();
        if ($courses->isEmpty() || $students->isEmpty()) return;

        foreach ($students->take(5) as $student) {
            foreach ($courses->take(3) as $course) {
                Enrollment::updateOrCreate(
                    ['user_id' => $student->user_id, 'course_id' => $course->id],
                    [
                        'status' => 'active',
                        'progress' => rand(10, 85),
                        'enrolled_at' => now()->subDays(rand(10, 60)),
                    ]
                );
            }
        }
    }

    private function seedAssignments(): void
    {
        $teacher = User::where('email', 'teacher@codershero.com')->first();
        $course = Course::where('status', 'published')->first();
        $students = Student::where('status', 'active')->whereNotNull('user_id')->take(5)->get();
        if (!$teacher || !$course || $students->isEmpty()) return;

        $data = [
            ['title' => 'Python Basics Quiz', 'desc' => 'Complete exercises from Chapter 3.', 'due' => 7, 'max' => 100],
            ['title' => 'Build a Calculator App', 'desc' => 'Create a calculator using Python tkinter.', 'due' => 14, 'max' => 100],
            ['title' => 'HTML Landing Page', 'desc' => 'Design a responsive landing page.', 'due' => 10, 'max' => 50],
            ['title' => 'Robotics Project Report', 'desc' => 'Write a report on your robotics project.', 'due' => 21, 'max' => 100],
        ];

        foreach ($data as $d) {
            $assignment = Assignment::updateOrCreate(
                ['title' => $d['title'], 'course_id' => $course->id],
                [
                    'description' => $d['desc'], 'teacher_user_id' => $teacher->id,
                    'due_at' => now()->addDays($d['due']),
                    'max_score' => $d['max'], 'status' => 'published',
                ]
            );

            foreach ($students->take(3) as $student) {
                $status = $student->id % 3 == 0 ? 'graded' : ($student->id % 2 == 0 ? 'submitted' : 'draft');
                AssignmentSubmission::updateOrCreate(
                    ['assignment_id' => $assignment->id, 'student_id' => $student->id],
                    [
                        'content' => 'Submission for ' . $d['title'],
                        'status' => $status,
                        'score' => $status == 'graded' ? rand(70, 100) : null,
                        'submitted_at' => $status !== 'draft' ? now()->subDays(2) : null,
                    ]
                );
            }
        }
    }

    private function seedExams(): void
    {
        $teacher = User::where('email', 'teacher@codershero.com')->first();
        $course = Course::where('status', 'published')->first();
        $students = Student::where('status', 'active')->whereNotNull('user_id')->take(5)->get();
        if (!$teacher || !$course || $students->isEmpty()) return;

        $exams = [
            ['title' => 'Python Mid-Term Exam', 'type' => 'midterm', 'marks' => 100, 'pass' => 50, 'dur' => 60, 'status' => 'completed'],
            ['title' => 'HTML/CSS Final Exam', 'type' => 'final', 'marks' => 100, 'pass' => 50, 'dur' => 90, 'status' => 'completed'],
            ['title' => 'Robotics Practical Test', 'type' => 'test', 'marks' => 50, 'pass' => 25, 'dur' => 45, 'status' => 'scheduled'],
        ];

        foreach ($exams as $d) {
            $exam = Exam::updateOrCreate(
                ['title' => $d['title'], 'course_id' => $course->id],
                [
                    'teacher_user_id' => $teacher->id, 'type' => $d['type'],
                    'total_marks' => $d['marks'], 'passing_marks' => $d['pass'],
                    'duration_minutes' => $d['dur'], 'status' => $d['status'],
                    'scheduled_at' => $d['status'] === 'completed' ? now()->subDays(5) : now()->addDays(5),
                ]
            );

            // Seed questions in separate exam_questions table
            if (ExamQuestion::where('exam_id', $exam->id)->count() === 0) {
                $questions = [
                    ['question' => 'What is 2 + 2?', 'options' => ['3', '4', '5', '6'], 'correct_answer' => '4', 'points' => 10],
                    ['question' => 'Capital of France?', 'options' => ['London', 'Paris', 'Berlin', 'Madrid'], 'correct_answer' => 'Paris', 'points' => 10],
                    ['question' => 'HTML is used for?', 'options' => ['Styling', 'Structure', 'Logic', 'Database'], 'correct_answer' => 'Structure', 'points' => 10],
                ];
                foreach ($questions as $i => $q) {
                    ExamQuestion::create(array_merge($q, [
                        'exam_id' => $exam->id, 'sort_order' => $i,
                        'options' => json_encode($q['options']),
                    ]));
                }
            }

            if ($d['status'] === 'completed') {
                foreach ($students->take(3) as $student) {
                    ExamResult::updateOrCreate(
                        ['exam_id' => $exam->id, 'student_id' => $student->id],
                        ['marks_obtained' => rand(40, 100), 'status' => 'graded', 'graded_at' => now()->subHours(2)]
                    );
                }
            }
        }
    }

    private function seedProjects(): void
    {
        $students = Student::where('status', 'active')->whereNotNull('user_id')->take(5)->get();
        if ($students->isEmpty()) return;

        $projects = [
            ['title' => 'Personal Portfolio Website', 'desc' => 'Build a portfolio using HTML, CSS, JS.'],
            ['title' => 'Tic-Tac-Toe Game', 'desc' => 'Create a tic-tac-toe in Python.'],
            ['title' => 'Weather App', 'desc' => 'Build a weather app with API.'],
            ['title' => 'Robot Obstacle Course', 'desc' => 'Program a robot to navigate obstacles.'],
            ['title' => 'Blog Platform', 'desc' => 'Create a blog with authentication.'],
        ];

        foreach ($students as $i => $student) {
            $d = $projects[$i % count($projects)];
            $slug = Str::slug($d['title']);
            StudentProject::updateOrCreate(
                ['slug' => $slug],
                [
                    'student_id' => $student->id,
                    'user_id' => $student->user_id,
                    'title' => $d['title'],
                    'description' => $d['desc'],
                    'technologies' => json_encode(['Python', 'HTML', 'CSS']),
                    'status' => $i % 2 == 0 ? 'in_progress' : 'planning',
                    'is_published' => $i % 2 == 0,
                ]
            );
        }
    }

    private function seedCertificates(): void
    {
        $students = Student::where('status', 'active')->whereNotNull('user_id')->take(3)->get();
        $course = Course::where('status', 'published')->first();
        if ($students->isEmpty() || !$course) return;

        foreach ($students as $i => $student) {
            $enrollment = Enrollment::where('user_id', $student->user_id)->where('course_id', $course->id)->first();
            if (!$enrollment) continue;

            Certificate::updateOrCreate(
                ['certificate_number' => 'CERT-2026-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT)],
                [
                    'user_id' => $student->user_id,
                    'course_id' => $course->id,
                    'enrollment_id' => $enrollment->id,
                    'issued_at' => now()->subDays(rand(1, 30)),
                    'verification_code' => Str::random(16),
                ]
            );
        }
    }

    private function seedNotifications(): void
    {
        // Notifications table uses morphs() (integer IDs) but users have UUIDs.
        // Skip — notifications are generated by the system in real usage.
        $this->command->info('  Skipping notifications (schema mismatch).');
    }

    private function seedConversations(): void
    {
        $parent = User::where('email', 'parent@codershero.com')->first();
        $teacher = User::where('email', 'teacher@codershero.com')->first();
        $student = Student::where('student_id', 'STU-002')->first();
        if (!$parent || !$teacher || !$student) return;

        $conv = Conversation::firstOrCreate(
            ['guardian_user_id' => $parent->id, 'teacher_user_id' => $teacher->id, 'student_id' => $student->id],
            ['last_message_at' => now()]
        );

        if ($conv->messages()->count() === 0) {
            $msgs = [
                ['sender' => $teacher->id, 'body' => "Hi Jane! Zara is doing great in class.", 'days' => 3],
                ['sender' => $parent->id, 'body' => "That's wonderful! She practices every evening.", 'days' => 3],
                ['sender' => $teacher->id, 'body' => "I recommend she try the advanced Python course.", 'days' => 1],
                ['sender' => $parent->id, 'body' => "We'll consider it. Thank you!", 'days' => 0],
            ];
            foreach ($msgs as $m) {
                $conv->messages()->create([
                    'sender_user_id' => $m['sender'], 'body' => $m['body'],
                    'read_at' => now(), 'created_at' => now()->subDays($m['days']),
                ]);
            }
        }

        $student2 = Student::where('student_id', 'STU-003')->first();
        if ($student2) {
            $conv2 = Conversation::firstOrCreate(
                ['guardian_user_id' => $parent->id, 'teacher_user_id' => $teacher->id, 'student_id' => $student2->id],
                ['last_message_at' => now()->subHours(1)]
            );
            if ($conv2->messages()->count() === 0) {
                $conv2->messages()->create([
                    'sender_user_id' => $teacher->id,
                    'body' => "Leo completed the obstacle course challenge!",
                    'created_at' => now()->subHours(1),
                ]);
            }
        }
    }

    private function seedFees(): void
    {
        $students = Student::where('status', 'active')->whereNotNull('user_id')->take(3)->get();
        $parent = User::where('email', 'parent@codershero.com')->first();
        if ($students->isEmpty() || !$parent) return;

        foreach ($students as $student) {
            $fees = [
                ['label' => 'Tuition Fee - Term 1', 'type' => 'tuition', 'amount' => 500, 'status' => 'paid'],
                ['label' => 'Tuition Fee - Term 2', 'type' => 'tuition', 'amount' => 500, 'status' => 'pending'],
                ['label' => 'Lab Materials', 'type' => 'materials', 'amount' => 75, 'status' => 'pending'],
            ];

            foreach ($fees as $f) {
                $fee = Fee::updateOrCreate(
                    ['student_id' => $student->id, 'label' => $f['label']],
                    ['amount' => $f['amount'], 'status' => $f['status'], 'due_date' => now()->addDays(30)]
                );

                if ($f['status'] === 'paid' && $fee->payments()->count() === 0) {
                    $fee->payments()->create([
                        'receipt_no' => 'RCPT-' . strtoupper(Str::random(8)),
                        'amount' => $fee->amount,
                        'method' => 'online',
                        'reference' => 'PAY-' . strtoupper(Str::random(10)),
                        'paid_at' => now()->subMonths(2)->toDateString(),
                        'paid_by_user_id' => $parent->id,
                    ]);
                }
            }
        }
    }

    private function seedBookmarks(): void
    {
        $student = Student::where('student_id', 'STU-001')->first();
        if (!$student) return;
        $lesson = Lesson::first();
        if (!$lesson) return;

        Bookmark::updateOrCreate(
            ['user_id' => $student->user_id, 'bookmarkable_type' => Lesson::class, 'bookmarkable_id' => $lesson->id],
            []
        );
    }

    private function seedLessonCompletions(): void
    {
        $student = Student::where('student_id', 'STU-001')->first();
        if (!$student) return;

        foreach (Lesson::take(3)->get() as $lesson) {
            LessonCompletion::updateOrCreate(
                ['user_id' => $student->user_id, 'lesson_id' => $lesson->id],
                ['completed_at' => now()->subDays(rand(1, 10))]
            );
        }
    }

    private function seedLibraryBorrowings(): void
    {
        $student = Student::where('student_id', 'STU-001')->first();
        if (!$student) return;
        $resource = LibraryResource::first();
        if (!$resource) return;

        LibraryBorrowing::updateOrCreate(
            ['resource_id' => $resource->id, 'user_id' => $student->user_id],
            [
                'borrowed_at' => now()->subDays(10),
                'due_at' => now()->addDays(4),
                'status' => 'borrowed',
            ]
        );
    }
}
