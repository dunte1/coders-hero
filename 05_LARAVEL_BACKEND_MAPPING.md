# Coder's Hero — Laravel Backend Mapping

> Evidence-based mapping of the Laravel backend API, authentication, roles, routes, database tables, and models.

---

## 1. Authentication Architecture

### Laravel Sanctum Token-Based Auth

The backend uses **Laravel Sanctum** for API token authentication. Users are authenticated via bearer tokens stored in `personal_access_tokens`. The `User` model uses `HasApiTokens` trait.

### Auth Endpoints

| Method | Endpoint | Controller | Auth Required | Description |
|--------|----------|------------|---------------|-------------|
| `POST` | `/api/register` | `AuthController@register` | No | Register new user |
| `POST` | `/api/login` | `AuthController@login` | No | Login, returns token. If 2FA enabled, returns `requires_two_factor: true` + `pending_token` |
| `POST` | `/api/logout` | `AuthController@logout` | Yes | Revoke current token |
| `POST` | `/api/refresh-token` | `AuthController@refreshToken` | Yes | Refresh token |
| `GET` | `/api/profile` | `AuthController@profile` | Yes | Get authenticated user profile |
| `PUT` | `/api/profile` | `AuthController@updateProfile` | Yes | Update profile |
| `POST` | `/api/change-password` | `AuthController@changePassword` | Yes | Change password |
| `POST` | `/api/profile/photo` | `AuthController@uploadPhoto` | Yes | Upload avatar |

### Password Reset

| Method | Endpoint | Controller | Auth Required | Description |
|--------|----------|------------|---------------|-------------|
| `POST` | `/api/forgot-password` | `PasswordResetController@forgot` | No | Send reset email |
| `POST` | `/api/reset-password` | `PasswordResetController@reset` | No | Reset with token |
| `POST` | `/api/reset-password/validate` | `PasswordResetController@validateResetToken` | No | Validate reset token |

### Email Verification

| Method | Endpoint | Controller | Auth Required | Description |
|--------|----------|------------|---------------|-------------|
| `GET` | `/api/email/verify/{id}/{hash}` | `EmailVerificationController@verify` | No | Verify email link |
| `POST` | `/api/email/verification-notification` | `EmailVerificationController@send` | Yes | Send verification |
| `POST` | `/api/email/resend` | `EmailVerificationController@resend` | Yes | Resend verification |

### Two-Factor Authentication (2FA)

| Method | Endpoint | Controller | Auth Required | Description |
|--------|----------|------------|---------------|-------------|
| `GET` | `/api/two-factor/status` | `TwoFactorController@status` | Yes | Check 2FA status |
| `POST` | `/api/two-factor/enable` | `TwoFactorController@enable` | Yes | Enable 2FA (returns QR code, recovery codes) |
| `POST` | `/api/two-factor/confirm` | `TwoFactorController@confirm` | Yes | Confirm 2FA setup with code |
| `POST` | `/api/two-factor/disable` | `TwoFactorController@disable` | Yes | Disable 2FA |
| `POST` | `/api/two-factor/challenge` | `TwoFactorController@challenge` | No | Submit 2FA code during login (uses pending token) |
| `POST` | `/api/two-factor/recovery-codes` | `TwoFactorController@recoveryCodes` | Yes | Regenerate recovery codes |

### Login History

| Method | Endpoint | Controller | Auth Required | Description |
|--------|----------|------------|---------------|-------------|
| `GET` | `/api/login-history` | `LoginHistoryController@index` | Yes | User's own login history |
| `DELETE` | `/api/login-history` | `LoginHistoryController@destroy` | Yes | Clear login history |

### Auth Flow (React Reference for Flutter)

```
Login Flow:
1. POST /api/login → { user, token, requires_two_factor? }
2. If 2FA required → POST /api/two-factor/challenge → { user, token }
3. Store token in SecureStorage (Flutter) / localStorage (React)
4. Attach token as Authorization: Bearer <token> header

Token Management:
- Axios interceptor adds Authorization header to every request
- On 401 → logout and redirect to /login
- Flutter equivalent: Dio interceptor with same logic
```

---

## 2. Role & Permission System

### Spatie Laravel Permission

The backend uses **Spatie Laravel Permission** package for role-based access control.

