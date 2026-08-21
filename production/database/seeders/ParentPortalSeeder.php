<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\CodingProgress;
use App\Models\Conversation;
use App\Models\Fee;
use App\Models\Guardian;
use App\Models\Message;
use App\Models\Payment;
use App\Models\ReportCard;
use App\Models\ReportCardItem;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ParentPortalSeeder extends Seeder
{
    public function run(): void
    {
        $parentUser = User::updateOrCreate(
            ['email' => 'parent@codershero.com'],
            [
                'name' => 'Jane Doe',
                'password' => Hash::make('password'),
                'phone' => '+1-555-0401',
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );
        $parentUser->assignRole('parent');

        $guardian = Guardian::updateOrCreate(
            ['email' => 'jane@codershero.com'],
            [
                'user_id' => $parentUser->id,
                'first_name' => 'Jane',
                'last_name' => 'Doe',
                'relationship' => 'parent',
                'phone' => '+1-555-0401',
                'address' => '123 Maple Street',
                'occupation' => 'Software Engineer',
                'is_primary' => true,
            ]
        );

        foreach (Student::whereNull('guardian_id')->get() as $student) {
            $student->update(['guardian_id' => $guardian->id]);
        }

        $teacher = User::role('instructor')->first();
        if (!$teacher) {
            $teacher = User::create([
                'name' => 'Sarah Johnson',
                'email' => 'sarah@codershero.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
            ]);
            $teacher->assignRole('instructor');
        }

        $demos = [
            ['student_id' => 'STU10001', 'first_name' => 'Zara', 'last_name' => 'Doe', 'gender' => 'female', 'grade' => 'Grade 4', 'branch' => 'Main Campus', 'status' => 'active'],
            ['student_id' => 'STU10002', 'first_name' => 'Leo', 'last_name' => 'Doe', 'gender' => 'male', 'grade' => 'Grade 2', 'branch' => 'Main Campus', 'status' => 'active'],
        ];

        foreach ($demos as $data) {
            $student = Student::updateOrCreate(
                ['student_id' => $data['student_id']],
                array_merge($data, [
                    'guardian_id' => $guardian->id,
                    'admission_date' => '2024-09-01',
                    'qr_code' => 'CH|' . $data['student_id'] . '|' . Str::uuid(),
                ])
            );

            $this->seedReportCards($student);
            $this->seedCodingProgress($student);
            $this->seedFees($student, $parentUser);
            $this->seedAppointment($student, $guardian, $teacher);
            $this->seedConversation($student, $parentUser, $teacher);
        }
    }

    private function seedReportCards(Student $student): void
    {
        $terms = [
            [
                'term' => 'Term 1',
                'academic_year' => '2025/2026',
                'issued_at' => '2026-02-27',
                'overall_grade' => 'A',
                'average_score' => 91.5,
                'teacher_notes' => 'Excellent start to the year. Keep up the great work!',
                'items' => [
                    ['subject' => 'Mathematics', 'score' => 92, 'grade' => 'A', 'teacher_comment' => 'Strong problem solving skills.'],
                    ['subject' => 'Science', 'score' => 88, 'grade' => 'B+', 'teacher_comment' => 'Great in hands-on experiments.'],
                    ['subject' => 'English', 'score' => 90, 'grade' => 'A-', 'teacher_comment' => 'Clear and confident communicator.'],
                    ['subject' => 'Coding', 'score' => 96, 'grade' => 'A+', 'teacher_comment' => 'Exceptional logic and creativity.'],
                ],
            ],
            [
                'term' => 'Term 2',
                'academic_year' => '2025/2026',
                'issued_at' => '2026-07-10',
                'overall_grade' => 'A',
                'average_score' => 93.0,
                'teacher_notes' => 'Outstanding progress. A pleasure to teach.',
                'items' => [
                    ['subject' => 'Mathematics', 'score' => 94, 'grade' => 'A', 'teacher_comment' => 'Advanced reasoning on full display.'],
                    ['subject' => 'Science', 'score' => 91, 'grade' => 'A-', 'teacher_comment' => 'Curious and thorough.'],
                    ['subject' => 'English', 'score' => 90, 'grade' => 'A-', 'teacher_comment' => 'Excellent written work.'],
                    ['subject' => 'Coding', 'score' => 97, 'grade' => 'A+', 'teacher_comment' => 'Building impressive projects.'],
                ],
            ],
        ];

        foreach ($terms as $term) {
            $items = $term['items'];
            unset($term['items']);
            $reportCard = ReportCard::firstOrCreate(
                ['student_id' => $student->id, 'term' => $term['term'], 'academic_year' => $term['academic_year']],
                $term
            );
            if ($reportCard->items()->count() === 0) {
                foreach ($items as $item) {
                    $reportCard->items()->create($item);
                }
            }
        }
    }

    private function seedCodingProgress(Student $student): void
    {
        $skills = [
            ['skill' => 'Block Programming', 'level' => 3, 'progress' => 100, 'badge' => 'Scratch Master', 'notes' => 'Completed all Scratch levels.'],
            ['skill' => 'Python Basics', 'level' => 2, 'progress' => 65, 'badge' => null, 'notes' => 'Working on loops and functions.'],
            ['skill' => 'Web Development', 'level' => 1, 'progress' => 35, 'badge' => null, 'notes' => 'Learning HTML and CSS.'],
            ['skill' => 'Robotics', 'level' => 2, 'progress' => 70, 'badge' => 'Robot Builder', 'notes' => 'Completed the Lego robotics track.'],
        ];

        foreach ($skills as $skill) {
            CodingProgress::updateOrCreate(
                ['student_id' => $student->id, 'skill' => $skill['skill']],
                $skill
            );
        }
    }

    private function seedFees(Student $student, User $parentUser): void
    {
        $fees = [
            ['label' => 'Tuition Fee - Term 1', 'amount' => 450.00, 'due_date' => '2026-01-15', 'status' => 'paid'],
            ['label' => 'Tuition Fee - Term 2', 'amount' => 450.00, 'due_date' => '2026-06-15', 'status' => 'pending'],
            ['label' => 'Coding Kit & Materials', 'amount' => 120.00, 'due_date' => '2026-08-20', 'status' => 'pending'],
        ];

        foreach ($fees as $feeData) {
            $fee = Fee::firstOrCreate(
                ['student_id' => $student->id, 'label' => $feeData['label']],
                $feeData
            );

            if ($fee->status === 'paid' && $fee->payments()->count() === 0) {
                $fee->payments()->create([
                    'receipt_no' => 'RCPT-' . strtoupper(Str::random(8)),
                    'amount' => $fee->amount,
                    'method' => 'online',
                    'reference' => 'PAY-' . Str::upper(Str::random(10)),
                    'paid_at' => now()->subMonths(2)->toDateString(),
                    'paid_by_user_id' => $parentUser->id,
                ]);
            }
        }
    }

    private function seedAppointment(Student $student, Guardian $guardian, User $teacher): void
    {
        Appointment::firstOrCreate(
            ['guardian_id' => $guardian->id, 'reason' => 'Parent-Teacher Meeting'],
            [
                'student_id' => $student->id,
                'teacher_user_id' => $teacher->id,
                'scheduled_at' => now()->addDays(3)->setTime(10, 0),
                'duration_minutes' => 30,
                'status' => 'confirmed',
                'notes' => 'Discuss coding progress and upcoming curriculum.',
            ]
        );
    }

    private function seedConversation(Student $student, User $parentUser, User $teacher): void
    {
        $conversation = Conversation::firstOrCreate(
            ['guardian_user_id' => $parentUser->id, 'teacher_user_id' => $teacher->id, 'student_id' => $student->id],
            ['last_message_at' => now()]
        );

        if ($conversation->messages()->count() === 0) {
            $conversation->messages()->create([
                'sender_user_id' => $teacher->id,
                'body' => "Hi! Just a quick update on {$student->first_name}'s progress — really impressed with the latest Python project.",
                'read_at' => null,
                'created_at' => now()->subDays(2),
            ]);
            $conversation->messages()->create([
                'sender_user_id' => $parentUser->id,
                'body' => "Thank you! {$student->first_name} has been very excited about it at home.",
                'read_at' => now()->subDays(1),
                'created_at' => now()->subDays(1),
            ]);
        }
    }
}
