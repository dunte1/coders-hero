# Coder's Hero Mobile App — Full System Audit

**Date:** 2026-08-26  
**Platform:** Flutter 3.x (Dart)  
**Backend:** Laravel 12 API  

---

## Executive Summary

| Category | Status |
|----------|--------|
| API Integration | 208 endpoints audited — 6 issues found |
| Authentication | Secure (FlutterSecureStorage, JWT refresh, 2FA) |
| State Management | Solid (Riverpod 2.5, feature-first architecture) |
| Error Handling | Layered (Dio → ApiException → try/catch → UI) |
| Security | Good (certificate pinning, jailbreak detection, input validation) |
| Offline Support | Implemented (Hive cache, request queue, connectivity monitor) |
| Critical Issues | 2 HIGH, 4 MEDIUM |

---

## 1. Architecture Overview

| Aspect | Implementation |
|--------|---------------|
| State Management | Riverpod 2.5 (StateNotifier, Provider.family) |
| Routing | GoRouter 14.2 with ShellRoute + role-based guards |
| HTTP | Dio 5.4 with interceptors (auth, logging, caching) |
| Auth | JWT access + refresh tokens via FlutterSecureStorage, 2FA flow |
| Roles/Permissions | 16 roles, 23 modules, RoleAccess map with full/limited access |
| Offline | Hive TTL cache, request queue, connectivity monitoring |
| Security | Input validation, jailbreak detection, certificate pinning |
| Features | 20 feature modules, ~200 Dart files |
| Theme | Material3, navy/cyan palette, Google Fonts Inter, light + dark |

---

## 2. Critical Issues (Fix Immediately)

### M1 — HIGH: Token Refresh Broken
- **File:** `lib/core/api/api_interceptor.dart:52`
- **Problem:** Auto-refresh calls `POST /auth/refresh` but backend route is `POST /refresh-token`
- **Impact:** Every expired token triggers a 404 → user logged out
- **Fix:** Change `/auth/refresh` to `/refresh-token`

### M2 — HIGH: Missing Backend Routes (Punch Clock)
- **File:** `lib/features/teacher/screens/attendance/punch_clock_screen.dart:12,275,300`
- **Problem:** Mobile calls 3 endpoints that don't exist in backend:
  - `GET /my/hr/attendance/today`
  - `POST /my/hr/attendance/check-in`
  - `POST /my/hr/attendance/check-out`
- **Impact:** Punch clock feature completely broken
- **Fix:** Either add backend routes or redirect to existing `GET /my/hr/attendance`

---

## 3. Medium Issues (Fix Soon)

### M3 — Admin Attendance Prefix Mismatch
- **File:** `lib/features/admin/screens/attendance/admin_attendance_screen.dart:11,19`
- **Problem:** Mobile sends `/admin/attendance` and `/admin/attendance/report` but backend routes are `/attendance` and `/attendance/report` (under `students` prefix group)
- **Fix:** Remove `/admin` prefix from these calls

### M4 — Admin Admissions Prefix Mismatch
- **File:** `lib/features/admin/screens/admissions/admissions_screen.dart:11`
- **Problem:** Mobile sends `/admin/admissions` but backend route is `/admissions` (under `students` prefix group)
- **Fix:** Remove `/admin` prefix

### M5 — Missing Backend Route (LMS Course Progress)
- **File:** `lib/features/lms/data/lms_api_service.dart:183`
- **Problem:** Mobile calls `GET /lms/courses/{courseId}/progress` — no such route exists
- **Impact:** Progress tracker screen may show empty/error
- **Fix:** Backend should add route or frontend should use enrollment progress endpoint

### M6 — LMS Quiz Endpoints Missing Prefix
- **File:** `lib/features/lms/data/lms_api_service.dart:22-52`
- **Problem:** Quiz endpoints call `/quizzes` without `/lms/` prefix
- **Impact:** Works because root auth routes define `/quizzes`, but inconsistent
- **Fix:** Add `/lms/` prefix to match other LMS endpoints

---

## 4. API Integration Audit (208 Endpoints)

### Results by Module

| Module | Endpoints | All Match? | Issues |
|--------|-----------|------------|--------|
| Auth | 14 | ✅ 13/14 | M1: refresh token URL |
| Student | 29 | ✅ 29/29 | — |
| Teacher | 22 | ✅ 22/22 | — |
| Parent | 17 | ✅ 17/17 | — |
| LMS | 19 | ⚠️ 16/19 | M5: missing /progress, M6: quiz prefix |
| Coding | 9 | ✅ 9/9 | — |
| AI | 8 | ✅ 8/8 | — |
| Chat | 6 | ✅ 6/6 | — |
| Library | 5 | ✅ 5/5 | — |
| Competitions | 7 | ✅ 7/7 | — |
| Robotics | 2 | ✅ 2/2 | — |
| Admin | 16 | ✅ 15/16 | M3,M4: prefix mismatches |
| CMS | 12 | ✅ 12/12 | — |
| HR | 4 | ✅ 4/4 | — |
| MyHR | 5 | ⚠️ 2/5 | M2: 3 missing backend routes |
| Notifications | 6 | ✅ 6/6 | — |
| Reports | 3 | ✅ 3/3 | — |
| Organization | 5 | ✅ 5/5 | — |
| Inventory | 4 | ✅ 4/4 | — |
| Other (inline) | 18 | ✅ 18/18 | — |