### 15 Roles

| # | Role | Description |
|---|------|-------------|
| 1 | `super_admin` | Full system access, system health, backups |
| 2 | `admin` | Administrative access, CMS, user management |
| 3 | `director` | Branch-level management, analytics |
| 4 | `branch_manager` | Branch-level student/org management |
| 5 | `school_admin` | School-level administration |
| 6 | `teacher` | Class management, grading, assignments |
| 7 | `instructor` | Course instruction, LMS management |
| 8 | `employee` | Self-service HR, tasks |
| 9 | `student` | Learning portal, assignments, quizzes |
| 10 | `parent` | Parent portal, child progress |
| 11 | `judge` | Competition judging |
| 12 | `hr_officer` | HR management, payroll, attendance |
| 13 | `inventory_officer` | Asset and inventory management |
| 14 | `librarian` | Library resource management |
| 15 | `accountant` | Finance management |

### Permission Groups (~120 permissions)

Based on Spatie permission tables and navigation config:

| Group | Permissions |
|-------|-------------|
| **Students** | `view_students`, `create_students`, `edit_students`, `delete_students`, `view_student_reports` |
| **Attendance** | `view_attendance`, `manage_attendance`, `view_attendance_reports` |
| **Courses** | `view_courses`, `create_courses`, `edit_courses`, `delete_courses`, `publish_courses` |
| **Finance** | `manage_fee_structures`, `manage_invoices`, `record_payments`, `manage_expenses`, `manage_budgets`, `manage_mpesa` |
| **Users** | `view_users`, `create_users`, `edit_users`, `delete_users` |
| **Roles** | `view_roles`, `create_roles`, `edit_roles`, `delete_roles` |
| **Permissions** | `view_permissions`, `create_permissions`, `edit_permissions`, `delete_permissions` |
| **HR** | `manage_contracts`, `manage_leave`, `manage_attendance`, `manage_payroll`, `manage_performance_reviews`, `manage_employee_documents` |
| **Inventory** | `manage_assets`, `manage_inventory_items`, `manage_asset_maintenance`, `manage_asset_categories`, `manage_locations` |
| **Library** | `manage_library_resources`, `manage_library_borrowings`, `manage_library_reservations`, `manage_library_categories`, `manage_library_authors` |
| **Settings** | Site settings, CMS management, notification templates |

### Middleware

```
Route::middleware('role:admin|super_admin')          // Admin group
Route::middleware('role:admin|super_admin|director|branch_manager|school_admin')  // Extended admin
Route::middleware('role:admin|super_admin|accountant')  // Finance
Route::middleware('role:admin|super_admin|hr_officer')  // HR
Route::middleware('role:admin|super_admin|inventory_officer')  // Inventory
Route::middleware('role:admin|super_admin|librarian')  // Library
Route::middleware('role:teacher|instructor|admin|super_admin')  // Staff
Route::middleware('role:employee|admin|super_admin')  // Employee self-service
Route::middleware('role:parent|admin|super_admin')  // Parent portal
Route::middleware('role:student')  // Student portal
```

---

## 3. API Route Groups

All routes verified from `backend/routes/api.php` (1114 lines).

### Public Routes (No Auth)

| Group | Prefix | Routes | Controller |
|-------|--------|--------|------------|
| Auth | `/` | 2 | `AuthController` |
| Password Reset | `/` | 3 | `PasswordResetController` |
| Public Website | `/public` | 19 | `WebsiteController` |
| M-Pesa Callback | `/` | 1 | `MpesaController` |
| Certificate Verify | `/public` | 2 | `CertificateController` |

### Authenticated Routes (`auth:sanctum`)

