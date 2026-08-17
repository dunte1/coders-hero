# CH-ERP LMS v1.0 — Codebase Audit Report (Gap Analysis)

> **Date:** 2026-08-17
> **Scope:** Audit of the repository against the Coder's Hero ERP & Learning Management System (CH-ERP LMS) v1.0 specification (`CODER'S HERO ERP & LEARNING MANAGEMENT SYSTEM.md`).
> **Method:** Every status below was confirmed by opening the relevant file (routes, controllers, services, seeders, frontend pages/components). No item was marked implemented from a route or file name alone.
> **Constraint:** Audit only — no code was modified.

---

## Step 1 — Repository Inventory

| Component | Found | Evidence |
|---|---|---|
| Frontend framework | **React 19.0 + TypeScript 5.6 + Tailwind CSS 3.4 + Vite 6** | `frontend/package.json` (`react ^19.0.0`, `tailwindcss ^3.4.16`, `vite ^6.0.0`) |
| Backend framework | **Laravel 12, PHP ^8.3** | `backend/composer.json` (`laravel/framework ^12.0`); Dockerfile/README use PHP 8.3 (spec asks for 8.4+) |
| Database | **MySQL 8** (docker `mysql:8.0`; config default `mysql`), SQLite used for dev/tests | `docker-compose.yml`, `backend/config/database.php`, `backend/database/database.sqlite`, `phpunit.xml` |
| Schema | ~160 migrations, ~120 tables (see per-section coverage below) | `backend/database/migrations/` |
| Authentication | **Laravel Sanctum** (token-based, `auth:sanctum`) + 2FA (google2fa) + email verification + password reset | `composer.json`, `routes/api.php`, `TwoFactorController` |
| Payments | **M-Pesa Daraja — implemented** (STK push, OAuth token, callback, reconciliation, idempotency, tests) | `app/Services/Finance/MpesaService.php`, `MpesaCallbackService.php`, `config/mpesa.php`, `tests/Feature/FinanceTest.php` |
| SMS | **Africa's Talking — implemented** (channel + gateway + delivery tracking) | `app/Services/Notifications/AfricaTalkingGateway.php`, `config/notifications.php`, `tests/Feature/NotificationTest.php` |
| Cloud storage | **S3 driver configured, not active** — `league/flysystem-aws-s3-v3` installed, `s3` disk in `config/filesystems.php`, but default disk is `local` and AWS env vars are empty in `.env.example`; R2 not explicitly configured (only reachable via S3-compatible `AWS_ENDPOINT`) | `config/filesystems.php`, `.env.example` |
| AI | **OpenAI — implemented** (provider abstraction `AiProvider`/`OpenAiProvider`, AI tutor, coding hints/debug, website chat; fallbacks when key absent; usage/cost tracking; rate limiting) | `app/Services/AI/`, `config/ai.php`, `config/services.php`, `AiTutorService.php`, `CodingAiService.php`, `ChatService.php` |
| Version control | Git repo on branch `main`; **no `.github/` CI pipeline** | `git status`; glob `.github/**` → 0 results |
| Roles & permissions | **Spatie Laravel Permission**; 15 roles seeded; granular permission groups | `RoleSeeder.php`, `PermissionSeeder.php`, `role:` middleware |
| API routes | ~200+ endpoints under `/api` across auth, public, admin, parent, teacher, student, lms, robotics, competitions, finance, hr, inventory, library, notifications, cms, analytics | `backend/routes/api.php` (1,093 lines) |
| Frontend routes | ~206 registered routes (public website + SPA + role-guarded) | `frontend/src/router/routes.ts` |
| Mobile app | **None — no Flutter codebase anywhere** | glob `**/pubspec.yaml` → 0 results; no `mobile/` dir |
| Tests | 24 backend feature test files (auth, RBAC, 2FA, SIS, parent, teacher/LMS, coding playground, robotics, competitions, finance, HR, inventory, library, certificates, analytics, AI, notifications, CMS, public website, sitemap) | `backend/tests/Feature/` |
| Working tree | ~40 modified files, uncommitted — in-progress work adding branded PDF documents (invoices, payslips, receipts, ID cards, exports) and email branding | `git status` |

---

## Step 2 — Comparison against the specification

### A. Technology stack

| Component | Spec | Found | Status | Notes |
|---|---|---|---|---|
| Frontend | React + Tailwind CSS | React 19 + Tailwind 3.4 | **Implemented** | Matches spec; TS + Vite on top |
| Backend | Laravel 12 | Laravel ^12.0, PHP ^8.3 | **Implemented** | PHP 8.3 vs spec 8.4+ — minor mismatch (`composer.json` requires `^8.3`) |
| Database | MySQL 8 | MySQL 8 (`mysql:8.0`) | **Implemented** | Dev/tests also run SQLite |
| API | RESTful API | RESTful under `/api` | **Implemented** | Consistent `ApiResponse` trait, resources, form requests |
| Mobile app | Flutter | — | **Missing** | No Flutter code, no mobile directory at all |
| Authentication | Laravel Sanctum | Sanctum 4 token auth + 2FA | **Implemented** | |
| Payments | M-Pesa Daraja | Daraja STK push + callback | **Implemented** | Sandbox/live env-driven; never trusts client-side status |
| SMS | Africa's Talking | AT gateway + SMS channel | **Implemented** | SMS delivery tracked in `notification_deliveries` |
| Cloud storage | AWS S3 / Cloudflare R2 | S3 driver configured, disk default `local` | **Partial** | Driver present, but default is local storage; no credentials in `.env.example`; R2 not set up |
| AI | OpenAI APIs | OpenAI provider + fallbacks | **Implemented** | Pluggable provider abstraction (`AiProviderManager`) |
| Version control | GitHub | Git repo (`origin/main`) | **Partial** | Git in use; no GitHub Actions/CI pipeline |

### B. User roles

Role source: `backend/database/seeders/RoleSeeder.php` (15 roles, Spatie entities). Route guards: `backend/routes/api.php`. Permission grants: `PermissionSeeder.php`. Frontend role lists: `frontend/src/config/navigation.ts`.

| Role | Entity exists | Permissions scoped | Dashboard/view exists | Status | Notes |
|---|---|---|---|---|---|
| Super Admin | ✅ `super_admin` | ✅ all permissions | ✅ `/dashboard` | **Implemented** | |
| Director | ✅ `director` | ❌ no permission grants; no `role:director` routes | ❌ nav lists it; backend blocks | **Partial** | Seeded + in sidebar, but zero scoped API routes; `CompetitionPolicy` references it |
| Branch Manager | ✅ `branch_manager` | ❌ none | ❌ | **Partial** | Same as director; no branch-scoping logic anywhere |
| School Administrator | ✅ `school_admin` | ❌ none | ❌ | **Partial** | **Name mismatch:** `CompetitionPolicy` checks role `school_administrator`, but the seeded role is `school_admin` — policy check can never match |
| Teacher | ✅ `teacher` | ✅ granted + `role:teacher` routes | ✅ teacher portal | **Implemented** | |
| Student | ✅ `student` | ✅ granted | ✅ student dashboard | **Implemented** | |
| Parent | ✅ `parent` | ✅ via `role:parent` routes + portal scoping | ✅ parent portal | **Implemented** | Access scoped to own children (`ParentPortalService::hasAccessToStudent`) |
| Accountant | ✅ `accountant` | ❌ no grants; finance routes are `admin\|super_admin` only | ❌ sidebar shows Finance for accountant, backend returns 403 | **Partial** | Frontend/backend mismatch — nav grants access the API denies |
| HR Officer | ✅ `hr_officer` | ✅ granted + `role:hr_officer` routes | ✅ `/hr` | **Implemented** | |
| Inventory Officer | ✅ `inventory_officer` | ✅ granted + routes | ✅ `/inventory` | **Implemented** | |
| Librarian | ✅ `librarian` | ✅ granted + routes | ✅ `/library/admin` | **Implemented** | |
| Competition Judge | ✅ `judge` | ✅ granted (`score_competitions`); service-enforced assignment check | ✅ `/competitions/:id/judge` | **Implemented** | `CompetitionJudgingService::canJudge` restricts to assigned judges |
| Guest | ❌ not in seeder | ❌ | ❌ | **Missing** | No guest role entity; public website pages are unauthenticated routes, not a guest role |

### C. Public website

Frontend pages: `frontend/src/pages/website/`. Backend: `WebsiteController` + CMS (all content CMS-driven from DB, not hard-coded).

| Item | Status | Notes |
|---|---|---|
| Home | **Implemented** | Live CMS data via `/api/public/site` (`HomePage.tsx` uses `websiteApi.site.get`) |
| About | **Missing** | No About page/route |
| Courses | **Missing** | No public course catalog page; `/courses` is inside the authenticated app, website only exposes marketing "Programs" |
| School Partnerships | **Partial** | `PartnerSchool` model + admin pages exist; no public-facing partnerships page |
| Events | **Missing** | `CalendarEvent` model + teacher calendar exist; no public events page, no events CMS |
| Gallery | **Implemented** | CMS-managed |
| Blog | **Implemented** | CMS-managed, with related posts |
| Contact | **Implemented** | Form posts to `/api/public/contact`, admin inbox |
| Online Registration | **Missing** | No public admission/registration form; `/register` only creates app user accounts; admissions are admin-only |
| Extras beyond spec | — | Programs, Robotics, Coding, Testimonials (Success Stories), FAQs, live AI chat widget (`/api/public/chat`) — all working |

### D. Student management

| Item | Status | Notes |
|---|---|---|
| Student Admission | **Implemented** | `Admissions` CRUD + admit/reject, admin-driven |
| Student Profile | **Implemented** | CRUD, photo, promote/transfer/graduate, documents, timeline |
| Attendance | **Implemented** | Daily + bulk + monthly per student + reports |
| Medical Information | **Implemented** | `MedicalRecord` CRUD per student |
| Parent Information | **Implemented** | `Guardian` CRUD linked to students |
| Course Enrollment | **Implemented** | `Enrollment` + progress + unenroll |
| Progress Tracking | **Implemented** | Lesson completion, coding progress, report cards |
| Certificates | **Implemented** | Issue, download PDF, QR verification |

### E. Learning Management System (course catalog)

| Item | Status | Notes |
|---|---|---|
| Scratch | **Missing** | No `Course` record (only a marketing *program* "Scratch Coding Adventures" in `ProgramSeeder`) |
| Blockly | **Missing** | Not present anywhere |
| HTML | **Missing** | Not a course record |
| CSS | **Missing** | Not a course record |
| JavaScript | **Missing** | Not a course record |
| Python | **Partial** | Only "Python for Data Science" (a data-science course, not a Python fundamentals course) |
| SQL | **Missing** | Not a course record (coding playground supports SQL execution) |
| PHP | **Missing** | Only inside the Laravel course |
| Laravel | **Partial** | "Complete Laravel 12 Masterclass" exists |
| React | **Partial** | "React & TypeScript Advanced Patterns" exists |
| Flutter | **Missing** | Not a course record |
| AI | **Missing** | Not a course record ("AI & Machine Learning for Teens" is a marketing *service* only) |
| Robotics | **Missing** | Not an LMS course; robotics exists as lab + marketing programs |
| Content structure | **Implemented** | Courses have lessons with `module_name` grouping, sequencing (`sort_order`), types (video/text/quiz/assignment), and completion rules — structure is real, not just categories |

**Verdict:** catalog coverage is sparse (3 of 13 subject areas exist as course records); the content engine behind them is fully structured. → **Partial** for the catalog.

### F. Robotics Lab

| Item | Status | Notes |
|---|---|---|
| Kits / Equipment | **Implemented** | `RoboticsEquipment` with QR codes, maintenance records, inventory linkage |
| Equipment reservations/assignments | **Implemented** | Assign/return/approve/reserve flows + tests |
| Projects | **Implemented** | `RoboticsProject` + submissions + staff review |
| Teams | **Implemented** | `RoboticsTeam` + members |
| Competitions | **Implemented** | Robotics challenge type + full competition module |

### G. Finance

| Item | Status | Notes |
|---|---|---|
| Fees | **Implemented** | `FeeStructure` + per-student `Fee` |
| M-Pesa | **Implemented** | Daraja STK push, callback, reconciliation, idempotent, sandbox/live config |
| Receipts | **Implemented** | Receipt PDF + parent receipts pages |
| Invoices | **Implemented** | CRUD, generate, issue, void, PDF, record payment |
| Payroll | **Implemented** | In HR module (`Payroll`, `Payslip`, run/process/mark-paid) |
| Expenses | **Implemented** | CRUD + by-category reports |
| Budgets | **Implemented** | CRUD |

### H. Human Resource

| Item | Status | Notes |
|---|---|---|
| Employees | **Implemented** | Directory, onboard/offboard, HR record edit, exports |
| Payroll | **Implemented** | Run payroll, payslips, PDF, self-service |
| Leave | **Implemented** | Requests, balances, approve/reject, self-service |
| Contracts | **Implemented** | CRUD + termination |

### I. Inventory

| Item | Status | Notes |
|---|---|---|
| Laptops / Computers | **Implemented** | Trackable `Asset` records (seeded laptops) with serial + QR |
| Arduino kits | **Implemented** | `InventorySeeder` includes Arduino Kits category + items |
| LEGO kits | **Implemented** | Assets + stock items seeded |
| Books | **Partial** | Books are managed in the separate Library module (resources), not as inventory items — acceptable split, but not unified |
| Furniture | **Implemented** | Asset category + seeded desks/printers |

All tracked as database records with categories, locations, serial numbers, QR codes, assignments, maintenance and stock movements — **not** static text.

### J. AI Assistant

| Assistant | Status | Notes |
|---|---|---|
| Student Tutor | **Implemented** | `AiAssistant` seeded (slug `student-tutor`) + `AiTutorService`/`AiPlatformService` make real OpenAI calls with fallback |
| Teacher Assistant | **Implemented** | Seeded + lesson-plan/quiz generation templates |
| Parent Assistant | **Implemented** | Seeded + performance-summary template |
| Admin Assistant | **Implemented** | Seeded |
| Extras | — | Coding Mentor, Robotics Coach also seeded; usage tracking, token/cost, rate limits, role-based `use_ai_assistants` permission |

All four are **working integrations** (provider abstraction, conversation history, usage logs, tests `AiPlatformTest`), not placeholder UI.

### K. Navigation structure (logged-in sidebar)

Source: `frontend/src/config/navigation.ts`. All items resolve to registered routes (verified by `NAVIGATION_AUDIT.md` and route inspection).

| Item | Status | Notes |
|---|---|---|
| Website | **Implemented** | "Website / CMS" (admin/super_admin) |
| Students | **Implemented** | SIS_ROLES group |
| Parents | **Implemented** | parent role |
| Teachers | **Implemented** | TEACHER_ROLES group |
| Schools | **Partial** | No "Schools" item; "Organization → Partner Schools/Branches" covers it |
| Courses | **Implemented** | Under Academics |
| Coding Lab | **Implemented** | Playground, Challenges, Leaderboard |
| Robotics Lab | **Implemented** | |
| AI Tutor | **Implemented** | Under Learning/LMS + separate AI Platform |
| Assignments | **Partial** | Teacher-side complete; **no student-facing submit/view route** exists in `api.php` (model exists) |
| Exams | **Implemented** | Teacher portal |
| Certificates | **Implemented** | |
| Competitions | **Implemented** | |
| Events | **Missing** | No Events nav item or page (teacher calendar shows class events only) |
| Finance | **Implemented** | (nav grants accountant/director access the API denies — see roles) |
| HR | **Implemented** | |
| Inventory | **Implemented** | |
| Library | **Implemented** | |
| Reports | **Implemented** | Reports & Analytics |
| Settings | **Implemented** | 12 settings pages |
| Profile | **Implemented** | Under Settings |

### L. Admin dashboard (on login, `/dashboard`)

Sources: `DashboardPage.tsx`, `StatsGrid.tsx`, `Charts.tsx`, `RecentActivity.tsx`, `DashboardService.php`.

| Widget | Status | Notes |
|---|---|---|
| Total Students | **Absent** | Main dashboard shows Users/Employees, not students (students only on `/students/overview` and `/analytics`) |
| Total Teachers | **Absent** | Not on dashboard (analytics has a teachers section) |
| Active Schools | **Absent** | |
| Monthly Revenue | **Absent** | A "Revenue" card exists but `DashboardService` never returns `revenue` — renders undefined; trend values hardcoded |
| Outstanding Fees | **Absent** | Only on Finance/analytics pages |
| Course Enrollments | **Implemented** | Live `total_enrollments` from API |
| Competition Registrations | **Absent** | |
| Attendance Summary | **Absent** | |
| Recent Activities | **Partial** | Widget exists but **hardcoded mock data** (`RecentActivity.tsx` hardcodes Sarah Johnson/Mike Chen…) |
| Upcoming Events | **Absent** | "Upcoming Deadlines" shows tasks, not events |
| Notifications | **Absent** | Separate `/notifications` page, not on dashboard |
| AI Insights | **Absent** | |
| Charts | **Partial** | Enrollment/completion/course-distribution charts on the dashboard use **hardcoded arrays** (`Charts.tsx`) |

**Verdict:** the admin dashboard shows live data for ~1 of 12 spec'd widgets; 3 widgets are mock/hardcoded; the rest are absent. The separate `/analytics` (AnalyticsDashboardPage) and `/finance` dashboards do render live data for many of these metrics — but not on login.

### M. System design package deliverables

| Deliverable | Status | Notes |
|---|---|---|
| SRS | **Partial** | Root `CODER'S HERO ERP & LEARNING MANAGEMENT SYSTEM.md` is a phase-by-phase implementation spec (requirements + prompts), not a formal SRS |
| Database Design / ERD | **Missing** | No ERD anywhere; only migrations |
| System Architecture Diagram | **Partial** | Informal ASCII diagrams in `README.md` and the spec file; no formal diagram |
| UI/UX Wireframes | **Missing** | |
| Role & Permission Matrix | **Partial** | `ROLE_ACCESS_MATRIX.md` (root) documents nav-level access; it does not surface that director/branch_manager/school_admin/accountant have no backend routes |
| API Specification | **Partial** | README lists endpoint groups; no formal OpenAPI spec |
| Dev Folder Structure docs | **Partial** | README has a folder-structure section |
| Brand Design System | **Partial** | Branding is configurable in-app (colors, fonts, logo) with `BrandingApplier`; no documented design system (colors/typography/icons/components) as a deliverable |

