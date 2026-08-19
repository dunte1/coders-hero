# 03 — FLUTTER ROUTE INVENTORY

**Audit Date:** 2026-08-19
**Scope:** All navigation and routing in `Mobile/coders-hero-mobile/`
**Method:** Complete static trace of every Navigator.push() call

---

## 1. Current Routing Architecture

### Routing Mechanism

The Flutter template uses **NO named routes, NO route configuration, NO route guards**. All navigation is performed via inline `Navigator.push()` with `MaterialPageRoute`.

**There is no route file.** No `routes.dart`, no `onGenerateRoute`, no `GoRouter`, no `auto_route`.

### Navigation Flow

```
main.dart
  └── MaterialApp(home: SplashScreen)
        │
        └── SplashScreen [8-second timer]
              │
              └── Navigator.push → MyHomePage (LoginPage)
                    │
                    ├── Navigator.push → Home (Dashboard)
                    │     │
                    │     ├── Navigator.push → Attendance
                    │     │     ├── Tab: TodayAttendance
                    │     │     └── Tab: OverallAttendance
                    │     │
                    │     ├── Navigator.push → ExamResult
                    │     │
                    │     └── Navigator.push → LeaveApply
                    │
                    ├── Navigator.push → ForgetPassword
                    │
                    └── Navigator.push → RequestLogin
                          └── Navigator.push → ProcessingRequest
                                └── Navigator.push → MyHomePage (back to login)
```

---

## 2. Complete Route Map

### 2.1 Screen Navigation (Navigator.push)

| # | From | To | File | Navigation Type |
|---|------|----|------|----------------|
| 1 | main.dart | SplashScreen | SplashScreen.dart | MaterialApp home |
| 2 | SplashScreen | LoginPage (MyHomePage) | LoginPage.dart | Navigator.push after 8s timer |
| 3 | LoginPage | Home | home.dart | Navigator.push (on form submit) |
| 4 | LoginPage | ForgetPassword | ForgetPassword.dart | Navigator.push |
| 5 | LoginPage | RequestLogin | RequestLogin.dart | Navigator.push |
| 6 | Home | Attendance | Attendance.dart | Navigator.push |
| 7 | Home | ExamResult | Exam_Rseult.dart | Navigator.push |
| 8 | Home | LeaveApply | LeaveApply.dart | Navigator.push |
| 9 | RequestLogin | ProcessingRequest | RequestProcessing.dart | Navigator.push |
| 10 | ProcessingRequest | LoginPage | LoginPage.dart | Navigator.push |

### 2.2 Drawer Navigation (from MainDrawer)

| # | Drawer Item | Target Screen | File | Working |
|---|------------|---------------|------|---------|
| 1 | Home | Home | home.dart | ✅ |
| 2 | Attendance | Attendance | Attendance.dart | ✅ |
| 3 | Classwork | — | — | ❌ Stub |
| 4 | Profile | — | — | ❌ Stub |
| 5 | Examination | ExamResult | Exam_Rseult.dart | ✅ |
| 6 | Fees | — | — | ❌ Stub |
| 7 | Time Table | — | — | ❌ Stub |
| 8 | Library | — | — | ❌ Stub |
| 9 | Downloads | — | — | ❌ Stub |
| 10 | Track | — | — | ❌ Stub |
| 11 | Leave Apply | LeaveApply | LeaveApply.dart | ✅ |
| 12 | Activity | — | — | ❌ Stub |
| 13 | Notification | — | — | ❌ Stub |

### 2.3 Dashboard Card Navigation (from Home)

| # | Card | Target Screen | Working |
|---|------|---------------|---------|
| 1 | Attendance | Attendance | ✅ |
| 2 | Profile | — | ❌ Stub |
| 3 | Exam | ExamResult | ✅ |
| 4 | TimeTable | — | ❌ Stub |
| 5 | Library | — | ❌ Stub |
| 6 | Track Bus | — | ❌ Stub |
| 7 | Activity | — | ❌ Stub |
| 8 | Apply Leave | LeaveApply | ✅ |

---

## 3. Route Analysis

### 3.1 Working Routes

| Route | Source | Target | Auth Required | API Dependent |
|-------|--------|--------|--------------|---------------|
| SplashScreen → LoginPage | Timer (8s) | LoginPage | No | No |
| LoginPage → Home | Form submit | Home | No (fake) | No (fake) |
| Home → Attendance | Card tap | Attendance | No | No |
| Home → ExamResult | Card tap | ExamResult | No | No |
| Home → LeaveApply | Card tap | LeaveApply | No | No |
| Attendance → TodayAttendance | Tab | TodayAttendance | No | No |
| Attendance → OverallAttendance | Tab | OverallAttendance | No | No |

### 3.2 Broken/Stub Routes

