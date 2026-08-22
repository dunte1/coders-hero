# Gap: Parent sees child certificates
**Status:** Partial
## Current state
- `GET /certificates` is any-authenticated and returns the CALLER'S own certificates; parent can hit it via direct URL but nav Certificates group excludes parent, and it shows parent's certs, not the child's.
## What's missing
- Child-scoped endpoint + nav entry.
## Suggested approach
- `GET /parent/certificates` via accessibleStudentIds; reuse MyCertificatesPage presentation; add to Parents nav group.
## Dependencies
- None.
