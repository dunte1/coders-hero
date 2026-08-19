# Coder's Hero — Database Mapping for Flutter Models

> Mapping of Flutter models → Laravel models → Database tables → Key fields and relationships.

---

## 1. Core Models (Flutter → Laravel → Database)

### User Model

| Property | Value |
|----------|-------|
| **Flutter Model** | `UserModel` (to rebuild) |
| **Laravel Model** | `User` |
| **Table** | `users` |
| **Primary Key** | `id` (UUID) |
| **File** | `backend/app/Models/User.php` |

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | No | - | Primary key |
| `name` | string | No | - | Full name |
| `email` | string | No | - | Unique |
| `email_verified_at` | timestamp | Yes | null | |
| `password` | string | No | - | Hashed |
| `avatar` | string | Yes | null | Path to file |
| `phone` | string | Yes | null | |
| `is_active` | boolean | No | true | |
| `last_login_at` | timestamp | Yes | null | |
| `two_factor_secret` | string | Yes | null | Encrypted |
| `two_factor_recovery_codes` | string | Yes | null | Encrypted array |
| `two_factor_confirmed_at` | timestamp | Yes | null | |
| `two_factor_enabled` | boolean | No | false | |
| `remember_token` | string | Yes | null | |
| `created_at` | timestamp | No | - | |
| `updated_at` | timestamp | No | - | |
| `deleted_at` | timestamp | Yes | null | Soft deletes |

**Relationships:**
- `hasOne` → Employee
- `hasOneThrough` → Department (via Employee)
- `hasMany` → Enrollment, Course (instructor), Task, ProjectMember, Certificate, QuizAttempt, LessonCompletion, LoginHistory, Conversation, Message, ForumThread, ForumPost, CourseRating, Bookmark, AiTutorConversation, VideoProgress, CodingSubmission, Notification, UserFcmToken

---

### Student Model

| Property | Value |
|----------|-------|
| **Flutter Model** | (to create) |
| **Laravel Model** | `Student` |
| **Table** | `students` |
| **Primary Key** | `id` (auto-increment) |
| **File** | `backend/app/Models/Student.php` |

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint | No | - | Primary key |
| `student_id` | string | No | - | Unique identifier |
| `guardian_id` | bigint | Yes | null | FK → guardians |
| `user_id` | uuid | Yes | null | FK → users |
| `first_name` | string | No | - | |
| `last_name` | string | No | - | |
| `gender` | enum | Yes | null | male, female, other |
| `date_of_birth` | date | Yes | null | |
| `photo` | string | Yes | null | Path to file |
| `id_card_photo` | string | Yes | null | Path to file |
| `grade` | string | Yes | null | Indexed |
| `branch` | string | Yes | null | |
| `admission_date` | date | Yes | null | |
| `status` | enum | No | pending | pending, active, suspended, withdrawn, transferred, graduated |
| `qr_code` | string | Yes | null | Unique |
| `graduation_date` | date | Yes | null | |
| `medical_notes` | text | Yes | null | |
| `created_at` | timestamp | No | - | |
| `updated_at` | timestamp | No | - | |
| `deleted_at` | timestamp | Yes | null | Soft deletes |

**Appended attributes:** `full_name`, `age`, `photo_url`

**Relationships:**
- `belongsTo` → Guardian, User
- `hasOne` → MedicalRecord
- `hasMany` → Attendance, StudentDocument, StudentTimelineEntry, ReportCard, CodingProgress, Fee, Appointment, AssignmentSubmission, ExamResult, GradebookEntry
- `belongsToMany` → SchoolClass (via `class_student`)

---

### Guardian Model

| Property | Value |
|----------|-------|
| **Flutter Model** | (to create) |
| **Laravel Model** | `Guardian` |
| **Table** | `guardians` |
| **Primary Key** | `id` (auto-increment) |
| **File** | `backend/app/Models/Guardian.php` |

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint | No | - | Primary key |
| `user_id` | uuid | Yes | null | FK → users |
| `first_name` | string | No | - | |
| `last_name` | string | No | - | |
| `relationship` | enum | No | parent | parent, guardian, relative, other |
| `phone` | string | Yes | null | |
| `email` | string | Yes | null | |
| `address` | string | Yes | null | |
| `occupation` | string | Yes | null | |
| `is_primary` | boolean | No | true | |
| `notes` | text | Yes | null | |
| `created_at` | timestamp | No | - | |
| `updated_at` | timestamp | No | - | |
| `deleted_at` | timestamp | Yes | null | Soft deletes |

