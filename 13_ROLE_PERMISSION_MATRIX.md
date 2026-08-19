# 13 — Role & Permission Matrix for Flutter Mobile

> Coder's Hero ERP & LMS — Mobile Integration Audit
> Last updated: 2026-08-18
> Source: `backend/routes/api.php`, `backend/database/seeders/RoleSeeder.php`, `ROLE_ACCESS_MATRIX.md`

---

## 1. Roles Overview

The backend defines **16 roles** via Spatie Laravel Permission (`RoleSeeder.php`):

| # | Role Name | Display Name | Mobile Access |
|---|-----------|--------------|---------------|
| 1 | `super_admin` | Super Admin | **Yes — Admin mobile** |
| 2 | `admin` | Administrator | **Yes — Admin mobile** |
| 3 | `director` | Director | **Yes — Admin mobile** |
| 4 | `branch_manager` | Branch Manager | **Yes — Admin mobile** |
| 5 | `school_admin` | School Admin | **Yes — Admin mobile** |
| 6 | `teacher` | Teacher | **Yes — Primary mobile** |
| 7 | `instructor` | Instructor | **Yes — Primary mobile** (same as teacher) |
| 8 | `employee` | Employee | **No — Web only** |
| 9 | `student` | Student | **Yes — Primary mobile** |
| 10 | `parent` | Parent | **Yes — Primary mobile** |
| 11 | `judge` | Judge | **No — Web only** |
| 12 | `hr_officer` | HR Officer | **No — Web only** |
| 13 | `inventory_officer` | Inventory Officer | **No — Web only** |
| 14 | `librarian` | Librarian | **No — Web only** |
| 15 | `accountant` | Accountant | **No — Web only** |
| 16 | `guest` | Guest | **No — Public website only** |

### Roles WITHOUT Dedicated Mobile Access

| Role | Reason | Mobile Redirect |
|------|--------|-----------------|
| Accountant | Finance module too complex for mobile (invoices, budgets, M-Pesa, expenses) | Web app |
| HR Officer | HR module too complex for mobile (employees, contracts, payroll, performance) | Web app |
| Inventory Officer | Inventory module too complex for mobile (assets, stock, movements) | Web app |
| Librarian | Library management too complex for mobile (catalog, borrowings, reservations) | Web app |
| Competition Judge | Judging requires large screen for scoring rubrics | Web app |
| Employee | Employee self-service via web (leaves, payslips, attendance) | Web app |
| Guest | Public website only, no app login | N/A |

---

## 2. Student Mobile Access

### 2.1 Allowed Screens

| Module | Screen | Route | Permission | API Endpoint |
|--------|--------|-------|------------|--------------|
| Dashboard | Student Dashboard | `/student/dashboard` | `student` | `GET /dashboard` |
| Courses | My Courses | `/student/courses` | `student` | `GET /enrollments/my-courses` |
| Courses | Course Detail | `/student/courses/:id` | `student` | `GET /courses/{id}` |
| Courses | Course Player | `/student/courses/:id/player` | `student` | `GET /courses/{id}/lessons` |
| Lessons | Lesson Content | `/student/courses/:id/lessons/:lessonId` | `student` | `GET /courses/{id}/lessons` |
| Attendance | My Attendance | `/student/attendance` | `student` | `GET /students/{id}/attendance` |
| Assignments | My Assignments | `/student/assignments` | `student` | `GET /student/assignments` |
| Assignments | Submit Assignment | `/student/assignments/:id/submit` | `student` | `POST /student/assignments/{id}/submit` |
| Exams | My Exams | `/student/exams` | `student` | `GET /student/assignments` (filtered) |
| Grades | My Grades | `/student/grades` | `student` | `GET /enrollments/stats` |
| Certificates | My Certificates | `/student/certificates` | `student` | `GET /certificates` |
| Notifications | Notifications | `/student/notifications` | `student` | `GET /notifications` |
| Profile | My Profile | `/student/profile` | `student` | `GET /profile` |
| Settings | Settings | `/student/settings` | `student` | `PUT /profile` |
| AI | AI Tutor | `/student/ai-tutor` | `student` (via `use_ai_assistants`) | `POST /lms/ai-tutor/conversations/{id}/messages` |
| AI | AI Platform | `/student/ai` | `student` | `POST /lms/ai/conversations/{id}/messages` |
| Coding | Coding Playground | `/student/coding/playground` | `student` | `POST /lms/playground/run` |
| Coding | Coding Exercises | `/student/coding/exercises` | `student` | `GET /lms/courses/{courseId}/coding-exercises` |
| Coding | Leaderboard | `/student/coding/leaderboard` | `student` | `GET /lms/coding-leaderboard/for-course/{courseId}` |
| Competitions | Competitions | `/student/competitions` | `student` | `GET /competitions` |
| Competitions | My Teams | `/student/competitions/teams` | `student` | `GET /competitions/teams/mine` |
| LMS | Forum | `/student/forum` | `student` | `GET /lms/courses/{courseId}/forum` |
| LMS | Bookmarks | `/student/bookmarks` | `student` | `GET /lms/bookmarks` |
| LMS | Quizzes | `/student/quizzes` | `student` | `GET /quizzes` |
| Communication | Messages | `/student/messages` | `student` | `GET /chat` |