---

## Step 3 — Gap report

### Every item marked **Missing**

1. **Mobile app (Flutter)** — no codebase, no directory, no `pubspec.yaml`.
2. **Guest role** — not in `RoleSeeder`; no role entity.
3. **Public website: About page** — no route/page.
4. **Public website: Events** — no public events page or events CMS; `CalendarEvent` only feeds teacher calendar.
5. **Public website: Online Registration** — no public admission form; `/register` is app-account only.
6. **Public website: Courses page** — no public course catalog.
7. **LMS courses: Scratch, Blockly, HTML, CSS, JavaScript, SQL, PHP, Flutter, AI, Robotics** — no `Course` records (only marketing programs/services).
8. **Admin dashboard widgets** — Total Students, Total Teachers, Active Schools, Monthly Revenue, Outstanding Fees, Competition Registrations, Attendance Summary, Upcoming Events, Notifications, AI Insights (absent from login dashboard).
9. **Navigation: Events** — no nav item.
10. **CI pipeline (GitHub Actions)** — no `.github/`.
11. **ERD / Database Design** — none.
12. **UI/UX Wireframes** — none.
13. **Student assignment submission** — no API route for students to view/submit assignments (`AssignmentSubmission` model exists; only teacher-side routes).

### Every item marked **Partial**, with what remains

