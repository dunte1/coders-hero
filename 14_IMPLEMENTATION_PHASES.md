# 14 — Implementation Phases for Flutter Mobile

> Coder's Hero ERP & LMS — Mobile Integration Audit
> Last updated: 2026-08-18
> 21 phases from baseline to app store release

---

## PHASE 0 — BASELINE & ARCHITECTURE

### Goal
Establish clean Flutter foundation with proper architecture patterns and environment management.

### Why This Phase Comes Here
Must be first — all subsequent phases depend on a working, compilable project with no legacy baggage.

### Prerequisites
- Flutter SDK installed (latest stable)
- Android Studio / Xcode configured
- Access to Laravel backend (local or staging)

### Files to Modify
- `Mobile/coders-hero-mobile/pubspec.yaml` — Replace SDK constraint, add core dependencies
- `Mobile/coders-hero-mobile/android/app/build.gradle` — Update SDK versions
- `Mobile/coders-hero-mobile/android/build.gradle` — Update Kotlin/Gradle
- `Mobile/coders-hero-mobile/lib/main.dart` — Remove Firebase init, add architecture skeleton

### New Files
```
lib/
├── app.dart                          # MaterialApp with routing
├── config/
│   ├── env.dart                      # Environment configuration
│   ├── routes.dart                   # Route definitions
│   └── theme.dart                    # ThemeData
├── core/
│   ├── api/
│   │   ├── api_client.dart           # Dio HTTP client
│   │   ├── api_interceptor.dart      # Token injection, refresh
│   │   └── api_exception.dart        # Error handling
│   ├── auth/
│   │   ├── auth_service.dart         # Sanctum auth flow
│   │   ├── auth_provider.dart        # Auth state management
│   │   └── token_storage.dart        # Secure token storage
│   ├── navigation/
│   │   ├── app_router.dart           # GoRouter configuration
│   │   └── route_guards.dart         # Role-based route guards
│   └── storage/
│       └── secure_storage.dart       # flutter_secure_storage wrapper
├── features/
│   └── (empty — will be populated in later phases)
└── shared/
    └── widgets/
        └── (empty — will be populated in Phase 6)
```

### Screens
- Empty shell app with splash screen

### Routes
- `/` → Splash screen

### Models
- None

### APIs
- None

### Permissions
- None

### Dependencies (New)
```yaml
dependencies:
  dio: ^5.4.0
  flutter_secure_storage: ^9.0.0
  go_router: ^14.0.0
  flutter_riverpod: ^2.5.0
  json_annotation: ^4.8.0
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0

dev_dependencies:
  build_runner: ^2.4.0
  json_serializable: ^6.7.0
  mockito: ^5.4.0
  riverpod_generator: ^2.4.0
```

### Backend Changes Required
- None (existing API is sufficient)

### Tests
- Project compiles on Android/iOS
- Empty app launches without crash

### Security Checks
- No secrets hardcoded
- Environment variables properly configured

### Acceptance Criteria
- [ ] Project compiles with no errors
- [ ] Empty app with architecture skeleton launches
- [ ] No Firebase dependencies remain
- [ ] Environment configuration works
- [ ] CI/CD pipeline configured for Flutter

### Rollback Strategy
- Git tag before changes; revert to tag if compilation fails

### Risks
- Low — removing existing code before adding new

### Definition of Done
- `flutter run` launches clean skeleton app
- All new dependencies resolve without conflicts

---

## PHASE 1 — FLUTTER PROJECT CLEANUP & FOUNDATION

### Goal
Remove all Firebase dependencies, template code, and fix build-breaking issues.

### Why This Phase Comes Here
Must clean before building — Firebase auth conflicts with Sanctum, template code is confusing.

### Prerequisites
- Phase 0 complete

### Files to Modify
- `pubspec.yaml` — Remove `firebase_auth`, `firebase_core`, `google_sign_in`, `flare_flutter`, `randomizer_null_safe`, `fzregex`, `flrx_validator`, `flutter_randomcolor`
- `lib/main.dart` — Remove Firebase.initializeApp(), remove firebase_options.dart import
- `lib/Screens/LoginPage.dart` — Remove FirebaseAuth usage
- `lib/services/Auth_services.dart` — Remove Firebase auth logic
- `lib/services/UserModel.dart` — Replace Firebase UserModel with Sanctum model
- `android/app/build.gradle` — `minSdkVersion 21`, `targetSdkVersion 34`, `compileSdkVersion 34`
- `android/build.gradle` — Update Kotlin version to `1.9.0`, Gradle plugin to `8.1.0`

### New Files
- `lib/core/config/env.dart` — Environment configuration (dev/staging/prod)
- `lib/core/config/api_config.dart` — API base URL configuration

### Screens (Fixes)
- Fix `Exam_Rseult.dart` → rename to `ExamResult.dart`
- Fix `SplashScreen.dart` → update branding from "Rise Education Center" to "Coder's Hero"
- Remove commented-out duplicate code in `LoginPage.dart` (lines 345-716)
- Remove `firebase_options.dart` import

### Routes
- None (existing routes preserved)

### Models
- None

### APIs
- None

### Permissions
- None

### Dependencies (Remove)
```yaml
# REMOVE these:
firebase_auth: ^5.3.4
firebase_core: ^3.9.0
google_sign_in: ^6.2.2
flare_flutter: ^3.0.2
randomizer_null_safe: ^0.1.5
fzregex: ^2.0.0
flrx_validator: ^0.6.0
flutter_randomcolor: ^1.0.16
```

### Dependencies (Keep)
```yaml
cupertino_icons: ^1.0.8
dropdown_search: ^6.0.1
date_time_picker: ^2.1.0
flutter_svg: ^2.0.16
```

### Backend Changes Required
- None

### Tests
- Project compiles on Android
- Project compiles on iOS
- No Firebase references remain

### Security Checks
- No Firebase API keys in code
- No google-services.json committed

### Acceptance Criteria
- [ ] No Firebase dependencies in pubspec.yaml
- [ ] No Firebase imports in any .dart file
- [ ] Project compiles on Android (SDK 34)
- [ ] Project compiles on iOS
- [ ] No commented-out code blocks remain
- [ ] Typos fixed (Exam_Rseult → ExamResult)
- [ ] App title updated to "Coder's Hero"

### Rollback Strategy
- Revert to Phase 0 tag

### Risks
- Medium — removing dependencies may break existing functionality
- Mitigation: Verify each removal compiles

### Definition of Done
- `flutter analyze` passes with no errors
- `flutter build apk` succeeds
- `flutter build ios` succeeds (or `flutter build ipa`)

---

## PHASE 2 — API CLIENT & NETWORKING

