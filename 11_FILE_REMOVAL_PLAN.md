# File Removal Plan

> Coder's Hero Flutter Mobile App - Files to Remove and Cleanup
> Generated from verified codebase audit

---

## 1. Files to DELETE (8 files)

### 1.1 `lib/Screens/ForgetPassword.dart`
- **Lines**: 451 (225 active + 226 commented)
- **Why Obsolete**: Stub with no real functionality. The "Request" button calls an empty `try {} catch (e) {}` block (line 191-194). No API call is made. Uses `fzregex` for validation which is being removed.
- **Replacement**: `lib/screens/forgot_password_screen.dart` - will call `POST /api/forgot-password`
- **Dependencies**: Used by `LoginPage.dart` (line 234)
- **Affected Routes**: N/A (not in route system)
- **Safe Removal Conditions**:
  - [ ] Replace ForgetPassword import in LoginPage.dart with new ForgotPasswordScreen
  - [ ] New forgot_password_screen.dart is functional
  - [ ] Verify no other files import ForgetPassword.dart

### 1.2 `lib/Screens/RequestLogin.dart`
- **Lines**: 616 (305 active + 311 commented)
- **Why Obsolete**: "Request Login ID" flow is not part of Coder's Hero. In Coder's Hero, users are created by admins in the Laravel backend. Students don't self-register for login credentials.
- **Replacement**: None needed - admin creates users via Laravel admin panel
- **Dependencies**: Used by `LoginPage.dart` (line 294)
- **Affected Routes**: N/A (not in route system)
- **Safe Removal Conditions**:
  - [ ] Remove "Request Login ID" button from LoginPage.dart
  - [ ] Verify no other files import RequestLogin.dart
  - [ ] Confirm admin can create users in Laravel backend

### 1.3 `lib/Screens/RequestProcessing.dart`
- **Lines**: 49
- **Why Obsolete**: Static confirmation page shown after RequestLogin submission. Only contains text "YOUR USERNAME AND PASSWORD IS SENT TO YOUR MAIL" and a link back to login. No functionality.
- **Replacement**: None needed - only used by removed RequestLogin.dart
- **Dependencies**: Used by `RequestLogin.dart` (line 5, 276)
- **Affected Routes**: N/A (not in route system)
- **Safe Removal Conditions**:
  - [ ] RequestLogin.dart is removed first
  - [ ] Verify no other files import RequestProcessing.dart

### 1.4 `lib/Screens/Leave_Apply/LeaveApply.dart`
- **Lines**: 1089 (556 active + 533 commented)
- **Why Obsolete**: Leave management is an HR module feature. In Coder's Hero, leave requests are managed through the admin panel, not the mobile app. The mobile app focuses on learning, courses, and attendance.
- **Replacement**: None needed for mobile. Admin manages leaves via web dashboard.
- **Dependencies**: Used by `home.dart` (line 12, 232), `MainDrawer.dart` (line 4, 69)
- **Affected Routes**: N/A (not in route system, direct navigation)
- **Safe Removal Conditions**:
  - [ ] Remove LeaveApply card from home.dart
  - [ ] Remove LeaveApply tile from MainDrawer.dart
  - [ ] Verify no other files import LeaveApply.dart
  - [ ] Confirm leave management is admin-only in Coder's Hero

### 1.5 `lib/Widgets/NavigationDrawer.dart`
- **Lines**: 21
- **Why Obsolete**: Redundant wrapper widget that simply wraps `MainDrawer()` inside a `Drawer`. Never imported by any screen - all screens import and use `MainDrawer` directly.
- **Replacement**: None needed - `MainDrawer` is used directly everywhere
- **Dependencies**: None (no file imports NavigationDrawer)
- **Affected Routes**: N/A
- **Safe Removal Conditions**:
  - [ ] Verify no file imports NavigationDrawer (confirmed: 0 imports found)
  - [ ] Can be safely deleted immediately

