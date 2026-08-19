# 01 — PROJECT AUDIT

**Audit Date:** 2026-08-19
**Scope:** Complete Coder's Hero ecosystem — Laravel backend, React frontend, Flutter mobile, Docker infrastructure
**Method:** Static source code analysis across entire workspace

---

## 1. Technology Stack

| Component | Technology | Version | Status |
|-----------|-----------|---------|--------|
| Backend | Laravel | 12 (PHP ^8.3) | VERIFIED |
| Frontend | React + TypeScript | 19 + 5.6 | VERIFIED |
| Mobile | Flutter | Beta channel, Dart >=2.12.0 <3.0.0 | VERIFIED (template) |
| Database | MySQL | 8.0 | VERIFIED |
| CSS | Tailwind CSS | 3.4 | VERIFIED |
| Build | Vite | 6.x | VERIFIED |
| Auth | Laravel Sanctum | 4.0 | VERIFIED |
| Payments | M-Pesa Daraja API | STK Push + Callback | VERIFIED |
| SMS | Africa's Talking | HTTP Gateway | VERIFIED |
| AI | OpenAI API | GPT-4o-mini | VERIFIED |
| State (Web) | Zustand + TanStack React Query | 5 + 5 | VERIFIED |
| UI (Web) | Radix UI + shadcn/ui-style | Primitives | VERIFIED |
| Forms (Web) | react-hook-form + zod | 7 + 3.24 | VERIFIED |
| HTTP (Web) | Axios | 1.7 | VERIFIED |
| Routing (Web) | react-router-dom | 7 | VERIFIED |
| Charts (Web) | Recharts | 2.15 | VERIFIED |
| Container | Docker Compose | MySQL 8, Redis, Nginx | VERIFIED |
| CI/CD | GitHub Actions | ci.yml | VERIFIED |
| State (Mobile) | None | — | MISSING |
| HTTP (Mobile) | None | — | MISSING |
| Routing (Mobile) | Navigator.push (inline) | — | VERIFIED (template) |
| Auth (Mobile) | Firebase Auth (non-functional) | 5.3.4 | CONFLICTING |

---

## 2. Backend Inventory (Laravel 12)

| Category | Count | Details |
|----------|-------|---------|
| API Routes | 206+ | Defined in routes/api.php (1114 lines) |
| Controllers | 129 | 128 API + 1 base Controller |
| Models | 118 | Across all modules |
| Form Requests | 148 | Validation classes |
| API Resources | 66 | Response formatting |
| Policies | 9 | Authorization policies |
| Services | 93 | Business logic classes |
| Middleware | 6 | Custom middleware |
| Migrations | 138 | Database schema |
| Seeders | 29 | Data seeders |
| Test Files | 25 | 348 tests, ~1209 assertions |
| Roles | 15 | Via Spatie Permission |
| Permissions | ~120 | Granular permission system |
| Database Tables | 120+ | Across all migrations |

### API Route Groups

