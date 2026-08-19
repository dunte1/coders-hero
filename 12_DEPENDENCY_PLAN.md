# Dependency Plan

> Coder's Hero Flutter Mobile App - Complete Dependency Analysis
> Generated from verified `pubspec.yaml` audit

---

## 1. Current Dependencies Analysis

### `pubspec.yaml` Location
`Mobile\coders-hero-mobile\pubspec.yaml`

### Current Package Name
`school_management` → Will be renamed to `coders_hero`

### Current SDK Constraint
`sdk: ">=2.12.0 <3.0.0"` → Upgrade to `sdk: ">=3.0.0 <4.0.0"`

---

## 2. Dependencies to REMOVE (7 packages)

### 2.1 `firebase_auth: ^5.3.4`
- **Action**: REMOVE
- **Reason**: Replaced by Laravel Sanctum token-based authentication
- **Version Used**: 5.3.4
- **Files Using It**:
  - `lib/main.dart` (line 1)
  - `lib/Screens/LoginPage.dart` (line 1)
  - `lib/Screens/SplashScreen.dart` (line 3 - via firebase_core)
  - `lib/Screens/home.dart` (line 1 - via firebase_core)
  - `lib/services/Auth_services.dart` (line 1, 25)
- **Replacement**: `dio` + `shared_preferences` for Sanctum auth
- **Impact**: HIGH - requires complete auth flow rewrite
- **Migration Steps**:
  1. Create `auth_api.dart` with Sanctum login
  2. Create `auth_provider.dart` with token management
  3. Update `login_screen.dart` to use new auth
  4. Remove all `FirebaseAuth` references

### 2.2 `firebase_core: ^3.9.0`
- **Action**: REMOVE
- **Reason**: No Firebase services needed in Coder's Hero
- **Version Used**: 3.9.0
- **Files Using It**:
  - `lib/main.dart` (line 2, 15-17)
  - `lib/Screens/LoginPage.dart` (line 2, 31)
  - `lib/Screens/SplashScreen.dart` (line 3, 18)
  - `lib/Screens/home.dart` (line 1, 27)
- **Replacement**: None needed
- **Impact**: HIGH - removes Firebase initialization entirely
- **Migration Steps**:
  1. Remove `Firebase.initializeApp()` from all files
  2. Remove `firebase_options.dart` import
  3. Remove Firebase config files if present

### 2.3 `google_sign_in: ^6.2.2`
- **Action**: REMOVE
- **Reason**: Laravel handles authentication, no Google Sign-In needed
- **Version Used**: 6.2.2
- **Files Using It**:
  - `lib/main.dart` (line 3)
  - `lib/services/Auth_services.dart` (line 2, 26)
- **Replacement**: None needed
- **Impact**: LOW - only used in removed Auth_services.dart
- **Migration Steps**:
  1. Remove import from main.dart
  2. Delete Auth_services.dart

### 2.4 `fzregex: ^2.0.0`
- **Action**: REMOVE
- **Reason**: Use Flutter's built-in form validators instead
- **Version Used**: 2.0.0
- **Files Using It**:
  - `lib/Screens/LoginPage.dart` (line 5-6, 143)
  - `lib/Screens/ForgetPassword.dart` (line 2-3, 146, 370)
  - `lib/Screens/RequestLogin.dart` (line 2-3, 201, 508)
- **Replacement**: `FormValidators` class or inline regex
- **Impact**: LOW - simple email validation replacement
- **Migration Steps**:
  1. Replace `Fzregex.hasMatch(value, FzPattern.email)` with:
     ```dart
     RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)
     ```
  2. Or use `EmailValidator.validate(value)` from a simpler package

### 2.5 `flutter_svg: ^2.0.16`
- **Action**: REMOVE
- **Reason**: Not used anywhere in the codebase (0 imports found)
- **Version Used**: 2.0.16
- **Files Using It**: None
- **Replacement**: None needed
- **Impact**: NONE - unused dependency
- **Migration Steps**:
  1. Simply remove from pubspec.yaml

### 2.6 `flare_flutter: ^3.0.2`
- **Action**: REMOVE
- **Reason**: Used for splash animation which is being replaced with static logo
- **Version Used**: 3.0.2
- **Files Using It**:
  - `lib/Screens/SplashScreen.dart` (line 4, 32-36)