1. **Cloud storage (S3/R2)** — driver configured but inactive. Remaining: set `FILESYSTEM_DISK=s3`, fill credentials, decide S3 vs R2 endpoint, move uploads (photos, documents, library files) to remote disk.
2. **Director role** — seeded + in sidebar, but no permission grants and no `role:director` API routes. Needs scoped routes/permissions or removal from nav.
3. **Branch Manager role** — same; plus the spec requires actual branch-scoped data isolation, which doesn't exist (no branch filtering on queries beyond analytics).
4. **School Administrator role** — same; plus fix the `school_administrator` vs `school_admin` name mismatch in `CompetitionPolicy.php` (lines 29–61).
5. **Accountant role** — sidebar lists Finance for accountant, but backend finance routes are `role:admin|super_admin` only. Either grant accountant access to finance routes or remove from nav.
6. **Public website: School Partnerships** — model + admin pages exist; no public page.
7. **LMS course catalog** — only 5 seeded courses (Laravel, React, Python, Docker, UX). Needs the 13 spec subject areas created with structured lessons (Scratch, Blockly, HTML, CSS, JS, SQL, PHP, Flutter, AI, Robotics + upgrades to Python/Laravel/React).
8. **Admin dashboard** — charts and Recent Activity use hardcoded data; Revenue card references a field the backend never returns. Needs live API wiring for these widgets plus the missing widgets (or a deliberate scope note).
9. **ReportsPage (`/reports`)** — fetches API reports but renders a hardcoded Jan–Jun chart; the API data is unused.
10. **Assignments (student side)** — teacher CRUD/grading complete; student submit/view endpoints + pages missing.
11. **Navigation "Schools"** — exists as Organization → Partner Schools/Branches; needs explicit "Schools" grouping if the spec label is mandatory.
12. **SRS / Architecture diagram / API spec / Role matrix / Folder structure / Brand design system** — informal docs exist (README, spec md, `ROLE_ACCESS_MATRIX.md`, `MODULE_COVERAGE_REPORT.md`, `NAVIGATION_AUDIT.md`); formal deliverables (OpenAPI, ERD, wireframes, design system) do not.
13. **PHP version** — composer allows PHP 8.3 while spec targets 8.4+ (minor).

