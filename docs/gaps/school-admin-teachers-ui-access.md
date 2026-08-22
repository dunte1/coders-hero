# Gap: school_admin cannot manage teachers via UI
**Status:** Partial
## Current state
- Backend `/admin/users` CRUD includes school_admin in role middleware and PermissionSeeder grants view/create/update_users.
- Frontend gates UsersPage roles:['admin'] only, EmployeesPage ['admin','manager']; ADMIN_ROLES nav excludes school_admin.
## What's missing
- Route/nav/page access for school_admin to create teacher accounts (and a role filter for teacher listings).
## Suggested approach
- Add 'school_admin' to users routes meta + ADMIN_ROLES; add role=teacher pre-filter param on UsersPage when viewer is school_admin.
## Dependencies
- None.
