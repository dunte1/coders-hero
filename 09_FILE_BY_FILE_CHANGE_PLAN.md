# File-by-File Change Plan

> Coder's Hero Flutter Mobile App - Complete Transformation Plan
> Generated from verified codebase audit

---

## 1. Files to REMOVE (8 files)

| # | File | Lines | Reason |
|---|------|-------|--------|
| 1 | `lib/Screens/ForgetPassword.dart` | 451 | Stub with empty try/catch (line 191-194), no API call, will be replaced by `forgot_password_screen.dart` |
| 2 | `lib/Screens/RequestLogin.dart` | 616 | "Request Login ID" flow not part of Coder's Hero - users are created in Laravel admin |
| 3 | `lib/Screens/RequestProcessing.dart` | 49 | Static confirmation page for removed RequestLogin flow |
| 4 | `lib/Screens/Leave_Apply/LeaveApply.dart` | 1089 | HR/Leave module not in mobile scope - admin manages leaves |
| 5 | `lib/Widgets/NavigationDrawer.dart` | 21 | Redundant wrapper around MainDrawer, never imported by any screen |
| 6 | `lib/Widgets/LeaveApply/LeaveHistoryCard.dart` | 85 | Only used by LeaveApply.dart which is being removed |
| 7 | `lib/services/Auth_services.dart` | 56 | Firebase Auth + Google Sign-In, replaced entirely by Laravel Sanctum |
| 8 | `test/widget_test.dart` | 30 | Default Flutter template test, tests counter app, broken |

### Files with Large Commented-Out Blocks to Clean

| File | Commented Lines | Content |
|------|----------------|---------|
| `LoginPage.dart` | 345-716 (372 lines) | Duplicate of active code with older Firebase syntax |
| `ForgetPassword.dart` | 231-451 (221 lines) | Duplicate of active code with older validation syntax |
| `RequestLogin.dart` | 308-616 (309 lines) | Duplicate of active code |
| `LeaveApply.dart` | 564-1089 (526 lines) | Original code before dropdown_search upgrade |
| `Exam_Rseult.dart` | 317-705 (389 lines) | Duplicate with Randomizer package and DropdownSearch v1 API |
| `SubjectCard.dart` | 143-268 (126 lines) | Duplicate using older `randomizer` package |

---

## 2. Files to REBUILD (15 files - complete rewrite)

### 2.1 `lib/main.dart`
- **Current**: 38 lines. Initializes Firebase, creates `MaterialApp` with `SplashScreen`, imports `firebase_options.dart`
- **Action**: Complete rewrite
- **Exact Changes**:
  - Remove: `firebase_auth`, `firebase_core`, `google_sign_in` imports
  - Remove: `firebase_options.dart` import
  - Remove: `Firebase.initializeApp()` call
  - Remove: `LeaveApply` import
  - Add: `flutter_riverpod` ProviderScope wrapper
  - Add: GoRouter configuration
  - Add: Sanctum token check on startup
  - Add: Proper `MaterialApp.router` with GoRouter
  - Add: Coder's Hero branding (title, theme)
  - Rename package from `school_management` to `coders_hero`
- **New Dependencies**: `flutter_riverpod`, `go_router`, `shared_preferences`
- **API Consumed**: `GET /api/user` (on startup to check token)

### 2.2 `lib/Screens/SplashScreen.dart`
- **Current**: 53 lines. Shows Flare animation for 8 seconds, navigates to LoginPage
- **Action**: Complete rewrite
- **Exact Changes**:
  - Remove: `firebase_core` import and `Firebase.initializeApp()`
  - Remove: `flare_flutter` FlareActor animation
  - Add: Token check via `SharedPreferences`
  - Add: Navigate to home if token exists, login if not
  - Add: Coder's Hero logo/branding
  - Add: Proper 2-3 second splash with fade animation
  - Change: Navigation to use GoRouter instead of MaterialPageRoute
- **New Dependencies**: `shared_preferences`, `flutter_svg`
- **API Consumed**: None (checks local token only)

### 2.3 `lib/Screens/LoginPage.dart`
- **Current**: 716 lines (342 active + 374 commented). Firebase Auth login with email/password, navigates directly to Home without actual auth
- **Action**: Complete rewrite
- **Exact Changes**:
  - Remove: All Firebase imports and `Firebase.initializeApp()`
  - Remove: `fzregex` import (use Flutter form validators)
  - Remove: `ForgetPassword`, `RequestLogin` imports
  - Remove: All commented-out code (lines 345-716)
  - Remove: Direct navigation to Home (currently no real auth)
  - Add: Laravel Sanctum `POST /api/login` call via Dio
  - Add: Store token in SharedPreferences
  - Add: Store user data in UserProvider
  - Add: Navigate to role-based dashboard via GoRouter
  - Add: Proper error handling and loading state
  - Add: Forgot password link navigation
