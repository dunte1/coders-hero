# CODER'S HERO — Mobile Master Plan

> Coder's Hero ERP & LMS — Flutter Mobile Integration
> Last updated: 2026-08-18
> Single authoritative document for mobile implementation

---

## 1. Executive Summary

Coder's Hero is a comprehensive ERP & Learning Management System built on Laravel 12 (backend) and React 19 (web frontend). The system supports 15 user roles, 206+ API routes, 129 navigation items, and 120+ database tables.

The Flutter mobile app exists as a legacy template with 27 Dart files, 11 screens, 0 API integration, and all stub data. It uses Firebase authentication (incompatible with the Laravel Sanctum backend) and contains hardcoded data.

This master plan defines the complete migration from the legacy Flutter template to a production-ready mobile application that integrates with the existing Laravel backend, covering all 4 primary mobile roles (Student, Parent, Teacher, Admin) across 21 implementation phases.

**Key Metrics:**

| Metric | Value |
|--------|-------|
| Current Dart files | 27 |
| Current screens | 11 |
| Current API integrations | 0 |
| Target Dart files | 200+ |
| Target screens | 60+ |
| Target API integrations | 80+ |
| Implementation phases | 21 |
| Estimated timeline | 12-16 weeks |
| Primary mobile roles | 4 (Student, Parent, Teacher, Admin) |
| Total backend roles | 15 |

---

## 2. Current Architecture

### 2.1 Backend (Laravel 12)

```
backend/
├── app/
│   └── Http/
│       └── Controllers/
│           └── Api/
│               ├── AuthController.php
│               ├── DashboardController.php
│               ├── CourseController.php
│               ├── EnrollmentController.php
│               ├── CertificateController.php
│               ├── NotificationController.php
│               ├── Students/ (12 controllers)
│               ├── Parent/ (8 controllers)
│               ├── Teacher/ (10 controllers)
│               ├── Finance/ (6 controllers)
│               ├── Hr/ (8 controllers)
│               ├── Inventory/ (5 controllers)
│               ├── Library/ (7 controllers)
│               ├── Lms/ (10 controllers)
│               ├── Robotics/ (6 controllers)
│               ├── Competitions/ (3 controllers)
│               ├── Ai/ (2 controllers)
│               ├── Cms/ (10 controllers)
│               └── Admin/ (2 controllers)
├── routes/
│   └── api.php (1114 lines, 206+ routes)
├── database/
│   ├── seeders/RoleSeeder.php (16 roles)
│   └── migrations/ (120+ tables)
└── config/
    └── sanctum.php
```

### 2.2 Web Frontend (React 19)

```
frontend/src/
├── config/
│   └── navigation.ts (129 nav items, 23 sections)
├── router/
│   └── routes.ts (206 routes)
├── hooks/
│   └── useNavigation.ts (role-based filtering)
├── components/
│   └── layout/
│       ├── Sidebar.tsx
│       ├── SidebarGroup.tsx
│       └── SidebarItem.tsx
├── pages/ (141 page files)
└── components/features/ (feature components)
```

### 2.3 Mobile (Flutter — Current State)

```
Mobile/coders-hero-mobile/
├── lib/
│   ├── main.dart (38 lines, Firebase init)
│   ├── Screens/
│   │   ├── SplashScreen.dart
│   │   ├── LoginPage.dart (716 lines, Firebase auth)
│   │   ├── ForgetPassword.dart
│   │   ├── home.dart (253 lines, stub data)
│   │   ├── RequestLogin.dart
│   │   ├── RequestProcessing.dart
│   │   ├── Attendance/ (3 files)
│   │   ├── Exam/ (1 file, typo in name)
│   │   └── Leave_Apply/ (1 file)
│   ├── Widgets/
│   │   ├── AppBar.dart
│   │   ├── BouncingButton.dart
│   │   ├── DashboardCards.dart
│   │   ├── MainDrawer.dart
│   │   ├── NavigationDrawer.dart
│   │   ├── DrawerListTile.dart
│   │   ├── UserDetailCard.dart
│   │   ├── Attendance/ (2 files)
│   │   └── Exams/ (1 file)
│   └── services/
│       ├── Auth_services.dart (Firebase auth)
│       └── UserModel.dart (Firebase user model)
├── pubspec.yaml (Firebase dependencies)
└── android/ (SDK 29, old Kotlin)
```

---

## 3. Target Architecture

### 3.1 Target Flutter Structure

```
Mobile/coders-hero-mobile/
├── lib/
│   ├── app.dart
│   ├── config/
│   │   ├── env.dart
│   │   ├── routes.dart
│   │   └── theme.dart
│   ├── core/
│   │   ├── api/
│   │   │   ├── api_client.dart
│   │   │   ├── api_interceptor.dart
│   │   │   └── api_exception.dart
│   │   ├── auth/
│   │   │   ├── auth_service.dart
│   │   │   ├── auth_provider.dart
│   │   │   └── token_storage.dart
│   │   ├── navigation/
│   │   │   ├── app_router.dart
│   │   │   └── route_guards.dart
│   │   ├── cache/
│   │   │   ├── cache_manager.dart
│   │   │   └── cache_interceptor.dart
│   │   └── security/
│   │       ├── certificate_pinner.dart
│   │       └── jailbreak_detector.dart
│   ├── features/
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   ├── models/
│   │   │   ├── providers/
│   │   │   └── screens/
│   │   ├── student/
│   │   │   ├── data/
│   │   │   ├── models/
│   │   │   ├── providers/
│   │   │   └── screens/
│   │   ├── parent/
│   │   │   ├── data/
│   │   │   ├── models/
│   │   │   ├── providers/
│   │   │   └── screens/
│   │   ├── teacher/
│   │   │   ├── data/
│   │   │   ├── models/
│   │   │   ├── providers/
│   │   │   └── screens/
│   │   ├── admin/
│   │   │   ├── data/
│   │   │   ├── models/
│   │   │   ├── providers/
│   │   │   └── screens/
│   │   ├── lms/
│   │   │   ├── data/
│   │   │   ├── models/
│   │   │   ├── providers/
│   │   │   └── screens/
│   │   ├── coding/
│   │   │   ├── data/
│   │   │   ├── models/
│   │   │   ├── providers/
│   │   │   └── screens/
│   │   ├── competitions/
│   │   │   ├── data/
│   │   │   ├── models/
│   │   │   ├── providers/
│   │   │   └── screens/
│   │   ├── ai/
│   │   │   ├── data/
│   │   │   ├── models/
│   │   │   ├── providers/
│   │   │   └── screens/
│   │   ├── notifications/
│   │   │   ├── data/
│   │   │   ├── models/
│   │   │   ├── providers/
│   │   │   └── screens/
│   │   └── chat/
│   │       ├── data/
│   │       ├── models/
│   │       ├── providers/
│   │       └── screens/
│   └── shared/
│       ├── theme/
│       │   ├── app_theme.dart
│       │   ├── app_colors.dart
│       │   └── app_typography.dart
│       ├── widgets/
│       │   ├── buttons/
│       │   ├── cards/
│       │   ├── loading/
│       │   ├── error/
│       │   └── navigation/
│       └── utils/
│           ├── formatters.dart
│           └── validators.dart
├── test/
│   ├── unit/
│   ├── widget/
│   ├── integration/
│   └── security/
└── pubspec.yaml
```

