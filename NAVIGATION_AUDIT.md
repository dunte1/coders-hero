# Navigation Audit — Coder's Hero ERP & LMS

**Generated:** 2026-08-17
**Scope:** `frontend/src/config/navigation.ts`, `frontend/src/router/routes.ts`, sidebar rendering components, role-based filtering hook
**Validation script:** `frontend/scripts/validate-navigation.mjs`

---

## 1. Executive Summary

| Metric | Value |
|---|---|
| Nav sections (top-level) | 23 |
| Nav items (leaf hrefs) | 129 |
| Registered routes | 206 |
| Orphan routes (no nav entry) | 57 |
| Nav items with broken links | 0 |
| Role groups defined | 14 |
| Total distinct roles | 15 |

All 129 navigation items resolve to a registered route. The 57 orphan routes are exclusively detail, edit, create, and parameterized sub-pages — expected behavior for pages linked from list views rather than the sidebar.

---

## 2. Architecture

### 2.1 Config-Driven Sidebar

The sidebar is entirely data-driven. A single array in `frontend/src/config/navigation.ts` defines every section, child item, icon, and role restriction. No sidebar markup is hand-coded per section.

**Key files:**

| File | Purpose |
|---|---|
| `src/config/navigation.ts` | Centralized nav config — `NavEntry[]` array, role group constants |
| `src/router/routes.ts` | All 206 route definitions with `React.lazy` code-splitting |
| `src/components/layout/Sidebar.tsx` | Renders sidebar shell, iterates `navigation` array from hook |
| `src/components/layout/SidebarGroup.tsx` | Collapsible group with active-state detection and chevron toggle |
| `src/components/layout/SidebarItem.tsx` | Individual nav link with icon and active highlight |
| `src/hooks/useNavigation.ts` | Filters nav entries by authenticated user's role and permissions |
| `scripts/validate-navigation.mjs` | CI-ready script — validates nav-to-route mapping, reports orphans |

### 2.2 Sidebar Rendering Flow

```
useNavigation() hook
  -> reads user.role.name from authStore
  -> calls filterEntries(navigation, role, permissions)
  -> returns filtered NavEntry[]

Sidebar.tsx
  -> calls useNavigation()
  -> maps entries: children? -> SidebarGroup : SidebarItem
  -> fixed 264px width, mobile overlay + hamburger toggle

SidebarGroup.tsx
  -> detects active state via pathname prefix matching
  -> useState for open/closed, defaults open if child is active
  -> collapsed mode: icon-only with hover popup
```

### 2.3 NavEntry Type

```typescript
interface NavEntry {
  label: string;
  href?: string;
  icon?: LucideIcon;
  roles?: NavRole[];
  permission?: string;
  children?: NavEntry[];
}
```

Groups without `href` are pure containers; items with `href` are navigable leaves. Some entries have both (e.g., Finance dashboard links to `/finance` and has children).

---

## 3. Nav Section Inventory