**Appended attributes:** `full_name`

**Relationships:**
- `belongsTo` → User
- `hasMany` → Student, Appointment

---

### Course Model

| Property | Value |
|----------|-------|
| **Flutter Model** | (to create) |
| **Laravel Model** | `Course` |
| **Table** | `courses` |
| **Primary Key** | `id` (auto-increment) |
| **File** | `backend/app/Models/Course.php` |

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint | No | - | Primary key |
| `title` | string | No | - | |
| `slug` | string | No | - | Unique, auto-generated |
| `description` | longText | No | - | |
| `objectives` | json | Yes | null | |
| `prerequisites` | json | Yes | null | |
| `category_id` | bigint | No | - | FK → categories |
| `instructor_id` | uuid | No | - | FK → users |
| `level` | enum | No | - | beginner, intermediate, advanced, expert |
| `duration_hours` | decimal(5,1) | No | 0 | |
| `price` | decimal(8,2) | No | 0 | |
| `thumbnail` | string | Yes | null | |
| `status` | enum | No | draft | draft, published, archived |
| `published_at` | timestamp | Yes | null | |
| `max_enrollments` | integer | Yes | null | |
| `is_featured` | boolean | No | false | |
| `meta` | json | Yes | null | |
| `created_at` | timestamp | No | - | |
| `updated_at` | timestamp | No | - | |
| `deleted_at` | timestamp | Yes | null | Soft deletes |

**Relationships:**
- `belongsTo` → Category, User (instructor)
- `hasMany` → Lesson, Enrollment, CourseRating, CourseModule

---

### Lesson Model

| Property | Value |
|----------|-------|
| **Flutter Model** | (to create) |
| **Laravel Model** | `Lesson` |
| **Table** | `lessons` |
| **Primary Key** | `id` (auto-increment) |
| **File** | `backend/app/Models/Lesson.php` |

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint | No | - | Primary key |
| `course_id` | bigint | No | - | FK → courses |
| `module_name` | string | Yes | null | |
| `title` | string | No | - | |
| `slug` | string | No | - | Unique per course |
| `content` | longText | Yes | null | |
| `video_url` | string | Yes | null | |
| `duration_minutes` | integer | No | 0 | |
| `sort_order` | integer | No | 0 | |
| `is_free` | boolean | No | false | |
| `type` | enum | No | text | text, video, quiz, assignment |
| `created_at` | timestamp | No | - | |
| `updated_at` | timestamp | No | - | |
| `deleted_at` | timestamp | Yes | null | Soft deletes |

---

### Enrollment Model

| Property | Value |
|----------|-------|
| **Flutter Model** | (to create) |
| **Laravel Model** | `Enrollment` |
| **Table** | `enrollments` |
| **Primary Key** | `id` (auto-increment) |
| **File** | `backend/app/Models/Enrollment.php` |

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint | No | - | Primary key |
| `user_id` | uuid | No | - | FK → users |
| `course_id` | bigint | No | - | FK → courses |
| `status` | enum | No | active | active, completed, paused, dropped |
| `enrolled_at` | timestamp | No | - | |
| `completed_at` | timestamp | Yes | null | |
| `progress` | decimal(5,2) | No | 0 | 0.00 to 100.00 |

**Unique constraint:** (`user_id`, `course_id`)

**Relationships:**
- `belongsTo` → User, Course
- `hasMany` → LessonCompletion
- `hasOne` → Certificate

---

### Attendance Model

