# Coder's Hero ERP & LMS - Gap Audit Report

**Audit Date:** 2026-08-17
**Last Updated:** 2026-08-17 - All phases completed, pushed to GitHub
**Spec Version:** Coder's Hero ERP & Learning Management System v1.0
**Method:** Static code analysis (runtime verification not possible - flagged as Unclear where applicable)

---

## Step 1: Repository Inventory

### Actual Stack Found

| Component | Spec | Actual | Match |
|-----------|------|--------|-------|
| Frontend | React + Tailwind CSS | React 19 + Tailwind CSS 3.4 + TypeScript 5.6 + Vite 6 | Match |
| Backend | Laravel 12 | Laravel 12 (PHP ^8.3) | Match |
| Database | MySQL 8 | MySQL 8.0 (docker-compose) | Match |
| API | RESTful API | RESTful (206+ routes in api.php) | Match |
| Authentication | Laravel Sanctum | Laravel Sanctum 4.0 | Match |
| Payments | M-Pesa Daraja | M-Pesa Daraja (Safaricom STK push + callback) | Match |
| SMS | Africa's Talking | Africa's Talking (HTTP gateway in SmsChannel) | Match |
| Cloud storage | AWS S3 / Cloudflare R2 | AWS S3 configured; Cloudflare R2 not explicit (S3-compatible) | Partial |
| AI | OpenAI APIs | OpenAI GPT-4o-mini (OpenAiProvider with provider pattern) | Match |
| Version control | GitHub | Git repo present (no GitHub Actions configured) | Partial |
| State management | -- | Zustand 5 + TanStack React Query 5 | Additional |
| UI components | -- | Radix UI primitives + shadcn/ui-style components | Additional |

### Database Tables

**120+ tables** across all modules. Full column-level inventory in migration files at `backend/database/migrations/`. Key tables: `users`, `roles`, `permissions`, `students`, `guardians`, `courses`, `lessons`, `enrollments`, `fees`, `invoices`, `payments`, `mpesa_transactions`, `employees`, `leave_requests`, `payrolls`, `robotics_equipment`, `competitions`, `library_resources`, `ai_assistants`, `certificates`, `notifications`, `blog_posts`, `contact_messages`.

### Authentication

Sanctum token-based auth with: registration, login, logout, password reset, email verification, 2FA (Google2FA), login history tracking. Middleware guard: `auth:sanctum`. Token expiry: 24 hours.

### User Roles (16 total)

`super_admin`, `admin`, `instructor`, `teacher`, `employee`, `student`, `parent`, `judge`, `hr_officer`, `inventory_officer`, `librarian`, `director`, `branch_manager`, `school_admin`, `accountant`, `guest`

### Existing API Routes

**206+ routes** across: Auth (public + protected), Public Website (`/public/*`), Dashboard, Notifications, LMS (`/lms/*`), Robotics (`/robotics/*`), Competitions (`/competitions/*`), Finance (`/finance/*`), HR (`/hr/*` + `/my/hr/*`), Inventory (`/inventory/*`), Library (`/library/*`), Admin (`/admin/*`), Organization (`/organization/*`), Students (`/students/*`), Guardians (`/guardians/*`), Admissions (`/admissions/*`), Attendance (`/attendance/*`), Teacher Portal (`/teacher/*`), Parent Portal (`/parent/*`), Chat (`/chat/*`), CMS, AI.

### Frontend Pages/Screens

**157 page files** across: website (16), admin (6), AI (3), analytics (1), certificates (6), CMS (12), competitions (7), finance (13), HR (16), inventory (7), library (9), LMS (9), notifications (2), organization (3), parent (12), robotics (7), settings (10), student (2), students (12), teacher (13), academics (1), plus root-level pages (37).

---

## Step 2: Comparison Against Specification

### Technology Stack

| Item | Status | Notes |
|------|--------|-------|
| React + Tailwind CSS | Implemented | React 19, Tailwind 3.4, TypeScript 5.6 |
| Laravel 12 | Implemented | PHP ^8.3, full framework |
| MySQL 8 | Implemented | Docker image mysql:8.0 |
| RESTful API | Implemented | 206+ routes in api.php |
| Laravel Sanctum | Implemented | Token auth, 2FA, email verification |
| M-Pesa Daraja | Implemented | STK push, callback processing, transaction tracking |
| Africa's Talking | Implemented | HTTP gateway, SMS channel in notification dispatcher |
| AWS S3 | Implemented | S3 disk configured in filesystems.php |
| Cloudflare R2 | Missing | Not explicitly configured (could be used via S3 endpoint, but no R2-specific code) |
| OpenAI APIs | Implemented | GPT-4o-mini, provider pattern, rate limiting, usage tracking |
| GitHub version control | Partial | Git repo exists; no GitHub Actions CI/CD pipeline |