| # | Section | Nav Items | Role Restriction | Notes |
|---|---|---|---|---|
| 1 | Dashboard | 1 | COMMUNICATION_ROLES (all 15) | Standalone link, no children |
| 2 | Organization | 4 | SIS_ROLES | **PLACEHOLDER** — all 4 children route to `/students/overview` |
| 3 | Students | 8 | SIS_ROLES | Includes attendance, admissions, guardians, messages |
| 4 | Parents | 9 | `['parent']` | Dedicated parent portal |
| 5 | Teachers | 9 | TEACHER_ROLES | Classes, assignments, exams, gradebook, calendar, reports |
| 6 | Academics | 9 | ACADEMICS_ROLES | **Shares 6 routes with Teachers section** |
| 7 | Learning / LMS | 6 | LEARNER_ROLES | Courses, quizzes, forum, AI tutor, bookmarks |
| 8 | Coding Lab | 3 | CODING_ROLES | Playground, challenges, leaderboard |
| 9 | Robotics Lab | 6 | ROBOTICS_ROLES | Equipment, teams, projects, reservations, maintenance |
| 10 | Competitions | 3 | `['super_admin','admin','teacher','instructor','student','judge']` | Judge Scoring shares `/competitions` route |
| 11 | Finance | 10 | FINANCE_ROLES | "My Finance" child has nested `roles: ['student','parent']` |
| 12 | Human Resources | 9 | HR_ROLES | Employees, contracts, leave, payroll, performance, documents |
| 13 | My HR | 3 | `['employee','super_admin','admin']` | Self-service: overview, leave, payslips |
| 14 | Inventory | 6 | INVENTORY_ROLES | Assets, stock, maintenance, categories, locations |
| 15 | Library | 8 | 8 roles + LIBRARY_MANAGE_ROLES on admin sub-items | 2 public items + 6 librarian-only admin items |
| 16 | Certificates | 5 | 6 roles + CERT_MANAGE_ROLES on admin sub-items | 1 public item + 4 admin-only items |
| 17 | AI Platform | 3 | COMMUNICATION_ROLES | "Administration" child restricted to ADMIN_ROLES |
| 18 | Website / CMS | 10 | CMS_ROLES | Site content, services, programs, gallery, blog, FAQ, analytics |
| 19 | Communication | 6 | COMMUNICATION_ROLES | Inbox, preferences, announcements, messages; 2 admin-only items |
| 20 | Project Management | 2 | `['super_admin','admin','employee']` | Tasks and Projects |
| 21 | Reports & Analytics | 2 | `['super_admin','admin','director','school_admin']` | Executive dashboard and reports |
| 22 | Administration | 10 | ADMIN_ROLES | Users, roles, permissions, logs, health, backups |
| 23 | Settings | 12 | COMMUNICATION_ROLES | 10 admin-only config items + Profile + 2FA for all |
| | **Total** | **129** | | |

### Role Group Definitions

| Group Constant | Roles | Member Count |
|---|---|---|
| `ALL_ROLES` | super_admin, admin, director, branch_manager, school_admin, teacher, instructor, employee, student, parent, judge, hr_officer, inventory_officer, librarian, accountant | 15 |
| `STAFF_ROLES` | All except student, parent, judge | 12 |
| `ADMIN_ROLES` | super_admin, admin | 2 |
| `COMMUNICATION_ROLES` | All 15 roles (identical to ALL_ROLES) | 15 |
| `SIS_ROLES` | super_admin, admin, director, branch_manager, school_admin | 5 |
| `ACADEMICS_ROLES` | super_admin, admin, director, branch_manager, school_admin, teacher, instructor | 7 |
| `TEACHER_ROLES` | super_admin, admin, director, school_admin, teacher, instructor | 6 |
| `LEARNER_ROLES` | super_admin, admin, teacher, instructor, student, parent | 6 |
| `CODING_ROLES` | super_admin, admin, teacher, instructor, student | 5 |
| `ROBOTICS_ROLES` | super_admin, admin, teacher, instructor, student | 5 |
| `FINANCE_ROLES` | super_admin, admin, director, accountant | 4 |
| `HR_ROLES` | super_admin, admin, hr_officer | 3 |
| `INVENTORY_ROLES` | super_admin, admin, inventory_officer | 3 |
| `LIBRARY_MANAGE_ROLES` | super_admin, admin, librarian | 3 |
| `CMS_ROLES` | super_admin, admin | 2 |
| `CERT_MANAGE_ROLES` | super_admin, admin | 2 |

---

## 4. Validation Results

The validation script (`frontend/scripts/validate-navigation.mjs`) performs two checks:

1. **Forward check:** Every nav `href` must match a registered route (prefix match with dynamic segment support).
2. **Reverse check:** Every registered route should be referenced by at least one nav entry (orphan detection).

### 4.1 Forward Check — Nav Items to Routes

```
Routes found: 206
Nav items:    129

Nav items without matching routes: (none)
```

**Result: PASS — 0 broken links.**

### 4.2 Reverse Check — Orphan Routes

57 routes have no direct nav entry. All are categorized below.

#### Detail / Edit Pages (parameterized — 39 routes)