### 2.2 Forbidden Screens (Student)

| Module | Screen | Reason |
|--------|--------|--------|
| Students (SIS) | Student List/Detail | Admin module |
| Finance | All finance screens | Admin module |
| HR | All HR screens | Admin module |
| Inventory | All inventory screens | Admin module |
| Library Admin | Admin screens | Librarian module |
| Settings (admin) | System settings | Admin only |
| Administration | User/role management | Admin only |

### 2.3 Navigation Items (Student)

```
Dashboard
Learning
  - My Courses
  - Course Player
  - Quizzes
  - Forum
  - Bookmarks
Coding Lab
  - Playground
  - Exercises
  - Leaderboard
Competitions
  - Competitions
  - My Teams
My Academics
  - Attendance
  - Assignments
  - Exams
  - Grades
  - Certificates
Communication
  - Messages
  - Notifications
Profile
Settings
```

---

## 3. Parent Mobile Access

### 3.1 Allowed Screens

| Module | Screen | Route | Permission | API Endpoint |
|--------|--------|-------|------------|--------------|
| Dashboard | Parent Dashboard | `/parent/dashboard` | `parent` | `GET /parent/summary` |
| Children | Children List | `/parent/children` | `parent` | `GET /parent/children` |
| Children | Child Detail | `/parent/children/:childId` | `parent` | `GET /parent/children` |
| Attendance | Child Attendance | `/parent/attendance` | `parent` | `GET /parent/attendance` |
| Progress | Academic Progress | `/parent/progress` | `parent` | `GET /parent/progress` |
| Report Cards | Report Cards | `/parent/report-cards` | `parent` | `GET /parent/report-cards` |
| Report Cards | Report Card Detail | `/parent/report-cards/:id` | `parent` | `GET /parent/report-cards/{id}` |
| Fees | Fees | `/parent/fees` | `parent` | `GET /parent/fees` |
| Fees | Fee Detail | `/parent/fees/:id` | `parent` | `GET /parent/fees/{id}` |
| Fees | Payments | `/parent/payments` | `parent` | `GET /parent/fees/{id}` |
| Appointments | Appointments | `/parent/appointments` | `parent` | `GET /parent/appointments` |
| Notifications | Notifications | `/parent/notifications` | `parent` | `GET /parent/notifications` |
| Profile | My Profile | `/parent/profile` | `parent` | `GET /profile` |
| Settings | Settings | `/parent/settings` | `parent` | `PUT /profile` |
| Communication | Messages | `/parent/messages` | `parent` | `GET /chat` |
| LMS | Courses (view only) | `/parent/courses` | `parent` | `GET /courses` |

### 3.2 CRITICAL SECURITY: Parent-Child Data Scoping

```
SECURITY RULE: Parent can ONLY see their own children.
Backend enforces this via:
  - Role middleware: role:parent|admin|super_admin
  - ParentController queries children by authenticated user's parent_id
  - All child data endpoints filter by parent_id relationship

Flutter MUST NOT:
  - Allow child ID manipulation in URL/parameters
  - Display other parents' children data
  - Cache other parents' children data
  - Bypass parent_id filtering

Backend enforcement points:
  - ParentController::children() — filters by auth()->user()->parent->id
  - ParentAttendanceController::index() — filters by parent's children
  - ParentProgressController::index() — filters by parent's children
  - ParentFeeController::index() — filters by parent's children
```

### 3.3 Forbidden Screens (Parent)

