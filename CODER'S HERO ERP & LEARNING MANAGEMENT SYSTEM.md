# CODER'S HERO ERP & LEARNING MANAGEMENT SYSTEM
## IMPLEMENTATION.md

**Project:** Coder's Hero ERP & Learning Management System  
**Short Name:** CH-ERP LMS  
**Version:** 1.0  
**Development Methodology:** Agile / Incremental AI-Assisted Development  
**Primary AI Coding Tool:** OpenCode  
**Backend:** Laravel 12 / PHP 8.4+  
**Frontend:** React + TypeScript + Tailwind CSS  
**Database:** MySQL 8  
**Mobile:** Flutter  
**Authentication:** Laravel Sanctum  
**Payments:** M-Pesa Daraja API  
**SMS:** Africa's Talking  
**AI:** OpenAI API  
**Version Control:** GitHub  

---

# 1. PROJECT VISION

Build a scalable digital ecosystem for Coder's Hero that combines:

- Professional public website
- School ERP
- Learning Management System
- Coding platform
- Robotics management
- Competition management
- Finance
- Human Resources
- Inventory
- Digital Library
- Certificate management
- AI-powered learning
- Analytics
- Mobile applications

The system must be designed to support:

- Thousands of students
- Multiple branches
- Multiple partner schools
- Multiple teachers
- Multiple parents
- Multiple courses
- Coding and robotics competitions
- Future multi-school expansion

---

# 2. CORE DEVELOPMENT RULE

OpenCode MUST NOT attempt to build the entire system in one operation.

The project MUST be implemented phase by phase.

For every phase:

1. Inspect the existing project.
2. Understand existing architecture.
3. Do not overwrite working functionality.
4. Implement database changes.
5. Implement backend logic.
6. Implement API endpoints.
7. Implement authorization.
8. Implement frontend UI.
9. Implement validation.
10. Implement tests.
11. Run migrations.
12. Run tests.
13. Fix errors.
14. Update documentation.
15. Mark the phase complete only after verification.

Never create fake functionality merely to satisfy a requirement.

Never use placeholder buttons that do nothing.

Never create duplicate models, migrations, controllers, routes, components, or services when an existing implementation can be extended.

---

# 3. MASTER ARCHITECTURE

```text
                         CODER'S HERO
                              │
                  ┌───────────┴───────────┐
                  │                       │
            PUBLIC WEBSITE            APPLICATION
                  │                       │
                  │              ┌────────┴────────┐
                  │              │                 │
                  │           ERP SYSTEM          LMS
                  │              │                 │
                  │              └────────┬────────┘
                  │                       │
                  └───────────────────────┤
                                          │
                                     REST API
                                          │
                              ┌───────────┴───────────┐
                              │                       │
                           WEB APP              MOBILE APPS
                              │                       │
                       React + TypeScript          Flutter
```

---

# 4. APPLICATION AREAS

The application must eventually contain:

```text
Dashboard
├── Website
├── Students
├── Parents
├── Teachers
├── Schools
├── Branches
├── Courses
├── Classes
├── Timetable
├── Attendance
├── Assignments
├── Exams
├── Coding Lab
├── Robotics Lab
├── AI Tutor
├── Competitions
├── Certificates
├── Finance
├── HR
├── Inventory
├── Library
├── Events
├── Blog
├── Notifications
├── Reports
├── Analytics
├── Settings
└── Profile
```

---

# 5. USER ROLES

Implement role-based access control.

Initial roles:

```text
Super Admin
Director
Branch Manager
School Administrator
Teacher
Student
Parent
Accountant
HR Officer
Inventory Officer
Librarian
Competition Judge
Guest
```

Permissions must be granular.

Examples:

```text
students.view
students.create
students.update
students.delete

attendance.view
attendance.create
attendance.update

courses.view
courses.create
courses.update
courses.delete

finance.view
finance.create
finance.update
finance.reports

users.manage
roles.manage
permissions.manage
settings.manage
```

Use Laravel policies and Spatie Permission.

---

# 6. PHASE 0 — PROJECT FOUNDATION

## Objective

Create a clean production-ready development foundation.

## Tasks

- [ ] Create Git repository
- [ ] Initialize Laravel 12
- [ ] Configure PHP
- [ ] Configure MySQL
- [ ] Configure React
- [ ] Configure TypeScript
- [ ] Configure Tailwind CSS
- [ ] Configure Vite
- [ ] Configure Sanctum
- [ ] Configure Spatie Permission
- [ ] Configure Redis
- [ ] Configure queues
- [ ] Configure storage
- [ ] Configure environment files
- [ ] Create API architecture
- [ ] Create testing structure
- [ ] Configure GitHub
- [ ] Configure CI pipeline

## OpenCode Prompt