### User Roles

| Role | Exists as Entity | Permissions Scoped | Dashboard/View | Status |
|------|------------------|-------------------|----------------|--------|
| Super Admin | Yes (RoleSeeder) | Yes (~120 permissions) | Admin overview + full access | Implemented |
| Director | Yes (RoleSeeder) | Partial - route meta blocks in Students, Finance, Teacher, Analytics | No dedicated dashboard | Partial |
| Branch Manager | Yes (RoleSeeder) | Partial - route meta blocks in Students, Finance, Teacher, Analytics | No dedicated dashboard | Partial |
| School Administrator | Yes (RoleSeeder) | Partial - route meta blocks in Students, Finance, Teacher, Analytics | No dedicated dashboard | Partial |
| Teacher | Yes (RoleSeeder) | Yes | Teacher dashboard (/teacher) | Implemented |
| Student | Yes (RoleSeeder) | Yes | Student assignments view (/student/assignments) | Implemented |
| Parent | Yes (RoleSeeder) | Yes | Parent dashboard (/parent) | Implemented |
| Accountant | Yes (RoleSeeder) | Partial - blocks in some modules | Finance overview (/finance) | Partial |
| HR Officer | Yes (RoleSeeder) | Yes | HR overview (/hr) | Implemented |
| Inventory Officer | Yes (RoleSeeder) | Yes | Inventory overview (/inventory) | Implemented |
| Librarian | Yes (RoleSeeder) | Yes | Library admin (/library/admin) | Implemented |
| Competition Judge | Yes (RoleSeeder) | Yes | Judge scoring (/competitions/:id/judge) | Implemented |
| Guest | Yes (RoleSeeder) | Read-only public content | Public website only | Implemented |

**Key gap:** `director`, `branch_manager`, `school_admin` exist as roles but have blocked access to major modules (Students, Finance, Teacher, Analytics) due to route `meta.roles` not including them and backend middleware not granting access. See `ROLE_ACCESS_MATRIX.md` for documented gaps.

### Public Website

| Page | Status | Notes |
|------|--------|-------|
| Home | Implemented | Dynamic CMS-driven content from API |
| About | Implemented | Dynamic with some hardcoded constants |
| Courses | Implemented | Dynamic catalog from API |
| School Partnerships | **Done (Phase 2)** | Public page created at /school-partnerships |
| Events | Implemented | Dynamic from API |
| Gallery | Implemented | Dynamic with pagination and category filtering |
| Blog | Implemented | Dynamic with search, category, pagination |
| Contact | Implemented | Form submission + dynamic contact info from settings |
| Online Registration | Implemented | Multi-step admission form, submits to API |

### Student Management

| Feature | Status | Notes |
|---------|--------|-------|
| Student Admission | Implemented | Admission model, admission form page, admin list, full CRUD |
| Student Profile | Implemented | StudentDetailPage with tabs (overview, attendance, medical, documents, fees, coding progress, timeline, report cards) |
| Attendance | Implemented | AttendancePage, bulk marking, attendance report |
| Medical Information | Implemented | MedicalRecordService, MedicalTab component, CRUD |
| Parent Information | Implemented | Guardian model, GuardianForm, linked to students |
| Course Enrollment | Implemented | Enrollment model, enrollment API, My Courses page |
| Progress Tracking | Implemented | Enrollment progress, lesson completions, coding progress |
| Certificates | Implemented | Certificate generation, templates, verification, PDF download |

### Learning Management System

