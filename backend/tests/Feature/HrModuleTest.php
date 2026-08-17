<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Employee;
use App\Models\EmployeeContract;
use App\Models\EmployeeDocument;
use App\Models\LeaveRequest;
use App\Models\Payroll;
use App\Models\Payslip;
use App\Models\PerformanceReview;
use App\Models\Position;
use App\Models\StaffAttendance;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class HrModuleTest extends TestCase
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

    private function department(): Department
    {
        return Department::create([
            'name' => 'Engineering ' . uniqid(),
            'slug' => 'engineering-' . uniqid(),
            'is_active' => true,
        ]);
    }

    private function position(Department $department): Position
    {
        return Position::create([
            'name' => 'Developer ' . uniqid(),
            'department_id' => $department->id,
            'level' => 'mid',
            'is_active' => true,
        ]);
    }

    private function employee(?User $owner = null): Employee
    {
        $owner = $owner ?? $this->user('employee');
        $department = $this->department();

        return Employee::create([
            'user_id' => $owner->id,
            'employee_id' => 'EMP' . uniqid(),
            'department_id' => $department->id,
            'position_id' => $this->position($department)->id,
            'hire_date' => now()->subYears(2),
            'employment_type' => 'full_time',
            'salary' => 75000,
            'status' => 'active',
        ]);
    }

    public function test_hr_admin_endpoints_require_authentication(): void
    {
        $this->getJson('/api/hr/summary')->assertStatus(401);
        $this->getJson('/api/hr/employees')->assertStatus(401);
        $this->getJson('/api/hr/contracts')->assertStatus(401);
        $this->getJson('/api/hr/leaves')->assertStatus(401);
        $this->getJson('/api/hr/attendance')->assertStatus(401);
        $this->getJson('/api/hr/payrolls')->assertStatus(401);
        $this->getJson('/api/my/hr/summary')->assertStatus(401);
    }

    public function test_non_hr_roles_cannot_access_hr_admin_endpoints(): void
    {
        Sanctum::actingAs($this->user('teacher'), ['*']);
        $this->getJson('/api/hr/summary')->assertStatus(403);
        $this->getJson('/api/hr/employees')->assertStatus(403);
        $this->postJson('/api/hr/contracts', [])->assertStatus(403);
        $this->postJson('/api/hr/payrolls/run', ['month' => now()->format('Y-m')])->assertStatus(403);
    }

    public function test_admin_and_hr_officer_can_access_hr_endpoints(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);
        $this->getJson('/api/hr/summary')->assertOk()->assertJsonPath('success', true);

        Sanctum::actingAs($this->user('hr_officer'), ['*']);
        $this->getJson('/api/hr/summary')->assertOk();
    }

    public function test_employee_cannot_access_hr_admin_endpoints(): void
    {
        Sanctum::actingAs($this->user('employee'), ['*']);
        $this->getJson('/api/hr/summary')->assertStatus(403);
    }

    public function test_summary_returns_stats(): void
    {
        $this->employee();

        Sanctum::actingAs($this->user('admin'), ['*']);

        $response = $this->getJson('/api/hr/summary')->assertOk();

        $this->assertEquals(1, $response->json('data.total_employees'));
        $this->assertEquals(1, $response->json('data.active_employees'));
    }

    public function test_employee_list_and_detail(): void
    {
        $emp = $this->employee();

        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->getJson('/api/hr/employees')
            ->assertOk()
            ->assertJsonPath('data.0.employee_id', $emp->employee_id)
            ->assertJsonStructure(['data', 'meta']);

        $this->getJson('/api/hr/employees/' . $emp->id)
            ->assertOk()
            ->assertJsonPath('data.id', $emp->id)
            ->assertJsonPath('data.user.name', $emp->user->name);
    }

    public function test_employee_hr_update(): void
    {
        $emp = $this->employee();

        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->putJson('/api/hr/employees/' . $emp->id, [
            'salary' => 90000,
            'status' => 'active',
        ])->assertOk()->assertJsonPath('data.salary', 90000);
    }

    public function test_contract_lifecycle(): void
    {
        $emp = $this->employee();

        Sanctum::actingAs($this->user('admin'), ['*']);

        $create = $this->postJson('/api/hr/contracts', [
            'employee_id' => $emp->id,
            'contract_no' => 'CTR-TEST-001',
            'type' => 'permanent',
            'start_date' => now()->toDateString(),
            'salary' => 80000,
        ])->assertStatus(201);

        $contractId = $create->json('data.id');

        $this->getJson('/api/hr/contracts/' . $contractId)
            ->assertOk()
            ->assertJsonPath('data.contract_no', 'CTR-TEST-001');

        $this->putJson('/api/hr/contracts/' . $contractId, [
            'salary' => 85000,
        ])->assertOk()->assertJsonPath('data.salary', 85000);

        $this->putJson('/api/hr/contracts/' . $contractId . '/terminate', [
            'status' => 'terminated',
        ])->assertOk()->assertJsonPath('data.status', 'terminated');

        $this->deleteJson('/api/hr/contracts/' . $contractId)->assertOk();
        $this->getJson('/api/hr/contracts/' . $contractId)->assertStatus(404);
    }

    public function test_leave_request_workflow(): void
    {
        $emp = $this->employee();
        $admin = $this->user('admin');

        Sanctum::actingAs($admin, ['*']);

        $create = $this->postJson('/api/hr/leaves', [
            'employee_id' => $emp->id,
            'leave_type' => 'annual',
            'start_date' => now()->addDays(10)->toDateString(),
            'end_date' => now()->addDays(12)->toDateString(),
            'reason' => 'Holiday',
        ])->assertStatus(201);

        $leaveId = $create->json('data.id');
        $this->assertEquals(3, $create->json('data.days'));

        $this->getJson('/api/hr/leaves/' . $leaveId)->assertOk();

        $this->putJson('/api/hr/leaves/' . $leaveId . '/review', [
            'status' => 'approved',
            'note' => 'Enjoy the break',
        ])->assertOk()->assertJsonPath('data.status', 'approved');

        $this->assertEquals('on_leave', Employee::find($emp->id)->status);
    }

    public function test_leave_rejects_overlapping_requests(): void
    {
        $emp = $this->employee();

        LeaveRequest::create([
            'employee_id' => $emp->id,
            'leave_type' => 'annual',
            'start_date' => now()->addDays(10)->toDateString(),
            'end_date' => now()->addDays(12)->toDateString(),
            'days' => 3,
            'status' => 'approved',
            'requested_by_user_id' => $emp->user_id,
        ]);

        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->postJson('/api/hr/leaves', [
            'employee_id' => $emp->id,
            'leave_type' => 'sick',
            'start_date' => now()->addDays(11)->toDateString(),
            'end_date' => now()->addDays(13)->toDateString(),
        ])->assertStatus(422)->assertJsonPath('message', 'This employee already has a leave request overlapping these dates.');
    }

    public function test_leave_rejects_when_annual_balance_exceeded(): void
    {
        $emp = $this->employee();

        LeaveRequest::create([
            'employee_id' => $emp->id,
            'leave_type' => 'annual',
            'start_date' => now()->startOfYear()->toDateString(),
            'end_date' => now()->startOfYear()->addDays(20)->toDateString(),
            'days' => 21,
            'status' => 'approved',
            'requested_by_user_id' => $emp->user_id,
        ]);

        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->postJson('/api/hr/leaves', [
            'employee_id' => $emp->id,
            'leave_type' => 'annual',
            'start_date' => now()->addDays(30)->toDateString(),
            'end_date' => now()->addDays(30)->toDateString(),
            'reason' => 'One more day',
        ])->assertStatus(422)->assertJsonPath('message', 'The employee does not have enough annual leave balance for these dates.');
    }

    public function test_attendance_single_and_bulk(): void
    {
        $emp = $this->employee();

        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->postJson('/api/hr/attendance', [
            'employee_id' => $emp->id,
            'attendance_date' => now()->toDateString(),
            'status' => 'present',
            'check_in' => '08:00',
            'check_out' => '17:00',
        ])->assertStatus(201)->assertJsonPath('data.status', 'present');

        $this->postJson('/api/hr/attendance', [
            'employee_id' => $emp->id,
            'attendance_date' => now()->toDateString(),
            'status' => 'late',
        ])->assertStatus(422);

        $this->postJson('/api/hr/attendance/bulk', [
            'attendance_date' => now()->subDay()->toDateString(),
            'records' => [
                ['employee_id' => $emp->id, 'status' => 'absent'],
            ],
        ])->assertOk();

        $this->getJson('/api/hr/attendance?employee_id=' . $emp->id)
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_payroll_run_process_and_cancel(): void
    {
        $emp = $this->employee();
        $admin = $this->user('admin');

        Sanctum::actingAs($admin, ['*']);

        $month = now()->format('Y-m');

        $run = $this->postJson('/api/hr/payrolls/run', ['month' => $month])->assertStatus(201);
        $payrollId = $run->json('data.id');

        $this->assertEquals(75000, $run->json('data.gross_total'));

        $this->postJson('/api/hr/payrolls/run', ['month' => $month])->assertStatus(422);

        $this->getJson('/api/hr/payrolls/' . $payrollId)
            ->assertOk()
            ->assertJsonPath('data.status', 'draft');

        $this->putJson('/api/hr/payrolls/' . $payrollId . '/process')
            ->assertOk()
            ->assertJsonPath('data.status', 'processed');

        $this->putJson('/api/hr/payrolls/' . $payrollId . '/cancel')
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertEquals('cancelled', Payslip::where('payroll_id', $payrollId)->first()->status);
    }

    public function test_payroll_requires_valid_month_format(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->postJson('/api/hr/payrolls/run', ['month' => '2026-13'])
            ->assertStatus(422);

        $this->postJson('/api/hr/payrolls/run', ['month' => 'not-a-month'])
            ->assertStatus(422);
    }

    public function test_payroll_cannot_mark_paid_after_cancel(): void
    {
        $this->employee();
        $admin = $this->user('admin');

        Sanctum::actingAs($admin, ['*']);

        $run = $this->postJson('/api/hr/payrolls/run', ['month' => now()->format('Y-m')])->assertStatus(201);
        $payrollId = $run->json('data.id');

        $this->putJson('/api/hr/payrolls/' . $payrollId . '/cancel')->assertOk();
        $this->putJson('/api/hr/payrolls/' . $payrollId . '/mark-paid', ['payment_method' => 'bank_transfer'])
            ->assertStatus(422);
    }

    public function test_performance_review_crud(): void
    {
        $emp = $this->employee();

        Sanctum::actingAs($this->user('admin'), ['*']);

        $create = $this->postJson('/api/hr/reviews', [
            'employee_id' => $emp->id,
            'review_period' => 'Q3 2026',
            'review_date' => now()->toDateString(),
            'rating' => 4,
            'goals' => 'Ship the platform',
            'status' => 'draft',
        ])->assertStatus(201);

        $reviewId = $create->json('data.id');

        $this->putJson('/api/hr/reviews/' . $reviewId, [
            'status' => 'submitted',
            'feedback' => 'Great work',
        ])->assertOk()->assertJsonPath('data.status', 'submitted');

        $this->getJson('/api/hr/reviews/' . $reviewId)->assertOk();
        $this->getJson('/api/hr/reviews?employee_id=' . $emp->id)->assertOk()->assertJsonCount(1, 'data');

        $this->deleteJson('/api/hr/reviews/' . $reviewId)->assertOk();
        $this->getJson('/api/hr/reviews/' . $reviewId)->assertStatus(404);
    }

    public function test_document_upload_download_and_delete(): void
    {
        $emp = $this->employee();
        $admin = $this->user('admin');

        Sanctum::actingAs($admin, ['*']);

        $upload = $this->postJson('/api/hr/documents', [
            'employee_id' => $emp->id,
            'title' => 'National ID',
            'category' => 'national_id',
            'file' => UploadedFile::fake()->create('national-id.pdf', 200, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertStatus(201);

        $documentId = $upload->json('data.id');
        $this->assertEquals('national-id.pdf', $upload->json('data.file_name'));

        Storage::disk('public')->assertExists($upload->json('data.file_path'));

        $this->get('/api/hr/documents/' . $documentId . '/download')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/pdf');

        $this->deleteJson('/api/hr/documents/' . $documentId)->assertOk();
        $this->getJson('/api/hr/documents/' . $documentId . '/download')->assertStatus(404);
    }

    public function test_reports_and_exports(): void
    {
        $this->employee();

        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->getJson('/api/hr/reports/headcount')->assertOk()->assertJsonPath('data.total', 1);
        $this->getJson('/api/hr/reports/leave')->assertOk();
        $this->getJson('/api/hr/reports/attendance')->assertOk();
        $this->getJson('/api/hr/reports/payroll')->assertOk();

        $this->get('/api/hr/export/employees')->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=utf-8');
        $this->get('/api/hr/export/leave')->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=utf-8');
        $this->get('/api/hr/export/attendance')->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=utf-8');
    }

    public function test_employee_self_service(): void
    {
        $emp = $this->employee();
        $owner = $emp->user;

        Sanctum::actingAs($owner, ['*']);

        $this->getJson('/api/my/hr/summary')
            ->assertOk()
            ->assertJsonPath('data.employee_id', $emp->id);

        $this->getJson('/api/my/hr/profile')->assertOk()->assertJsonPath('data.id', $emp->id);

        $create = $this->postJson('/api/my/hr/leaves', [
            'leave_type' => 'annual',
            'start_date' => now()->addDays(20)->toDateString(),
            'end_date' => now()->addDays(21)->toDateString(),
            'reason' => 'Personal time',
        ])->assertStatus(201);

        $this->assertEquals($emp->id, $create->json('data.employee_id'));

        $this->getJson('/api/my/hr/leaves')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/my/hr/leaves/balance')
            ->assertOk()
            ->assertJsonPath('data.allowance', 21)
            ->assertJsonPath('data.used', 0);

        $this->getJson('/api/my/hr/attendance')->assertOk();
        $this->getJson('/api/my/hr/payslips')->assertOk();
        $this->getJson('/api/my/hr/documents')->assertOk();
    }

    public function test_employee_cannot_submit_leave_on_behalf_of_another(): void
    {
        $emp = $this->employee();
        $other = $this->employee();
        $owner = $emp->user;

        Sanctum::actingAs($owner, ['*']);

        $this->postJson('/api/my/hr/leaves', [
            'employee_id' => $other->id,
            'leave_type' => 'annual',
            'start_date' => now()->addDays(20)->toDateString(),
            'end_date' => now()->addDays(21)->toDateString(),
        ])->assertStatus(201)->assertJsonPath('data.employee_id', $emp->id);
    }

    public function test_employee_self_cancel_leave(): void
    {
        $emp = $this->employee();
        $owner = $emp->user;

        $leave = LeaveRequest::create([
            'employee_id' => $emp->id,
            'leave_type' => 'annual',
            'start_date' => now()->addDays(10)->toDateString(),
            'end_date' => now()->addDays(12)->toDateString(),
            'days' => 3,
            'status' => 'pending',
            'requested_by_user_id' => $owner->id,
        ]);

        Sanctum::actingAs($owner, ['*']);

        $this->putJson('/api/my/hr/leaves/' . $leave->id . '/cancel')
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');
    }

    public function test_employee_cannot_cancel_anothers_leave(): void
    {
        $emp = $this->employee();
        $other = $this->employee();
        $owner = $emp->user;

        $leave = LeaveRequest::create([
            'employee_id' => $other->id,
            'leave_type' => 'annual',
            'start_date' => now()->addDays(10)->toDateString(),
            'end_date' => now()->addDays(12)->toDateString(),
            'days' => 3,
            'status' => 'pending',
            'requested_by_user_id' => $other->user_id,
        ]);

        Sanctum::actingAs($owner, ['*']);

        $this->putJson('/api/my/hr/leaves/' . $leave->id . '/cancel')->assertStatus(404);
    }

    public function test_employee_self_payslip_visibility(): void
    {
        $emp = $this->employee();
        $other = $this->employee();
        $owner = $emp->user;

        $payroll = Payroll::create([
            'payroll_no' => 'PRL-TEST-0001',
            'month' => now()->format('Y-m'),
            'status' => 'processed',
            'gross_total' => 75000,
            'deductions_total' => 0,
            'net_total' => 75000,
            'processed_by_user_id' => $this->user('admin')->id,
        ]);

        $payslip = Payslip::create([
            'payroll_id' => $payroll->id,
            'employee_id' => $emp->id,
            'gross_amount' => 75000,
            'deductions_amount' => 0,
            'net_amount' => 75000,
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        Sanctum::actingAs($owner, ['*']);

        $this->getJson('/api/my/hr/payslips')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/my/hr/payslips/' . $payslip->id)->assertOk()->assertJsonPath('data.id', $payslip->id);

        Sanctum::actingAs($other->user, ['*']);
        $this->getJson('/api/my/hr/payslips/' . $payslip->id)->assertStatus(404);
    }

    public function test_employee_document_upload_self_service(): void
    {
        $emp = $this->employee();
        $owner = $emp->user;

        Sanctum::actingAs($owner, ['*']);

        $upload = $this->postJson('/api/my/hr/documents', [
            'title' => 'My Certificate',
            'category' => 'certificate',
            'file' => UploadedFile::fake()->create('cert.pdf', 100, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertStatus(201);

        $this->assertEquals($emp->id, $upload->json('data.employee_id'));
    }

    public function test_search_employees(): void
    {
        $emp = $this->employee();

        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->getJson('/api/hr/search?term=' . urlencode(substr($emp->user->name, 0, 5)))
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
