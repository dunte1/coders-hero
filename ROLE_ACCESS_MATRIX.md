# Role Access Matrix

## Coder's Hero ERP & LMS

> Last updated: 2026-08-17
> Backend: Laravel 12 | Frontend: React 19
> Role source: `backend/database/seeders/RoleSeeder.php`
> Nav source: `frontend/src/config/navigation.ts`
> Route source: `frontend/src/router/routes.ts`

---

## 1. Overview

The system defines **15 roles** managed via Spatie Laravel Permission. Access is enforced at three layers:

| Layer | Mechanism | File |
|---|---|---|
| **Navigation** | Sidebar menu items filtered by `roles[]` per `NavEntry` | `frontend/src/config/navigation.ts` |
| **Frontend routes** | `ProtectedRoute` component checks `meta.roles` against authenticated user role | `frontend/src/router/routes.ts`, `frontend/src/router/index.tsx` |
| **Backend API** | Laravel `role:` middleware on route groups | `backend/routes/api.php` |

The `ProtectedRoute` component (`frontend/src/components/features/auth/ProtectedRoute.tsx:12`) redirects unauthenticated users to `/login` and users without a matching role to `/dashboard`.

---

## 2. Role Definitions

| # | Role name | Display name | Description |
|---|---|---|---|
| 1 | `super_admin` | Super Admin | Full system access with all permissions. |
| 2 | `admin` | Administrator | System administrator with broad access. |
| 3 | `director` | Director | School director with cross-branch oversight and reporting access. |
| 4 | `branch_manager` | Branch Manager | Branch manager with operational access scoped to their branch. |
| 5 | `school_admin` | School Admin | School-level administrator with broad academic and operational access. |
| 6 | `teacher` | Teacher | Teacher who manages classes, assignments, exams and grades. |
| 7 | `instructor` | Instructor | Course instructor who can manage courses and quizzes. |
| 8 | `employee` | Employee | Company employee with standard access. |
| 9 | `student` | Student | Student who can enroll in courses. |
| 10 | `parent` | Parent | Parent or guardian with access to the Parent Portal. |
| 11 | `judge` | Judge | External or internal judge who scores competition teams. |
| 12 | `hr_officer` | HR Officer | Human resources officer who manages employees, contracts, leave, attendance and payroll. |
| 13 | `inventory_officer` | Inventory Officer | Inventory officer who manages assets, stock items and locations. |
| 14 | `librarian` | Librarian | Librarian who manages the digital library, resources and borrowings. |
| 15 | `accountant` | Accountant | Accountant who manages finance, invoices, payments and budgets. |

---

## 3. Access Matrix

Access levels:

- **Full** -- Full CRUD access to the module (create, read, update, delete).
- **Limited** -- Read-only or access to a restricted subset of features within the module.
- **None** -- No access. Module is hidden from navigation and routes are blocked.

The following abbreviations are used in the table for compactness:

- SA = super_admin
- AD = admin
- DR = director
- BM = branch_manager
- SA_ = school_admin
- TE = teacher
- IN = instructor
- EM = employee
- ST = student
- PA = parent
- JU = judge
- HR = hr_officer
- IO = inventory_officer
- LI = librarian
- AC = accountant

### 3.1 Module-Level Access