---

## 4. Current Flutter State

### 4.1 File Inventory

| Category | Count | Files |
|----------|-------|-------|
| Dart files | 27 | main.dart, 11 screens, 11 widgets, 2 services, 1 test |
| Screens | 11 | SplashScreen, LoginPage, ForgetPassword, home, RequestLogin, RequestProcessing, Attendance (3), ExamResult, LeaveApply |
| Widgets | 11 | AppBar, BouncingButton, DashboardCards, MainDrawer, NavigationDrawer, DrawerListTile, UserDetailCard, AttendanceCard, OverAllAttendanceCard, SubjectCard, datepicker |
| Services | 2 | Auth_services (Firebase), UserModel (Firebase) |
| Tests | 1 | widget_test.dart (default) |

### 4.2 Current Dependencies

```yaml
# Current pubspec.yaml
dependencies:
  flutter: sdk
  cupertino_icons: ^1.0.8
  firebase_auth: ^5.3.4          # TO REMOVE
  google_sign_in: ^6.2.2         # TO REMOVE
  dropdown_search: ^6.0.1        # TO KEEP
  date_time_picker: ^2.1.0       # TO KEEP
  fzregex: ^2.0.0               # TO REMOVE
  firebase_core: ^3.9.0          # TO REMOVE
  flutter_svg: ^2.0.16           # TO KEEP
  flare_flutter: ^3.0.2          # TO REMOVE
  randomizer_null_safe: ^0.1.5   # TO REMOVE
  flrx_validator: ^0.6.0         # TO REMOVE
  flutter_randomcolor: ^1.0.16   # TO REMOVE
```

### 4.3 Current Issues

| Issue | Severity | File |
|-------|----------|------|
| Firebase dependencies | Critical | pubspec.yaml |
| Firebase auth in LoginPage | Critical | LoginPage.dart |
| Firebase init in main.dart | Critical | main.dart |
| Firebase init in home.dart | Critical | home.dart |
| Exam_Rseult.dart typo | Medium | Exam_Rseult.dart |
| Hardcoded student data | High | UserDetailCard.dart |
| Hardcoded attendance data | High | TodayAttendance.dart, OverallAttendance.dart |
| Hardcoded exam data | High | Exam_Rseult.dart |
| No API integration | Critical | All files |
| Old Android SDK (29) | Medium | android/app/build.gradle |
| Old Kotlin version | Medium | android/build.gradle |
| Commented-out code | Low | LoginPage.dart (lines 345-716) |
| Brand name "Rise Education Center" | Low | main.dart |

---

## 5. Laravel State

### 5.1 Backend Statistics

| Metric | Value |
|--------|-------|
| Controllers | 129 |
| Models | 118 |
| API Routes | 206+ |
| Database Tables | 120+ |
| Roles | 16 (including guest) |
| Permissions | ~120 |
| Migrations | 120+ |
| Seeders | 15+ |

### 5.2 API Route Groups

| Group | Prefix | Routes | Middleware |
|-------|--------|--------|-----------|
| Auth | `/login`, `/register` | 2 | Public |
| Profile | `/profile` | 4 | `auth:sanctum` |
| Dashboard | `/dashboard` | 2 | `auth:sanctum` |
| Notifications | `/notifications` | 6 | `auth:sanctum` |
| Courses | `/courses` | 8 | `auth:sanctum` |
| Enrollments | `/enrollments` | 6 | `auth:sanctum` |
| Certificates | `/certificates` | 6 | `auth:sanctum` |
| Admin | `/admin` | 50+ | `role:admin\|super_admin\|director\|branch_manager\|school_admin` |
| Students | `/students` | 20+ | `role:admin\|super_admin\|director\|branch_manager\|school_admin` |
| Teacher | `/teacher` | 30+ | `role:teacher\|instructor\|admin\|super_admin\|director\|branch_manager\|school_admin` |
| Parent | `/parent` | 15+ | `role:parent\|admin\|super_admin` |
| Finance | `/finance` | 20+ | `role:admin\|super_admin\|accountant` |
| HR | `/hr` | 25+ | `role:admin\|super_admin\|hr_officer` |
| My HR | `/my/hr` | 10+ | `role:employee\|admin\|super_admin` |
| Inventory | `/inventory` | 15+ | `role:admin\|super_admin\|inventory_officer` |
| Library | `/library` | 15+ | `role:admin\|super_admin\|librarian` |
| LMS | `/lms` | 30+ | `auth:sanctum` |
| Robotics | `/robotics` | 20+ | `auth:sanctum` |
| Competitions | `/competitions` | 15+ | `auth:sanctum` |
| Chat | `/chat` | 5 | `role:parent\|instructor\|admin\|super_admin` |
| Organization | `/organization` | 15+ | `role:admin\|super_admin\|director\|branch_manager\|school_admin` |
| Analytics | `/admin/analytics` | 10+ | `role:admin\|super_admin\|director\|branch_manager\|school_admin\|accountant` |

### 5.3 Role Definitions (from RoleSeeder.php)

| Role | Display Name | Description |
|------|--------------|-------------|
| `super_admin` | Super Admin | Full system access with all permissions |
| `admin` | Administrator | System administrator with broad access |
| `instructor` | Instructor | Course instructor who can manage courses and quizzes |
| `teacher` | Teacher | Teacher who manages classes, assignments, exams and grades |
| `employee` | Employee | Company employee with standard access |
| `student` | Student | Student who can enroll in courses |
| `parent` | Parent | Parent or guardian with access to the Parent Portal |
| `judge` | Judge | External or internal judge who scores competition teams |
| `hr_officer` | HR Officer | Human resources officer |
| `inventory_officer` | Inventory Officer | Inventory officer |
| `librarian` | Librarian | Librarian |
| `director` | Director | School director with cross-branch oversight |
| `branch_manager` | Branch Manager | Branch manager with operational access |
| `school_admin` | School Admin | School-level administrator |
| `accountant` | Accountant | Accountant who manages finance |
| `guest` | Guest | Unauthenticated visitor |

