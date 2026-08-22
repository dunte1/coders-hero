# Gap: Parent views child projects
**Status:** Missing
## Current state
- No /parent/projects endpoint/page/nav; robotics project index restricts non-staff to own/team data.
## What's missing
- Child-scoped project feed incl. scores/feedback.
## Suggested approach
- After student_projects foundation: `GET /parent/projects` scoped via accessibleStudentIds; read-only cards showing title, score, latest feedback, published artifacts only.
## Dependencies
- student_projects foundation (Phase 1).
