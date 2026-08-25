<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class QuizQuestionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    private function createQuizWithQuestions(int $questionCount = 3): Quiz
    {
        $instructor = User::factory()->create();
        $instructor->assignRole('instructor');

        $category = Category::create(['name' => 'Programming', 'slug' => 'programming-' . uniqid()]);

        $course = Course::create([
            'title' => 'Test Course',
            'slug' => 'test-course-' . uniqid(),
            'description' => 'A test course.',
            'category_id' => $category->id,
            'instructor_id' => $instructor->id,
            'level' => 'beginner',
            'status' => 'published',
        ]);

        $lesson = Lesson::create([
            'course_id' => $course->id,
            'title' => 'Lesson 1',
            'slug' => 'lesson-1-' . uniqid(),
            'sort_order' => 1,
            'type' => 'text',
        ]);

        $quiz = Quiz::create([
            'lesson_id' => $lesson->id,
            'title' => 'Test Quiz',
            'passing_score' => 70,
            'max_attempts' => 3,
        ]);

        for ($i = 1; $i <= $questionCount; $i++) {
            QuizQuestion::create([
                'quiz_id' => $quiz->id,
                'question' => "Question {$i}?",
                'type' => 'multiple_choice',
                'options' => ['A', 'B', 'C', 'D'],
                'correct_answer' => 'A',
                'points' => 1,
                'sort_order' => $i,
            ]);
        }

        return $quiz;
    }

    public function test_questions_endpoint_requires_authentication(): void
    {
        $quiz = $this->createQuizWithQuestions();

        $this->getJson("/api/quizzes/{$quiz->id}/questions")
            ->assertStatus(401);
    }

    public function test_questions_endpoint_returns_quiz_questions(): void
    {
        $quiz = $this->createQuizWithQuestions(3);

        $user = User::factory()->create();
        $user->assignRole('student');
        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson("/api/quizzes/{$quiz->id}/questions");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [[
                    'id',
                    'quiz_id',
                    'question',
                    'type',
                    'options',
                    'points',
                    'sort_order',
                ]],
            ]);

        $this->assertEquals($quiz->id, $response->json('data.0.quiz_id'));
    }

    public function test_questions_endpoint_hides_correct_answer_for_students(): void
    {
        $quiz = $this->createQuizWithQuestions(1);

        $student = User::factory()->create();
        $student->assignRole('student');
        Sanctum::actingAs($student, ['*']);

        $response = $this->getJson("/api/quizzes/{$quiz->id}/questions");

        $response->assertOk();

        $question = $response->json('data.0');
        $this->assertArrayNotHasKey('correct_answer', $question);
        $this->assertArrayNotHasKey('explanation', $question);
    }

    public function test_questions_endpoint_shows_correct_answer_for_instructors(): void
    {
        $quiz = $this->createQuizWithQuestions(1);

        $instructor = User::factory()->create();
        $instructor->assignRole('instructor');
        Sanctum::actingAs($instructor, ['*']);

        $response = $this->getJson("/api/quizzes/{$quiz->id}/questions");

        $response->assertOk();

        $question = $response->json('data.0');
        $this->assertArrayHasKey('correct_answer', $question);
        $this->assertArrayHasKey('explanation', $question);
        $this->assertEquals('A', $question['correct_answer']);
    }

    public function test_questions_endpoint_returns_404_for_nonexistent_quiz(): void
    {
        $user = User::factory()->create();
        $user->assignRole('student');
        Sanctum::actingAs($user, ['*']);

        $this->getJson('/api/quizzes/999999/questions')
            ->assertNotFound();
    }

    public function test_questions_endpoint_questions_are_ordered_by_sort_order(): void
    {
        $quiz = $this->createQuizWithQuestions(0);

        QuizQuestion::create([
            'quiz_id' => $quiz->id,
            'question' => 'Last question?',
            'type' => 'multiple_choice',
            'options' => ['A', 'B'],
            'correct_answer' => 'B',
            'points' => 1,
            'sort_order' => 5,
        ]);

        QuizQuestion::create([
            'quiz_id' => $quiz->id,
            'question' => 'First question?',
            'type' => 'multiple_choice',
            'options' => ['A', 'B'],
            'correct_answer' => 'A',
            'points' => 1,
            'sort_order' => 1,
        ]);

        $user = User::factory()->create();
        $user->assignRole('student');
        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson("/api/quizzes/{$quiz->id}/questions");

        $response->assertOk();
        $this->assertEquals('First question?', $response->json('data.0.question'));
        $this->assertEquals('Last question?', $response->json('data.1.question'));
    }
}