| Route | Expected Target | Issue |
|-------|----------------|-------|
| Home → Profile | Profile screen | No navigation implemented |
| Home → TimeTable | TimeTable screen | No navigation implemented |
| Home → Library | Library screen | No navigation implemented |
| Home → Track Bus | Track screen | No navigation implemented |
| Home → Activity | Activity screen | No navigation implemented |
| Drawer → Classwork | Classwork screen | No navigation implemented |
| Drawer → Profile | Profile screen | No navigation implemented |
| Drawer → Fees | Fees screen | No navigation implemented |
| Drawer → TimeTable | TimeTable screen | No navigation implemented |
| Drawer → Library | Library screen | No navigation implemented |
| Drawer → Downloads | Downloads screen | No navigation implemented |
| Drawer → Track | Track screen | No navigation implemented |
| Drawer → Activity | Activity screen | No navigation implemented |
| Drawer → Notification | Notification screen | No navigation implemented |

### 3.3 Missing Routes (Required by Coder's Hero)

| Missing Route | Required By | Priority |
|---------------|-------------|----------|
| Login → Dashboard (auth-gated) | All roles | CRITICAL |
| Dashboard → Course List | Student, Teacher | HIGH |
| Course List → Course Detail | Student | HIGH |
| Course Detail → Lesson Viewer | Student | HIGH |
| Dashboard → Assignments | Student, Teacher | HIGH |
| Dashboard → Exams | Student, Teacher | HIGH |
| Dashboard → Grades | Student | HIGH |
| Dashboard → Attendance | Student, Teacher, Parent | HIGH |
| Dashboard → Notifications | All roles | HIGH |
| Dashboard → Profile | All roles | HIGH |
| Dashboard → Certificates | Student | MEDIUM |
| Dashboard → AI Tutor | Student | MEDIUM |
| Dashboard → Coding Playground | Student | MEDIUM |
| Dashboard → Competitions | Student | MEDIUM |
| Parent → Children | Parent | HIGH |
| Parent → Child Detail | Parent | HIGH |
| Parent → Fees | Parent | HIGH |
| Parent → Progress | Parent | HIGH |
| Teacher → Classes | Teacher | HIGH |
| Teacher → Class Detail | Teacher | HIGH |
| Teacher → Gradebook | Teacher | HIGH |
| Teacher → Mark Attendance | Teacher | HIGH |
| Admin → Student List | Admin | HIGH |
| Admin → Finance Summary | Admin | MEDIUM |
| Settings → Profile | All roles | HIGH |
| Settings → 2FA | All roles | MEDIUM |
| Settings → Preferences | All roles | LOW |

---

## 4. Route Guard Analysis

### Current State: NONE

There are **zero route guards** in the Flutter app. Any screen can be accessed by anyone, regardless of authentication status or role.

### Required Route Guards

| Guard | Logic | Scope |
|-------|-------|-------|
| **AuthGuard** | Check token exists in secure storage → if no, redirect to login | All authenticated screens |
| **RoleGuard** | Check user role against allowed roles for route → if no, redirect to dashboard | Role-specific screens |
| **GuestGuard** | Check token does NOT exist → if exists, redirect to dashboard | Login, Register screens |

### Required Route Configuration

The current inline `Navigator.push()` system must be replaced with a declarative router (GoRouter recommended) that supports:

1. **Named routes** — Centralized route definitions
2. **Route guards** — Auth and role checking
3. **Redirect logic** — Auto-redirect based on auth state
4. **Deep linking** — URL-based navigation
5. **Nested navigation** — Bottom nav with sub-routes
6. **Route transitions** — Consistent page transitions
7. **404 handling** — Unknown route handling
8. **Shell routes** — Persistent navigation (bottom nav, drawer)

---

## 5. Target Route Architecture

### 5.1 Route Structure