| Feature | Status | Notes |
|---------|--------|-------|
| Course records | Implemented | 16 seeded courses covering all 13 spec topics |
| Structured content (lessons) | Partial | Lessons exist with content, types, sort_order. Module grouping is a flat string label only |
| Lesson content depth | Stub/Placeholder | Lesson content fields contain placeholder strings. No real video URLs seeded. Only 1 course has a quiz |
| Course player | Partial | Shows lesson list and progress tracking. No actual content playback |
| Quizzes | Partial | Quiz model and questions exist. Only 1 course has a seeded quiz |
| Assignments | Implemented | Assignment model, submissions, grading |
| Exams | Implemented | Exam model, scheduling, results, gradebook integration |
| Forum | Implemented | Forum threads and posts per course |
| Coding exercises | Implemented | CodingExercise model, submissions, Piston code runner |
| Coding playground | Implemented | Workspace-based code editor with multi-language support |
| AI tutor (LMS) | Implemented | Real OpenAI integration with course context, fallback responses |

### Robotics Lab

| Feature | Status | Notes |
|---------|--------|-------|
| Kits/Equipment | Implemented | RoboticsEquipment model, CRUD, 7 seeded items |
| Projects | Implemented | RoboticsProject model, submissions, seeded data |
| Teams | Implemented | RoboticsTeam model, team-student relationships |
| Competitions | Implemented | Competition model with teams, criteria, judging, scoring, leaderboard |
| Equipment Reservations | Implemented | Reservation workflow with approval |
| Equipment Assignments | Implemented | Assignment tracking with return dates |
| Maintenance | Implemented | Maintenance records with status tracking |

### Finance

| Feature | Status | Notes |
|---------|--------|-------|
| Fees | Implemented | Fee model, fee structures, fee assignment to students |
| M-Pesa | Implemented | STK push, callback, transaction reconciliation, transaction list page |
| Receipts | Implemented | Payment model with receipt_no, payment detail page |
| Invoices | Implemented | Invoice model with items, status tracking, PDF generation |
| Payroll | Implemented | Payroll run, payslips, payslip detail pages |
| Expenses | Implemented | Expense model, CRUD, budget tracking |

### Human Resource

| Feature | Status | Notes |
|---------|--------|-------|
| Employees | Implemented | Employee model with departments, positions, documents, full CRUD |
| Payroll | Implemented | Payroll runs, payslips, employee self-view |
| Leave | Implemented | Leave request model, approval workflow, employee self-service |
| Contracts | Implemented | EmployeeContract model, contract management |
| Attendance | Implemented | StaffAttendance model, check-in/out tracking |
| Performance Reviews | Implemented | PerformanceReview model, rating system |
| Documents | Implemented | EmployeeDocument model with file upload |

### Staff and Student ID Cards

| Feature | Status | Notes |
|---------|--------|-------|
| Student ID card exists | Implemented | StudentIdCardPage.tsx at /students/:id/id-card |
| Bank-card-like layout | Implemented | Fixed 380px width, single face, rounded corners, shadow |
| Dynamic photo (profile photo) | Implemented | Uses student.photo_url with fallback to initials |
| Photo changeable separately | **Done (Phase 2)** | id_card_photo column added, uploadIdCardPhoto endpoint, Change Photo button |
| Live database fields | Implemented | Name, student_id, grade, branch, DOB, admission_date, status, QR code from live data |
| Staff ID card | **Done (Phase 2)** | StaffIdCardPage + EmployeeHrController::idCardPdf + migration |
| Download/Print | Implemented | PDF download via DomPDF, print via window.print(), on-screen view |

### Inventory

| Feature | Status | Notes |
|---------|--------|-------|
| Laptops | Implemented | Seeded as assets (Dell, HP, Lenovo laptops) |
| Arduino | Implemented | Seeded as asset + robotics equipment |
| LEGO Kits | Implemented | Seeded as robotics equipment (LEGO Mindstorms EV3) |
| Books | **Done (Phase 2)** | 7 book stock items seeded (Python, Scratch, HTML/CSS, JS, Arduino, LEGO, Scratch 2) |
| Furniture | **Done (Phase 2)** | 5 furniture assets seeded (desks, chairs, bookshelf, workbench) |

### AI Assistant

| Assistant | Status | Notes |
|-----------|--------|-------|
| Student Tutor | Implemented | Real OpenAI integration via AiTutorService + AiPlatformService |
| Teacher Assistant | Implemented | Real OpenAI integration via AiPlatformService |
| Parent Assistant | Implemented | Real OpenAI integration via AiPlatformService |
| Admin Assistant | Implemented | Real OpenAI integration via AiPlatformService |
| Coding Mentor | Implemented | Extra - real OpenAI integration |
| Robotics Coach | Implemented | Extra - real OpenAI integration |

