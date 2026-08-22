# Gap: Parent sees teacher comments
**Status:** Partial
## Current state
- Report cards carry `teacher_notes` shown to parents (`ParentReportCardDetailPage.tsx` L119-122).
- Parent-teacher chat implemented end-to-end: ChatController + /chat routes + ChatPage + chatApi.
## What's missing
- Dedicated comments feed; AND a blocking role bug: backend chat middleware is `role:parent|instructor|admin|super_admin` (api.php L666) which EXCLUDES `teacher`, and `ParentController::teachers()` lists only `role('instructor')` users - so parents can never reach teachers holding the `teacher` role even though frontend route permits it.
## Suggested approach
- Fix middleware to `role:parent|teacher|instructor|admin|super_admin`; fix teachers() to list both roles (or merge role display names). Optional later: comments timeline per child aggregating gradebook feedback + report card notes.
## Dependencies
- None (bug fix).