| Group | Prefix | Routes | Controller | Middleware |
|-------|--------|--------|------------|-----------|
| Profile/Auth | `/` | 7 | `AuthController` | `auth:sanctum` |
| Email Verification | `/` | 2 | `EmailVerificationController` | `auth:sanctum` |
| Two-Factor | `/` | 6 | `TwoFactorController` | `auth:sanctum` |
| Login History | `/` | 2 | `LoginHistoryController` | `auth:sanctum` |
| Dashboard | `/` | 2 | `DashboardController` | `auth:sanctum` |
| Notifications | `/` | 6 | `NotificationController` | `auth:sanctum` |
| Notification Prefs | `/` | 5 | `NotificationPreferenceController` | `auth:sanctum` |
| Notification Templates | `/` | 1 | `NotificationTemplateController` | `auth:sanctum` |
| Announcements | `/` | 2 | `AnnouncementController` | `auth:sanctum` |
| Courses | `/` | 7 | `CourseController` | `auth:sanctum` |
| Categories | `/` | 2 | `CategoryController` | `auth:sanctum` |
| Enrollments | `/` | 7 | `EnrollmentController` | `auth:sanctum` |
| Certificates | `/` | 6 | `CertificateController` | `auth:sanctum` |
| Tasks | `/` | 10 | `TaskController` | `auth:sanctum` |
| Projects | `/` | 9 | `ProjectController` | `auth:sanctum` |
| Quizzes | `/` | 9 | `QuizController` | `auth:sanctum` |

### Role-Protected Route Groups

| Group | Prefix | Middleware | Routes (approx) |
|-------|--------|------------|-----------------|
| Admin (Users, Roles, Permissions, Reports) | `/admin` | `role:admin\|super_admin\|director\|branch_manager\|school_admin` | ~90 |
| Admin Site Settings (CMS) | `/admin` | `role:admin\|super_admin` | ~40 |
| System Admin | `/admin` | `role:super_admin` | 6 |
| Analytics | `/admin` | `role:admin\|super_admin\|director\|branch_manager\|school_admin\|accountant` | 10 |
| Organization (Branches, Partners, Academic Years) | `/organization` | `role:admin\|super_admin\|director\|branch_manager\|school_admin` | 19 |
| Students | `/students` | `role:admin\|super_admin\|director\|branch_manager\|school_admin` | 30 |
| Guardians | `/guardians` | `role:admin\|super_admin\|director\|branch_manager\|school_admin` | 6 |
| Admissions | `/admissions` | `role:admin\|super_admin\|director\|branch_manager\|school_admin` | 7 |
| Attendance | `/attendance` | `role:admin\|super_admin\|director\|branch_manager\|school_admin` | 6 |
| Student Assignments | `/student/assignments` | `role:student` | 4 |
| Instructor | `/instructor` | `role:instructor\|admin` | 10 |
| Employee | `/employee` | `role:employee\|admin` | 1 |
| Parent Portal | `/parent` | `role:parent\|admin\|super_admin` | 19 |
| Chat | `/chat` | `role:parent\|instructor\|admin\|super_admin` | 5 |
| Teacher Portal | `/teacher` | `role:teacher\|instructor\|admin\|super_admin\|director\|branch_manager\|school_admin` | 54 |
| LMS Interactive | `/lms` | `auth:sanctum` (any authenticated) | ~50 |
| Robotics | `/robotics` | `auth:sanctum` | ~25 |
| Competitions | `/competitions` | `auth:sanctum` | ~15 |
| Finance | `/finance` | `role:admin\|super_admin\|accountant` | ~20 |
| HR | `/hr` | `role:admin\|super_admin\|hr_officer` | ~25 |
| My HR (self-service) | `/my/hr` | `role:employee\|admin\|super_admin` | ~15 |
| Inventory | `/inventory` | `role:admin\|super_admin\|inventory_officer` | ~15 |
| Library (admin) | `/library` | `role:admin\|super_admin\|librarian` | ~10 |
| Library (authenticated) | `/library` | `auth:sanctum` | ~6 |

---

## 4. Database Tables (138 Migrations)

### Complete Migration List

