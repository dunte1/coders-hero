# Testing Report: Coder's Hero ERP & LMS

**Generated:** 2026-08-17  
**Stack:** Laravel 12 (PHP 8.4.8) + React 19 (Node v22.16.0)  
**Composer:** 2.8.9 | **PHPUnit:** 11.5.56 | **Vite:** 6.x

---

## 1. Executive Summary

The backend has **348 tests** across **25 test files** (24 Feature + 1 Unit), all passing with **~1,209 assertions**. Coverage spans authentication, authorization, finance, HR, inventory, notifications, CMS, AI platform, and administrative endpoints. The frontend has **no unit/integration test runner** -- validation relies on TypeScript compilation, Vite production builds, and a navigation-href-to-route validation script. There is no CI pipeline configured, no E2E testing, and no frontend test framework installed.

**Overall status:** Backend test suite is comprehensive for existing API endpoints. Frontend has zero automated tests beyond build validation.

---

## 2. Backend Tests

### 2.1 Test File Inventory

| # | Test File | Tests | Assertions | Key Coverage Areas |
|---|-----------|------:|-----------:|---------------------|
| 1 | `AdminTest.php` | 13 | 19 | Activity logs, system health, system logs, backups, role seeding |
| 2 | `AiPlatformTest.php` | 15 | 56 | Assistants CRUD, conversations, chat completions, usage logging |
| 3 | `AnalyticsTest.php` | 15 | 57 | Dashboard stats, reports, data aggregation |
| 4 | `AuthTest.php` | 8 | 20 | Registration, login, logout, profile, password change |
| 5 | `CertificateTest.php` | 23 | 67 | Certificate generation, templates, verification |
| 6 | `CmsTest.php` | 15 | 57 | Pages, blog posts, media management, drafts |
| 7 | `CodingPlaygroundTest.php` | 14 | 37 | Code execution, sandbox, language selection |
| 8 | `CompetitionTest.php` | 27 | 67 | Competitions CRUD, submissions, scoring, leaderboard |
| 9 | `EmailVerificationTest.php` | 5 | 10 | Email verification flow, resend, invalid tokens |
| 10 | `FinanceTest.php` | 19 | 101 | Fee structures, invoices, payments, budgets, expenses, M-Pesa |
| 11 | `HrModuleTest.php` | 25 | 104 | Staff CRUD, departments, attendance, leave, payroll |
| 12 | `InventoryTest.php` | 21 | 94 | Items, categories, stock movements, assignments |
| 13 | `LibraryTest.php` | 18 | 86 | Resources, categories, authors, borrowing, reservations |
| 14 | `LoginHistoryTest.php` | 6 | 12 | Login event recording, history listing |
| 15 | `NotificationTest.php` | 18 | 77 | Templates, dispatch, delivery tracking, FCM tokens |
| 16 | `ParentPortalTest.php` | 17 | 68 | Parent-child linking, student progress, messaging |
| 17 | `PasswordResetTest.php` | 5 | 11 | Token generation, reset flow, invalid tokens |
| 18 | `ProfilePhotoTest.php` | 2 | 5 | Photo upload, removal |
| 19 | `PublicWebsiteTest.php` | 20 | 55 | Public pages, blog, gallery, testimonials, FAQs |
| 20 | `RoboticsTest.php` | 20 | 70 | Kits, challenges, progress tracking |
| 21 | `RolePermissionTest.php` | 12 | 30 | Roles CRUD, permission sync, guard enforcement |
| 22 | `SitemapTest.php` | 2 | 11 | XML sitemap generation, robots.txt |
| 23 | `StudentInformationSystemTest.php` | 12 | 61 | Students, guardians, admissions, attendance |
| 24 | `TwoFactorTest.php` | 10 | 33 | 2FA enable/confirm/disable, recovery codes, challenge flow |
| -- | **Unit/SanityTest.php** | 1 | 1 | Environment sanity check |
| | **Totals** | **348** | **~1,209** | |

### 2.2 How to Run

```bash
# Full suite (takes >20min due to in-memory SQLite per-test overhead)
cd backend
php artisan test

# Run a single test class
php artisan test --filter=AdminTest
php artisan test --filter=FinanceTest

# Run a single test method
php artisan test --filter=AdminTest::test_admin_can_list_activity_logs

# Verbose output
php artisan test --verbose
```

Individual test classes run in **4--30 seconds**. The full suite takes **>20 minutes** because each test method creates and tears down an in-memory SQLite database via the `RefreshDatabase` trait.

---

## 3. Frontend Tests

