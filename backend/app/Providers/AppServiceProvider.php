<?php

namespace App\Providers;

use App\Repositories\Interfaces\CourseRepositoryInterface;
use App\Repositories\Interfaces\EmployeeRepositoryInterface;
use App\Repositories\Interfaces\EnrollmentRepositoryInterface;
use App\Repositories\Interfaces\ProjectRepositoryInterface;
use App\Repositories\Interfaces\QuizRepositoryInterface;
use App\Repositories\Interfaces\TaskRepositoryInterface;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Repositories\CourseRepository;
use App\Repositories\EmployeeRepository;
use App\Repositories\EnrollmentRepository;
use App\Repositories\ProjectRepository;
use App\Repositories\QuizRepository;
use App\Repositories\TaskRepository;
use App\Repositories\UserRepository;
use App\Services\AnnouncementService;
use App\Services\AuthService;
use App\Services\CodeRunner\CodeRunnerContract;
use App\Services\CodeRunner\NativeCodeRunner;
use App\Services\CodeRunner\NullCodeRunner;
use App\Services\CodeRunner\PistonCodeRunner;
use App\Services\CourseService;
use App\Services\DashboardService;
use App\Services\EmailVerificationService;
use App\Services\EmployeeService;
use App\Services\EnrollmentService;
use App\Services\LoginHistoryService;
use App\Services\NotificationService;
use App\Services\PasswordResetService;
use App\Services\PermissionService;
use App\Services\ProjectService;
use App\Services\QuizService;
use App\Services\RoleService;
use App\Services\Students\AdmissionService;
use App\Services\Students\AttendanceService;
use App\Services\Students\GuardianService;
use App\Services\Students\MedicalRecordService;
use App\Services\Students\StudentDocumentService;
use App\Services\Students\StudentService as SisStudentService;
use App\Services\Students\StudentTimelineService;
use App\Services\TaskService;
use App\Services\TwoFactorService;
use App\Services\UserService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(UserRepositoryInterface::class, UserRepository::class);
        $this->app->singleton(CourseRepositoryInterface::class, CourseRepository::class);
        $this->app->singleton(EnrollmentRepositoryInterface::class, EnrollmentRepository::class);
        $this->app->singleton(TaskRepositoryInterface::class, TaskRepository::class);
        $this->app->singleton(ProjectRepositoryInterface::class, ProjectRepository::class);
        $this->app->singleton(EmployeeRepositoryInterface::class, EmployeeRepository::class);
        $this->app->singleton(QuizRepositoryInterface::class, QuizRepository::class);

        $this->app->singleton(AuthService::class);
        $this->app->singleton(UserService::class);
        $this->app->singleton(CourseService::class);
        $this->app->singleton(EnrollmentService::class);
        $this->app->singleton(TaskService::class);
        $this->app->singleton(ProjectService::class);
        $this->app->singleton(EmployeeService::class);
        $this->app->singleton(QuizService::class);
        $this->app->singleton(DashboardService::class);
        $this->app->singleton(NotificationService::class);
        $this->app->singleton(AnnouncementService::class);
        $this->app->singleton(EmailVerificationService::class);
        $this->app->singleton(PasswordResetService::class);
        $this->app->singleton(TwoFactorService::class);
        $this->app->singleton(RoleService::class);
        $this->app->singleton(PermissionService::class);
        $this->app->singleton(LoginHistoryService::class);

        $this->app->singleton(SisStudentService::class);
        $this->app->singleton(AdmissionService::class);
        $this->app->singleton(GuardianService::class);
        $this->app->singleton(MedicalRecordService::class);
        $this->app->singleton(AttendanceService::class);
        $this->app->singleton(StudentDocumentService::class);
        $this->app->singleton(StudentTimelineService::class);

        // Resolve the isolated code execution engine. User code is never executed
        // in-process; a Piston-compatible sandbox is used when available.
        $this->app->singleton(CodeRunnerContract::class, function ($app) {
            $config = $app['config']->get('services.code_runner');

            $enabled = (bool) ($config['enabled'] ?? false);
            $driver = (string) ($config['driver'] ?? 'piston');

            if (!$enabled) {
                return new NullCodeRunner();
            }

            if ($driver === 'native') {
                return new NativeCodeRunner(
                    runTimeoutMs: $config['run_timeout_ms'] ?? 10000,
                    compileTimeoutMs: $config['compile_timeout_ms'] ?? 15000,
                    memoryLimitKb: $config['memory_limit_kb'] ?? 256000,
                );
            }

            $url = (string) ($config['url'] ?? '');

            if ($url === '') {
                return new NullCodeRunner();
            }

            return new PistonCodeRunner(
                baseUrl: $url,
                token: $config['token'] ?? null,
                timeout: $config['timeout'] ?? 30,
                runTimeoutMs: $config['run_timeout_ms'] ?? 10000,
                compileTimeoutMs: $config['compile_timeout_ms'] ?? 15000,
                memoryLimitKb: $config['memory_limit_kb'] ?? 256000,
            );
        });
    }

    public function boot(): void
    {
        if (env('MAIL_VERIFY_PEER') === 'false') {
            stream_context_set_default([
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true,
                ],
            ]);
        }
    }
}
