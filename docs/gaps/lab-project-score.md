# Gap: Project-level score
**Status:** Partial
## Current state
- Per-submission score exists in robotics: `score` int 0-100 validated/persisted/displayed. Not a project-level aggregate; robotics-only.
## What's missing
- Final/aggregate project score surfaced on the project itself.
## Suggested approach
- On review approval, roll latest approved submission score onto `student_projects.final_score`; display prominently.
## Dependencies
- student_projects foundation model.
