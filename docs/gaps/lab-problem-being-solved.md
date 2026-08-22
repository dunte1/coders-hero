# Gap: Problem-being-solved field
**Status:** Missing
## Current state
- No `problem_statement`/similar column in any project migration; no form field anywhere.
## What's missing
- Column + validation + form input + display.
## Suggested approach
- `problem_statement ->text()->nullable()` on new `student_projects`; textarea in create/edit form; render on detail card.
## Dependencies
- student_projects foundation model.