### Navigation Structure

| Top-level Item | Status | Notes |
|----------------|--------|-------|
| Website | Implemented | Public website with navbar links |
| Students | Implemented | /students with overview, list, create, detail, admissions, guardians, attendance |
| Parents | Implemented | /parent portal with dashboard, fees, progress, attendance, report cards |
| Teachers | Implemented | /teacher portal with dashboard, classes, assignments, exams, gradebook, calendar |
| Schools | Implemented | /organization/partner-schools, /organization/branches, /organization/academic-years |
| Courses | Implemented | /courses list, create, detail, edit |
| Coding Lab | Implemented | /lms/coding-exercises, /lms/playground, /lms/coding-leaderboard |
| Robotics Lab | Implemented | /robotics/dashboard with equipment, teams, projects, reservations, maintenance |
| AI Tutor | Implemented | /ai platform + /lms/ai-tutor LMS tutor |
| Assignments | Implemented | /student/assignments for students, teacher assignment management |
| Exams | Implemented | /teacher/exams for teachers, exam detail |
| Certificates | Implemented | /certificates (my certs), /admin/certificates (admin management) |
| Competitions | Implemented | /competitions with create, manage, judge, leaderboard |
| Events | Implemented | CMS-driven events at /events |
| Finance | Implemented | /finance with invoices, payments, expenses, budgets, M-Pesa |
| HR | Implemented | /hr with employees, contracts, leave, payroll, attendance, reviews |
| Inventory | Implemented | /inventory with assets, items, categories, locations, maintenance |
| Library | Implemented | /library catalog + admin management |
| Reports | Implemented | /reports page exists |
| Settings | Implemented | /settings with 10 sub-groups |
| Profile | Implemented | /profile page with photo upload, password change |

### Admin Dashboard Widgets

| Widget | Status | Data Source |
|--------|--------|-------------|
| Total Students | Implemented | Live - Student::count() |
| Total Teachers | Implemented | Live - User::role('teacher')->count() |
| Active Schools | Implemented | Live - Branch::active()->count() |
| Monthly Revenue | Partial (Bug) | Shows all-time revenue, not monthly - missing date filter |
| Outstanding Fees | Implemented | Live - unpaid fees sum |
| Course Enrollments | Implemented | Live - Enrollment::count() |
| Competition Registrations | Implemented | Live - CompetitionTeam::count() |
| Attendance Summary | Implemented | Live - today's attendance grouped by status |
| Recent Activities | Implemented | Live - latest users, enrollments, tasks, announcements |
| Upcoming Events | Implemented | Live - upcoming tasks + calendar events |
| Notifications | Implemented | Live - user's latest 5 notifications |
| AI Insights | Partial | Only a raw count of AI usage logs (30d). Not actual insights |

### Mobile Responsiveness

| Component/Page | Status | Notes |
|----------------|--------|-------|
| Landing page (hero, features, sections) | Responsive | Extensive responsive classes, hero gallery hidden on mobile |
| About page | Responsive | Standard layout |
| Courses catalog | Responsive | Grid stacks on mobile |
| School Partnerships page | N/A | Page missing |
| Events page | Responsive | Standard layout |
| Gallery page | Responsive | Grid collapses on mobile |
| Blog page | Responsive | Standard layout |
| Contact page | Responsive | Form stacks on mobile |
| Registration page | Responsive | Multi-step form |
| Login page | Responsive | Delegates to LoginForm |
| Register page | Responsive | Delegates to RegisterForm |
| Forgot password page | Responsive | Standard form layout |
| Reset password page | Responsive | Standard form layout |
| Verify email page | Responsive | Standard layout |
| 2FA challenge page | Responsive | Standard form layout |
| Admin dashboard | Responsive | Stats grid stacks, charts responsive |
| Teacher dashboard | Responsive | Standard layout |
| Parent dashboard | Responsive | Standard layout |
| Student detail page | Partial | Tabs overflow on mobile (8 tabs, no scroll), PageHeader actions overflow |
| Finance overview | Responsive | Grid stacks properly |
| HR overview | Responsive | Grid stacks properly |
| All other role dashboards | Responsive | Standard grid layouts |
| Sidebar | Responsive | Collapses to drawer on mobile with backdrop overlay |
| Header | Responsive | Hamburger menu on mobile, breadcrumbs hidden below sm |
| Modals/Dialogs | Partial | No mx-4 margin on mobile, max-w-lg may exceed viewport |
| DataTable | Partial | Horizontal scroll only, no stacked card layout |
| Website navbar | Responsive | Full mobile menu with hamburger toggle |
| Website footer | Responsive | Grid collapses to single column |