- **Replacement**: Static logo image or Lottie animation
- **Impact**: MEDIUM - requires splash screen redesign
- **Migration Steps**:
  1. Create new SplashScreen without FlareActor
  2. Add Coder's Hero logo to assets
  3. Remove FlareActor references

### 2.7 `randomizer_null_safe: ^0.1.5`
- **Action**: REMOVE
- **Reason**: Only used in commented-out code in Exam_Rseult.dart
- **Version Used**: 0.1.5
- **Files Using It**:
  - `lib/Screens/Exam/Exam_Rseult.dart` (commented line 320)
- **Replacement**: None needed
- **Impact**: NONE - only in commented code
- **Migration Steps**:
  1. Remove commented code from Exam_Rseult.dart
  2. Remove from pubspec.yaml

### 2.8 `flrx_validator: ^0.6.0`
- **Action**: REMOVE
- **Reason**: Not used anywhere in the codebase (0 imports found)
- **Version Used**: 0.6.0
- **Files Using It**: None
- **Replacement**: None needed
- **Impact**: NONE - unused dependency
- **Migration Steps**:
  1. Simply remove from pubspec.yaml

### 2.9 `flutter_randomcolor: ^1.0.16`
- **Action**: REMOVE
- **Reason**: Used for random colors in SubjectCard which is being redesigned
- **Version Used**: 1.0.16
- **Files Using It**:
  - `lib/Widgets/Exams/SubjectCard.dart` (line 2, 29-32)
- **Replacement**: Deterministic color based on subject name
- **Impact**: LOW - simple color replacement
- **Migration Steps**:
  1. Replace random color with hash-based color:
     ```dart
     Color getSubjectColor(String name) {
       return Colors.primaries[name.hashCode.abs() % Colors.primaries.length];
     }
     ```
  2. Remove from pubspec.yaml

---

## 3. Dependencies to KEEP (2 packages)

### 3.1 `dropdown_search: ^6.0.1`
- **Action**: KEEP
- **Reason**: Useful for dropdown selection UI, actively used in codebase
- **Version Used**: 6.0.1
- **Files Using It**:
  - `lib/Screens/Leave_Apply/LeaveApply.dart` (line 2, 99, 244)
  - `lib/Screens/Exam/Exam_Rseult.dart` (line 1)
- **Impact**: None - continue using
- **Notes**: LeaveApply.dart is being removed, but dropdown_search will be used in new screens (exam type selector, course selector, etc.)

### 3.2 `date_time_picker: ^2.1.0`
- **Action**: KEEP
- **Reason**: Useful for date/time selection, actively used in codebase
- **Version Used**: 2.1.0
- **Files Using It**:
  - `lib/Screens/Leave_Apply/LeaveApply.dart` (line 1, 193)
  - `lib/Widgets/LeaveApply/datepicker.dart` (line 1, 20)
- **Impact**: None - continue using
- **Notes**: datepicker.dart is being kept, will be used in new screens

---

## 4. Dependencies to ADD (13 packages)

### 4.1 `dio: ^5.4.0`
- **Action**: ADD
- **Reason**: HTTP client for API calls to Laravel Sanctum
- **Version**: 5.4.0 (latest stable)
- **Purpose**: Replaces nothing - no HTTP client exists in current codebase
- **Files That Will Use It**:
  - `lib/services/api_client.dart` (primary client)
  - All `*_api.dart` service files
- **Impact**: HIGH - foundation of all API communication
- **Features Needed**:
  - Interceptors (auth, logging, error)
  - Request/response transformation
  - Timeout configuration
  - Token refresh handling
- **Alternative Considered**: `http` package - rejected because Dio has better interceptor support

### 4.2 `go_router: ^14.2.0`
- **Action**: ADD
- **Reason**: Declarative routing with role-based guards
- **Version**: 14.2.0 (latest stable)
- **Purpose**: Replaces manual `Navigator.push` calls
- **Files That Will Use It**:
  - `lib/main.dart` (router configuration)
  - `lib/config/routes.dart` (route definitions)
  - All screens (navigation)
