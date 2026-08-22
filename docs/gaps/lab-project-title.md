# Gap: Innovation Lab - Project Title (dedicated module)
**Status:** Partial
## Current state
- Title exists on `robotics_projects.title` (migration `2026_08_13_000007`) with form field in `RoboticsProjectsPage.tsx`; generic staff-only `projects.name` also exists.
## What's missing
- A dedicated student "My Projects" module open to ALL project types (not just robotics).
## Suggested approach
- New `student_projects` table (see lab-project-module foundation doc) with `title` column; CRUD controller under `role:student` scoped to owner; page under `/my-projects`.
## Dependencies
- Foundation: student_projects model (docs/gaps/lab-project-foundation.md).