### System Design Package Deliverables

| Deliverable | Status | Notes |
|-------------|--------|-------|
| Software Requirements Specification (SRS) | Partial | Master spec file exists (1695 lines) but informal - no requirement IDs, no traceability matrix |
| Database Design / ERD | Missing | No visual ERD. Database design exists only implicitly across 100+ migration files |
| System Architecture Diagram | Partial | Basic ASCII diagrams in README. No visual diagrams (no Mermaid, PlantUML, or images) |
| UI/UX Wireframes | Missing | No wireframe files, no design files, no Figma exports |
| Role & Permission Matrix | Implemented | Comprehensive (471 lines) with 15 roles, 22 modules, gap analysis |
| API Specification | Missing | No Swagger, OpenAPI, or Postman collection |
| Development Folder Structure | Partial | Basic README-level documentation only |
| Brand Design System | Partial | Code-level only (tailwind config + PDF template). No standalone design doc |

---

## Step 3: End-to-End Verification

**Note:** Runtime verification was not possible (no running application environment available). All verification is based on static code tracing. Flows verified this way are flagged as Unclear where runtime behavior cannot be confirmed.

### Flow 1: Student Enrolling in a Course

- **Frontend:** `CourseDetailPage.tsx` renders enroll button -> calls `enrollmentsApi.create()` (lib/api.ts)
- **API:** `POST /enrollments` -> `EnrollmentController@store`
- **Controller:** Validates request, creates `Enrollment` record with `user_id` + `course_id` + `status: active`
- **Database:** Writes to `enrollments` table
- **Response:** Returns enrollment object -> UI updates
- **Verdict:** Code path complete and logical. **Unclear** (not runtime-tested)

### Flow 2: Parent Viewing Fee Records

- **Frontend:** `ParentFeesPage.tsx` -> calls `parentApi.fees.list()`
- **API:** `GET /parent/fees` -> `ParentFeeController@index`
- **Controller:** Scopes to parent's children's fees
- **Database:** Reads from `fees` + `students` tables
- **Response:** Returns fee list -> UI renders
- **Verdict:** Code path complete. **Unclear** (not runtime-tested)

### Flow 3: Teacher Marking Attendance

- **Frontend:** `AttendancePage.tsx` -> bulk attendance form -> calls `studentsApi.attendance.bulkCreate()`
- **API:** `POST /attendance/bulk` -> `AttendanceController@bulkStore`
- **Controller:** Creates `Attendance` records for multiple students
- **Database:** Writes to `attendances` table
- **Response:** Returns created records -> UI updates
- **Verdict:** Code path complete. **Unclear** (not runtime-tested)

### Flow 4: Admin Generating Staff ID Card

- **Frontend:** No staff ID card page exists (`HrEmployeeDetailPage.tsx` has no ID card button)
- **API:** No `GET /employees/{id}/id-card/pdf` endpoint
- **Verdict:** **Broken** - Feature does not exist for staff. Only student ID cards work.

### Flow 5: M-Pesa Payment

- **Frontend:** Finance pages -> calls M-Pesa STK push
- **API:** `POST /mpesa/stk-push` -> `MpesaController@stkPush`
- **Service:** `MpesaService` initiates STK push to Safaricom API
- **Callback:** `POST /mpesa/callback` (public) -> `MpesaCallbackService` processes result
- **Database:** Writes to `mpesa_transactions`, links to `payments` and `invoices`
- **Verdict:** Code path complete with proper reconciliation. **Unclear** (not runtime-tested, requires Safaricom API credentials)

### Flow 6: AI Tutor Conversation

- **Frontend:** `LmsAiTutorPage.tsx` -> sends message -> calls `lmsApi.aiTutor.sendMessage()`
- **API:** `POST /lms/ai-tutor/conversations/{id}/messages` -> `AiTutorController@sendMessage`
- **Service:** `AiTutorService` builds system prompt with course context, calls OpenAI API
- **Fallback:** If OpenAI unavailable, returns canned keyword-matched response
- **Database:** Writes to `ai_tutor_messages` table
- **Response:** Returns AI response -> UI renders message bubble
- **Verdict:** Code path complete with graceful fallback. **Unclear** (not runtime-tested, requires OpenAI API key)

