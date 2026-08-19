# 04 — API MAPPING

**Audit Date:** 2026-08-19
**Scope:** Complete mapping of Flutter screens → Laravel API endpoints
**Method:** Cross-reference of verified Laravel routes (api.php) against required Flutter screens
**Current State:** Flutter has **ZERO** API integration. All mappings below are TARGET state.

---

## 1. API Communication Architecture

### Current State (Flutter)

```
Flutter App → No HTTP client → No API calls → All data hardcoded
```

### Target State (Coder's Hero)

```
Flutter App
  → Dio HTTP Client (with interceptors)
    → Token Interceptor (adds Authorization: Bearer <token>)
    → Error Interceptor (handles 401 → refresh/logout, 403 → deny, 500 → error)
    → Logging Interceptor (debug builds only)
  → API Service Classes (per module)
    → Each service wraps a group of related endpoints
    → Returns parsed Dart models
  → State Management (Provider/Riverpod/Bloc)
    → Caches API responses
    → Manages loading/error states
    → Triggers UI updates
  → Laravel REST API
    → Sanctum authentication
    → Role-based middleware
    → Request validation
    → Resource responses
```

### Base URL Configuration

```
Development: http://10.0.2.2:8000/api (Android emulator)
             http://localhost:8000/api (iOS simulator)
Production:  https://api.codershero.com/api
```

---

## 2. Authentication API Mapping

| Flutter Screen | Flutter Service | Laravel Endpoint | Method | Request | Response | Permission |
|---------------|----------------|-----------------|--------|---------|----------|------------|
| LoginScreen | AuthApi.login() | POST /api/login | POST | {email, password} | {token, user} | public |
| LoginScreen | AuthApi.register() | POST /api/register | POST | {name, email, password, password_confirmation} | {token, user} | public |
| ProfileScreen | AuthApi.logout() | POST /api/logout | POST | — | {message} | auth:sanctum |
| ProfileScreen | AuthApi.getProfile() | GET /api/profile | GET | — | {user with role, permissions} | auth:sanctum |
| ProfileScreen | AuthApi.updateProfile() | PUT /api/profile | PUT | {name, email, ...} | {user} | auth:sanctum |
| SettingsScreen | AuthApi.changePassword() | POST /api/change-password | POST | {current_password, password, password_confirmation} | {message} | auth:sanctum |
| ForgotPasswordScreen | AuthApi.forgotPassword() | POST /api/forgot-password | POST | {email} | {message} | public |
| ResetPasswordScreen | AuthApi.resetPassword() | POST /api/reset-password | POST | {token, email, password, password_confirmation} | {message} | public |
| SettingsScreen | AuthApi.get2FAStatus() | GET /api/two-factor/status | GET | — | {enabled} | auth:sanctum |
| SettingsScreen | AuthApi.enable2FA() | POST /api/two-factor/enable | POST | — | {qr_code, secret} | auth:sanctum |
| SettingsScreen | AuthApi.confirm2FA() | POST /api/two-factor/confirm | POST | {code} | {recovery_codes} | auth:sanctum |
| SettingsScreen | AuthApi.disable2FA() | POST /api/two-factor/disable | POST | {code} | {message} | auth:sanctum |
| SettingsScreen | AuthApi.getRecoveryCodes() | POST /api/two-factor/recovery-codes | POST | — | {recovery_codes} | auth:sanctum |
| SettingsScreen | AuthApi.challenge2FA() | POST /api/two-factor/challenge | POST | {code} | {token} | public |
| SplashScreen | AuthApi.verifyEmail() | GET /api/email/verify/{id}/{hash} | GET | — | {message} | public |

### Token Management

```
Storage: flutter_secure_storage
Key: auth_token
Flow:
  1. Login → POST /api/login → receive token → store in secure_storage
  2. App startup → read token from secure_storage → if exists, fetch profile
  3. Every API request → Dio interceptor adds "Authorization: Bearer <token>"
  4. On 401 response → clear token → redirect to login
  5. On logout → POST /api/logout → clear token → redirect to login
  6. Token refresh → POST /api/refresh-token → update stored token
```

---

## 3. Dashboard API Mapping

