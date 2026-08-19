# New File Plan - Complete File Specifications

> Coder's Hero Flutter Mobile App - All 89 New Files
> Generated from verified codebase audit

---

## 1. Core Architecture (4 files)

### 1.1 `lib/config/app_config.dart`
- **Purpose**: Central configuration for API base URL, environment detection, app constants
- **Layer**: Config
- **Dependencies**: `flutter_dotenv`
- **API Consumed**: None (reads env vars)
- **Model Used**: None
- **Route**: None
- **Permission**: None
- **Consumers**: `api_client.dart`, `main.dart`
- **Tests Needed**: Unit test for env loading, test for dev/prod/staging switching
- **Content**:
  ```dart
  class AppConfig {
    static String get apiBaseUrl => dotenv.env['API_BASE_URL'] ?? 'http://localhost:8000';
    static String get appName => "Coder's Hero";
    static bool get isDev => dotenv.env['ENVIRONMENT'] == 'development';
    static Duration get apiTimeout => Duration(seconds: 30);
  }
  ```

### 1.2 `lib/config/api_config.dart`
- **Purpose**: All API endpoint constants organized by domain
- **Layer**: Config
- **Dependencies**: None
- **API Consumed**: None (defines constants)
- **Model Used**: None
- **Route**: None
- **Permission**: None
- **Consumers**: All `*_api.dart` service files
- **Tests Needed**: None (constants only)
- **Content**:
  ```dart
  class ApiConfig {
    // Auth
    static const String login = '/api/login';
    static const String logout = '/api/logout';
    static const String user = '/api/user';
    static const String forgotPassword = '/api/forgot-password';
    static const String resetPassword = '/api/reset-password';
    
    // Student
    static const String studentDashboard = '/api/student/dashboard';
    static const String studentCourses = '/api/student/courses';
    static const String studentAttendance = '/api/student/attendance';
    static const String studentExams = '/api/student/exams';
    static const String studentGrades = '/api/student/grades';
    static const String studentAssignments = '/api/student/assignments';
    static const String studentTimetable = '/api/student/timetable';
    static const String studentCertificates = '/api/student/certificates';
    
    // Parent
    static const String parentDashboard = '/api/parent/dashboard';
    static const String parentChildren = '/api/parent/children';
    static const String parentFees = '/api/parent/fees';
    
    // Teacher
    static const String teacherDashboard = '/api/teacher/dashboard';
    static const String teacherClasses = '/api/teacher/classes';
    static const String teacherAttendance = '/api/teacher/attendance';
    
    // Notifications
    static const String notifications = '/api/notifications';
    static const String markRead = '/api/notifications/read';
    
    // AI
    static const String aiChat = '/api/ai/chat';
    static const String aiConversations = '/api/ai/conversations';
    
    // Library
    static const String libraryResources = '/api/library/resources';
    
    // Finance
    static const String fees = '/api/finance/fees';
    static const String invoices = '/api/finance/invoices';
    static const String payments = '/api/finance/payments';
    
    // Competitions
    static const String competitions = '/api/competitions';
    
    // Certificates
    static const String certificates = '/api/certificates';
  }
  ```

### 1.3 `lib/config/theme.dart`
- **Purpose**: Coder's Hero brand theme - colors, typography, component themes
- **Layer**: Config
- **Dependencies**: `google_fonts`
- **API Consumed**: None
- **Model Used**: None
- **Route**: None
- **Permission**: None
- **Consumers**: `main.dart`, all screens and widgets
- **Tests Needed**: Theme consistency test
- **Content**:
  ```dart
  class AppTheme {
    // Brand Colors
    static const Color primaryColor = Color(0xFF2563EB);    // Blue
    static const Color secondaryColor = Color(0xFF10B981);  // Green
    static const Color accentColor = Color(0xFFF59E0B);     // Amber
    static const Color errorColor = Color(0xFFEF4444);      // Red
    static const Color surfaceColor = Color(0xFFF8FAFC);    // Light gray
    static const Color backgroundColor = Color(0xFFFFFFFF);  // White
    static const Color textPrimary = Color(0xFF1E293B);     // Dark
    static const Color textSecondary = Color(0xFF64748B);   // Gray
    
    // Role Colors
    static const Color studentColor = Color(0xFF3B82F6);
    static const Color parentColor = Color(0xFF8B5CF6);
    static const Color teacherColor = Color(0xFF10B981);
    static const Color adminColor = Color(0xFFF59E0B);
    
    static ThemeData get lightTheme => ThemeData(...);
    static ThemeData get darkTheme => ThemeData(...);
  }
  ```

