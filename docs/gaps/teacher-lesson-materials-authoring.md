# Gap: Teacher lesson authoring limitations
**Status:** Partial (feature F3 upload lessons)
## Current state
- Lesson notes text CRUD works; file attach backend-only (`attachFile`, no UI); LMS lesson authoring `POST /instructor/courses/{courseId}/lessons` is instructor|admin only - plain `teacher` excluded; no edit form for lesson notes.
## What's missing
- Upload/edit UI + role alignment.
## Suggested approach
- See teacher-pdf-material-upload.md (same work item from portal side).
## Dependencies
- None.