```text
You are the lead software architect for Coder's Hero ERP & Learning Management System.

Build PHASE 0 ONLY.

Create a production-ready Laravel 12 + React + TypeScript foundation.

Technology:

Laravel 12
PHP 8.4+
React
TypeScript
Tailwind CSS
Vite
MySQL 8
Laravel Sanctum
Spatie Permission
Redis
Laravel Queues

Requirements:

1. Inspect the existing repository before making changes.
2. Do not destroy existing working code.
3. Create a clean scalable architecture.
4. Configure environment handling.
5. Configure database.
6. Configure API structure.
7. Configure authentication foundation.
8. Configure role/permission foundation.
9. Configure testing.
10. Configure logging.
11. Configure queues.
12. Configure storage.
13. Configure CORS.
14. Configure API versioning.
15. Create README documentation.
16. Create DEVELOPMENT.md documentation.

Use clean Laravel conventions.

Do not create fake features.

Do not create unnecessary tables.

Run the application and tests after implementation.

Fix all errors before finishing.

At the end provide:

- files created
- files modified
- commands executed
- tests executed
- remaining issues
```

---

# 7. PHASE 1 — AUTHENTICATION & AUTHORIZATION

## Objective

Create the identity and access-control foundation.

## Features

- [ ] Login
- [ ] Logout
- [ ] Registration
- [ ] Password reset
- [ ] Email verification
- [ ] Profile
- [ ] Profile photo
- [ ] Roles
- [ ] Permissions
- [ ] User status
- [ ] Activity logs
- [ ] Login history
- [ ] Session management
- [ ] Security controls

## OpenCode Prompt

```text
Implement PHASE 1 of Coder's Hero ERP LMS.

Build a complete authentication and authorization system using:

Laravel Sanctum
Spatie Laravel Permission
React
TypeScript
Tailwind CSS

Implement:

- login
- logout
- registration
- password reset
- email verification
- profile management
- profile photo
- user status
- role management
- permission management
- activity logging
- login history
- session management

Create the following roles:

Super Admin
Director
Branch Manager
School Administrator
Teacher
Student
Parent
Accountant
HR Officer
Inventory Officer
Librarian
Competition Judge

Requirements:

- secure password hashing
- validation
- authorization policies
- API resources
- service classes
- audit logs
- rate limiting
- proper error responses
- responsive UI
- automated tests

Do not duplicate existing authentication code.

Inspect the repository first.

Run migrations and tests.

Do not consider the phase complete until all tests pass.
```

---

# 8. PHASE 2 — PUBLIC WEBSITE

## Features

- [ ] Home
- [ ] About
- [ ] Programs
- [ ] Holiday Camps
- [ ] Coding Competitions
- [ ] Robotics Competitions
- [ ] STEM Labs
- [ ] Partner Schools
- [ ] Gallery
- [ ] Success Stories
- [ ] Events
- [ ] Blog
- [ ] Careers
- [ ] Contact
- [ ] Registration
- [ ] M-Pesa payments
- [ ] Live chat
- [ ] AI assistant

## OpenCode Prompt

```text
Implement PHASE 2: Coder's Hero Public Website.

Create a modern professional responsive website using React, TypeScript and Tailwind CSS.

Pages:

Home
About
Programs
Holiday Camps
Coding Competitions
Robotics Competitions
STEM Labs
Partner Schools
Gallery
Success Stories
Events
Blog
Careers
Contact
Registration

The website must have:

- responsive design
- mobile navigation
- SEO metadata
- reusable components
- CMS-managed content
- image management
- blog management
- events management
- gallery management
- contact submissions
- online registration
- analytics-ready architecture
- AI assistant widget
- live chat-ready architecture

Administrators must be able to manage website content from the ERP.

Do not hard-code content that administrators are expected to edit.

Implement validation and tests.

Inspect existing code before modifying anything.
```

---

# 9. PHASE 3 — SCHOOL & BRANCH MANAGEMENT

## Features

- [ ] Branches
- [ ] Partner schools
- [ ] School administrators
- [ ] School contacts
- [ ] Programs
- [ ] School enrollment
- [ ] School status
- [ ] Branch-level permissions

## OpenCode Prompt

```text
Implement PHASE 3: School and Branch Management.

Build complete management for:

Branches
Partner Schools
School Administrators
School Contacts
School Programs

Each branch must be able to have its own:

students
teachers
courses
classes
attendance
finance
inventory
reports

Implement branch-level authorization.

A Branch Manager must only access permitted branch data.

Super Admin must access everything.

School administrators must only access their assigned schools.

Create:

migrations
models
relationships
services
controllers
policies
API resources
React pages
forms
filters
search
pagination
reports
tests

Prevent unauthorized cross-branch data access.

Test authorization thoroughly.
```

---

# 10. PHASE 4 — STUDENT MANAGEMENT

## Features

- [ ] Admissions
- [ ] Student profiles
- [ ] Guardians
- [ ] Medical information
- [ ] Documents
- [ ] Enrollment
- [ ] Course registration
- [ ] Attendance
- [ ] Progress
- [ ] Student ID
- [ ] QR code
- [ ] Student history

## OpenCode Prompt

```text
Implement PHASE 4: Student Information Management.

Create a complete Student Information System.

Implement:

Student admission
Student profile
Guardian management
Emergency contacts
Medical information
Student documents
Student ID
QR code
Course enrollment
Class assignment
Student status
Attendance
Progress tracking
Student timeline

Use normalized database design.

Implement:

Models
Migrations
Relationships
Services
Policies
Controllers
API resources
Validation
React UI
Search
Filters
Pagination
Exports
Reports
Automated tests

Protect sensitive student information with proper authorization.

Do not expose student data to unauthorized users.
```