- **Impact**: HIGH - changes entire navigation architecture
- **Features Needed**:
  - Named routes
  - Route parameters
  - Redirect guards
  - Nested routes (ShellRoute for bottom nav)
  - Deep linking support

### 4.3 `flutter_riverpod: ^2.5.0`
- **Action**: ADD
- **Reason**: State management for auth, user, courses, notifications
- **Version**: 2.5.0 (latest stable)
- **Purpose**: Replaces nothing - no state management exists
- **Files That Will Use It**:
  - `lib/main.dart` (ProviderScope)
  - All providers (`auth_provider.dart`, etc.)
  - All screens (ConsumerWidget/ConsumerStatefulWidget)
  - All widgets that need state
- **Impact**: HIGH - changes how state is managed across app
- **Alternative Considered**: `flutter_bloc` - rejected because Riverpod is simpler and more flexible

### 4.4 `shared_preferences: ^2.2.0`
- **Action**: ADD
- **Reason**: Token storage and simple persistent settings
- **Version**: 2.2.0 (latest stable)
- **Purpose**: Replaces nothing - no persistent storage exists
- **Files That Will Use It**:
  - `lib/services/api_client.dart` (token storage)
  - `lib/providers/auth_provider.dart` (token management)
  - `lib/screens/splash_screen.dart` (token check)
  - `lib/screens/settings_screen.dart` (preferences)
- **Impact**: MEDIUM - enables persistent auth state
- **Alternative Considered**: `flutter_secure_storage` - use for sensitive data, but SharedPreferences is sufficient for tokens in this case

### 4.5 `google_fonts: ^6.1.0`
- **Action**: ADD
- **Reason**: Coder's Hero brand typography
- **Version**: 6.1.0 (latest stable)
- **Purpose**: Replaces default Flutter fonts
- **Files That Will Use It**:
  - `lib/config/theme.dart` (font configuration)
  - All screens and widgets (via theme)
- **Impact**: LOW - visual improvement only
- **Font Options**: Inter, Poppins, or Roboto (TBD by design)

### 4.6 `shimmer: ^3.0.0`
- **Action**: ADD
- **Reason**: Loading skeleton animations for better UX
- **Version**: 3.0.0 (latest stable)
- **Purpose**: Replaces nothing - no loading skeletons exist
- **Files That Will Use It**:
  - `lib/widgets/loading_skeleton.dart` (wrapper widget)
  - All list screens (loading states)
- **Impact**: LOW - UX improvement
- **Features Needed**:
  - Shimmer effect
  - Customizable gradient
  - Child widget support

### 4.7 `cached_network_image: ^3.3.0`
- **Action**: ADD
- **Reason**: Image caching for avatars, course thumbnails, etc.
- **Version**: 3.3.0 (latest stable)
- **Purpose**: Replaces `AssetImage` for network images
- **Files That Will Use It**:
  - `lib/widgets/avatar.dart` (user avatars)
  - `lib/widgets/course_card.dart` (course thumbnails)
  - `lib/Widgets/UserDetailCard.dart` (profile image)
- **Impact**: LOW - better image loading UX
- **Features Needed**:
  - Memory caching
  - Disk caching
  - Placeholder support
  - Error widget support

### 4.8 `flutter_local_notifications: ^17.0.0`
- **Action**: ADD
- **Reason**: Local notifications for assignment reminders, exam alerts
- **Version**: 17.0.0 (latest stable)
- **Purpose**: Replaces nothing - no local notifications exist
- **Files That Will Use It**:
  - `lib/services/notification_service.dart` (new)
  - `lib/main.dart` (initialization)
- **Impact**: MEDIUM - new feature
- **Features Needed**:
  - Scheduled notifications
  - Notification channels
  - Tap handling
  - Permission management

### 4.9 `firebase_messaging: ^15.1.0`
- **Action**: ADD (Optional)
- **Reason**: Push notifications from Laravel backend
- **Version**: 15.1.0 (latest stable)
- **Purpose**: Replaces nothing - no push notifications exist
- **Files That Will Use It**:
  - `lib/services/push_notification_service.dart` (new)
  - `lib/main.dart` (initialization)