| Module | SA | AD | DR | BM | SA_ | TE | IN | EM | ST | PA | JU | HR | IO | LI | AC |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Dashboard** | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full |
| **Organization (SIS)** | Full | Full | Full | Full | Full | None | None | None | None | None | None | None | None | None | None |
| **Students** | Full | Full | Full | Full | Full | None | None | None | None | None | None | None | None | None | None |
| **Parents** | None | None | None | None | None | None | None | None | None | Full | None | None | None | None | None |
| **Teachers** | Full | Full | Full | None | Full | Full | Full | None | None | None | None | None | None | None | None |
| **Academics** | Full | Full | Full | Full | Full | Full | Full | None | None | None | None | None | None | None | None |
| **Learning / LMS** | Full | Full | None | None | None | Full | Full | None | Full | Full | None | None | None | None | None |
| **Coding Lab** | Full | Full | None | None | None | Full | Full | None | Full | None | None | None | None | None | None |
| **Robotics Lab** | Full | Full | None | None | None | Full | Full | None | Full | None | None | None | None | None | None |
| **Competitions** | Full | Full | None | None | None | Full | Full | None | Full | None | Full | None | None | None | None |
| **Finance** | Full | Full | Full | None | None | None | None | None | None | None | None | None | None | None | Full |
| **Human Resources** | Full | Full | None | None | None | None | None | None | None | None | None | Full | None | None | None |
| **My HR** | Full | Full | None | None | None | None | None | Full | None | None | None | None | None | None | None |
| **Inventory** | Full | Full | None | None | None | None | None | None | None | None | None | None | Full | None | None |
| **Library** | Full | Full | None | None | None | Full | Full | Full | Full | Full | None | None | Full | Full | None |
| **Certificates** | Full | Full | None | None | None | Full | Full | Full | Full | None | None | None | None | None | None |
| **AI Platform** | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full |
| **Website / CMS** | Full | Full | None | None | None | None | None | None | None | None | None | None | None | None | None |
| **Communication** | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full |
| **Project Management** | Full | Full | None | None | None | None | None | Full | None | None | None | None | None | None | None |
| **Reports & Analytics** | Full | Full | Full | None | Full | None | None | None | None | None | None | None | None | None | None |
| **Administration** | Full | Full | None | None | None | None | None | None | None | None | None | None | None | None | None |
| **Settings** | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full |

### 3.2 Sub-Module Access (Navigation-Level Granularity)

Where a parent module has child items with distinct role arrays, the finer-grained access is listed below.

#### Library Sub-Items

| Sub-Item | SA | AD | DR | BM | SA_ | TE | IN | EM | ST | PA | JU | HR | IO | LI | AC |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Catalog | Full | Full | -- | -- | -- | Full | Full | Full | Full | Full | -- | -- | -- | Full | -- |
| My Library | Full | Full | -- | -- | -- | Full | Full | Full | Full | Full | -- | -- | -- | Full | -- |
| Overview (admin) | Full | Full | -- | -- | -- | None | None | None | None | None | -- | -- | -- | Full | -- |
| Resources (admin) | Full | Full | -- | -- | -- | None | None | None | None | None | -- | -- | -- | Full | -- |
| Borrowings (admin) | Full | Full | -- | -- | -- | None | None | None | None | None | -- | -- | -- | Full | -- |
| Reservations (admin) | Full | Full | -- | -- | -- | None | None | None | None | None | -- | -- | -- | Full | -- |
| Categories (admin) | Full | Full | -- | -- | -- | None | None | None | None | None | -- | -- | -- | Full | -- |
| Authors (admin) | Full | Full | -- | -- | -- | None | None | None | None | None | -- | -- | -- | Full | -- |

#### Certificates Sub-Items

| Sub-Item | SA | AD | TE | IN | ST | EM |
|---|---|---|---|---|---|---|
| My Certificates | Full | Full | Full | Full | Full | Full |
| Overview (admin) | Full | Full | None | None | None | None |
| All Certificates | Full | Full | None | None | None | None |
| Templates | Full | Full | None | None | None | None |
| Verifications | Full | Full | None | None | None | None |

#### AI Platform Sub-Items

| Sub-Item | All 15 Roles |
|---|---|
| AI Dashboard | Full |
| My Usage | Full |
| Administration | Limited (admin, super_admin only) |

#### Communication Sub-Items

| Sub-Item | All 15 Roles |
|---|---|
| Inbox | Full |
| Notification Preferences | Full |
| Announcements | Full |
| Messages | Full |
| Administration | Limited (admin, super_admin only) |
| Templates | Limited (admin, super_admin only) |

#### Finance Sub-Items

