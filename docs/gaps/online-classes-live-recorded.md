# Gap: Online classes (live or recorded)
**Status:** Partial
## Current state
- Recorded: lessons support `video_url` + type enum incl. video (`2024_01_01_*_create_lessons_table`), rendered in `LmsCoursePlayerPage.tsx`. URL-based only.
- Live: NO conferencing integration at all (grep zoom/jitsi/agora/meet/live_class across backend+frontend = zero real hits). No class-session scheduling with meeting links.
## What's missing
- Live-class entity (schedule per class), meeting link generation/hosting integration, join UI, optional recording capture.
## Suggested approach
- Phase A: `class_sessions` table (class_id, topic, starts_at, meeting_url, status) + teacher CRUD + student "Join" button (external links first - Google Meet/Zoom URLs pasted by teacher). Phase B: integrate Jitsi Meet (iframe, zero-cost) or Zoom SDK server-to-server OAuth for auto-created meetings.
## Dependencies
- student classes visibility (dash-nav-flow-my-classes.md).
