# Gap: Student Portfolio
**Status:** Missing
## Current state
- No portfolio concept anywhere (no routes/pages/models mentioning portfolio for students). Closest: certificates list page + robotics projects list.
## What's missing
- Aggregated public/shareable student profile: projects (published), certificates, competitions, completed courses.
## Suggested approach
- Build on Phase 1 student_projects + publication flag: `GET /students/{id}/portfolio` (public route) rendering projects+certificates+badges; shareable link. Defer until Innovation Lab foundation lands.
## Dependencies
- lab-publish-toggle; certificates model (exists).