| Sub-Item | SA | AD | DR | ST | PA | AC |
|---|---|---|---|---|---|---|
| Dashboard | Full | Full | Full | None | None | Full |
| Fee Structures | Full | Full | Full | None | None | Full |
| Invoices | Full | Full | Full | None | None | Full |
| Payments | Full | Full | Full | None | None | Full |
| Expenses | Full | Full | Full | None | None | Full |
| Budgets | Full | Full | Full | None | None | Full |
| M-Pesa | Full | Full | Full | None | None | Full |
| Outstanding Fees | Full | Full | Full | None | None | Full |
| Transactions | Full | Full | Full | None | None | Full |
| My Finance | None | None | None | Full | Full | None |

#### Settings Sub-Items

| Sub-Item | SA | AD | DR | BM | SA_ | All Others |
|---|---|---|---|---|---|---|
| General | Full | Full | None | None | None | None |
| Branding | Full | Full | None | None | None | None |
| Localization | Full | Full | None | None | None | None |
| Academic | Full | Full | None | None | None | None |
| Notifications | Full | Full | None | None | None | None |
| Integrations | Full | Full | None | None | None | None |
| Security | Full | Full | None | None | None | None |
| Storage | Full | Full | None | None | None | None |
| Backup | Full | Full | None | None | None | None |
| System | Full | Full | None | None | None | None |
| Profile | Full | Full | Full | Full | Full | Full |
| Two-Factor Auth | Full | Full | Full | Full | Full | Full |

---

## 4. Backend Route Protection

Backend API routes are protected using Laravel's `role:` middleware via Spatie Permission. The middleware is applied to route groups in `backend/routes/api.php`.

### Middleware Reference

| Route Group | Prefix | Middleware | Allowed Roles |
|---|---|---|---|
| Administration | `/admin` | `role:admin\|super_admin` | admin, super_admin |
| Notifications Admin | `/admin` | `role:admin\|super_admin` | admin, super_admin |
| Students (SIS) | `/students` | `role:admin\|super_admin` | admin, super_admin |
| Guardians | `/guardians` | `role:admin\|super_admin` | admin, super_admin |
| Admissions | `/admissions` | `role:admin\|super_admin` | admin, super_admin |
| Attendance | `/attendance` | `role:admin\|super_admin` | admin, super_admin |
| Instructor | `/instructor` | `role:instructor\|admin` | instructor, admin |
| Employee self-service | `/employee` | `role:employee\|admin` | employee, admin |
| Parent portal | `/parent` | `role:parent\|admin\|super_admin` | parent, admin, super_admin |
| Chat / Messages | `/chat` | `role:parent\|instructor\|admin\|super_admin` | parent, instructor, admin, super_admin |
| Student records (v2) | `/students` | `role:admin\|super_admin` | admin, super_admin |
| Appointments | `/appointments` | `role:admin\|super_admin` | admin, super_admin |
| Teacher portal | `/teacher` | `role:teacher\|instructor\|admin\|super_admin` | teacher, instructor, admin, super_admin |
| Competitions (manage) | *(nested)* | `role:teacher\|instructor\|admin\|super_admin` | teacher, instructor, admin, super_admin |
| Competitions (scoring) | *(nested)* | `role:teacher\|instructor\|admin\|super_admin` | teacher, instructor, admin, super_admin |
| Finance | `/finance` | `role:admin\|super_admin` | admin, super_admin |
| HR | `/hr` | `role:admin\|super_admin\|hr_officer` | admin, super_admin, hr_officer |
| My HR | `/my/hr` | `role:employee\|admin\|super_admin` | employee, admin, super_admin |
| Inventory | `/inventory` | `role:admin\|super_admin\|inventory_officer` | admin, super_admin, inventory_officer |
| Library | `/library` | `role:admin\|super_admin\|librarian` | admin, super_admin, librarian |

### Middleware Pattern

```php
// Example from backend/routes/api.php
Route::middleware('role:admin|super_admin')->prefix('students')->group(function () {
    // All student CRUD routes here
});

Route::middleware('role:teacher|instructor|admin|super_admin')->prefix('teacher')->group(function () {
    // Teacher portal routes
});

Route::middleware('role:admin|super_admin|hr_officer')->prefix('hr')->group(function () {
    // HR management routes
});
```

