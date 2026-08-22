# Gap: Student nav flow - My Classes
**Status:** Partial (flow overall)
## Current state
- Student sidebar (`frontend/src/config/navigation.ts`): Dashboard, Learning/LMS (My Courses, My Assignments, Quizzes, Forum, Bookmarks, AI Tutor), Coding Lab (Playground/Challenges/Leaderboard), Robotics Lab (Projects...), Competitions, Certificates.
## What's missing
- No student-facing "My Classes" page (classes are teacher/admin-scoped: `/teacher/classes`); no "My Lessons" distinct entry (lessons reachable only inside course player).
## Suggested approach
- Add `GET /student/classes` (enrolled classes with teachers/schedule) + `/student/classes` page; add "My Lessons" = continue-learning list from enrollment progress; wire both into Learning/LMS group.
## Dependencies
- Uses existing enrollments + classes tables only.