| Route | Parent List Page |
|---|---|
| `/courses/:id` | `/courses` |
| `/courses/:id/edit` | `/courses` |
| `/users/:id` | `/users` |
| `/users/:id/edit` | `/users` |
| `/tasks/:id` | `/tasks` |
| `/projects/:id` | `/projects` |
| `/projects/:id/edit` | `/projects` |
| `/employees/:id` | `/employees` |
| `/employees/:id/edit` | `/employees` |
| `/competitions/:id/manage` | `/competitions` |
| `/competitions/:id/judge` | `/competitions` |
| `/competitions/:id/leaderboard` | `/competitions` |
| `/announcements/:id` | `/announcements` |
| `/settings/roles/:id` | `/settings/roles` |
| `/students/:id/edit` | `/students` |
| `/students/:id/id-card` | `/students` |
| `/admissions/:id/edit` | `/admissions` |
| `/guardians/:id/edit` | `/guardians` |
| `/parent/report-cards/:id` | `/parent/report-cards` |
| `/parent/receipts/:id` | `/parent/receipts` |
| `/teacher/classes/:id` | `/teacher/classes` |
| `/teacher/assignments/:id` | `/teacher/assignments` |
| `/teacher/exams/:id` | `/teacher/exams` |
| `/teacher/reports/classes/:classId/students/:studentId` | `/teacher/reports` |
| `/lms/forum/threads/:id` | `/lms/forum` |
| `/lms/coding-exercises/:id` | `/lms/coding-exercises` |
| `/lms/courses/:id/player` | `/my-courses` or `/courses` |
| `/hr/employees/:id` | `/hr/employees` |
| `/hr/employees/:id/edit` | `/hr/employees` |
| `/hr/payrolls/:id` | `/hr/payrolls` |
| `/my/hr/payslips/:id` | `/my/hr/payslips` |
| `/library/resources/:id` | `/library` |
| `/inventory/assets/:id` | `/inventory/assets` |
| `/finance/invoices/:id` | `/finance/invoices` |
| `/finance/payments/:id` | `/finance/payments` |
| `/ai/conversations/:conversationId` | `/ai` |
| `/lms/ai-tutor/conversations/:conversationId` | `/lms/ai-tutor` |
| `/cms/programs/:id/edit` | `/cms/programs` |
| `/cms/blog/:id/edit` | `/cms/blog` |

#### Create Pages (6 routes)

| Route | Parent List Page |
|---|---|
| `/courses/create` | `/courses` |
| `/users/create` | `/users` |
| `/projects/create` | `/projects` |
| `/employees/create` | `/employees` |
| `/competitions/create` | `/competitions` |
| `/students/create` | `/students` |
| `/admissions/new` | `/admissions` |
| `/guardians/new` | `/guardians` |
| `/cms/programs/new` | `/cms/programs` |
| `/cms/blog/new` | `/cms/blog` |
| `/finance/invoices/new` | `/finance/invoices` |

#### Quiz / Take Pages (1 route)

| Route | Parent List Page |
|---|---|
| `/quizzes/:id/take` | `/quizzes` |

#### Standalone / Public Routes (7 routes)

| Route | Purpose |
|---|---|
| `/` | Marketing home page (public) |
| `/coding` | Public coding landing page |
| `/settings` | Generic settings redirect |
| `/verify-certificate` | Public certificate verification |
| `/verify-certificate/:code` | Public certificate verification with code |
| `*` | 404 catch-all |

**All 57 orphan routes are expected.** Detail, edit, and create pages are accessed via links within their parent list views, not from the sidebar navigation.

---

## 5. Known Issues

### 5.1 Organization Section — Placeholder Routes

All 4 children of the Organization section currently route to `/students/overview`:

| Child | Actual href | Expected href |
|---|---|---|
| Overview | `/students/overview` | `/students/overview` (correct) |
| Branches | `/students/overview` | `/organization/branches` (not implemented) |
| Partner Schools | `/students/overview` | `/organization/partner-schools` (not implemented) |
| Academic Years | `/students/overview` | `/organization/academic-years` (not implemented) |

