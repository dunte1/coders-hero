# Gap: Innovation Marketplace (public project hub)
**Status:** Missing
## Current state
- Zero marketplace code (grep across codebases). All project routes auth-scoped; students can only see own/team robotics projects; public unauthenticated group serves CMS content only. HomePage gallery shows CMS photos, not student projects.
## What's missing
- Public browsing of PUBLISHED student projects (title, problem, media, tech, author first-name/school), moderation/approval step, detail pages.
## Suggested approach
- Depends on student_projects + is_published. Public routes: `GET /public/projects` (published only), `GET /public/projects/{slug}`; staff approval gate (`is_featured`/moderation status). Frontend public MarketplacePage + HomePage showcase strip reusing WebsiteController patterns.
## Dependencies
- Phase 1 student_projects foundation + lab-publish-toggle.