- **New Dependencies**: `dio`, `shared_preferences`, `flutter_riverpod`
- **API Consumed**: `POST /api/login` (email, password)
- **Model Used**: `User` (full model with role)

### 2.4 `lib/Screens/home.dart`
- **Current**: 253 lines. Static dashboard with hardcoded cards (Attendance, Profile, Exam, TimeTable, Library, Track Bus, Activity, Apply Leave)
- **Action**: Complete rewrite
- **Exact Changes**:
  - Remove: `firebase_core` import
  - Remove: `LeaveApply` import and card
  - Remove: All hardcoded dashboard cards
  - Remove: Complex animation system (3s duration excessive)
  - Add: Role-based dynamic dashboard (student/parent/teacher/admin)
  - Add: Fetch dashboard data from API
  - Add: `UserDetailCard` with real user data from provider
  - Add: Dynamic grid based on user role permissions
  - Add: Pull-to-refresh
  - Add: Bottom navigation bar
  - Rename to `StudentDashboard`, `ParentDashboard`, `TeacherDashboard` as separate screens
- **New Dependencies**: `flutter_riverpod`
- **API Consumed**: `GET /api/dashboard`
- **Model Used**: `User`, dashboard stats

### 2.5 `lib/Screens/Attendance/Attendance.dart`
- **Current**: 82 lines. Tab view with Today and Overall tabs, hardcoded UserDetailCard
- **Action**: Complete rewrite
- **Exact Changes**:
  - Remove: Hardcoded `UserDetailCard()`
  - Add: Fetch attendance data from API
  - Add: Loading states
  - Add: Error handling
  - Add: Date range picker for filtering
  - Change: Use role-based drawer
- **New Dependencies**: `flutter_riverpod`
- **API Consumed**: `GET /api/student/attendance`
- **Model Used**: `Attendance`

### 2.6 `lib/Screens/Attendance/TodayAttendance.dart`
- **Current**: 32 lines. Two hardcoded AttendanceCards
- **Action**: Complete rewrite
- **Exact Changes**:
  - Remove: All hardcoded AttendanceCard data
  - Add: Fetch today's attendance from API
  - Add: Empty state when no attendance records
  - Add: Loading skeleton
  - Add: Pull-to-refresh
- **API Consumed**: `GET /api/student/attendance/today`
- **Model Used**: `Attendance`

### 2.7 `lib/Screens/Attendance/OverallAttendance.dart`
- **Current**: 83 lines. Eleven hardcoded OverallAttendanceCards
- **Action**: Complete rewrite
- **Exact Changes**:
  - Remove: All 11 hardcoded OverallAttendanceCard instances
  - Add: Fetch attendance history from API
  - Add: Monthly/weekly view toggle
  - Add: Attendance summary statistics
  - Add: Date range filtering
  - Add: Empty state and loading skeleton
- **API Consumed**: `GET /api/student/attendance/overall`
- **Model Used**: `Attendance`

### 2.8 `lib/Screens/Exam/Exam_Rseult.dart`
- **Current**: 705 lines (312 active + 389 commented). Hardcoded exam data, typo in filename
- **Action**: Complete rewrite + rename file to `ExamResult.dart`
- **Exact Changes**:
  - Rename file from `Exam_Rseult.dart` to `exam_result_screen.dart` (fix typo, follow convention)
  - Remove: All commented-out code (lines 317-705)
  - Remove: Hardcoded SubjectCard data
  - Remove: `dropdown_search` exam type selector (hardcoded options)
  - Add: Fetch exams from API
  - Add: Exam type dropdown populated from API
  - Add: Loading states and error handling
  - Add: Pull-to-refresh
- **New Dependencies**: `flutter_riverpod`
- **API Consumed**: `GET /api/student/exams`
- **Model Used**: `Exam`, `Grade`

### 2.9 `lib/services/UserModel.dart`
- **Current**: 15 lines (6 active + 9 commented). Only has `uid` field
- **Action**: Complete rewrite
- **Exact Changes**:
  - Remove: All commented-out code
  - Remove: Simple `uid`-only model
  - Add: Full user model with: id, name, email, role, phone, avatar, student/parent/teacher info
  - Add: `fromJson` factory constructor
  - Add: `toJson` method
  - Add: Role enum (student, parent, teacher, admin)
  - Move to `lib/models/user.dart`
- **New Dependencies**: `json_annotation` (optional)
- **API Consumed**: Response from `POST /api/login`, `GET /api/user`