| Module | Screen | Reason |
|--------|--------|--------|
| Students (SIS) | Student management | Admin module |
| Finance (admin) | Invoice management | Admin module |
| HR | All HR screens | Admin module |
| Teacher | Class management | Teacher module |
| Coding Lab | Playground/exercises | Student module |
| Competitions | Competition management | Admin module |
| Settings (admin) | System settings | Admin only |

### 3.4 Navigation Items (Parent)

```
Dashboard
My Children
  - Children List
  - Child Detail
Academics
  - Attendance
  - Progress
  - Report Cards
Finance
  - Fees
  - Payments
  - Receipts
Appointments
Communication
  - Messages
  - Notifications
Profile
Settings
```

---

## 4. Teacher Mobile Access

### 4.1 Allowed Screens

| Module | Screen | Route | Permission | API Endpoint |
|--------|--------|-------|------------|--------------|
| Dashboard | Teacher Dashboard | `/teacher/dashboard` | `teacher` | `GET /teacher/dashboard` |
| Classes | My Classes | `/teacher/classes` | `teacher` | `GET /teacher/classes` |
| Classes | Class Detail | `/teacher/classes/:id` | `teacher` | `GET /teacher/classes/{id}` |
| Classes | Class Roster | `/teacher/classes/:id/roster` | `teacher` | `GET /teacher/classes/{id}/roster` |
| Attendance | Mark Attendance | `/teacher/classes/:id/attendance` | `teacher` | `POST /teacher/classes/{id}/attendance` |
| Attendance | Attendance Summary | `/teacher/classes/:id/attendance/summary` | `teacher` | `GET /teacher/classes/{id}/attendance` |
| Assignments | Manage Assignments | `/teacher/assignments` | `teacher` | `GET /teacher/assignments` |
| Assignments | Create Assignment | `/teacher/assignments/create` | `teacher` | `POST /teacher/assignments` |
| Assignments | Assignment Detail | `/teacher/assignments/:id` | `teacher` | `GET /teacher/assignments/{id}` |
| Assignments | Submissions | `/teacher/assignments/:id/submissions` | `teacher` | `GET /teacher/assignments/{id}/submissions` |
| Assignments | Grade Submission | `/teacher/assignments/:id/submissions/:sid/grade` | `teacher` | `PUT /teacher/assignments/{id}/submissions/{sid}/grade` |
| Exams | Manage Exams | `/teacher/exams` | `teacher` | `GET /teacher/exams` |
| Exams | Create Exam | `/teacher/exams/create` | `teacher` | `POST /teacher/exams` |
| Exams | Exam Detail | `/teacher/exams/:id` | `teacher` | `GET /teacher/exams/{id}` |
| Exams | Grade Results | `/teacher/exams/:id/grade` | `teacher` | `POST /teacher/exams/{id}/results` |
| Gradebook | Gradebook | `/teacher/gradebook` | `teacher` | `GET /teacher/gradebook/classes/{classId}/entries` |
| Gradebook | Class Summary | `/teacher/gradebook/summary` | `teacher` | `GET /teacher/gradebook/classes/{classId}/summary` |
| Gradebook | Student Summary | `/teacher/gradebook/student/:studentId` | `teacher` | `GET /teacher/gradebook/classes/{classId}/students/{studentId}` |
| Lesson Notes | Lesson Notes | `/teacher/lesson-notes` | `teacher` | `GET /teacher/lesson-notes` |
| Lesson Notes | Create Lesson Note | `/teacher/lesson-notes/create` | `teacher` | `POST /teacher/lesson-notes` |
| Calendar | Calendar | `/teacher/calendar` | `teacher` | `GET /teacher/calendar` |
| Notifications | Notifications | `/teacher/notifications` | `teacher` | `GET /notifications` |
| Profile | My Profile | `/teacher/profile` | `teacher` | `GET /profile` |
| Settings | Settings | `/teacher/settings` | `teacher` | `PUT /profile` |
| Communication | Messages | `/teacher/messages` | `teacher` | `GET /chat` |
| LMS | My Courses (instructor) | `/teacher/lms/courses` | `teacher` (instructor) | `GET /instructor/courses` |
| LMS | Course Management | `/teacher/lms/courses/:id` | `teacher` (instructor) | `PUT /instructor/courses/{id}` |
| Competitions | Competition Management | `/teacher/competitions` | `teacher` | `GET /competitions` |
| Competitions | Create Competition | `/teacher/competitions/create` | `teacher` | `POST /competitions` |

