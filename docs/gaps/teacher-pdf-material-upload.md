# Gap: Teacher PDF/material upload UI
**Status:** Partial
## Current state
- Backend complete: `POST /teacher/lesson-notes/{id}/files` -> `TeacherLessonNoteController::attachFile` (`file|required|file|max:10240`, api.php L758).
- Frontend gap: `TeacherLessonNotesPage.tsx` creates text-only notes; no file input; `teacherApi.ts` lacks attachFile method. Also `POST /instructor/courses/{courseId}/lessons` excludes role `teacher`.
## What's missing
- File picker in lesson-note form calling attachFile; list/download of attached materials; allow `teacher` in instructor lesson-authoring route or dedicated teacher path.
## Suggested approach
- Add `attachFile` to teacherApi + input in TeacherLessonNotesPage; widen LMS lesson authoring middleware to include `teacher`.
## Dependencies
- None.