### Goal
Establish Laravel API communication layer with Dio, interceptors, and error handling.

### Why This Phase Comes Here
Must have networking before authentication — login requires API calls.

### Prerequisites
- Phase 1 complete
- Laravel backend running (local/staging)

### Files to Modify
- `lib/core/api/api_client.dart` — Create Dio instance with base URL, timeouts
- `lib/core/api/api_interceptor.dart` — Token injection, 401 handling, request logging

### New Files
```
lib/core/api/
├── api_client.dart
├── api_interceptor.dart
├── api_exception.dart
├── api_response.dart
└── api_logger.dart
lib/features/auth/
├── data/
│   ├── auth_api_service.dart
│   └── auth_repository.dart
└── models/
    └── user_model.dart
```

### Screens
- None

### Routes
- None

### Models
- `UserModel` — id, name, email, role, permissions, avatar_url, school_id, branch_id

### APIs
```
POST /login
POST /register
POST /logout
POST /refresh-token
GET  /profile
PUT  /profile
POST /change-password
POST /forgot-password
POST /reset-password
```

### Permissions
- None (public + authenticated)

### Dependencies (New)
```yaml
dio: ^5.4.0
flutter_secure_storage: ^9.0.0
pretty_dio_logger: ^1.3.0
```

### Backend Changes Required
- None (existing auth endpoints sufficient)

### Tests
- API client can make unauthenticated request
- API client can make authenticated request
- Error handling works (401, 403, 500)

### Security Checks
- Token stored in flutter_secure_storage (not SharedPreferences)
- No secrets in logs
- HTTPS enforced

### Acceptance Criteria
- [ ] Dio client configured with base URL
- [ ] Token interceptor injects Bearer token
- [ ] 401 response triggers logout
- [ ] Request/response logging works
- [ ] Error handling returns typed exceptions
- [ ] Token refresh mechanism works

### Rollback Strategy
- Revert to Phase 1 tag

### Risks
- Low — networking is well-understood

### Definition of Done
- API client can authenticate and make authenticated requests
- Unit tests pass for API client

---

## PHASE 3 — AUTHENTICATION & SESSION MANAGEMENT

### Goal
Complete auth flow with Laravel Sanctum token-based authentication.

### Why This Phase Comes Here
Must have auth before any role-based features — all screens require authentication.

### Prerequisites
- Phase 2 complete

### Files to Modify
- `lib/features/auth/auth_provider.dart` — Auth state management
- `lib/features/auth/data/auth_api_service.dart` — Login/register/logout API calls
- `lib/features/auth/data/auth_repository.dart` — Auth business logic

### New Files
```
lib/features/auth/
├── auth_provider.dart
├── auth_state.dart
├── data/
│   ├── auth_api_service.dart
│   └── auth_repository.dart
├── models/
│   └── user_model.dart
└── screens/
    ├── login_screen.dart
    ├── forgot_password_screen.dart
    └── splash_screen.dart
```

### Screens
- `LoginScreen` — Email/password form → Sanctum token
- `SplashScreen` — Auto-login check → redirect
- `ForgotPasswordScreen` — Password reset flow

### Routes
- `/login` — Login screen
- `/splash` — Splash screen (auto-login)
- `/forgot-password` — Password reset

### Models
- `UserModel` — id, name, email, role, permissions, avatar_url
- `LoginRequest` — email, password
- `LoginResponse` — token, user
- `PasswordResetRequest` — email

### APIs
```
POST /login          → { token, user }
POST /register       → { token, user }
POST /logout         → 200
POST /refresh-token  → { token }
GET  /profile        → { user }
PUT  /profile        → { user }
POST /forgot-password → 200
POST /reset-password  → 200
```

### Permissions
- Public: login, register, forgot-password, reset-password
- Authenticated: profile, logout, change-password

### Dependencies (Existing)
- `dio: ^5.4.0`
- `flutter_secure_storage: ^9.0.0`
- `flutter_riverpod: ^2.5.0`
- `go_router: ^14.0.0`

### Backend Changes Required
- None (existing auth endpoints sufficient)

### Tests
- Login with valid credentials succeeds
- Login with invalid credentials fails
- Token persists after app restart
- Logout clears token
- Auto-login works on app start
- Password reset flow completes

### Security Checks
- Token stored in flutter_secure_storage
- Token not logged
- Token cleared on logout
- Session expires after 24 hours

### Acceptance Criteria
- [ ] User can login with email/password
- [ ] Token is stored securely
- [ ] Auto-login works on app restart
- [ ] Logout clears token and navigates to login
- [ ] Password reset flow works
- [ ] Profile can be fetched with token
- [ ] 401 response triggers automatic logout

### Rollback Strategy
- Revert to Phase 2 tag

### Risks
- Medium — auth flow must match Laravel Sanctum exactly
- Mitigation: Test against actual backend

### Definition of Done
- User can login, token persists, auto-login works, logout works
- All auth unit tests pass

---

## PHASE 4 — ROLE & PERMISSION ENGINE

### Goal
Role-based access control with route guards and navigation filtering.

### Why This Phase Comes Here
Must have auth before role checking — roles come from authenticated user profile.

### Prerequisites
- Phase 3 complete

### Files to Modify
- `lib/core/navigation/route_guards.dart` — Role-based route guards
- `lib/core/navigation/app_router.dart` — Add role-based route definitions
- `lib/features/auth/auth_provider.dart` — Add role/permission state

### New Files
```
lib/core/auth/
├── role_provider.dart
├── permission_provider.dart
└── role_guard.dart
lib/shared/models/
├── role.dart
└── permission.dart
```

### Screens
- None (backend enforcement)

### Routes
- All routes wrapped with role guards

### Models
- `Role` — name, display_name, permissions
- `Permission` — name, module, action

### APIs
```
GET /profile → { user: { role: { name, permissions } } }
```

### Permissions
- All roles checked against backend response

### Dependencies (Existing)
- `flutter_riverpod: ^2.5.0`
- `go_router: ^14.0.0`

### Backend Changes Required
- None (profile endpoint already returns role/permissions)

### Tests
- Student can access student routes
- Student cannot access admin routes
- Parent can access parent routes
- Parent cannot access teacher routes
- Teacher can access teacher routes
- Teacher cannot access student routes
- Admin can access all routes

### Security Checks
- Route guards prevent unauthorized navigation
- API calls include role header
- Server-side middleware enforces role

### Acceptance Criteria
- [ ] User profile returns role and permissions
- [ ] Route guards redirect to appropriate dashboard
- [ ] Navigation filters by role
- [ ] Each role sees only permitted screens
- [ ] Unauthorized access shows "Access Denied"