### 4.2 Forbidden Screens (Teacher)

| Module | Screen | Reason |
|--------|--------|--------|
| Students (SIS) | Student CRUD | Admin module |
| Finance | All finance screens | Admin module |
| HR | All HR screens | Admin module |
| Inventory | All inventory screens | Admin module |
| Parent Portal | Parent screens | Parent module |
| Settings (admin) | System settings | Admin only |
| Administration | User/role management | Admin only |

### 4.3 Navigation Items (Teacher)

```
Dashboard
Classes
  - My Classes
  - Class Detail
  - Class Roster
Academics
  - Assignments
  - Exams
  - Gradebook
  - Lesson Notes
  - Calendar
Teaching
  - My Courses (LMS)
  - Course Management
Competitions
  - Manage Competitions
Communication
  - Messages
  - Notifications
Profile
Settings
```

---

## 5. Admin Mobile Access

### 5.1 Admin Role Variants

The admin mobile experience covers 5 roles:

| Role | Scope | Dashboard |
|------|-------|-----------|
| `super_admin` | Full system access | Admin Dashboard |
| `admin` | Broad system access | Admin Dashboard |
| `director` | Cross-branch oversight | Admin Dashboard |
| `branch_manager` | Branch-scoped operations | Admin Dashboard |
| `school_admin` | School-level operations | Admin Dashboard |

### 5.2 Allowed Screens (Admin)

| Module | Screen | Route | Permission | API Endpoint |
|--------|--------|-------|------------|--------------|
| Dashboard | Admin Dashboard | `/admin/dashboard` | `admin` | `GET /dashboard` |
| Dashboard | Stats | `/admin/dashboard/stats` | `admin` | `GET /dashboard/stats` |
| Students | Student List | `/admin/students` | `admin` | `GET /students` |
| Students | Student Detail | `/admin/students/:id` | `admin` | `GET /students/{id}` |
| Students | Student Create | `/admin/students/create` | `admin` | `POST /students` |
| Students | Student Edit | `/admin/students/:id/edit` | `admin` | `PUT /students/{id}` |
| Students | Attendance | `/admin/attendance` | `admin` | `GET /attendance` |
| Students | Admissions | `/admin/admissions` | `admin` | `GET /admissions` |
| Students | Guardians | `/admin/guardians` | `admin` | `GET /guardians` |
| Teachers | Teacher Overview | `/admin/teachers` | `admin` | `GET /teacher/dashboard` |
| Finance | Finance Summary | `/admin/finance` | `admin` | `GET /finance/summary` |
| Finance | Invoices | `/admin/finance/invoices` | `admin` | `GET /finance/invoices` |
| Finance | Payments | `/admin/finance/payments` | `admin` | `GET /finance/payments` |
| Finance | Outstanding | `/admin/finance/outstanding` | `admin` | `GET /finance/outstanding` |
| Notifications | Notifications | `/admin/notifications` | `admin` | `GET /notifications` |
| Profile | My Profile | `/admin/profile` | `admin` | `GET /profile` |
| Settings | Settings | `/admin/settings` | `admin` | `PUT /profile` |
| Administration | Users | `/admin/users` | `admin` | `GET /admin/users` |
| Administration | Roles | `/admin/roles` | `admin` | `GET /admin/roles` |
| Administration | Activity Logs | `/admin/activity-logs` | `admin` | `GET /admin/activity-logs` |
| Analytics | Analytics | `/admin/analytics` | `admin` | `GET /admin/analytics/overview` |

### 5.3 Forbidden Screens (Admin)

| Module | Screen | Reason |
|--------|--------|--------|
| Parent Portal | Parent-specific views | Parent module |
| Student assignments | Student submission view | Student module |
| Coding playground | Student coding | Student module |
| My HR | Employee self-service | Employee module |

### 5.4 Navigation Items (Admin)

```
Dashboard
Students
  - Student List
  - Admissions
  - Guardians
  - Attendance
Teachers
  - Teacher Overview
Finance (summary only)
  - Summary
  - Invoices
  - Payments
  - Outstanding
Analytics
Administration
  - Users
  - Roles
  - Activity Logs
Notifications
Profile
Settings
```

---

## 6. Backend API Route Protection

### 6.1 Middleware Reference (from `api.php`)

