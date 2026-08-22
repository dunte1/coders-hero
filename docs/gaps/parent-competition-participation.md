# Gap: Parent views competition participation
**Status:** Missing
## Current state
- Competitions nav excludes parent; no /parent/competitions; generic my-teams resolves the REQUESTING user's own student profile, so guardians get nothing.
## What's missing
- Child-scoped teams/participations/results endpoint + page.
## Suggested approach
- `GET /parent/competitions` resolving children via accessibleStudentIds then their team memberships; read-only page.
## Dependencies
- None (robotics/competition tables exist).
