# Gap: Parent views child assignments
**Status:** Missing
## Current state
- Assignment routes are hard `role:student` (api.php L601-607); pages gated roles:['student'].
## What's missing
- Endpoint + page + nav for child assignments (status: submitted/graded/missing).
## Suggested approach
- `GET /parent/assignments?child=` joining assignment_submissions via accessibleStudentIds; read-only page mirroring StudentAssignmentsPage minus submit actions.
## Dependencies
- None.