### 1.4 `lib/config/routes.dart`
- **Purpose**: GoRouter configuration with role-based route guards
- **Layer**: Config
- **Dependencies**: `go_router`, `flutter_riverpod`
- **API Consumed**: None
- **Model Used**: `User` (for role checks)
- **Route**: Defines all routes
- **Permission**: Role-based route guards
- **Consumers**: `main.dart`
- **Tests Needed**: Route guard tests, redirect logic tests
- **Content**:
  ```dart
  final routerProvider = Provider<GoRouter>((ref) {
    final authState = ref.watch(authProvider);
    return GoRouter(
      initialLocation: '/splash',
      redirect: (context, state) {
        final isLoggedIn = authState.isAuthenticated;
        final isAuthRoute = state.matchedLocation == '/login' || 
                           state.matchedLocation == '/splash';
        
        if (!isLoggedIn && !isAuthRoute) return '/login';
        if (isLoggedIn && isAuthRoute) return _getDashboardRoute(authState.user?.role);
        return null;
      },
      routes: [
        GoRoute(path: '/splash', builder: (_, __) => SplashScreen()),
        GoRoute(path: '/login', builder: (_, __) => LoginScreen()),
        GoRoute(path: '/forgot-password', builder: (_, __) => ForgotPasswordScreen()),
        // Student routes
        ShellRoute(routes: [
          GoRoute(path: '/student', builder: (_, __) => StudentDashboard()),
          GoRoute(path: '/student/courses', builder: (_, __) => CoursesScreen()),
          // ... more student routes
        ]),
        // Parent routes
        // Teacher routes
        // Admin routes
      ],
    );
  });
  ```

---

## 2. API Layer (13 files)

### 2.1 `lib/services/api_client.dart`
- **Purpose**: Dio HTTP client with interceptors for auth, logging, error handling
- **Layer**: Services
- **Dependencies**: `dio`, `shared_preferences`
- **API Consumed**: All APIs (client for all)
- **Model Used**: None (generic client)
- **Route**: None
- **Permission**: Attaches Bearer token
- **Consumers**: All `*_api.dart` services
- **Tests Needed**: Interceptor tests, token refresh tests, error handling tests
- **Content**:
  ```dart
  class ApiClient {
    late final Dio _dio;
    
    ApiClient() {
      _dio = Dio(BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: AppConfig.apiTimeout,
        receiveTimeout: AppConfig.apiTimeout,
      ));
      _dio.interceptors.addAll([
        AuthInterceptor(),
        LoggingInterceptor(),
        ErrorInterceptor(),
      ]);
    }
    
    Dio get dio => _dio;
  }
  
  class AuthInterceptor extends Interceptor {
    @override
    void onRequest(options, handler) async {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      handler.next(options);
    }
    
    @override
    void onError(dioError, handler) async {
      if (dioError.response?.statusCode == 401) {
        // Token expired - attempt refresh or logout
      }
      handler.next(dioError);
    }
  }
  ```

### 2.2 `lib/services/auth_api.dart`
- **Purpose**: Authentication API calls (login, logout, forgot password, reset password)
- **Layer**: Services
- **Dependencies**: `api_client.dart`
- **API Consumed**: `POST /api/login`, `POST /api/logout`, `POST /api/forgot-password`, `POST /api/reset-password`
- **Model Used**: `User`
- **Route**: None
- **Permission**: None (public endpoints)
- **Consumers**: `auth_provider.dart`, `login_screen.dart`, `forgot_password_screen.dart`
- **Tests Needed**: Login success/failure tests, token storage tests, logout tests

### 2.3 `lib/services/course_api.dart`
- **Purpose**: Course-related API calls (list, detail, lessons, enroll)
- **Layer**: Services
- **Dependencies**: `api_client.dart`
- **API Consumed**: `GET /api/student/courses`, `GET /api/student/courses/:id`, `GET /api/student/courses/:id/lessons`
- **Model Used**: `Course`, `Lesson`, `Enrollment`
- **Route**: None
- **Permission**: student, teacher
- **Consumers**: `course_provider.dart`, `courses_screen.dart`, `course_detail_screen.dart`
- **Tests Needed**: Course list pagination, lesson fetch, enrollment status

### 2.4 `lib/services/student_api.dart`
- **Purpose**: Student-specific API calls (dashboard, profile, attendance, grades)
- **Layer**: Services
- **Dependencies**: `api_client.dart`
- **API Consumed**: `GET /api/student/dashboard`, `GET /api/student/profile`, `GET /api/student/attendance`, `GET /api/student/grades`
- **Model Used**: `Student`, `Attendance`, `Grade`
- **Route**: None
- **Permission**: student
- **Consumers**: `dashboard_provider.dart`, student screens
- **Tests Needed**: Dashboard data aggregation, attendance summary, grade calculation

