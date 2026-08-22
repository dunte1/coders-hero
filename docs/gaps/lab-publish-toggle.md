# Gap: Published/unpublished toggle
**Status:** Missing
## Current state
- No is_published/is_public column on any project table (grep across migrations matched only courses/blog/announcements/etc.). Robotics approval sets workflow status, not publication.
## What's missing
- Flag, toggle endpoint (owner), default unpublished, listing filters.
## Suggested approach
- `is_published boolean default false`, `published_at timestamp nullable`; `POST /my-projects/{id}/publish|unpublish`; gate marketplace queries on it.
## Dependencies
- student_projects foundation model; Innovation Marketplace consumes it.