---

## 6. React State

### 6.1 Frontend Statistics

| Metric | Value |
|--------|-------|
| Route definitions | 206 |
| Page files | 141 |
| Navigation sections | 23 |
| Navigation items | 129 |
| Orphan routes | 57 (detail/edit/create pages) |
| Role groups | 14 |
| Total distinct roles | 15 |

### 6.2 Navigation Sections

| # | Section | Items | Role Restriction |
|---|---------|-------|------------------|
| 1 | Dashboard | 1 | All 15 roles |
| 2 | Organization | 4 | SIS_ROLES (5) |
| 3 | Students | 8 | SIS_ROLES (5) |
| 4 | Parents | 9 | `['parent']` |
| 5 | Teachers | 9 | TEACHER_ROLES (6) |
| 6 | Academics | 9 | ACADEMICS_ROLES (7) |
| 7 | Learning / LMS | 6 | LEARNER_ROLES (6) |
| 8 | Coding Lab | 3 | CODING_ROLES (5) |
| 9 | Robotics Lab | 6 | ROBOTICS_ROLES (5) |
| 10 | Competitions | 3 | 6 roles |
| 11 | Finance | 10 | FINANCE_ROLES (4) |
| 12 | Human Resources | 9 | HR_ROLES (3) |
| 13 | My HR | 3 | `['employee','super_admin','admin']` |
| 14 | Inventory | 6 | INVENTORY_ROLES (3) |
| 15 | Library | 8 | 8 roles + admin sub-items |
| 16 | Certificates | 5 | 6 roles + admin sub-items |
| 17 | AI Platform | 3 | All 15 roles |
| 18 | Website / CMS | 10 | CMS_ROLES (2) |
| 19 | Communication | 6 | All 15 roles |
| 20 | Project Management | 2 | `['super_admin','admin','employee']` |
| 21 | Reports & Analytics | 2 | `['super_admin','admin','director','school_admin']` |
| 22 | Administration | 10 | ADMIN_ROLES (2) |
| 23 | Settings | 12 | All 15 roles (10 admin-only) |

---

## 7. Three-Way Module Matrix

### 7.1 Module Coverage Comparison

| Module | Laravel API | React Frontend | Flutter Mobile | Mobile Scope |
|--------|-------------|----------------|----------------|--------------|
| Auth | ✓ | ✓ | ✗ (Firebase) | Full |
| Dashboard | ✓ | ✓ | ✗ (stub) | Full |
| Students (SIS) | ✓ | ✓ | ✗ | Admin read-only |
| Parent Portal | ✓ | ✓ | ✗ | Full |
| Teacher Portal | ✓ | ✓ | ✗ | Full |
| Learning/LMS | ✓ | ✓ | ✗ | Full |
| Coding Lab | ✓ | ✓ | ✗ | Student focus |
| Competitions | ✓ | ✓ | ✗ | Student focus |
| AI Platform | ✓ | ✓ | ✗ | Student focus |
| Finance | ✓ | ✓ | ✗ | Summary only (admin) |
| HR | ✓ | ✓ | ✗ | None |
| Inventory | ✓ | ✓ | ✗ | None |
| Library | ✓ | ✓ | ✗ | Catalog only |
| Certificates | ✓ | ✓ | ✗ | Student/parent view |
| Notifications | ✓ | ✓ | ✗ | Full |
| Chat/Messages | ✓ | ✓ | ✗ | Full |
| Robotics | ✓ | ✓ | ✗ | Student focus |
| CMS | ✓ | ✓ | ✗ | None |
| Settings | ✓ | ✓ | ✗ | Profile only |
| Analytics | ✓ | ✓ | ✗ | Admin summary |

### 7.2 Mobile Scope Decision Matrix

| Module | Student | Parent | Teacher | Admin | Reason |
|--------|---------|--------|---------|-------|--------|
| Dashboard | ✓ | ✓ | ✓ | ✓ | Core feature |
| Courses | ✓ | ✓ (read) | ✓ (manage) | ✓ (summary) | Core feature |
| Attendance | ✓ (view) | ✓ (view children) | ✓ (mark) | ✓ (view) | Core feature |
| Assignments | ✓ (submit) | ✗ | ✓ (manage) | ✗ | Student/teacher focus |
| Exams | ✓ (view) | ✓ (view children) | ✓ (manage) | ✗ | Student/teacher focus |
| Grades | ✓ (view) | ✓ (view children) | ✓ (view) | ✗ | Student/teacher focus |
| Certificates | ✓ (view) | ✗ | ✗ | ✓ (manage) | Student/admin focus |
| Fees | ✗ | ✓ | ✗ | ✓ (summary) | Parent/admin focus |
| Notifications | ✓ | ✓ | ✓ | ✓ | All roles |
| Chat/Messages | ✓ | ✓ | ✓ | ✗ | Communication |
| AI Tutor | ✓ | ✗ | ✗ | ✗ | Student only |
| Coding Playground | ✓ | ✗ | ✗ | ✗ | Student only |
| Competitions | ✓ | ✗ | ✓ (manage) | ✓ (manage) | Student/teacher focus |
| Library | ✓ (catalog) | ✓ (catalog) | ✓ (catalog) | ✓ (admin) | Read-heavy |
| HR | ✗ | ✗ | ✗ | ✗ | Too complex for mobile |
| Inventory | ✗ | ✗ | ✗ | ✗ | Too complex for mobile |
| Finance (detailed) | ✗ | ✗ | ✗ | ✗ | Too complex for mobile |
| CMS | ✗ | ✗ | ✗ | ✗ | Web only |
| Settings (admin) | ✗ | ✗ | ✗ | ✓ (limited) | Admin only |

---

## 8. Authentication Architecture

### 8.1 Current State (Firebase)

```
LoginPage.dart
  └── FirebaseAuth.instance.signInWithEmailAndPassword()
        └── Returns Firebase User
              └── UserModel(uid: user.uid)
                    └── No role information
                    └── No API integration
```

### 8.2 Target State (Sanctum)