| Property | Value |
|----------|-------|
| **Flutter Model** | (to create) |
| **Laravel Model** | `Attendance` |
| **Table** | `attendances` |
| **Primary Key** | `id` (auto-increment) |
| **File** | `backend/app/Models/Attendance.php` |

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint | No | - | Primary key |
| `student_id` | bigint | No | - | FK → students |
| `attendance_date` | date | No | - | Indexed |
| `status` | enum | No | present | present, absent, late, excused |
| `check_in` | time | Yes | null | |
| `check_out` | time | Yes | null | |
| `note` | string | Yes | null | |
| `recorded_by` | uuid | Yes | null | FK → users |
| `created_at` | timestamp | No | - | |
| `updated_at` | timestamp | No | - | |

**Unique constraint:** (`student_id`, `attendance_date`)

---

### Assignment Model

| Property | Value |
|----------|-------|
| **Flutter Model** | (to create) |
| **Laravel Model** | `Assignment` |
| **Table** | `assignments` |
| **Primary Key** | `id` (auto-increment) |
| **File** | `backend/app/Models/Assignment.php` |

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint | No | - | Primary key |
| `teacher_user_id` | uuid | No | - | FK → users |
| `class_id` | bigint | Yes | null | FK → classes |
| `course_id` | bigint | Yes | null | FK → courses |
| `title` | string | No | - | |
| `description` | text | Yes | null | |
| `instructions` | longText | Yes | null | |
| `type` | enum | No | homework | homework, classwork, project, essay, exercise |
| `max_score` | decimal(8,2) | No | 100 | |
| `due_at` | timestamp | Yes | null | Indexed |
| `published_at` | timestamp | Yes | null | |
| `status` | enum | No | draft | draft, published, closed |
| `attachments` | json | Yes | null | |
| `settings` | json | Yes | null | |
| `created_at` | timestamp | No | - | |
| `updated_at` | timestamp | No | - | |
| `deleted_at` | timestamp | Yes | null | Soft deletes |

---

### Exam Model

| Property | Value |
|----------|-------|
| **Flutter Model** | (to create) |
| **Laravel Model** | `Exam` |
| **Table** | `exams` |
| **Primary Key** | `id` (auto-increment) |
| **File** | `backend/app/Models/Exam.php` |

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint | No | - | Primary key |
| `teacher_user_id` | uuid | No | - | FK → users |
| `class_id` | bigint | Yes | null | FK → classes |
| `title` | string | No | - | |
| `description` | text | Yes | null | |
| `exam_date` | date | Yes | null | |
| `total_marks` | decimal(8,2) | No | 100 | |
| `passing_marks` | decimal(8,2) | Yes | null | |
| `duration_minutes` | integer | Yes | null | |
| `status` | enum | No | draft | draft, scheduled, active, grading, completed |
| `created_at` | timestamp | No | - | |
| `updated_at` | timestamp | No | - | |
| `deleted_at` | timestamp | Yes | null | Soft deletes |

---

### Fee Model

| Property | Value |
|----------|-------|
| **Flutter Model** | (to create) |
| **Laravel Model** | `Fee` |
| **Table** | `fees` |
| **Primary Key** | `id` (auto-increment) |
| **File** | `backend/app/Models/Fee.php` |

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint | No | - | Primary key |
| `student_id` | bigint | No | - | FK → students |
| `label` | string | No | - | |
| `amount` | decimal(8,2) | No | - | |
| `due_date` | date | No | - | |
| `status` | enum | No | - | unpaid, partial, paid |
| `note` | text | Yes | null | |

**Relationships:**
- `belongsTo` → Student
- `hasMany` → Payment

---

### Invoice Model

| Property | Value |
|----------|-------|
| **Flutter Model** | (to create) |
| **Laravel Model** | `Invoice` |
| **Table** | `invoices` |
| **Primary Key** | `id` (auto-increment) |
| **File** | `backend/app/Models/Invoice.php` |

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint | No | - | Primary key |
| `invoice_no` | string | No | - | Unique |
| `student_id` | bigint | No | - | FK → students |
| `fee_structure_id` | bigint | Yes | null | FK → fee_structures |
| `term` | string | Yes | null | |
| `description` | string | Yes | null | |
| `amount` | decimal(8,2) | No | - | |
| `paid_amount` | decimal(8,2) | No | 0 | |
| `status` | enum | No | - | draft, issued, paid, void |
| `due_date` | date | No | - | |
| `issued_at` | timestamp | Yes | null | |
| `created_by_user_id` | uuid | Yes | null | FK → users |
| `created_at` | timestamp | No | - | |
| `updated_at` | timestamp | No | - | |