### Rollback Strategy
- Revert to Phase 3 tag

### Risks
- Low — role system is well-defined in backend

### Definition of Done
- Each role sees only permitted screens
- All role guard tests pass

---

## PHASE 5 — DYNAMIC NAVIGATION

### Goal
Role-adaptive navigation with dynamic drawer and bottom navigation.

### Why This Phase Comes Here
Must have roles before navigation — navigation items depend on role.

### Prerequisites
- Phase 4 complete

### Files to Modify
- `lib/core/navigation/app_router.dart` — Add all role-based routes
- `lib/shared/widgets/navigation/` — Create navigation widgets

### New Files
```
lib/shared/widgets/navigation/
├── app_navigation_drawer.dart
├── app_bottom_navigation.dart
├── navigation_item.dart
└── navigation_filter.dart
```

### Screens
- Navigation drawer (role-adaptive)
- Bottom navigation bar (role-adaptive)

### Routes
- All routes organized by role groups

### Models
- `NavigationItem` — label, icon, route, roles

### APIs
- None

### Permissions
- Navigation filtered by role

### Dependencies (New)
```yaml
go_router: ^14.0.0
```

### Backend Changes Required
- None

### Tests
- Navigation drawer shows correct items per role
- Bottom navigation shows correct items per role
- Navigation filtering works correctly

### Security Checks
- Navigation items filtered client-side
- Route guards enforce server-side

### Acceptance Criteria
- [ ] Navigation adapts to user role
- [ ] Correct screens accessible per role
- [ ] Navigation groups organized properly
- [ ] Deep linking works

### Rollback Strategy
- Revert to Phase 4 tag

### Risks
- Low — navigation structure is well-defined

### Definition of Done
- Navigation adapts to role, correct screens accessible
- All navigation tests pass

---

## PHASE 6 — DESIGN SYSTEM / CODER'S HERO UI

### Goal
Apply Coder's Hero branding and create reusable design system.

### Why This Phase Comes Here
Must have navigation before UI — screens need consistent design language.

### Prerequisites
- Phase 5 complete

### Files to Modify
- `lib/config/theme.dart` — Theme data with brand colors
- All existing screens — Apply theme

### New Files
```
lib/shared/
├── theme/
│   ├── app_theme.dart
│   ├── app_colors.dart
│   ├── app_typography.dart
│   └── app_spacing.dart
├── widgets/
│   ├── buttons/
│   │   ├── primary_button.dart
│   │   └── secondary_button.dart
│   ├── cards/
│   │   ├── stat_card.dart
│   │   └── list_card.dart
│   ├── loading/
│   │   ├── shimmer_loading.dart
│   │   └── skeleton_loader.dart
│   ├── error/
│   │   ├── error_widget.dart
│   │   └── empty_state.dart
│   └── navigation/
│       ├── app_app_bar.dart
│       └── app_bottom_bar.dart
```

### Screens
- All screens updated with consistent design

### Routes
- None

### Models
- None

### APIs
- None

### Permissions
- None

### Dependencies (New)
```yaml
shimmer: ^3.0.0
google_fonts: ^6.0.0
```

### Backend Changes Required
- None

### Tests
- Theme applies correctly
- Widgets render with correct colors
- Dark mode works

### Security Checks
- No hardcoded colors (use theme)

### Acceptance Criteria
- [ ] App looks like Coder's Hero
- [ ] Consistent design throughout
- [ ] Dark mode implemented
- [ ] Typography system in place
- [ ] Reusable widget library created

### Rollback Strategy
- Revert to Phase 5 tag

### Risks
- Low — design system is additive

### Definition of Done
- App has consistent Coder's Hero branding
- All widget tests pass

---

## PHASE 7 — STUDENT CORE EXPERIENCE

### Goal
Complete student mobile experience with all core academic screens.

### Why This Phase Comes Here
Students are the primary mobile users — highest priority feature set.

### Prerequisites
- Phase 6 complete

### Files to Modify
- `lib/features/student/` — All student screens

### New Files
```
lib/features/student/
├── data/
│   ├── student_api_service.dart
│   └── student_repository.dart
├── models/
│   ├── course_model.dart
│   ├── enrollment_model.dart
│   ├── lesson_model.dart
│   ├── attendance_model.dart
│   ├── assignment_model.dart
│   ├── exam_model.dart
│   ├── grade_model.dart
│   └── certificate_model.dart
├── providers/
│   ├── courses_provider.dart
│   ├── attendance_provider.dart
│   ├── assignments_provider.dart
│   └── grades_provider.dart
└── screens/
    ├── student_dashboard_screen.dart
    ├── courses/
    │   ├── my_courses_screen.dart
    │   └── course_detail_screen.dart
    ├── lessons/
    │   └── lesson_viewer_screen.dart
    ├── attendance/
    │   └── my_attendance_screen.dart
    ├── assignments/
    │   ├── my_assignments_screen.dart
    │   └── assignment_detail_screen.dart
    ├── exams/
    │   └── my_exams_screen.dart
    ├── grades/
    │   └── my_grades_screen.dart
    ├── certificates/
    │   └── my_certificates_screen.dart
    └── profile/
        └── my_profile_screen.dart
```

### Screens
- Student Dashboard (stats, courses, notifications)
- My Courses list
- Course Detail (lessons, progress)
- Lesson Viewer (content rendering)
- My Attendance (today, overall)
- My Assignments (list, submit)
- My Exams (results)
- My Grades
- My Certificates
- My Profile
- Notifications

### Routes
```
/student/dashboard
/student/courses
/student/courses/:id
/student/courses/:id/player
/student/courses/:id/lessons/:lessonId
/student/attendance
/student/assignments
/student/assignments/:id
/student/assignments/:id/submit
/student/exams
/student/grades
/student/certificates
/student/profile
/student/notifications
```

### Models
- `CourseModel` — id, title, description, thumbnail, lessons_count, progress
- `EnrollmentModel` — id, course_id, student_id, progress, enrolled_at
- `LessonModel` — id, course_id, title, content, type, duration, sort_order
- `AttendanceModel` — id, date, status, subject, teacher, start_time, end_time
- `AssignmentModel` — id, title, description, due_date, status, grade
- `ExamModel` — id, name, date, subjects, total_marks, overall_grade
- `GradeModel` — id, subject, marks, total, grade, percentage
- `CertificateModel` — id, certificate_number, course, issued_at, download_url
- `NotificationModel` — id, title, message, read, created_at

### APIs
```
GET  /dashboard
GET  /enrollments/my-courses
GET  /enrollments/stats
GET  /courses/{id}
GET  /courses/{id}/lessons
GET  /students/{id}/attendance
GET  /student/assignments
POST /student/assignments/{id}/submit
GET  /certificates
GET  /notifications
GET  /profile
PUT  /profile
```