### Every item marked **Unclear**

1. **M-Pesa live credentials** — `config/mpesa.php` supports sandbox/live and tests pass against mocked endpoints, but the repo cannot confirm a live Safaricom shortcode/credentials are configured (`.env` not readable; `.env.example` has no MPESA_* entries). Question: is this sandbox-only or production-ready?
2. **SMS / email / push delivery in production** — channels, templates and delivery tracking are implemented, but `AT_SMS_*`, SMTP and Firebase FCM credentials are absent from `.env.example`, and there is no FCM app-side consumer (tokens are registered, no push service call found beyond tracking). Question: are push notifications actually dispatched, or only tracked?
3. **"Revenue" on the admin dashboard** — a Revenue stat card exists, but `DashboardService::getAdminDashboard()` never computes `revenue`. Either the card is dead UI or the field comes from another endpoint the frontend isn't calling. Needs confirmation of intent before fixing.
4. **GitHub as VCS** — the repo is git with `origin/main`, but remote URL isn't visible in the workspace, so GitHub hosting can't be confirmed. Trivial, but flagged for completeness.

---

## Step 4 — Gaps converted to phased tasks

Phase assignments follow the roadmap verbatim (no reordering/merging). Current status references Step 3.

### Phase 1 – Foundation (project setup, DB design, authentication, roles/permissions, admin dashboard)