- **Impact**: MEDIUM - new feature, depends on Laravel FCM setup
- **Note**: Can be deferred to Phase 2 if Laravel FCM not ready
- **Prerequisite**: Firebase project must be re-enabled for FCM only

### 4.10 `connectivity_plus: ^6.0.0`
- **Action**: ADD
- **Reason**: Network status detection for offline handling
- **Version**: 6.0.0 (latest stable)
- **Purpose**: Replaces nothing - no network detection exists
- **Files That Will Use It**:
  - `lib/services/api_client.dart` (network check)
  - `lib/widgets/error_state.dart` (offline message)
- **Impact**: LOW - improves error handling
- **Features Needed**:
  - WiFi/Mobile/None detection
  - Stream for real-time changes

### 4.11 `intl: ^0.19.0`
- **Action**: ADD
- **Reason**: Date/time formatting and localization
- **Version**: 0.19.0 (latest stable)
- **Purpose**: Replaces nothing - no date formatting exists
- **Files That Will Use It**:
  - All screens displaying dates/times
  - `lib/widgets/assignment_card.dart` (due dates)
  - `lib/widgets/notification_tile.dart` (timestamps)
- **Impact**: LOW - better date display
- **Features Needed**:
  - DateFormat
  - NumberFormat
  - Locale support

### 4.12 `flutter_dotenv: ^5.1.0`
- **Action**: ADD
- **Reason**: Environment variable management for API URLs
- **Version**: 5.1.0 (latest stable)
- **Purpose**: Replaces nothing - no env management exists
- **Files That Will Use It**:
  - `lib/config/app_config.dart` (reads env vars)
  - `lib/main.dart` (initialization)
- **Impact**: LOW - configuration management
- **Files Needed**:
  - `.env` (development)
  - `.env.production` (production)
  - `.env.staging` (staging)

### 4.13 `json_annotation: ^4.8.0`
- **Action**: ADD (Optional)
- **Reason**: JSON serialization for models
- **Version**: 4.8.0 (latest stable)
- **Purpose**: Replaces nothing - manual JSON parsing currently
- **Files That Will Use It**:
  - All model files (`lib/models/*.dart`)
- **Impact**: LOW - cleaner model code
- **Note**: Can use manual fromJson/toJson if preferred
- **Dev Dependency**: `json_serializable` + `build_runner` for code generation

---

## 5. Dependencies to UPGRADE

### 5.1 `cupertino_icons: ^1.0.8`
- **Action**: KEEP (upgrade to latest)
- **Current Version**: 1.0.8
- **Latest Version**: 1.0.8 (already latest)
- **Reason**: Keep for iOS-style icons
- **Impact**: None

---

## 6. New Dev Dependencies

### 6.1 `json_serializable: ^6.7.0`
- **Action**: ADD
- **Reason**: Code generation for JSON serialization
- **Version**: 6.7.0 (latest stable)
- **Purpose**: Generates fromJson/toJson for models
- **Files That Will Use It**: All model files with `part` directive
- **Impact**: LOW - development convenience

### 6.2 `build_runner: ^2.4.0`
- **Action**: ADD
- **Reason**: Required for json_serializable code generation
- **Version**: 2.4.0 (latest stable)
- **Purpose**: Runs code generators
- **Command**: `dart run build_runner build --delete-conflicting-outputs`
- **Impact**: None (dev only)

### 6.3 `mocktail: ^1.0.0`
- **Action**: ADD
- **Reason**: Mocking for unit and widget tests
- **Version**: 1.0.0 (latest stable)
- **Purpose**: Creates mock objects for testing
- **Files That Will Use It**: All test files
- **Impact**: None (dev only)

### 6.4 `flutter_test` (SDK)
- **Action**: KEEP
- **Reason**: Required for testing
- **Impact**: None

---

## 7. Updated `pubspec.yaml`