| # | Migration | Table |
|---|-----------|-------|
| 1 | `2024_01_01_000001` | `users` |
| 2 | `2024_01_01_000002` | `personal_access_tokens` |
| 3 | `2024_01_01_000003` | `roles` |
| 4 | `2024_01_01_000004` | `permissions` |
| 5 | `2024_01_01_000005` | `role_has_permissions` |
| 6 | `2024_01_01_000006` | `model_has_roles` |
| 7 | `2024_01_01_000007` | `model_has_permissions` |
| 8 | `2024_01_01_000008` | `modules` |
| 9 | `2024_01_01_000009` | `departments` |
| 10 | `2024_01_01_000010` | `positions` |
| 11 | `2024_01_01_000011` | `employees` |
| 12 | `2024_01_01_000012` | `categories` |
| 13 | `2024_01_01_000013` | `courses` |
| 14 | `2024_01_01_000014` | `lessons` |
| 15 | `2024_01_01_000015` | `enrollments` |
| 16 | `2024_01_01_000016` | `lesson_completions` |
| 17 | `2024_01_01_000017` | `quizzes` |
| 18 | `2024_01_01_000018` | `quiz_questions` |
| 19 | `2024_01_01_000019` | `quiz_attempts` |
| 20 | `2024_01_01_000020` | `certificates` |
| 21 | `2024_01_01_000021` | `tasks` |
| 22 | `2024_01_01_000022` | `projects` |
| 23 | `2024_01_01_000023` | `project_members` |
| 24 | `2024_01_01_000024` | `announcements` |
| 25 | `2024_01_01_000025` | `notifications` |
| 26 | `2024_01_01_000026` | `activity_log` |
| 27 | `2024_01_01_000027` | `users` (add 2FA fields) |
| 28 | `2024_01_01_000028` | `password_reset_tokens` |
| 29 | `2024_01_01_000029` | `login_histories` |
| 30 | `2024_01_01_000030` | `site_sections` |
| 31 | `2024_01_01_000031` | `services` |
| 32 | `2024_01_01_000032` | `programs` |
| 33 | `2024_01_01_000033` | `gallery_items` |
| 34 | `2024_01_01_000034` | `testimonials` |
| 35 | `2024_01_01_000035` | `blog_posts` |
| 36 | `2024_01_01_000036` | `faqs` |
| 37 | `2024_01_01_000037` | `contact_messages` |
| 38 | `2024_01_01_000038` | `page_views` |
| 39 | `2024_01_01_000039` | `site_settings` |
| 40 | `2024_01_01_000040` | `guardians` |
| 41 | `2024_01_01_000041` | `students` |
| 42 | `2024_01_01_000042` | `admissions` |
| 43 | `2024_01_01_000043` | `medical_records` |
| 44 | `2024_01_01_000044` | `attendances` |
| 45 | `2024_01_01_000045` | `student_documents` |
| 46 | `2024_01_01_000046` | `student_timeline_entries` |
| 47 | `2024_01_01_000047` | `guardians` (add user_id) |
| 48 | `2024_01_01_000048` | `report_cards` |
| 49 | `2024_01_01_000049` | `report_card_items` |
| 50 | `2024_01_01_000050` | `coding_progress` |
| 51 | `2024_01_01_000051` | `fees` |
| 52 | `2024_01_01_000052` | `payments` |
| 53 | `2024_01_01_000053` | `appointments` |
| 54 | `2024_01_01_000054` | `conversations` |
| 55 | `2024_01_01_000055` | `messages` |
| 56 | `2024_01_02_000001` | `classes` |
| 57 | `2024_01_02_000002` | `class_student` |
| 58 | `2024_01_02_000003` | `assignments` |
| 59 | `2024_01_02_000004` | `assignment_submissions` |
| 60 | `2024_01_02_000005` | `exams` |
| 61 | `2024_01_02_000006` | `exam_results` |
| 62 | `2024_01_02_000007` | `gradebook_entries` |
| 63 | `2024_01_02_000008` | `lesson_notes` |
| 64 | `2024_01_02_000009` | `calendar_events` |
| 65 | `2024_01_02_000010` | `forum_threads` |
| 66 | `2024_01_02_000011` | `forum_posts` |
| 67 | `2024_01_02_000012` | `course_ratings` |
| 68 | `2024_01_02_000013` | `bookmarks` |
| 69 | `2024_01_02_000014` | `coding_exercises` |
| 70 | `2024_01_02_000015` | `coding_submissions` |
| 71 | `2024_01_02_000016` | `ai_tutor_conversations` |
| 72 | `2024_01_02_000017` | `ai_tutor_messages` |
| 73 | `2024_01_02_000018` | `video_progress` |
| 74 | `2026_08_12_000001` | `coding_workspaces` |
| 75 | `2026_08_13_000001` | `robotics_equipment` |
| 76 | `2026_08_13_000002` | `robotics_teams` |
| 77 | `2026_08_13_000003` | `robotics_team_student` |
| 78 | `2026_08_13_000004` | `robotics_equipment_assignments` |
| 79 | `2026_08_13_000005` | `robotics_equipment_reservations` |
| 80 | `2026_08_13_000006` | `robotics_maintenance_records` |
| 81 | `2026_08_13_000007` | `robotics_projects` |
| 82 | `2026_08_13_000008` | `robotics_project_submissions` |
| 83 | `2026_08_14_000001` | `competitions` |
| 84 | `2026_08_14_000002` | `competition_criteria` |
| 85 | `2026_08_14_000003` | `competition_teams` |
| 86 | `2026_08_14_000004` | `competition_team_members` |
| 87 | `2026_08_14_000005` | `competition_judges` |
| 88 | `2026_08_14_000006` | `competition_scores` |
| 89 | `2026_08_15_000001` | `expenses` |
| 90 | `2026_08_15_000002` | `budgets` |
| 91 | `2026_08_15_000003` | `mpesa_transactions` |
| 92 | `2026_08_15_000004` | `fee_structures` |
| 93 | `2026_08_15_000005` | `invoices` |
| 94 | `2026_08_15_000006` | `invoice_items` |
| 95 | `2026_08_15_000007` | `payments` (add invoice_id) |
| 96 | `2026_08_15_000008` | `mpesa_transactions` (add reconciliation) |
| 97 | `2026_08_16_000001` | `employees` (add HR fields) |
| 98 | `2026_08_16_000002` | `employee_contracts` |
| 99 | `2026_08_16_000003` | `leave_requests` |
| 100 | `2026_08_16_000004` | `payrolls` |
| 101 | `2026_08_16_000005` | `payslips` |
| 102 | `2026_08_16_000006` | `performance_reviews` |
| 103 | `2026_08_16_000007` | `staff_attendances` |
| 104 | `2026_08_16_000008` | `employee_documents` |
| 105 | `2026_08_17_000001` | `asset_categories` / `branches` |
| 106 | `2026_08_17_000002` | `locations` / `partner_schools` |
| 107 | `2026_08_17_000003` | `academic_years` / `assets` |
| 108 | `2026_08_17_000004` | `asset_assignments` |
| 109 | `2026_08_17_000005` | `asset_maintenance_records` |
| 110 | `2026_08_17_000006` | `inventory_items` |
| 111 | `2026_08_17_000007` | `stock_movements` |
| 112 | `2026_08_18_000001` | `library_categories` |
| 113 | `2026_08_18_000002` | `library_authors` |
| 114 | `2026_08_18_000003` | `library_resources` |
| 115 | `2026_08_18_000004` | `library_borrowings` |
| 116 | `2026_08_18_000005` | `library_reservations` |
| 117 | `2026_08_18_000006` | `library_reading_history` |
| 118 | `2026_08_18_161843` | `lessons` (fix FK) |
| 119 | `2026_08_18_165337` | `cache` |
| 120 | `2026_08_19_000001` | `certificate_templates` |
| 121 | `2026_08_19_000002` | `certificates` (add mgmt fields) |
| 122 | `2026_08_19_000003` | `certificate_verifications` |
| 123 | `2026_08_20_000001` | `ai_assistants` |
| 124 | `2026_08_20_000002` | `ai_prompt_templates` |
| 125 | `2026_08_20_000003` | `ai_conversations` |
| 126 | `2026_08_20_000004` | `ai_messages` |
| 127 | `2026_08_20_000005` | `ai_usage_logs` |
| 128 | `2026_08_21_000001` | `notifications` (add communication fields) |
| 129 | `2026_08_21_000002` | `notification_deliveries` |
| 130 | `2026_08_21_000003` | `notification_preferences` |
| 131 | `2026_08_21_000004` | `notification_templates` |
| 132 | `2026_08_21_000005` | `user_fcm_tokens` |
| 133 | `20260817223240` | `employees` (add ID card fields) |
| 134 | `20260817224211` | `students` (add id_card_photo) |
| 135 | `20260817230000` | `course_modules` |