```
LoginScreen.dart
  └── AuthService.login(email, password)
        └── POST /login (Dio)
              └── Returns { token, user }
                    └── Token stored in flutter_secure_storage
                    └── User stored in内存 (with role/permissions)
                    └── Navigation filtered by role
```

### 8.3 Auth Flow

```
App Launch
  └── SplashScreen
        └── Check stored token
              ├── Token exists → Validate with GET /profile
              │     ├── Valid → Dashboard (role-based)
              │     └── Invalid → LoginScreen
              └── No token → LoginScreen
                    └── User enters credentials
                          └── POST /login
                                ├── Success → Store token → Dashboard
                                └── Failure → Show error
```

### 8.4 Token Management

```dart
// Token storage
class TokenStorage {
  static const _key = 'auth_token';
  
  Future<void> saveToken(String token) async {
    final storage = FlutterSecureStorage();
    await storage.write(key: _key, value: token);
  }
  
  Future<String?> getToken() async {
    final storage = FlutterSecureStorage();
    return await storage.read(key: _key);
  }
  
  Future<void> clearToken() async {
    final storage = FlutterSecureStorage();
    await storage.delete(key: _key);
  }
}
```

---

## 9. Authorization Architecture

### 9.1 Client-Side Authorization

```
Auth State (Riverpod)
  └── User object with role
        └── Role-based route guards
              └── Navigation filtering
                    └── Screen access control
```

### 9.2 Server-Side Authorization

```
API Request
  └── Bearer token in header
        └── Sanctum validates token
              └── Role middleware checks role
                    ├── Authorized → Response
                    └── Unauthorized → 403
```

### 9.3 Authorization Layers

| Layer | Mechanism | Enforcement |
|-------|-----------|-------------|
| Navigation | `roles[]` per nav item | Client-side |
| Route Guards | `meta.roles` per route | Client-side |
| API Middleware | `role:admin\|super_admin` | Server-side |
| Data Scoping | `parent_id`, `teacher_id` | Server-side |

---

## 10. Navigation Architecture

### 10.1 Current State (Flutter)

```
MainDrawer.dart
  ├── Home (hardcoded)
  ├── Attendance (hardcoded)
  ├── Class work (stub)
  ├── Profile (stub)
  ├── Examination (hardcoded)
  ├── Fees (stub)
  ├── Time Table (stub)
  ├── Library (stub)
  ├── Downloads (stub)
  ├── Track (stub)
  ├── Leave apply (hardcoded)
  ├── Activity (stub)
  └── Notification (stub)
```

### 10.2 Target State (Flutter)

```
NavigationDrawer (dynamic)
  ├── Role-based filtering
  ├── Backend-driven items
  ├── Deep linking support
  └── Bottom navigation bar
```

### 10.3 Navigation Items per Role

| Role | Navigation Items |
|------|------------------|
| Student | 15 items (Dashboard, Learning, Coding, Competitions, Academics, Communication, Profile, Settings) |
| Parent | 12 items (Dashboard, Children, Academics, Finance, Appointments, Communication, Profile, Settings) |
| Teacher | 14 items (Dashboard, Classes, Academics, Teaching, Competitions, Communication, Profile, Settings) |
| Admin | 13 items (Dashboard, Students, Teachers, Finance, Analytics, Administration, Notifications, Profile, Settings) |

---

## 11. API Architecture

### 11.1 API Client (Dio)

```dart
class ApiClient {
  late Dio _dio;
  
  ApiClient({required String baseUrl}) {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: Duration(seconds: 30),
      receiveTimeout: Duration(seconds: 30),
    ));
    
    _dio.interceptors.addAll([
      AuthInterceptor(),
      LogInterceptor(),
    ]);
  }
  
  Future<Response> get(String path) async {
    return _dio.get(path);
  }
  
  Future<Response> post(String path, {dynamic data}) async {
    return _dio.post(path, data: data);
  }
  
  Future<Response> put(String path, {dynamic data}) async {
    return _dio.put(path, data: data);
  }
  
  Future<Response> delete(String path) async {
    return _dio.delete(path);
  }
}
```

### 11.2 Auth Interceptor

```dart
class AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = TokenStorage.getToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }
  
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) {
      // Token expired or invalid
      TokenStorage.clearToken();
      // Navigate to login
    }
    handler.next(err);
  }
}
```

---

## 12. Model Architecture

### 12.1 Model Generation

```dart
// Using json_serializable
@JsonSerializable()
class UserModel {
  final int id;
  final String name;
  final String email;
  final Role role;
  final String? avatarUrl;
  
  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.avatarUrl,
  });
  
  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
  
  Map<String, dynamic> toJson() => _$UserModelToJson(this);
}
```

### 12.2 Model Categories

| Category | Models |
|----------|--------|
| Auth | User, Role, Permission, Token |
| Student | Student, Enrollment, Attendance, Assignment, Exam, Grade, Certificate |
| Parent | Child, ParentAttendance, ParentProgress, ReportCard, Fee |
| Teacher | Class, Roster, TeacherAssignment, TeacherExam, Gradebook, LessonNote |
| Admin | AdminStats, StudentList, TeacherOverview |
| LMS | Course, Lesson, Quiz, ForumThread, ForumPost, Bookmark |
| Coding | CodeExercise, CodeSubmission, Leaderboard, Workspace |
| Competitions | Competition, Team, CompetitionLeaderboard |
| AI | AiAssistant, Conversation, Message |
| Notifications | Notification, NotificationPreference |
| Chat | ChatMessage, ChatConversation |

---

## 13. UI/UX Architecture

### 13.1 Design System

```dart
// Coder's Hero Brand Colors
class AppColors {
  // Primary
  static const primary = Color(0xFF2196F3);      // Blue
  static const primaryDark = Color(0xFF1976D2);
  static const primaryLight = Color(0xFFBBDEFB);
  
  // Secondary
  static const secondary = Color(0xFF4CAF50);     // Green
  static const secondaryDark = Color(0xFF388E3C);
  static const secondaryLight = Color(0xFFC8E6C9);
  
  // Accent
  static const accent = Color(0xFFFF9800);        // Orange
  
  // Neutral
  static const background = Color(0xFFF5F5F5);
  static const surface = Color(0xFFFFFFFF);
  static const error = Color(0xFFE53935);
  static const text = Color(0xFF212121);
  static const textSecondary = Color(0xFF757575);
}
```

### 13.2 Typography