| Route Group | Prefix | Middleware | Allowed Roles |
|---|---|---|---|
| Auth (public) | `/login`, `/register` | None | Public |
| Profile | `/profile` | `auth:sanctum` | All authenticated |
| Dashboard | `/dashboard` | `auth:sanctum` | All authenticated |
| Notifications | `/notifications` | `auth:sanctum` | All authenticated |
| Courses (read) | `/courses` | `auth:sanctum` | All authenticated |
| Enrollments | `/enrollments` | `auth:sanctum` | All authenticated |
| Certificates | `/certificates` | `auth:sanctum` | All authenticated |
| Quizzes | `/quizzes` | `auth:sanctum` | All authenticated |
| Tasks | `/tasks` | `auth:sanctum` | All authenticated |
| Projects | `/projects` | `auth:sanctum` | All authenticated |
| Announcements | `/announcements` | `auth:sanctum` | All authenticated |
| Admin | `/admin` | `role:admin\|super_admin\|director\|branch_manager\|school_admin` | 5 roles |
| Students (SIS) | `/students` | `role:admin\|super_admin\|director\|branch_manager\|school_admin` | 5 roles |
| Guardians | `/guardians` | `role:admin\|super_admin\|director\|branch_manager\|school_admin` | 5 roles |
| Admissions | `/admissions` | `role:admin\|super_admin\|director\|branch_manager\|school_admin` | 5 roles |
| Attendance (admin) | `/attendance` | `role:admin\|super_admin\|director\|branch_manager\|school_admin` | 5 roles |
| Instructor | `/instructor` | `role:instructor\|admin` | 2 roles |
| Student assignments | `/student/assignments` | `role:student` | 1 role |
| Teacher portal | `/teacher` | `role:teacher\|instructor\|admin\|super_admin\|director\|branch_manager\|school_admin` | 7 roles |
| Parent portal | `/parent` | `role:parent\|admin\|super_admin` | 3 roles |
| Chat | `/chat` | `role:parent\|instructor\|admin\|super_admin` | 4 roles |
| LMS | `/lms` | `auth:sanctum` | All authenticated |
| Robotics | `/robotics` | `auth:sanctum` | All authenticated (write: teacher+) |
| Competitions | `/competitions` | `auth:sanctum` | All authenticated (manage: teacher+) |
| Finance | `/finance` | `role:admin\|super_admin\|accountant` | 3 roles |
| HR | `/hr` | `role:admin\|super_admin\|hr_officer` | 3 roles |
| My HR | `/my/hr` | `role:employee\|admin\|super_admin` | 3 roles |
| Inventory | `/inventory` | `role:admin\|super_admin\|inventory_officer` | 3 roles |
| Library (admin) | `/library` | `role:admin\|super_admin\|librarian` | 3 roles |
| Library (public) | `/library/catalog` | `auth:sanctum` | All authenticated |
| Organization | `/organization` | `role:admin\|super_admin\|director\|branch_manager\|school_admin` | 5 roles |
| Analytics | `/admin/analytics` | `role:admin\|super_admin\|director\|branch_manager\|school_admin\|accountant` | 6 roles |
| System | `/admin/system` | `role:super_admin` | 1 role |

### 6.2 Mobile API Priority (by role)

#### Student APIs (20 endpoints)

```
GET  /dashboard
GET  /profile
PUT  /profile
GET  /notifications
GET  /enrollments/my-courses
GET  /enrollments/stats
GET  /courses/{id}
GET  /courses/{id}/lessons
GET  /students/{id}/attendance
GET  /student/assignments
POST /student/assignments/{id}/submit
GET  /certificates
GET  /quizzes
GET  /lms/courses/{courseId}/forum
GET  /lms/bookmarks
GET  /lms/courses/{courseId}/coding-exercises
GET  /lms/coding-leaderboard/for-course/{courseId}
POST /lms/playground/run
POST /lms/ai-tutor/conversations/{id}/messages
GET  /competitions
GET  /competitions/teams/mine
```

#### Parent APIs (12 endpoints)

```
GET  /parent/summary
GET  /parent/children
GET  /parent/attendance
GET  /parent/progress
GET  /parent/report-cards
GET  /parent/report-cards/{id}
GET  /parent/fees
GET  /parent/fees/{id}
POST /parent/fees/{id}/pay
GET  /parent/appointments
GET  /parent/notifications
GET  /chat
```

#### Teacher APIs (25 endpoints)