### 2.5 `lib/services/teacher_api.dart`
- **Purpose**: Teacher-specific API calls (classes, mark attendance, manage assignments/exams)
- **Layer**: Services
- **Dependencies**: `api_client.dart`
- **API Consumed**: `GET /api/teacher/classes`, `POST /api/teacher/attendance`, `GET /api/teacher/assignments`
- **Model Used**: `Course`, `Attendance`, `Assignment`
- **Route**: None
- **Permission**: teacher
- **Consumers**: teacher screens
- **Tests Needed**: Attendance marking, assignment CRUD

### 2.6 `lib/services/parent_api.dart`
- **Purpose**: Parent-specific API calls (children, fees, progress)
- **Layer**: Services
- **Dependencies**: `api_client.dart`
- **API Consumed**: `GET /api/parent/children`, `GET /api/parent/fees`, `GET /api/parent/progress`
- **Model Used**: `ParentChild`, `Fee`, `Attendance`
- **Route**: None
- **Permission**: parent
- **Consumers**: parent screens
- **Tests Needed**: Children list, fee calculations, progress aggregation

### 2.7 `lib/services/notification_api.dart`
- **Purpose**: Notification API calls (list, mark read, preferences)
- **Layer**: Services
- **Dependencies**: `api_client.dart`
- **API Consumed**: `GET /api/notifications`, `POST /api/notifications/:id/read`, `GET /api/notifications/unread-count`
- **Model Used**: `AppNotification`
- **Route**: None
- **Permission**: all authenticated users
- **Consumers**: `notification_provider.dart`, notification screens
- **Tests Needed**: Pagination, mark read, unread count

### 2.8 `lib/services/competition_api.dart`
- **Purpose**: Competition/hackathon API calls (list, register, submit, results)
- **Layer**: Services
- **Dependencies**: `api_client.dart`
- **API Consumed**: `GET /api/competitions`, `POST /api/competitions/:id/register`, `POST /api/competitions/:id/submit`
- **Model Used**: `Competition`
- **Route**: None
- **Permission**: student
- **Consumers**: competition screens
- **Tests Needed**: Registration flow, submission, results

### 2.9 `lib/services/ai_api.dart`
- **Purpose**: AI assistant API calls (chat, conversations, history)
- **Layer**: Services
- **Dependencies**: `api_client.dart`
- **API Consumed**: `POST /api/ai/chat`, `GET /api/ai/conversations`, `GET /api/ai/conversations/:id`
- **Model Used**: `AiAssistant`, `AiConversation`, `AiMessage`
- **Route**: None
- **Permission**: student, teacher
- **Consumers**: AI chat screens
- **Tests Needed**: Message send/receive, conversation history, streaming

### 2.10 `lib/services/coding_api.dart`
- **Purpose**: Coding lab API calls (problems, submit, run, leaderboard)
- **Layer**: Services
- **Dependencies**: `api_client.dart`
- **API Consumed**: `GET /api/coding/problems`, `POST /api/coding/submit`, `POST /api/coding/run`
- **Model Used**: Coding problem model
- **Route**: None
- **Permission**: student
- **Consumers**: coding lab screens
- **Tests Needed**: Code submission, test case execution, results

### 2.11 `lib/services/library_api.dart`
- **Purpose**: Library resource API calls (search, borrow, return)
- **Layer**: Services
- **Dependencies**: `api_client.dart`
- **API Consumed**: `GET /api/library/resources`, `POST /api/library/borrow`, `POST /api/library/return`
- **Model Used**: `LibraryResource`
- **Route**: None
- **Permission**: student, teacher
- **Consumers**: library screens
- **Tests Needed**: Search, borrow/return flow

### 2.12 `lib/services/finance_api.dart`
- **Purpose**: Finance API calls (fees, invoices, payments)
- **Layer**: Services
- **Dependencies**: `api_client.dart`
- **API Consumed**: `GET /api/finance/fees`, `GET /api/finance/invoices`, `POST /api/finance/payments`
- **Model Used**: `Fee`, `Invoice`, `Payment`
- **Route**: None
- **Permission**: parent, admin
- **Consumers**: finance screens, parent fees screen
- **Tests Needed**: Fee calculation, payment processing, invoice generation

### 2.13 `lib/services/certificate_api.dart`
- **Purpose**: Certificate API calls (list, download, verify)
- **Layer**: Services
- **Dependencies**: `api_client.dart`
- **API Consumed**: `GET /api/certificates`, `GET /api/certificates/:id/download`
- **Model Used**: `Certificate`
- **Route**: None
- **Permission**: student
- **Consumers**: certificates screen
- **Tests Needed**: List, download, verification

---

## 3. Models (20 files)

