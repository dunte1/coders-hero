# Flutter Mobile App — Implementation Roadmap

## Phase 1 — CRITICAL BUGS ✅ COMPLETE
| ID | Priority | Issue | Fix |
|----|----------|-------|-----|
| M1 | HIGH | Token refresh calls `/auth/refresh` (should be `/refresh-token`) | ✅ Changed to `/refresh-token` |
| M2 | HIGH | Punch clock endpoints don't exist in backend | ✅ Redirected to existing `/my/hr/attendance` |

## Phase 2 — URL PREFIX MISMATCHES ✅ COMPLETE
| ID | Priority | Issue | Fix |
|----|----------|-------|-----|
| M3 | MEDIUM | Admin attendance: `/admin/attendance` → `/attendance` | ✅ Removed `/admin` prefix |
| M4 | MEDIUM | Admin admissions: `/admin/admissions` → `/admissions` | ✅ Removed `/admin` prefix |
| M5 | MEDIUM | Missing backend route `/lms/courses/{id}/progress` | ✅ Redirected to enrollment endpoint |
| M6 | LOW | LMS quiz endpoints missing `/lms/` prefix | ✅ Added `/lms/` prefix |

## Phase 3 — ERROR HANDLING & SECURITY
| ID | Priority | Issue | Fix |
|----|----------|-------|-----|
| E1 | MEDIUM | No global error boundary | Add FlutterError.onError |
| E2 | MEDIUM | No crash reporting | Add Sentry/Crashlytics setup |
| E3 | LOW | Jailbreak URL scheme TODO | Implement method channel |
| E4 | LOW | No retry logic for non-401 errors | Add exponential backoff |

## Phase 4 — MISSING FEATURES & POLISH
| ID | Priority | Issue | Fix |
|----|----------|-------|-----|
| F1 | MEDIUM | No deep linking | Configure GoRouter |
| F2 | LOW | No pull-to-refresh on all lists | Add RefreshIndicator |
| F3 | LOW | No E2E tests | Add integration tests |
| F4 | LOW | No accessibility semantics | Add Semantics labels |
