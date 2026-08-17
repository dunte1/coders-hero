<?php

namespace App\Providers;

use App\Models\Admission;
use App\Models\Attendance;
use App\Models\Competition;
use App\Models\Guardian;
use App\Models\Student;
use App\Models\StudentDocument;
use App\Models\User;
use App\Policies\AdmissionPolicy;
use App\Policies\AttendancePolicy;
use App\Policies\CompetitionPolicy;
use App\Policies\GuardianPolicy;
use App\Policies\PermissionPolicy;
use App\Policies\RolePolicy;
use App\Policies\StudentDocumentPolicy;
use App\Policies\StudentPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
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
    ];

    public function boot(): void
    {
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Role::class, RolePolicy::class);
        Gate::policy(Permission::class, PermissionPolicy::class);
        Gate::policy(Student::class, StudentPolicy::class);
        Gate::policy(Guardian::class, GuardianPolicy::class);
        Gate::policy(Admission::class, AdmissionPolicy::class);
        Gate::policy(Attendance::class, AttendancePolicy::class);
        Gate::policy(StudentDocument::class, StudentDocumentPolicy::class);
        Gate::policy(Competition::class, CompetitionPolicy::class);
    }
}
