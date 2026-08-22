# Gap: Description field (Innovation Lab scope)
**Status:** Partial
## Current state
- `description` text columns exist on `projects` (staff PM) and `robotics_projects` (robotics only); validated + editable in both forms.
## What's missing
- Availability in a general student projects module.
## Suggested approach
- Include `description` on `student_projects`; reuse Textarea patterns from `RoboticsProjectsPage.tsx`.
## Dependencies
- student_projects foundation model.
