# Gap: Generated/downloadable reports have no frontend
**Status:** Partial (affects E-S8/F9 notes)
## Current state
- Backend: `GET/POST /admin/reports/generated` + `GET /reports/download/{id}` (ReportDownloadController + MonthlyReportService) implemented; HR CSV/PDF exports exist and ARE wired in HrReportsPage.
## What's missing
- Admin ReportsPage section listing generated reports with download buttons.
## Suggested approach
- Add reportsApi methods + table card in ReportsPage calling existing endpoints.
## Dependencies
- None.