```dart
class AppTypography {
  static const h1 = TextStyle(fontSize: 32, fontWeight: FontWeight.bold);
  static const h2 = TextStyle(fontSize: 24, fontWeight: FontWeight.bold);
  static const h3 = TextStyle(fontSize: 20, fontWeight: FontWeight.w600);
  static const body1 = TextStyle(fontSize: 16);
  static const body2 = TextStyle(fontSize: 14);
  static const caption = TextStyle(fontSize: 12);
}
```

---

## 14. Coding Architecture

### 14.1 State Management (Riverpod)

```dart
// Provider example
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authServiceProvider));
});

// Screen example
class StudentDashboardScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final coursesAsync = ref.watch(coursesProvider);
    
    return Scaffold(
      body: coursesAsync.when(
        data: (courses) => CourseList(courses: courses),
        loading: () => ShimmerLoading(),
        error: (error, stack) => ErrorWidget(error: error),
      ),
    );
  }
}
```

### 14.2 Folder Structure Pattern

```
feature/
├── data/
│   ├── api_service.dart       # API calls
│   └── repository.dart        # Business logic
├── models/
│   └── model.dart             # Data models
├── providers/
│   └── provider.dart          # State management
└── screens/
    ├── list_screen.dart       # List view
    └── detail_screen.dart     # Detail view
```

---

## 15. AI Architecture

### 15.1 AI Integration

```
AI Feature
  ├── AI Dashboard (assistant list, usage)
  ├── AI Platform (conversations, messages)
  ├── AI Tutor (course-specific help)
  └── Coding AI (hints, debug)
```

### 15.2 AI APIs

```
GET  /lms/ai/assistants
GET  /lms/ai/assistants/{slug}
GET  /lms/ai/conversations
POST /lms/ai/conversations
POST /lms/ai/conversations/{id}/messages
GET  /lms/ai/my-usage
POST /lms/coding-ai/hint
POST /lms/coding-ai/debug
```

---

## 16. Finance Architecture (Mobile Scope)

### 16.1 Mobile Finance Scope

| Feature | Mobile | Reason |
|---------|--------|--------|
| Finance Summary | ✓ (Admin) | Quick overview |
| Invoices | ✓ (Admin) | View only |
| Payments | ✓ (Admin) | View only |
| Outstanding | ✓ (Admin) | View only |
| Fees (Parent) | ✓ | View own fees |
| Payments (Parent) | ✓ | Make payments |
| M-Pesa | ✓ | STK push |
| Budgets | ✗ | Too complex |
| Expenses | ✗ | Too complex |
| Fee Structures | ✗ | Admin only (web) |

---

## 17. Notification Architecture

### 17.1 Notification Types

| Type | Source | Mobile |
|------|--------|--------|
| Push Notification | FCM | ✓ |
| In-App Notification | API | ✓ |
| Email | Backend | ✗ (web only) |
| SMS | Backend | ✗ (web only) |

### 17.2 FCM Integration

```dart
// Firebase Cloud Messaging (allowed for notifications only)
class PushNotificationService {
  Future<void> initialize() async {
    final messaging = FirebaseMessaging.instance;
    
    // Request permission
    await messaging.requestPermission();
    
    // Get token
    final token = await messaging.getToken();
    
    // Register token with backend
    await api.post('/fcm-tokens', data: {'token': token});
    
    // Handle messages
    messaging.onMessage.listen((message) {
      // Show in-app notification
    });
  }
}
```

---

## 18. Dependency Strategy

### 18.1 Dependencies to Remove

```yaml
# REMOVE (Firebase)
firebase_auth: ^5.3.4
firebase_core: ^3.9.0
google_sign_in: ^6.2.2

# REMOVE (Unused)
flare_flutter: ^3.0.2
randomizer_null_safe: ^0.1.5
fzregex: ^2.0.0
flrx_validator: ^0.6.0
flutter_randomcolor: ^1.0.16
```

### 18.2 Dependencies to Add

```yaml
# Core
dio: ^5.4.0
flutter_secure_storage: ^9.0.0
go_router: ^14.0.0
flutter_riverpod: ^2.5.0

# UI
shimmer: ^3.0.0
google_fonts: ^6.0.0
cached_network_image: ^3.3.0
flutter_svg: ^2.0.16

# Storage
hive: ^2.2.0
hive_flutter: ^1.1.0

# Connectivity
connectivity_plus: ^5.0.0

# Security
flutter_jailbreak_detection: ^1.10.0

# Notifications (FCM only)
firebase_messaging: ^14.7.0
firebase_core: ^3.9.0  # Required for FCM

# Code generation
json_annotation: ^4.8.0
build_runner: ^2.4.0
json_serializable: ^6.7.0
```

### 18.3 Dependencies to Keep

```yaml
cupertino_icons: ^1.0.8
dropdown_search: ^6.0.1
date_time_picker: ^2.1.0
flutter_svg: ^2.0.16
```

---

## 19. File Change Strategy

### 19.1 Files to DELETE

```
DELETE:
├── lib/services/Auth_services.dart (Firebase auth)
├── lib/services/UserModel.dart (Firebase model)
├── lib/Screens/Exam/Exam_Rseult.dart (typo, will recreate)
├── lib/Widgets/NavigationDrawer.dart (will recreate)
└── android/app/google-services.json (Firebase config)
```

### 19.2 Files to REWRITE

```
REWRITE:
├── lib/main.dart (remove Firebase, add architecture)
├── lib/Screens/LoginPage.dart (Sanctum auth)
├── lib/Screens/SplashScreen.dart (auto-login)
├── lib/Screens/home.dart (role-based dashboard)
├── lib/Widgets/MainDrawer.dart (dynamic navigation)
├── lib/Widgets/UserDetailCard.dart (API data)
├── lib/Widgets/DashboardCards.dart (role-based)
├── lib/Screens/Attendance/TodayAttendance.dart (API data)
├── lib/Screens/Attendance/OverallAttendance.dart (API data)
└── pubspec.yaml (dependencies)
```

### 19.3 Files to CREATE

