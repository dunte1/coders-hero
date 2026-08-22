# Gap: Expense approvals
**Status:** Partial
## Current state
- Expenses CRUD complete (finance/expenses, category rollup report, ExpensesPage) but schema lacks status/submitted_by/approved_by and there are no approve/reject endpoints.
## What's missing
- Approval workflow (submit -> approve/reject) + audit fields.
## Suggested approach
- Migration adding workflow columns; controller actions mirroring RefundController approve/reject; status badges + approve buttons in ExpensesPage (permission-manage_expenses approvers only).
## Dependencies
- None.