### Permissions
- `student` role required for all endpoints

### Dependencies (Existing)
- All dependencies from Phase 2-6

### Backend Changes Required
- None (existing endpoints sufficient)

### Tests
- Dashboard loads with stats
- Course list loads from API
- Course detail shows lessons
- Attendance data loads
- Assignment list loads
- Assignment submission works
- Exam results load
- Grades load
- Certificates load
- Profile loads and updates

### Security Checks
- Student can only see own data
- Assignment submission validates file types
- No other student's data exposed

### Acceptance Criteria
- [ ] Student can use app for core academic activities
- [ ] All screens load data from API
- [ ] Loading states shown
- [ ] Error states handled
- [ ] Empty states shown
- [ ] Pull-to-refresh works
- [ ] Navigation between screens works

### Rollback Strategy
- Revert to Phase 6 tag

### Risks
- Medium — many screens to build
- Mitigation: Build incrementally, test each screen

### Definition of Done
- Student can use app for all core academic activities
- All student tests pass

---

## PHASE 8 — PARENT CORE EXPERIENCE

### Goal
Complete parent mobile experience with child monitoring features.

### Why This Phase Comes Here
Parents are second primary mobile users — need to monitor children's progress.

### Prerequisites
- Phase 7 complete

### Files to Modify
- `lib/features/parent/` — All parent screens

### New Files
```
lib/features/parent/
├── data/
│   ├── parent_api_service.dart
│   └── parent_repository.dart
├── models/
│   ├── child_model.dart
│   ├── parent_attendance_model.dart
│   ├── parent_progress_model.dart
│   ├── report_card_model.dart
│   └── fee_model.dart
├── providers/
│   ├── children_provider.dart
│   ├── attendance_provider.dart
│   ├── progress_provider.dart
│   └── fees_provider.dart
└── screens/
    ├── parent_dashboard_screen.dart
    ├── children/
    │   ├── children_list_screen.dart
    │   └── child_detail_screen.dart
    ├── attendance/
    │   └── child_attendance_screen.dart
    ├── progress/
    │   └── academic_progress_screen.dart
    ├── report_cards/
    │   ├── report_cards_screen.dart
    │   └── report_card_detail_screen.dart
    ├── fees/
    │   ├── fees_screen.dart
    │   └── fee_detail_screen.dart
    └── profile/
        └── parent_profile_screen.dart
```

### Screens
- Parent Dashboard (summary, children)
- Children List
- Child Detail
- Child Attendance
- Academic Progress
- Report Cards
- Report Card Detail
- Fees
- Fee Detail
- Payments
- Parent Profile
- Notifications

### Routes
```
/parent/dashboard
/parent/children
/parent/children/:childId
/parent/attendance
/parent/progress
/parent/report-cards
/parent/report-cards/:id
/parent/fees
/parent/fees/:id
/parent/payments
/parent/profile
/parent/notifications
```

### Models
- `ChildModel` — id, name, grade, section, photo, student_id
- `ParentAttendanceModel` — id, date, status, child_id
- `ParentProgressModel` — id, subject, grade, percentage, child_id
- `ReportCardModel` — id, exam_name, subjects, overall_grade, child_id
- `FeeModel` — id, amount, status, due_date, child_id

### APIs
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
GET  /parent/notifications
GET  /profile
```

### Permissions
- `parent` role required for all endpoints
- **CRITICAL**: Parent can only see own children

### Dependencies (Existing)
- All dependencies from Phase 2-6

### Backend Changes Required
- None (existing endpoints sufficient)

### Tests
- Dashboard loads with summary
- Children list loads
- Child detail loads
- Attendance loads for selected child
- Progress loads for selected child
- Report cards load
- Fees load
- Payment processing works
- **Security**: Parent cannot access other parent's children

### Security Checks
- Parent ID enforced server-side
- Child ID not manipulable
- No data leakage between parents

### Acceptance Criteria
- [ ] Parent can monitor their children's progress
- [ ] Child selector works correctly
- [ ] All screens load data from API
- [ ] Loading/error/empty states handled
- [ ] Pull-to-refresh works
- [ ] **Parent cannot see other parent's children**

### Rollback Strategy
- Revert to Phase 7 tag

### Risks
- Medium — parent-child relationship security
- Mitigation: Test authorization thoroughly

### Definition of Done
- Parent can monitor their children's progress
- All parent tests pass
- Security tests pass

---

## PHASE 9 — TEACHER CORE EXPERIENCE

### Goal
Complete teacher mobile experience with class management features.

### Why This Phase Comes Here
Teachers need mobile access for attendance marking and class management.

### Prerequisites
- Phase 8 complete

### Files to Modify
- `lib/features/teacher/` — All teacher screens

### New Files
```
lib/features/teacher/
├── data/
│   ├── teacher_api_service.dart
│   └── teacher_repository.dart
├── models/
│   ├── class_model.dart
│   ├── roster_model.dart
│   ├── teacher_assignment_model.dart
│   ├── teacher_exam_model.dart
│   ├── gradebook_model.dart
│   └── lesson_note_model.dart
├── providers/
│   ├── classes_provider.dart
│   ├── assignments_provider.dart
│   ├── exams_provider.dart
│   ├── gradebook_provider.dart
│   └── lesson_notes_provider.dart
└── screens/
    ├── teacher_dashboard_screen.dart
    ├── classes/
    │   ├── my_classes_screen.dart
    │   ├── class_detail_screen.dart
    │   └── class_roster_screen.dart
    ├── attendance/
    │   └── mark_attendance_screen.dart
    ├── assignments/
    │   ├── manage_assignments_screen.dart
    │   ├── create_assignment_screen.dart
    │   ├── assignment_detail_screen.dart
    │   └── submissions_screen.dart
    ├── exams/
    │   ├── manage_exams_screen.dart
    │   ├── create_exam_screen.dart
    │   └── exam_detail_screen.dart
    ├── gradebook/
    │   ├── gradebook_screen.dart
    │   └── class_summary_screen.dart
    ├── lesson_notes/
    │   ├── lesson_notes_screen.dart
    │   └── create_lesson_note_screen.dart
    ├── calendar/
    │   └── teacher_calendar_screen.dart
    └── profile/
        └── teacher_profile_screen.dart
