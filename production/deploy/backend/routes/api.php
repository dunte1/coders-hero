<?php

use App\Http\Controllers\Api\AI\AiAdminController;
use App\Http\Controllers\Api\AI\AiPlatformController;
use App\Http\Controllers\Api\Admin\ActivityLogController;
use App\Http\Controllers\Api\Admin\SystemAdminController;
use App\Http\Controllers\Api\AnalyticsDashboardController;
use App\Http\Controllers\Api\Organization\AcademicYearController;
use App\Http\Controllers\Api\Organization\BranchController;
use App\Http\Controllers\Api\Organization\PartnerSchoolController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\CertificateTemplateController;
use App\Http\Controllers\Api\Cms\AnalyticsController;
use App\Http\Controllers\Api\Cms\BlogController;
use App\Http\Controllers\Api\Cms\ChatSettingsController;
use App\Http\Controllers\Api\Cms\ContactMessageController;
use App\Http\Controllers\Api\Cms\FaqController;
use App\Http\Controllers\Api\Cms\GalleryItemController;
use App\Http\Controllers\Api\Cms\ProgramController as CmsProgramController;
use App\Http\Controllers\Api\Cms\ServiceController as CmsServiceController;
use App\Http\Controllers\Api\Cms\SiteSectionController;
use App\Http\Controllers\Api\Cms\SiteSettingsController;
use App\Http\Controllers\Api\Competitions\CompetitionController;
use App\Http\Controllers\Api\Competitions\CompetitionJudgingController;
use App\Http\Controllers\Api\Competitions\CompetitionRegistrationController;
use App\Http\Controllers\Api\Cms\TestimonialController;
use App\Http\Controllers\Api\Lms\AiTutorController;
use App\Http\Controllers\Api\Lms\BookmarkController;
use App\Http\Controllers\Api\Lms\CodingExerciseController;
use App\Http\Controllers\Api\Lms\CodingAiController;
use App\Http\Controllers\Api\Lms\CodingLeaderboardController;
use App\Http\Controllers\Api\Lms\ForumController;
use App\Http\Controllers\Api\Lms\PlaygroundController;
use App\Http\Controllers\Api\Lms\RatingController;
use App\Http\Controllers\Api\Lms\VideoProgressController;
use App\Http\Controllers\Api\Robotics\RoboticsAssignmentController;
use App\Http\Controllers\Api\Robotics\RoboticsEquipmentController;
use App\Http\Controllers\Api\Robotics\RoboticsMaintenanceController;
use App\Http\Controllers\Api\Robotics\RoboticsProjectController;
use App\Http\Controllers\Api\Robotics\RoboticsReservationController;
use App\Http\Controllers\Api\Robotics\RoboticsTeamController;
use App\Http\Controllers\Api\Teacher\TeacherAnalyticsController;
use App\Http\Controllers\Api\Teacher\TeacherAssignmentController;
use App\Http\Controllers\Api\Teacher\TeacherCalendarController;
use App\Http\Controllers\Api\Teacher\TeacherClassController;
use App\Http\Controllers\Api\Teacher\TeacherDashboardController;
use App\Http\Controllers\Api\Teacher\TeacherExamController;
use App\Http\Controllers\Api\Teacher\TeacherGradebookController;
use App\Http\Controllers\Api\Teacher\TeacherLessonNoteController;
use App\Http\Controllers\Api\Teacher\TeacherReportController;
use App\Http\Controllers\Api\Students\AdmissionController;
use App\Http\Controllers\Api\Students\AppointmentAdminController;
use App\Http\Controllers\Api\Students\AttendanceController;
use App\Http\Controllers\Api\Students\GuardianController;
use App\Http\Controllers\Api\Students\MedicalRecordController;
use App\Http\Controllers\Api\Students\StudentController;
use App\Http\Controllers\Api\Students\StudentDocumentController;
use App\Http\Controllers\Api\Students\StudentExportController;
use App\Http\Controllers\Api\Students\StudentFeeController;
use App\Http\Controllers\Api\Students\StudentPaymentController;
use App\Http\Controllers\Api\Students\StudentProgressController;
use App\Http\Controllers\Api\Students\StudentReportCardController;
use App\Http\Controllers\Api\Students\StudentTimelineController;
use App\Http\Controllers\Api\Student\StudentAssignmentController;
use App\Http\Controllers\Api\Parent\ChatController;
use App\Http\Controllers\Api\Parent\ParentAppointmentController;
use App\Http\Controllers\Api\Parent\ParentAttendanceController;
use App\Http\Controllers\Api\Parent\ParentController;
use App\Http\Controllers\Api\Parent\ParentFeeController;
use App\Http\Controllers\Api\Parent\ParentNotificationController;
use App\Http\Controllers\Api\Parent\ParentPaymentController;
use App\Http\Controllers\Api\Parent\ParentProgressController;
use App\Http\Controllers\Api\Parent\ParentReportCardController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\Finance\BudgetController;
use App\Http\Controllers\Api\Finance\ExpenseController;
use App\Http\Controllers\Api\Finance\FeeStructureController;
use App\Http\Controllers\Api\Finance\FinanceReportController;
use App\Http\Controllers\Api\Finance\InvoiceController;
use App\Http\Controllers\Api\Finance\MpesaController;
use App\Http\Controllers\Api\Finance\PaymentController;
use App\Http\Controllers\Api\Hr\ContractController;
use App\Http\Controllers\Api\Hr\DocumentController;
use App\Http\Controllers\Api\Hr\EmployeeHrController;
use App\Http\Controllers\Api\Hr\HrController;
use App\Http\Controllers\Api\Hr\LeaveController;
use App\Http\Controllers\Api\Hr\MyHrController;
use App\Http\Controllers\Api\Hr\PayrollController;
use App\Http\Controllers\Api\Hr\PerformanceController;
use App\Http\Controllers\Api\Hr\StaffAttendanceController;
use App\Http\Controllers\Api\Inventory\AssetCategoryController;
use App\Http\Controllers\Api\Inventory\AssetController;
use App\Http\Controllers\Api\Inventory\AssetMaintenanceController;
use App\Http\Controllers\Api\Inventory\InventoryItemController;
use App\Http\Controllers\Api\Inventory\InventoryReportController;
use App\Http\Controllers\Api\Library\LibraryAuthorController;
use App\Http\Controllers\Api\Library\LibraryBorrowingController;
use App\Http\Controllers\Api\Library\LibraryCategoryController;
use App\Http\Controllers\Api\Library\LibraryHistoryController;
use App\Http\Controllers\Api\Library\LibraryReportController;
use App\Http\Controllers\Api\Library\LibraryReservationController;
use App\Http\Controllers\Api\Library\LibraryResourceController;
use App\Http\Controllers\Api\Inventory\LocationController;
use App\Http\Controllers\Api\Inventory\StockMovementController;
use App\Http\Controllers\Api\LessonController;
use App\Http\Controllers\Api\LoginHistoryController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\Notifications\NotificationAdminController;
use App\Http\Controllers\Api\Notifications\NotificationPreferenceController;
use App\Http\Controllers\Api\Notifications\NotificationTemplateController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\PositionController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\Public\WebsiteController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TwoFactorController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::prefix('public')->group(function () {
    Route::get('/site', [WebsiteController::class, 'home']);
    Route::get('/services', [WebsiteController::class, 'services']);
    Route::get('/programs', [WebsiteController::class, 'programs']);
    Route::get('/programs/{slug}', [WebsiteController::class, 'program']);
    Route::get('/gallery', [WebsiteController::class, 'gallery']);
    Route::get('/testimonials', [WebsiteController::class, 'testimonials']);
    Route::get('/faqs', [WebsiteController::class, 'faqs']);
    Route::get('/courses', [WebsiteController::class, 'courses']);
    Route::get('/events', [WebsiteController::class, 'events']);
    Route::post('/admissions', [WebsiteController::class, 'submitAdmission'])->middleware('throttle:5,1');
    Route::get('/blog', [WebsiteController::class, 'blog']);
    Route::get('/blog/{slug}', [WebsiteController::class, 'blogShow']);
    Route::get('/blog/{slug}/related', [WebsiteController::class, 'blogRelated']);
    Route::post('/contact', [WebsiteController::class, 'contact'])->middleware('throttle:10,1');
    Route::get('/partner-schools', [WebsiteController::class, 'partnerSchools']);
    Route::post('/chat', [WebsiteController::class, 'chat'])->middleware('throttle:20,1');
    Route::post('/analytics/page-view', [WebsiteController::class, 'pageView'])->middleware('throttle:60,1');
    Route::post('/certificates/verify', [CertificateController::class, 'verify'])->middleware('throttle:30,1');
    Route::get('/certificates/qr/{verificationCode}', [CertificateController::class, 'qrCode']);
});