### 1.6 `lib/Widgets/LeaveApply/LeaveHistoryCard.dart`
- **Lines**: 85
- **Why Obsolete**: Only used by `LeaveApply.dart` which is being removed. Displays leave history with status, dates, and reason.
- **Replacement**: None needed - leave management not in mobile scope
- **Dependencies**: Used by `LeaveApply.dart` (line 8, 537)
- **Affected Routes**: N/A
- **Safe Removal Conditions**:
  - [ ] LeaveApply.dart is removed first
  - [ ] Verify no other files import LeaveHistoryCard.dart

### 1.7 `lib/services/Auth_services.dart`
- **Lines**: 56
- **Why Obsolete**: Firebase Auth + Google Sign-In implementation. Replaced entirely by Laravel Sanctum token-based authentication. The Google Sign-In flow is not used in Coder's Hero.
- **Replacement**: `lib/services/auth_api.dart` - Laravel Sanctum authentication
- **Dependencies**: Not imported by any file (entire file is standalone)
- **Affected Routes**: N/A
- **Safe Removal Conditions**:
  - [ ] Verify no file imports Auth_services (confirmed: 0 imports found)
  - [ ] New auth_api.dart is functional
  - [ ] Can be safely deleted immediately

### 1.8 `test/widget_test.dart`
- **Lines**: 30
- **Why Obsolete**: Default Flutter template test that tests a counter app. Tests for `find.text('0')` and `find.byIcon(Icons.add)` which don't exist in this app. Will fail immediately if run.
- **Replacement**: New test files for each feature
- **Dependencies**: Imports `school_management/main.dart`
- **Affected Routes**: N/A
- **Safe Removal Conditions**:
  - [ ] New test structure is created
  - [ ] Can be safely deleted immediately

---

## 2. Commented-Out Code Blocks to Clean

### 2.1 `lib/Screens/LoginPage.dart` (Lines 345-716)
- **Content**: Duplicate of the active code with older Firebase syntax (`FirebaseUser` instead of `User`)
- **Lines to Remove**: 344-716 (372 lines of commented code)
- **Why**: Dead code, duplicate of active implementation, uses deprecated Firebase API
- **Impact**: Reduces file from 716 to 344 lines (52% reduction)

### 2.2 `lib/Screens/ForgetPassword.dart` (Lines 231-451)
- **Content**: Duplicate of the active code with older validation syntax (`val.isEmpty` without null check)
- **Lines to Remove**: 230-451 (222 lines of commented code)
- **Why**: Dead code, duplicate of active implementation
- **Impact**: Reduces file from 451 to 230 lines (49% reduction) - but file is being deleted anyway

### 2.3 `lib/Screens/RequestLogin.dart` (Lines 308-616)
- **Content**: Duplicate of the active code with older validation syntax
- **Lines to Remove**: 307-616 (310 lines of commented code)
- **Why**: Dead code, duplicate of active implementation
- **Impact**: Reduces file from 616 to 307 lines (50% reduction) - but file is being deleted anyway

### 2.4 `lib/Screens/Leave_Apply/LeaveApply.dart` (Lines 564-1089)
- **Content**: Original code before dropdown_search upgrade, uses older `Mode.MENU` API
- **Lines to Remove**: 563-1089 (527 lines of commented code)
- **Why**: Dead code, superseded by active implementation using dropdown_search v6 API
- **Impact**: Reduces file from 1089 to 563 lines (48% reduction) - but file is being deleted anyway

### 2.5 `lib/Screens/Exam/Exam_Rseult.dart` (Lines 317-705)
- **Content**: Duplicate with `Randomizer` package and DropdownSearch v1 API (`Mode.MENU`)
- **Lines to Remove**: 316-705 (390 lines of commented code)
- **Why**: Dead code, uses deprecated APIs and removed packages
- **Impact**: Reduces file from 705 to 316 lines (55% reduction)

### 2.6 `lib/Widgets/Exams/SubjectCard.dart` (Lines 143-268)
- **Content**: Duplicate using older `randomizer` package (different from `randomizer_null_safe`)
- **Lines to Remove**: 142-268 (127 lines of commented code)
- **Why**: Dead code, uses removed package
- **Impact**: Reduces file from 268 to 142 lines (47% reduction)

