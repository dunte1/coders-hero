# 15 — Testing Plan for Flutter Mobile

> Coder's Hero ERP & LMS — Mobile Integration Audit
> Last updated: 2026-08-18
> Comprehensive testing strategy across all layers

---

## 1. Testing Strategy Overview

### 1.1 Testing Pyramid

```
                    ┌─────────────┐
                    │ Integration │  5%
                    │    Tests    │
                    ├─────────────┤
                    │   Widget    │  15%
                    │    Tests    │
                    ├─────────────┤
                    │    Unit     │  80%
                    │    Tests    │
                    └─────────────┘
```

### 1.2 Testing Layers

| Layer | Coverage Target | Tools | Execution |
|-------|----------------|-------|-----------|
| Unit Tests | 80%+ | `flutter_test`, `mockito` | Every PR |
| Widget Tests | All screens | `flutter_test`, `mockito` | Every PR |
| Integration Tests | Critical flows | `integration_test` | Nightly |
| Role-Based Tests | All 4 roles | `flutter_test` | Every PR |
| Security Tests | All auth flows | `flutter_test` | Every PR |
| Performance Tests | Key metrics | `flutter_test` | Weekly |
| Offline Tests | Network handling | `flutter_test` | Weekly |

### 1.3 Test Execution Commands

```bash
# Run all unit tests
flutter test

# Run specific test file
flutter test test/unit/auth_service_test.dart

# Run tests with coverage
flutter test --coverage

# Generate coverage report
genhtml coverage/lcov.info -o coverage/html

# Run integration tests
flutter test integration_test/

# Run widget tests
flutter test test/widget/

# Run security tests
flutter test test/security/
```

---

## 2. Unit Tests

### 2.1 API Client Tests

**File:** `test/unit/api/api_client_test.dart`

```dart
// Test Cases:
// 1. API client initializes with correct base URL
// 2. API client sets correct headers
// 3. API client injects Bearer token
// 4. API client handles 401 response (triggers logout)
// 5. API client handles 403 response (shows access denied)
// 6. API client handles 500 response (shows server error)
// 7. API client handles timeout
// 8. API client handles network error
// 9. API client refreshes token on 401
// 10. API client logs requests in debug mode
```

### 2.2 Model Serialization Tests

**File:** `test/unit/models/`

```
test/unit/models/
├── user_model_test.dart
├── course_model_test.dart
├── enrollment_model_test.dart
├── lesson_model_test.dart
├── attendance_model_test.dart
├── assignment_model_test.dart
├── exam_model_test.dart
├── grade_model_test.dart
├── certificate_model_test.dart
├── notification_model_test.dart
├── child_model_test.dart
├── fee_model_test.dart
├── class_model_test.dart
├── gradebook_model_test.dart
├── competition_model_test.dart
├── team_model_test.dart
├── ai_assistant_model_test.dart
├── conversation_model_test.dart
└── message_model_test.dart
```

**Test Pattern:**
```dart
void main() {
  group('UserModel', () {
    test('should create UserModel from JSON', () {
      final json = {
        'id': 1,
        'name': 'John Doe',
        'email': 'john@example.com',
        'role': {'name': 'student'},
      };
      final user = UserModel.fromJson(json);
      expect(user.id, 1);
      expect(user.name, 'John Doe');
      expect(user.email, 'john@example.com');
      expect(user.role.name, 'student');
    });

    test('should serialize UserModel to JSON', () {
      final user = UserModel(id: 1, name: 'John Doe');
      final json = user.toJson();
      expect(json['id'], 1);
      expect(json['name'], 'John Doe');
    });

    test('should handle null fields gracefully', () {
      final json = <String, dynamic>{};
      final user = UserModel.fromJson(json);
      expect(user.id, null);
      expect(user.name, '');
    });
  });
}
```

### 2.3 Service Tests

**File:** `test/unit/services/`

```
test/unit/services/
├── auth_service_test.dart
├── student_service_test.dart
├── parent_service_test.dart
├── teacher_service_test.dart
├── admin_service_test.dart
├── course_service_test.dart
├── attendance_service_test.dart
├── assignment_service_test.dart
├── exam_service_test.dart
├── grade_service_test.dart
├── certificate_service_test.dart
├── notification_service_test.dart
├── chat_service_test.dart
├── ai_service_test.dart
├── coding_service_test.dart
└── competition_service_test.dart
```