### 3.1 `lib/models/user.dart`
- **Purpose**: Core user model with role, permissions, profile data
- **Layer**: Models
- **Dependencies**: None
- **API Consumed**: Login response, user endpoint
- **Model Used**: Base model for all
- **Route**: None
- **Permission**: None
- **Consumers**: All providers, all auth-related screens
- **Tests Needed**: fromJson/toJson tests, role enum tests
- **Content**:
  ```dart
  enum UserRole { student, parent, teacher, admin }
  
  class User {
    final int id;
    final String name;
    final String email;
    final UserRole role;
    final String? phone;
    final String? avatar;
    final StudentProfile? studentProfile;
    final ParentProfile? parentProfile;
    final TeacherProfile? teacherProfile;
    
    factory User.fromJson(Map<String, dynamic> json);
    Map<String, dynamic> toJson();
  }
  ```

### 3.2 `lib/models/student.dart`
- **Purpose**: Student profile model (enrolled courses, class, section)
- **Layer**: Models
- **Dependencies**: `user.dart`
- **API Consumed**: Student profile endpoint
- **Model Used**: Extends User
- **Route**: None
- **Permission**: None
- **Consumers**: student screens, parent child detail
- **Tests Needed**: fromJson/toJson, enrollment calculations

### 3.3 `lib/models/course.dart`
- **Purpose**: Course model (title, description, instructor, lessons, progress)
- **Layer**: Models
- **Dependencies**: `lesson.dart`
- **API Consumed**: Course list/detail endpoints
- **Model Used**: Referenced by Enrollment
- **Route**: None
- **Permission**: None
- **Consumers**: course screens, dashboard
- **Tests Needed**: fromJson/toJson, progress calculation

### 3.4 `lib/models/lesson.dart`
- **Purpose**: Lesson model (title, content type, duration, order)
- **Layer**: Models
- **Dependencies**: None
- **API Consumed**: Lesson list endpoint
- **Model Used**: Child of Course
- **Route**: None
- **Permission**: None
- **Consumers**: lesson screen, course detail
- **Tests Needed**: fromJson/toJson, content type enum

### 3.5 `lib/models/enrollment.dart`
- **Purpose**: Student-course enrollment model (enrollment date, status, progress)
- **Layer**: Models
- **Dependencies**: `student.dart`, `course.dart`
- **API Consumed**: Enrollment endpoints
- **Model Used**: Junction model
- **Route**: None
- **Permission**: None
- **Consumers**: course screens, student dashboard
- **Tests Needed**: fromJson/toJson, status transitions

### 3.6 `lib/models/attendance.dart`
- **Purpose**: Attendance record model (date, status, subject, time)
- **Layer**: Models
- **Dependencies**: None
- **API Consumed**: Attendance endpoints
- **Model Used**: Referenced by attendance screens
- **Route**: None
- **Permission**: None
- **Consumers**: attendance screens, dashboard
- **Tests Needed**: fromJson/toJson, percentage calculation, status enum

### 3.7 `lib/models/assignment.dart`
- **Purpose**: Assignment model (title, due date, subject, status, submission)
- **Layer**: Models
- **Dependencies**: None
- **API Consumed**: Assignment endpoints
- **Model Used**: Referenced by assignment screens
- **Route**: None
- **Permission**: None
- **Consumers**: assignment screens
- **Tests Needed**: fromJson/toJson, due date formatting, status enum

### 3.8 `lib/models/exam.dart`
- **Purpose**: Exam model (name, date, subjects, total marks)
- **Layer**: Models
- **Dependencies**: `grade.dart`
- **API Consumed**: Exam endpoints
- **Model Used**: Referenced by exam screens
- **Route**: None
- **Permission**: None
- **Consumers**: exam screens, dashboard
- **Tests Needed**: fromJson/toJson, date validation

### 3.9 `lib/models/grade.dart`
- **Purpose**: Grade model (subject, marks, grade letter, total marks)
- **Layer**: Models
- **Dependencies**: None
- **API Consumed**: Grade endpoints
- **Model Used**: Child of Exam
- **Route**: None
- **Permission**: None
- **Consumers**: exam screens, gradebook
- **Tests Needed**: fromJson/toJson, grade letter calculation

### 3.10 `lib/models/notification.dart`
- **Purpose**: Notification model (title, body, type, read status, timestamp)
- **Layer**: Models
- **Dependencies**: None
- **API Consumed**: Notification endpoints
- **Model Used**: Referenced by notification screens
- **Route**: None
- **Permission**: None
- **Consumers**: notification screens, notification provider
- **Tests Needed**: fromJson/toJson, read/unread toggle

### 3.11 `lib/models/fee.dart`
- **Purpose**: Fee model (type, amount, due date, status, paid amount)
- **Layer**: Models
- **Dependencies**: None
- **API Consumed**: Finance endpoints
- **Model Used**: Referenced by parent fees screen
- **Route**: None
- **Permission**: None
- **Consumers**: parent fees screen, finance screens
- **Tests Needed**: fromJson/toJson, amount calculations