**Appended attributes:** `balance`, `is_overdue`

**Relationships:**
- `belongsTo` → Student, FeeStructure, User (createdBy)
- `hasMany` → InvoiceItem, Payment

---

### Payment Model

| Property | Value |
|----------|-------|
| **Flutter Model** | (to create) |
| **Laravel Model** | `Payment` |
| **Table** | `payments` |
| **Primary Key** | `id` (auto-increment) |
| **File** | `backend/app/Models/Payment.php` |

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint | No | - | Primary key |
| `fee_id` | bigint | Yes | null | FK → fees |
| `invoice_id` | bigint | Yes | null | FK → invoices |
| `receipt_no` | string | No | - | Unique |
| `amount` | decimal(8,2) | No | - | |
| `method` | string | No | - | cash, mpesa, bank_transfer, etc. |
| `reference` | string | Yes | null | |
| `paid_at` | date | No | - | |
| `paid_by_user_id` | uuid | Yes | null | FK → users |
| `created_at` | timestamp | No | - | |
| `updated_at` | timestamp | No | - | |

**Relationships:**
- `belongsTo` → Fee, Invoice, User (paidBy)
- `hasOne` → MpesaTransaction

---

### Certificate Model

| Property | Value |
|----------|-------|
| **Flutter Model** | (to create) |
| **Laravel Model** | `Certificate` |
| **Table** | `certificates` |
| **Primary Key** | `id` (auto-increment) |
| **File** | `backend/app/Models/Certificate.php` |

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint | No | - | Primary key |
| `user_id` | uuid | No | - | FK → users |
| `course_id` | bigint | No | - | FK → courses |
| `enrollment_id` | bigint | No | - | FK → enrollments |
| `certificate_number` | string | No | - | Unique |
| `issued_at` | timestamp | No | - | |
| `certificate_url` | string | Yes | null | |
| `verification_code` | string | No | - | Unique |

---

### Notification Model

| Property | Value |
|----------|-------|
| **Flutter Model** | (to create) |
| **Laravel Model** | `Notification` |
| **Table** | `notifications` |
| **Primary Key** | `id` (UUID) |
| **File** | `backend/app/Models/Notification.php` |

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | No | - | Primary key |
| `type` | string | No | - | Notification class |
| `category` | string | Yes | null | attendance, fees, assignments, etc. |
| `channel` | string | Yes | null | in_app, email, sms, push |
| `status` | string | Yes | null | |
| `notifiable_type` | string | No | - | Polymorphic |
| `notifiable_id` | uuid | No | - | Polymorphic |
| `data` | json | No | - | Title, message, etc. |
| `link` | string | Yes | null | Deep link |
| `metadata` | json | Yes | null | |
| `read_at` | timestamp | Yes | null | |
| `sent_at` | timestamp | Yes | null | |
| `delivered_at` | timestamp | Yes | null | |
| `failed_at` | timestamp | Yes | null | |
| `error_message` | string | Yes | null | |
| `retry_count` | integer | No | 0 | |
| `last_retried_at` | timestamp | Yes | null | |
| `created_at` | timestamp | No | - | |
| `updated_at` | timestamp | No | - | |

**Relationships:**
- `morphTo` → notifiable (User)
- `hasMany` → NotificationDelivery

---

### AiConversation Model

| Property | Value |
|----------|-------|
| **Flutter Model** | (to create) |
| **Laravel Model** | `AiConversation` |
| **Table** | `ai_conversations` |
| **Primary Key** | `id` (auto-increment) |
| **File** | `backend/app/Models/AiConversation.php` |

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint | No | - | Primary key |
| `user_id` | uuid | No | - | FK → users |
| `assistant_id` | bigint | No | - | FK → ai_assistants |
| `title` | string | No | "New conversation" | |
| `status` | string(20) | No | "active" | |
| `context` | json | Yes | null | |
| `created_at` | timestamp | No | - | |
| `updated_at` | timestamp | No | - | |