**No test runner is installed.** There is no Vitest, Jest, or any other testing framework in `package.json`. The following scripts are available:

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run build` | `tsc -b && vite build` | TypeScript compilation + Vite production build |
| `npm run type-check` | `tsc --noEmit` | Type-checking only, no output |
| `npm run lint` | `eslint .` | Linting with eslint |
| `npm run lint:fix` | `eslint . --fix` | Auto-fix lint issues |

**Validation approach:**

- **TypeScript compilation** (`tsc -b`) catches type errors across all source files.
- **Vite production build** confirms the entire app bundles successfully.
- **Navigation validation script** (`node frontend/scripts/validate-navigation.mjs`) checks that all navigation hrefs resolve to registered routes.

There are **zero** unit tests, **zero** component tests, and **zero** integration tests for the frontend.

---

## 4. Navigation Validation

The project includes a custom validation script at `frontend/scripts/validate-navigation.mjs`.

### What it checks

1. Every `href` in `frontend/src/config/navigation.ts` has a matching `path` in `frontend/src/router/routes.ts` (prefix match, handles dynamic segments).
2. Routes without any nav entry are flagged as orphans (informational, not failures -- detail/edit pages are expected to be orphans).
3. Public-only website routes (`/services`, `/programs`, `/blog`, etc.) and auth routes (`/login`, `/register`, etc.) are excluded from strict checking.

### How to run

```bash
cd frontend
node scripts/validate-navigation.mjs
```

**Exit code 0** = all nav items resolve. **Exit code 1** = one or more broken links found.

---

## 5. Test Infrastructure

### 5.1 phpunit.xml Configuration

Located at `backend/phpunit.xml`. Key settings:

| Setting | Value | Purpose |
|---------|-------|---------|
| `DB_CONNECTION` | `sqlite` | Use SQLite for tests |
| `DB_DATABASE` | `:memory:` | In-memory database, no disk I/O |
| `APP_ENV` | `testing` | Environment flag |
| `CACHE_STORE` | `array` | In-memory cache |
| `MAIL_MAILER` | `array` | Mail caught, not sent |
| `QUEUE_CONNECTION` | `sync` | Jobs run synchronously |
| `SESSION_DRIVER` | `array` | In-memory sessions |
| `BCRYPT_ROUNDS` | `4` | Fast hashing for tests |
| `TELESCOPE_ENABLED` | `false` | Disable Telescope overhead |

### 5.2 Test Traits

Every Feature test class uses `Illuminate\Foundation\Testing\RefreshDatabase`, which:

- Runs all pending migrations before each test.
- Wraps each test in a database transaction that is rolled back after completion.
- Ensures complete test isolation.

### 5.3 Execution Notes

- **Per-test overhead:** Each test method creates a fresh in-memory SQLite database, runs all migrations, and seeds roles/permissions as needed. This is why the full suite takes >20 minutes.
- **Factory usage:** Tests use Laravel model factories (e.g., `User::factory()->create()`) for consistent, reproducible test data.
- **Sanctum authentication:** API tests use `Sanctum::actingAs()` for authenticated requests.
- **HTTP faking:** External API calls (M-Pesa, AI completions) use `Http::fake()` to avoid real network requests.

---

## 6. Known Gaps

| Gap | Severity | Notes |
|-----|----------|-------|
| **No frontend unit/integration tests** | High | No Vitest, Jest, or testing library installed. Zero component or hook tests. |
| **No E2E tests** | High | No Cypress, Playwright, or Selenium. No browser-level flow validation. |
| **No API contract tests** | Medium | No OpenAPI spec validation or schema-level response checks. |
| **Full backend suite >20 min** | Medium | In-memory SQLite per-test overhead makes the suite impractical for rapid iteration. |
| **No CI pipeline** | High | No GitHub Actions, GitLab CI, or any automated test execution on push/PR. |
| **No frontend snapshot/visual tests** | Low | No Chromatic, Percy, or visual regression tooling. |
| **No load/performance tests** | Low | No k6, Artillery, or similar load testing. |

---

## 7. How to Run

### Backend Tests

```bash
# From project root (Docker -- requires Docker)
make test

# Local (no Docker)
cd backend
php artisan test                    # Full suite (>20min)
php artisan test --filter=AdminTest # Single class (~4-8s)
```

### Frontend Build Validation

```bash
cd frontend
npm run build       # tsc -b && vite build
npm run type-check  # tsc --noEmit
npm run lint        # eslint .
```

### Navigation Validation

```bash
cd frontend
node scripts/validate-navigation.mjs
```

---

## 8. Recommendations

| Priority | Recommendation | Effort |
|----------|----------------|--------|
| **P0** | Add Vitest for frontend unit/component testing | 1-2 days |
| **P0** | Set up CI pipeline (GitHub Actions) running backend + frontend checks on every push/PR | 1 day |
| **P1** | Add Playwright for E2E testing of critical flows (login, enrollment, payment) | 3-5 days |
| **P1** | Reduce full backend suite time -- consider switching to file-based SQLite or running tests in parallel with `--parallel` | 1 day |
| **P2** | Add API contract tests with an OpenAPI schema validator (e.g., `saloonphp/plugin-open-api`) | 2-3 days |
| **P2** | Add `@testing-library/react` for component rendering and interaction tests | 2-3 days |
| **P3** | Add visual regression testing (Chromatic or Percy) | 2 days |
| **P3** | Add load testing with k6 for critical API endpoints | 1-2 days |

---

*End of report.*