The source comment confirms: "Phase 3: Branch & Partner School management not yet implemented." Users clicking Branches, Partner Schools, or Academic Years will be silently redirected to the student overview.

### 5.2 Shared Routes Across Sections

Several nav items in different sections point to the same route. This is intentional for role-based access (different sections visible to different roles) but creates duplicate sidebar entries for users with broad permissions.

| Route | Nav Items Sharing It | Sections |
|---|---|---|
| `/teacher/classes` | "Classes" (Teachers), "Classes" (Academics) | Teachers, Academics |
| `/teacher/assignments` | "Assignments" (Teachers), "Assignments" (Academics) | Teachers, Academics |
| `/teacher/exams` | "Exams" (Teachers), "Exams" (Academics) | Teachers, Academics |
| `/teacher/gradebook` | "Gradebook" (Teachers), "Gradebook" (Academics) | Teachers, Academics |
| `/teacher/lesson-notes` | "Lesson Notes" (Teachers), "Lesson Notes" (Academics) | Teachers, Academics |
| `/teacher/calendar` | "Calendar" (Teachers), "Timetable" (Academics) | Teachers, Academics |
| `/courses` | "Courses" (Learning/LMS), "Courses" (Academics) | Learning/LMS, Academics |
| `/reports` | "Academic Reports" (Academics), "Reports" (Reports & Analytics) | Academics, Reports & Analytics |
| `/competitions` | "Competitions" (Competitions), "Judge Scoring" (Competitions) | Competitions (both children) |
| `/chat` | "Messages" (Students), "Messages" (Parents), "Messages" (Communication) | Students, Parents, Communication |

A super_admin or admin user with all role groups visible would see these duplicated items across multiple sidebar sections.

### 5.3 Settings Section — Mixed Role Scope

The Settings top-level section uses `COMMUNICATION_ROLES` (all 15 roles), but 10 of its 12 children are restricted to `ADMIN_ROLES`. For non-admin users, the Settings section expands but only shows 2 items (Profile and Two-Factor Authentication). This is functional but may feel sparse.

### 5.4 Library and Certificate Admin Sub-Items

The Library and Certificates sections have a split structure: a few items are visible to broader roles (students, parents, etc.), while admin/management items are nested inside the same section with `LIBRARY_MANAGE_ROLES` or `CERT_MANAGE_ROLES`. For non-admin users, expanding these sections shows only 2-3 items while admins see 8-5 respectively.

---

## 6. Role-Based Filtering

### 6.1 How Filtering Works

The `useNavigation` hook (`src/hooks/useNavigation.ts`) reads the authenticated user's role name and permission codenames, then runs `filterEntries()` recursively over the navigation tree.

**Filtering rules:**

1. If the user has no role, return empty array.
2. For each entry, if `entry.roles` is defined and the user's role is not in the array, the entry is excluded — **unless** the user is `admin` or `super_admin`.
3. If `entry.permission` is defined and the user lacks that permission, the entry is excluded — **unless** the user is `admin` or `super_admin`.
4. For groups with children, filtering recurses into children. A group with zero visible children and no `href` of its own is removed entirely.
5. `admin` and `super_admin` bypass both role and permission checks — they see all nav items regardless of restrictions.

### 6.2 Bypass Behavior

```typescript
const isBypassRole = role === 'admin' || role === 'super_admin';
```