---

## 5. Key Models (118 Models)

### Complete Model List

| # | Model | File Path | Table |
|---|-------|-----------|-------|
| 1 | `AcademicYear` | `app/Models/AcademicYear.php` | `academic_years` |
| 2 | `ActivityLog` | `app/Models/ActivityLog.php` | `activity_log` |
| 3 | `Admission` | `app/Models/Admission.php` | `admissions` |
| 4 | `AiAssistant` | `app/Models/AiAssistant.php` | `ai_assistants` |
| 5 | `AiConversation` | `app/Models/AiConversation.php` | `ai_conversations` |
| 6 | `AiMessage` | `app/Models/AiMessage.php` | `ai_messages` |
| 7 | `AiPromptTemplate` | `app/Models/AiPromptTemplate.php` | `ai_prompt_templates` |
| 8 | `AiTutorConversation` | `app/Models/AiTutorConversation.php` | `ai_tutor_conversations` |
| 9 | `AiTutorMessage` | `app/Models/AiTutorMessage.php` | `ai_tutor_messages` |
| 10 | `AiUsageLog` | `app/Models/AiUsageLog.php` | `ai_usage_logs` |
| 11 | `Announcement` | `app/Models/Announcement.php` | `announcements` |
| 12 | `Appointment` | `app/Models/Appointment.php` | `appointments` |
| 13 | `Asset` | `app/Models/Asset.php` | `assets` |
| 14 | `AssetAssignment` | `app/Models/AssetAssignment.php` | `asset_assignments` |
| 15 | `AssetCategory` | `app/Models/AssetCategory.php` | `asset_categories` |
| 16 | `AssetMaintenanceRecord` | `app/Models/AssetMaintenanceRecord.php` | `asset_maintenance_records` |
| 17 | `Assignment` | `app/Models/Assignment.php` | `assignments` |
| 18 | `AssignmentSubmission` | `app/Models/AssignmentSubmission.php` | `assignment_submissions` |
| 19 | `Attendance` | `app/Models/Attendance.php` | `attendances` |
| 20 | `BlogPost` | `app/Models/BlogPost.php` | `blog_posts` |
| 21 | `Bookmark` | `app/Models/Bookmark.php` | `bookmarks` |
| 22 | `Branch` | `app/Models/Branch.php` | `branches` |
| 23 | `Budget` | `app/Models/Budget.php` | `budgets` |
| 24 | `CalendarEvent` | `app/Models/CalendarEvent.php` | `calendar_events` |
| 25 | `Category` | `app/Models/Category.php` | `categories` |
| 26 | `Certificate` | `app/Models/Certificate.php` | `certificates` |
| 27 | `CertificateTemplate` | `app/Models/CertificateTemplate.php` | `certificate_templates` |
| 28 | `CertificateVerification` | `app/Models/CertificateVerification.php` | `certificate_verifications` |
| 29 | `ClassStudent` | `app/Models/ClassStudent.php` | `class_student` |
| 30 | `CodingExercise` | `app/Models/CodingExercise.php` | `coding_exercises` |
| 31 | `CodingProgress` | `app/Models/CodingProgress.php` | `coding_progress` |
| 32 | `CodingSubmission` | `app/Models/CodingSubmission.php` | `coding_submissions` |
| 33 | `CodingWorkspace` | `app/Models/CodingWorkspace.php` | `coding_workspaces` |
| 34 | `Competition` | `app/Models/Competition.php` | `competitions` |
| 35 | `CompetitionCriterion` | `app/Models/CompetitionCriterion.php` | `competition_criteria` |
| 36 | `CompetitionScore` | `app/Models/CompetitionScore.php` | `competition_scores` |
| 37 | `CompetitionTeam` | `app/Models/CompetitionTeam.php` | `competition_teams` |
| 38 | `ContactMessage` | `app/Models/ContactMessage.php` | `contact_messages` |
| 39 | `Conversation` | `app/Models/Conversation.php` | `conversations` |
| 40 | `Course` | `app/Models/Course.php` | `courses` |
| 41 | `CourseModule` | `app/Models/CourseModule.php` | `course_modules` |
| 42 | `CourseRating` | `app/Models/CourseRating.php` | `course_ratings` |
| 43 | `Department` | `app/Models/Department.php` | `departments` |
| 44 | `Employee` | `app/Models/Employee.php` | `employees` |
| 45 | `EmployeeContract` | `app/Models/EmployeeContract.php` | `employee_contracts` |
| 46 | `EmployeeDocument` | `app/Models/EmployeeDocument.php` | `employee_documents` |
| 47 | `Enrollment` | `app/Models/Enrollment.php` | `enrollments` |
| 48 | `Exam` | `app/Models/Exam.php` | `exams` |
| 49 | `ExamResult` | `app/Models/ExamResult.php` | `exam_results` |
| 50 | `Expense` | `app/Models/Expense.php` | `expenses` |
| 51 | `Faq` | `app/Models/Faq.php` | `faqs` |
| 52 | `Fee` | `app/Models/Fee.php` | `fees` |
| 53 | `FeeStructure` | `app/Models/FeeStructure.php` | `fee_structures` |
| 54 | `ForumPost` | `app/Models/ForumPost.php` | `forum_posts` |
| 55 | `ForumThread` | `app/Models/ForumThread.php` | `forum_threads` |
| 56 | `GalleryItem` | `app/Models/GalleryItem.php` | `gallery_items` |
| 57 | `GradebookEntry` | `app/Models/GradebookEntry.php` | `gradebook_entries` |
| 58 | `Guardian` | `app/Models/Guardian.php` | `guardians` |
| 59 | `InventoryItem` | `app/Models/InventoryItem.php` | `inventory_items` |
| 60 | `Invoice` | `app/Models/Invoice.php` | `invoices` |
| 61 | `InvoiceItem` | `app/Models/InvoiceItem.php` | `invoice_items` |
| 62 | `LeaveRequest` | `app/Models/LeaveRequest.php` | `leave_requests` |
| 63 | `Lesson` | `app/Models/Lesson.php` | `lessons` |
| 64 | `LessonCompletion` | `app/Models/LessonCompletion.php` | `lesson_completions` |
| 65 | `LessonNote` | `app/Models/LessonNote.php` | `lesson_notes` |
| 66 | `LibraryAuthor` | `app/Models/LibraryAuthor.php` | `library_authors` |
| 67 | `LibraryBorrowing` | `app/Models/LibraryBorrowing.php` | `library_borrowings` |
| 68 | `LibraryCategory` | `app/Models/LibraryCategory.php` | `library_categories` |
| 69 | `LibraryReadingHistory` | `app/Models/LibraryReadingHistory.php` | `library_reading_history` |
| 70 | `LibraryReservation` | `app/Models/LibraryReservation.php` | `library_reservations` |
| 71 | `LibraryResource` | `app/Models/LibraryResource.php` | `library_resources` |
| 72 | `Location` | `app/Models/Location.php` | `locations` |
| 73 | `LoginHistory` | `app/Models/LoginHistory.php` | `login_histories` |
| 74 | `MedicalRecord` | `app/Models/MedicalRecord.php` | `medical_records` |
| 75 | `Message` | `app/Models/Message.php` | `messages` |
| 76 | `Module` | `app/Models/Module.php` | `modules` |
| 77 | `MpesaTransaction` | `app/Models/MpesaTransaction.php` | `mpesa_transactions` |
| 78 | `Notification` | `app/Models/Notification.php` | `notifications` |
| 79 | `NotificationDelivery` | `app/Models/NotificationDelivery.php` | `notification_deliveries` |
| 80 | `NotificationPreference` | `app/Models/NotificationPreference.php` | `notification_preferences` |
| 81 | `NotificationTemplate` | `app/Models/NotificationTemplate.php` | `notification_templates` |
| 82 | `PageView` | `app/Models/PageView.php` | `page_views` |
| 83 | `PartnerSchool` | `app/Models/PartnerSchool.php` | `partner_schools` |
| 84 | `Payment` | `app/Models/Payment.php` | `payments` |
| 85 | `Payroll` | `app/Models/Payroll.php` | `payrolls` |
| 86 | `Payslip` | `app/Models/Payslip.php` | `payslips` |
| 87 | `PerformanceReview` | `app/Models/PerformanceReview.php` | `performance_reviews` |
| 88 | `Position` | `app/Models/Position.php` | `positions` |
| 89 | `Program` | `app/Models/Program.php` | `programs` |
| 90 | `Project` | `app/Models/Project.php` | `projects` |
| 91 | `ProjectMember` | `app/Models/ProjectMember.php` | `project_members` |
| 92 | `Quiz` | `app/Models/Quiz.php` | `quizzes` |
| 93 | `QuizAttempt` | `app/Models/QuizAttempt.php` | `quiz_attempts` |
| 94 | `QuizQuestion` | `app/Models/QuizQuestion.php` | `quiz_questions` |
| 95 | `ReportCard` | `app/Models/ReportCard.php` | `report_cards` |
| 96 | `ReportCardItem` | `app/Models/ReportCardItem.php` | `report_card_items` |
| 97 | `RoboticsEquipment` | `app/Models/RoboticsEquipment.php` | `robotics_equipment` |
| 98 | `RoboticsEquipmentAssignment` | `app/Models/RoboticsEquipmentAssignment.php` | `robotics_equipment_assignments` |
| 99 | `RoboticsEquipmentReservation` | `app/Models/RoboticsEquipmentReservation.php` | `robotics_equipment_reservations` |
| 100 | `RoboticsMaintenanceRecord` | `app/Models/RoboticsMaintenanceRecord.php` | `robotics_maintenance_records` |
| 101 | `RoboticsProject` | `app/Models/RoboticsProject.php` | `robotics_projects` |
| 102 | `RoboticsProjectSubmission` | `app/Models/RoboticsProjectSubmission.php` | `robotics_project_submissions` |
| 103 | `RoboticsTeam` | `app/Models/RoboticsTeam.php` | `robotics_teams` |
| 104 | `RoboticsTeamStudent` | `app/Models/RoboticsTeamStudent.php` | `robotics_team_student` |
| 105 | `SchoolClass` | `app/Models/SchoolClass.php` | `classes` |
| 106 | `Service` | `app/Models/Service.php` | `services` |
| 107 | `SiteSection` | `app/Models/SiteSection.php` | `site_sections` |
| 108 | `SiteSetting` | `app/Models/SiteSetting.php` | `site_settings` |
| 109 | `StaffAttendance` | `app/Models/StaffAttendance.php` | `staff_attendances` |
| 110 | `StockMovement` | `app/Models/StockMovement.php` | `stock_movements` |
| 111 | `Student` | `app/Models/Student.php` | `students` |
| 112 | `StudentDocument` | `app/Models/StudentDocument.php` | `student_documents` |
| 113 | `StudentTimelineEntry` | `app/Models/StudentTimelineEntry.php` | `student_timeline_entries` |
| 114 | `Task` | `app/Models/Task.php` | `tasks` |
| 115 | `Testimonial` | `app/Models/Testimonial.php` | `testimonials` |
| 116 | `User` | `app/Models/User.php` | `users` |
| 117 | `UserFcmToken` | `app/Models/UserFcmToken.php` | `user_fcm_tokens` |
| 118 | `VideoProgress` | `app/Models/VideoProgress.php` | `video_progress` |