```yaml
name: coders_hero
description: Coder's Hero - Learning Management System Mobile App
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter

  # Core
  cupertino_icons: ^1.0.8
  dio: ^5.4.0
  go_router: ^14.2.0
  flutter_riverpod: ^2.5.0
  shared_preferences: ^2.2.0
  flutter_dotenv: ^5.1.0

  # UI
  google_fonts: ^6.1.0
  shimmer: ^3.0.0
  cached_network_image: ^3.3.0
  flutter_svg: ^2.0.16  # Re-add if SVG icons needed
  dropdown_search: ^6.0.1
  date_time_picker: ^2.1.0

  # Utilities
  intl: ^0.19.0
  connectivity_plus: ^6.0.0

  # Notifications
  flutter_local_notifications: ^17.0.0
  # firebase_messaging: ^15.1.0  # Optional - add when FCM ready

  # JSON Serialization
  json_annotation: ^4.8.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  json_serializable: ^6.7.0
  build_runner: ^2.4.0
  mocktail: ^1.0.0
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/
    - .env
    - .env.production
    - .env.staging
```

---

## 8. Migration Checklist

### Phase 1: Remove Old Dependencies
- [ ] Remove `firebase_auth` from pubspec.yaml
- [ ] Remove `firebase_core` from pubspec.yaml
- [ ] Remove `google_sign_in` from pubspec.yaml
- [ ] Remove `fzregex` from pubspec.yaml
- [ ] Remove `flare_flutter` from pubspec.yaml
- [ ] Remove `randomizer_null_safe` from pubspec.yaml
- [ ] Remove `flrx_validator` from pubspec.yaml
- [ ] Remove `flutter_randomcolor` from pubspec.yaml
- [ ] Run `flutter pub get` to verify

### Phase 2: Add New Dependencies
- [ ] Add `dio` to pubspec.yaml
- [ ] Add `go_router` to pubspec.yaml
- [ ] Add `flutter_riverpod` to pubspec.yaml
- [ ] Add `shared_preferences` to pubspec.yaml
- [ ] Add `google_fonts` to pubspec.yaml
- [ ] Add `shimmer` to pubspec.yaml
- [ ] Add `cached_network_image` to pubspec.yaml
- [ ] Add `flutter_local_notifications` to pubspec.yaml
- [ ] Add `connectivity_plus` to pubspec.yaml
- [ ] Add `intl` to pubspec.yaml
- [ ] Add `flutter_dotenv` to pubspec.yaml
- [ ] Add `json_annotation` to pubspec.yaml
- [ ] Add dev dependencies
- [ ] Run `flutter pub get` to verify

### Phase 3: Update SDK Constraint
- [ ] Update SDK constraint to `>=3.0.0 <4.0.0`
- [ ] Run `dart fix --apply` to fix any issues
- [ ] Run `flutter analyze` to verify

### Phase 4: Verify
- [ ] `flutter pub get` succeeds
- [ ] `flutter analyze` passes
- [ ] `flutter build apk --debug` succeeds
- [ ] No import errors
- [ ] No missing dependencies

---

## 9. Risk Assessment

| Dependency | Risk | Impact | Mitigation |
|-----------|------|--------|------------|
| `dio` | LOW | HIGH | Well-documented, stable API |
| `go_router` | MEDIUM | HIGH | Complex routing, test thoroughly |
| `flutter_riverpod` | MEDIUM | HIGH | Learning curve, but powerful |
| `shared_preferences` | LOW | MEDIUM | Simple, well-tested |
| `flutter_local_notifications` | MEDIUM | MEDIUM | Platform-specific setup needed |
| `firebase_messaging` | HIGH | MEDIUM | Requires Firebase project re-enable |
| `connectivity_plus` | LOW | LOW | Simple API |
| `json_annotation` | LOW | LOW | Code generation, well-documented |

---

## 10. Alternative Approaches

### If Riverpod is Too Complex
- Use `flutter_bloc` for state management
- Or use `provider` for simpler state management
- Or use `get_it` + `injectable` for service locator pattern

### If GoRouter is Too Complex
- Use `auto_route` for code-generated routing
- Or use manual `Navigator` with named routes
- Or use `beamer` for declarative routing

### If Firebase Messaging is Not Ready
- Skip `firebase_messaging` initially
- Use only `flutter_local_notifications` for local reminders
- Add push notifications in Phase 2

### If JSON Serialization is Too Heavy
- Skip `json_annotation` and `json_serializable`
- Use manual `fromJson`/`toJson` methods
- Or use `freezed` for immutable models with JSON support