Route::post('/forgot-password', [PasswordResetController::class, 'forgot']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);
Route::post('/reset-password/validate', [PasswordResetController::class, 'validateResetToken']);

Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->name('verification.verify');

Route::post('/mpesa/callback', [MpesaController::class, 'callback']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh-token', [AuthController::class, 'refreshToken']);
    Route::post('/profile/photo', [AuthController::class, 'uploadPhoto']);

    Route::post('/email/verification-notification', [EmailVerificationController::class, 'send']);
    Route::post('/email/resend', [EmailVerificationController::class, 'resend']);

    Route::get('/two-factor/status', [TwoFactorController::class, 'status']);
    Route::post('/two-factor/enable', [TwoFactorController::class, 'enable']);
    Route::post('/two-factor/confirm', [TwoFactorController::class, 'confirm']);
    Route::post('/two-factor/disable', [TwoFactorController::class, 'disable']);
    Route::post('/two-factor/recovery-codes', [TwoFactorController::class, 'recoveryCodes']);
    Route::post('/two-factor/challenge', [TwoFactorController::class, 'challenge']);

    Route::get('/login-history', [LoginHistoryController::class, 'index']);
    Route::delete('/login-history', [LoginHistoryController::class, 'destroy']);

    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread', [NotificationController::class, 'unread']);
    Route::get('/notifications/stats', [NotificationController::class, 'stats']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    Route::get('/notification-preferences', [NotificationPreferenceController::class, 'index']);
    Route::put('/notification-preferences', [NotificationPreferenceController::class, 'update']);
    Route::get('/fcm-tokens', [NotificationPreferenceController::class, 'myTokens']);
    Route::post('/fcm-tokens', [NotificationPreferenceController::class, 'storeFcmToken']);
    Route::delete('/fcm-tokens/{id}', [NotificationPreferenceController::class, 'destroyFcmToken']);

    Route::get('/notification-templates', [NotificationTemplateController::class, 'index']);

    Route::get('/announcements', [AnnouncementController::class, 'index']);
    Route::get('/announcements/{id}', [AnnouncementController::class, 'show']);

    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/featured', [CourseController::class, 'featured']);
    Route::get('/courses/popular', [CourseController::class, 'popular']);
    Route::get('/courses/recommended', [CourseController::class, 'recommended']);
    Route::get('/courses/{id}', [CourseController::class, 'show']);
    Route::get('/courses/{id}/lessons', [CourseController::class, 'lessons']);
    Route::get('/courses/{id}/stats', [CourseController::class, 'stats']);

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);

    Route::get('/enrollments', [EnrollmentController::class, 'index']);
    Route::post('/enrollments', [EnrollmentController::class, 'enroll']);
    Route::get('/enrollments/my-courses', [EnrollmentController::class, 'myCourses']);
    Route::get('/enrollments/stats', [EnrollmentController::class, 'stats']);
    Route::get('/enrollments/{courseId}', [EnrollmentController::class, 'show']);
    Route::delete('/enrollments/{courseId}', [EnrollmentController::class, 'unenroll']);
    Route::post('/enrollments/progress/{lessonId}', [EnrollmentController::class, 'updateProgress']);

    Route::get('/certificates', [CertificateController::class, 'index']);
    Route::get('/certificates/{id}', [CertificateController::class, 'show']);
    Route::get('/certificates/{certificateNumber}/download', [CertificateController::class, 'download']);
    Route::get('/certificates/qr/{verificationCode}', [CertificateController::class, 'qrCode']);
    Route::post('/certificates/verify', [CertificateController::class, 'verify']);
    Route::post('/certificates/generate/{enrollmentId}', [CertificateController::class, 'issue']);

    Route::get('/tasks/my-tasks', [TaskController::class, 'myTasks']);
    Route::get('/tasks/overdue', [TaskController::class, 'overdue']);
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::post('/tasks/bulk-assign', [TaskController::class, 'bulkAssign']);
    Route::get('/tasks/{id}', [TaskController::class, 'show']);
    Route::put('/tasks/{id}', [TaskController::class, 'update']);
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
    Route::put('/tasks/{id}/assign', [TaskController::class, 'assign']);
    Route::put('/tasks/{id}/status', [TaskController::class, 'changeStatus']);

    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects/stats', [ProjectController::class, 'stats']);
    Route::get('/projects/{id}', [ProjectController::class, 'show']);
    Route::put('/projects/{id}', [ProjectController::class, 'update']);
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);
    Route::post('/projects/{id}/members', [ProjectController::class, 'addMember']);
    Route::delete('/projects/{id}/members/{userId}', [ProjectController::class, 'removeMember']);
    Route::get('/projects/{id}/members', [ProjectController::class, 'members']);

    Route::get('/quizzes', [QuizController::class, 'index']);
    Route::post('/quizzes', [QuizController::class, 'store']);
    Route::get('/quizzes/{id}', [QuizController::class, 'show']);
    Route::put('/quizzes/{id}', [QuizController::class, 'update']);
    Route::delete('/quizzes/{id}', [QuizController::class, 'destroy']);
    Route::post('/quizzes/{id}/submit', [QuizController::class, 'submit']);
    Route::get('/quizzes/{id}/attempts', [QuizController::class, 'attempts']);
    Route::get('/quizzes/{id}/statistics', [QuizController::class, 'statistics']);
    Route::get('/courses/{courseId}/quizzes', [QuizController::class, 'byCourse']);

    Route::middleware('role:admin|super_admin|director|branch_manager|school_admin')->prefix('admin')->group(function () {

        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
        Route::put('/users/{id}/assign-role', [UserController::class, 'assignRole']);
        Route::delete('/users/{id}/remove-role', [UserController::class, 'removeRole']);
        Route::put('/users/{id}/toggle-status', [UserController::class, 'toggleStatus']);
        Route::put('/users/{id}/permissions', [PermissionController::class, 'syncUserPermissions']);

        Route::get('/roles', [RoleController::class, 'index']);
        Route::post('/roles', [RoleController::class, 'store']);
        Route::get('/roles/{id}', [RoleController::class, 'show']);
        Route::put('/roles/{id}', [RoleController::class, 'update']);
        Route::delete('/roles/{id}', [RoleController::class, 'destroy']);
        Route::put('/roles/{id}/permissions', [RoleController::class, 'syncPermissions']);
        Route::get('/roles/{id}/permissions', [RoleController::class, 'getPermissions']);
        Route::get('/roles/{id}/users', [RoleController::class, 'users']);

        Route::get('/permissions', [PermissionController::class, 'index']);
        Route::get('/permissions/groups', [PermissionController::class, 'groups']);
        Route::get('/permissions/{id}', [PermissionController::class, 'show']);

        Route::get('/login-history', [LoginHistoryController::class, 'all']);
        Route::get('/login-history/{id}', [LoginHistoryController::class, 'show']);

        Route::post('/courses', [CourseController::class, 'store']);
        Route::put('/courses/{id}', [CourseController::class, 'update']);
        Route::delete('/courses/{id}', [CourseController::class, 'destroy']);
        Route::put('/courses/{id}/publish', [CourseController::class, 'publish']);
        Route::put('/courses/{id}/archive', [CourseController::class, 'archive']);
        Route::post('/courses/{id}/duplicate', [CourseController::class, 'duplicate']);

        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        Route::get('/employees', [EmployeeController::class, 'index']);
        Route::post('/employees', [EmployeeController::class, 'store']);
        Route::get('/employees/directory', [EmployeeController::class, 'directory']);
        Route::get('/employees/{id}', [EmployeeController::class, 'show']);
        Route::put('/employees/{id}', [EmployeeController::class, 'update']);
        Route::delete('/employees/{id}', [EmployeeController::class, 'destroy']);
        Route::post('/employees/onboard', [EmployeeController::class, 'onboard']);
        Route::put('/employees/{id}/offboard', [EmployeeController::class, 'offboard']);

        Route::get('/departments', [DepartmentController::class, 'index']);
        Route::post('/departments', [DepartmentController::class, 'store']);
        Route::get('/departments/{id}', [DepartmentController::class, 'show']);
        Route::put('/departments/{id}', [DepartmentController::class, 'update']);
        Route::delete('/departments/{id}', [DepartmentController::class, 'destroy']);

        Route::get('/positions', [PositionController::class, 'index']);
        Route::post('/positions', [PositionController::class, 'store']);
        Route::get('/positions/{id}', [PositionController::class, 'show']);
        Route::put('/positions/{id}', [PositionController::class, 'update']);
        Route::delete('/positions/{id}', [PositionController::class, 'destroy']);

        Route::post('/announcements', [AnnouncementController::class, 'store']);
        Route::put('/announcements/{id}', [AnnouncementController::class, 'update']);
        Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);
        Route::put('/announcements/{id}/pin', [AnnouncementController::class, 'pin']);

        Route::get('/reports/users', [ReportController::class, 'userReport']);
        Route::get('/reports/courses', [ReportController::class, 'courseReport']);
        Route::get('/reports/enrollments', [ReportController::class, 'enrollmentReport']);
        Route::get('/reports/activity', [ReportController::class, 'activityReport']);

        // AI Platform administration
        Route::get('/ai/assistants', [AiAdminController::class, 'assistantsIndex']);
        Route::post('/ai/assistants', [AiAdminController::class, 'assistantsStore']);
        Route::put('/ai/assistants/{id}', [AiAdminController::class, 'assistantsUpdate']);
        Route::delete('/ai/assistants/{id}', [AiAdminController::class, 'assistantsDestroy']);
        Route::get('/ai/prompt-templates', [AiAdminController::class, 'templatesIndex']);
        Route::post('/ai/prompt-templates', [AiAdminController::class, 'templatesStore']);
        Route::put('/ai/prompt-templates/{id}', [AiAdminController::class, 'templatesUpdate']);
        Route::delete('/ai/prompt-templates/{id}', [AiAdminController::class, 'templatesDestroy']);
        Route::get('/ai/usage', [AiAdminController::class, 'usage']);

        // Notifications administration
        Route::get('/notifications/summary', [NotificationAdminController::class, 'summary']);
        Route::get('/notifications/deliveries', [NotificationAdminController::class, 'deliveries']);
        Route::post('/notifications/send', [NotificationAdminController::class, 'send']);
        Route::post('/notifications/deliveries/{id}/retry', [NotificationAdminController::class, 'retryDelivery']);
        Route::apiResource('/notification-templates', NotificationTemplateController::class);
        Route::get('/fcm-tokens', [NotificationPreferenceController::class, 'myTokens']);

        // Certificate management
        Route::get('/certificates-summary', [CertificateController::class, 'summary']);
        Route::get('/certificates', [CertificateController::class, 'all']);
        Route::get('/certificates/verifications', [CertificateController::class, 'verifications']);
        Route::get('/certificates/{id}', [CertificateController::class, 'show']);
        Route::put('/certificates/{id}/revoke', [CertificateController::class, 'revoke']);
        Route::put('/certificates/{id}/unrevoke', [CertificateController::class, 'unrevoke']);
        Route::post('/certificates/bulk-generate', [CertificateController::class, 'bulkGenerate']);

        Route::get('/certificate-templates', [CertificateTemplateController::class, 'index']);
        Route::post('/certificate-templates', [CertificateTemplateController::class, 'store']);
        Route::get('/certificate-templates/options', [CertificateTemplateController::class, 'options']);
        Route::get('/certificate-templates/{id}', [CertificateTemplateController::class, 'show']);
        Route::put('/certificate-templates/{id}', [CertificateTemplateController::class, 'update']);
        Route::delete('/certificate-templates/{id}', [CertificateTemplateController::class, 'destroy']);
    });

    Route::middleware('role:admin|super_admin')->prefix('admin')->group(function () {

        Route::get('/site/settings', [SiteSettingsController::class, 'index']);
        Route::put('/site/settings', [SiteSettingsController::class, 'update']);
        Route::get('/site/sections', [SiteSectionController::class, 'index']);
        Route::post('/site/sections', [SiteSectionController::class, 'store']);
        Route::put('/site/sections/reorder', [SiteSectionController::class, 'reorder']);
        Route::get('/site/sections/{id}', [SiteSectionController::class, 'show']);
        Route::put('/site/sections/{id}', [SiteSectionController::class, 'update']);
        Route::delete('/site/sections/{id}', [SiteSectionController::class, 'destroy']);

        Route::get('/services', [CmsServiceController::class, 'index']);
        Route::post('/services', [CmsServiceController::class, 'store']);
        Route::put('/services/reorder', [CmsServiceController::class, 'reorder']);
        Route::get('/services/{id}', [CmsServiceController::class, 'show']);
        Route::put('/services/{id}', [CmsServiceController::class, 'update']);
        Route::delete('/services/{id}', [CmsServiceController::class, 'destroy']);

        Route::get('/programs', [CmsProgramController::class, 'index']);
        Route::post('/programs', [CmsProgramController::class, 'store']);
        Route::get('/programs/{id}', [CmsProgramController::class, 'show']);
        Route::put('/programs/{id}', [CmsProgramController::class, 'update']);
        Route::delete('/programs/{id}', [CmsProgramController::class, 'destroy']);
        Route::put('/programs/{id}/toggle-featured', [CmsProgramController::class, 'toggleFeatured']);
        Route::put('/programs/{id}/toggle-active', [CmsProgramController::class, 'toggleActive']);

        Route::get('/gallery', [GalleryItemController::class, 'index']);
        Route::post('/gallery', [GalleryItemController::class, 'store']);
        Route::get('/gallery/{id}', [GalleryItemController::class, 'show']);
        Route::put('/gallery/{id}', [GalleryItemController::class, 'update']);
        Route::delete('/gallery/{id}', [GalleryItemController::class, 'destroy']);

        Route::get('/testimonials', [TestimonialController::class, 'index']);
        Route::post('/testimonials', [TestimonialController::class, 'store']);
        Route::get('/testimonials/{id}', [TestimonialController::class, 'show']);
        Route::put('/testimonials/{id}', [TestimonialController::class, 'update']);
        Route::delete('/testimonials/{id}', [TestimonialController::class, 'destroy']);

        Route::get('/blog', [BlogController::class, 'index']);
        Route::post('/blog', [BlogController::class, 'store']);
        Route::get('/blog/{id}', [BlogController::class, 'show']);
        Route::put('/blog/{id}', [BlogController::class, 'update']);
        Route::delete('/blog/{id}', [BlogController::class, 'destroy']);
        Route::put('/blog/{id}/publish', [BlogController::class, 'publish']);
        Route::put('/blog/{id}/unpublish', [BlogController::class, 'unpublish']);

        Route::get('/faqs', [FaqController::class, 'index']);
        Route::post('/faqs', [FaqController::class, 'store']);
        Route::put('/faqs/reorder', [FaqController::class, 'reorder']);
        Route::get('/faqs/{id}', [FaqController::class, 'show']);
        Route::put('/faqs/{id}', [FaqController::class, 'update']);
        Route::delete('/faqs/{id}', [FaqController::class, 'destroy']);

        Route::get('/contact-messages', [ContactMessageController::class, 'index']);
        Route::get('/contact-messages/stats', [ContactMessageController::class, 'stats']);
        Route::get('/contact-messages/{id}', [ContactMessageController::class, 'show']);
        Route::put('/contact-messages/{id}/status', [ContactMessageController::class, 'updateStatus']);
        Route::delete('/contact-messages/{id}', [ContactMessageController::class, 'destroy']);

        Route::get('/chat-settings', [ChatSettingsController::class, 'show']);
        Route::put('/chat-settings', [ChatSettingsController::class, 'update']);

Route::get('/analytics/site', [AnalyticsController::class, 'site']);

        Route::get('/activity-logs', [ActivityLogController::class, 'index']);
        Route::get('/activity-logs/events', [ActivityLogController::class, 'events']);

});

    // System Administration - super_admin only
    Route::middleware('role:super_admin')->prefix('admin')->group(function () {
        Route::get('/system/health', [SystemAdminController::class, 'health']);
        Route::get('/system/logs', [SystemAdminController::class, 'logs']);
        Route::get('/system/backups', [SystemAdminController::class, 'backups']);
        Route::post('/system/backups', [SystemAdminController::class, 'createBackup']);
        Route::get('/system/backups/download', [SystemAdminController::class, 'downloadBackup']);
        Route::delete('/system/backups', [SystemAdminController::class, 'deleteBackup']);
    });