**Test Pattern:**
```dart
void main() {
  group('AuthService', () {
    late AuthService authService;
    late MockApiClient mockApiClient;

    setUp(() {
      mockApiClient = MockApiClient();
      authService = AuthService(apiClient: mockApiClient);
    });

    test('login should return user on success', () async {
      when(mockApiClient.post('/login', data: anyNamed('data')))
          .thenAnswer((_) async => Response(
            data: {'token': 'abc123', 'user': {'id': 1}},
            statusCode: 200,
          ));

      final result = await authService.login('email', 'password');
      expect(result.token, 'abc123');
      expect(result.user.id, 1);
    });

    test('login should throw on invalid credentials', () async {
      when(mockApiClient.post('/login', data: anyNamed('data')))
          .thenThrow(ApiException(statusCode: 401));

      expect(
        () => authService.login('wrong', 'credentials'),
        throwsA(isA<ApiException>()),
      );
    });
  });
}
```

### 2.4 Provider/State Management Tests

**File:** `test/unit/providers/`

```
test/unit/providers/
├── auth_provider_test.dart
├── courses_provider_test.dart
├── attendance_provider_test.dart
├── assignments_provider_test.dart
├── grades_provider_test.dart
├── children_provider_test.dart
├── fees_provider_test.dart
├── classes_provider_test.dart
├── gradebook_provider_test.dart
├── notifications_provider_test.dart
├── chat_provider_test.dart
└── ai_provider_test.dart
```

**Test Pattern:**
```dart
void main() {
  group('AuthProvider', () {
    late AuthProvider authProvider;
    late MockAuthService mockAuthService;

    setUp(() {
      mockAuthService = MockAuthService();
      authProvider = AuthProvider(authService: mockAuthService);
    });

    test('initial state is unauthenticated', () {
      expect(authProvider.state.isAuthenticated, false);
    });

    test('login updates state to authenticated', () async {
      when(mockAuthService.login(any, any))
          .thenAnswer((_) async => AuthResult(token: 'abc', user: mockUser));

      await authProvider.login('email', 'password');
      expect(authProvider.state.isAuthenticated, true);
    });

    test('logout clears state', () async {
      await authProvider.logout();
      expect(authProvider.state.isAuthenticated, false);
    });
  });
}
```

### 2.5 Authentication Flow Tests

**File:** `test/unit/auth/auth_flow_test.dart`

```dart
// Test Cases:
// 1. Login flow: email/password → token → profile → dashboard
// 2. Auto-login flow: stored token → profile → dashboard
// 3. Logout flow: clear token → login screen
// 4. Token refresh flow: expired token → refresh → new token
// 5. Password reset flow: email → token → new password
// 6. Session expiry flow: expired session → login screen
// 7. Invalid token flow: invalid token → login screen
// 8. Network error during login: error message shown
```

### 2.6 Permission Checks Tests

**File:** `test/unit/auth/permission_test.dart`

```dart
// Test Cases:
// 1. Student can access student routes
// 2. Student cannot access admin routes
// 3. Parent can access parent routes
// 4. Parent cannot access teacher routes
// 5. Teacher can access teacher routes
// 6. Teacher cannot access student routes
// 7. Admin can access all routes
// 8. Director can access admin routes
// 9. Branch manager can access limited admin routes
// 10. School admin can access limited admin routes
```

---

## 3. Widget Tests

### 3.1 Login Screen Tests

**File:** `test/widget/login_screen_test.dart`

```dart
// Test Cases:
// 1. Login screen renders email field
// 2. Login screen renders password field
// 3. Login screen renders login button
// 4. Login screen renders forgot password link
// 5. Login screen validates empty email
// 6. Login screen validates invalid email format
// 7. Login screen validates empty password
// 8. Login screen shows loading state during login
// 9. Login screen shows error message on failure
// 10. Login screen navigates to dashboard on success
// 11. Login screen navigates to forgot password
// 12. Login screen handles network error
```

