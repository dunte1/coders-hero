# Gap: School Admin overview page
**Status:** Partial
## Current state
- Backend `GET /api/school/dashboard` -> SchoolDashboardController@summary exists (api.php L288-291) but has ZERO frontend consumers; no pages/school/ directory. Generic DashboardPage/StudentsOverviewPage serve as de-facto overviews.
## What's missing
- Dedicated School Admin dashboard wired to the endpoint (counts, attendance today, fee snapshot).
## Suggested approach
- Create `/school` page calling the orphaned endpoint; add to navigation under a school_admin-gated entry.
## Dependencies
- None.