```

### Screens
- Teacher Dashboard (summary, classes, assignments)
- My Classes list
- Class Detail (roster, attendance, assignments)
- Class Roster
- Mark Attendance (mobile-friendly)
- Manage Assignments
- Create Assignment
- Assignment Detail
- Submissions
- Manage Exams
- Create Exam
- Exam Detail
- Gradebook
- Class Summary
- Lesson Notes
- Create Lesson Note
- Teacher Calendar
- Teacher Profile
- Notifications

### Routes
```
/teacher/dashboard
/teacher/classes
/teacher/classes/:id
/teacher/classes/:id/roster
/teacher/classes/:id/attendance
/teacher/assignments
/teacher/assignments/create
/teacher/assignments/:id
/teacher/assignments/:id/submissions
/teacher/exams
/teacher/exams/create
/teacher/exams/:id
/teacher/gradebook
/teacher/gradebook/summary
/teacher/lesson-notes
/teacher/lesson-notes/create
/teacher/calendar
/teacher/profile
/teacher/notifications
```

### Models
- `ClassModel` — id, name, grade, section, students_count, teacher_id
- `RosterModel` — id, student_id, name, roll_number, photo
- `TeacherAssignmentModel` — id, title, description, due_date, class_id, status, submissions_count
- `TeacherExamModel` — id, name, date, class_id, total_marks, status
- `GradebookModel` — id, student_id, class_id, components, total, average
- `LessonNoteModel` — id, title, content, class_id, date, attachments

### APIs
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
GET  /profile
```

### Permissions
- `teacher` or `instructor` role required
- Teacher can only access own classes

### Dependencies (Existing)
- All dependencies from Phase 2-6

### Backend Changes Required
- None (existing endpoints sufficient)

### Tests
- Dashboard loads with summary
- Class list loads
- Class detail loads
- Roster loads
- Attendance marking works
- Assignment CRUD works
- Exam CRUD works
- Gradebook loads
- Lesson notes CRUD works
- Calendar loads

### Security Checks
- Teacher can only access own classes
- Attendance marking validates date
- Grade changes logged

### Acceptance Criteria
- [ ] Teacher can manage classes from mobile
- [ ] Attendance marking is mobile-friendly
- [ ] All screens load data from API
- [ ] Loading/error/empty states handled
- [ ] Pull-to-refresh works

### Rollback Strategy
- Revert to Phase 8 tag

### Risks
- Medium — attendance marking must be reliable
- Mitigation: Offline support in Phase 16

### Definition of Done
- Teacher can manage classes from mobile
- All teacher tests pass

---

## PHASE 10 — ADMIN CORE EXPERIENCE

### Goal
Essential admin functions on mobile for monitoring and quick actions.

### Why This Phase Comes Here
Admins need mobile access for monitoring and quick approvals.

### Prerequisites
- Phase 9 complete

### Files to Modify
- `lib/features/admin/` — All admin screens

### New Files
```
lib/features/admin/
├── data/
│   ├── admin_api_service.dart
│   └── admin_repository.dart
├── models/
│   ├── admin_stats_model.dart
│   ├── student_list_model.dart
│   └── teacher_overview_model.dart
├── providers/
│   ├── stats_provider.dart
│   ├── students_provider.dart
│   └── teachers_provider.dart
└── screens/
    ├── admin_dashboard_screen.dart
    ├── students/
    │   ├── student_list_screen.dart
    │   └── student_detail_screen.dart
    ├── teachers/
    │   └── teacher_overview_screen.dart
    ├── finance/
    │   └── finance_summary_screen.dart
    └── profile/
        └── admin_profile_screen.dart
```

### Screens
- Admin Dashboard (key stats, recent activity)
- Student List (search, filter)
- Student Detail (quick view)
- Teacher Overview
- Finance Summary (read-only)
- Notifications
- Admin Profile

### Routes
```
/admin/dashboard
/admin/students
/admin/students/:id
/admin/teachers
/admin/finance
/admin/profile
/admin/notifications
```

### Models
- `AdminStatsModel` — total_students, total_teachers, total_courses, revenue
- `StudentListModel` — id, name, grade, status, photo
- `TeacherOverviewModel` — id, name, department, classes_count

### APIs
```
GET  /dashboard
GET  /dashboard/stats
GET  /students
GET  /students/{id}
GET  /teacher/dashboard
GET  /finance/summary
GET  /notifications
GET  /profile
```

### Permissions
- `admin`, `super_admin`, `director`, `branch_manager`, `school_admin` roles

### Dependencies (Existing)
- All dependencies from Phase 2-6

### Backend Changes Required
- None

### Tests
- Dashboard loads with stats
- Student list loads with search
- Student detail loads
- Finance summary loads
- Notifications load

### Security Checks
- Admin can only access permitted data
- Sensitive data not exposed on mobile

### Acceptance Criteria
- [ ] Admin can monitor key metrics
- [ ] Student search works
- [ ] Quick actions work (approve, view details)
- [ ] All screens load data from API

### Rollback Strategy
- Revert to Phase 9 tag

### Risks
- Low — admin screens are read-heavy

### Definition of Done
- Admin can monitor and perform quick actions
- All admin tests pass

---

## PHASE 11 — LMS & ACADEMIC MODULES

### Goal
Complete learning management on mobile with course player, quizzes, and forums.

### Why This Phase Comes Here
LMS is core to student experience — must have student screens first.

### Prerequisites
- Phase 10 complete

### Files to Modify
- `lib/features/lms/` — All LMS screens

### New Files
```
lib/features/lms/
├── data/
│   ├── lms_api_service.dart
│   └── lms_repository.dart
├── models/
│   ├── quiz_model.dart
│   ├── forum_model.dart
│   ├── bookmark_model.dart
│   └── rating_model.dart
├── providers/
│   ├── quizzes_provider.dart
│   ├── forum_provider.dart
│   └── bookmarks_provider.dart
└── screens/
    ├── courses/
    │   └── course_player_screen.dart
    ├── quizzes/
    │   ├── quiz_list_screen.dart
    │   └── quiz_taking_screen.dart
    ├── forum/
    │   ├── forum_list_screen.dart
    │   ├── thread_detail_screen.dart
    │   └── create_thread_screen.dart
    ├── bookmarks/
    │   └── bookmarks_screen.dart
    └── progress/
        └── progress_tracker_screen.dart
```

### Screens
- Course Player (content rendering, progress tracking)
- Quiz List
- Quiz Taking (timer, submit, results)
- Forum List
- Thread Detail
- Create Thread
- Bookmarks
- Progress Tracker

### Routes
```
/lms/courses/:id/player
/lms/quizzes
/lms/quizzes/:id/take
/lms/forum
/lms/forum/threads/:id
/lms/bookmarks
/lms/progress
```

### Models
- `QuizModel` — id, title, questions, time_limit, course_id
- `QuizQuestion` — id, question, options, correct_answer, type
- `ForumThread` — id, title, author, posts_count, created_at
- `ForumPost` — id, author, content, created_at
- `BookmarkModel` — id, type, title, url, created_at
- `RatingModel` — id, course_id, rating, review

