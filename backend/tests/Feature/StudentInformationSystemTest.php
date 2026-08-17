<?php

namespace Tests\Feature;

use App\Models\Admission;
use App\Models\Guardian;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StudentInformationSystemTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
        $this->seed(PermissionSeeder::class);
    }

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        return $user;
    }

    private function student(): User
    {
        $user = User::factory()->create();
        $user->assignRole('student');

        return $user;
    }

    public function test_sis_endpoints_require_authentication(): void
    {
        $this->getJson('/api/students')->assertStatus(401);
        $this->getJson('/api/students/overview')->assertStatus(401);
        $this->getJson('/api/guardians')->assertStatus(401);
        $this->getJson('/api/admissions')->assertStatus(401);
        $this->getJson('/api/attendance/report')->assertStatus(401);
    }

    public function test_non_admin_is_forbidden(): void
    {
        Sanctum::actingAs($this->student(), ['*']);

        $this->getJson('/api/students')->assertStatus(403);
        $this->postJson('/api/students', ['first_name' => 'X'])->assertStatus(403);
        $this->getJson('/api/attendance/report')->assertStatus(403);
    }

    public function test_admin_can_create_student_with_generated_id_and_qr(): void
    {
        Sanctum::actingAs($this->admin(), ['*']);

        $response = $this->postJson('/api/students', [
            'first_name' => 'Ada',
            'last_name' => 'Lovelace',
            'gender' => 'female',
            'date_of_birth' => '2015-05-12',
            'grade' => 'Grade 3',
            'branch' => 'Downtown',
            'admission_date' => '2026-01-15',
            'status' => 'active',
        ])
            ->assertCreated()
            ->assertJsonStructure(['data' => ['id', 'student_id', 'qr_code', 'full_name']])
            ->assertJsonPath('data.full_name', 'Ada Lovelace');

        $student = Student::first();
        $this->assertNotNull($student);
        $this->assertSame('STU00001', $student->student_id);
        $this->assertStringStartsWith('CH|STU00001|', $student->qr_code);
        $this->assertNotNull(Student::where('status', 'active')->first());
    }

    public function test_admin_can_promote_transfer_and_graduate_student(): void
    {
        Sanctum::actingAs($this->admin(), ['*']);

        $student = Student::create([
            'student_id' => 'STU00001',
            'first_name' => 'Alan',
            'last_name' => 'Turing',
            'grade' => 'Grade 4',
            'branch' => 'Downtown',
            'status' => 'active',
            'qr_code' => 'CH|STU00001|abc',
        ]);

        $this->putJson('/api/students/' . $student->id . '/promote')
            ->assertOk()
            ->assertJsonPath('data.grade', 'Grade 5');

        $this->putJson('/api/students/' . $student->id . '/transfer', ['branch' => 'Westside'])
            ->assertOk()
            ->assertJsonPath('data.branch', 'Westside');

        $this->putJson('/api/students/' . $student->id . '/graduate')
            ->assertOk()
            ->assertJsonPath('data.status', 'graduated');

        $this->assertSame('graduated', $student->fresh()->status);
        $this->assertSame(3, $student->timeline()->count());
        $this->assertDatabaseHas('student_timeline_entries', [
            'student_id' => $student->id,
            'event_type' => 'graduation',
        ]);
    }

    public function test_admin_can_manage_guardian_and_attach_student(): void
    {
        Sanctum::actingAs($this->admin(), ['*']);

        $response = $this->postJson('/api/guardians', [
            'first_name' => 'Grace',
            'last_name' => 'Hopper',
            'relationship' => 'parent',
            'phone' => '+1 555-0100',
            'email' => 'grace@example.com',
        ])->assertCreated();

        $guardianId = $response->json('data.id');

        $student = Student::create([
            'student_id' => 'STU00001',
            'first_name' => 'Child',
            'last_name' => 'Hopper',
            'status' => 'active',
            'qr_code' => 'CH|STU00001|abc',
        ]);

        $this->putJson('/api/students/' . $student->id, ['guardian_id' => $guardianId])
            ->assertOk()
            ->assertJsonPath('data.guardian.id', $guardianId);

        $this->getJson('/api/guardians/' . $guardianId)
            ->assertOk()
            ->assertJsonCount(1, 'data.students');
    }

    public function test_admin_can_record_attendance_for_student(): void
    {
        Sanctum::actingAs($this->admin(), ['*']);

        $student = Student::create([
            'student_id' => 'STU00001',
            'first_name' => 'Katherine',
            'last_name' => 'Johnson',
            'status' => 'active',
            'qr_code' => 'CH|STU00001|abc',
        ]);

        $this->postJson('/api/attendance', [
            'student_id' => $student->id,
            'attendance_date' => '2026-08-05',
            'status' => 'present',
            'check_in' => '09:00',
        ])->assertCreated();

        $this->postJson('/api/attendance', [
            'student_id' => $student->id,
            'attendance_date' => '2026-08-06',
            'status' => 'late',
        ])->assertCreated();

        $this->getJson('/api/students/' . $student->id . '/attendance')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->getJson('/api/attendance/report?from=2026-08-01&to=2026-08-31')
            ->assertOk()
            ->assertJsonPath('data.students.0.present', 2);
    }

    public function test_admin_can_bulk_record_attendance(): void
    {
        Sanctum::actingAs($this->admin(), ['*']);

        $s1 = Student::create(['student_id' => 'STU00001', 'first_name' => 'A', 'last_name' => 'One', 'status' => 'active', 'qr_code' => 'q1']);
        $s2 = Student::create(['student_id' => 'STU00002', 'first_name' => 'B', 'last_name' => 'Two', 'status' => 'active', 'qr_code' => 'q2']);

        $this->postJson('/api/attendance/bulk', [
            'attendance_date' => '2026-08-05',
            'entries' => [
                ['student_id' => $s1->id, 'status' => 'present'],
                ['student_id' => $s2->id, 'status' => 'absent'],
            ],
        ])->assertCreated();

        $this->assertDatabaseHas('attendances', ['student_id' => $s1->id, 'status' => 'present']);
        $this->assertDatabaseHas('attendances', ['student_id' => $s2->id, 'status' => 'absent']);
    }

    public function test_admission_workflow_admits_applicant_as_student(): void
    {
        Sanctum::actingAs($this->admin(), ['*']);

        $response = $this->postJson('/api/admissions', [
            'first_name' => 'Margaret',
            'last_name' => 'Hamilton',
            'date_of_birth' => '2014-02-20',
            'gender' => 'female',
            'guardian_name' => 'M. Hamilton',
            'guardian_phone' => '+1 555-0200',
            'grade' => 'Grade 4',
            'preferred_branch' => 'Downtown',
            'program_of_interest' => 'Scratch',
        ])
            ->assertCreated()
            ->assertJsonStructure(['data' => ['id', 'application_number', 'status']])
            ->assertJsonPath('data.status', 'new');

        $admissionId = $response->json('data.id');

        $this->putJson('/api/admissions/' . $admissionId . '/admit')
            ->assertOk()
            ->assertJsonPath('data.status', 'admitted');

        $admission = Admission::find($admissionId);
        $this->assertNotNull($admission->student_id);
        $this->assertDatabaseHas('students', ['last_name' => 'Hamilton', 'status' => 'active']);
    }

    public function test_admin_can_upload_photo_and_document(): void
    {
        Sanctum::actingAs($this->admin(), ['*']);

        $student = Student::create([
            'student_id' => 'STU00001',
            'first_name' => 'Radia',
            'last_name' => 'Perlman',
            'status' => 'active',
            'qr_code' => 'CH|STU00001|abc',
        ]);

        $this->post('/api/students/' . $student->id . '/photo', [
            'photo' => UploadedFile::fake()->image('portrait.png', 100, 100),
        ])->assertOk();

        $this->assertNotNull($student->fresh()->photo);

        $this->post('/api/students/' . $student->id . '/documents', [
            'name' => 'Birth Certificate',
            'document_type' => 'birth_certificate',
            'file' => UploadedFile::fake()->create('certificate.pdf', 120),
        ])->assertCreated();

        $this->getJson('/api/students/' . $student->id . '/documents')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_student_overview_returns_statistics(): void
    {
        Sanctum::actingAs($this->admin(), ['*']);

        Student::create(['student_id' => 'STU00001', 'first_name' => 'A', 'last_name' => 'One', 'gender' => 'female', 'status' => 'active', 'grade' => 'Grade 3', 'qr_code' => 'q1']);
        Student::create(['student_id' => 'STU00002', 'first_name' => 'B', 'last_name' => 'Two', 'gender' => 'male', 'status' => 'active', 'grade' => 'Grade 4', 'qr_code' => 'q2']);
        Student::create(['student_id' => 'STU00003', 'first_name' => 'C', 'last_name' => 'Three', 'gender' => 'female', 'status' => 'graduated', 'grade' => 'Grade 6', 'qr_code' => 'q3']);

        $this->getJson('/api/students/overview')
            ->assertOk()
            ->assertJsonPath('data.total_students', 3)
            ->assertJsonPath('data.active_students', 2)
            ->assertJsonPath('data.graduated_students', 1);
    }

    public function test_student_medical_record_crud(): void
    {
        Sanctum::actingAs($this->admin(), ['*']);

        $student = Student::create([
            'student_id' => 'STU00001',
            'first_name' => 'Donald',
            'last_name' => 'Knuth',
            'status' => 'active',
            'qr_code' => 'CH|STU00001|abc',
        ]);

        $this->postJson('/api/students/' . $student->id . '/medical', [
            'blood_type' => 'O+',
            'allergies' => ['peanuts'],
            'emergency_contact_name' => 'J. Knuth',
            'emergency_contact_phone' => '+1 555-0300',
        ])->assertCreated();

        $this->getJson('/api/students/' . $student->id . '/medical')
            ->assertOk()
            ->assertJsonPath('data.allergies', ['peanuts']);

        $this->putJson('/api/students/' . $student->id . '/medical', ['blood_type' => 'A+'])
            ->assertOk()
            ->assertJsonPath('data.blood_type', 'A+');
    }

    public function test_student_export_streams_csv(): void
    {
        Sanctum::actingAs($this->admin(), ['*']);

        $this->get('/api/students/exports/students')
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }
}