| Group | Prefix | Routes | Middleware |
|-------|--------|--------|-----------|
| Auth (public) | `/api` | 7 | none |
| Public Website | `/api/public` | 19 | none |
| Profile | `/api` | 8 | auth:sanctum |
| Two-Factor | `/api` | 6 | auth:sanctum |
| Login History | `/api` | 2 | auth:sanctum |
| Dashboard | `/api` | 2 | auth:sanctum |
| Notifications | `/api` | 11 | auth:sanctum |
| Courses | `/api` | 7 | auth:sanctum |
| Enrollments | `/api` | 7 | auth:sanctum |
| Certificates | `/api` | 6 | auth:sanctum |
| Tasks | `/api` | 10 | auth:sanctum |
| Projects | `/api` | 9 | auth:sanctum |
| Quizzes | `/api` | 9 | auth:sanctum |
| Admin | `/api/admin` | ~90 | role:admin\|super_admin\|director\|branch_manager\|school_admin |
| Organization | `/api/organization` | 19 | role:admin\|super_admin\|director\|branch_manager\|school_admin |
| Students | `/api/students` | 30 | role:admin\|super_admin\|director\|branch_manager\|school_admin |
| Guardians | `/api/guardians` | 6 | role:admin\|super_admin\|director\|branch_manager\|school_admin |
| Admissions | `/api/admissions` | 7 | role:admin\|super_admin\|director\|branch_manager\|school_admin |
| Attendance | `/api/attendance` | 6 | role:admin\|super_admin\|director\|branch_manager\|school_admin |
| Student Assignments | `/api/student/assignments` | 4 | role:student |
| Instructor | `/api/instructor` | 15 | role:instructor\|admin |
| Teacher Portal | `/api/teacher` | 54 | role:teacher\|instructor\|admin\|super_admin\|director\|branch_manager\|school_admin |
| Parent Portal | `/api/parent` | 19 | role:parent\|admin\|super_admin |
| Chat | `/api/chat` | 5 | role:parent\|instructor\|admin\|super_admin |
| LMS Interactive | `/api/lms` | ~50 | auth:sanctum |
| Robotics | `/api/robotics` | ~25 | auth:sanctum + role middleware |
| Competitions | `/api/competitions` | ~15 | auth:sanctum + role middleware |
| Finance | `/api/finance` | ~20 | role:admin\|super_admin\|accountant |
| HR | `/api/hr` | ~25 | role:admin\|super_admin\|hr_officer |
| My HR | `/api/my/hr` | 4 | role:employee\|admin\|super_admin |
| Inventory | `/api/inventory` | ~15 | role:admin\|super_admin\|inventory_officer |
| Library | `/api/library` | ~15 | auth:sanctum + role middleware |
| Analytics | `/api/admin/analytics` | 10 | role:admin\|super_admin\|director\|branch_manager\|school_admin\|accountant |
| Admin CMS | `/api/admin` | ~50 | role:admin\|super_admin |

---

## 3. Frontend Inventory (React 19)

| Category | Count | Details |
|----------|-------|---------|
| Route Definitions | 218 | In src/router/routes.ts |
| Navigation Sections | 20 | In src/config/navigation.ts |
| Navigation Items | 129 | Leaf navigation links |
| Page Files | 141+ | Across 14 subdirectories |
| Component Files | Extensive | Under src/components/ |
| Hook Files | 38 | Under src/hooks/ |
| Type Files | Multiple | Under src/types/ |
| API Service Files | Multiple | Under src/lib/ |
| Store Files | Zustand | Under src/stores/ |

### Navigation Sections

| # | Section | Nav Items | Roles |
|---|---------|-----------|-------|
| 1 | Dashboard | 1 | All 15 roles |
| 2 | Organization | 4 | SIS_ROLES |
| 3 | Students | 8 | SIS_ROLES |
| 4 | Parents | 9 | parent |
| 5 | Teachers | 9 | TEACHER_ROLES |
| 6 | Academics | 9 | ACADEMICS_ROLES |
| 7 | Learning / LMS | 6 | LEARNER_ROLES |
| 8 | Coding Lab | 3 | CODING_ROLES |
| 9 | Robotics Lab | 6 | ROBOTICS_ROLES |
| 10 | Competitions | 3 | judge + admin roles |
| 11 | Finance | 10 | FINANCE_ROLES |
| 12 | Human Resources | 9 | HR_ROLES |
| 13 | My HR | 3 | employee + admin |
| 14 | Inventory | 6 | INVENTORY_ROLES |
| 15 | Library | 8 | 8 roles + admin sub-items |
| 16 | Certificates | 5 | 6 roles + admin sub-items |
| 17 | AI Platform | 3 | All 15 roles |
| 18 | Website / CMS | 10 | CMS_ROLES |
| 19 | Communication | 6 | All 15 roles |
| 20 | Project Management | 2 | admin + employee |

### Frontend Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 19 | UI framework |
| TypeScript 5.6 | Type safety |
| Tailwind CSS 3.4 | Styling |
| Vite 6 | Build tool |
| Zustand 5 | Client state (auth store) |
| TanStack React Query 5 | Server state / data fetching |
| Radix UI | Accessible primitives |
| react-hook-form + zod | Form management + validation |
| Axios | HTTP client |
| react-router-dom v7 | Client routing |
| Recharts | Charts and graphs |
| @uiw/react-codemirror | Code editor |
| Lucide React | Icons |
| date-fns | Date formatting |
| sonner | Toast notifications |
| qrcode | QR code generation |