---

## 6. Key Model Relationships

### User (Central Model)
```
User hasMany: Employee, Task (assigned/created), Enrollment, Course (instructor),
              ProjectMember, Certificate, QuizAttempt, LessonCompletion,
              LoginHistory, Conversation (guardian/teacher), Message,
              Appointment (teacher), SchoolClass, Assignment, Exam,
              GradebookEntry, LessonNote, CalendarEvent, ForumThread,
              ForumPost, CourseRating, Bookmark, AiTutorConversation,
              VideoProgress, CodingSubmission, Notification, UserFcmToken
User hasOne: Employee, Guardian
User hasOneThrough: Department (via Employee)
```

### Student
```
Student belongsTo: Guardian, User
Student hasOne: MedicalRecord
Student hasMany: Attendance, StudentDocument, StudentTimelineEntry,
                  ReportCard, CodingProgress, Fee, Appointment,
                  AssignmentSubmission, ExamResult, GradebookEntry
Student belongsToMany: SchoolClass (via class_student)
```

### Course
```
Course belongsTo: Category, User (instructor)
Course hasMany: Lesson, Enrollment, CourseRating, CourseModule, Module
```

### Employee
```
Employee belongsTo: User, Department, Position
Employee hasMany: EmployeeContract, LeaveRequest, StaffAttendance,
                   PerformanceReview, EmployeeDocument, Payslip
```