### 3.2 Dashboard Screen Tests

**File:** `test/widget/dashboard_screen_test.dart`

```dart
// Test Cases:
// 1. Student dashboard renders stats cards
// 2. Student dashboard renders course list
// 3. Student dashboard renders notifications
// 4. Parent dashboard renders children list
// 5. Parent dashboard renders summary
// 6. Teacher dashboard renders classes
// 7. Teacher dashboard renders assignments
// 8. Admin dashboard renders key metrics
// 9. Dashboard shows loading state
// 10. Dashboard shows error state
// 11. Dashboard shows empty state
// 12. Dashboard refreshes on pull-to-refresh
```

### 3.3 Navigation Tests

**File:** `test/widget/navigation_test.dart`

```dart
// Test Cases:
// 1. Student navigation shows correct items
// 2. Parent navigation shows correct items
// 3. Teacher navigation shows correct items
// 4. Admin navigation shows correct items
// 5. Navigation drawer opens/closes
// 6. Navigation item tap navigates to correct screen
// 7. Navigation highlights active item
// 8. Bottom navigation works on mobile
// 9. Navigation filters by role
// 10. Navigation handles deep linking
```

### 3.4 Form Validation Tests

**File:** `test/widget/form_validation_test.dart`

```dart
// Test Cases:
// 1. Login form validates email format
// 2. Login form validates password length
// 3. Registration form validates all fields
// 4. Assignment submission validates file type
// 5. Assignment submission validates file size
// 6. Profile update validates required fields
// 7. Fee payment validates amount
// 8. Attendance marking validates date
// 9. Exam creation validates date range
// 10. Lesson note creation validates content
```

### 3.5 Loading State Tests

**File:** `test/widget/loading_state_test.dart`

```dart
// Test Cases:
// 1. Loading indicator shows during API call
// 2. Loading indicator hides after API call
// 3. Shimmer loading shows for list screens
// 4. Skeleton loader shows for detail screens
// 5. Loading state persists during navigation
// 6. Loading state handles timeout
// 7. Loading state handles network error
```

### 3.6 Error State Tests

**File:** `test/widget/error_state_test.dart`

```dart
// Test Cases:
// 1. Error message shows on API failure
// 2. Retry button works on error
// 3. Error state shows correct icon
// 4. Error state shows correct message
// 5. Error state handles 401 (unauthorized)
// 6. Error state handles 403 (forbidden)
// 7. Error state handles 404 (not found)
// 8. Error state handles 500 (server error)
// 9. Error state handles network error
// 10. Error state handles timeout
```

### 3.7 Empty State Tests

**File:** `test/widget/empty_state_test.dart`

```dart
// Test Cases:
// 1. Empty state shows when no courses
// 2. Empty state shows when no assignments
// 3. Empty state shows when no notifications
// 4. Empty state shows when no children (parent)
// 5. Empty state shows when no classes (teacher)
// 6. Empty state shows correct icon
// 7. Empty state shows correct message
// 8. Empty state shows action button
// 9. Empty state action button navigates correctly
```

---

## 4. Integration Tests

### 4.1 Login → Dashboard Flow

**File:** `test/integration/login_flow_test.dart`

```dart
// Flow:
// 1. App launches → Splash screen
// 2. Splash screen → Login screen (no token)
// 3. Login screen → Enter credentials
// 4. Login screen → Tap login button
// 5. Login screen → Loading state
// 6. Login screen → Dashboard screen (token stored)
// 7. Dashboard screen → Verify user data loaded
// 8. Dashboard screen → Verify role-based navigation
```

### 4.2 Course Enrollment Flow

**File:** `test/integration/course_flow_test.dart`

```dart
// Flow:
// 1. Student dashboard → Tap "My Courses"
// 2. My Courses screen → Course list loads
// 3. My Courses screen → Tap course
// 4. Course detail screen → Course info loads
// 5. Course detail screen → Lesson list loads
// 6. Course detail screen → Tap lesson
// 7. Lesson viewer → Content renders
// 8. Lesson viewer → Mark as complete
// 9. Lesson viewer → Progress updates
// 10. Course detail screen → Progress bar updates
```