---

## 4. Mobile Inventory (Flutter — Template)

### CRITICAL FINDING

The Flutter project at `Mobile/coders-hero-mobile/` is a **third-party school management template** originally authored by Muhammad Irtaza. It has:

- **Zero integration** with the Coder's Hero Laravel backend
- **Firebase Auth** as its authentication mechanism (incompatible with Laravel Sanctum)
- **Hardcoded static data** throughout (student name "M.Irtaza", exam dates "15/12/2020")
- **Stub screens** with empty event handlers (Profile, TimeTable, Library, Fees, etc.)
- **No HTTP/REST API client** whatsoever
- **No state management** beyond StatefulWidget local state
- **No route system** — all navigation is inline `Navigator.push()`
- **Build-breaking issues** — missing `firebase_options.dart`, `google-services.json`

### Flutter File Inventory

| Category | Count | Details |
|----------|-------|---------|
| Dart files (total) | 27 | 26 lib + 1 test |
| Screen/Page files | 11 | Under lib/Screens/ |
| Widget files | 12 | Under lib/Widgets/ |
| Service/Model files | 2 | Under lib/services/ |
| Test files | 1 | Default template test (broken) |
| Asset files | 28 | Images, animations, GIFs |
| Configuration files | 6 | Firebase, Android, iOS, web |

### Flutter Dependencies

| Package | Version | Status |
|---------|---------|--------|
| firebase_auth | ^5.3.4 | REMOVE — Incompatible with Laravel Sanctum |
| firebase_core | ^3.9.0 | REMOVE — No Firebase needed |
| google_sign_in | ^6.2.2 | REMOVE — Laravel handles auth |
| dropdown_search | ^6.0.1 | KEEP — Useful for dropdowns |
| date_time_picker | ^2.1.0 | KEEP — Useful for date picking |
| fzregex | ^2.0.0 | REMOVE — Use Flutter validators |
| flutter_svg | ^2.0.16 | REMOVE — Unused in code |
| flare_flutter | ^3.0.2 | REMOVE — Splash animation replaced |
| randomizer_null_safe | ^0.1.5 | REMOVE — Unused |
| flrx_validator | ^0.6.0 | REMOVE — Unused |
| flutter_randomcolor | ^1.0.16 | REMOVE — Not needed |

### Flutter Configuration Issues

| Issue | Severity | Details |
|-------|----------|---------|
| Firebase project is `tiku-winner-gaming` | HIGH | Not a Coder's Hero project |
| Application ID is `com.example.school_management` | HIGH | Placeholder, must be `com.codershero.app` |
| compileSdkVersion 29 | HIGH | Google Play requires 34+ |
| targetSdkVersion 29 | HIGH | Google Play requires 34+ |
| Kotlin 1.3.50 | HIGH | Extremely outdated |
| Android Gradle Plugin 3.5.0 | HIGH | Extremely outdated |
| Dart SDK >=2.12.0 <3.0.0 | HIGH | Pre-Dart 3, should be >=3.0.0 |
| `firebase_options.dart` missing | CRITICAL | App will not compile |
| `google-services.json` missing | CRITICAL | Android builds fail |
| No `.env` file | HIGH | No environment management |
| No production signing config | HIGH | Uses debug keys for release |

---

## 5. Authentication Architecture

### Current Laravel Auth (VERIFIED)

```
Login: POST /api/login → AuthController@login
  → Validates email/password
  → Creates Sanctum personal access token
  → Returns token + user with role
  → Token expiry: 24 hours

Register: POST /api/register → AuthController@register
  → Creates user + assigns default role
  → Returns token + user

Logout: POST /api/logout → AuthController@logout (auth:sanctum)
  → Revokes current token

Profile: GET /api/profile → AuthController@profile
  → Returns authenticated user with role, permissions

Password Reset:
  POST /api/forgot-password → Sends reset email
  POST /api/reset-password → Resets password with token

2FA:
  GET /api/two-factor/status → Check 2FA status
  POST /api/two-factor/enable → Enable 2FA (Google2FA)
  POST /api/two-factor/confirm → Confirm 2FA setup
  POST /api/two-factor/disable → Disable 2FA
  POST /api/two-factor/challenge → Verify 2FA code

Email Verification:
  GET /api/email/verify/{id}/{hash} → Verify email
  POST /api/email/resend → Resend verification

Middleware: auth:sanctum (token-based), role:xxx (Spatie)
```