**Relationships:**
- `belongsTo` → User, AiAssistant
- `hasMany` → AiMessage

---

### AiMessage Model

| Property | Value |
|----------|-------|
| **Flutter Model** | (to create) |
| **Laravel Model** | `AiMessage` |
| **Table** | `ai_messages` |
| **Primary Key** | `id` (auto-increment) |
| **File** | `backend/app/Models/AiMessage.php` |

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint | No | - | Primary key |
| `conversation_id` | bigint | No | - | FK → ai_conversations |
| `role` | enum | No | user | user, assistant, system |
| `content` | longText | No | - | |
| `prompt_tokens` | unsigned int | No | 0 | |
| `completion_tokens` | unsigned int | No | 0 | |
| `total_tokens` | unsigned int | No | 0 | |
| `cost` | decimal(10,6) | No | 0 | |
| `model` | string | Yes | null | |
| `latency_ms` | unsigned int | Yes | null | |
| `meta` | json | Yes | null | |
| `created_at` | timestamp | No | - | |
| `updated_at` | timestamp | No | - | |

**Relationships:**
- `belongsTo` → AiConversation

---

### Employee Model

| Property | Value |
|----------|-------|
| **Flutter Model** | (to create) |
| **Laravel Model** | `Employee` |
| **Table** | `employees` |
| **Primary Key** | `id` (auto-increment) |
| **File** | `backend/app/Models/Employee.php` |

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint | No | - | Primary key |
| `user_id` | uuid | No | - | FK → users |
| `employee_id` | string | No | - | Unique employee number |
| `department_id` | bigint | Yes | null | FK → departments |
| `position_id` | bigint | Yes | null | FK → positions |
| `date_of_birth` | date | Yes | null | |
| `gender` | enum | Yes | null | |
| `national_id` | string | Yes | null | |
| `address` | string | Yes | null | |
| `emergency_contact` | string | Yes | null | |
| `emergency_phone` | string | Yes | null | |
| `bank_name` | string | Yes | null | |
| `bank_account_number` | string | Yes | null | |
| `id_card_photo` | string | Yes | null | |
| `qr_code` | string | Yes | null | |
| `hire_date` | date | No | - | |
| `employment_type` | string | Yes | null | |
| `salary` | decimal(8,2) | Yes | null | |
| `status` | enum | No | active | active, on_leave, terminated |
| `created_at` | timestamp | No | - | |
| `updated_at` | timestamp | No | - | |
| `deleted_at` | timestamp | Yes | null | Soft deletes |

**Relationships:**
- `belongsTo` → User, Department, Position
- `hasMany` → EmployeeContract, LeaveRequest, StaffAttendance, PerformanceReview, EmployeeDocument, Payslip

---

## 2. Complete Model Reference Table