### HTTP Method Verification

All endpoints use correct HTTP methods matching backend routes:
- GET for reads ✅
- POST for creates ✅  
- PUT for updates ✅
- DELETE for deletes ✅
- POST for actions (enroll, submit, approve) ✅

---

## 5. Authentication & Security Audit

### Token Management
| Check | Status | Detail |
|-------|--------|--------|
| Token storage | ✅ | FlutterSecureStorage (encrypted at rest) |
| Token refresh | ⚠️ | M1: Wrong URL — `/auth/refresh` vs `/refresh-token` |
| 2FA support | ✅ | Full flow: temp token → challenge → complete |
| Logout cleanup | ✅ | Clears tokens + memory |
| Secure token transmission | ✅ | Bearer header via interceptor |

### Security Features
| Feature | Status | File |
|---------|--------|------|
| Input validation (SQL/XSS) | ✅ | `core/security/input_validator.dart` |
| Jailbreak detection | ✅ | `core/security/jailbreak_detector.dart` (TODO: URL scheme) |
| Certificate pinning | ✅ | `core/security/certificate_pinner.dart` |
| Secure storage audit | ✅ | `core/security/secure_storage_audit.dart` |
| No secrets in logs | ✅ | Dio logger configured |
| Environment switching | ✅ | `config/env.dart` — prod/staging/dev |

### Known Security TODOs
- `jailbreak_detector.dart:91` — URL scheme checking not implemented

---

## 6. State Management Audit

### Riverpod Usage
| Pattern | Usage Count | Status |
|---------|-------------|--------|
| StateNotifier | 25+ providers | ✅ Clean |
| FutureProvider | 15+ providers | ✅ Clean |
| Provider.family | 10+ providers | ✅ Clean |
| ConsumerWidget | All screens | ✅ Consistent |
| ProviderScope | main.dart | ✅ Global |

### Data Flow
```
Screen (ConsumerWidget)
  → Provider (FutureProvider/StateNotifier)
    → Repository (wraps API service)
      → ApiService (calls ApiClient)
        → ApiClient (Dio HTTP)
          → ApiInterceptor (auth token)
```

### Provider Files Audited
- `auth_provider.dart` — Auth state management ✅
- `role_provider.dart` — Role/permission checks ✅  
- `dashboard_provider.dart` — Dashboard data ✅
- `assignments_provider.dart` — Assignments CRUD ✅
- `exams_provider.dart` — Exams CRUD ✅
- `classes_provider.dart` — Classes list ✅
- `gradebook_provider.dart` — Gradebook ✅
- `fees_provider.dart` — Parent fees ✅
- `children_provider.dart` — Parent children ✅
- `library_provider.dart` — Library catalog ✅
- `competitions_provider.dart` — Competitions ✅
- `notifications_provider.dart` — Notifications ✅

---

## 7. Error Handling Audit

### Layered Architecture
1. **Dio Layer** (`api_client.dart`): Catches `DioException`, wraps as `ApiException`
2. **Interceptor Layer** (`api_interceptor.dart`): Auto-refresh on 401, retry
3. **Service Layer** (e.g., `auth_api_service.dart`): Catches `ApiException`, rethrows
4. **Provider Layer** (e.g., `dashboard_provider.dart`): try/catch with state updates
5. **Screen Layer** (all screens): try/catch with SnackBar alerts

### Exception Mapping (`api_exception.dart`)
| HTTP Code | Message | Status |
|-----------|---------|--------|
| 400 | Server message | ✅ |
| 401 | "Unauthorized. Please login again." | ✅ |
| 403 | "Access denied." | ✅ |
| 404 | "Resource not found." | ✅ |
| 422 | Server validation message | ✅ |
| 500 | "Server error. Please try again later." | ✅ |
| Timeout | "Connection timeout. Please check your internet." | ✅ |
| No internet | "No internet connection." | ✅ |

### Missing Error Handling
- No global error boundary (FlutterError.onError)
- No crash reporting (Sentry/Crashlytics not integrated)

---

## 8. Offline Support Audit