| Flutter Screen | Flutter Service | Laravel Endpoint | Method | Request | Response | Permission |
|---------------|----------------|-----------------|--------|---------|----------|------------|
| StudentDashboard | DashboardApi.getDashboard() | GET /api/dashboard | GET | — | {stats, recent, notifications} | auth:sanctum |
| StudentDashboard | DashboardApi.getStats() | GET /api/dashboard/stats | GET | — | {students, revenue, courses, etc.} | auth:sanctum |
| ParentDashboard | ParentApi.getSummary() | GET /api/parent/summary | GET | — | {children count, fees summary, attendance} | role:parent |
| TeacherDashboard | TeacherApi.getDashboard() | GET /api/teacher/dashboard | GET | — | {classes, students, assignments, attendance} | role:teacher |
| AdminDashboard | DashboardApi.getDashboard() | GET /api/dashboard | GET | — | {full stats grid} | auth:sanctum |

---

## 4. Student Module API Mapping

| Flutter Screen | Flutter Service | Laravel Endpoint | Method | Request | Response | Permission |
|---------------|----------------|-----------------|--------|---------|----------|------------|
| StudentCourses | CourseApi.getCourses() | GET /api/courses | GET | ?search, ?category, ?page | {courses[], pagination} | auth:sanctum |
| StudentCourses | CourseApi.getFeatured() | GET /api/courses/featured | GET | — | {courses[]} | auth:sanctum |
| CourseDetail | CourseApi.getCourse(id) | GET /api/courses/{id} | GET | — | {course with lessons} | auth:sanctum |
| CourseDetail | CourseApi.getCourseLessons(id) | GET /api/courses/{id}/lessons | GET | — | {lessons[]} | auth:sanctum |
| CourseDetail | CourseApi.getCourseStats(id) | GET /api/courses/{id}/stats | GET | — | {enrollments, completion} | auth:sanctum |
| CourseDetail | EnrollmentApi.enroll(courseId) | POST /api/enrollments | POST | {course_id} | {enrollment} | auth:sanctum |
| StudentCourses | EnrollmentApi.getMyCourses() | GET /api/enrollments/my-courses | GET | — | {enrollments[] with course} | auth:sanctum |
| StudentCourses | EnrollmentApi.getStats() | GET /api/enrollments/stats | GET | — | {enrolled, completed, in_progress} | auth:sanctum |
| LessonScreen | EnrollmentApi.updateProgress(lessonId) | POST /api/enrollments/progress/{lessonId} | POST | {completed: true} | {progress} | auth:sanctum |
| StudentAttendance | StudentApi.getAttendance(id) | GET /api/students/{id}/attendance | GET | ?date_from, ?date_to | {attendance[]} | auth:sanctum |
| StudentAttendance | StudentApi.getMonthlyAttendance(id) | GET /api/students/{id}/attendance/monthly | GET | ?month, ?year | {attendance summary} | auth:sanctum |
| StudentAssignments | StudentAssignmentApi.getAssignments() | GET /api/student/assignments | GET | ?status, ?page | {assignments[]} | role:student |
| StudentAssignments | StudentAssignmentApi.getSubmissions() | GET /api/student/assignments/my-submissions | GET | — | {submissions[]} | role:student |
| AssignmentDetail | StudentAssignmentApi.getAssignment(id) | GET /api/student/assignments/{id} | GET | — | {assignment detail} | role:student |
| AssignmentDetail | StudentAssignmentApi.submit(id) | POST /api/student/assignments/{id}/submit | POST | {content/file} | {submission} | role:student |
| StudentExams | TeacherApi.getExams() | GET /api/teacher/exams | GET | — | {exams[]} | role:teacher |
| StudentGrades | EnrollmentApi.getStats() | GET /api/enrollments/stats | GET | — | {grades summary} | auth:sanctum |
| StudentCertificates | CertificateApi.getCertificates() | GET /api/certificates | GET | — | {certificates[]} | auth:sanctum |
| CertificateDetail | CertificateApi.getCertificate(id) | GET /api/certificates/{id} | GET | — | {certificate detail} | auth:sanctum |
| CertificateDetail | CertificateApi.download(id) | GET /api/certificates/{number}/download | GET | — | {PDF file} | auth:sanctum |

---

## 5. Parent Module API Mapping

