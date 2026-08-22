# Gap: Source code upload/link
**Status:** Partial
## Current state
- Links done in Robotics Lab only: `repo_url`/`demo_url` columns + validation + inputs (`RoboticsProjectsPage.tsx` L283-284). No source-code file upload anywhere.
## What's missing
- Zip/repo-file upload with size cap + download endpoint (auth-scoped).
## Suggested approach
- Add `source_path` column; accept `file|mimes:zip|max:51200`; store via `storeAs('projects/source')`; signed download route for staff/owner. Keep repo/demo URL fields alongside.
## Dependencies
- student_projects foundation model.