### 3.12 `lib/models/invoice.dart`
- **Purpose**: Invoice model (invoice number, items, total, status, date)
- **Layer**: Models
- **Dependencies**: `fee.dart`
- **API Consumed**: Finance endpoints
- **Model Used**: Referenced by finance screens
- **Route**: None
- **Permission**: None
- **Consumers**: finance screens, parent fees
- **Tests Needed**: fromJson/toJson, total calculation

### 3.13 `lib/models/payment.dart`
- **Purpose**: Payment model (amount, date, method, status, reference)
- **Layer**: Models
- **Dependencies**: None
- **API Consumed**: Finance endpoints
- **Model Used**: Referenced by finance screens
- **Route**: None
- **Permission**: None
- **Consumers**: finance screens, payment history
- **Tests Needed**: fromJson/toJson, status enum

### 3.14 `lib/models/certificate.dart`
- **Purpose**: Certificate model (title, issue date, type, download URL)
- **Layer**: Models
- **Dependencies**: None
- **API Consumed**: Certificate endpoints
- **Model Used**: Referenced by certificates screen
- **Route**: None
- **Permission**: None
- **Consumers**: certificates screen
- **Tests Needed**: fromJson/toJson, URL validation

### 3.15 `lib/models/competition.dart`
- **Purpose**: Competition model (title, description, dates, rules, participants)
- **Layer**: Models
- **Dependencies**: None
- **API Consumed**: Competition endpoints
- **Model Used**: Referenced by competition screens
- **Route**: None
- **Permission**: None
- **Consumers**: competition screens
- **Tests Needed**: fromJson/toJson, date range validation

### 3.16 `lib/models/ai_assistant.dart`
- **Purpose**: AI assistant configuration model (name, capabilities, limits)
- **Layer**: Models
- **Dependencies**: None
- **API Consumed**: AI config endpoint
- **Model Used**: Referenced by AI chat
- **Route**: None
- **Permission**: None
- **Consumers**: AI chat screen
- **Tests Needed**: fromJson/toJson

### 3.17 `lib/models/ai_conversation.dart`
- **Purpose**: AI conversation model (id, title, messages, created date)
- **Layer**: Models
- **Dependencies**: `ai_message.dart`
- **API Consumed**: AI conversation endpoints
- **Model Used**: Referenced by AI chat
- **Route**: None
- **Permission**: None
- **Consumers**: AI conversation list, chat screen
- **Tests Needed**: fromJson/toJson, message count

### 3.18 `lib/models/ai_message.dart`
- **Purpose**: AI message model (role, content, timestamp)
- **Layer**: Models
- **Dependencies**: None
- **API Consumed**: AI chat endpoint
- **Model Used**: Child of AiConversation
- **Route**: None
- **Permission**: None
- **Consumers**: AI chat screen
- **Tests Needed**: fromJson/toJson, role enum

### 3.19 `lib/models/library_resource.dart`
- **Purpose**: Library resource model (title, author, type, availability, cover)
- **Layer**: Models
- **Dependencies**: None
- **API Consumed**: Library endpoints
- **Model Used**: Referenced by library screens
- **Route**: None
- **Permission**: None
- **Consumers**: library screens
- **Tests Needed**: fromJson/toJson, availability status

### 3.20 `lib/models/parent_child.dart`
- **Purpose**: Parent-child relationship model (child info, class, progress summary)
- **Layer**: Models
- **Dependencies**: `student.dart`
- **API Consumed**: Parent endpoints
- **Model Used**: Referenced by parent screens
- **Route**: None
- **Permission**: None
- **Consumers**: parent screens
- **Tests Needed**: fromJson/toJson

---

## 4. State Management (5 files)

### 4.1 `lib/providers/auth_provider.dart`
- **Purpose**: Authentication state management (login, logout, token, user)
- **Layer**: Providers
- **Dependencies**: `auth_api.dart`, `shared_preferences`, `user.dart`
- **API Consumed**: Auth endpoints
- **Model Used**: `User`
- **Route**: Controls auth redirect
- **Permission**: Manages auth state
- **Consumers**: All screens, route guards, api_client
- **Tests Needed**: Login flow, logout, token persistence, session expiry

### 4.2 `lib/providers/user_provider.dart`
- **Purpose**: User profile state management (fetch, update, cache)
- **Layer**: Providers
- **Dependencies**: `api_client.dart`, `user.dart`
- **API Consumed**: User profile endpoint
- **Model Used**: `User`
- **Route**: None
- **Permission**: None
- **Consumers**: profile screens, drawer, user detail card
- **Tests Needed**: Profile fetch, update, cache invalidation

