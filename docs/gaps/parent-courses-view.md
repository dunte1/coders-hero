# Gap: Parent views child courses
**Status:** Partial
## Current state
- Parent portal has summary/children/attendance/report-cards/progress/fees/payments/chat/appointments/notifications routes (`api.php` parent prefix). No `/parent/courses`; child course info surfaces only indirectly via progress payload.
## What's missing
- Dedicated child-course listing endpoint + page + nav entry.
## Suggested approach
- `GET /parent/courses` reusing `ParentPortalService::accessibleStudentIds()` scoping over enrollments; simple list page under Parents group.
## Dependencies
- None (scoping service exists).