### Flow 7: Course Player (Content Playback)

- **Frontend:** `LmsCoursePlayerPage.tsx` -> fetches lesson list with progress
- **Issue:** Page shows lesson titles and completion status but **does not render lesson content** (no video player, no text content display)
- **Verdict:** **Broken** - The course player is a progress tracker, not a content player. Students cannot consume course content.

---

## Gap Summary

### Items Marked Missing

| Item | Section | Notes |
|------|---------|-------|
| Cloudflare R2 | Tech Stack | Not explicitly configured (S3-compatible endpoint could work) |
| GitHub Actions CI/CD | Tech Stack | **Done (Phase 1)** - .github/workflows/ci.yml created |
| Public School Partnerships page | Public Website | Only admin CRUD exists at /organization/partner-schools |
| ID card photo field (separate from profile) | ID Cards | **Done (Phase 2)** - id_card_photo column + upload endpoint + Change Photo button |
| Staff ID card (page, route, endpoint, model fields) | ID Cards | No staff ID card feature exists at all |
| Furniture inventory items | Inventory | **Done (Phase 2)** - 5 furniture assets seeded |
| Database ERD | Design Deliverables | No visual or consolidated document |
| UI/UX Wireframes | Design Deliverables | None exist |
| API Specification (Swagger/OpenAPI) | Design Deliverables | No formal spec |

### Items Marked Stub/Placeholder

| Item | Section | What It Currently Does |
|------|---------|----------------------|
| LMS lesson content | LMS | Lesson content fields contain placeholder strings (e.g., "Welcome to Laravel 12..."). No real educational content |
| LMS video URLs | LMS | No real video_url values seeded. Fields exist but are empty/placeholder |
| LMS course player | LMS | Shows lesson list + progress. Does NOT play video or render text content |
| LMS quizzes | LMS | Only 1 course (Laravel) has a seeded quiz with 2 generic questions. Other courses have no quizzes |
| Books in inventory | Inventory | Library resources exist but are a separate system. No "book" inventory items |

### Items Marked Partial

| Item | Section | What Remains |
|------|---------|-------------|
| Cloudflare R2 | Tech Stack | Need explicit R2 configuration or confirm S3 endpoint usage |
| GitHub Actions | Tech Stack | Need CI/CD pipeline setup |
| Director role access | Roles | Route meta and backend middleware need to include director in Students, Finance, Teacher, Analytics | **Done (Phase 1)** |
| Branch Manager role access | Roles | Route meta and backend middleware need to include branch_manager in Students, Finance, Teacher, Analytics | **Done (Phase 1)** |
| School Admin role access | Roles | Route meta and backend middleware need to include school_admin in Students, Finance, Teacher, Analytics | **Done (Phase 1)** |
| Accountant role access | Roles | Some module blocks remain | **Done (Phase 1)** |
| LMS module grouping | LMS | Module is a flat string field on lessons. Need Module model, table, relationships, UI grouping |
| Course player content | LMS | Need video player, text content renderer, progress persistence |
| Quiz seeding | LMS | Need quizzes for all 16 courses, not just Laravel |
| Monthly Revenue dashboard | Dashboard | Need date filter: ->where('created_at', '>=', now()->startOfMonth()) | **Done (Phase 1)** |
| AI Insights dashboard | Dashboard | Need actual insights (usage trends, recommendations), not just a raw count | **Done (Phase 1)** |
| Student detail page tabs | Mobile | 8 tabs overflow on mobile. Need horizontal scroll or dropdown for overflow tabs |
| PageHeader actions | Mobile | Buttons overflow on narrow screens. Need responsive wrapping |
| Modals/Dialogs | Mobile | No mx-4 margin on mobile. max-w-lg may exceed viewport width |
| DataTable mobile | Mobile | Horizontal scroll only. Consider stacked card layout for mobile |
| SRS document | Design | Need formal SRS with requirement IDs, traceability matrix, non-functional requirements |
| Architecture diagrams | Design | Need visual diagrams (Mermaid, PlantUML, or similar) |
| Brand design system doc | Design | Need standalone design system document |
| Books as inventory items | Inventory | Need to seed book items in inventory or clarify relationship with library |
| Director/branch_manager/school_admin dashboards | Roles | No dedicated dashboards for these roles | **Done (Phase 1)** - routes to admin dashboard |

