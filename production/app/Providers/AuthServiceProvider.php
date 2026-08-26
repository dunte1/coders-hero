<?php

namespace App\Providers;

use App\Models\Admission;
use App\Models\Attendance;
use App\Models\Budget;
use App\Models\Competition;
use App\Models\Course;
use App\Models\Employee;
use App\Models\Expense;
use App\Models\FeeStructure;
use App\Models\Guardian;
use App\Models\Invoice;
use App\Models\LeaveRequest;
use App\Models\Payment;
use App\Models\Payroll;
use App\Models\PerformanceReview;
use App\Models\Student;
use App\Models\StudentDocument;
use App\Models\User;
use App\Policies\AdmissionPolicy;
use App\Policies\AttendancePolicy;
use App\Policies\BudgetPolicy;
use App\Policies\CompetitionPolicy;
use App\Policies\CoursePolicy;
use App\Policies\EmployeePolicy;
use App\Policies\ExpensePolicy;
use App\Policies\FeeStructurePolicy;
use App\Policies\GuardianPolicy;
use App\Policies\InvoicePolicy;
use App\Policies\LeaveRequestPolicy;
use App\Policies\PaymentPolicy;
use App\Policies\PayrollPolicy;
use App\Policies\PerformanceReviewPolicy;
use App\Policies\PermissionPolicy;
use App\Policies\RolePolicy;
use App\Policies\StudentDocumentPolicy;
use App\Policies\StudentPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        User::class => UserPolicy::class,
        Role::class => RolePolicy::class,
        Permission::class => PermissionPolicy::class,
        Student::class => StudentPolicy::class,
        Guardian::class => GuardianPolicy::class,
        Admission::class => AdmissionPolicy::class,
        Attendance::class => AttendancePolicy::class,
        StudentDocument::class => StudentDocumentPolicy::class,
        Competition::class => CompetitionPolicy::class,
        Invoice::class => InvoicePolicy::class,
        Payment::class => PaymentPolicy::class,
        Expense::class => ExpensePolicy::class,
        Budget::class => BudgetPolicy::class,
        FeeStructure::class => FeeStructurePolicy::class,
        Course::class => CoursePolicy::class,
        LeaveRequest::class => LeaveRequestPolicy::class,
        Payroll::class => PayrollPolicy::class,
        PerformanceReview::class => PerformanceReviewPolicy::class,
        Employee::class => EmployeePolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