Roles are pipe-separated (`|`). The middleware checks if the authenticated user has **any** of the listed roles. If not, a 403 response is returned.

---

## 5. Frontend Route Protection

### Mechanism

1. Each route in `frontend/src/router/routes.ts` can optionally define `meta.roles` (string array).
2. The `AppRouter` (`frontend/src/router/index.tsx:61`) wraps every non-public route in `<ProtectedRoute roles={route.meta?.roles}>`.
3. `ProtectedRoute` (`frontend/src/components/features/auth/ProtectedRoute.tsx:12`):
   - Redirects to `/login` if not authenticated.
   - Redirects to `/two-factor/challenge` if 2FA is required.
   - If `roles` is provided and the user's role is not in the array, redirects to `/dashboard`.
   - If no `roles` are defined on a route, **any authenticated user** can access it.

### Route Role Assignments (from `routes.ts`)

| Route | meta.roles |
|---|---|
| `/dashboard` | *(none -- all authenticated users)* |
| `/courses` | *(none)* |
| `/courses/create` | admin, instructor |
| `/courses/:id/edit` | admin, instructor |
| `/users`, `/users/create`, `/users/:id`, `/users/:id/edit` | admin |
| `/tasks`, `/projects` | *(none)* |
| `/projects/create`, `/projects/:id/edit` | admin, manager |
| `/employees`, `/employees/create`, `/employees/:id`, `/employees/:id/edit` | admin, manager |
| `/quizzes`, `/quizzes/:id/take` | *(none)* |
| `/certificates` | *(none)* |
| `/admin/certificates`, `/admin/certificates/all`, `/admin/certificates/templates`, `/admin/certificates/verifications` | admin, super_admin |
| `/competitions` | *(none)* |
| `/competitions/create`, `/competitions/:id/manage` | admin, super_admin, teacher, instructor |
| `/competitions/:id/judge` | judge |
| `/competitions/:id/leaderboard` | *(none)* |
| `/announcements`, `/notifications`, `/notifications/preferences` | *(none)* |
| `/admin/notifications`, `/admin/notifications/templates` | admin, super_admin |
| `/profile` | *(none)* |
| `/settings` | *(none)* |
| `/settings/roles`, `/settings/roles/:id`, `/settings/permissions` | admin, super_admin |
| `/ai`, `/ai/usage` | *(none)* |
| `/admin/ai` | admin, super_admin |
| `/analytics` | admin, super_admin, manager |
| `/reports` | admin, manager |
| `/cms/*` (all CMS routes) | admin, super_admin |
| `/students`, `/students/overview`, `/students/create`, `/students/:id`, `/students/:id/edit`, `/students/:id/id-card` | admin, super_admin |
| `/admissions`, `/admissions/new`, `/admissions/:id/edit` | admin, super_admin |
| `/guardians`, `/guardians/new`, `/guardians/:id/edit` | admin, super_admin |
| `/attendance`, `/attendance/report` | admin, super_admin |
| `/parent/*` (all parent portal routes) | parent |
| `/teacher`, `/teacher/classes`, `/teacher/classes/:id`, `/teacher/assignments`, `/teacher/assignments/:id`, `/teacher/exams`, `/teacher/exams/:id`, `/teacher/gradebook`, `/teacher/lesson-notes`, `/teacher/calendar`, `/teacher/analytics`, `/teacher/reports`, `/teacher/reports/classes/:classId/students/:studentId` | teacher, instructor, admin, super_admin |
| `/lms/*` (all LMS routes) | *(none)* |
| `/chat` | parent, teacher, admin, super_admin |
| `/appointments` | admin, super_admin |
| `/hr/*` (all HR routes) | admin, super_admin, hr_officer |
| `/my/hr`, `/my/hr/leaves`, `/my/hr/payslips`, `/my/hr/payslips/:id` | employee, admin, super_admin |
| `/library`, `/library/resources/:id`, `/library/mine` | *(none)* |
| `/library/admin/*` (admin routes) | admin, super_admin, librarian |
| `/inventory/*` (all routes) | admin, super_admin, inventory_officer |
| `/finance`, `/finance/invoices`, `/finance/payments`, `/finance/expenses`, `/finance/budgets`, `/finance/mpesa`, `/finance/outstanding`, `/finance/transactions`, `/finance/fee-structures` | admin, super_admin |
| `/finance/mine` | student, parent |
| `/academics/enrollments` | admin, super_admin |
| `/robotics/dashboard`, `/robotics/teams`, `/robotics/projects`, `/robotics/reservations` | admin, super_admin, instructor, teacher, student |
| `/robotics/equipment`, `/robotics/equipment/:id`, `/robotics/maintenance` | admin, super_admin, instructor, teacher |
| `/settings/general`, `/settings/branding`, `/settings/localization`, `/settings/academic`, `/settings/notifications`, `/settings/integrations`, `/settings/security`, `/settings/storage`, `/settings/backup`, `/settings/system` | admin, super_admin |
| `/admin`, `/admin/activity-logs`, `/admin/audit-logs`, `/admin/system-health`, `/admin/backups`, `/admin/system-logs` | admin, super_admin |