```
CREATE (200+ files):
├── lib/app.dart
├── lib/config/ (3 files)
├── lib/core/api/ (5 files)
├── lib/core/auth/ (4 files)
├── lib/core/navigation/ (3 files)
├── lib/core/cache/ (3 files)
├── lib/core/security/ (3 files)
├── lib/features/auth/ (10 files)
├── lib/features/student/ (20 files)
├── lib/features/parent/ (15 files)
├── lib/features/teacher/ (18 files)
├── lib/features/admin/ (10 files)
├── lib/features/lms/ (12 files)
├── lib/features/coding/ (8 files)
├── lib/features/competitions/ (6 files)
├── lib/features/ai/ (8 files)
├── lib/features/notifications/ (5 files)
├── lib/features/chat/ (6 files)
├── lib/shared/theme/ (4 files)
├── lib/shared/widgets/ (15 files)
├── lib/shared/utils/ (3 files)
└── test/ (50+ files)
```

---

## 20. Phase-by-Phase Implementation Strategy

### 20.1 Phase Summary

| Phase | Name | Duration | Priority |
|-------|------|----------|----------|
| 0 | Baseline & Architecture | 1 day | Critical |
| 1 | Project Cleanup | 2 days | Critical |
| 2 | API Client | 3 days | Critical |
| 3 | Authentication | 3 days | Critical |
| 4 | Role & Permission Engine | 2 days | Critical |
| 5 | Dynamic Navigation | 2 days | High |
| 6 | Design System | 3 days | High |
| 7 | Student Core | 5 days | Critical |
| 8 | Parent Core | 4 days | High |
| 9 | Teacher Core | 5 days | High |
| 10 | Admin Core | 3 days | Medium |
| 11 | LMS & Academic | 4 days | High |
| 12 | Coding Lab | 4 days | Medium |
| 13 | Competitions | 3 days | Medium |
| 14 | AI Features | 3 days | Medium |
| 15 | Notifications | 3 days | High |
| 16 | Offline/Caching | 3 days | Medium |
| 17 | Security Hardening | 2 days | High |
| 18 | Complete Testing | 4 days | Critical |
| 19 | Performance | 2 days | Medium |
| 20 | Release Prep | 2 days | Critical |
| **Total** | | **63 days** | |

### 20.2 Critical Path

```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
                                                              ↓
                                              Phase 7 (Student Core)
                                                              ↓
                                    Phase 8 (Parent) → Phase 9 (Teacher)
                                                              ↓
                                              Phase 10 (Admin) → Phase 11 (LMS)
                                                              ↓
                                    Phase 12 (Coding) → Phase 13 (Competitions)
                                                              ↓
                                              Phase 14 (AI) → Phase 15 (Notifications)
                                                              ↓
                                    Phase 16 (Offline) → Phase 17 (Security)
                                                              ↓
                                              Phase 18 (Testing) → Phase 19 (Performance)
                                                              ↓
                                                      Phase 20 (Release)
```

---

## 21. Testing Strategy

### 21.1 Testing Layers

| Layer | Coverage | Tools | Frequency |
|-------|----------|-------|-----------|
| Unit Tests | 80%+ | flutter_test, mockito | Every PR |
| Widget Tests | All screens | flutter_test | Every PR |
| Integration Tests | Critical flows | integration_test | Nightly |
| Role-Based Tests | All 4 roles | flutter_test | Every PR |
| Security Tests | All auth flows | flutter_test | Every PR |
| Performance Tests | Key metrics | flutter_test | Weekly |
| Offline Tests | Network handling | flutter_test | Weekly |

### 21.2 Test Execution

```bash
# Unit tests
flutter test

# With coverage
flutter test --coverage

# Integration tests
flutter test integration_test/

# Generate report
genhtml coverage/lcov.info -o coverage/html
```

---

## 22. Security Strategy

### 22.1 Security Layers

| Layer | Mechanism | Implementation |
|-------|-----------|----------------|
| Transport | HTTPS | Dio configured with HTTPS |
| Authentication | Sanctum tokens | flutter_secure_storage |
| Authorization | Role middleware | Server-side enforcement |
| Data Scoping | parent_id, teacher_id | Server-side filtering |
| Certificate Pinning | SSL pinning | flutter_ssl_pinning |
| Jailbreak Detection | Root/jailbreak check | flutter_jailbreak_detection |
| Input Validation | Form validation | Client + server side |
| Secure Storage | Encrypted storage | flutter_secure_storage |

### 22.2 Security Checklist

- [ ] No secrets hardcoded in source
- [ ] Token stored in flutter_secure_storage
- [ ] HTTPS enforced for all API calls
- [ ] Certificate pinning implemented
- [ ] Jailbreak detection implemented
- [ ] Input validation on all forms
- [ ] API responses validated
- [ ] Error messages don't leak sensitive info
- [ ] Logs don't contain sensitive data
- [ ] Session timeout implemented

---

## 23. Risks

### 23.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Firebase removal breaks app | High | High | Phase 1 comprehensive cleanup |
| API integration issues | Medium | High | Test against actual backend early |
| State management complexity | Medium | Medium | Use Riverpod, follow patterns |
| Performance issues | Medium | Medium | Profile early, optimize late |
| Offline sync conflicts | Low | Medium | Cache-read only for most data |
| FCM setup complexity | Low | Medium | Use Firebase for notifications only |

### 23.2 Project Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Timeline overrun | Medium | High | Phase by phase, MVP first |
| Scope creep | High | High | Stick to mobile scope matrix |
| Backend changes needed | Low | Medium | Use existing APIs |
| Design changes | Medium | Low | Design system first |

---

## 24. Recommended Implementation Order

### 24.1 MVP (Weeks 1-4)

1. **Phase 0-1**: Baseline & Cleanup (3 days)
2. **Phase 2-3**: API Client & Auth (6 days)
3. **Phase 4-5**: Roles & Navigation (4 days)
4. **Phase 6**: Design System (3 days)
5. **Phase 7**: Student Core (5 days)

**MVP Deliverable:** Student can login, view dashboard, courses, attendance, assignments, grades.

### 24.2 Core Features (Weeks 5-8)

6. **Phase 8**: Parent Core (4 days)
7. **Phase 9**: Teacher Core (5 days)
8. **Phase 10**: Admin Core (3 days)
9. **Phase 11**: LMS (4 days)

**Core Deliverable:** All 4 roles can use app for core functions.

### 24.3 Advanced Features (Weeks 9-12)

10. **Phase 12**: Coding Lab (4 days)
11. **Phase 13**: Competitions (3 days)
12. **Phase 14**: AI Features (3 days)
13. **Phase 15**: Notifications (3 days)

**Advanced Deliverable:** Full feature set available.

### 24.4 Production Ready (Weeks 13-16)

14. **Phase 16**: Offline (3 days)
15. **Phase 17**: Security (2 days)
16. **Phase 18**: Testing (4 days)
17. **Phase 19**: Performance (2 days)
18. **Phase 20**: Release (2 days)