### 4.3 `lib/providers/course_provider.dart`
- **Purpose**: Course state management (list, detail, enrollment, progress)
- **Layer**: Providers
- **Dependencies**: `course_api.dart`, `course.dart`
- **API Consumed**: Course endpoints
- **Model Used**: `Course`, `Enrollment`
- **Route**: None
- **Permission**: student, teacher
- **Consumers**: course screens, dashboard
- **Tests Needed**: Course list, enrollment, progress tracking

### 4.4 `lib/providers/dashboard_provider.dart`
- **Purpose**: Dashboard state management (stats, recent activity, announcements)
- **Layer**: Providers
- **Dependencies**: `student_api.dart`, `teacher_api.dart`, `parent_api.dart`
- **API Consumed**: Dashboard endpoints
- **Model Used**: Various (role-dependent)
- **Route**: None
- **Permission**: All roles
- **Consumers**: All dashboard screens
- **Tests Needed**: Role-based data, refresh, caching

### 4.5 `lib/providers/notification_provider.dart`
- **Purpose**: Notification state management (list, unread count, mark read)
- **Layer**: Providers
- **Dependencies**: `notification_api.dart`, `notification.dart`
- **API Consumed**: Notification endpoints
- **Model Used**: `AppNotification`
- **Route**: None
- **Permission**: All authenticated users
- **Consumers**: notification screens, app bar badge
- **Tests Needed**: List fetch, unread count, mark read, real-time updates

---

## 5. Screens (34 files)

### 5.1 `lib/screens/splash_screen.dart`
- **Purpose**: Auth-aware splash screen with token check
- **Layer**: Screens
- **Dependencies**: `auth_provider.dart`, `shared_preferences`
- **API Consumed**: None (checks local token)
- **Model Used**: None
- **Route**: `/splash` (initial)
- **Permission**: None
- **Consumers**: `main.dart` (initial route)
- **Tests Needed**: Token present redirect, no token redirect, error handling

### 5.2 `lib/screens/login_screen.dart`
- **Purpose**: Laravel Sanctum login with email/password
- **Layer**: Screens
- **Dependencies**: `auth_provider.dart`, `auth_api.dart`
- **API Consumed**: `POST /api/login`
- **Model Used**: `User`
- **Route**: `/login`
- **Permission**: None (public)
- **Consumers**: splash redirect, auth guard
- **Tests Needed**: Login success, login failure, validation, loading states

### 5.3 `lib/screens/forgot_password_screen.dart`
- **Purpose**: Password reset request and confirmation
- **Layer**: Screens
- **Dependencies**: `auth_api.dart`
- **API Consumed**: `POST /api/forgot-password`
- **Model Used**: None
- **Route**: `/forgot-password`
- **Permission**: None (public)
- **Consumers**: login screen link
- **Tests Needed**: Email validation, success message, error handling

### 5.4-5.12 Student Screens (9 files)

| # | File | Purpose | Route | API | Model |
|---|------|---------|-------|-----|-------|
| 5.4 | `student/student_dashboard.dart` | Student main dashboard | `/student` | `GET /api/student/dashboard` | User, stats |
| 5.5 | `student/courses_screen.dart` | Enrolled courses list | `/student/courses` | `GET /api/student/courses` | Course |
| 5.6 | `student/course_detail_screen.dart` | Course detail + lessons | `/student/courses/:id` | `GET /api/student/courses/:id` | Course, Lesson |
| 5.7 | `student/lesson_screen.dart` | Lesson content viewer | `/student/lessons/:id` | `GET /api/student/lessons/:id` | Lesson |
| 5.8 | `student/attendance_screen.dart` | Student attendance view | `/student/attendance` | `GET /api/student/attendance` | Attendance |
| 5.9 | `student/assignments_screen.dart` | Student assignments list | `/student/assignments` | `GET /api/student/assignments` | Assignment |
| 5.10 | `student/exams_screen.dart` | Student exams list | `/student/exams` | `GET /api/student/exams` | Exam |
| 5.11 | `student/grades_screen.dart` | Student grades view | `/student/grades` | `GET /api/student/grades` | Grade |
| 5.12 | `student/timetable_screen.dart` | Student timetable | `/student/timetable` | `GET /api/student/timetable` | Schedule |

### 5.13-5.16 More Student Screens (4 files)

| # | File | Purpose | Route | API | Model |
|---|------|---------|-------|-----|-------|
| 5.13 | `student/certificates_screen.dart` | Student certificates | `/student/certificates` | `GET /api/student/certificates` | Certificate |
| 5.14 | `student/notifications_screen.dart` | Student notifications | `/student/notifications` | `GET /api/notifications` | Notification |
| 5.15 | `student/profile_screen.dart` | Student profile | `/student/profile` | `GET /api/user` | User, Student |
| 5.16 | `student/coding_lab_screen.dart` | Coding lab | `/student/coding` | `GET /api/coding/problems` | CodingProblem |