```
GET  /teacher/dashboard
GET  /teacher/classes
GET  /teacher/classes/{id}
GET  /teacher/classes/{id}/roster
POST /teacher/classes/{id}/attendance
GET  /teacher/classes/{id}/attendance
GET  /teacher/assignments
POST /teacher/assignments
GET  /teacher/assignments/{id}
PUT  /teacher/assignments/{id}
GET  /teacher/assignments/{id}/submissions
PUT  /teacher/assignments/{id}/submissions/{sid}/grade
GET  /teacher/exams
POST /teacher/exams
GET  /teacher/exams/{id}
PUT  /teacher/exams/{id}
POST /teacher/exams/{id}/results
GET  /teacher/gradebook/classes/{classId}/entries
POST /teacher/gradebook/classes/{classId}/entries
GET  /teacher/gradebook/classes/{classId}/summary
GET  /teacher/lesson-notes
POST /teacher/lesson-notes
GET  /teacher/calendar
GET  /instructor/courses
GET  /competitions
```

#### Admin APIs (15 endpoints — summary/quick actions)

```
GET  /dashboard
GET  /dashboard/stats
GET  /students
GET  /students/{id}
POST /students
PUT  /students/{id}
GET  /attendance
GET  /admissions
GET  /guardians
GET  /teacher/dashboard
GET  /finance/summary
GET  /notifications
GET  /admin/users
GET  /admin/activity-logs
GET  /admin/analytics/overview
```

---

## 7. Permission Checks in Flutter

### 7.1 Client-Side Permission Model

```dart
enum MobileRole {
  student,
  parent,
  teacher,
  instructor,
  admin,
  superAdmin,
  director,
  branchManager,
  schoolAdmin,
}

extension MobileRoleExtension on MobileRole {
  bool get isStudent => this == MobileRole.student;
  bool get isParent => this == MobileRole.parent;
  bool get isTeacher => this == MobileRole.teacher || this == MobileRole.instructor;
  bool get isAdmin => [
    MobileRole.admin,
    MobileRole.superAdmin,
    MobileRole.director,
    MobileRole.branchManager,
    MobileRole.schoolAdmin,
  ].contains(this);
  
  bool get canMarkAttendance => isTeacher || isAdmin;
  bool canAccess(String module) { /* role-based check */ }
}
```

### 7.2 Server-Side Enforcement

```
CRITICAL: Client-side checks are for UI filtering only.
Server-side enforcement via Laravel middleware is the source of truth.

Every API call must:
1. Include Bearer token (Sanctum)
2. Pass role middleware check
3. Pass data scoping (e.g., parent sees only own children)

If server returns 403, Flutter must:
1. Show "Access Denied" message
2. Navigate back to permitted screen
3. Log the unauthorized access attempt
```

---

## 8. Mobile Navigation Items per Role

### 8.1 Student Navigation

```
┌─────────────────────────────┐
│ Dashboard                   │
├─────────────────────────────┤
│ Learning                    │
│  ├─ My Courses              │
│  ├─ Quizzes                 │
│  ├─ Forum                   │
│  └─ Bookmarks               │
├─────────────────────────────┤
│ Coding Lab                  │
│  ├─ Playground              │
│  ├─ Exercises               │
│  └─ Leaderboard             │
├─────────────────────────────┤
│ Competitions                │
│  ├─ Competitions            │
│  └─ My Teams                │
├─────────────────────────────┤
│ My Academics                │
│  ├─ Attendance              │
│  ├─ Assignments             │
│  ├─ Exams                   │
│  ├─ Grades                  │
│  └─ Certificates            │
├─────────────────────────────┤
│ Communication               │
│  ├─ Messages                │
│  └─ Notifications           │
├─────────────────────────────┤
│ Profile                     │
│ Settings                    │
└─────────────────────────────┘
```

### 8.2 Parent Navigation

```
┌─────────────────────────────┐
│ Dashboard                   │
├─────────────────────────────┤
│ My Children                 │
│  ├─ Children List           │
│  └─ Child Detail            │
├─────────────────────────────┤
│ Academics                   │
│  ├─ Attendance              │
│  ├─ Progress                │
│  └─ Report Cards            │
├─────────────────────────────┤
│ Finance                     │
│  ├─ Fees                    │
│  ├─ Payments                │
│  └─ Receipts                │
├─────────────────────────────┤
│ Appointments                │
├─────────────────────────────┤
│ Communication               │
│  ├─ Messages                │
│  └─ Notifications           │
├─────────────────────────────┤
│ Profile                     │
│ Settings                    │
└─────────────────────────────┘
```