### Current Flutter Auth (BROKEN)

```
Login: FirebaseAuth.instance (declared but NOT used for sign-in)
  → Login form validates then navigates to Home() directly
  → No actual authentication occurs

Google Sign-In: AuthService.googleSignIn() defined but NEVER called

Password Reset: ForgetPassword screen has empty try/catch

State: UserModel stores only uid
```

### Required Flutter Auth Architecture

```
Login: POST /api/login → Laravel Sanctum
  → Store token in flutter_secure_storage
  → Fetch profile (GET /api/profile)
  → Store user + role + permissions
  → Navigate based on role

Auto-Login: Check secure storage for token
  → If token exists, fetch profile
  → If valid, navigate to dashboard
  → If expired, navigate to login

Logout: POST /api/logout → Delete token + user data
  → Navigate to login
```

---

## 6. Role System

### 15 Roles (VERIFIED from RoleSeeder)

| # | Role | Display Name | Mobile Access |
|---|------|-------------|---------------|
| 1 | super_admin | Super Admin | Admin Dashboard |
| 2 | admin | Administrator | Admin Dashboard |
| 3 | director | Director | Admin Dashboard |
| 4 | branch_manager | Branch Manager | Admin Dashboard |
| 5 | school_admin | School Admin | Admin Dashboard |
| 6 | teacher | Teacher | Teacher Experience |
| 7 | instructor | Instructor | Teacher Experience |
| 8 | employee | Employee | Limited (My HR only) |
| 9 | student | Student | Student Experience |
| 10 | parent | Parent | Parent Experience |
| 11 | judge | Judge | Competition Judging |
| 12 | hr_officer | HR Officer | Web Only |
| 13 | inventory_officer | Inventory Officer | Web Only |
| 14 | librarian | Librarian | Web Only |
| 15 | accountant | Accountant | Web Only |

### Permission Groups (VERIFIED)

~120 permissions across groups: students, attendance, courses, finance, users, roles, permissions, settings, coding, robotics, competitions, library, certificates, analytics, ai, notifications, cms, inventory, hr.

---

## 7. Three-Way Module Comparison

| Module | Laravel API | React UI | Flutter | Status |
|--------|------------|----------|---------|--------|
| Authentication | ✅ 13 endpoints | ✅ 5 pages | ❌ Firebase (broken) | REBUILD |
| Dashboard | ✅ 2 endpoints | ✅ 1 page | ⚠️ Stub (hardcoded) | REBUILD |
| Students/SIS | ✅ 30+ endpoints | ✅ 12 pages | ❌ None | NEW |
| Parents | ✅ 19 endpoints | ✅ 12 pages | ❌ None | NEW |
| Teachers | ✅ 54 endpoints | ✅ 13 pages | ❌ None | NEW |
| Courses/LMS | ✅ 7+ endpoints | ✅ 9+ pages | ❌ None | NEW |
| Attendance | ✅ 6 endpoints | ✅ 2 pages | ⚠️ Hardcoded UI | REBUILD |
| Assignments | ✅ 4+ endpoints | ✅ 2+ pages | ❌ None | NEW |
| Exams | ✅ Multiple | ✅ 2+ pages | ⚠️ Hardcoded UI | REBUILD |
| Grades | ✅ Multiple | ✅ Multiple | ❌ None | NEW |
| Coding Lab | ✅ 8+ endpoints | ✅ 3 pages | ❌ None | NEW |
| Robotics | ✅ 25+ endpoints | ✅ 7 pages | ❌ None | NEW |
| Competitions | ✅ 15+ endpoints | ✅ 7 pages | ❌ None | NEW |
| AI Platform | ✅ 12+ endpoints | ✅ 3 pages | ❌ None | NEW |
| Finance | ✅ 20+ endpoints | ✅ 13 pages | ❌ None | NEW (limited) |
| HR | ✅ 25+ endpoints | ✅ 17 pages | ❌ None | WEB ONLY |
| Inventory | ✅ 15+ endpoints | ✅ 7 pages | ❌ None | WEB ONLY |
| Library | ✅ 15+ endpoints | ✅ 9 pages | ❌ None | NEW (limited) |
| Certificates | ✅ 6+ endpoints | ✅ 6 pages | ❌ None | NEW |
| Notifications | ✅ 11 endpoints | ✅ 2 pages | ❌ None | NEW |
| Analytics | ✅ 10 endpoints | ✅ 1 page | ❌ None | ADMIN ONLY |
| Settings | ✅ 2 endpoints | ✅ 10 pages | ❌ None | ADMIN ONLY (limited) |
| CMS | ✅ 50+ endpoints | ✅ 12 pages | ❌ None | WEB ONLY |