### 2.10 `lib/Widgets/MainDrawer.dart`
- **Current**: 80 lines. Hardcoded navigation tiles for all features including LeaveApply
- **Action**: Complete rewrite
- **Exact Changes**:
  - Remove: `LeaveApply` import and navigation
  - Remove: Hardcoded tile list
  - Add: Role-based dynamic navigation items
  - Add: User profile section at top
  - Add: Logout button
  - Add: Settings navigation
  - Change: Use GoRouter for navigation
  - Change: Remove asset-based icons, use Material Icons
- **New Dependencies**: `flutter_riverpod`
- **Model Used**: `User` (for role-based menu)

### 2.11 `lib/Widgets/UserDetailCard.dart`
- **Current**: 154 lines. Hardcoded user data (BCM2005, M.Irtaza, Standard 12, Section B)
- **Action**: Complete rewrite
- **Exact Changes**:
  - Remove: All hardcoded text (BCM2005, M.Irtaza, Standard: 12, Section: B)
  - Remove: `AssetImage("assets/home.png")` for avatar
  - Add: Dynamic user data from UserProvider
  - Add: Network image for avatar (with fallback)
  - Add: Role-based info display
  - Add: Proper loading state
- **New Dependencies**: `cached_network_image`
- **Model Used**: `User`, `Student`
- **API Consumed**: User data from provider

### 2.12 `lib/Widgets/DashboardCards.dart`
- **Current**: 52 lines. Generic card with name and image asset
- **Action**: Complete rewrite
- **Exact Changes**:
  - Remove: `AssetImage("assets/${imgpath}")` pattern
  - Add: Material Icons or SVG icons
  - Add: Tap handler parameter
  - Add: Badge support (for notifications)
  - Add: Proper theming with Coder's Hero colors
  - Change: Make it more flexible with optional parameters
- **New Dependencies**: None
- **Model Used**: Dashboard item model

### 2.13 `lib/Widgets/Attendance/AttendanceCard.dart`
- **Current**: 170 lines. Hardcoded attendance data, complex animation
- **Action**: Complete rewrite
- **Exact Changes**:
  - Remove: 3-second animation controller (excessive)
  - Remove: Complex `AnimatedBuilder` wrapper
  - Simplify: Use `AnimatedContainer` or simple fade
  - Add: Proper time formatting
  - Add: Status indicator (present/absent/late)
  - Add: Subject color coding
- **New Dependencies**: `intl` (for time formatting)
- **Model Used**: `Attendance`

### 2.14 `lib/Widgets/Attendance/OverAllAttendanceCard.dart`
- **Current**: 185 lines. Hardcoded attendance data with complex animation
- **Action**: Complete rewrite
- **Exact Changes**:
  - Remove: 3-second animation controller
  - Remove: Complex `AnimatedBuilder` wrapper
  - Simplify: Use simpler animation or none
  - Add: Dynamic data from props
  - Add: Percentage display
  - Add: Color coding based on attendance percentage
- **New Dependencies**: None
- **Model Used**: `Attendance`

### 2.15 `lib/Widgets/Exams/SubjectCard.dart`
- **Current**: 268 lines (141 active + 127 commented). Uses `flutter_randomcolor` for random color
- **Action**: Complete rewrite
- **Exact Changes**:
  - Remove: All commented-out code (lines 143-268)
  - Remove: `flutter_randomcolor` import and usage
  - Remove: Random color generation (inconsistent UX)
  - Add: Subject-based color coding (deterministic)
  - Add: Dynamic data from API
  - Add: Grade color coding
  - Add: Proper status indicators
- **New Dependencies**: None
- **Model Used**: `Exam`, `Grade`

---

## 3. Files to KEEP with Minor Modifications (4 files)

### 3.1 `lib/Widgets/AppBar.dart`
- **Current**: 57 lines. `CommonAppBar` with menu toggle, notification icon
- **Action**: Minor modifications
- **Exact Changes**:
  - Change: Primary color from `Colors.black` to Coder's Hero brand color
  - Change: Background from `Colors.transparent` to themed background
  - Add: Back button support (for non-root screens)
  - Add: Optional subtitle parameter
  - Keep: `menuenabled`, `notificationenabled`, `ontap`, `title` parameters
- **New Dependencies**: None
- **Model Used**: None

### 3.2 `lib/Widgets/BouncingButton.dart`
- **Current**: 56 lines. Press-and-hold animation widget
- **Action**: Keep as-is
- **Exact Changes**: None - this is a well-implemented reusable widget
- **New Dependencies**: None
- **Model Used**: None

### 3.3 `lib/Widgets/DrawerListTile.dart`
- **Current**: 30 lines. List tile with image asset and name
- **Action**: Minor modifications
- **Exact Changes**:
  - Change: `Image.asset("assets/${imgpath}")` to accept `IconData` or keep asset
  - Add: Optional `subtitle` parameter
  - Add: Optional `trailing` widget
  - Add: Badge support
  - Keep: Core functionality intact