### 4.3 Attendance Marking Flow

**File:** `test/integration/attendance_flow_test.dart`

```dart
// Flow:
// 1. Teacher dashboard → Tap "Classes"
// 2. Classes screen → Class list loads
// 3. Classes screen → Tap class
// 4. Class detail screen → Roster loads
// 5. Class detail screen → Tap "Mark Attendance"
// 6. Mark attendance screen → Student list loads
// 7. Mark attendance screen → Toggle attendance status
// 8. Mark attendance screen → Tap "Save"
// 9. Mark attendance screen → Confirmation shown
// 10. Class detail screen → Attendance summary updates
```

### 4.4 Assignment Submission Flow

**File:** `test/integration/assignment_flow_test.dart`

```dart
// Flow:
// 1. Student dashboard → Tap "Assignments"
// 2. Assignments screen → Assignment list loads
// 3. Assignments screen → Tap assignment
// 4. Assignment detail → Assignment info loads
// 5. Assignment detail → Tap "Submit"
// 6. Submission screen → Select file
// 7. Submission screen → Add notes (optional)
// 8. Submission screen → Tap "Submit"
// 9. Submission screen → Loading state
// 10. Submission screen → Success message
// 11. Assignment detail → Status updates to "Submitted"
```

### 4.5 Notification Flow

**File:** `test/integration/notification_flow_test.dart`

```dart
// Flow:
// 1. App receives push notification
// 2. Notification banner shows
// 3. User taps notification
// 4. App opens to relevant screen
// 5. Notification marked as read
// 6. Notification list updates
// 7. Unread count updates in navigation
```

### 4.6 Profile Update Flow

**File:** `test/integration/profile_flow_test.dart`

```dart
// Flow:
// 1. User → Tap "Profile"
// 2. Profile screen → User data loads
// 3. Profile screen → Tap "Edit"
// 4. Edit profile → Form prefilled
// 5. Edit profile → Update fields
// 6. Edit profile → Tap "Save"
// 7. Edit profile → Loading state
// 8. Edit profile → Success message
// 9. Profile screen → Updated data shown
```

---

## 5. Role-Based Tests

### 5.1 Student Role Tests

**File:** `test/security/student_role_test.dart`

```dart
// Test Cases:
// 1. Login with student credentials succeeds
// 2. Student dashboard loads with student data
// 3. Student can access: My Courses, Attendance, Assignments, Exams, Grades, Certificates
// 4. Student CANNOT access: Admin dashboard, Student list, Finance, HR, Inventory
// 5. Student can view own data only
// 6. Student can submit assignments
// 7. Student can take quizzes
// 8. Student can use AI tutor
// 9. Student can use coding playground
// 10. Student can participate in competitions
// 11. Student API calls succeed for permitted endpoints
// 12. Student API calls fail for forbidden endpoints (403)
```

### 5.2 Parent Role Tests

**File:** `test/security/parent_role_test.dart`

```dart
// Test Cases:
// 1. Login with parent credentials succeeds
// 2. Parent dashboard loads with children summary
// 3. Parent can access: Children, Attendance, Progress, Report Cards, Fees
// 4. Parent CANNOT access: Student management, Finance (admin), HR, Coding playground
// 5. Parent can view own children only
// 6. Parent CANNOT view other parent's children
// 7. Parent can view child attendance
// 8. Parent can view child progress
// 9. Parent can view child report cards
// 10. Parent can view fees
// 11. Parent API calls succeed for permitted endpoints
// 12. Parent API calls fail for forbidden endpoints (403)
// 13. CRITICAL: Parent cannot manipulate child ID to access other children's data
```

### 5.3 Teacher Role Tests

**File:** `test/security/teacher_role_test.dart`

```dart
// Test Cases:
// 1. Login with teacher credentials succeeds
// 2. Teacher dashboard loads with class summary
// 3. Teacher can access: Classes, Assignments, Exams, Gradebook, Lesson Notes
// 4. Teacher CANNOT access: Student management, Finance, HR, Coding playground
// 5. Teacher can view own classes only
// 6. Teacher can mark attendance
// 7. Teacher can create/edit assignments
// 8. Teacher can create/edit exams
// 9. Teacher can grade submissions
// 10. Teacher can manage lesson notes
// 11. Teacher API calls succeed for permitted endpoints
// 12. Teacher API calls fail for forbidden endpoints (403)
```