### APIs
```
GET  /quizzes
GET  /quizzes/{id}
POST /quizzes/{id}/submit
GET  /lms/courses/{courseId}/forum
POST /lms/courses/{courseId}/forum
GET  /lms/forum/threads/{id}
POST /lms/forum/threads/{threadId}/posts
GET  /lms/bookmarks
POST /lms/bookmarks/toggle
GET  /lms/bookmarks/status
POST /lms/courses/{courseId}/lessons/complete
GET  /lessons/{lessonId}/video-progress
PUT  /lessons/{lessonId}/video-progress
```

### Permissions
- `student` role for quiz taking
- Any authenticated user for forum
- Any authenticated user for bookmarks

### Backend Changes Required
- None

### Tests
- Course player renders content
- Quiz taking works
- Forum posting works
- Bookmarks toggle works
- Progress tracking works

### Security Checks
- Quiz submissions validated
- Forum posts moderated
- Bookmarks user-scoped

### Acceptance Criteria
- [ ] Full LMS experience on mobile
- [ ] Course content renders correctly
- [ ] Quiz taking works with timer
- [ ] Forum participation works
- [ ] Bookmarks work
- [ ] Progress tracking works

### Rollback Strategy
- Revert to Phase 10 tag

### Risks
- Medium — quiz taking must be reliable
- Mitigation: Offline support in Phase 16

### Definition of Done
- Full LMS experience on mobile
- All LMS tests pass

---

## PHASE 12 — CODING LAB

### Goal
Coding playground on mobile with code editor, execution, and challenges.

### Why This Phase Comes Here
Coding lab is unique to Coder's Hero — differentiator feature.

### Prerequisites
- Phase 11 complete

### Files to Modify
- `lib/features/coding/` — All coding screens

### New Files
```
lib/features/coding/
├── data/
│   ├── coding_api_service.dart
│   └── coding_repository.dart
├── models/
│   ├── code_exercise_model.dart
│   ├── code_submission_model.dart
│   ├── leaderboard_model.dart
│   └── workspace_model.dart
├── providers/
│   ├── exercises_provider.dart
│   ├── leaderboard_provider.dart
│   └── workspace_provider.dart
└── screens/
    ├── playground/
    │   └── coding_playground_screen.dart
    ├── exercises/
    │   ├── exercise_list_screen.dart
    │   └── exercise_detail_screen.dart
    ├── leaderboard/
    │   └── leaderboard_screen.dart
    └── editor/
        └── code_editor_screen.dart
```

### Screens
- Coding Playground (simplified for mobile)
- Code Editor (syntax highlighting)
- Exercise List
- Exercise Detail
- Leaderboard
- Code Execution Results

### Routes
```
/coding/playground
/coding/exercises
/coding/exercises/:id
/coding/leaderboard
```

### Models
- `CodeExerciseModel` — id, title, description, language, starter_code, test_cases
- `CodeSubmissionModel` — id, exercise_id, code, language, output, status, score
- `LeaderboardModel` — id, student_id, name, score, rank
- `WorkspaceModel` — id, name, code, language, saved_at

### APIs
```
POST /lms/playground/run
GET  /lms/courses/{courseId}/coding-exercises
GET  /lms/coding-exercises/{id}
POST /lms/coding-exercises/{id}/submit
GET  /lms/coding-exercises/{id}/submissions
GET  /lms/coding-exercises/{id}/progress
GET  /lms/coding-leaderboard/for-course/{courseId}
GET  /lms/coding-leaderboard/for-exercise/{exerciseId}
POST /lms/coding-ai/hint
POST /lms/coding-ai/debug
```

### Permissions
- `student` role for coding exercises

### Backend Changes Required
- None (existing Piston backend sufficient)

### Tests
- Code editor works
- Code execution works
- Exercises load
- Submission works
- Leaderboard loads
- AI hints work

### Security Checks
- Code execution sandboxed
- No file system access
- Timeout enforced

### Acceptance Criteria
- [ ] Students can code on mobile
- [ ] Code execution works
- [ ] Coding challenges work
- [ ] Leaderboard works
- [ ] AI hints work

### Rollback Strategy
- Revert to Phase 11 tag

### Risks
- High — code execution on mobile is complex
- Mitigation: Simplified editor for mobile

### Definition of Done
- Students can code and submit on mobile
- All coding tests pass

---

## PHASE 13 — COMPETITIONS

### Goal
Competition features on mobile for participation and tracking.

### Why This Phase Comes Here
Competitions are a key feature — requires student and teacher features first.

### Prerequisites
- Phase 12 complete

### Files to Modify
- `lib/features/competitions/` — All competition screens

### New Files
```
lib/features/competitions/
├── data/
│   ├── competition_api_service.dart
│   └── competition_repository.dart
├── models/
│   ├── competition_model.dart
│   ├── team_model.dart
│   └── leaderboard_model.dart
├── providers/
│   ├── competitions_provider.dart
│   └── teams_provider.dart
└── screens/
    ├── competition_list_screen.dart
    ├── competition_detail_screen.dart
    ├── team_registration_screen.dart
    ├── my_teams_screen.dart
    └── leaderboard_screen.dart
```

### Screens
- Competition List
- Competition Detail (description, criteria, teams)
- Team Registration
- My Teams
- Leaderboard
- Judge Scoring (simplified)

### Routes
```
/competitions
/competitions/:id
/competitions/:id/register
/competitions/teams/mine
/competitions/:id/leaderboard
```

### Models
- `CompetitionModel` — id, title, description, start_date, end_date, status, criteria
- `TeamModel` — id, name, members, competition_id, score, rank
- `CompetitionLeaderboard` — id, team_name, score, rank

### APIs
```
GET  /competitions
GET  /competitions/{id}
POST /competitions/{id}/register
GET  /competitions/teams/mine
GET  /competitions/{id}/leaderboard
GET  /competitions/{id}/results
POST /competitions/{id}/scores
```

### Permissions
- `student` for registration
- `teacher` for management
- `judge` for scoring (simplified)

### Backend Changes Required
- None

### Tests
- Competition list loads
- Competition detail loads
- Team registration works
- My teams loads
- Leaderboard loads

### Security Checks
- Team registration validated
- Score submission validated
- No duplicate registrations

### Acceptance Criteria
- [ ] Students can participate in competitions
- [ ] Team registration works
- [ ] Leaderboard works
- [ ] Judge scoring (simplified) works

### Rollback Strategy
- Revert to Phase 12 tag

### Risks
- Low — competition features are well-defined