**Production Deliverable:** App ready for store submission.

---

## 25. Final Gap Summary

### 25.1 CURRENT FLUTTER APPLICATION

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Dart files | 27 | 200+ | 173+ new files |
| Screens | 11 | 60+ | 49+ new screens |
| API integrations | 0 | 80+ | 80+ new integrations |
| Models | 1 (Firebase) | 30+ | 29+ new models |
| Services | 2 (Firebase) | 15+ | 13+ new services |
| Providers | 0 | 20+ | 20+ new providers |
| Tests | 1 (default) | 200+ | 199+ new tests |
| Dependencies | Firebase-based | Sanctum-based | Complete replacement |

### 25.2 REUSABLE

| Component | Reusable | Notes |
|-----------|----------|-------|
| `DropdownSearch` widget | ✓ | Keep for dropdowns |
| `DatePicker` widget | ✓ | Keep for date selection |
| `flutter_svg` | ✓ | Keep for SVG rendering |
| `AppBar` pattern | Partial | Rewrite with theme |
| `DashboardCard` pattern | Partial | Rewrite with API data |
| `AttendanceCard` pattern | Partial | Rewrite with API data |
| `SubjectCard` pattern | Partial | Rewrite with API data |
| `BouncingButton` | ✓ | Keep as utility |
| Animation patterns | ✓ | Keep animation approach |

### 25.3 REBUILD

| Component | Reason | Approach |
|-----------|--------|----------|
| Login screen | Firebase auth → Sanctum | Complete rewrite |
| Home screen | Hardcoded → API | Complete rewrite |
| Attendance screens | Hardcoded → API | Complete rewrite |
| Exam screen | Hardcoded → API | Complete rewrite |
| Navigation drawer | Static → Dynamic | Complete rewrite |
| User detail card | Hardcoded → API | Complete rewrite |
| Splash screen | Firebase → Sanctum | Complete rewrite |

### 25.4 REMOVE

| Component | Reason |
|-----------|--------|
| Firebase dependencies | Incompatible with Sanctum |
| Firebase auth service | Replaced with Sanctum auth |
| Firebase user model | Replaced with Sanctum model |
| `flare_flutter` | Not needed |
| `randomizer_null_safe` | Not needed |
| `fzregex` | Not needed |
| `flrx_validator` | Not needed |
| `flutter_randomcolor` | Not needed |
| Commented-out code | Technical debt |
| `firebase_options.dart` | Firebase config |

### 25.5 NEW

| Category | Count | Examples |
|----------|-------|----------|
| Core files | 15 | ApiClient, AuthInterceptor, TokenStorage, AppRouter |
| Auth feature | 10 | LoginScreen, AuthService, AuthProvider, UserModel |
| Student feature | 20 | Dashboard, Courses, Attendance, Assignments, Grades |
| Parent feature | 15 | Dashboard, Children, Progress, Fees, ReportCards |
| Teacher feature | 18 | Dashboard, Classes, Assignments, Exams, Gradebook |
| Admin feature | 10 | Dashboard, Students, Teachers, Finance, Analytics |
| LMS feature | 12 | CoursePlayer, Quizzes, Forum, Bookmarks |
| Coding feature | 8 | Playground, Exercises, Leaderboard |
| Competition feature | 6 | Competitions, Teams, Leaderboard |
| AI feature | 8 | Assistants, Conversations, Chat |
| Notification feature | 5 | NotificationList, Preferences |
| Chat feature | 6 | Inbox, Conversations, Messages |
| Shared widgets | 15 | Buttons, Cards, Loading, Error, Navigation |
| Theme | 4 | Theme, Colors, Typography, Spacing |
| Utils | 3 | Formatters, Validators, Constants |
| Tests | 200+ | Unit, Widget, Integration, Security |

### 25.6 BACKEND GAPS

| Gap | Impact | Resolution |
|-----|--------|------------|
| No FCM endpoint for mobile registration | Low | Add `/fcm-tokens` endpoint (exists) |
| No mobile-specific API endpoints | Low | Use existing web APIs |
| No rate limiting for mobile | Low | Use existing throttle middleware |
| No mobile app version check | Low | Add `/app/version` endpoint |

### 25.7 FLUTTER GAPS

| Gap | Priority | Phase |
|-----|----------|-------|
| No API client | Critical | Phase 2 |
| No auth integration | Critical | Phase 3 |
| No role-based access | Critical | Phase 4 |
| No dynamic navigation | High | Phase 5 |
| No design system | High | Phase 6 |
| No student screens | Critical | Phase 7 |
| No parent screens | High | Phase 8 |
| No teacher screens | High | Phase 9 |
| No admin screens | Medium | Phase 10 |
| No LMS screens | High | Phase 11 |
| No coding screens | Medium | Phase 12 |
| No competition screens | Medium | Phase 13 |
| No AI screens | Medium | Phase 14 |
| No notification integration | High | Phase 15 |
| No offline support | Medium | Phase 16 |
| No security hardening | High | Phase 17 |
| No tests | Critical | Phase 18 |
| No performance optimization | Medium | Phase 19 |
| No release configuration | Critical | Phase 20 |

### 25.8 WEB/FLUTTER GAPS

| Feature | Web | Flutter | Gap |
|---------|-----|---------|-----|
| Dashboard | ✓ | ✗ | Full rebuild |
| Student Management | ✓ | ✗ (admin) | Read-only rebuild |
| Parent Portal | ✓ | ✗ | Full rebuild |
| Teacher Portal | ✓ | ✗ | Full rebuild |
| LMS | ✓ | ✗ | Full rebuild |
| Coding Lab | ✓ | ✗ | Student focus rebuild |
| Competitions | ✓ | ✗ | Student focus rebuild |
| AI Platform | ✓ | ✗ | Student focus rebuild |
| Finance | ✓ | ✗ (summary) | Summary only |
| HR | ✓ | ✗ | Not in scope |
| Inventory | ✓ | ✗ | Not in scope |
| Library | ✓ | ✗ (catalog) | Catalog only |
| Certificates | ✓ | ✗ | View only |
| Notifications | ✓ | ✗ | Full rebuild |
| Chat | ✓ | ✗ | Full rebuild |
| Settings | ✓ | ✗ (profile) | Profile only |
| CMS | ✓ | ✗ | Not in scope |
| Analytics | ✓ | ✗ (admin) | Summary only |