```dart
GoRouter(
  routes: [
    // Public routes
    GoRoute(path: '/login', builder: LoginScreen),
    GoRoute(path: '/forgot-password', builder: ForgotPasswordScreen),

    // Auth-aware redirect
    redirect: (context, state) {
      final isLoggedIn = authProvider.isAuthenticated;
      final isPublicRoute = ['/login', '/forgot-password'].contains(state.matchedLocation);

      if (!isLoggedIn && !isPublicRoute) return '/login';
      if (isLoggedIn && isPublicRoute) return '/dashboard';
      return null;
    },

    // Shell route (bottom navigation)
    ShellRoute(
      builder: (context, state, child) => MainShell(child: child),
      routes: [
        // Student routes
        GoRoute(path: '/student/dashboard', builder: StudentDashboard),
        GoRoute(path: '/student/courses', builder: StudentCourses),
        GoRoute(path: '/student/courses/:id', builder: CourseDetail),
        GoRoute(path: '/student/courses/:id/lessons/:lessonId', builder: LessonScreen),
        GoRoute(path: '/student/attendance', builder: StudentAttendance),
        GoRoute(path: '/student/assignments', builder: StudentAssignments),
        GoRoute(path: '/student/exams', builder: StudentExams),
        GoRoute(path: '/student/grades', builder: StudentGrades),
        GoRoute(path: '/student/certificates', builder: StudentCertificates),
        GoRoute(path: '/student/notifications', builder: NotificationsScreen),
        GoRoute(path: '/student/profile', builder: ProfileScreen),

        // Parent routes
        GoRoute(path: '/parent/dashboard', builder: ParentDashboard),
        GoRoute(path: '/parent/children', builder: ChildrenList),
        GoRoute(path: '/parent/children/:id', builder: ChildDetail),
        GoRoute(path: '/parent/fees', builder: ParentFees),
        GoRoute(path: '/parent/notifications', builder: NotificationsScreen),
        GoRoute(path: '/parent/profile', builder: ProfileScreen),

        // Teacher routes
        GoRoute(path: '/teacher/dashboard', builder: TeacherDashboard),
        GoRoute(path: '/teacher/classes', builder: TeacherClasses),
        GoRoute(path: '/teacher/classes/:id', builder: ClassDetail),
        GoRoute(path: '/teacher/classes/:id/attendance', builder: MarkAttendance),
        GoRoute(path: '/teacher/assignments', builder: TeacherAssignments),
        GoRoute(path: '/teacher/exams', builder: TeacherExams),
        GoRoute(path: '/teacher/gradebook', builder: Gradebook),
        GoRoute(path: '/teacher/notifications', builder: NotificationsScreen),
        GoRoute(path: '/teacher/profile', builder: ProfileScreen),

        // Admin routes
        GoRoute(path: '/admin/dashboard', builder: AdminDashboard),
        GoRoute(path: '/admin/students', builder: AdminStudents),
        GoRoute(path: '/admin/notifications', builder: NotificationsScreen),
        GoRoute(path: '/admin/profile', builder: ProfileScreen),
      ],
    ),

    // Shared routes
    GoRoute(path: '/notifications', builder: NotificationsScreen),
    GoRoute(path: '/profile', builder: ProfileScreen),
    GoRoute(path: '/settings', builder: SettingsScreen),

    // Fallback
    GoRoute(path: '/404', builder: NotFoundScreen),
    redirect: (state) => '/404',
  ],
)
```

### 5.2 Role-Based Redirect Logic

```dart
String? getInitialRoute(User? user) {
  if (user == null) return '/login';

  switch (user.role) {
    case 'student': return '/student/dashboard';
    case 'parent': return '/parent/dashboard';
    case 'teacher':
    case 'instructor': return '/teacher/dashboard';
    case 'admin':
    case 'super_admin':
    case 'director':
    case 'branch_manager':
    case 'school_admin': return '/admin/dashboard';
    default: return '/login';
  }
}
```

### 5.3 Navigation Per Role

#### Student Bottom Navigation
| Tab | Route | Icon |
|-----|-------|------|
| Home | /student/dashboard | Home |
| Courses | /student/courses | BookOpen |
| Assignments | /student/assignments | FileText |
| Notifications | /student/notifications | Bell |
| Profile | /student/profile | User |

#### Parent Bottom Navigation
| Tab | Route | Icon |
|-----|-------|------|
| Home | /parent/dashboard | Home |
| Children | /parent/children | Users |
| Fees | /parent/fees | Wallet |
| Notifications | /parent/notifications | Bell |
| Profile | /parent/profile | User |

#### Teacher Bottom Navigation
| Tab | Route | Icon |
|-----|-------|------|
| Home | /teacher/dashboard | Home |
| Classes | /teacher/classes | BookOpen |
| Assignments | /teacher/assignments | FileText |
| Notifications | /teacher/notifications | Bell |
| Profile | /teacher/profile | User |

#### Admin Bottom Navigation
| Tab | Route | Icon |
|-----|-------|------|
| Home | /admin/dashboard | Home |
| Students | /admin/students | Users |
| Notifications | /admin/notifications | Bell |
| Profile | /admin/profile | User |

---

## 6. Deep Linking Strategy

### Android (AndroidManifest.xml)

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="codershero" android:host="app" />
</intent-filter>
```

### iOS (Info.plist)

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>codershero</string>
        </array>
    </dict>
</array>
```

### Deep Link Examples

| Deep Link | Route | Use Case |
|-----------|-------|----------|
| codershero://app/student/courses/5 | Course detail | Push notification tap |
| codershero://app/parent/fees | Fees | Email link |
| codershero://app/teacher/classes/3/attendance | Mark attendance | Quick action |
| codershero://app/login | Login | Email verification link |

---

## 7. Summary

| Metric | Current | Target |
|--------|---------|--------|
| Route system | None (inline Navigator.push) | GoRouter (declarative) |
| Named routes | 0 | ~45 |
| Route guards | 0 | 3 (Auth, Role, Guest) |
| Deep linking | None | codershero:// scheme |
| Working navigation paths | 7 | ~45 |
| Stub navigation paths | 9 | 0 |
| Missing navigation paths | 27+ | 0 |
| Bottom nav routes | 0 | 5 per role × 4 roles |