---

## 6. New Roles Added

The following four roles were added after the initial role set (super_admin, admin, instructor, teacher, employee, student, parent, judge, hr_officer, inventory_officer, librarian):

### 6.1 Director

**Intended purpose:** School director with cross-branch oversight and reporting access.

| Module | Nav Access | Route Meta | Backend Middleware |
|---|---|---|---|
| Dashboard | Yes | No roles defined | N/A |
| Organization (SIS) | Yes | Gated to `admin, super_admin` only | `role:admin\|super_admin` |
| Students | Yes | Gated to `admin, super_admin` only | `role:admin\|super_admin` |
| Teachers | Yes | Gated to `teacher, instructor, admin, super_admin` | `role:teacher\|instructor\|admin\|super_admin` |
| Academics | Yes | Gated to `teacher, instructor, admin, super_admin` | `role:teacher\|instructor\|admin\|super_admin` |
| Finance | Yes | Gated to `admin, super_admin` only | `role:admin\|super_admin` |
| Reports & Analytics | Yes | Gated to `admin, super_admin, manager` | N/A |
| AI Platform | Yes | No roles defined | N/A |
| Communication | Yes | No roles defined | N/A |
| Settings (parent) | Yes | No roles defined | N/A |

### 6.2 Branch Manager

**Intended purpose:** Branch manager with operational access scoped to their branch.

| Module | Nav Access | Route Meta | Backend Middleware |
|---|---|---|---|
| Dashboard | Yes | No roles defined | N/A |
| Organization (SIS) | Yes | Gated to `admin, super_admin` only | `role:admin\|super_admin` |
| Students | Yes | Gated to `admin, super_admin` only | `role:admin\|super_admin` |
| Academics | Yes | Gated to `teacher, instructor, admin, super_admin` | `role:teacher\|instructor\|admin\|super_admin` |
| AI Platform | Yes | No roles defined | N/A |
| Communication | Yes | No roles defined | N/A |
| Settings (parent) | Yes | No roles defined | N/A |

### 6.3 School Admin

**Intended purpose:** School-level administrator with broad academic and operational access.

| Module | Nav Access | Route Meta | Backend Middleware |
|---|---|---|---|
| Dashboard | Yes | No roles defined | N/A |
| Organization (SIS) | Yes | Gated to `admin, super_admin` only | `role:admin\|super_admin` |
| Students | Yes | Gated to `admin, super_admin` only | `role:admin\|super_admin` |
| Teachers | Yes | Gated to `teacher, instructor, admin, super_admin` | `role:teacher\|instructor\|admin\|super_admin` |
| Academics | Yes | Gated to `teacher, instructor, admin, super_admin` | `role:teacher\|instructor\|admin\|super_admin` |
| Reports & Analytics | Yes | Gated to `admin, super_admin, manager` | N/A |
| AI Platform | Yes | No roles defined | N/A |
| Communication | Yes | No roles defined | N/A |
| Settings (parent) | Yes | No roles defined | N/A |

