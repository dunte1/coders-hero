<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Certificate;
use App\Models\CertificateTemplate;
use App\Models\CertificateVerification;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CertificateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
        $this->seed(PermissionSeeder::class);

        Storage::fake('public');
    }

    private function user(string $role = 'admin'): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    private function course(): Course
    {
        $instructor = User::factory()->create();
        $category = Category::create([
            'name' => 'Programming ' . uniqid(),
            'slug' => 'programming-' . uniqid(),
        ]);

        return Course::create([
            'title' => 'Intro to Python ' . uniqid(),
            'slug' => 'intro-to-python-' . uniqid(),
            'description' => 'A basic course.',
            'category_id' => $category->id,
            'instructor_id' => $instructor->id,
            'level' => 'beginner',
            'status' => 'published',
        ]);
    }

    private function enrollment(string $status = 'completed'): Enrollment
    {
        $user = $this->user('student');

        return Enrollment::create([
            'user_id' => $user->id,
            'course_id' => $this->course()->id,
            'status' => $status,
            'enrolled_at' => now()->subMonths(2),
            'completed_at' => $status === 'completed' ? now()->subWeek() : null,
            'progress' => $status === 'completed' ? 100 : 0,
        ]);
    }

    private function template(array $overrides = []): CertificateTemplate
    {
        return CertificateTemplate::create(array_merge([
            'name' => 'Standard ' . uniqid(),
            'slug' => 'standard-' . uniqid(),
            'description' => 'Default template.',
            'body_html' => '<h1>Certificate</h1><h2>{{ holder }}</h2><p>{{ course }}</p><p>{{ certificate_number }}</p>',
            'accent_color' => '#6366f1',
            'font_family' => 'DejaVu Sans',
            'signature_name' => 'Dr. Jane Doe',
            'signature_title' => 'Principal',
            'is_default' => true,
            'is_active' => true,
            'created_by_user_id' => $this->user('admin')->id,
        ], $overrides));
    }

    private function certificate(array $overrides = []): Certificate
    {
        $enrollment = $this->enrollment();

        return Certificate::create(array_merge([
            'user_id' => $enrollment->user_id,
            'course_id' => $enrollment->course_id,
            'enrollment_id' => $enrollment->id,
            'template_id' => $this->template()->id,
            'certificate_number' => 'CH-' . strtoupper(substr(uniqid(), -6)),
            'issued_at' => now()->subDay(),
            'verification_code' => 'VERIFY' . uniqid(),
            'qr_code' => 'QR-' . strtoupper(uniqid()),
            'digital_signature' => 'Dr. Jane Doe',
            'status' => 'issued',
            'issued_by_user_id' => $this->user('admin')->id,
        ], $overrides));
    }

    // ---- Auth isolation ----

    public function test_certificate_endpoints_require_authentication(): void
    {
        $this->getJson('/api/certificates')->assertStatus(401);
        $this->getJson('/api/certificates/1')->assertStatus(401);
        $this->getJson('/api/certificates/CH-123/download')->assertStatus(401);
        $this->getJson('/api/admin/certificates')->assertStatus(401);
        $this->postJson('/api/admin/certificate-templates', [])->assertStatus(401);
    }

    public function test_public_verify_does_not_require_authentication(): void
    {
        $certificate = $this->certificate();

        $this->postJson('/api/public/certificates/verify', [
            'verification_code' => $certificate->verification_code,
        ])->assertOk()
            ->assertJsonPath('data.valid', true)
            ->assertJsonPath('data.certificate_number', $certificate->certificate_number);
    }

    public function test_public_verify_records_verification_history(): void
    {
        $certificate = $this->certificate();

        $this->postJson('/api/public/certificates/verify', [
            'verification_code' => $certificate->verification_code,
        ])->assertOk();

        $this->assertDatabaseHas('certificate_verifications', [
            'certificate_id' => $certificate->id,
            'outcome' => 'valid',
        ]);
    }

    public function test_public_verify_with_invalid_code_returns_404(): void
    {
        $this->postJson('/api/public/certificates/verify', [
            'verification_code' => 'does-not-exist',
        ])->assertStatus(404);
    }

    public function test_public_verify_of_revoked_certificate_reports_revoked(): void
    {
        $certificate = $this->certificate(['status' => 'revoked', 'revoked_at' => now(), 'revoked_reason' => 'Duplicate']);

        $this->postJson('/api/public/certificates/verify', [
            'verification_code' => $certificate->verification_code,
        ])->assertOk()
            ->assertJsonPath('data.valid', false)
            ->assertJsonPath('data.revoked', true)
            ->assertJsonPath('data.revoked_reason', 'Duplicate');
    }

    public function test_qr_code_endpoint_returns_data_url(): void
    {
        $certificate = $this->certificate();

        $this->getJson('/api/public/certificates/qr/' . $certificate->verification_code)
            ->assertOk()
            ->assertJsonPath('data.certificate_number', $certificate->certificate_number)
            ->assertJsonPath('data.qr_code_url', fn ($value) => str_starts_with($value, 'data:image/svg+xml;base64,'));
    }

    // ---- Student / own certificates ----

    public function test_student_sees_only_own_certificates(): void
    {
        $student = $this->user('student');
        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'course_id' => $this->course()->id,
            'status' => 'completed',
            'enrolled_at' => now()->subMonths(2),
            'completed_at' => now()->subWeek(),
            'progress' => 100,
        ]);
        Certificate::create([
            'user_id' => $student->id,
            'course_id' => $enrollment->course_id,
            'enrollment_id' => $enrollment->id,
            'template_id' => $this->template()->id,
            'certificate_number' => 'CH-OWN-001',
            'issued_at' => now(),
            'verification_code' => 'VERIFYOWN001',
            'status' => 'issued',
        ]);
        // Another student's certificate must not appear.
        $this->certificate();

        Sanctum::actingAs($student, ['*']);

        $this->getJson('/api/certificates')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.certificate_number', 'CH-OWN-001');
    }

    public function test_student_can_view_own_certificate_detail(): void
    {
        $student = $this->user('student');
        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'course_id' => $this->course()->id,
            'status' => 'completed',
            'enrolled_at' => now()->subMonths(2),
            'completed_at' => now()->subWeek(),
            'progress' => 100,
        ]);
        $certificate = Certificate::create([
            'user_id' => $student->id,
            'course_id' => $enrollment->course_id,
            'enrollment_id' => $enrollment->id,
            'template_id' => $this->template()->id,
            'certificate_number' => 'CH-OWN-002',
            'issued_at' => now(),
            'verification_code' => 'VERIFYOWN002',
            'status' => 'issued',
        ]);

        Sanctum::actingAs($student, ['*']);

        $this->getJson('/api/certificates/' . $certificate->id)
            ->assertOk()
            ->assertJsonPath('data.id', $certificate->id);
    }

    public function test_student_can_download_own_certificate_pdf(): void
    {
        $student = $this->user('student');
        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'course_id' => $this->course()->id,
            'status' => 'completed',
            'enrolled_at' => now()->subMonths(2),
            'completed_at' => now()->subWeek(),
            'progress' => 100,
        ]);
        $certificate = Certificate::create([
            'user_id' => $student->id,
            'course_id' => $enrollment->course_id,
            'enrollment_id' => $enrollment->id,
            'template_id' => $this->template()->id,
            'certificate_number' => 'CH-OWN-003',
            'issued_at' => now(),
            'verification_code' => 'VERIFYOWN003',
            'status' => 'issued',
        ]);

        Sanctum::actingAs($student, ['*']);

        $response = $this->get('/api/certificates/' . $certificate->certificate_number . '/download');
        $response->assertStatus(200);
        $this->assertStringContainsString('application/pdf', $response->headers->get('content-type') ?? '');
    }

    // ---- Issue flow ----

    public function test_issue_certificate_for_completed_enrollment(): void
    {
        $admin = $this->user('admin');
        Sanctum::actingAs($admin, ['*']);

        $enrollment = $this->enrollment('completed');

        $this->postJson('/api/certificates/generate/' . $enrollment->id)
            ->assertCreated()
            ->assertJsonPath('data.enrollment_id', $enrollment->id)
            ->assertJsonPath('data.status', 'issued');

        $this->assertDatabaseHas('certificates', [
            'enrollment_id' => $enrollment->id,
            'status' => 'issued',
        ]);
    }

    public function test_issue_is_idempotent_per_enrollment(): void
    {
        $admin = $this->user('admin');
        Sanctum::actingAs($admin, ['*']);

        $enrollment = $this->enrollment('completed');

        $this->postJson('/api/certificates/generate/' . $enrollment->id)->assertCreated();
        $this->postJson('/api/certificates/generate/' . $enrollment->id)->assertCreated();

        $this->assertSame(1, Certificate::where('enrollment_id', $enrollment->id)->count());
    }

    public function test_issue_for_missing_enrollment_returns_404(): void
    {
        $admin = $this->user('admin');
        Sanctum::actingAs($admin, ['*']);

        $this->postJson('/api/certificates/generate/99999')->assertStatus(404);
    }

    public function test_bulk_generate_for_completed_course_enrollments(): void
    {
        $admin = $this->user('admin');
        Sanctum::actingAs($admin, ['*']);

        $course = $this->course();
        $students = User::factory()->count(2)->create();
        $students->each(function (User $s) use ($course) {
            $s->assignRole('student');
            Enrollment::create([
                'user_id' => $s->id,
                'course_id' => $course->id,
                'status' => 'completed',
                'enrolled_at' => now()->subMonths(2),
                'completed_at' => now(),
                'progress' => 100,
            ]);
        });
        // An incomplete enrollment must be skipped.
        Enrollment::create([
            'user_id' => $this->user('student')->id,
            'course_id' => $course->id,
            'status' => 'active',
            'enrolled_at' => now()->subMonths(2),
            'progress' => 40,
        ]);

        $this->postJson('/api/admin/certificates/bulk-generate', [
            'course_id' => $course->id,
        ])->assertOk()
            ->assertJsonPath('data.generated', 2)
            ->assertJsonPath('data.skipped', 0);
    }

    // ---- Revoke / unrevoke ----

    public function test_admin_can_revoke_and_unrevoke_certificate(): void
    {
        $admin = $this->user('admin');
        Sanctum::actingAs($admin, ['*']);

        $certificate = $this->certificate();

        $this->putJson('/api/admin/certificates/' . $certificate->id . '/revoke', [
            'reason' => 'Issued in error',
        ])->assertOk()
            ->assertJsonPath('data.status', 'revoked')
            ->assertJsonPath('data.revoked_reason', 'Issued in error');

        $this->putJson('/api/admin/certificates/' . $certificate->id . '/unrevoke')
            ->assertOk()
            ->assertJsonPath('data.status', 'issued');
    }

    public function test_revoking_twice_returns_422(): void
    {
        $admin = $this->user('admin');
        Sanctum::actingAs($admin, ['*']);

        $certificate = $this->certificate();

        $this->putJson('/api/admin/certificates/' . $certificate->id . '/revoke')->assertOk();
        $this->putJson('/api/admin/certificates/' . $certificate->id . '/revoke')->assertStatus(422);
    }

    public function test_student_cannot_revoke_certificates(): void
    {
        $student = $this->user('student');
        Sanctum::actingAs($student, ['*']);

        $certificate = $this->certificate();

        $this->putJson('/api/admin/certificates/' . $certificate->id . '/revoke')->assertStatus(403);
    }

    // ---- Admin lists ----

    public function test_admin_can_list_all_certificates_with_filters(): void
    {
        $admin = $this->user('admin');
        Sanctum::actingAs($admin, ['*']);

        $this->certificate();
        $this->certificate(['status' => 'revoked', 'revoked_at' => now()]);

        $this->getJson('/api/admin/certificates')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->getJson('/api/admin/certificates?status=revoked')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_admin_can_view_verifications(): void
    {
        $admin = $this->user('admin');
        Sanctum::actingAs($admin, ['*']);

        $certificate = $this->certificate();
        CertificateVerification::create([
            'certificate_id' => $certificate->id,
            'verifier_ip' => '127.0.0.1',
            'verified_at' => now(),
            'outcome' => 'valid',
        ]);

        $this->getJson('/api/admin/certificates/verifications')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    // ---- Templates ----

    public function test_admin_can_manage_templates(): void
    {
        $admin = $this->user('admin');
        Sanctum::actingAs($admin, ['*']);

        $response = $this->postJson('/api/admin/certificate-templates', [
            'name' => 'Graduation',
            'description' => 'Graduation certificate.',
            'body_html' => '<h1>{{ holder }}</h1>',
            'accent_color' => '#0f766e',
            'signature_name' => 'Dr. John Smith',
            'signature_title' => 'Director',
            'is_default' => false,
            'is_active' => true,
        ])->assertCreated()
            ->assertJsonPath('data.name', 'Graduation');

        $id = $response->json('data.id');

        $this->putJson('/api/admin/certificate-templates/' . $id, [
            'name' => 'Graduation 2026',
        ])->assertOk()
            ->assertJsonPath('data.name', 'Graduation 2026');

        $this->getJson('/api/admin/certificate-templates')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/admin/certificate-templates/options')->assertOk();

        $this->deleteJson('/api/admin/certificate-templates/' . $id)->assertOk();
        $this->assertDatabaseMissing('certificate_templates', ['id' => $id]);
    }

    public function test_template_used_by_certificates_cannot_be_deleted(): void
    {
        $admin = $this->user('admin');
        Sanctum::actingAs($admin, ['*']);

        $certificate = $this->certificate();

        $this->deleteJson('/api/admin/certificate-templates/' . $certificate->template_id)
            ->assertStatus(422);
    }

    public function test_student_cannot_manage_templates(): void
    {
        $student = $this->user('student');
        Sanctum::actingAs($student, ['*']);

        $this->postJson('/api/admin/certificate-templates', ['name' => 'X'])->assertStatus(403);
    }

    // ---- Summary ----

    public function test_summary_counts_certificates_and_templates(): void
    {
        $admin = $this->user('admin');
        Sanctum::actingAs($admin, ['*']);

        $this->certificate();
        $this->certificate(['status' => 'revoked', 'revoked_at' => now()]);

        $this->getJson('/api/admin/certificates?status=all')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_summary_endpoint_returns_counts(): void
    {
        $admin = $this->user('admin');
        Sanctum::actingAs($admin, ['*']);

        $this->certificate();
        $this->certificate(['status' => 'revoked', 'revoked_at' => now()]);

        $this->getJson('/api/admin/certificates-summary')
            ->assertOk()
            ->assertJsonPath('data.total_certificates', 2)
            ->assertJsonPath('data.issued_certificates', 1)
            ->assertJsonPath('data.revoked_certificates', 1)
            ->assertJsonPath('data.active_templates', 2);
    }
}
