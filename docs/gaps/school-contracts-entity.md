# Gap: Contract management for schools
**Status:** Partial
## Current state
- PartnerSchools directory complete end-to-end (CRUD, partnership_type enum, notes) but holds no commercial contract data. EmployeeContract exists but is HR-only.
## What's missing
- Contract entity: contract_no, value, start/end dates, renewal date, signed-document storage, status/expiry alerts.
## Suggested approach
- `school_contracts` table FK partner_school_id + document upload (reuse EmployeeDocument patterns); CRUD page tab inside PartnerSchoolsPage; expiry reminder job via NotificationDispatcher.
## Dependencies
- None.