### 5.17-5.22 Parent Screens (6 files)

| # | File | Purpose | Route | API | Model |
|---|------|---------|-------|-----|-------|
| 5.17 | `parent/parent_dashboard.dart` | Parent main dashboard | `/parent` | `GET /api/parent/dashboard` | User, stats |
| 5.18 | `parent/children_screen.dart` | Children list | `/parent/children` | `GET /api/parent/children` | ParentChild |
| 5.19 | `parent/child_detail_screen.dart` | Child detail view | `/parent/children/:id` | `GET /api/parent/children/:id` | Student |
| 5.20 | `parent/fees_screen.dart` | Fees and payments | `/parent/fees` | `GET /api/parent/fees` | Fee, Invoice |
| 5.21 | `parent/attendance_screen.dart` | Child attendance | `/parent/attendance` | `GET /api/parent/attendance` | Attendance |
| 5.22 | `parent/progress_screen.dart` | Child academic progress | `/parent/progress` | `GET /api/parent/progress` | Grade, Attendance |

### 5.23-5.28 Teacher Screens (6 files)

| # | File | Purpose | Route | API | Model |
|---|------|---------|-------|-----|-------|
| 5.23 | `teacher/teacher_dashboard.dart` | Teacher main dashboard | `/teacher` | `GET /api/teacher/dashboard` | User, stats |
| 5.24 | `teacher/classes_screen.dart` | Teacher classes list | `/teacher/classes` | `GET /api/teacher/classes` | Course |
| 5.25 | `teacher/class_detail_screen.dart` | Class detail + students | `/teacher/classes/:id` | `GET /api/teacher/classes/:id` | Course, Student |
| 5.26 | `teacher/attendance_screen.dart` | Mark student attendance | `/teacher/attendance` | `POST /api/teacher/attendance` | Attendance |
| 5.27 | `teacher/assignments_screen.dart` | Manage assignments | `/teacher/assignments` | `GET /api/teacher/assignments` | Assignment |
| 5.28 | `teacher/exams_screen.dart` | Manage exams | `/teacher/exams` | `GET /api/teacher/exams` | Exam |

### 5.29-5.34 Shared/Admin Screens (6 files)

| # | File | Purpose | Route | API | Model |
|---|------|---------|-------|-----|-------|
| 5.29 | `teacher/gradebook_screen.dart` | Gradebook management | `/teacher/gradebook` | `GET /api/teacher/gradebook` | Grade |
| 5.30 | `admin/admin_dashboard.dart` | Admin main dashboard | `/admin` | `GET /api/admin/dashboard` | User, stats |
| 5.31 | `admin/students_screen.dart` | Student management | `/admin/students` | `GET /api/admin/students` | Student |
| 5.32 | `shared/notifications_screen.dart` | Shared notifications | `/notifications` | `GET /api/notifications` | Notification |
| 5.33 | `shared/profile_screen.dart` | Shared profile | `/profile` | `GET /api/user` | User |
| 5.34 | `shared/settings_screen.dart` | App settings | `/settings` | None | Preferences |

---

## 6. Widgets (13 files)

### 6.1 `lib/widgets/app_bar.dart`
- **Purpose**: Coder's Hero branded app bar with back, menu, notifications
- **Layer**: Widgets
- **Dependencies**: `notification_provider.dart`
- **API Consumed**: None
- **Model Used**: None
- **Route**: None
- **Permission**: None
- **Consumers**: All screens
- **Tests Needed**: Back button visibility, notification badge, menu toggle

### 6.2 `lib/widgets/bottom_nav.dart`
- **Purpose**: Role-based bottom navigation bar
- **Layer**: Widgets
- **Dependencies**: `go_router`, `auth_provider.dart`
- **API Consumed**: None
- **Model Used**: `User` (for role)
- **Route**: None
- **Permission**: None
- **Consumers**: All dashboard screens
- **Tests Needed**: Role-based items, navigation, badge counts

### 6.3 `lib/widgets/drawer.dart`
- **Purpose**: Role-based navigation drawer
- **Layer**: Widgets
- **Dependencies**: `go_router`, `auth_provider.dart`
- **API Consumed**: None
- **Model Used**: `User` (for role)
- **Route**: None
- **Permission**: None
- **Consumers**: All screens with drawer
- **Tests Needed**: Role-based items, logout, navigation

### 6.4 `lib/widgets/stat_card.dart`
- **Purpose**: Dashboard statistics card with icon, value, label
- **Layer**: Widgets
- **Dependencies**: None
- **API Consumed**: None
- **Model Used**: None
- **Route**: None
- **Permission**: None
- **Consumers**: All dashboard screens
- **Tests Needed**: Display, tap handler, color variants