### 5.4 Admin Role Tests

**File:** `test/security/admin_role_test.dart`

```dart
// Test Cases:
// 1. Login with admin credentials succeeds
// 2. Admin dashboard loads with key metrics
// 3. Admin can access: Students, Teachers, Finance (summary), Analytics, Administration
// 4. Admin CANNOT access: Parent portal, Student assignments, Coding playground
// 5. Admin can view all data
// 6. Admin can manage users
// 7. Admin can manage roles
// 8. Admin can view activity logs
// 9. Admin can view analytics
// 10. Admin API calls succeed for permitted endpoints
// 11. Admin API calls fail for forbidden endpoints (403)
// 12. Director, Branch Manager, School Admin have appropriate access
```

### 5.5 Cross-Role Tests

**File:** `test/security/cross_role_test.dart`

```dart
// Test Cases:
// 1. User with multiple roles sees combined navigation
// 2. Role change after login updates navigation
// 3. Token refresh preserves role
// 4. Logout clears all role data
// 5. Session expiry affects all role checks
```

---

## 6. Security Tests

### 6.1 Token Storage Security

**File:** `test/security/token_storage_test.dart`

```dart
// Test Cases:
// 1. Token stored in flutter_secure_storage
// 2. Token not stored in SharedPreferences
// 3. Token not logged in debug mode
// 4. Token cleared on logout
// 5. Token cleared on session expiry
// 6. Token encrypted at rest
// 7. Token not accessible to other apps
```

### 6.2 Session Management

**File:** `test/security/session_test.dart`

```dart
// Test Cases:
// 1. Session expires after 24 hours
// 2. Session refreshes on activity
// 3. Session invalidates on logout
// 4. Session invalidates on password change
// 5. Multiple sessions handled correctly
// 6. Session token unique per device
```

### 6.3 API Authentication

**File:** `test/security/api_auth_test.dart`

```dart
// Test Cases:
// 1. API calls without token return 401
// 2. API calls with invalid token return 401
// 3. API calls with expired token return 401
// 4. API calls with valid token succeed
// 5. API calls include correct Bearer header
// 6. API calls use HTTPS
```

### 6.4 Role Enforcement

**File:** `test/security/role_enforcement_test.dart`

```dart
// Test Cases:
// 1. Student cannot access admin endpoints
// 2. Parent cannot access teacher endpoints
// 3. Teacher cannot access student endpoints
// 4. Admin can access all endpoints
// 5. Role check happens server-side
// 6. Role check happens client-side (UI filtering)
```

### 6.5 Parent-Child Authorization

**File:** `test/security/parent_child_test.dart`

```dart
// Test Cases:
// 1. Parent can view own children
// 2. Parent CANNOT view other parent's children
// 3. Parent cannot manipulate child ID
// 4. Parent cannot access child data via direct URL
// 5. Parent cannot cache other parent's children data
// 6. Backend enforces parent_id filtering
```

### 6.6 Input Validation

**File:** `test/security/input_validation_test.dart`

```dart
// Test Cases:
// 1. SQL injection prevented in search
// 2. XSS prevented in text fields
// 3. File upload validates type
// 4. File upload validates size
// 5. Form inputs sanitized
// 6. API inputs validated
```

---

## 7. Performance Tests

### 7.1 App Startup Time

**File:** `test/performance/startup_test.dart`

```dart
// Test Cases:
// 1. Cold start < 2 seconds
// 2. Warm start < 1 second
// 3. Hot reload < 500ms
// 4. Splash screen displays immediately
// 5. Login screen loads quickly
// 6. Dashboard loads quickly after login
```

### 7.2 Screen Transition Time

**File:** `test/performance/navigation_test.dart`

```dart
// Test Cases:
// 1. Screen transition < 300ms
// 2. Tab switching < 200ms
// 3. Drawer open/close < 250ms
// 4. Modal open/close < 200ms
// 5. Back navigation < 200ms
```