---

# 11. PHASE 5 — PARENT PORTAL

```text
Implement PHASE 5: Parent Portal.

Parents must be able to:

- view linked students
- view attendance
- view course progress
- view assignments
- view grades
- view report cards
- view invoices
- view payments
- download receipts
- receive notifications
- book parent meetings
- communicate with teachers

Parents must ONLY access their own linked children.

Implement secure authorization.

Create responsive desktop and mobile-friendly UI.

Implement APIs, services, policies, validation and tests.
```

---

# 12. PHASE 6 — TEACHER PORTAL

```text
Implement PHASE 6: Teacher Portal.

Teachers must be able to:

- view assigned classes
- view students
- take attendance
- create assignments
- upload lesson notes
- create exams
- mark assignments
- enter grades
- view student performance
- manage timetable
- communicate with parents
- create reports

Teachers must only access classes and students assigned to them.

Implement complete backend and frontend functionality.

Include validation, authorization, audit logging and tests.
```

---

# 13. PHASE 7 — LMS

## Courses

```text
Scratch
Blockly
HTML
CSS
JavaScript
Python
SQL
PHP
Laravel
React
Flutter
Robotics
LEGO Robotics
Arduino
Raspberry Pi
IoT
AI
Prompt Engineering
Machine Learning
Computer Vision
Chatbots
Graphic Design
Canva
Photoshop
Video Editing
French
Chess
Music
Dance
Journalism
Football
Skating
Art & Design
Scouting
```

## OpenCode Prompt

```text
Implement PHASE 7: Learning Management System.

Build:

Course management
Course categories
Lessons
Modules
Videos
Documents
Assignments
Quizzes
Exams
Enrollment
Progress tracking
Course completion
Discussion
Bookmarks
Certificates

Students must see only courses available to them.

Teachers must manage courses they are authorized to manage.

Administrators must have complete LMS management.

Implement course progress calculation.

Implement completion rules.

Implement APIs, frontend, validation, authorization and automated tests.
```

---

# 14. PHASE 8 — CODING PLAYGROUND

```text
Implement PHASE 8: Secure Coding Playground.

Languages:

HTML
CSS
JavaScript
Python
SQL

Features:

- browser code editor
- syntax highlighting
- file management
- autosave
- execution
- console output
- coding challenges
- submissions
- automatic grading
- test cases
- leaderboard
- AI hints
- AI debugging

SECURITY:

Never execute untrusted code directly on the Laravel application server.

Design an isolated execution architecture using sandboxed workers/containers.

Implement resource limits:

CPU
memory
execution time
network access
filesystem access

Students must not be able to escape the sandbox.

Implement complete APIs and UI.

Document the execution architecture.
```

---

# 15. PHASE 9 — ROBOTICS LAB

```text
Implement PHASE 9: Robotics Laboratory.

Manage:

Robotics kits
Arduino boards
LEGO kits
Sensors
Microcontrollers
Components
Projects
Project submissions
Teams
Equipment reservations
Maintenance
Competition projects

Implement:

inventory integration
assignment of equipment
student/team ownership
project tracking
maintenance records
QR identification

Create complete backend, API, React UI and tests.
```

---

# 16. PHASE 10 — COMPETITIONS

**Status: Implemented (backend + API + tests green; frontend UI added).** Migration set `2026_08_14_000001..000006_*_competition*`, models `Competition`/`CompetitionCriterion`/`CompetitionTeam`/`CompetitionScore`, services under `App\Services\Competitions` (incl. `CompetitionAccess` trait), 3 API controllers under `App\Http\Controllers\Api\Competitions`, 10 form requests, `judge` role + `competitions` permission group, seeders, and `tests/Feature/CompetitionTest.php` (27 tests, 67 assertions). Frontend: `src/pages/competitions/*` (list, detail, create, manage, judge scoring, leaderboard, my teams), `src/types/competitions.ts`, `src/lib/competitionsApi.ts`, `src/hooks/useCompetitions.ts`, sidebar + routes incl. `judge` role.

```text
Implement PHASE 10: Competition Management.

Support:

Coding Hackathons
Robotics Challenges
AI Challenges
Web Design Competitions
Mobile App Competitions

Features:

Competition creation
Registration
Teams
Participants
Judges
Judging criteria
Scoring
Score submission
Score verification
Leaderboard
Competition status
Certificates
Results

Implement role-based judge access.

Judges must only access competitions assigned to them.

Scores must be auditable.

Create complete API, frontend, validation, authorization and tests.
```

---

# 17. PHASE 11 — FINANCE