### Definition of Done
- Students can participate in competitions
- All competition tests pass

---

## PHASE 14 — AI FEATURES

### Goal
AI assistant on mobile with chat interface and conversation history.

### Why This Phase Comes Here
AI is a key differentiator — requires LMS and student features first.

### Prerequisites
- Phase 13 complete

### Files to Modify
- `lib/features/ai/` — All AI screens

### New Files
```
lib/features/ai/
├── data/
│   ├── ai_api_service.dart
│   └── ai_repository.dart
├── models/
│   ├── ai_assistant_model.dart
│   ├── conversation_model.dart
│   └── message_model.dart
├── providers/
│   ├── assistants_provider.dart
│   └── conversations_provider.dart
└── screens/
    ├── ai_dashboard_screen.dart
    ├── assistant_list_screen.dart
    ├── conversation_screen.dart
    └── conversation_history_screen.dart
```

### Screens
- AI Dashboard (assistants, usage)
- Assistant List (Student Tutor, Coding Mentor, etc.)
- Conversation Chat Interface
- Conversation History

### Routes
```
/ai
/ai/assistants
/ai/conversations/:id
/ai/usage
```

### Models
- `AiAssistantModel` — id, name, slug, description, avatar
- `ConversationModel` — id, title, assistant_id, messages_count, created_at
- `MessageModel` — id, role, content, created_at

### APIs
```
GET  /lms/ai/assistants
GET  /lms/ai/assistants/{slug}
GET  /lms/ai/conversations
POST /lms/ai/conversations
GET  /lms/ai/conversations/{id}
POST /lms/ai/conversations/{id}/messages
GET  /lms/ai/my-usage
GET  /lms/ai-tutor/conversations
POST /lms/ai-tutor/conversations
POST /lms/ai-tutor/conversations/{id}/messages
```

### Permissions
- Any authenticated user for AI platform
- `student` for AI tutor

### Backend Changes Required
- None (existing OpenAI integration sufficient)

### Tests
- Assistant list loads
- Conversation creation works
- Message sending works
- Conversation history loads
- Usage stats load

### Security Checks
- Rate limiting enforced (30/min)
- Conversation data user-scoped
- No API key exposure

### Acceptance Criteria
- [ ] Students can interact with AI tutors
- [ ] Chat interface works
- [ ] Conversation history works
- [ ] Context-aware responses work

### Rollback Strategy
- Revert to Phase 13 tag

### Risks
- Medium — AI response quality
- Mitigation: Fallback responses implemented

### Definition of Done
- Students can interact with AI tutors
- All AI tests pass

---

## PHASE 15 — NOTIFICATIONS & COMMUNICATION

### Goal
Push notifications and in-app messaging.

### Why This Phase Comes Here
Notifications enhance engagement — requires auth and all features first.

### Prerequisites
- Phase 14 complete

### Files to Modify
- `lib/features/notifications/` — All notification screens
- `lib/features/chat/` — All chat screens

### New Files
```
lib/features/notifications/
├── data/
│   ├── notification_api_service.dart
│   └── notification_repository.dart
├── models/
│   └── notification_model.dart
├── providers/
│   └── notifications_provider.dart
└── screens/
    ├── notification_list_screen.dart
    └── notification_detail_screen.dart
lib/features/chat/
├── data/
│   ├── chat_api_service.dart
│   └── chat_repository.dart
├── models/
│   └── chat_model.dart
├── providers/
│   └── chat_provider.dart
└── screens/
    ├── inbox_screen.dart
    ├── conversation_list_screen.dart
    └── chat_detail_screen.dart
```

### Screens
- Notification List
- Notification Detail
- In-App Messaging Inbox
- Conversation List
- Chat Detail

### Routes
```
/notifications
/notifications/:id
/chat
/chat/:id
```

### Models
- `NotificationModel` — id, title, message, type, read, created_at
- `ChatMessage` — id, sender_id, content, created_at
- `ChatConversation` — id, participants, last_message, unread_count

### APIs
```
GET  /notifications
GET  /notifications/unread
GET  /notifications/stats
PUT  /notifications/{id}/read
PUT  /notifications/read-all
DELETE /notifications/{id}
GET  /notification-preferences
PUT  /notification-preferences
POST /fcm-tokens
GET  /chat
POST /chat
GET  /chat/{id}
POST /chat/{id}/messages
POST /chat/{id}/read
```

### Permissions
- Any authenticated user

### Backend Changes Required
- FCM configuration for push notifications

### Tests
- Notification list loads
- Notification mark as read works
- Chat messages load
- Message sending works
- FCM token registration works

### Security Checks
- Notifications user-scoped
- Chat messages encrypted
- FCM tokens stored securely

### Acceptance Criteria
- [ ] Users receive push notifications
- [ ] In-app notification center works
- [ ] Notification preferences work
- [ ] Deep linking from notifications works
- [ ] Chat messaging works

### Rollback Strategy
- Revert to Phase 14 tag

### Risks
- Medium — FCM setup can be complex
- Mitigation: Use Firebase Cloud Messaging (allowed for notifications only)

### Definition of Done
- Users receive and can manage notifications
- All notification tests pass

---

## PHASE 16 — OFFLINE / CACHING / RESILIENCE

### Goal
Offline support with local caching and retry logic.

### Why This Phase Comes Here
Offline support enhances UX — requires all features to be built first.

### Prerequisites
- Phase 15 complete

### Files to Modify
- `lib/core/api/api_client.dart` — Add caching interceptors
- All service classes — Add cache-first logic

### New Files
```
lib/core/cache/
├── cache_manager.dart
├── cache_interceptor.dart
└── offline_indicator.dart
lib/core/network/
├── connectivity_service.dart
├── retry_handler.dart
└── request_queue.dart
```

### Screens
- Offline indicator banner
- Cached data display

### Routes
- None

### Models
- None

### APIs
- None (offline support is client-side)

### Permissions
- None

### Dependencies (New)
```yaml
connectivity_plus: ^5.0.0
hive: ^2.2.0
hive_flutter: ^1.1.0
```

### Backend Changes Required
- None

### Tests
- Network loss shows offline indicator
- Cached data displays when offline
- Retry logic works
- Queue management works
- Data syncs when back online

### Security Checks
- Cached data encrypted
- Sensitive data not cached
- Cache cleared on logout

### Acceptance Criteria
- [ ] App handles network issues gracefully
- [ ] Cached data displays when offline
- [ ] Retry logic works
- [ ] Failed requests queue and retry
- [ ] Data syncs when back online

### Rollback Strategy
- Revert to Phase 15 tag

### Risks
- Medium — offline sync can be complex
- Mitigation: Cache-read only for most data