---

## 8. Known Issues & Gaps

### Build-Breaking Issues (Flutter)
1. `firebase_options.dart` missing — app will not compile
2. `google-services.json` missing — Android builds fail
3. `GoogleService-Info.plist` missing — iOS Firebase fails
4. Dart SDK constraint `>=2.12.0 <3.0.0` — incompatible with modern packages
5. compileSdkVersion 29 — Google Play rejects

### Architecture Issues (Flutter)
6. No API client — zero backend integration
7. No state management beyond local StatefulWidget state
8. No route system — inline Navigator.push only
9. No authentication flow — login is fake
10. All data hardcoded — no dynamic data fetching
11. Firebase Auth incompatible with Laravel Sanctum

### Code Quality Issues (Flutter)
12. 6 large blocks of commented-out code (~2300 lines)
13. Redundant `Firebase.initializeApp()` called 4 times
14. `AuthService` class defined but never used
15. Default template test is broken
16. Typo in filename: `Exam_Rseult.dart`
17. Typo in asset: `school spleash.flr`
18. `NavigationDrawer.dart` never used
19. Leave type dropdown contains exam type values (bug)
20. GlobalKey created inside build() (key conflicts)

### Backend Gaps for Mobile
21. No `GET /api/public/settings` endpoint for mobile splash/branding
22. No dedicated mobile push notification registration endpoint (FCM token storage exists)
23. Parent portal lacks real-time updates (no WebSocket/SSE)
24. No offline-capable API design (no ETags, no delta sync)

### Security Concerns
25. Firebase project ID exposed in firebase.json (`tiku-winner-gaming`)
26. No iOS URL scheme for Google Sign-In
27. No production signing configuration for Android
28. No environment variable management in Flutter

---

## 9. Evidence Classification Summary

| Classification | Count | Examples |
|---------------|-------|---------|
| VERIFIED | 100+ | All Laravel routes, controllers, models, React pages, Flutter files |
| PARTIAL | 5 | Organization module (backend exists, frontend placeholder), LMS course player, AI insights widget |
| MISSING | 80+ | All Flutter screens connected to API, all Flutter models, all Flutter services |
| CONFLICTING | 3 | Flutter uses Firebase Auth vs Laravel Sanctum; Dart SDK too old; Android SDK too old |
| UNKNOWN | 5 | M-Pesa end-to-end flow, Africa's Talking SMS delivery, S3 file uploads at runtime |

---

## 10. Summary Statistics

| Metric | Value |
|--------|-------|
| Total files audited | 500+ |
| Laravel controllers | 129 |
| Laravel models | 118 |
| Laravel API routes | 206+ |
| Laravel migrations | 138 |
| Laravel tests | 348 |
| React routes | 218 |
| React page files | 141+ |
| React navigation sections | 20 |
| Flutter dart files | 27 |
| Flutter screens | 11 |
| Flutter widgets | 12 |
| Flutter API integrations | 0 |
| Flutter features implemented | 0 (all stubs/hardcoded) |
| Flutter features to rebuild | 11 screens + 12 widgets |
| Flutter files to create | ~89 new files |
| Flutter files to remove | 8 files |
| Implementation phases | 21 (Phase 0-20) |
| Critical gaps | 28 |
| High-risk issues | 12 |