This means `super_admin` and `admin` users see every section and every child item, including nested items with different role restrictions (e.g., Finance's "My Finance" with `roles: ['student', 'parent']` is still visible to admin).

### 6.3 Per-Role Section Visibility

| Section | Roles That See It |
|---|---|
| Dashboard | All 15 roles |
| Organization | super_admin, admin, director, branch_manager, school_admin |
| Students | super_admin, admin, director, branch_manager, school_admin |
| Parents | parent |
| Teachers | super_admin, admin, director, school_admin, teacher, instructor |
| Academics | super_admin, admin, director, branch_manager, school_admin, teacher, instructor |
| Learning / LMS | super_admin, admin, teacher, instructor, student, parent |
| Coding Lab | super_admin, admin, teacher, instructor, student |
| Robotics Lab | super_admin, admin, teacher, instructor, student |
| Competitions | super_admin, admin, teacher, instructor, student, judge |
| Finance | super_admin, admin, director, accountant |
| Human Resources | super_admin, admin, hr_officer |
| My HR | employee, super_admin, admin |
| Inventory | super_admin, admin, inventory_officer |
| Library | super_admin, admin, teacher, instructor, student, parent, employee, librarian |
| Certificates | super_admin, admin, teacher, instructor, student, employee |
| AI Platform | All 15 roles |
| Website / CMS | super_admin, admin |
| Communication | All 15 roles |
| Project Management | super_admin, admin, employee |
| Reports & Analytics | super_admin, admin, director, school_admin |
| Administration | super_admin, admin |
| Settings | All 15 roles (but 10 of 12 children are admin-only) |

### 6.4 Edge Case: Admin Sub-Items in Broader Sections

Some sections visible to many roles contain children restricted to `ADMIN_ROLES`:

| Section | Admin-Only Children |
|---|---|
| AI Platform | "Administration" (`/admin/ai`) |
| Communication | "Administration" (`/admin/notifications`), "Templates" (`/admin/notifications/templates`) |
| Settings | 10 items (General, Branding, Localization, Academic, Notifications, Integrations, Security, Storage, Backup, System) |
| Library | 6 items (Overview, Resources, Borrowings, Reservations, Categories, Authors) |
| Certificates | 4 items (Overview, All Certificates, Templates, Verifications) |
| Finance | "My Finance" is the inverse — restricted to `['student', 'parent']` within a broader section |

---

## 7. Recommendations

### 7.1 Implement Organization Module (Priority: High)

The Organization section currently redirects all 3 non-overview children to `/students/overview`. Implement dedicated routes and pages for:

- `/organization/branches` — Branch management
- `/organization/partner-schools` — Partner school management
- `/organization/academic-years` — Academic year configuration

This eliminates the confusing redirect behavior for SIS_ROLES users.

### 7.2 Deduplicate Shared Routes (Priority: Medium)

Six routes are shared between Teachers and Academics sections. Options:

- **Option A:** Make Academics a filtered view of Teachers for management roles, removing duplicate children. Keep both sections but make Academics the "management" view (enrollments, reports) while Teachers keeps the "operational" view (classes, assignments).
- **Option B:** Deduplicate by giving Academics unique children (e.g., "Curriculum", "Syllabus", "Academic Calendar") instead of mirroring Teacher routes.
- **Option C:** Accept the duplication as intentional cross-linking for different role contexts. Document this decision.

### 7.3 Breadcrumb Consistency (Priority: Medium)

With 206 routes and shared routes across sections, breadcrumb navigation should be implemented or audited to ensure it reflects the user's entry point. For example, a teacher arriving at `/teacher/classes` via the Teachers section and an admin arriving at the same route via Academics should see contextual breadcrumbs.

### 7.4 Active-State Improvements (Priority: Low)

`SidebarGroup.tsx` uses `pathname.startsWith(href + '/')` for active detection. This means `/finance/mine` would not highlight the Finance group if the group's href is `/finance` (no trailing slash issue — this specific case works). However, for the Academics section (no direct `href`), active state relies on child matching, which works correctly. No action needed unless new top-level groups without `href` are added.

### 7.5 Settings Section UX (Priority: Low)

Consider splitting Settings into two sections for non-admin users:
- "My Account" — Profile, Two-Factor Authentication (visible to all)
- "System Settings" — remaining 10 items (ADMIN_ROLES only)

This avoids the empty-section problem where non-admins expand Settings and see only 2 items.

### 7.6 Validation Script in CI (Priority: High)

The `validate-navigation.mjs` script should be integrated into CI pipelines to catch broken nav-to-route mappings on every PR. Run:

```bash
node frontend/scripts/validate-navigation.mjs
```

Exit code is 1 if any nav item points to a missing route, 0 otherwise. Suitable for GitHub Actions or pre-commit hooks.

---

*End of audit.*