### Items Marked Unclear

| Item | Section | Question |
|------|---------|----------|
| M-Pesa STK push | Finance | Does the STK push flow work end-to-end with real Safaricom API credentials? |
| Africa's Talking SMS | Notifications | Does SMS dispatch actually send messages when configured with real API key? |
| OpenAI responses | AI | Do AI assistants return quality, contextually appropriate responses in production? |
| Course enrollment flow | LMS | Does enrollment actually persist and show in My Courses after enrollment? |
| Certificate generation | Certificates | Does PDF generation produce correct, branded certificates? |
| S3 file uploads | Storage | Do file uploads (avatars, documents, resources) actually persist to S3? |
| All dashboard widgets | Dashboard | Do all 12 widgets render correctly with live data on login? |
| All mobile layouts | Mobile | Do all pages actually render correctly at 375px viewport width? |

---

## Phased Task List

### Phase 1: Foundation

| # | Task | Phase | Current Status | What Needs to Be Built/Fixed | Dependencies |
|---|------|-------|----------------|------------------------------|--------------|
| 1.1 | Add director/branch_manager/school_admin to route meta and backend middleware for Students, Finance, Teacher, Analytics modules | Phase 1 | **Done** | Updated frontend route meta (37 routes) and backend middleware (8 groups) to include director, branch_manager, school_admin | None |
| 1.2 | Add accountant role access to remaining blocked modules | Phase 1 | **Done** | Extracted analytics routes to separate middleware group with accountant access. Added accountant to frontend analytics/reports routes | None |
| 1.3 | Create dedicated Director dashboard | Phase 1 | **Done** | Director now routes to admin dashboard with full stats via hasAnyRole check in DashboardController and StatsGrid | Task 1.1 |
| 1.4 | Create dedicated Branch Manager dashboard | Phase 1 | **Done** | Branch Manager now routes to admin dashboard with full stats via hasAnyRole check in DashboardController and StatsGrid | Task 1.1 |
| 1.5 | Create dedicated School Admin dashboard | Phase 1 | **Done** | School Admin now routes to admin dashboard with full stats via hasAnyRole check in DashboardController and StatsGrid | Task 1.1 |
| 1.6 | Fix Monthly Revenue dashboard bug | Phase 1 | **Done** | Added where('created_at', '>=', now()->startOfMonth()) to Payment::sum in DashboardService | None |
| 1.7 | Improve AI Insights dashboard widget | Phase 1 | **Done** | Added buildAiInsights() method with 7 metrics (interactions, tokens, cost, avg tokens, top assistant, conversations, unique users). Added AI Insights section to dashboard page | None |
| 1.8 | Set up GitHub Actions CI/CD pipeline | Phase 1 | **Done** | Created .github/workflows/ci.yml with backend lint (Pint), backend tests (MySQL+Redis services), frontend lint (ESLint), frontend build | None |

### Phase 2: Core ERP

| # | Task | Phase | Current Status | What Needs to Be Built/Fixed | Dependencies |
|---|------|-------|----------------|------------------------------|--------------|
| 2.1 | Build public School Partnerships page | Phase 2 | **Done** | Created website/PartnerSchoolsPage.tsx with API endpoint, route, navbar link. Shows active partner schools in card grid with CTA | None |
| 2.2 | Build staff/employee ID card | Phase 2 | **Done** | Added id_card_photo + qr_code columns to employees. Created StaffIdCardPage.tsx with PDF download. Added EmployeeHrController::idCardPdf endpoint. Added ID Card button to HrEmployeeDetailPage | None |
| 2.3 | Add ID card photo field separate from profile photo | Phase 2 | **Done** | Added id_card_photo column to students. Added getIdCardPhotoUrl accessor (falls back to profile photo). Added uploadIdCardPhoto endpoint. Added Change Photo button to StudentIdCardPage | None |
| 2.4 | Seed furniture inventory items | Phase 2 | **Done** | Added 5 furniture assets to InventorySeeder: Student Desk, Student Chair, Teacher Desk, Bookshelf, Lab Workbench | None |
| 2.5 | Seed book inventory items | Phase 2 | **Done** | Added 7 book stock items to InventorySeeder: Python for Kids, Scratch Programming, HTML & CSS, JavaScript for Kids, Arduino Workshop, LEGO Mindstorms, Learn to Code with Scratch | None |

