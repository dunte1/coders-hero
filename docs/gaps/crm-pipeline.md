# Gap: CRM
**Status:** Missing
## Current state
- No leads/customers/opportunities models, tables, routes or pages. Closest proxies: FreeTrialBooking (/free-trial public route) and CMS ContactMessages.
## What's missing
- Entire pipeline domain.
## Suggested approach
- `leads` table (name, org, phone, email, source enum incl. contact_form/free_trial, status enum new/contacted/qualified/won/lost, owner_id, next_follow_up_at, notes), LeadController CRUD + status transitions + follow-up reminders via NotificationDispatcher; frontend LeadsPage kanban-lite. Auto-create leads from ContactMessage submissions.
## Dependencies
- None (can ship independently; benefits later from WhatsApp/SMS channel).