### 7.3 API Response Handling

**File:** `test/performance/api_test.dart`

```dart
// Test Cases:
// 1. API response parsed < 100ms
// 2. List rendering < 200ms for 50 items
// 3. Image loading < 500ms
// 4. Search results < 300ms
// 5. Form submission < 500ms
```

### 7.4 Memory Usage

**File:** `test/performance/memory_test.dart`

```dart
// Test Cases:
// 1. Memory usage < 150MB
// 2. No memory leaks on navigation
// 3. No memory leaks on API calls
// 4. Image caching efficient
// 5. List scrolling smooth
```

### 7.5 Image Loading

**File:** `test/performance/image_test.dart`

```dart
// Test Cases:
// 1. Images cached after first load
// 2. Placeholder shown during load
// 3. Error image shown on failure
// 4. Images optimized for mobile
// 5. Thumbnail generation works
```

---

## 8. Offline Tests

### 8.1 Network Loss Handling

**File:** `test/offline/network_test.dart`

```dart
// Test Cases:
// 1. Offline indicator shows when network lost
// 2. Offline indicator hides when network restored
// 3. Cached data displays when offline
// 4. Error message shown for non-cached data
// 5. Retry button works when back online
```

### 8.2 Cached Data Display

**File:** `test/offline/cache_test.dart`

```dart
// Test Cases:
// 1. Dashboard data cached
// 2. Course list cached
// 3. Attendance data cached
// 4. Assignment list cached
// 5. Notification list cached
// 6. Profile data cached
```

### 8.3 Retry Logic

**File:** `test/offline/retry_test.dart`

```dart
// Test Cases:
// 1. Failed request retried automatically
// 2. Retry count limited to 3
// 3. Retry delay increases exponentially
// 4. Retry cancelled on success
// 5. Retry queue managed correctly
```

### 8.4 Queue Management

**File:** `test/offline/queue_test.dart`

```dart
// Test Cases:
// 1. Failed requests queued
// 2. Queue processed when back online
// 3. Queue order preserved
// 4. Queue cleared on logout
// 5. Queue limited in size
```

---

## 9. Test Scenarios by Role

### 9.1 Student Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Login as student | Enter credentials → Tap login | Dashboard loads with student data |
| View courses | Tap "My Courses" | Course list loads from API |
| View course detail | Tap course | Course detail with lessons loads |
| Take lesson | Tap lesson → View content | Lesson content renders |
| Mark attendance | Tap "Attendance" | Attendance data loads |
| View assignments | Tap "Assignments" | Assignment list loads |
| Submit assignment | Tap assignment → Submit → Select file | Submission succeeds |
| View grades | Tap "Grades" | Grade data loads |
| View certificates | Tap "Certificates" | Certificate list loads |
| Use AI tutor | Tap "AI Tutor" → Start conversation | AI responds |
| Use coding playground | Tap "Playground" → Write code → Run | Code executes |
| View leaderboard | Tap "Leaderboard" | Leaderboard loads |
| View notifications | Tap "Notifications" | Notification list loads |
| Update profile | Tap "Profile" → Edit → Save | Profile updates |

### 9.2 Parent Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Login as parent | Enter credentials → Tap login | Dashboard loads with children summary |
| View children | Tap "Children" | Children list loads |
| View child detail | Tap child | Child detail loads |
| View child attendance | Tap "Attendance" | Attendance data loads for child |
| View child progress | Tap "Progress" | Progress data loads for child |
| View report cards | Tap "Report Cards" | Report card list loads |
| View fees | Tap "Fees" | Fee data loads |
| Make payment | Tap fee → Pay → Confirm | Payment processes |
| View notifications | Tap "Notifications" | Notification list loads |
| Send message | Tap "Messages" → New message | Message sends |