| Flutter Screen | Flutter Service | Laravel Endpoint | Method | Request | Response | Permission |
|---------------|----------------|-----------------|--------|---------|----------|------------|
| ParentDashboard | ParentApi.getSummary() | GET /api/parent/summary | GET | — | {children count, stats} | role:parent |
| ChildrenList | ParentApi.getChildren() | GET /api/parent/children | GET | — | {children[] with user, student} | role:parent |
| ChildDetail | ParentApi.getChild(id) | GET /api/parent/children/{id} | GET | — | {child detail} | role:parent |
| ChildAttendance | ParentApi.getAttendance() | GET /api/parent/attendance | GET | ?child_id, ?date_from, ?date_to | {attendance[]} | role:parent |
| ChildProgress | ParentApi.getProgress() | GET /api/parent/progress | GET | ?child_id | {progress data} | role:parent |
| ReportCards | ParentApi.getReportCards() | GET /api/parent/report-cards | GET | ?child_id | {report_cards[]} | role:parent |
| ReportCardDetail | ParentApi.getReportCard(id) | GET /api/parent/report-cards/{id} | GET | — | {report card detail} | role:parent |
| ParentFees | ParentApi.getFees() | GET /api/parent/fees | GET | ?child_id, ?status | {fees[]} | role:parent |
| FeeDetail | ParentApi.getFee(id) | GET /api/parent/fees/{id} | GET | — | {fee detail with payments} | role:parent |
| FeeDetail | ParentApi.payFee(id) | POST /api/parent/fees/{id}/pay | POST | {amount, method} | {payment} | role:parent |
| ReceiptDetail | ParentApi.getReceipt(id) | GET /api/parent/payments/{id} | GET | — | {payment detail} | role:parent |
| ReceiptDetail | ParentApi.downloadReceipt(id) | GET /api/parent/payments/{id}/pdf | GET | — | {PDF file} | role:parent |
| ParentNotifications | ParentApi.getNotifications() | GET /api/parent/notifications | GET | — | {notifications[]} | role:parent |
| ParentNotifications | ParentApi.markRead(id) | POST /api/parent/notifications/{id}/read | POST | — | {message} | role:parent |

### CRITICAL: Parent-Child Authorization

```
The Laravel ParentController scopes all queries to the authenticated parent's children.
A parent CANNOT access another parent's child by manipulating IDs.

Backend enforcement:
  - ParentController uses $this->user()->children to scope queries
  - ParentFeeController checks child belongs to parent
  - ParentAttendanceController checks child belongs to parent

Flutter must NOT:
  - Allow manual entry of child IDs
  - Cache other parents' children data
  - Display child data without verifying parent relationship
```

---

## 6. Teacher Module API Mapping

| Flutter Screen | Flutter Service | Laravel Endpoint | Method | Request | Response | Permission |
|---------------|----------------|-----------------|--------|---------|----------|------------|
| TeacherDashboard | TeacherApi.getDashboard() | GET /api/teacher/dashboard | GET | — | {classes, students, stats} | role:teacher |
| TeacherClasses | TeacherApi.getClasses() | GET /api/teacher/classes | GET | — | {classes[] with students} | role:teacher |
| ClassDetail | TeacherApi.getClass(id) | GET /api/teacher/classes/{id} | GET | — | {class with roster} | role:teacher |
| ClassDetail | TeacherApi.getRoster(id) | GET /api/teacher/classes/{id}/roster | GET | — | {students[]} | role:teacher |
| MarkAttendance | TeacherApi.recordAttendance(classId) | POST /api/teacher/classes/{id}/attendance | POST | {date, records: [{student_id, status}]} | {attendance[]} | role:teacher |
| ClassDetail | TeacherApi.getAttendanceSummary(id) | GET /api/teacher/classes/{id}/attendance | GET | — | {attendance summary} | role:teacher |
| TeacherAssignments | TeacherApi.getAssignments() | GET /api/teacher/assignments | GET | — | {assignments[]} | role:teacher |
| CreateAssignment | TeacherApi.createAssignment() | POST /api/teacher/assignments | POST | {title, description, due_date, class_id, ...} | {assignment} | role:teacher |
| AssignmentDetail | TeacherApi.getAssignment(id) | GET /api/teacher/assignments/{id} | GET | — | {assignment detail} | role:teacher |
| AssignmentDetail | TeacherApi.getSubmissions(id) | GET /api/teacher/assignments/{id}/submissions | GET | — | {submissions[]} | role:teacher |
| AssignmentDetail | TeacherApi.gradeSubmission(assignmentId, submissionId) | PUT /api/teacher/assignments/{id}/submissions/{sid}/grade | PUT | {grade, feedback} | {submission} | role:teacher |
| TeacherExams | TeacherApi.getExams() | GET /api/teacher/exams | GET | — | {exams[]} | role:teacher |
| CreateExam | TeacherApi.createExam() | POST /api/teacher/exams | POST | {title, date, total_marks, class_id, ...} | {exam} | role:teacher |
| Gradebook | TeacherApi.getGradebook(classId) | GET /api/teacher/gradebook/classes/{classId}/entries | GET | — | {entries[]} | role:teacher |
| Gradebook | TeacherApi.getClassSummary(classId) | GET /api/teacher/gradebook/classes/{classId}/summary | GET | — | {summary} | role:teacher |
| LessonNotes | TeacherApi.getLessonNotes() | GET /api/teacher/lesson-notes | GET | — | {notes[]} | role:teacher |
| CreateLessonNote | TeacherApi.createLessonNote() | POST /api/teacher/lesson-notes | POST | {title, content, class_id, ...} | {note} | role:teacher |

