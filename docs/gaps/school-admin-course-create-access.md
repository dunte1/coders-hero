# Gap: school_admin blocked from course create/edit UI
**Status:** Partial
## Current state
- Backend admin courses CRUD + publish/archive/duplicate include school_admin; permissions granted (create/update/publish_courses). CoursesPage shows Create button unconditionally but /courses/create + edit routes are roles:['admin','instructor'] - school_admin hits guard.
## What's missing
- Route meta inclusion (+ optionally hide button per-role instead of unconditional render).
## Suggested approach
- Add 'school_admin' to CourseCreatePage/CourseEditPage route roles; gate the Create button by permission.
## Dependencies
- None.