| Flutter Model | Laravel Model | Table | Key Relationships |
|---------------|---------------|-------|-------------------|
| `UserModel` | `User` | `users` | Employee, Enrollment, Task, Certificate, Course, Notification |
| `StudentModel` | `Student` | `students` | Guardian, User, Attendance, Fee, MedicalRecord, ReportCard |
| `GuardianModel` | `Guardian` | `guardians` | User, Student |
| `CourseModel` | `Course` | `courses` | Category, User(instructor), Lesson, Enrollment |
| `LessonModel` | `Lesson` | `lessons` | Course |
| `EnrollmentModel` | `Enrollment` | `enrollments` | User, Course, LessonCompletion, Certificate |
| `AttendanceModel` | `Attendance` | `attendances` | Student, User(recorder) |
| `AssignmentModel` | `Assignment` | `assignments` | User(teacher), SchoolClass, Course |
| `ExamModel` | `Exam` | `exams` | User(teacher), SchoolClass |
| `FeeModel` | `Fee` | `fees` | Student, Payment |
| `InvoiceModel` | `Invoice` | `invoices` | Student, FeeStructure, InvoiceItem, Payment |
| `PaymentModel` | `Payment` | `payments` | Fee, Invoice, User(paidBy), MpesaTransaction |
| `CertificateModel` | `Certificate` | `certificates` | User, Course, Enrollment |
| `NotificationModel` | `Notification` | `notifications` | User(notifiable), NotificationDelivery |
| `AiConversationModel` | `AiConversation` | `ai_conversations` | User, AiAssistant, AiMessage |
| `AiMessageModel` | `AiMessage` | `ai_messages` | AiConversation |
| `EmployeeModel` | `Employee` | `employees` | User, Department, Position, LeaveRequest, Payslip |
| `TaskModel` | `Task` | `tasks` | User(assignedTo/assignedBy) |
| `ProjectModel` | `Project` | `projects` | User(owner), ProjectMember |
| `QuizModel` | `Quiz` | `quizzes` | Course, QuizQuestion, QuizAttempt |
| `CategoryModel` | `Category` | `categories` | Course |
| `DepartmentModel` | `Department` | `departments` | Employee |
| `PositionModel` | `Position` | `positions` | Department, Employee |
| `BranchModel` | `Branch` | `branches` | - |
| `CompetitionModel` | `Competition` | `competitions` | CompetitionTeam, CompetitionCriterion, CompetitionScore |
| `RoboticsEquipmentModel` | `RoboticsEquipment` | `robotics_equipment` | RoboticsTeam, RoboticsMaintenanceRecord |
| `RoboticsTeamModel` | `RoboticsTeam` | `robotics_teams` | RoboticsTeamStudent, RoboticsProject |
| `LibraryResourceModel` | `LibraryResource` | `library_resources` | LibraryCategory, LibraryAuthor, LibraryBorrowing |
| `LeaveRequestModel` | `LeaveRequest` | `leave_requests` | Employee |
| `PayrollModel` | `Payroll` | `payrolls` | Payslip |
| `MpesaTransactionModel` | `MpesaTransaction` | `mpesa_transactions` | Payment |
| `SiteSettingModel` | `SiteSetting` | `site_settings` | - |
| `AnnouncementModel` | `Announcement` | `announcements` | User(author) |
| `ForumThreadModel` | `ForumThread` | `forum_threads` | User, ForumPost |
| `BookmarkModel` | `Bookmark` | `bookmarks` | User |
| `VideoProgressModel` | `VideoProgress` | `video_progress` | User, Lesson |
| `CodingExerciseModel` | `CodingExercise` | `coding_exercises` | Course |
| `CodingSubmissionModel` | `CodingSubmission` | `coding_submissions` | User, CodingExercise |

---

## 3. Key Table Groups for Flutter Prioritization

### Tier 1: Core (Must Have)
- `users`, `students`, `guardians`, `courses`, `lessons`, `enrollments`, `categories`

### Tier 2: Academic Operations
- `classes`, `class_student`, `attendances`, `assignments`, `assignment_submissions`, `exams`, `exam_results`, `gradebook_entries`, `report_cards`, `report_card_items`

### Tier 3: Finance
- `fees`, `payments`, `invoices`, `invoice_items`, `fee_structures`, `mpesa_transactions`, `expenses`, `budgets`

### Tier 4: Communication
- `notifications`, `notification_deliveries`, `notification_preferences`, `conversations`, `messages`, `announcements`, `user_fcm_tokens`

### Tier 5: LMS & Learning
- `quizzes`, `quiz_questions`, `quiz_attempts`, `certificates`, `bookmarks`, `forum_threads`, `forum_posts`, `course_ratings`, `lesson_completions`, `video_progress`

### Tier 6: AI Platform
- `ai_assistants`, `ai_conversations`, `ai_messages`, `ai_prompt_templates`, `ai_usage_logs`

### Tier 7: HR
- `employees`, `departments`, `positions`, `employee_contracts`, `leave_requests`, `payrolls`, `payslips`, `performance_reviews`, `staff_attendances`, `employee_documents`

### Tier 8: Operations
- `competitions`, `competition_teams`, `competition_scores`, `robotics_equipment`, `robotics_teams`, `robotics_projects`, `library_resources`, `library_borrowings`, `assets`, `inventory_items`

### Tier 9: CMS / Website
- `site_settings`, `site_sections`, `services`, `programs`, `gallery_items`, `testimonials`, `blog_posts`, `faqs`, `contact_messages`