### 25.9 API GAPS

| API Group | Existing | Mobile Needed | Gap |
|-----------|----------|---------------|-----|
| Auth | 8 endpoints | 6 endpoints | ✓ Covered |
| Profile | 4 endpoints | 3 endpoints | ✓ Covered |
| Dashboard | 2 endpoints | 2 endpoints | ✓ Covered |
| Courses | 8 endpoints | 6 endpoints | ✓ Covered |
| Enrollments | 6 endpoints | 4 endpoints | ✓ Covered |
| Student assignments | 4 endpoints | 4 endpoints | ✓ Covered |
| Parent portal | 15 endpoints | 12 endpoints | ✓ Covered |
| Teacher portal | 30 endpoints | 25 endpoints | ✓ Covered |
| Notifications | 6 endpoints | 6 endpoints | ✓ Covered |
| Chat | 5 endpoints | 5 endpoints | ✓ Covered |
| LMS | 30 endpoints | 20 endpoints | ✓ Covered |
| Coding | 10 endpoints | 8 endpoints | ✓ Covered |
| Competitions | 15 endpoints | 8 endpoints | ✓ Covered |
| AI | 10 endpoints | 8 endpoints | ✓ Covered |
| Finance | 20 endpoints | 4 endpoints | ✓ Covered (summary) |

### 25.10 DATABASE GAPS

| Table | Exists | Mobile Need | Gap |
|-------|--------|-------------|-----|
| users | ✓ | ✓ | Covered |
| roles | ✓ | ✓ | Covered |
| permissions | ✓ | ✓ | Covered |
| students | ✓ | ✓ | Covered |
| guardians | ✓ | ✓ | Covered |
| courses | ✓ | ✓ | Covered |
| lessons | ✓ | ✓ | Covered |
| enrollments | ✓ | ✓ | Covered |
| attendance | ✓ | ✓ | Covered |
| assignments | ✓ | ✓ | Covered |
| exams | ✓ | ✓ | Covered |
| grades | ✓ | ✓ | Covered |
| certificates | ✓ | ✓ | Covered |
| fees | ✓ | ✓ | Covered |
| invoices | ✓ | ✓ | Covered (read) |
| notifications | ✓ | ✓ | Covered |
| fcm_tokens | ✓ | ✓ | Covered |
| ai_conversations | ✓ | ✓ | Covered |
| coding_exercises | ✓ | ✓ | Covered |
| competitions | ✓ | ✓ | Covered |

### 25.11 AUTHENTICATION GAPS

| Feature | Backend | Flutter | Gap |
|---------|---------|---------|-----|
| Login | ✓ | ✗ (Firebase) | Replace with Sanctum |
| Register | ✓ | ✗ | Not needed (admin creates) |
| Logout | ✓ | ✗ | Implement |
| Token refresh | ✓ | ✗ | Implement |
| Password reset | ✓ | ✗ | Implement |
| 2FA | ✓ | ✗ | Phase 17 |
| Email verification | ✓ | ✗ | Phase 17 |
| Session management | ✓ | ✗ | Implement |

### 25.12 ROLE/PERMISSION GAPS

| Role | Backend | Flutter | Gap |
|------|---------|---------|-----|
| Student | ✓ | ✗ | Full rebuild |
| Parent | ✓ | ✗ | Full rebuild |
| Teacher | ✓ | ✗ | Full rebuild |
| Instructor | ✓ | ✗ | Same as teacher |
| Admin | ✓ | ✗ | Full rebuild |
| Super Admin | ✓ | ✗ | Same as admin |
| Director | ✓ | ✗ | Same as admin |
| Branch Manager | ✓ | ✗ | Same as admin |
| School Admin | ✓ | ✗ | Same as admin |
| Accountant | ✗ | ✗ | Not in scope |
| HR Officer | ✗ | ✗ | Not in scope |
| Inventory Officer | ✗ | ✗ | Not in scope |
| Librarian | ✗ | ✗ | Not in scope |
| Judge | ✗ | ✗ | Not in scope |
| Employee | ✗ | ✗ | Not in scope |

### 25.13 UI/UX GAPS

| Component | Web | Flutter | Gap |
|-----------|-----|---------|-----|
| Theme | ✓ | ✗ (basic) | Full design system |
| Typography | ✓ | ✗ | Create typography system |
| Colors | ✓ | ✗ (hardcoded) | Create color system |
| Spacing | ✓ | ✗ | Create spacing system |
| Buttons | ✓ | ✗ (basic) | Create button library |
| Cards | ✓ | ✗ (basic) | Create card library |
| Loading states | ✓ | ✗ | Create loading widgets |
| Error states | ✓ | ✗ | Create error widgets |
| Empty states | ✓ | ✗ | Create empty widgets |
| Dark mode | ✓ | ✗ | Implement dark mode |

### 25.14 IMPLEMENTATION ORDER

```
1. Phase 0-1: Baseline & Cleanup (3 days)
2. Phase 2-3: API & Auth (6 days)
3. Phase 4-5: Roles & Navigation (4 days)
4. Phase 6: Design System (3 days)
5. Phase 7: Student Core (5 days) ← MVP
6. Phase 8: Parent Core (4 days)
7. Phase 9: Teacher Core (5 days)
8. Phase 10: Admin Core (3 days)
9. Phase 11: LMS (4 days)
10. Phase 12: Coding (4 days)
11. Phase 13: Competitions (3 days)
12. Phase 14: AI (3 days)
13. Phase 15: Notifications (3 days)
14. Phase 16: Offline (3 days)
15. Phase 17: Security (2 days)
16. Phase 18: Testing (4 days)
17. Phase 19: Performance (2 days)
18. Phase 20: Release (2 days)
```

### 25.15 RISK AREAS

| Risk Area | Impact | Likelihood | Mitigation |
|-----------|--------|------------|------------|
| Firebase removal | High | High | Comprehensive cleanup in Phase 1 |
| API integration | High | Medium | Test against actual backend early |
| State management | Medium | Medium | Use Riverpod, follow patterns |
| Performance | Medium | Medium | Profile early, optimize late |
| Security | High | Low | Follow security checklist |
| Timeline | High | Medium | Phase by phase, MVP first |
| Scope creep | High | High | Stick to mobile scope matrix |
| Backend changes | Medium | Low | Use existing APIs |
| Design consistency | Medium | Medium | Design system first |
| Testing coverage | High | Medium | Test-driven development |

---

*End of Mobile Master Plan.*