### 6.4 Accountant

**Intended purpose:** Accountant who manages finance, invoices, payments and budgets.

| Module | Nav Access | Route Meta | Backend Middleware |
|---|---|---|---|
| Dashboard | Yes | No roles defined | N/A |
| Finance | Yes | Gated to `admin, super_admin` only | `role:admin\|super_admin` |
| AI Platform | Yes | No roles defined | N/A |
| Communication | Yes | No roles defined | N/A |
| Settings (parent) | Yes | No roles defined | N/A |

---

## 7. Known Gaps

The following gaps exist between navigation visibility and actual route/backend enforcement for the new roles (director, branch_manager, school_admin, accountant).

### 7.1 Navigation vs. Route Meta Mismatches

These modules are **visible in the sidebar** for a role, but the **route `meta.roles` does not include** that role, causing a redirect to `/dashboard` on navigation.

| Module / Route | Nav Shows For | Route Meta Allows | Gap |
|---|---|---|---|
| `/teacher/*` (Teacher portal) | director, school_admin | teacher, instructor, admin, super_admin | director, school_admin cannot access |
| `/teacher/classes` (also under Academics) | director, branch_manager, school_admin, teacher, instructor | teacher, instructor, admin, super_admin | director, branch_manager, school_admin cannot access |
| `/students` and sub-routes | director, branch_manager, school_admin | admin, super_admin | director, branch_manager, school_admin cannot access |
| `/admissions/*` | director, branch_manager, school_admin | admin, super_admin | director, branch_manager, school_admin cannot access |
| `/guardians/*` | director, branch_manager, school_admin | admin, super_admin | director, branch_manager, school_admin cannot access |
| `/attendance`, `/attendance/report` | director, branch_manager, school_admin | admin, super_admin | director, branch_manager, school_admin cannot access |
| `/finance/*` (except `/finance/mine`) | director, accountant | admin, super_admin | director, accountant cannot access |
| `/analytics` | director, school_admin | admin, super_admin, manager | director, school_admin cannot access |
| `/reports` | director, school_admin | admin, manager | director, school_admin cannot access |
| `/academics/enrollments` | director, branch_manager, school_admin, teacher, instructor | admin, super_admin | director, branch_manager, school_admin, teacher, instructor cannot access |

### 7.2 Navigation vs. Backend Middleware Mismatches

These modules are **visible in the sidebar** and **route meta allows** the role, but the **backend API middleware blocks** them.

| Module / API Prefix | Nav + Route Allow | Backend Middleware | Gap |
|---|---|---|---|
| `/students` (SIS CRUD) | director, branch_manager, school_admin | `role:admin\|super_admin` | director, branch_manager, school_admin get 403 from API |
| `/finance` (all finance endpoints) | director, accountant | `role:admin\|super_admin` | director, accountant get 403 from API |
| `/teacher` (teacher API) | director, school_admin | `role:teacher\|instructor\|admin\|super_admin` | director, school_admin get 403 from API |

### 7.3 Route Meta Gaps for Existing Roles

| Issue | Detail |
|---|---|
| `/projects/create`, `/projects/:id/edit` | Route meta allows `admin, manager` but `manager` is not a defined role. Should be `admin, super_admin, employee`. |
| `/employees/*` | Route meta allows `admin, manager` but `manager` is not a defined role. Should include `hr_officer`. |
| `/analytics` | Route meta allows `admin, super_admin, manager` but `manager` is not a defined role. Should be `admin, super_admin, director, school_admin`. |
| `/reports` | Route meta allows `admin, manager` but `manager` is not a defined role. Should be `admin, super_admin, director, school_admin`. |
| `/chat` | Route meta allows `parent, teacher, admin, super_admin`. Missing: `director, branch_manager, school_admin, instructor, employee, student, judge, hr_officer, inventory_officer, librarian, accountant` (all roles have nav access). |

### 7.4 Backend-Only Routes Without Frontend Parity