| Task | Phase | Status | What to build/fix | Depends on | Constraints |
|---|---|---|---|---|---|
| P1-1 Fix role/route coverage for director, branch_manager, school_admin, accountant | 1 | Partial | Add scoped permission grants + `role:` route groups (or explicitly remove from nav); fix `school_administrator` → `school_admin` mismatch in `CompetitionPolicy` | None | Role names in seeder are source of truth |
| P1-2 Add Guest role | 1 | Missing | Seed `guest` role; decide its scope (public website only) and enforce | P1-1 | Must not weaken auth on existing routes |
| P1-3 Rebuild admin dashboard to spec | 1 | Partial/Missing | Wire dashboard widgets to live APIs (students, teachers, schools, revenue, outstanding, competitions, attendance, events, notifications, AI insights); replace hardcoded `Charts.tsx`/`RecentActivity.tsx` data; add `revenue`/`completion_rate` to `DashboardService` | None | Keep existing live widgets; don't regress |
| P1-4 Formalize design docs | 1 | Partial | ERD, API spec (OpenAPI), role/permission matrix reflecting actual backend guards, brand design system | P1-1 | Docs only; no schema changes implied |

### Phase 2 – Core ERP (students, parents, teachers, schools, finance, HR)

| Task | Phase | Status | What to build/fix | Depends on | Constraints |
|---|---|---|---|---|---|
| P2-1 Branch-scoped data isolation for branch_manager | 2 | Partial | Add branch scoping to queries/services (students, finance, inventory, reports) so branch managers only see their branch | P1-1 | Spec: "A Branch Manager must only access permitted branch data" |
| P2-2 Student-facing assignments | 2 | Partial | Student submit/view assignment API routes + pages; wire into teacher grading | None | Reuse existing `AssignmentSubmission` model |
| P2-3 Activate S3/R2 storage | 2 | Partial | Set storage disk, credentials, migrate uploads (photos, documents, library files) off local | None | Secrets never committed; keep local fallback for dev |
| P2-4 Finance access for accountant | 2 | Partial | Grant accountant finance routes/permissions consistent with sidebar | P1-1 | Follow existing `role:` middleware pattern |

