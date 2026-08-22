# Gap: Teacher feedback visibility
**Status:** Partial
## Current state
- Write path works in Robotics Lab: `feedback` column, `ReviewRoboticsSubmissionRequest`, `RoboticsProjectService::review()` persists with reviewer/timestamp, staff dialog exists.
## What's missing
- Feedback is NEVER rendered back to the student (`RoboticsProjectsPage.tsx` submission list omits it); no feedback outside robotics.
## Suggested approach
- Show feedback + score inline per submission version (trivial UI addition); carry same field into student_projects reviews.
## Dependencies
- student_projects foundation (for generalization).