- **New Dependencies**: None
- **Model Used**: None

### 3.4 `lib/Widgets/LeaveApply/datepicker.dart`
- **Current**: 36 lines. Custom date picker wrapping `date_time_picker`
- **Action**: Keep as-is
- **Exact Changes**: None - useful reusable widget for date selection
- **New Dependencies**: None
- **Model Used**: None

---

## 4. Files to CREATE (new) - see `10_NEW_FILE_PLAN.md`

Total new files: 89

### Summary by Layer:
| Layer | Count | Purpose |
|-------|-------|---------|
| Config | 4 | API URLs, theme, routes |
| Services | 13 | API clients for each domain |
| Models | 20 | Data models with serialization |
| Providers | 5 | State management |
| Screens | 34 | UI screens by role |
| Widgets | 13 | Reusable UI components |

---

## 5. Dependency Impact Summary

### Files Affected by Each Dependency Change:

| Dependency | Action | Files Affected |
|-----------|--------|----------------|
| `firebase_auth` | REMOVE | main.dart, SplashScreen.dart, LoginPage.dart, home.dart, Auth_services.dart |
| `firebase_core` | REMOVE | main.dart, SplashScreen.dart, LoginPage.dart, home.dart |
| `google_sign_in` | REMOVE | main.dart, Auth_services.dart |
| `fzregex` | REMOVE | LoginPage.dart, ForgetPassword.dart, RequestLogin.dart |
| `flutter_svg` | REMOVE | None (unused) |
| `flare_flutter` | REMOVE | SplashScreen.dart |
| `randomizer_null_safe` | REMOVE | Exam_Rseult.dart (commented only) |
| `flrx_validator` | REMOVE | None (unused) |
| `flutter_randomcolor` | REMOVE | SubjectCard.dart |
| `dio` | ADD | api_client.dart, all *_api.dart services |
| `go_router` | ADD | main.dart, routes.dart, all screen navigation |
| `flutter_riverpod` | ADD | main.dart, all screens, all widgets |
| `shared_preferences` | ADD | SplashScreen.dart, auth_provider.dart, api_client.dart |
| `google_fonts` | ADD | theme.dart, all screens |
| `shimmer` | ADD | loading_skeleton.dart |
| `cached_network_image` | ADD | UserDetailCard.dart, avatar.dart |
| `intl` | ADD | AttendanceCard.dart, any date display |
| `flutter_dotenv` | ADD | app_config.dart |

---

## 6. Implementation Order

### Phase 1: Foundation (Days 1-2)
1. Update `pubspec.yaml` - remove old deps, add new
2. Create `lib/config/` directory with app_config, api_config, theme, routes
3. Create `lib/services/api_client.dart` (Dio setup)
4. Create `lib/models/user.dart`
5. Create `lib/providers/auth_provider.dart`

### Phase 2: Auth Flow (Days 3-4)
6. Rebuild `lib/Screens/SplashScreen.dart`
7. Rebuild `lib/Screens/LoginPage.dart` → rename to `login_screen.dart`
8. Create `lib/screens/forgot_password_screen.dart`
9. Rebuild `lib/main.dart` with GoRouter

### Phase 3: Core UI (Days 5-7)
10. Create `lib/widgets/` directory with shared widgets
11. Rebuild `lib/Widgets/AppBar.dart` → `lib/widgets/app_bar.dart`
12. Rebuild `lib/Widgets/MainDrawer.dart` → `lib/widgets/drawer.dart`
13. Rebuild `lib/Widgets/DashboardCards.dart` → `lib/widgets/stat_card.dart`
14. Create `lib/widgets/bottom_nav.dart`

### Phase 4: Student Features (Days 8-12)
15. Create student screens (dashboard, courses, attendance, etc.)
16. Create remaining models (Course, Lesson, Attendance, etc.)
17. Create student API services
18. Create student providers

### Phase 5: Parent/Teacher Features (Days 13-17)
19. Create parent screens
20. Create teacher screens
21. Create parent/teacher API services
22. Create parent/teacher providers

### Phase 6: Polish (Days 18-20)
23. Remove all old files
24. Clean up commented code
25. Final testing
26. Performance optimization

---

## 7. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking changes from Firebase removal | HIGH | Complete auth flow rewrite in Phase 2 |
| Missing API endpoints | MEDIUM | Create mock services for offline development |
| State management complexity | MEDIUM | Start with Riverpod, keep it simple |
| Large file count increase | LOW | Organize by feature, use barrel exports |
| Package compatibility | LOW | Use latest stable versions, test each addition |