// Analytics & Reports - accessible to admins, directors, branch managers, school admins, and accountants
Route::middleware('role:admin|super_admin|director|branch_manager|school_admin|accountant')->prefix('admin')->group(function () {
    Route::get('/analytics/filter-options', [AnalyticsDashboardController::class, 'filterOptions']);
    Route::get('/analytics/overview', [AnalyticsDashboardController::class, 'overview']);
    Route::get('/analytics/enrollments', [AnalyticsDashboardController::class, 'enrollments']);
    Route::get('/analytics/revenue', [AnalyticsDashboardController::class, 'revenue']);
    Route::get('/analytics/attendance', [AnalyticsDashboardController::class, 'attendance']);
    Route::get('/analytics/courses', [AnalyticsDashboardController::class, 'courses']);
    Route::get('/analytics/teachers', [AnalyticsDashboardController::class, 'teachers']);
    Route::get('/analytics/competitions', [AnalyticsDashboardController::class, 'competitions']);
    Route::get('/analytics/branches', [AnalyticsDashboardController::class, 'branches']);
    Route::get('/analytics/progress', [AnalyticsDashboardController::class, 'progress']);
});

Route::middleware('role:admin|super_admin|director|branch_manager|school_admin')->prefix('organization')->group(function () {
    Route::get('/branches', [BranchController::class, 'index']);
    Route::get('/branches/all', [BranchController::class, 'all']);
    Route::post('/branches', [BranchController::class, 'store']);
    Route::get('/branches/{id}', [BranchController::class, 'show']);
    Route::put('/branches/{id}', [BranchController::class, 'update']);
    Route::delete('/branches/{id}', [BranchController::class, 'destroy']);

    Route::get('/partner-schools', [PartnerSchoolController::class, 'index']);
    Route::get('/partner-schools/all', [PartnerSchoolController::class, 'all']);
    Route::post('/partner-schools', [PartnerSchoolController::class, 'store']);
    Route::get('/partner-schools/{id}', [PartnerSchoolController::class, 'show']);
    Route::put('/partner-schools/{id}', [PartnerSchoolController::class, 'update']);
    Route::delete('/partner-schools/{id}', [PartnerSchoolController::class, 'destroy']);

    Route::get('/academic-years', [AcademicYearController::class, 'index']);
    Route::get('/academic-years/current', [AcademicYearController::class, 'current']);
    Route::post('/academic-years', [AcademicYearController::class, 'store']);
    Route::get('/academic-years/{id}', [AcademicYearController::class, 'show']);
    Route::put('/academic-years/{id}', [AcademicYearController::class, 'update']);
    Route::delete('/academic-years/{id}', [AcademicYearController::class, 'destroy']);
    Route::put('/academic-years/{id}/set-current', [AcademicYearController::class, 'setCurrent']);
});