### 8.3 Teacher Navigation

```
┌─────────────────────────────┐
│ Dashboard                   │
├─────────────────────────────┤
│ Classes                     │
│  ├─ My Classes              │
│  ├─ Class Detail            │
│  └─ Class Roster            │
├─────────────────────────────┤
│ Academics                   │
│  ├─ Assignments             │
│  ├─ Exams                   │
│  ├─ Gradebook               │
│  ├─ Lesson Notes            │
│  └─ Calendar                │
├─────────────────────────────┤
│ Teaching                    │
│  ├─ My Courses (LMS)        │
│  └─ Course Management       │
├─────────────────────────────┤
│ Competitions                │
│  └─ Manage Competitions     │
├─────────────────────────────┤
│ Communication               │
│  ├─ Messages                │
│  └─ Notifications           │
├─────────────────────────────┤
│ Profile                     │
│ Settings                    │
└─────────────────────────────┘
```

### 8.4 Admin Navigation

```
┌─────────────────────────────┐
│ Dashboard                   │
├─────────────────────────────┤
│ Students                    │
│  ├─ Student List            │
│  ├─ Admissions              │
│  ├─ Guardians               │
│  └─ Attendance              │
├─────────────────────────────┤
│ Teachers                    │
│  └─ Teacher Overview        │
├─────────────────────────────┤
│ Finance (summary only)      │
│  ├─ Summary                 │
│  ├─ Invoices                │
│  ├─ Payments                │
│  └─ Outstanding             │
├─────────────────────────────┤
│ Analytics                   │
├─────────────────────────────┤
│ Administration              │
│  ├─ Users                   │
│  ├─ Roles                   │
│  └─ Activity Logs           │
├─────────────────────────────┤
│ Notifications               │
├─────────────────────────────┤
│ Profile                     │
│ Settings                    │
└─────────────────────────────┘
```

---

## 9. Data Scoping Rules

| Role | Data Scope | Enforcement |
|------|------------|-------------|
| Student | Own data only | Backend: `student_id` from token |
| Parent | Own children only | Backend: `parent_id` from relationship |
| Teacher | Own classes only | Backend: `teacher_id` from relationship |
| Instructor | Own courses only | Backend: `instructor_id` from relationship |
| Admin | All data | Backend: role middleware bypass |
| Director | All branches | Backend: role middleware bypass |
| Branch Manager | Own branch only | Backend: `branch_id` scoping (TODO) |
| School Admin | Own school only | Backend: `school_id` scoping (TODO) |

---

## 10. Mobile Permission Summary Table

| Feature | Student | Parent | Teacher | Admin |
|---------|---------|--------|---------|-------|
| View Dashboard | ✓ | ✓ | ✓ | ✓ |
| View Courses | ✓ | ✓ (read) | ✓ (manage) | ✓ |
| View Attendance | ✓ (own) | ✓ (children) | ✓ (classes) | ✓ (all) |
| Mark Attendance | ✗ | ✗ | ✓ | ✓ |
| View Assignments | ✓ (own) | ✗ | ✓ (manage) | ✗ |
| Submit Assignments | ✓ | ✗ | ✗ | ✗ |
| View Grades | ✓ (own) | ✓ (children) | ✓ (classes) | ✓ |
| View Exams | ✓ (own) | ✓ (children) | ✓ (manage) | ✗ |
| Manage Exams | ✗ | ✗ | ✓ | ✗ |
| View Fees | ✗ | ✓ (own) | ✗ | ✓ (summary) |
| View Notifications | ✓ | ✓ | ✓ | ✓ |
| View Profile | ✓ | ✓ | ✓ | ✓ |
| Use AI Tutor | ✓ | ✗ | ✗ | ✗ |
| Use Coding Playground | ✓ | ✗ | ✗ | ✗ |
| Participate in Competitions | ✓ | ✗ | ✓ (manage) | ✓ (manage) |
| View Library | ✓ (catalog) | ✓ (catalog) | ✓ (catalog) | ✓ (admin) |
| View Certificates | ✓ (own) | ✗ | ✗ | ✓ (all) |
| Manage Users | ✗ | ✗ | ✗ | ✓ |
| View Analytics | ✗ | ✗ | ✗ | ✓ |
| Manage Settings | ✗ | ✗ | ✗ | ✓ (admin only) |

---

*End of Role & Permission Matrix.*