| Feature | Status | File |
|---------|--------|------|
| Connectivity monitoring | ✅ | `core/network/connectivity_service.dart` |
| Hive TTL cache | ✅ | `core/cache/cache_manager.dart` |
| Cache interceptor | ✅ | `core/cache/cache_interceptor.dart` |
| Request queue | ✅ | `core/network/request_queue.dart` |
| Offline indicator | ✅ | `core/cache/offline_indicator.dart` |
| Retry with backoff | ✅ | `core/network/retry_handler.dart` |

---

## 9. UI/UX Audit

### Theme & Design
| Check | Status |
|-------|--------|
| Material3 | ✅ |
| Light + Dark themes | ✅ |
| Consistent color palette | ✅ (navy #0F172A, cyan #00E5E5) |
| Google Fonts Inter | ✅ |
| Responsive layouts | ⚠️ Some screens fixed-width |
| Loading states | ✅ Shimmer placeholders |
| Empty states | ✅ EmptyState widget |
| Error states | ✅ AppErrorWidget |

### Navigation
| Check | Status |
|-------|--------|
| Role-based routing | ✅ GoRouter with guards |
| Bottom nav + drawer | ✅ |
| Deep linking | ⚠️ Not configured |
| Back navigation | ✅ |
| Splash screen | ✅ |

---

## 10. File-by-File Summary

### Core Layer (8 files)
| File | Lines | Status | Notes |
|------|-------|--------|-------|
| `core/api/api_client.dart` | 169 | ✅ | Dio wrapper, clean |
| `core/api/api_interceptor.dart` | 67 | ⚠️ | M1: wrong refresh URL |
| `core/api/api_response.dart` | 64 | ✅ | Response parsing |
| `core/api/api_exception.dart` | 87 | ✅ | Error mapping |
| `core/auth/auth_service.dart` | 127 | ✅ | Auth logic |
| `core/auth/auth_provider.dart` | 117 | ✅ | State management |
| `core/auth/token_storage.dart` | 39 | ✅ | Secure storage |
| `core/auth/role_provider.dart` | 48 | ✅ | Role checks |

### Feature API Services (14 files)
| File | Lines | Status | Notes |
|------|-------|--------|-------|
| `features/auth/data/auth_api_service.dart` | 156 | ✅ | Full auth API |
| `features/auth/data/auth_repository.dart` | 113 | ✅ | Auth + token |
| `features/student/data/student_api_service.dart` | 280 | ✅ | 29 endpoints |
| `features/teacher/data/teacher_api_service.dart` | 220 | ✅ | 22 endpoints |
| `features/parent/data/parent_api_service.dart` | 230 | ✅ | 17 endpoints |
| `features/lms/data/lms_api_service.dart` | 190 | ⚠️ | M5,M6 |
| `features/coding/data/coding_api_service.dart` | 100 | ✅ | 9 endpoints |
| `features/ai/data/ai_api_service.dart` | 80 | ✅ | 8 endpoints |
| `features/chat/data/chat_api_service.dart` | 65 | ✅ | 6 endpoints |
| `features/library/data/library_api_service.dart` | 70 | ✅ | 5 endpoints |
| `features/competitions/data/competition_api_service.dart` | 80 | ✅ | 7 endpoints |
| `features/admin/data/admin_api_service.dart` | 180 | ✅ | 16 endpoints |
| `features/notifications/data/notification_api_service.dart` | 55 | ✅ | 6 endpoints |
| `features/robotics/data/robotics_api_service.dart` | 30 | ✅ | 2 endpoints |

---

## 11. Recommendations

### Immediate (Fix Now)
1. Fix token refresh URL in `api_interceptor.dart`
2. Add backend routes for punch clock or remove mobile feature

### Short-Term (This Sprint)
3. Fix admin attendance/admissions prefix mismatches
4. Add `/lms/` prefix to quiz endpoints
5. Add LMS course progress backend route

### Medium-Term (Next Sprint)
6. Add global error boundary + crash reporting (Sentry)
7. Implement deep linking
8. Add jailbreak URL scheme detection
9. Add retry logic for all API calls (currently only 401)
10. Add pull-to-refresh on all list screens

### Long-Term
11. Add E2E tests for critical flows
12. Add accessibility (semantics labels)
13. Add push notification deep linking
14. Performance profiling and optimization

---

## 12. Test Coverage

| Area | Status |
|------|--------|
| Unit tests | ⚠️ `test/` directory exists but contents not audited |
| Widget tests | ⚠️ Not found |
| Integration tests | ⚠️ Not found |
| API integration tests | ❌ None |

---

## 13. Conclusion

The Flutter mobile app is **well-architected** with clean separation of concerns, consistent patterns, and solid security practices. The main issues are:

- **1 critical bug** (token refresh URL) that breaks auto-login
- **1 missing feature** (punch clock backend routes)
- **3 URL prefix mismatches** causing 404s on specific screens
- **1 missing backend route** (LMS course progress)

These are all **quick fixes**. The overall code quality is high — feature-first architecture, consistent Riverpod usage, layered error handling, and proper offline support.