Route::middleware('role:admin|super_admin|director|branch_manager|school_admin')->prefix('students')->group(function () {

Route::get('/filters/grades', [StudentController::class, 'grades']);
Route::get('/filters/branches', [StudentController::class, 'branches']);
Route::get('/overview', [StudentController::class, 'overview']);
Route::get('/exports/students', [StudentExportController::class, 'students']);
Route::get('/exports/attendance', [StudentExportController::class, 'attendance']);
Route::get('/exports/students/pdf', [StudentExportController::class, 'studentsPdf']);
Route::get('/exports/attendance/pdf', [StudentExportController::class, 'attendancePdf']);
Route::get('/', [StudentController::class, 'index']);
Route::post('/', [StudentController::class, 'store']);
Route::get('/{id}', [StudentController::class, 'show']);
Route::put('/{id}', [StudentController::class, 'update']);
Route::delete('/{id}', [StudentController::class, 'destroy']);
Route::post('/{id}/photo', [StudentController::class, 'uploadPhoto']);
Route::post('/{id}/id-card/photo', [StudentController::class, 'uploadIdCardPhoto']);
Route::get('/{id}/id-card/pdf', [StudentController::class, 'idCardPdf']);
Route::put('/{id}/promote', [StudentController::class, 'promote']);
Route::put('/{id}/transfer', [StudentController::class, 'transfer']);
Route::put('/{id}/graduate', [StudentController::class, 'graduate']);
Route::get('/{id}/medical', [MedicalRecordController::class, 'show']);
Route::post('/{id}/medical', [MedicalRecordController::class, 'store']);
Route::put('/{id}/medical', [MedicalRecordController::class, 'update']);
Route::delete('/{id}/medical', [MedicalRecordController::class, 'destroy']);
Route::get('/{id}/attendance', [AttendanceController::class, 'student']);
Route::get('/{id}/attendance/monthly', [AttendanceController::class, 'monthly']);
Route::get('/{id}/documents', [StudentDocumentController::class, 'index']);
Route::post('/{id}/documents', [StudentDocumentController::class, 'store']);
Route::delete('/documents/{documentId}', [StudentDocumentController::class, 'destroy']);
Route::get('/{id}/timeline', [StudentTimelineController::class, 'index']);
Route::post('/{id}/timeline', [StudentTimelineController::class, 'store']);
Route::delete('/timeline/{entryId}', [StudentTimelineController::class, 'destroy']);
});

Route::middleware('role:admin|super_admin|director|branch_manager|school_admin')->prefix('guardians')->group(function () {

Route::get('/', [GuardianController::class, 'index']);
Route::post('/', [GuardianController::class, 'store']);
Route::get('/all', [GuardianController::class, 'all']);
Route::get('/{id}', [GuardianController::class, 'show']);
Route::put('/{id}', [GuardianController::class, 'update']);
Route::delete('/{id}', [GuardianController::class, 'destroy']);
});

Route::middleware('role:admin|super_admin|director|branch_manager|school_admin')->prefix('admissions')->group(function () {

Route::get('/', [AdmissionController::class, 'index']);
Route::post('/', [AdmissionController::class, 'store']);
Route::get('/{id}', [AdmissionController::class, 'show']);
Route::put('/{id}', [AdmissionController::class, 'update']);
Route::delete('/{id}', [AdmissionController::class, 'destroy']);
Route::put('/{id}/admit', [AdmissionController::class, 'admit']);
Route::put('/{id}/reject', [AdmissionController::class, 'reject']);
});

Route::middleware('role:admin|super_admin|director|branch_manager|school_admin')->prefix('attendance')->group(function () {

Route::get('/', [AttendanceController::class, 'index']);
Route::get('/report', [AttendanceController::class, 'report']);
Route::post('/', [AttendanceController::class, 'store']);
Route::post('/bulk', [AttendanceController::class, 'bulkStore']);
Route::put('/{id}', [AttendanceController::class, 'update']);
Route::delete('/{id}', [AttendanceController::class, 'destroy']);
});

// Student assignment submission routes
Route::middleware('role:student')->prefix('student/assignments')->group(function () {
    Route::get('/', [StudentAssignmentController::class, 'index']);
    Route::get('/my-submissions', [StudentAssignmentController::class, 'mySubmissions']);
    Route::get('/{id}', [StudentAssignmentController::class, 'show']);
    Route::post('/{id}/submit', [StudentAssignmentController::class, 'submit']);
});

