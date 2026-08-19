<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\EmployeeContract;
use App\Models\EmployeeDocument;
use App\Models\LeaveRequest;
use App\Models\Payroll;
use App\Models\PerformanceReview;
use App\Models\StaffAttendance;
use App\Models\User;
use Illuminate\Database\Seeder;

class HrSeeder extends Seeder
{
    public function run(): void
    {
        $hrDirector = User::where('email', 'jennifer@codershero.com')->first();
        $superAdmin = User::where('email', 'superadmin@codershero.com')->first();

        if ($hrDirector && !$hrDirector->hasRole('hr_officer')) {
            $hrDirector->assignRole('hr_officer');
        }

        $adminUser = $superAdmin ?? $hrDirector;

        $activeEmployees = Employee::query()->active()->with(['user', 'position'])->get();

        if ($activeEmployees->isEmpty()) {
            return;
        }

        $this->seedContracts($activeEmployees, $adminUser);
        $this->seedLeaveRequests($activeEmployees, $adminUser);
        $this->seedAttendance($activeEmployees, $adminUser);
        $this->seedPayroll($activeEmployees, $adminUser);
        $this->seedReviews($activeEmployees, $adminUser);
        $this->seedDocuments($activeEmployees, $adminUser);
    }

    private function seedContracts($employees, ?User $user): void
    {
        $now = now();

        foreach ($employees as $index => $employee) {
            $contractNo = 'CTR-' . now()->format('Y') . '-' . str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT);

            $employee->contracts()->updateOrCreate(
                ['contract_no' => $contractNo],
                [
                    'type' => 'permanent',
                    'start_date' => $employee->hire_date ?? $now->subYear(),
                    'end_date' => null,
                    'salary' => $employee->salary,
                    'status' => 'active',
                    'signed_on' => $employee->hire_date ?? $now->subYear(),
                    'notes' => 'Permanent employment contract.',
                    'created_by_user_id' => $user?->id,
                ]
            );
        }
    }

    private function seedLeaveRequests($employees, ?User $user): void
    {
        if (LeaveRequest::exists()) {
            return;
        }

        $employee = $employees->first();
        $second = $employees->get(1);

        if ($employee) {
            LeaveRequest::create([
                'employee_id' => $employee->id,
                'leave_type' => 'annual',
                'start_date' => now()->addDays(14)->toDateString(),
                'end_date' => now()->addDays(16)->toDateString(),
                'days' => 3,
                'reason' => 'Family holiday.',
                'status' => 'pending',
                'requested_by_user_id' => $employee->user?->id,
            ]);
        }

        if ($second) {
            LeaveRequest::create([
                'employee_id' => $second->id,
                'leave_type' => 'sick',
                'start_date' => now()->subWeek()->toDateString(),
                'end_date' => now()->subWeek()->addDay()->toDateString(),
                'days' => 2,
                'reason' => 'Recovering from a cold.',
                'status' => 'approved',
                'requested_by_user_id' => $second->user?->id,
                'reviewed_by_user_id' => $user?->id,
                'reviewed_at' => now(),
                'review_note' => 'Approved.',
            ]);
        }
    }

    private function seedAttendance($employees, ?User $user): void
    {
        for ($dayOffset = 1; $dayOffset <= 5; $dayOffset++) {
            $date = now()->subDays($dayOffset);

            if ($date->isWeekend()) {
                continue;
            }

            foreach ($employees->take(8) as $employee) {
                $exists = StaffAttendance::query()
                    ->where('employee_id', $employee->id)
                    ->whereDate('attendance_date', $date->toDateString())
                    ->exists();

                if (!$exists) {
                    StaffAttendance::create([
                        'employee_id' => $employee->id,
                        'attendance_date' => $date->toDateString(),
                        'status' => $date->day % 7 === 0 ? 'late' : 'present',
                        'check_in' => '08:00',
                        'check_out' => '17:00',
                        'recorded_by_user_id' => $user?->id,
                    ]);
                }
            }
        }
    }

    private function seedPayroll($employees, ?User $user): void
    {
        $month = now()->format('Y-m');

        if (Payroll::where('month', $month)->exists()) {
            return;
        }

        $grossTotal = 0;

        $payroll = Payroll::create([
            'payroll_no' => 'PRL-' . $month . '-0001',
            'month' => $month,
            'status' => 'draft',
            'gross_total' => 0,
            'deductions_total' => 0,
            'net_total' => 0,
            'processed_by_user_id' => $user?->id,
        ]);

        foreach ($employees as $employee) {
            $gross = (float) ($employee->salary ?? 0);
            $grossTotal += $gross;

            $payroll->payslips()->create([
                'employee_id' => $employee->id,
                'gross_amount' => $gross,
                'deductions_amount' => 0,
                'net_amount' => $gross,
                'deductions_breakdown' => null,
                'allowances_breakdown' => null,
                'status' => 'pending',
            ]);
        }

        $payroll->update([
            'gross_total' => $grossTotal,
            'net_total' => $grossTotal,
        ]);
    }

    private function seedReviews($employees, ?User $user): void
    {
        if (PerformanceReview::exists()) {
            return;
        }

        foreach ($employees->take(4) as $index => $employee) {
            $employee->performanceReviews()->create([
                'reviewer_user_id' => $user?->id,
                'review_period' => 'Q' . (intdiv((int) now()->month - 1, 3) + 1) . ' ' . now()->year,
                'review_date' => now()->subDays(5 + $index)->toDateString(),
                'rating' => [3, 4, 4, 5][$index % 4],
                'goals' => 'Complete assigned project milestones.',
                'achievements' => 'Delivered key features on schedule.',
                'areas_to_improve' => 'Documentation and code review participation.',
                'feedback' => 'Good performance overall.',
                'status' => 'submitted',
            ]);
        }
    }

    private function seedDocuments($employees, ?User $user): void
    {
        if (EmployeeDocument::exists()) {
            return;
        }

        foreach ($employees->take(3) as $employee) {
            $employee->documents()->create([
                'title' => 'Employee handbook acknowledgment',
                'category' => 'other',
                'file_path' => 'hr/documents/handbook-acknowledgement.txt',
                'file_name' => 'handbook-acknowledgement.txt',
                'mime_type' => 'text/plain',
                'size' => 0,
                'uploaded_by_user_id' => $user?->id,
            ]);
        }
    }
}