**Status: Implemented (backend + API + tests green; frontend UI added).** Migration set `2026_08_15_000004..000008_*` (fee_structures, invoices, invoice_items, updated payments, mpesa_transactions, expenses, budgets), models `FeeStructure`/`Invoice`/`InvoiceItem`/`MpesaTransaction`/`Expense`/`Budget` (updated `Payment`), services under `App\Services\Finance` (`FinanceService`, `InvoiceService`, `PaymentService`) + `MpesaService`/`MpesaCallbackService`, 7 API controllers under `App\Http\Controllers\Api\Finance`, 10 form requests under `App\Http\Requests\Finance`, `finance` permission group, `FinanceSeeder`, `config/mpesa.php` (env-driven Daraja credentials), and `tests/Feature/FinanceTest.php` (19 tests, 102 assertions). Payment status is never trusted from the frontend — it is recomputed server-side from recorded payments and, for M-Pesa, from the Daraja callback only (idempotent via checkout_request_id). Frontend: `src/pages/finance/*` (overview, fee structures, invoices list/create/detail, payments list/detail receipts, expenses, budgets, M-Pesa transactions, outstanding balances, transaction ledger, my finance for students/parents), `src/types/finance.ts`, `src/lib/financeApi.ts`, `src/hooks/useFinance.ts`, sidebar + routes.

```text
Implement PHASE 11: Finance.

Features:

Fee structures
Invoices
Payments
Receipts
Outstanding balances
M-Pesa payments
Expenses
Budgets
Financial reports
Transaction history

M-Pesa:

Use Safaricom Daraja API.

Implement:

STK Push
Callback handling
Transaction verification
Payment reconciliation
Idempotency
Transaction logs

Never trust payment status supplied directly by the frontend.

All financial transactions must be auditable.

Implement tests and sandbox integration.

Do not hard-code API credentials.
```

---

# 18. PHASE 12 — HUMAN RESOURCES

