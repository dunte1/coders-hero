# Gap: Announcements inside Parent Portal
**Status:** Partial
## Current state
- Global `/announcements` pages are ungated and COMMUNICATION_ROLES includes parent, so reachable via main nav. But nothing under parent prefix; `/parent/notifications` returns Notification records, not announcements.
## What's missing
- Portal-integrated announcements (optionally audience-targeted to parents).
## Suggested approach
- Add `audience` filter support to AnnouncementController (parents) + embed recent announcements card on Parent dashboard; keep global page as-is.
## Dependencies
- None.