### Definition of Done
- App handles network issues gracefully
- All offline tests pass

---

## PHASE 17 — SECURITY HARDENING

### Goal
Production security with certificate pinning, jailbreak detection, and secure storage.

### Why This Phase Comes Here
Security hardening before release — requires all features to be stable.

### Prerequisites
- Phase 16 complete

### Files to Modify
- `lib/core/api/api_client.dart` — Add certificate pinning
- `lib/core/security/` — Add security features

### New Files
```
lib/core/security/
├── certificate_pinner.dart
├── jailbreak_detector.dart
├── secure_storage_audit.dart
└── input_validator.dart
```

### Screens
- None

### Routes
- None

### Models
- None

### APIs
- None

### Permissions
- None

### Dependencies (New)
```yaml
flutter_jailbreak_detection: ^1.10.0
ssl_pinning: ^2.0.0
```

### Backend Changes Required
- None

### Tests
- Certificate pinning works
- Jailbreak detection works
- Secure storage audit passes
- Input validation works

### Security Checks
- Certificate pinning enforced
- Jailbreak detection alerts
- Secure storage encrypted
- Input validation prevents injection

### Acceptance Criteria
- [ ] Certificate pinning works
- [ ] Jailbreak/root detection works
- [ ] Secure storage audit passes
- [ ] Input validation prevents injection
- [ ] API security verified

### Rollback Strategy
- Revert to Phase 16 tag

### Risks
- Low — security features are well-understood

### Definition of Done
- App meets security standards
- All security tests pass

---

## PHASE 18 — COMPLETE TESTING

### Goal
Comprehensive testing across all layers.

### Why This Phase Comes Here
Testing after all features are built — ensures complete coverage.

### Prerequisites
- Phase 17 complete

### Files to Modify
- All test files

### New Files
```
test/
├── unit/
│   ├── api_client_test.dart
│   ├── models/
│   │   ├── user_model_test.dart
│   │   ├── course_model_test.dart
│   │   └── ...
│   ├── services/
│   │   ├── auth_service_test.dart
│   │   ├── student_service_test.dart
│   │   └── ...
│   └── providers/
│       ├── auth_provider_test.dart
│       └── ...
├── widget/
│   ├── login_screen_test.dart
│   ├── dashboard_screen_test.dart
│   └── ...
├── integration/
│   ├── login_flow_test.dart
│   ├── course_flow_test.dart
│   └── ...
└── security/
    ├── role_guard_test.dart
    ├── permission_test.dart
    └── ...
```

### Screens
- None

### Routes
- None

### Models
- None

### APIs
- None

### Permissions
- None

### Dependencies (Existing)
- `flutter_test`
- `mockito`
- `integration_test`

### Backend Changes Required
- None

### Tests
- Unit tests for all services/models
- Widget tests for all screens
- Integration tests for critical flows
- Role-based access tests
- Security tests

### Security Checks
- All security tests pass

### Acceptance Criteria
- [ ] All unit tests pass
- [ ] All widget tests pass
- [ ] All integration tests pass
- [ ] All role-based tests pass
- [ ] All security tests pass
- [ ] Code coverage > 80%

### Rollback Strategy
- N/A (testing phase)

### Risks
- Low — testing is additive

### Definition of Done
- All tests pass
- Code coverage > 80%

---

## PHASE 19 — PERFORMANCE & OPTIMIZATION

### Goal
Production performance with smooth 60fps and small app size.

### Why This Phase Comes Here
Performance optimization after testing — ensures quality.

### Prerequisites
- Phase 18 complete

### Files to Modify
- All screen files — Optimize rendering
- `pubspec.yaml` — Optimize dependencies

### New Files
- None

### Screens
- None

### Routes
- None

### Models
- None

### APIs
- None

### Permissions
- None

### Dependencies (Existing)
- All dependencies

### Backend Changes Required
- None

### Tests
- App startup time < 2 seconds
- Screen transition time < 300ms
- API response handling < 100ms
- Memory usage < 150MB
- App size < 30MB

### Security Checks
- None

### Acceptance Criteria
- [ ] Smooth 60fps
- [ ] Small app size
- [ ] Fast startup
- [ ] Low memory usage
- [ ] No jank

### Rollback Strategy
- Revert to Phase 18 tag

### Risks
- Low — optimization is incremental

### Definition of Done
- App runs at 60fps
- App size optimized

---

## PHASE 20 — RELEASE PREPARATION

### Goal
Ready for app store submission.

### Why This Phase Comes Here
Final phase — all features complete and tested.

### Prerequisites
- Phase 19 complete
- App Store accounts configured
- Developer certificates ready

### Files to Modify
- `android/app/build.gradle` — Release signing config
- `ios/Runner.xcodeproj` — Release signing
- All files — Version bump

### New Files
- App store assets (screenshots, descriptions)
- Privacy policy
- Terms of service

### Screens
- None

### Routes
- None

### Models
- None

### APIs
- None

### Permissions
- None

### Dependencies (Existing)
- All dependencies

### Backend Changes Required
- Production API endpoint configured
- SSL certificates valid
- FCM production key configured

### Tests
- Release build compiles
- Release build runs on physical devices
- App store assets ready
- Privacy policy published

### Security Checks
- No debug code in release
- No test credentials in release
- Signing certificates secure

### Acceptance Criteria
- [ ] Android release build compiles
- [ ] iOS release build compiles
- [ ] App store assets ready
- [ ] Privacy policy published
- [ ] App store submission complete

### Rollback Strategy
- Revert to Phase 19 tag

### Risks
- Low — release is well-understood

### Definition of Done
- App published to Google Play Store
- App published to Apple App Store

---

## Summary: Phase Dependencies

```
Phase 0 (Baseline)
  └── Phase 1 (Cleanup)
        └── Phase 2 (API Client)
              └── Phase 3 (Auth)
                    └── Phase 4 (Roles)
                          └── Phase 5 (Navigation)
                                └── Phase 6 (Design System)
                                      └── Phase 7 (Student)
                                            └── Phase 8 (Parent)
                                                  └── Phase 9 (Teacher)
                                                        └── Phase 10 (Admin)
                                                              └── Phase 11 (LMS)
                                                                    └── Phase 12 (Coding)
                                                                          └── Phase 13 (Competitions)
                                                                                └── Phase 14 (AI)
                                                                                      └── Phase 15 (Notifications)
                                                                                            └── Phase 16 (Offline)
                                                                                                  └── Phase 17 (Security)
                                                                                                        └── Phase 18 (Testing)
                                                                                                              └── Phase 19 (Performance)
                                                                                                                    └── Phase 20 (Release)
```

---

*End of Implementation Phases.*