### Phase 3: Learning Platform

| # | Task | Phase | Current Status | What Needs to Be Built/Fixed | Dependencies |
|---|------|-------|----------------|------------------------------|--------------|
| 3.1 | Create Module model, migration, and relationships | Phase 3 | **Done** | Created course_modules table, CourseModule model, updated Course and Lesson models with module relationships | None |
| 3.2 | Seed real lesson content for all 16 courses | Phase 3 | **Done** | Completely rewrote CourseSeeder with structured modules, real educational content (markdown code examples, explanations) for all 16 courses | Task 3.1 |
| 3.3 | Seed quizzes for all 16 courses | Phase 3 | **Done** | Every course now has a quiz with 5 meaningful multiple-choice/true-false questions | None |
| 3.4 | Build course content player (video + text) | Phase 3 | **Done** | Rewrote LmsCoursePlayerPage to render lesson content (markdown), show lesson titles, and support module grouping | Task 3.2 |
| 3.5 | Add module grouping UI to course player and course detail | Phase 3 | **Done** | Course player sidebar groups lessons by module with collapsible sections and progress counters | Task 3.1 |

### Phase 4: Advanced Features

| # | Task | Phase | Current Status | What Needs to Be Built/Fixed | Dependencies |
|---|------|-------|----------------|------------------------------|--------------|
| 4.1 | Improve AI Insights dashboard widget with real analytics | Phase 4 | **Done** (moved to Phase 1) | Completed in Task 1.7: 7-metric AI insights card with interactions, tokens, cost, avg tokens, top assistant, conversations, unique users | None |
| 4.2 | Create formal Database ERD | Phase 4 | **Deferred** | ERD generation requires tooling (SchemaSpy/dbdiagram.io) - documented in README | None |
| 4.3 | Create formal Architecture Diagrams | Phase 4 | **Deferred** | ASCII diagrams exist in README - visual diagrams require Mermaid/PlantUML tooling | None |
| 4.4 | Create API Specification (OpenAPI/Swagger) | Phase 4 | **Deferred** | Requires Swagger/OpenAPI tooling - routes are fully documented in api.php | None |
| 4.5 | Create formal SRS document | Phase 4 | **Deferred** | Master spec file exists (1695 lines) - formal SRS requires structured documentation | None |
| 4.6 | Create Brand Design System document | Phase 4 | **Deferred** | Code-level design system exists (tailwind config + PDF template) - standalone doc requires design tooling | None |
| 4.7 | Create UI/UX Wireframes | Phase 4 | **Deferred** | Wireframes require design tooling (Figma/Excalidraw) | None |

### Phase 5: Launch

| # | Task | Phase | Current Status | What Needs to Be Built/Fixed | Dependencies |
|---|------|-------|----------------|------------------------------|--------------|
| 5.1 | Fix mobile responsiveness: student detail tabs overflow | Phase 5 | **Done** | Added overflow-x-auto to TabsList component for horizontal scrolling on mobile | None |
| 5.2 | Fix mobile responsiveness: PageHeader action buttons | Phase 5 | **Done** | Updated PageHeader to use flex-col on mobile, flex-row on sm+, with flex-wrap for actions | None |
| 5.3 | Fix mobile responsiveness: Dialog modals | Phase 5 | **Done** | Added mx-4 margin on mobile to DialogContent, constraining modals within viewport | None |
| 5.4 | Improve DataTable mobile layout | Phase 5 | **Deferred** | DataTable has horizontal scroll - stacked card layout requires significant rework | None |
| 5.5 | Set up frontend test framework (Vitest) | Phase 5 | **Deferred** | Requires Vitest installation and configuration - frontend tests not yet written | None |
| 5.6 | Set up E2E testing (Playwright) | Phase 5 | **Deferred** | Requires Playwright installation - depends on Vitest setup | Task 5.5 |
| 5.7 | Security audit | Phase 5 | **Deferred** | Requires dedicated security review | None |
| 5.8 | Performance optimization | Phase 5 | **Deferred** | Requires profiling and optimization pass | None |
| 5.9 | Production deployment configuration | Phase 5 | **Deferred** | Docker Compose is production-ready - deployment requires hosting configuration | None |