### 9.3 Teacher Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Login as teacher | Enter credentials → Tap login | Dashboard loads with class summary |
| View classes | Tap "Classes" | Class list loads |
| View class detail | Tap class | Class detail with roster loads |
| Mark attendance | Tap class → Mark Attendance → Toggle → Save | Attendance saved |
| Create assignment | Tap "Assignments" → Create → Fill form → Save | Assignment created |
| View submissions | Tap assignment → Submissions | Submission list loads |
| Grade submission | Tap submission → Grade → Save | Grade saved |
| Create exam | Tap "Exams" → Create → Fill form → Save | Exam created |
| View gradebook | Tap "Gradebook" | Gradebook loads |
| Add lesson note | Tap "Lesson Notes" → Create → Fill form → Save | Lesson note created |
| View calendar | Tap "Calendar" | Calendar loads |
| View notifications | Tap "Notifications" | Notification list loads |

### 9.4 Admin Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Login as admin | Enter credentials → Tap login | Dashboard loads with key metrics |
| View students | Tap "Students" | Student list loads |
| Search students | Enter search query | Filtered results shown |
| View student detail | Tap student | Student detail loads |
| View teachers | Tap "Teachers" | Teacher overview loads |
| View finance summary | Tap "Finance" | Finance summary loads |
| View analytics | Tap "Analytics" | Analytics data loads |
| View activity logs | Tap "Activity Logs" | Log list loads |
| View notifications | Tap "Notifications" | Notification list loads |
| Update profile | Tap "Profile" → Edit → Save | Profile updates |

---

## 10. Test Data Management

### 10.1 Test User Credentials

```dart
// Test users for each role:
const testUsers = {
  'student': {
    'email': 'student@test.com',
    'password': 'password123',
    'role': 'student',
  },
  'parent': {
    'email': 'parent@test.com',
    'password': 'password123',
    'role': 'parent',
  },
  'teacher': {
    'email': 'teacher@test.com',
    'password': 'password123',
    'role': 'teacher',
  },
  'admin': {
    'email': 'admin@test.com',
    'password': 'password123',
    'role': 'admin',
  },
};
```

### 10.2 Mock API Responses

```dart
// Mock responses for each endpoint:
const mockResponses = {
  'login': {
    'token': 'test-token-123',
    'user': {
      'id': 1,
      'name': 'Test User',
      'email': 'test@test.com',
      'role': {'name': 'student'},
    },
  },
  'courses': [
    {'id': 1, 'title': 'Test Course', 'progress': 50},
  ],
  'attendance': [
    {'date': '2026-08-18', 'status': 'present'},
  ],
  // ... more mock data
};
```

---

## 11. Test Coverage Requirements

| Component | Minimum Coverage |
|-----------|-----------------|
| API Client | 90% |
| Models | 95% |
| Services | 85% |
| Providers | 85% |
| Screens | 80% |
| Widgets | 80% |
| Utils | 90% |
| **Overall** | **80%** |

---

## 12. Test Execution Schedule

| Test Type | Frequency | Trigger |
|-----------|-----------|---------|
| Unit Tests | Every PR | PR merge |
| Widget Tests | Every PR | PR merge |
| Integration Tests | Nightly | Cron job |
| Role-Based Tests | Every PR | PR merge |
| Security Tests | Every PR | PR merge |
| Performance Tests | Weekly | Cron job |
| Offline Tests | Weekly | Cron job |
| Full Suite | Before release | Manual |

---

## 13. Test Reporting

### 13.1 Coverage Reports

```bash
# Generate coverage report
flutter test --coverage
genhtml coverage/lcov.info -o coverage/html

# View coverage report
open coverage/html/index.html
```

### 13.2 Test Results

```
Test Results Summary:
├── Unit Tests:      150/150 passed (100%)
├── Widget Tests:     45/45 passed (100%)
├── Integration Tests: 10/10 passed (100%)
├── Security Tests:    20/20 passed (100%)
├── Performance Tests: 15/15 passed (100%)
└── Offline Tests:     10/10 passed (100%)

Coverage: 82%
```

---

## 14. Test Maintenance

### 14.1 Test Code Standards

- Follow Arrange-Act-Assert pattern
- Use descriptive test names
- Mock external dependencies
- Clean up after tests
- Use test fixtures for common data

### 14.2 Test Review Process

- All test code reviewed with production code
- Test coverage checked in CI
- Flaky tests identified and fixed
- Test performance monitored

---

*End of Testing Plan.*