**Status: Implemented (backend + API + tests green; frontend UI added and wired).** Backend: models `Employee`/`Department`/`Position`/`EmployeeContract`/`LeaveRequest`/`StaffAttendance`/`Payroll`/`Payslip`/`PerformanceReview`/`EmployeeDocument` (staff status, audit-friendly fields), services under `App\Services\Hr` (`HrService`, `LeaveService`, `PayrollService`), 9 API controllers under `App\Http\Controllers\Api\Hr`, 13 form requests under `App\Http\Requests\Hr`, HR routes under `role:admin|super_admin|hr_officer` (`/hr/*`) plus employee self-service under `role:employee|admin|super_admin` (`/my/hr/*`: summary, profile, leave + balance, attendance, payslips, documents), exports (CSV), `HrSeeder`, and `tests/Feature/HrModuleTest.php` (25 tests, 125 assertions). Frontend: `src/pages/hr/*` (overview, employees list/detail/edit, contracts, leave, attendance, payroll list/detail, performance reviews, documents, reports; self-service: My HR overview, my leave, my payslips list/detail), `src/types/hr.ts`, `src/lib/hrApi.ts`, `src/hooks/useHr.ts`, routes `/hr/*` + `/my/hr/*` in `src/router/routes.ts` with role guards, sidebar HR sections, and a production build that passes `tsc --noEmit` cleanly. Payslip detail uses the self-service endpoint only (employees cannot view others' payslips — enforced in `PayrollController@myPayslip`).

```text
Implement PHASE 12: Human Resources.

Features:

Employees
Departments
Positions
Contracts
Leave
Attendance
Payroll records
Performance reviews
Documents
Staff status

Implement role-based access.

Sensitive HR information must only be accessible to authorized HR and administration users.

Implement audit logs.

Generate reports and exports.

Include automated tests.
```

---

# 19. PHASE 13 — INVENTORY

**Status: Implemented (backend + API + tests green; frontend UI added and wired).** Migration set `2026_08_17_000001..000007` (asset_categories, locations, assets with QR + optional robotics_equipment FK, asset_assignments with assignee morph, asset_maintenance_records, inventory_items, stock_movements), models `AssetCategory`/`Location`/`Asset`/`AssetAssignment`/`AssetMaintenanceRecord`/`InventoryItem`/`StockMovement`, services under `App\Services\Inventory` (`InventoryService`, `AssetService`, `StockService`), 7 API controllers under `App\Http\Controllers\Api\Inventory`, 10 form requests under `App\Http\Requests\Inventory`, 7 resources under `App\Http\Resources\Inventory`, inventory routes under `role:admin|super_admin|inventory_officer` (`/inventory/*`: summary, categories + options, locations + options, assets + scan-by-QR + assign/check-in/dispose/assignments/QR, maintenance, items + low-stock, movements + per-item), `inventory_officer` role, `inventory` permission group, `InventorySeeder` (registered in `DatabaseSeeder`), and `tests/Feature/InventoryTest.php` (21 tests, 108 assertions). Frontend: `src/pages/inventory/*` (overview, assets list/detail with assign/check-in/dispose + QR, stock items with movements, maintenance, categories, locations), `src/types/inventory.ts`, `src/lib/inventoryApi.ts`, `src/hooks/useInventory.ts`, routes `/inventory/*` in `src/router/routes.ts` with role guards, sidebar Inventory section, and a production build that passes `tsc --noEmit` cleanly.

Also fixed pre-existing bugs found while running the full suite: `class_student`/`forum_posts`/`coding_submissions`/`ai_tutor_messages`/`SchoolClass` relationship foreign keys (Eloquent defaulted `school_class_id`/`forum_thread_id`/`coding_exercise_id`/`ai_tutor_conversation_id` but tables use shorter columns), invalid exam types (`written`/`practical`) and coding submission status (`solved`) in `TeacherLmsSeeder` (enum mismatch), nullable `lesson_completions.enrollment_id`, and a stale `bootstrap/cache/config.php` that overrode phpunit.xml mail settings (causing `AuthTest` failures). Full backend suite is green: Finance 19, HrModule 25, Competition 27, Inventory 21, ParentPortal 17, Auth 8, plus all other feature tests.

```text
Implement PHASE 13: Inventory Management.

Track:

Laptops
Computers
Arduino kits
LEGO kits
Robotics equipment
Projectors
Furniture
Books
Consumables
Sensors
Electronic components

Implement:

Assets
Asset categories
Serial numbers
QR codes
Barcode support
Locations
Assignments
Check-in
Check-out
Maintenance
Disposal
Stock movements

Integrate robotics equipment with the Robotics Lab.

Create complete backend and frontend.
```

---

# 20. PHASE 14 — DIGITAL LIBRARY

**Status: Implemented (backend + API + tests green; frontend UI added and wired).** Migration set `2026_08_18_000001..000006` (library_categories, library_authors, library_resources with secure file storage + public/download flags, library_borrowings, library_reservations, library_reading_history), models `LibraryCategory`/`LibraryAuthor`/`LibraryResource`/`LibraryBorrowing`/`LibraryReservation`/`LibraryReadingHistory` (auto-slug generation, borrow/reserve/return logic, overdue detection, reading history with `times_read`), services under `App\Services\Library` (`LibraryService`, `LibraryResourceService` with private-disk uploads and signed temporary URLs), 7 API controllers under `App\Http\Controllers\Api\Library`, 8 form requests under `App\Http\Requests\Library`, 6 resources under `App\Http\Resources\Library`, library routes: public catalog + resource show + borrow/reserve/my borrowings/reservations/history under `auth:sanctum`, management (summary, categories, authors, resources, borrowings + return, reservations) under `role:admin|super_admin|librarian`, `librarian` role, `library` permission group (incl. `view_library`/`library_download` for students), `LibrarySeeder` (registered in `DatabaseSeeder`), and `tests/Feature/LibraryTest.php` (18 tests, 86 assertions) covering auth, role isolation, catalog visibility, category/author/resource CRUD, file upload, download-URL gating, borrow/return lifecycle, reserve-while-borrowed + fulfilment on return, reading history, view counts, and reservation ownership. Files are stored on the private `local` disk and served via 15-minute signed temporary URLs only when `download_allowed` or the user has `library.download`; private resources are excluded from the public catalog. Frontend: `src/pages/library/*` (student catalog with search/type/category filters, resource detail with borrow/reserve/download/open, My Library tabs for borrowings/reservations/history; admin overview, resources management with file upload, borrowings, reservations, categories, authors), `src/types/library.ts`, `src/lib/libraryApi.ts`, `src/hooks/useLibrary.ts`, routes `/library/*` + `/library/admin/*` in `src/router/routes.ts` with role guards, sidebar Library section, and a production build that passes `tsc --noEmit` cleanly. Bookmarking reuses the existing morphable `Bookmark` model.

```text
Implement PHASE 14: Digital Library.

Resources:

E-books
Videos
Notes
Past papers
Coding resources
Robotics manuals

Features:

Categories
Authors
Search
Filtering
Reading
Bookmarks
Access permissions
Borrowing
Reservations
Download permissions
Reading history

Implement secure file storage.

Do not expose private files through public URLs.

Use signed/temporary URLs where appropriate.

Create complete APIs and UI.
```

---

# 21. PHASE 15 — CERTIFICATES

**Status: Implemented (backend + API + tests green; frontend UI added and wired).** Added `barryvdh/laravel-dompdf` for PDF generation (QR generation reuses `bacon/bacon-qr-code`, already present). Migration set `2026_08_19_000001..000003` (certificate_templates, certificate management fields on certificates: template_id, qr_code, digital_signature, status issued/revoked, revocation fields, issued_by; certificate_verifications), models `CertificateTemplate`/`Certificate`/`CertificateVerification` (template management with default/active flags, idempotent issue per enrollment, revocation state, verification history). `App\Services\CertificateService` powers templates CRUD, issue (unique `CH-XXXX-YYYY-#####` certificate numbers + 32-char verification codes + QR payloads), bulk generation for completed enrollments, QR data URLs, dompdf rendering on the private-disk-free `public` storage (PDFs stored under `certificates/`), download stream with on-demand regeneration, revoke/unrevoke with reasons, public verification recording verifier IP/UA/outcome, and index/my-certificates/verifications listing with filters. New `CertificateTemplateController` + updated `CertificateController` (summary, all, verifications, revoke, unrevoke, bulk-generate, download), 5 form requests under `App\Http\Requests\Certificate`, 3 resources (`CertificateResource` with qr_code_url + user/course/template, `CertificateTemplateResource`, `CertificateVerificationResource`), routes: public verify + QR under `public` (throttled), student/my + generate + download under `auth:sanctum`, management (summary, all, verifications, revoke/unrevoke, bulk-generate, template CRUD) under `role:admin|super_admin`, `certificates` permission group (view/generate/manage templates/issue/revoke/verify; students get `view_certificates`), `CertificateSeeder` (registered in `DatabaseSeeder`), and `tests/Feature/CertificateTest.php` (23 tests, 68 assertions) covering auth isolation, public verification (valid, invalid 404, revoked flag, history recording), QR data URL, own-certificate scoping, PDF download, idempotent issue, bulk generation, revoke/unrevoke flows with 422s, role isolation, template CRUD + in-use delete guard, and admin lists/summary. Verification responses expose only holder name, course title, issue date and template name — no PII beyond that. Frontend: `src/pages/certificates/*` (My Certificates with PDF download + QR modal, public Verify Certificate page at `/verify-certificate(/:code)` with live result card, admin Overview with summary stats + recent verifications, All Certificates with search/status filters + revoke/reinstate + bulk-generate dialog, Certificate Templates CRUD with placeholder preview help, Verification History with outcome filter), `src/types/certificates.ts`, `src/lib/certificatesApi.ts`, `src/hooks/useCertificates.ts`, routes `/certificates`, `/verify-certificate(/:code)`, `/admin/certificates/*` with role guards, sidebar Certificates section, and a production build that passes `tsc --noEmit` cleanly.

```text
Implement PHASE 15: Certificate Management.

Features:

Certificate templates
Certificate numbers
QR codes
Digital verification
Digital signatures
Bulk generation
PDF generation
Email delivery
Certificate revocation
Verification history

Every certificate must have a unique verification identifier.

Create a public certificate verification page.

Verification must not expose unnecessary personal information.

Implement tests.
```

---

# 22. PHASE 16 — ANALYTICS

**Status: Implemented (backend + API + tests green; frontend UI added and wired).** New `App\Services\AnalyticsService` provides nine cached dashboard sections (5-minute `Cache::remember` keyed by section + filters) with date (`from`/`to`) and branch filters applied as query scopes, plus a driver-aware month expression so the same queries run on both SQLite (dev/test) and MySQL 8 (prod): overview KPIs (students, active students, revenue, outstanding fees, enrollments, completion rate, attendance rate, active competitions, total courses), enrollment trends (monthly, by status, by grade), revenue (monthly collections, by payment method, outstanding by invoice status), attendance (overall rate, daily rate series, by status), course completion (rate, top 10 courses by enrollments with completion), teacher performance (courses/enrollments/completed per instructor), competition participation (per-competition teams/participants, by type, by status), branch performance (students/active/revenue/attendance rate per branch), and student progress distribution (0-25/26-50/51-75/76-99/100% buckets with average). `App\Http\Controllers\Api\AnalyticsDashboardController` exposes `GET /api/admin/analytics/{filter-options,overview,enrollments,revenue,attendance,courses,teachers,competitions,branches,progress}` under `role:admin|super_admin`, with a new `analytics` permission group (`view_analytics`/`export_analytics`) granted to admins via `Permission::all()`. `tests/Feature/AnalyticsTest.php` (15 tests, 57 assertions) covers auth isolation (401s), student access denial (403), every section's shape and values, branch and date filtering, filter options, and caching. Frontend: reusable chart components under `src/components/charts` (`ChartCard`, `BarChartCard`, `LineChartCard`, `PieChartCard` on recharts, already a dependency), `src/types/analytics.ts`, `src/lib/analyticsApi.ts`, `src/hooks/useAnalytics.ts`, and `src/pages/analytics/AnalyticsDashboardPage.tsx` with date/branch filter bar, KPI stat cards, and nine tabs (Overview, Enrollments, Revenue, Attendance, Courses, Teachers, Competitions, Branches, Progress) rendering the charts and breakdown tables; route `/analytics` (admin/super_admin/manager) in `src/router/routes.ts`, sidebar entry replaces the old Reports placeholder (the previous hardcoded-data ReportsPage remains at `/reports`), and the production build passes `tsc --noEmit` cleanly.

```text
Implement PHASE 16: Analytics Dashboard.

Create dashboards for:

Student enrollment
Revenue
Outstanding fees
Attendance
Course completion
Teacher performance
Competition participation
Popular courses
Branch performance
Student progress

Use reusable chart components.

Implement date filtering.

Implement branch filtering.

Implement role-based access.

Optimize expensive queries.

Use caching where appropriate.

Do not calculate large analytics datasets inefficiently on every request.
```

---

# 23. PHASE 17 — AI PLATFORM

```text
Implement PHASE 17: Coder's Hero AI Platform.

Create specialized AI assistants:

Student Tutor
Teacher Assistant
Parent Assistant
Admin Assistant
Coding Mentor
Robotics Coach

Capabilities:

Explain concepts
Answer questions
Generate quizzes
Suggest projects
Debug code
Generate lesson plans
Recommend next lessons
Summarize student performance

Requirements:

- OpenAI API integration
- configurable models
- conversation history
- usage tracking
- token/cost tracking
- rate limiting
- role-based access
- prompt templates
- safety controls

Never expose API keys to the frontend.

Create an abstraction layer so AI providers can be changed later.
```

### Phase 17 — Status: ✅ IMPLEMENTED

**Backend**
- `config/ai.php` — provider, models, rate limits, cost-per-token settings
- 5 migrations (`ai_assistants`, `ai_prompt_templates`, `ai_conversations`, `ai_messages`, `ai_usage_logs`)
- 5 models: `AiAssistant`, `AiPromptTemplate`, `AiConversation`, `AiMessage`, `AiUsageLog`
- Provider abstraction: `AiProvider` contract + `AiProviderResponse` DTO + `OpenAiProvider` + `AiProviderManager` (pluggable, so providers can be swapped later)
- `AiPlatformService` — chat with conversation history, prompt-template system messages, token/cost tracking, per-user daily message rate limit, usage logging, safety truncation; API keys stay server-side only
- Controllers: `AiPlatformController` (user: assistants, conversations, chat, my usage) and `AiAdminController` (admin: assistant CRUD, template CRUD, usage overview) under `/api/lms/ai/*` and `/api/admin/ai/*` (admin guarded by `role:admin|super_admin`)
- `ai` permission group (`use_ai_assistants`, `manage_ai_platform`, `view_ai_usage`) — `use_ai_assistants` granted to students/instructors/teachers/employees
- `AiPlatformSeeder` — 6 specialized assistants (Student Tutor, Teacher Assistant, Parent Assistant, Admin Assistant, Coding Mentor, Robotics Coach) + prompt templates
- Tests: `AiPlatformTest` — 15 passed, covering auth isolation, permission denial, assistant listing, conversation CRUD, chat, template resolution, usage, admin management

**Frontend** (`tsc --noEmit` clean, production build passes)
- `AiPlatformPage` at `/ai` — assistant picker, chat with history, capability tools
- `AiUsagePage` — personal token/cost/usage breakdown
- `AiAdminPage` — assistants, prompt templates, and usage overview tabs
- `types/ai.ts`, `lib/aiApi.ts`, `hooks/useAi.ts`, routes + sidebar section

**Verification**: `AiPlatformTest` 15/15 + `AnalyticsTest` 15/15 + `CertificateTest` 23/23 regression runs all green; frontend typecheck + build pass.

---

# 24. PHASE 18 — NOTIFICATIONS & COMMUNICATION

```text
Implement PHASE 18: Notifications.

Channels:

Email
SMS
Push Notifications
In-app notifications

Integrations:

Africa's Talking
SMTP
Firebase Cloud Messaging

Create notification preferences.

Support:

Attendance alerts
Fee reminders
Assignment notifications
Exam notifications
Competition notifications
Certificate notifications
System notifications

Use queues for notification delivery.

Track delivery status.

Implement retry handling.
```

---

# 25. PHASE 19 — MOBILE APPLICATIONS

Build Flutter applications.

## Student

- Dashboard
- Courses
- Assignments
- Attendance
- Coding Lab
- AI Tutor
- Certificates
- Notifications

## Parent

- Children
- Attendance
- Fees
- Receipts
- Reports
- Notifications
- Messaging

## Teacher

- Classes
- Attendance
- Assignments
- Grades
- Timetable
- Notifications

## Admin

- Dashboard
- Students
- Teachers
- Finance
- Reports
- Notifications

## OpenCode Prompt

```text
Implement PHASE 19: Flutter Mobile Applications.

Create a shared Flutter architecture supporting:

Student
Parent
Teacher
Administrator

Connect to the Laravel REST API.

Implement:

authentication
secure token handling
role-based navigation
push notifications
offline caching
API error handling
file uploads
image uploads
attendance
assignments
payments
messaging
profiles

Use reusable widgets and services.

Do not duplicate business logic unnecessarily.

The Laravel API remains the source of truth.

Implement secure authentication and logout.

Create Android build configuration.

Document development and production build procedures.
```

---

# 26. PHASE 20 — TESTING

No module should be considered production-ready without testing.

Implement:

```text
Unit Tests
Feature Tests
API Tests
Authorization Tests
Integration Tests
Frontend Tests
Mobile Tests
Security Tests
Performance Tests
UAT
```

## OpenCode Prompt

```text
Perform PHASE 20: Full System Testing.

Inspect the entire Coder's Hero platform.

Find:

- broken routes
- missing permissions
- SQL errors
- N+1 queries
- validation problems
- authorization vulnerabilities
- broken API responses
- frontend errors
- missing loading states
- missing error states
- mobile responsiveness problems
- security problems

Run the full test suite.

Do not simply report failures.

Fix the failures.

Re-run tests.

Continue until the application is stable.

Produce a TESTING_REPORT.md documenting:

tests executed
failures found
fixes applied
remaining risks
recommendations
```

---

# 27. PHASE 21 — SECURITY AUDIT

```text
Perform PHASE 21: Security Audit.

Audit:

Authentication
Authorization
CSRF
XSS
SQL Injection
Mass Assignment
IDOR
File Uploads
API Rate Limiting
Session Management
Password Security
Secrets
Payment callbacks
Webhooks
Storage
Database access
Logging
Error disclosure

Pay special attention to:

student data
parent data
financial information
HR information
payment information
uploaded files
AI conversations

Fix vulnerabilities discovered.

Do not merely provide recommendations.

Implement the fixes.

Generate SECURITY_AUDIT.md.
```

---

# 28. PHASE 22 — PERFORMANCE

```text
Perform PHASE 22: Performance Optimization.

Inspect:

database queries
indexes
N+1 queries
API response times
frontend bundle
images
file loading
caching
Redis
queues
analytics queries

Implement appropriate:

database indexes
eager loading
caching
pagination
queue processing
lazy loading
code splitting

Do not optimize blindly.

Measure before and after where possible.

Generate PERFORMANCE_REPORT.md.
```

---

# 29. PHASE 23 — PRODUCTION DEPLOYMENT

Target environment:

```text
Ubuntu
Nginx
PHP-FPM
MySQL
Redis
Supervisor
SSL
Cloudflare
GitHub Actions
```

## OpenCode Prompt

```text
Implement PHASE 23: Production Deployment.

Prepare Coder's Hero for production deployment.

Configure:

Ubuntu
Nginx
PHP-FPM
MySQL
Redis
Supervisor
SSL
Cloudflare
GitHub Actions

Implement:

automated deployment
database migrations
queue workers
scheduled tasks
backups
logging
monitoring
health checks
rollback strategy

Never place production credentials in Git.

Create:

DEPLOYMENT.md
BACKUP.md
OPERATIONS.md
SECURITY.md

Document all production procedures.
```

---

# 30. DEFINITION OF DONE

A phase is ONLY complete when:

- [ ] Requirements implemented
- [ ] Database migrations completed
- [ ] Models implemented
- [ ] Relationships implemented
- [ ] Services implemented
- [ ] Controllers implemented
- [ ] Policies implemented
- [ ] API endpoints implemented
- [ ] Frontend implemented
- [ ] Validation implemented
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Empty states implemented
- [ ] Authorization tested
- [ ] Automated tests written
- [ ] Tests passing
- [ ] No critical console errors
- [ ] No obvious security vulnerabilities
- [ ] Documentation updated
- [ ] Git commit created

---

# 31. GIT WORKFLOW

Use:

```text
main
develop
feature/*
bugfix/*
hotfix/*
```

Example:

```text
feature/student-management
feature/lms
feature/finance
feature/coding-playground
```

Commit format:

```text
feat: add student admission module
fix: resolve attendance authorization
refactor: improve course service
test: add finance payment tests
docs: update deployment documentation
```

Never commit:

```text
.env
API keys
passwords
private certificates
production credentials
```

---

# 32. AI CODING RULES

OpenCode must follow these rules throughout the project:

1. Inspect before modifying.
2. Reuse existing code.
3. Do not duplicate functionality.
4. Do not delete working functionality without justification.
5. Never hard-code credentials.
6. Never trust frontend authorization.
7. Validate all input.
8. Use policies for authorization.
9. Use services for complex business logic.
10. Use database transactions for critical operations.
11. Use queues for slow operations.
12. Use pagination for large datasets.
13. Use indexes for frequently queried fields.
14. Protect uploaded files.
15. Log important administrative actions.
16. Write tests for new functionality.
17. Fix errors before moving to another phase.
18. Keep API responses consistent.
19. Maintain backward compatibility where practical.
20. Update documentation after major architectural changes.

---

# 33. FINAL SYSTEM STRUCTURE

When Version 1.0 is complete:

```text
CODER'S HERO
│
├── Public Website
│
├── ERP
│   ├── Students
│   ├── Parents
│   ├── Teachers
│   ├── Schools
│   ├── Branches
│   ├── Finance
│   ├── HR
│   ├── Inventory
│   └── Reports
│
├── LMS
│   ├── Courses
│   ├── Lessons
│   ├── Assignments
│   ├── Exams
│   ├── Progress
│   └── Certificates
│
├── Coding Platform
│   ├── Playground
│   ├── Challenges
│   ├── Auto Grading
│   └── Leaderboards
│
├── Robotics
│   ├── Equipment
│   ├── Projects
│   ├── Teams
│   └── Competitions
│
├── AI
│   ├── Student Tutor
│   ├── Teacher Assistant
│   ├── Parent Assistant
│   └── Admin Assistant
│
├── Digital Library
│
├── Competition Platform
│
├── Analytics
│
└── Mobile Applications
    ├── Student
    ├── Parent
    ├── Teacher
    └── Admin
```

---

# 34. IMPORTANT IMPLEMENTATION STRATEGY

**Do not paste all phase prompts into OpenCode at once.**

Use this workflow:

```text
Phase 0
   ↓
Review
   ↓
Test
   ↓
Commit
   ↓
Phase 1
   ↓
Review
   ↓
Test
   ↓
Commit
   ↓
Phase 2
   ↓
Review
   ↓
Test
   ↓
Commit
   ↓
...
   ↓
Production
```

At every stage, OpenCode should first inspect what already exists and then implement **only the current phase**.

This `IMPLEMENTATION.md` should be kept at the **root of the repository** and treated as the master implementation specification for the project.