Some backend middleware-restricted route groups do not have corresponding `meta.roles` on the frontend routes, meaning any authenticated user could reach the page (but would get 403 from API calls).

| Backend Route | Middleware | Frontend Route | Frontend `meta.roles` |
|---|---|---|---|
| `/instructor/*` | `role:instructor\|admin` | *(no dedicated page)* | N/A |
| `/employee/*` | `role:employee\|admin` | *(no dedicated page)* | N/A |

---

## 8. Recommendations

### 8.1 Update Route `meta.roles` for New Roles

Add director, branch_manager, school_admin, and accountant to the appropriate route meta arrays to match their intended access:

| Route Group | Current `meta.roles` | Recommended `meta.roles` |
|---|---|---|
| `/teacher/*` | teacher, instructor, admin, super_admin | Add: director, school_admin |
| `/students/*` | admin, super_admin | Add: director, branch_manager, school_admin |
| `/admissions/*` | admin, super_admin | Add: director, branch_manager, school_admin |
| `/guardians/*` | admin, super_admin | Add: director, branch_manager, school_admin |
| `/attendance/*` | admin, super_admin | Add: director, branch_manager, school_admin |
| `/finance/*` | admin, super_admin | Add: director, accountant |
| `/analytics` | admin, super_admin, manager | Replace `manager` with: director, school_admin |
| `/reports` | admin, manager | Replace `manager` with: director, school_admin |
| `/academics/enrollments` | admin, super_admin | Add: director, branch_manager, school_admin, teacher, instructor |
| `/chat` | parent, teacher, admin, super_admin | Add: director, branch_manager, school_admin, instructor, employee, student, hr_officer, inventory_officer, librarian, accountant |
| `/projects/create`, `/projects/:id/edit` | admin, manager | Replace `manager` with: super_admin, employee |
| `/employees/*` | admin, manager | Replace `manager` with: super_admin, hr_officer |

### 8.2 Update Backend Middleware for New Roles

Extend backend middleware to match the intended access:

| Middleware Group | Current | Recommended |
|---|---|---|
| Students SIS | `role:admin\|super_admin` | Add `\|director\|branch_manager\|school_admin` |
| Finance | `role:admin\|super_admin` | Add `\|director\|accountant` |
| Teacher portal | `role:teacher\|instructor\|admin\|super_admin` | Add `\|director\|school_admin` |
| Chat | `role:parent\|instructor\|admin\|super_admin` | Add `\|director\|branch_manager\|school_admin\|teacher\|employee\|student\|judge\|hr_officer\|inventory_officer\|librarian\|accountant` |

### 8.3 Add Granular Permissions Per Module

The current system uses role-based access only. Consider adding Spatie Permissions for finer-grained control:

| Permission Category | Example Permissions |
|---|---|
| Finance | `finance.view`, `finance.create`, `finance.export` |
| Students | `students.view`, `students.create`, `students.enroll` |
| HR | `hr.view_employees`, `hr.manage_payroll`, `hr.approve_leave` |
| Library | `library.borrow`, `library.manage_resources` |
| Reports | `reports.view_own`, `reports.view_all`, `reports.export` |
| Settings | `settings.view`, `settings.edit_general`, `settings.edit_branding` |

This would allow roles like director to have `reports.view_all` while branch_manager gets `reports.view_own_branch`, without needing separate role definitions for every scope variation.

### 8.4 Resolve the `manager` Ghost Role

The route meta for `/projects/create`, `/projects/:id/edit`, `/employees/*`, `/analytics`, and `/reports` references a `manager` role that does not exist in `RoleSeeder.php`. This should be resolved by either:

1. Adding `manager` as a role in the seeder, or
2. Replacing `manager` with the appropriate existing roles (recommended: `super_admin`, `employee`, `hr_officer` depending on context).

### 8.5 Implement Branch Scoping

For branch_manager and director, consider adding a `branch_id` scope to backend queries so these roles only see data relevant to their branch (branch_manager) or all branches (director). This is a backend concern and does not affect the access matrix, but is critical for data isolation.