### 2.7 `lib/services/UserModel.dart` (Lines 9-15)
- **Content**: Commented-out older version without `required` keyword
- **Lines to Remove**: 8-15 (8 lines of commented code)
- **Why**: Dead code, older pre-null-safety version
- **Impact**: Reduces file from 15 to 8 lines (47% reduction)

---

## 3. Files with No Changes Needed

### 3.1 `lib/Widgets/BouncingButton.dart`
- **Lines**: 56
- **Status**: KEEP as-is
- **Reason**: Well-implemented reusable animation widget, no issues found

### 3.2 `lib/Widgets/LeaveApply/datepicker.dart`
- **Lines**: 36
- **Status**: KEEP as-is
- **Reason**: Useful reusable date picker widget, wraps `date_time_picker` package

### 3.3 `lib/Widgets/DrawerListTile.dart`
- **Lines**: 30
- **Status**: KEEP with minor modifications
- **Reason**: Useful widget, needs icon parameter flexibility

---

## 4. Removal Execution Order

### Phase 1: Safe Deletions (No Dependencies)
These files have no imports from other files and can be deleted immediately:
1. `lib/Widgets/NavigationDrawer.dart` - 0 imports
2. `lib/services/Auth_services.dart` - 0 imports
3. `test/widget_test.dart` - 0 imports (test file)

### Phase 2: Dependent Deletions (Remove After Dependencies)
These files are imported by other files. Remove in this order:
4. `lib/Screens/Leave_Apply/LeaveHistoryCard.dart` - imported by LeaveApply.dart
5. `lib/Screens/Leave_Apply/LeaveApply.dart` - imported by home.dart, MainDrawer.dart
6. `lib/Screens/RequestProcessing.dart` - imported by RequestLogin.dart
7. `lib/Screens/RequestLogin.dart` - imported by LoginPage.dart
8. `lib/Screens/ForgetPassword.dart` - imported by LoginPage.dart

### Phase 3: Commented Code Cleanup
After file deletions, clean commented code from remaining files:
9. `lib/Screens/LoginPage.dart` - remove lines 344-716
10. `lib/Screens/Exam/Exam_Rseult.dart` - remove lines 316-705
11. `lib/Widgets/Exams/SubjectCard.dart` - remove lines 142-268
12. `lib/services/UserModel.dart` - remove lines 8-15

---

## 5. Impact Analysis

### Code Reduction Summary

| Metric | Before | After | Reduction |
|--------|--------|-------|-----------|
| Total Dart files | 27 | 19 | 8 files (30%) |
| Total lines (active) | ~4,200 | ~2,100 | ~2,100 lines (50%) |
| Total lines (with comments) | ~6,500 | ~2,100 | ~4,400 lines (68%) |
| Commented-out code | ~2,300 lines | 0 | 2,300 lines (100%) |

### Dependency Reduction

| Package | Lines Affected | Action |
|---------|---------------|--------|
| `firebase_auth` | 5 files | REMOVE |
| `firebase_core` | 4 files | REMOVE |
| `google_sign_in` | 2 files | REMOVE |
| `fzregex` | 3 files | REMOVE |
| `flare_flutter` | 1 file | REMOVE |
| `randomizer_null_safe` | 1 file (commented) | REMOVE |
| `flutter_randomcolor` | 1 file | REMOVE |
| `flrx_validator` | 0 files (unused) | REMOVE |

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Breaking imports | LOW | MEDIUM | Verify all imports before deletion |
| Missing functionality | LOW | LOW | All removed features are being replaced |
| Test failures | LOW | LOW | Current tests are broken anyway |
| Build errors | MEDIUM | LOW | Run `flutter analyze` after each phase |

---

## 6. Verification Checklist

### Pre-Removal
- [ ] All files have been read and understood
- [ ] Import graph has been mapped
- [ ] Replacement files are planned/created
- [ ] No critical functionality will be lost

### During Removal
- [ ] Phase 1 files deleted successfully
- [ ] Phase 2 files deleted in correct order
- [ ] No build errors after each deletion
- [ ] `flutter analyze` passes

### Post-Removal
- [ ] All 8 files removed
- [ ] All commented code blocks cleaned
- [ ] No dangling imports
- [ ] App builds successfully
- [ ] All remaining files are clean and functional