Route::middleware('role:instructor|admin')->prefix('instructor')->group(function () {

        Route::get('/courses', [CourseController::class, 'instructorCourses']);
        Route::post('/courses', [CourseController::class, 'store']);
        Route::put('/courses/{id}', [CourseController::class, 'update']);
        Route::put('/courses/{id}/publish', [CourseController::class, 'publish']);
        Route::put('/courses/{id}/archive', [CourseController::class, 'archive']);
        Route::post('/courses/{id}/duplicate', [CourseController::class, 'duplicate']);

        Route::post('/courses/{courseId}/lessons', [LessonController::class, 'store']);
        Route::put('/courses/{courseId}/lessons/{lessonId}', [LessonController::class, 'update']);
        Route::delete('/courses/{courseId}/lessons/{lessonId}', [LessonController::class, 'destroy']);
        Route::post('/courses/{courseId}/lessons/reorder', [LessonController::class, 'reorder']);

        Route::get('/quizzes', [QuizController::class, 'index']);
        Route::post('/quizzes', [QuizController::class, 'store']);
        Route::put('/quizzes/{id}', [QuizController::class, 'update']);
        Route::delete('/quizzes/{id}', [QuizController::class, 'destroy']);
        Route::get('/quizzes/{id}/statistics', [QuizController::class, 'statistics']);
    });

    Route::middleware('role:employee|admin')->prefix('employee')->group(function () {

        Route::get('/dashboard', [DashboardController::class, 'index']);
    });

    // Parent Portal
    Route::middleware('role:parent|admin|super_admin')->prefix('parent')->group(function () {

        Route::get('/summary', [ParentController::class, 'summary']);
        Route::get('/children', [ParentController::class, 'children']);
        Route::get('/teachers', [ParentController::class, 'teachers']);

        Route::get('/attendance', [ParentAttendanceController::class, 'index']);

        Route::get('/report-cards', [ParentReportCardController::class, 'index']);
        Route::get('/report-cards/{id}', [ParentReportCardController::class, 'show']);

        Route::get('/progress', [ParentProgressController::class, 'index']);

        Route::get('/fees', [ParentFeeController::class, 'index']);
        Route::get('/fees/{id}', [ParentFeeController::class, 'show']);
        Route::post('/fees/{id}/pay', [ParentPaymentController::class, 'store']);
        Route::get('/payments/{id}', [ParentPaymentController::class, 'show']);
        Route::get('/payments/{id}/pdf', [ParentPaymentController::class, 'pdf']);

        Route::get('/appointments', [ParentAppointmentController::class, 'index']);
        Route::post('/appointments', [ParentAppointmentController::class, 'store']);
        Route::put('/appointments/{id}', [ParentAppointmentController::class, 'update']);
        Route::delete('/appointments/{id}', [ParentAppointmentController::class, 'destroy']);

        Route::get('/notifications', [ParentNotificationController::class, 'index']);
        Route::post('/notifications/{id}/read', [ParentNotificationController::class, 'markRead']);
        Route::post('/notifications/read-all', [ParentNotificationController::class, 'markAllRead']);
    });

    // Parent-teacher chat
    Route::middleware('role:parent|instructor|admin|super_admin')->prefix('chat')->group(function () {

        Route::get('/', [ChatController::class, 'index']);
        Route::post('/', [ChatController::class, 'store']);
        Route::get('/{id}', [ChatController::class, 'show']);
        Route::post('/{id}/messages', [ChatController::class, 'send']);
        Route::post('/{id}/read', [ChatController::class, 'markRead']);
    });

    // Admin academic management
    Route::middleware('role:admin|super_admin|director|branch_manager|school_admin')->prefix('students')->group(function () {

        Route::get('/{id}/report-cards', [StudentReportCardController::class, 'index']);
        Route::post('/{id}/report-cards', [StudentReportCardController::class, 'store']);
        Route::put('/report-cards/{reportCardId}', [StudentReportCardController::class, 'update']);
        Route::delete('/report-cards/{reportCardId}', [StudentReportCardController::class, 'destroy']);

        Route::get('/{id}/coding-progress', [StudentProgressController::class, 'index']);
        Route::post('/{id}/coding-progress', [StudentProgressController::class, 'store']);
        Route::put('/coding-progress/{progressId}', [StudentProgressController::class, 'update']);
        Route::delete('/coding-progress/{progressId}', [StudentProgressController::class, 'destroy']);

        Route::get('/{id}/fees', [StudentFeeController::class, 'index']);
        Route::post('/{id}/fees', [StudentFeeController::class, 'store']);
        Route::put('/fees/{feeId}', [StudentFeeController::class, 'update']);
        Route::delete('/fees/{feeId}', [StudentFeeController::class, 'destroy']);

        Route::get('/fees/{feeId}/payments', [StudentPaymentController::class, 'index']);
        Route::post('/fees/{feeId}/payments', [StudentPaymentController::class, 'store']);
        Route::delete('/payments/{paymentId}', [StudentPaymentController::class, 'destroy']);
    });

    // Admin appointments
    Route::middleware('role:admin|super_admin|director|branch_manager|school_admin')->prefix('appointments')->group(function () {

        Route::get('/', [AppointmentAdminController::class, 'index']);
        Route::put('/{id}', [AppointmentAdminController::class, 'update']);
        Route::delete('/{id}', [AppointmentAdminController::class, 'destroy']);
    });

    // Teacher Portal
    Route::middleware('role:teacher|instructor|admin|super_admin|director|branch_manager|school_admin')->prefix('teacher')->group(function () {

        Route::get('/dashboard', [TeacherDashboardController::class, 'summary']);

        Route::get('/classes/grades', [TeacherClassController::class, 'grades']);
        Route::get('/classes/available-students', [TeacherClassController::class, 'availableStudents']);
        Route::get('/classes', [TeacherClassController::class, 'index']);
        Route::post('/classes', [TeacherClassController::class, 'store']);
        Route::get('/classes/{id}', [TeacherClassController::class, 'show']);
        Route::put('/classes/{id}', [TeacherClassController::class, 'update']);
        Route::delete('/classes/{id}', [TeacherClassController::class, 'destroy']);
        Route::post('/classes/{id}/students', [TeacherClassController::class, 'addStudents']);
        Route::delete('/classes/{id}/students/{studentId}', [TeacherClassController::class, 'removeStudent']);
        Route::get('/classes/{id}/roster', [TeacherClassController::class, 'roster']);
        Route::post('/classes/{id}/attendance', [TeacherClassController::class, 'recordAttendance']);
        Route::get('/classes/{id}/attendance', [TeacherClassController::class, 'attendanceSummary']);

        Route::get('/assignments', [TeacherAssignmentController::class, 'index']);
        Route::post('/assignments', [TeacherAssignmentController::class, 'store']);
        Route::get('/assignments/{id}', [TeacherAssignmentController::class, 'show']);
        Route::put('/assignments/{id}', [TeacherAssignmentController::class, 'update']);
        Route::delete('/assignments/{id}', [TeacherAssignmentController::class, 'destroy']);
        Route::put('/assignments/{id}/publish', [TeacherAssignmentController::class, 'publish']);
        Route::put('/assignments/{id}/close', [TeacherAssignmentController::class, 'close']);
        Route::get('/assignments/{id}/submissions', [TeacherAssignmentController::class, 'submissions']);
        Route::put('/assignments/{id}/submissions/{submissionId}/grade', [TeacherAssignmentController::class, 'gradeSubmission']);
        Route::get('/assignments/{id}/missing', [TeacherAssignmentController::class, 'missingList']);

        Route::get('/exams', [TeacherExamController::class, 'index']);
        Route::post('/exams', [TeacherExamController::class, 'store']);
        Route::get('/exams/{id}', [TeacherExamController::class, 'show']);
        Route::put('/exams/{id}', [TeacherExamController::class, 'update']);
        Route::delete('/exams/{id}', [TeacherExamController::class, 'destroy']);
        Route::put('/exams/{id}/status', [TeacherExamController::class, 'changeStatus']);
        Route::post('/exams/{id}/results', [TeacherExamController::class, 'gradeResults']);
        Route::post('/exams/{id}/absent', [TeacherExamController::class, 'markAbsent']);

        Route::get('/gradebook/components', [TeacherGradebookController::class, 'components']);
        Route::get('/gradebook/classes/{classId}/entries', [TeacherGradebookController::class, 'index']);
        Route::post('/gradebook/classes/{classId}/entries', [TeacherGradebookController::class, 'store']);
        Route::post('/gradebook/classes/{classId}/entries/bulk', [TeacherGradebookController::class, 'bulkStore']);
        Route::put('/gradebook/classes/{classId}/entries/{entryId}', [TeacherGradebookController::class, 'update']);
        Route::delete('/gradebook/classes/{classId}/entries/{entryId}', [TeacherGradebookController::class, 'destroy']);
        Route::get('/gradebook/classes/{classId}/students/{studentId}', [TeacherGradebookController::class, 'studentSummary']);
        Route::get('/gradebook/classes/{classId}/summary', [TeacherGradebookController::class, 'classSummary']);

        Route::get('/lesson-notes', [TeacherLessonNoteController::class, 'index']);
        Route::post('/lesson-notes', [TeacherLessonNoteController::class, 'store']);
        Route::get('/lesson-notes/{id}', [TeacherLessonNoteController::class, 'show']);
        Route::put('/lesson-notes/{id}', [TeacherLessonNoteController::class, 'update']);
        Route::delete('/lesson-notes/{id}', [TeacherLessonNoteController::class, 'destroy']);
        Route::post('/lesson-notes/{id}/files', [TeacherLessonNoteController::class, 'attachFile']);

        Route::get('/calendar', [TeacherCalendarController::class, 'index']);
        Route::post('/calendar', [TeacherCalendarController::class, 'store']);
        Route::get('/calendar/{id}', [TeacherCalendarController::class, 'show']);
        Route::put('/calendar/{id}', [TeacherCalendarController::class, 'update']);
        Route::delete('/calendar/{id}', [TeacherCalendarController::class, 'destroy']);

        Route::get('/analytics', [TeacherAnalyticsController::class, 'all']);
        Route::get('/analytics/overview', [TeacherAnalyticsController::class, 'overview']);
        Route::get('/analytics/attendance-trend', [TeacherAnalyticsController::class, 'attendanceTrend']);
        Route::get('/analytics/grade-distribution', [TeacherAnalyticsController::class, 'gradeDistribution']);
        Route::get('/analytics/class-performance', [TeacherAnalyticsController::class, 'classPerformance']);

        Route::get('/reports/summary', [TeacherReportController::class, 'summary']);
        Route::get('/reports/classes/{classId}', [TeacherReportController::class, 'classReport']);
        Route::get('/reports/classes/{classId}/students/{studentId}', [TeacherReportController::class, 'studentReport']);
    });

    // LMS interactive features (any authenticated user)
    Route::prefix('lms')->group(function () {

        Route::get('/courses/{courseId}/forum', [ForumController::class, 'threads']);
        Route::post('/courses/{courseId}/forum', [ForumController::class, 'storeThread']);
        Route::get('/forum/threads/{id}', [ForumController::class, 'showThread']);
        Route::put('/forum/threads/{id}', [ForumController::class, 'updateThread']);
        Route::delete('/forum/threads/{id}', [ForumController::class, 'destroyThread']);
        Route::post('/forum/threads/{threadId}/posts', [ForumController::class, 'post']);
        Route::delete('/forum/posts/{postId}', [ForumController::class, 'destroyPost']);

        Route::get('/bookmarks', [BookmarkController::class, 'index']);
        Route::post('/bookmarks/toggle', [BookmarkController::class, 'toggle']);
        Route::get('/bookmarks/status', [BookmarkController::class, 'status']);

        Route::get('/courses/{courseId}/ratings', [RatingController::class, 'index']);
        Route::post('/courses/{courseId}/ratings', [RatingController::class, 'rate']);
        Route::get('/courses/{courseId}/ratings/my', [RatingController::class, 'my']);
        Route::get('/courses/{courseId}/ratings/summary', [RatingController::class, 'summary']);

        Route::get('/courses/{courseId}/coding-exercises', [CodingExerciseController::class, 'index']);
        Route::get('/coding-exercises/{id}', [CodingExerciseController::class, 'show']);
        Route::post('/coding-exercises/{id}/submit', [CodingExerciseController::class, 'submit']);
        Route::get('/coding-exercises/{id}/submissions', [CodingExerciseController::class, 'submissions']);
        Route::get('/courses/{courseId}/coding-progress', [CodingExerciseController::class, 'progress']);

        Route::get('/ai-tutor/conversations', [AiTutorController::class, 'index']);
        Route::post('/ai-tutor/conversations', [AiTutorController::class, 'store']);
        Route::get('/ai-tutor/conversations/{id}', [AiTutorController::class, 'show']);
        Route::put('/ai-tutor/conversations/{id}', [AiTutorController::class, 'rename']);
Route::delete('/ai-tutor/conversations/{id}', [AiTutorController::class, 'destroy']);
Route::post('/ai-tutor/conversations/{id}/messages', [AiTutorController::class, 'send']);

        // AI Platform
        Route::get('/ai/assistants', [AiPlatformController::class, 'assistants']);
        Route::get('/ai/assistants/{slug}', [AiPlatformController::class, 'assistant']);
        Route::get('/ai/conversations', [AiPlatformController::class, 'conversations']);
        Route::post('/ai/conversations', [AiPlatformController::class, 'store']);
        Route::get('/ai/conversations/{id}', [AiPlatformController::class, 'show']);
        Route::put('/ai/conversations/{id}', [AiPlatformController::class, 'rename']);
        Route::delete('/ai/conversations/{id}', [AiPlatformController::class, 'destroy']);
        Route::post('/ai/conversations/{id}/messages', [AiPlatformController::class, 'send'])->middleware('throttle:30,1');
        Route::get('/ai/prompt-templates', [AiPlatformController::class, 'promptTemplates']);
        Route::post('/ai/generate', [AiPlatformController::class, 'generateFromTemplate'])->middleware('throttle:30,1');
        Route::get('/ai/my-usage', [AiPlatformController::class, 'myUsage']);

        // Playground
        Route::post('/playground/run', [PlaygroundController::class, 'run']);
        Route::post('/playground/workspaces', [PlaygroundController::class, 'saveWorkspace']);
        Route::put('/playground/workspaces/{workspaceId}', [PlaygroundController::class, 'updateWorkspace']);
        Route::delete('/playground/workspaces/{workspaceId}', [PlaygroundController::class, 'deleteWorkspace']);
        Route::get('/playground/workspaces/{workspaceId}/load', [PlaygroundController::class, 'loadWorkspace']);
        Route::get('/playground/workspaces', [PlaygroundController::class, 'listWorkspaces']);

// Leaderboard
Route::get('/coding-leaderboard/for-course/{courseId}', [CodingLeaderboardController::class, 'forCourse']);
Route::get('/coding-leaderboard/for-exercise/{exerciseId}', [CodingLeaderboardController::class, 'forExercise']);

// AI Assistant
Route::post('/coding-ai/hint', [CodingAiController::class, 'hint']);
Route::post('/coding-ai/debug', [CodingAiController::class, 'debug']);

Route::put('/lessons/{lessonId}/video-progress', [VideoProgressController::class, 'update']);
        Route::get('/lessons/{lessonId}/video-progress', [VideoProgressController::class, 'forLesson']);
        Route::get('/courses/{courseId}/video-progress', [VideoProgressController::class, 'forCourse']);
        Route::post('/courses/{courseId}/lessons/complete', [VideoProgressController::class, 'markCompleted']);
    });

    // Robotics Laboratory
    Route::prefix('robotics')->group(function () {

        // Shared reads
        Route::get('/summary', [RoboticsEquipmentController::class, 'summary']);
        Route::get('/equipment', [RoboticsEquipmentController::class, 'index']);
        Route::get('/equipment/scan/{qrCode}', [RoboticsEquipmentController::class, 'scan']);
        Route::get('/equipment/{id}', [RoboticsEquipmentController::class, 'show']);
        Route::get('/teams', [RoboticsTeamController::class, 'index']);
        Route::get('/teams/{id}', [RoboticsTeamController::class, 'show']);
        Route::get('/projects', [RoboticsProjectController::class, 'index']);
        Route::get('/projects/{id}', [RoboticsProjectController::class, 'show']);
        Route::get('/projects/{id}/submissions', [RoboticsProjectController::class, 'submissions']);

        // Student actions (ownership enforced in services)
        Route::post('/projects', [RoboticsProjectController::class, 'store']);
        Route::put('/projects/{id}', [RoboticsProjectController::class, 'update']);
        Route::delete('/projects/{id}', [RoboticsProjectController::class, 'destroy']);
        Route::post('/projects/{id}/submit', [RoboticsProjectController::class, 'submit']);
        Route::get('/reservations/mine', [RoboticsReservationController::class, 'myReservations']);
        Route::post('/reservations', [RoboticsReservationController::class, 'store']);
        Route::put('/reservations/{id}/cancel', [RoboticsReservationController::class, 'cancel']);

        // Staff management (teacher/instructor/admin/super_admin)
        Route::middleware('role:teacher|instructor|admin|super_admin')->group(function () {

            Route::get('/assignments', [RoboticsAssignmentController::class, 'index']);
            Route::get('/assignments/{id}', [RoboticsAssignmentController::class, 'show']);
            Route::get('/students', [RoboticsTeamController::class, 'students']);
            Route::post('/equipment', [RoboticsEquipmentController::class, 'store']);
            Route::put('/equipment/{id}', [RoboticsEquipmentController::class, 'update']);
            Route::delete('/equipment/{id}', [RoboticsEquipmentController::class, 'destroy']);
            Route::put('/equipment/{id}/qr', [RoboticsEquipmentController::class, 'qrCode']);
            Route::post('/equipment/{equipmentId}/assign', [RoboticsAssignmentController::class, 'assign']);
            Route::put('/assignments/{id}/return', [RoboticsAssignmentController::class, 'return']);

            Route::get('/reservations', [RoboticsReservationController::class, 'index']);
            Route::put('/reservations/{id}/approve', [RoboticsReservationController::class, 'approve']);
            Route::put('/reservations/{id}/reject', [RoboticsReservationController::class, 'reject']);
            Route::put('/reservations/{id}/complete', [RoboticsReservationController::class, 'complete']);

            Route::get('/maintenance', [RoboticsMaintenanceController::class, 'index']);
            Route::post('/maintenance', [RoboticsMaintenanceController::class, 'store']);
            Route::put('/maintenance/{id}', [RoboticsMaintenanceController::class, 'update']);
            Route::put('/maintenance/{id}/resolve', [RoboticsMaintenanceController::class, 'resolve']);
            Route::delete('/maintenance/{id}', [RoboticsMaintenanceController::class, 'destroy']);

            Route::post('/teams', [RoboticsTeamController::class, 'store']);
            Route::put('/teams/{id}', [RoboticsTeamController::class, 'update']);
            Route::delete('/teams/{id}', [RoboticsTeamController::class, 'destroy']);
            Route::post('/teams/{id}/members', [RoboticsTeamController::class, 'addMember']);
            Route::delete('/teams/{id}/members/{studentId}', [RoboticsTeamController::class, 'removeMember']);

            Route::put('/projects/{id}/submissions/{submissionId}/review', [RoboticsProjectController::class, 'review']);
        });
    });

    // Competitions
    Route::prefix('competitions')->group(function () {

        Route::get('/', [CompetitionController::class, 'index']);
        Route::get('/students', [CompetitionRegistrationController::class, 'studentOptions']);
        Route::get('/teams/mine', [CompetitionRegistrationController::class, 'myTeams']);
        Route::get('/teams/{teamId}', [CompetitionRegistrationController::class, 'showTeam']);
        Route::get('/{id}/leaderboard', [CompetitionJudgingController::class, 'leaderboard']);
        Route::get('/{id}/results', [CompetitionJudgingController::class, 'results']);

        Route::middleware('role:teacher|instructor|admin|super_admin')->group(function () {

            Route::get('/summary', [CompetitionController::class, 'summary']);
            Route::post('/', [CompetitionController::class, 'store']);
            Route::put('/{id}', [CompetitionController::class, 'update']);
            Route::delete('/{id}', [CompetitionController::class, 'destroy']);
            Route::put('/{id}/status', [CompetitionController::class, 'changeStatus']);
            Route::post('/{id}/criteria', [CompetitionController::class, 'storeCriterion']);
            Route::put('/criteria/{criterionId}', [CompetitionController::class, 'updateCriterion']);
            Route::delete('/criteria/{criterionId}', [CompetitionController::class, 'deleteCriterion']);
            Route::post('/{id}/judges', [CompetitionController::class, 'assignJudge']);
            Route::delete('/{id}/judges/{userId}', [CompetitionController::class, 'removeJudge']);
            Route::put('/teams/{teamId}/disqualify', [CompetitionRegistrationController::class, 'disqualify']);
            Route::put('/scores/{scoreId}/verify', [CompetitionJudgingController::class, 'verifyScore']);
        });

        Route::get('/{id}', [CompetitionController::class, 'show']);
        Route::post('/{id}/register', [CompetitionRegistrationController::class, 'register']);
        Route::post('/teams/{teamId}/members', [CompetitionRegistrationController::class, 'addMember']);
        Route::delete('/teams/{teamId}/members/{studentId}', [CompetitionRegistrationController::class, 'removeMember']);
        Route::post('/teams/{teamId}/submit', [CompetitionRegistrationController::class, 'submit']);

        Route::get('/{id}/scores', [CompetitionJudgingController::class, 'scores']);
        Route::post('/{id}/scores', [CompetitionJudgingController::class, 'submitScores']);
    });

    // Finance
    Route::get('/invoices/mine', [InvoiceController::class, 'mine']);
    Route::get('/my-outstanding', [FinanceReportController::class, 'myOutstanding']);
    Route::post('/mpesa/stk-push', [MpesaController::class, 'stkPush']);

    Route::middleware('role:admin|super_admin|accountant')->prefix('finance')->group(function () {

        Route::get('/summary', [FinanceReportController::class, 'summary']);
        Route::get('/collections', [FinanceReportController::class, 'collections']);
        Route::get('/outstanding', [FinanceReportController::class, 'outstanding']);
        Route::get('/expenses-by-category', [FinanceReportController::class, 'expensesByCategory']);
        Route::get('/transactions', [FinanceReportController::class, 'transactions']);

        Route::get('/fee-structures', [FeeStructureController::class, 'index']);
        Route::post('/fee-structures', [FeeStructureController::class, 'store']);
        Route::get('/fee-structures/{id}', [FeeStructureController::class, 'show']);
        Route::put('/fee-structures/{id}', [FeeStructureController::class, 'update']);
        Route::delete('/fee-structures/{id}', [FeeStructureController::class, 'destroy']);

        Route::get('/invoices', [InvoiceController::class, 'index']);
        Route::post('/invoices', [InvoiceController::class, 'store']);
        Route::post('/invoices/generate', [InvoiceController::class, 'generate']);
        Route::get('/invoices/{id}', [InvoiceController::class, 'show']);
        Route::get('/invoices/{id}/pdf', [InvoiceController::class, 'pdf']);
        Route::put('/invoices/{id}', [InvoiceController::class, 'update']);
        Route::delete('/invoices/{id}', [InvoiceController::class, 'destroy']);
        Route::put('/invoices/{id}/issue', [InvoiceController::class, 'issue']);
        Route::put('/invoices/{id}/void', [InvoiceController::class, 'void']);
        Route::post('/invoices/{id}/pay', [InvoiceController::class, 'recordPayment']);

        Route::get('/payments', [PaymentController::class, 'index']);
        Route::get('/payments/{id}', [PaymentController::class, 'show']);
        Route::get('/payments/{id}/pdf', [PaymentController::class, 'pdf']);
        Route::put('/payments/{id}/reverse', [PaymentController::class, 'reverse']);

        Route::get('/expenses', [ExpenseController::class, 'index']);
        Route::post('/expenses', [ExpenseController::class, 'store']);
        Route::get('/expenses/{id}', [ExpenseController::class, 'show']);
        Route::put('/expenses/{id}', [ExpenseController::class, 'update']);
        Route::delete('/expenses/{id}', [ExpenseController::class, 'destroy']);

        Route::get('/budgets', [BudgetController::class, 'index']);
        Route::post('/budgets', [BudgetController::class, 'store']);
        Route::get('/budgets/{id}', [BudgetController::class, 'show']);
        Route::put('/budgets/{id}', [BudgetController::class, 'update']);
        Route::delete('/budgets/{id}', [BudgetController::class, 'destroy']);

        Route::get('/mpesa/transactions', [MpesaController::class, 'transactions']);
        Route::get('/mpesa/transactions/{id}', [MpesaController::class, 'status']);
    });

    // Human Resources
    Route::middleware('role:admin|super_admin|hr_officer')->prefix('hr')->group(function () {

        Route::get('/summary', [HrController::class, 'summary']);
        Route::get('/options/departments', [HrController::class, 'departments']);
        Route::get('/options/positions', [HrController::class, 'positions']);
        Route::get('/reports/headcount', [HrController::class, 'headcount']);
        Route::get('/reports/leave', [HrController::class, 'leaveReport']);
        Route::get('/reports/attendance', [HrController::class, 'attendanceReport']);
        Route::get('/reports/payroll', [HrController::class, 'payrollReport']);
        Route::get('/export/employees', [HrController::class, 'exportEmployees']);
        Route::get('/export/leave', [HrController::class, 'exportLeave']);
        Route::get('/export/attendance', [HrController::class, 'exportAttendance']);
        Route::get('/export/employees/pdf', [HrController::class, 'exportEmployeesPdf']);
        Route::get('/export/leave/pdf', [HrController::class, 'exportLeavePdf']);
        Route::get('/export/attendance/pdf', [HrController::class, 'exportAttendancePdf']);
        Route::get('/search', [HrController::class, 'search']);

        Route::get('/employees', [EmployeeHrController::class, 'index']);
        Route::get('/employees/{id}', [EmployeeHrController::class, 'show']);
        Route::get('/employees/{id}/id-card/pdf', [EmployeeHrController::class, 'idCardPdf']);
        Route::put('/employees/{id}', [EmployeeHrController::class, 'update']);

        Route::get('/contracts', [ContractController::class, 'index']);
        Route::post('/contracts', [ContractController::class, 'store']);
        Route::get('/contracts/{id}', [ContractController::class, 'show']);
        Route::put('/contracts/{id}', [ContractController::class, 'update']);
        Route::put('/contracts/{id}/terminate', [ContractController::class, 'terminate']);
        Route::delete('/contracts/{id}', [ContractController::class, 'destroy']);

        Route::get('/leaves', [LeaveController::class, 'index']);
        Route::post('/leaves', [LeaveController::class, 'store']);
        Route::get('/leaves/{id}', [LeaveController::class, 'show']);
        Route::put('/leaves/{id}/review', [LeaveController::class, 'review']);
        Route::put('/leaves/{id}/cancel', [LeaveController::class, 'cancel']);

        Route::get('/attendance', [StaffAttendanceController::class, 'index']);
        Route::post('/attendance', [StaffAttendanceController::class, 'store']);
        Route::post('/attendance/bulk', [StaffAttendanceController::class, 'bulk']);
        Route::put('/attendance/{id}', [StaffAttendanceController::class, 'update']);
        Route::delete('/attendance/{id}', [StaffAttendanceController::class, 'destroy']);

        Route::get('/payrolls', [PayrollController::class, 'index']);
        Route::post('/payrolls/run', [PayrollController::class, 'run']);
        Route::get('/payrolls/{id}', [PayrollController::class, 'show']);
        Route::put('/payrolls/{id}/process', [PayrollController::class, 'process']);
        Route::put('/payrolls/{id}/mark-paid', [PayrollController::class, 'markPaid']);
        Route::put('/payrolls/{id}/cancel', [PayrollController::class, 'cancel']);
        Route::get('/payslips/{id}', [PayrollController::class, 'payslip']);
        Route::get('/payslips/{id}/pdf', [PayrollController::class, 'payslipPdf']);

        Route::get('/reviews', [PerformanceController::class, 'index']);
        Route::post('/reviews', [PerformanceController::class, 'store']);
        Route::get('/reviews/{id}', [PerformanceController::class, 'show']);
        Route::put('/reviews/{id}', [PerformanceController::class, 'update']);
        Route::delete('/reviews/{id}', [PerformanceController::class, 'destroy']);

        Route::get('/documents', [DocumentController::class, 'index']);
        Route::post('/documents', [DocumentController::class, 'store']);
        Route::get('/documents/{id}/download', [DocumentController::class, 'download']);
        Route::delete('/documents/{id}', [DocumentController::class, 'destroy']);
    });

    Route::middleware('role:employee|admin|super_admin')->prefix('my/hr')->group(function () {

        Route::get('/summary', [MyHrController::class, 'summary']);
        Route::get('/profile', [MyHrController::class, 'profile']);

        Route::get('/leaves', [LeaveController::class, 'myLeaves']);
        Route::get('/leaves/balance', [LeaveController::class, 'myBalance']);
        Route::post('/leaves', [LeaveController::class, 'myStore']);
        Route::put('/leaves/{id}/cancel', [LeaveController::class, 'myCancel']);

        Route::get('/attendance', [StaffAttendanceController::class, 'myAttendance']);

        Route::get('/payslips', [PayrollController::class, 'myPayslips']);
        Route::get('/payslips/{id}', [PayrollController::class, 'myPayslip']);
        Route::get('/payslips/{id}/pdf', [PayrollController::class, 'myPayslipPdf']);

        Route::get('/documents', [DocumentController::class, 'myDocuments']);
        Route::post('/documents', [DocumentController::class, 'myStore']);
    });

    // Inventory Management
    Route::middleware('role:admin|super_admin|inventory_officer')->prefix('inventory')->group(function () {

        Route::get('/summary', [InventoryReportController::class, 'summary']);

        Route::get('/categories', [AssetCategoryController::class, 'index']);
        Route::post('/categories', [AssetCategoryController::class, 'store']);
        Route::get('/categories/options', [AssetCategoryController::class, 'options']);
        Route::get('/categories/{id}', [AssetCategoryController::class, 'show']);
        Route::put('/categories/{id}', [AssetCategoryController::class, 'update']);
        Route::delete('/categories/{id}', [AssetCategoryController::class, 'destroy']);

        Route::get('/locations', [LocationController::class, 'index']);
        Route::post('/locations', [LocationController::class, 'store']);
        Route::get('/locations/options', [LocationController::class, 'options']);
        Route::get('/locations/{id}', [LocationController::class, 'show']);
        Route::put('/locations/{id}', [LocationController::class, 'update']);
        Route::delete('/locations/{id}', [LocationController::class, 'destroy']);

        Route::get('/assets', [AssetController::class, 'index']);
        Route::post('/assets', [AssetController::class, 'store']);
        Route::get('/assets/scan/{qrCode}', [AssetController::class, 'scan']);
        Route::get('/assets/{id}', [AssetController::class, 'show']);
        Route::put('/assets/{id}', [AssetController::class, 'update']);
        Route::delete('/assets/{id}', [AssetController::class, 'destroy']);
        Route::post('/assets/{id}/assign', [AssetController::class, 'assign']);
        Route::post('/assets/{id}/check-in', [AssetController::class, 'checkIn']);
        Route::post('/assets/{id}/dispose', [AssetController::class, 'dispose']);
        Route::get('/assets/{id}/assignments', [AssetController::class, 'assignments']);
        Route::get('/assets/{id}/qr', [AssetController::class, 'qrCode']);

        Route::get('/maintenance', [AssetMaintenanceController::class, 'index']);
        Route::post('/maintenance', [AssetMaintenanceController::class, 'store']);
        Route::get('/maintenance/{id}', [AssetMaintenanceController::class, 'show']);
        Route::put('/maintenance/{id}', [AssetMaintenanceController::class, 'update']);
        Route::delete('/maintenance/{id}', [AssetMaintenanceController::class, 'destroy']);

        Route::get('/items', [InventoryItemController::class, 'index']);
        Route::post('/items', [InventoryItemController::class, 'store']);
        Route::get('/items/low-stock', [InventoryItemController::class, 'lowStock']);
        Route::get('/items/{id}', [InventoryItemController::class, 'show']);
        Route::put('/items/{id}', [InventoryItemController::class, 'update']);
        Route::delete('/items/{id}', [InventoryItemController::class, 'destroy']);

        Route::get('/movements', [StockMovementController::class, 'index']);
        Route::get('/movements/for-item/{itemId}', [StockMovementController::class, 'forItem']);
        Route::post('/items/{itemId}/movements', [StockMovementController::class, 'store']);
    });

    // Digital Library
    Route::get('/library/catalog', [LibraryResourceController::class, 'catalog']);
    Route::get('/library/catalog/resources/{id}', [LibraryResourceController::class, 'show']);
    Route::get('/library/categories/options', [LibraryCategoryController::class, 'options']);
    Route::get('/library/authors/options', [LibraryAuthorController::class, 'options']);

    Route::middleware('role:admin|super_admin|librarian')->prefix('library')->group(function () {
        Route::get('/summary', [LibraryReportController::class, 'summary']);

        Route::get('/categories', [LibraryCategoryController::class, 'index']);
        Route::post('/categories', [LibraryCategoryController::class, 'store']);
        Route::put('/categories/{id}', [LibraryCategoryController::class, 'update']);
        Route::delete('/categories/{id}', [LibraryCategoryController::class, 'destroy']);

        Route::get('/authors', [LibraryAuthorController::class, 'index']);
        Route::post('/authors', [LibraryAuthorController::class, 'store']);
        Route::put('/authors/{id}', [LibraryAuthorController::class, 'update']);
        Route::delete('/authors/{id}', [LibraryAuthorController::class, 'destroy']);

        Route::get('/resources', [LibraryResourceController::class, 'index']);
        Route::post('/resources', [LibraryResourceController::class, 'store']);
        Route::get('/resources/{id}', [LibraryResourceController::class, 'show']);
        Route::put('/resources/{id}', [LibraryResourceController::class, 'update']);
        Route::delete('/resources/{id}', [LibraryResourceController::class, 'destroy']);

        Route::get('/borrowings', [LibraryBorrowingController::class, 'index']);
        Route::put('/borrowings/{borrowingId}/return', [LibraryBorrowingController::class, 'returnBorrowing']);

        Route::get('/reservations', [LibraryReservationController::class, 'index']);
        Route::put('/reservations/{reservationId}/cancel', [LibraryReservationController::class, 'cancel']);
    });

    Route::middleware('auth:sanctum')->prefix('library')->group(function () {
        Route::post('/resources/{id}/borrow', [LibraryBorrowingController::class, 'store']);
        Route::get('/my/borrowings', [LibraryBorrowingController::class, 'my']);
        Route::post('/resources/{id}/reserve', [LibraryReservationController::class, 'store']);
        Route::get('/my/reservations', [LibraryReservationController::class, 'my']);
        Route::put('/my/reservations/{reservationId}/cancel', [LibraryReservationController::class, 'cancel']);
        Route::get('/my/history', [LibraryHistoryController::class, 'my']);
    });
});
