# Gap: Student Progress page is orphaned
**Status:** Partial (flow overall)
## Current state
- `/lms/analytics` (StudentAnalyticsPage) works (routes + API) but has ZERO inbound links/navigation entries (also `/lms/achievements`, `/lms/courses/:id/player` orphaned - agent audit cross-notes).
## What's missing
- Nav entry + dashboard widget links so the connected flow reaches Progress.
## Suggested approach
- Add `{ label: 'My Progress', href: '/lms/analytics' }` to Learning/LMS children for students; link achievements from dashboard.
## Dependencies
- None.