---

## 7. Coding Lab API Mapping

| Flutter Screen | Flutter Service | Laravel Endpoint | Method | Request | Response | Permission |
|---------------|----------------|-----------------|--------|---------|----------|------------|
| CodingPlayground | CodingApi.run(code) | POST /api/lms/playground/run | POST | {code, language} | {output, errors} | auth:sanctum |
| CodingPlayground | CodingApi.saveWorkspace() | POST /api/lms/playground/workspaces | POST | {name, code, language} | {workspace} | auth:sanctum |
| CodingPlayground | CodingApi.loadWorkspace(id) | GET /api/lms/playground/workspaces/{id}/load | GET | — | {workspace} | auth:sanctum |
| CodingPlayground | CodingApi.listWorkspaces() | GET /api/lms/playground/workspaces | GET | — | {workspaces[]} | auth:sanctum |
| CodingExercises | CodingApi.getExercises(courseId) | GET /api/lms/courses/{courseId}/coding-exercises | GET | — | {exercises[]} | auth:sanctum |
| CodingExerciseDetail | CodingApi.getExercise(id) | GET /api/lms/coding-exercises/{id} | GET | — | {exercise detail} | auth:sanctum |
| CodingExerciseDetail | CodingApi.submitExercise(id) | POST /api/lms/coding-exercises/{id}/submit | POST | {code, language} | {result, score} | auth:sanctum |
| CodingLeaderboard | CodingApi.getLeaderboard(courseId) | GET /api/lms/coding-leaderboard/for-course/{courseId} | GET | — | {leaderboard[]} | auth:sanctum |
| CodingPlayground | CodingApi.getHint(exerciseId) | POST /api/lms/coding-ai/hint | POST | {exercise_id, code} | {hint} | auth:sanctum |
| CodingPlayground | CodingApi.debugCode(exerciseId) | POST /api/lms/coding-ai/debug | POST | {exercise_id, code, error} | {suggestion} | auth:sanctum |

### Code Execution Security

```
Flutter NEVER executes code locally.
All code execution goes through:
  Flutter → POST /api/lms/playground/run → Laravel → Piston/Docker sandbox

The Laravel backend uses an isolated execution architecture:
  - Docker containers with resource limits
  - CPU, memory, execution time limits
  - No network access
  - Restricted filesystem
  - Automatic cleanup after execution
```

---

## 8. AI Platform API Mapping

| Flutter Screen | Flutter Service | Laravel Endpoint | Method | Request | Response | Permission |
|---------------|----------------|-----------------|--------|---------|----------|------------|
| AiTutor | AiApi.getAssistants() | GET /api/lms/ai/assistants | GET | — | {assistants[]} | use_ai_assistants |
| AiTutor | AiApi.getAssistant(slug) | GET /api/lms/ai/assistants/{slug} | GET | — | {assistant detail} | use_ai_assistants |
| AiTutor | AiApi.getConversations() | GET /api/lms/ai/conversations | GET | — | {conversations[]} | use_ai_assistants |
| AiTutor | AiApi.createConversation() | POST /api/lms/ai/conversations | POST | {assistant_id, title?} | {conversation} | use_ai_assistants |
| AiChat | AiApi.sendMessage(conversationId) | POST /api/lms/ai/conversations/{id}/messages | POST | {content} | {user_msg, ai_msg} | use_ai_assistants |
| AiTutor | AiApi.getUsage() | GET /api/lms/ai/my-usage | GET | — | {tokens_used, cost, messages} | use_ai_assistants |

