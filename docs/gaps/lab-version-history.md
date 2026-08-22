# Gap: Version history (robust)
**Status:** Partial
## Current state
- Rudimentary: multiple `robotics_project_submissions` rows act as versions ("Submit new version" dialog with change description; chronological list). Generic Project logs changes via spatie HasActivity but only visible in admin activity log.
## What's missing
- Version labels/diff view/restore; any versioning for non-robotics projects.
## Suggested approach
- Keep submission-as-version model for student_projects; add `version_label`, list UI with compare-on-demand later. Low priority vs other gaps.
## Dependencies
- student_projects foundation model.