### Phase 3 – Learning platform (LMS, coding lab, robotics lab, exams, certificates)

| Task | Phase | Status | What to build/fix | Depends on | Constraints |
|---|---|---|---|---|---|
| P3-1 Build out the 13 spec course records | 3 | Partial/Missing | Create structured courses (lessons/modules/quizzes) for Scratch, Blockly, HTML, CSS, JavaScript, SQL, PHP, Flutter, AI, Robotics; upgrade Python/Laravel/React to fundamentals coverage | None | Use existing `Course`/`Lesson`/`Module` structure; real content, no placeholders |
| P3-2 Public courses catalog page | 3 | Missing | Public `/courses` page on the website layout listing published courses | P3-1 | Content stays CMS/DB-driven |
| P3-3 Public events module + page | 3 | Missing | Events CMS (admin), public events page, nav item | None | Reuse/extend `CalendarEvent` model |

### Phase 4 – Advanced features (AI tutor, competition management, mobile apps, analytics, notifications)

| Task | Phase | Status | What to build/fix | Depends on | Constraints |
|---|---|---|---|---|---|
| P4-1 Build Flutter mobile apps | 4 | Missing | Student/Parent/Teacher/Admin Flutter apps against the existing Laravel API; auth, token handling, push, offline caching | Backend API is ready | API remains source of truth; Android build config |
| P4-2 Complete push notification delivery | 4 | Unclear/Partial | Wire FCM send path (or confirm/track as email+SMS only); delivery + retry already exist | None | Keep channel abstraction |
| P4-3 Online registration | 4 | Missing | Public registration/admission form feeding the existing `Admissions` flow (+ optional M-Pesa deposit) | P3-1 | Must respect `Public registration enabled` setting |

### Phase 5 – Launch (testing, security audit, performance, deployment, user training)

| Task | Phase | Status | What to build/fix | Depends on | Constraints |
|---|---|---|---|---|---|
| P5-1 CI pipeline (GitHub Actions) | 5 | Missing | CI running backend tests + frontend typecheck/build on push/PR | None | No secrets in pipeline; use repo secrets |
| P5-2 Fix ReportsPage mock charts | 5 | Partial | Render fetched API data in `/reports` charts instead of hardcoded arrays | None | |
| P5-3 Security audit + live-credential verification | 5 | Unclear/Partial | Verify M-Pesa live config, SMS/SMTP credentials, storage; run the audit checklist from the spec (IDOR, mass assignment, etc.) | P2-3, P4-2 | Test against sandbox first |
| P5-4 Performance + deployment docs | 5 | Partial | Index/query review (already partially done), `DEPLOYMENT.md`/`OPERATIONS.md`/`BACKUP.md` per spec | None | Measure before optimizing |

---

*End of report. Audit only — no code was modified.*