### AI Security

```
Flutter NEVER has access to:
  - OpenAI API keys
  - AI provider credentials
  - Internal API tokens

All AI requests go through:
  Flutter → Laravel API → AiPlatformService → OpenAiProvider → OpenAI API

The API key is stored in Laravel's config/ai.php and loaded from environment variables.
```

---

## 9. Competitions API Mapping

| Flutter Screen | Flutter Service | Laravel Endpoint | Method | Request | Response | Permission |
|---------------|----------------|-----------------|--------|---------|----------|------------|
| CompetitionsList | CompetitionApi.getCompetitions() | GET /api/competitions | GET | ?status, ?type | {competitions[]} | auth:sanctum |
| CompetitionDetail | CompetitionApi.getCompetition(id) | GET /api/competitions/{id} | GET | — | {competition with teams} | auth:sanctum |
| CompetitionDetail | CompetitionApi.register(id) | POST /api/competitions/{id}/register | POST | {team_name, members} | {team} | auth:sanctum |
| MyCompetitions | CompetitionApi.getMyTeams() | GET /api/competitions/my-teams | GET | — | {teams[]} | auth:sanctum |
| CompetitionLeaderboard | CompetitionApi.getLeaderboard(id) | GET /api/competitions/{id}/leaderboard | GET | — | {leaderboard[]} | auth:sanctum |

---

## 10. Notifications API Mapping

| Flutter Screen | Flutter Service | Laravel Endpoint | Method | Request | Response | Permission |
|---------------|----------------|-----------------|--------|---------|----------|------------|
| NotificationsScreen | NotificationApi.getNotifications() | GET /api/notifications | GET | ?read, ?page | {notifications[]} | auth:sanctum |
| NotificationsScreen | NotificationApi.getUnread() | GET /api/notifications/unread | GET | — | {count, notifications[]} | auth:sanctum |
| NotificationsScreen | NotificationApi.markRead(id) | PUT /api/notifications/{id}/read | PUT | — | {message} | auth:sanctum |
| NotificationsScreen | NotificationApi.markAllRead() | PUT /api/notifications/read-all | PUT | — | {message} | auth:sanctum |
| NotificationsScreen | NotificationApi.getStats() | GET /api/notifications/stats | GET | — | {total, unread} | auth:sanctum |
| SettingsScreen | NotificationApi.registerFcmToken() | POST /api/fcm-tokens | POST | {token, platform} | {message} | auth:sanctum |
| SettingsScreen | NotificationApi.getPreferences() | GET /api/notification-preferences | GET | — | {preferences} | auth:sanctum |
| SettingsScreen | NotificationApi.updatePreferences() | PUT /api/notification-preferences | PUT | {email, push, sms} | {message} | auth:sanctum |

### Push Notification Flow

```
1. App starts → Firebase Messaging requests permission
2. Receive FCM token → POST /api/fcm-tokens → Store in Laravel
3. Laravel sends push notification via FCM
4. Flutter receives push notification → Deep link to relevant screen
5. On logout → DELETE /api/fcm-tokens/{id} → Remove token
```

---

## 11. Certificates API Mapping

| Flutter Screen | Flutter Service | Laravel Endpoint | Method | Request | Response | Permission |
|---------------|----------------|-----------------|--------|---------|----------|------------|
| CertificatesList | CertificateApi.getCertificates() | GET /api/certificates | GET | — | {certificates[]} | auth:sanctum |
| CertificateDetail | CertificateApi.getCertificate(id) | GET /api/certificates/{id} | GET | — | {certificate with qr} | auth:sanctum |
| CertificateDetail | CertificateApi.download(number) | GET /api/certificates/{number}/download | GET | — | {PDF file} | auth:sanctum |

---

## 12. Library API Mapping (Limited Mobile Scope)