### 6.5 `lib/widgets/loading_skeleton.dart`
- **Purpose**: Shimmer loading placeholder for content
- **Layer**: Widgets
- **Dependencies**: `shimmer`
- **API Consumed**: None
- **Model Used**: None
- **Route**: None
- **Permission**: None
- **Consumers**: All screens with loading states
- **Tests Needed**: Animation, different sizes

### 6.6 `lib/widgets/empty_state.dart`
- **Purpose**: Empty state widget with icon, message, action button
- **Layer**: Widgets
- **Dependencies**: None
- **API Consumed**: None
- **Model Used**: None
- **Route**: None
- **Permission**: None
- **Consumers**: All list screens
- **Tests Needed**: Display, action button tap

### 6.7 `lib/widgets/error_state.dart`
- **Purpose**: Error state widget with retry button
- **Layer**: Widgets
- **Dependencies**: None
- **API Consumed**: None
- **Model Used**: None
- **Route**: None
- **Permission**: None
- **Consumers**: All screens with API calls
- **Tests Needed**: Display, retry tap, error message

### 6.8 `lib/widgets/course_card.dart`
- **Purpose**: Course card with thumbnail, title, progress, instructor
- **Layer**: Widgets
- **Dependencies**: `cached_network_image`
- **API Consumed**: None
- **Model Used**: `Course`
- **Route**: None
- **Permission**: None
- **Consumers**: courses screen, dashboard
- **Tests Needed**: Display, progress bar, tap handler

### 6.9 `lib/widgets/assignment_card.dart`
- **Purpose**: Assignment card with subject, due date, status
- **Layer**: Widgets
- **Dependencies**: `intl` (for date formatting)
- **API Consumed**: None
- **Model Used**: `Assignment`
- **Route**: None
- **Permission**: None
- **Consumers**: assignments screen
- **Tests Needed**: Display, status colors, due date formatting

### 6.10 `lib/widgets/notification_tile.dart`
- **Purpose**: Notification list tile with icon, title, body, time
- **Layer**: Widgets
- **Dependencies**: `intl` (for time formatting)
- **API Consumed**: None
- **Model Used**: `AppNotification`
- **Route**: None
- **Permission**: None
- **Consumers**: notification screens
- **Tests Needed**: Display, read/unread styling, tap handler

### 6.11 `lib/widgets/avatar.dart`
- **Purpose**: User avatar with network image and fallback
- **Layer**: Widgets
- **Dependencies**: `cached_network_image`
- **API Consumed**: None
- **Model Used**: None (accepts URL and name)
- **Route**: None
- **Permission**: None
- **Consumers**: drawer, profile screens, user detail card
- **Tests Needed**: Network image, fallback initials, size variants

### 6.12 `lib/widgets/search_bar.dart`
- **Purpose**: Search bar with debounce and clear button
- **Layer**: Widgets
- **Dependencies**: None
- **API Consumed**: None
- **Model Used**: None
- **Route**: None
- **Permission**: None
- **Consumers**: courses screen, library screen, students screen
- **Tests Needed**: Input, debounce, clear, callback

### 6.13 `lib/widgets/filter_chips.dart`
- **Purpose**: Filter chip group for list filtering
- **Layer**: Widgets
- **Dependencies**: None
- **API Consumed**: None
- **Model Used**: None
- **Route**: None
- **Permission**: None
- **Consumers**: courses screen, attendance screen, exams screen
- **Tests Needed**: Selection, multi-select, callback

---

## 7. Implementation Priority

### P0 - Must Have (Foundation)
1. `config/app_config.dart`
2. `config/api_config.dart`
3. `config/theme.dart`
4. `config/routes.dart`
5. `services/api_client.dart`
6. `services/auth_api.dart`
7. `models/user.dart`
8. `providers/auth_provider.dart`
9. `screens/splash_screen.dart`
10. `screens/login_screen.dart`

### P1 - High Priority (Core Features)
11. All student screens (5.4-5.16)
12. All student models (3.2-3.9)
13. `services/student_api.dart`
14. `services/course_api.dart`
15. `providers/course_provider.dart`
16. `providers/dashboard_provider.dart`
17. All shared widgets (6.1-6.13)

### P2 - Medium Priority (Parent/Teacher)
18. All parent screens (5.17-5.22)
19. All teacher screens (5.23-5.29)
20. `services/parent_api.dart`
21. `services/teacher_api.dart`
22. Parent/teacher models

### P3 - Low Priority (Extras)
23. `services/ai_api.dart` + AI screens
24. `services/coding_api.dart` + coding lab
25. `services/library_api.dart` + library
26. `services/competition_api.dart` + competitions
27. Admin screens
28. `services/certificate_api.dart`
29. `services/finance_api.dart`
30. Remaining models