| Flutter Screen | Flutter Service | Laravel Endpoint | Method | Request | Response | Permission |
|---------------|----------------|-----------------|--------|---------|----------|------------|
| LibraryCatalog | LibraryApi.getCatalog() | GET /api/library | GET | ?search, ?type, ?category | {resources[]} | auth:sanctum |
| LibraryDetail | LibraryApi.getResource(id) | GET /api/library/resources/{id} | GET | — | {resource detail} | auth:sanctum |
| MyLibrary | LibraryApi.getMyBorrowings() | GET /api/library/my-borrowings | GET | — | {borrowings[]} | auth:sanctum |
| LibraryDetail | LibraryApi.borrow(id) | POST /api/library/{id}/borrow | POST | — | {borrowing} | auth:sanctum |
| LibraryDetail | LibraryApi.reserve(id) | POST /api/library/{id}/reserve | POST | — | {reservation} | auth:sanctum |

---

## 13. API Response Structure (Verified from Laravel)

### Standard Success Response

```json
{
  "success": true,
  "data": {
    // Resource or collection
  },
  "message": "Optional message"
}
```

### Standard Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "data": [...],
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 75
  }
}
```

### Authentication Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Admin",
      "email": "admin@codershero.com",
      "role": {
        "id": 1,
        "name": "super_admin"
      },
      "permissions": ["students.view", "finance.view", ...]
    },
    "token": "1|abc123...",
    "token_type": "Bearer"
  }
}
```

---

## 14. API Mapping Summary

| Category | Endpoints | Flutter Screens | Status |
|----------|-----------|----------------|--------|
| Authentication | 15 | 3 (Login, ForgotPassword, Settings) | ALL MISSING |
| Dashboard | 2 | 4 (Student, Parent, Teacher, Admin) | ALL MISSING |
| Courses | 7 | 3 (List, Detail, Lessons) | ALL MISSING |
| Enrollments | 4 | 2 (MyCourses, Stats) | ALL MISSING |
| Students | 30+ | 2 (Attendance, Profile) | ALL MISSING |
| Assignments | 4+ | 2 (List, Detail) | ALL MISSING |
| Exams | Multiple | 1 (List) | ALL MISSING |
| Grades | Multiple | 1 (View) | ALL MISSING |
| Parent Portal | 19 | 7 (Dashboard, Children, Attendance, Progress, Fees, ReportCards, Notifications) | ALL MISSING |
| Teacher Portal | 54 | 7 (Dashboard, Classes, ClassDetail, Attendance, Assignments, Exams, Gradebook) | ALL MISSING |
| Coding Lab | 10+ | 3 (Playground, Exercises, Leaderboard) | ALL MISSING |
| AI Platform | 6+ | 2 (AssistantList, Chat) | ALL MISSING |
| Competitions | 5+ | 3 (List, Detail, Leaderboard) | ALL MISSING |
| Notifications | 8 | 1 (Center) | ALL MISSING |
| Certificates | 3 | 2 (List, Detail) | ALL MISSING |
| Library | 5 | 1 (Catalog) | ALL MISSING |
| **TOTAL** | **~180** | **~48** | **ALL MISSING** |

### Critical First API to Implement

1. `POST /api/login` — Without this, nothing works
2. `GET /api/profile` — Required for role-based routing
3. `GET /api/dashboard` / `GET /api/dashboard/stats` — Core experience
4. `GET /api/courses` — Core learning experience
5. `GET /api/notifications` — Core communication

---

## 15. Mismatch Risk Areas

| Risk | Description | Mitigation |
|------|-------------|------------|
| Token format | Flutter must match Sanctum Bearer token format | Use Dio interceptor with exact header format |
| Pagination | Laravel uses page/per_page, Flutter must handle cursor/page | Implement paginated list widget |
| Date format | Laravel returns ISO 8601, Flutter must parse correctly | Use intl package with consistent format |
| File uploads | Laravel expects multipart/form-data, Flutter must use Dio multipart | Implement file upload service |
| Error structure | Laravel returns {success, message, errors}, Flutter must handle all cases | Centralized error handler |
| Enum values | Laravel uses specific enum values (e.g., attendance: present/absent/late/excused) | Flutter enum must match exactly |
| Null fields | Laravel may return null for optional fields, Flutter models must handle nullable | Use nullable types in Dart models |
| Array vs Object | Laravel may return single object or array depending on context | Handle both cases in model parsing |
