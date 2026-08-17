# SETTINGS_AUDIT.md

Coder's Hero ERP & LMS -- Settings System Audit

---

## 1. Overview

### Storage Mechanism

All site settings are stored in a single `site_settings` table using a key-value pattern.

**Table: `site_settings`**

| Column      | Type              | Notes                                   |
|-------------|-------------------|-----------------------------------------|
| id          | bigint (PK)       | Auto-increment                          |
| key         | string (unique)   | Dot-notation, e.g. `general.site_name`  |
| value       | text (nullable)   | Always stored as string                 |
| group       | string            | Defaults to `general`                   |
| is_public   | boolean           | Defaults to `true`                      |
| sort_order  | unsigned int      | Defaults to `0`                         |
| created_at  | timestamp         |                                         |
| updated_at  | timestamp         |                                         |

Values are always strings. Booleans are stored as `"0"` / `"1"`. There is no type column; the frontend field definitions in `settingsFields.ts` drive rendering.

### Access Control

- Backend route: `GET /admin/site/settings` and `PUT /admin/site/settings`
- Middleware: `auth:sanctum`, role check for `admin` or `super_admin`
- Frontend gate: `SettingsPage.tsx` filters the admin tile grid based on `user.role.name`

---

## 2. Settings Groups

The system defines **10 admin-facing settings groups** plus **3 additional seed-only groups** (social, seo, chat) that are not exposed through the settings form pages.

### Admin Groups (exposed in SettingsNav and SettingsForm)

| # | Group           | Slug            | Field Count | Field Types Used                          |
|---|-----------------|-----------------|-------------|-------------------------------------------|
| 1 | General         | general         | 7           | text, textarea                            |
| 2 | Branding        | branding        | 7           | text, color, select                       |
| 3 | Localization    | localization    | 6           | select                                    |
| 4 | Academic        | academic        | 7           | text, number, select, switch              |
| 5 | Notifications   | notifications   | 6           | switch, number, text                      |
| 6 | Integrations    | integrations    | 12          | text, number, select, switch, password    |
| 7 | Security        | security        | 6           | switch, number                            |
| 8 | Storage         | storage         | 7           | select, text, number, password            |
| 9 | Backup          | backup          | 4           | switch, select, number                    |
| 10| System          | system          | 6           | switch, select, text                      |

**Total admin-exposed fields: 68**

### Seed-Only Groups (not in SettingsNav)

| Group     | Seeded Fields                        | Notes                                    |
|-----------|--------------------------------------|------------------------------------------|
| social    | facebook, instagram, youtube, linkedin, tiktok, whatsapp | Used by website Footer/Contact pages |
| seo       | meta_title, meta_description, og_image | Used by HomePage `<head>` and OG tags   |
| analytics | gtag_id                              | Google Analytics / gtag                  |
| chat      | widget_title, widget_subtitle, welcome_message, primary_color, enabled | Chat widget configuration |

---

## 3. Field Inventory

### General

| Key                      | Label          | Type     | Default                                        |
|--------------------------|----------------|----------|-------------------------------------------------|
| general.site_name        | Site name      | text     | Coder's Hero                                    |
| general.tagline          | Tagline        | text     | Where young minds code, build & innovate        |
| general.description      | Description    | textarea | (empty)                                         |
| general.phone            | Phone          | text     | (empty)                                         |
| general.email            | Contact email  | text     | (empty)                                         |
| general.address          | Address        | textarea | (empty)                                         |
| general.hours            | Operating hours| text     | (empty)                                         |

### Branding

| Key                        | Label          | Type   | Default      |
|----------------------------|----------------|--------|--------------|
| branding.logo              | Logo URL       | text   | (empty)      |
| branding.favicon           | Favicon URL    | text   | (empty)      |
| branding.primary_color     | Primary color  | color  | #4F46E5      |
| branding.secondary_color   | Secondary color| color  | #0F766E      |
| branding.accent_color      | Accent color   | color  | #F59E0B      |
| branding.theme_mode        | Theme mode     | select | light        |
| branding.font_family       | Font family    | select | Inter        |

### Localization

| Key                          | Label           | Type   | Default       |
|------------------------------|-----------------|--------|---------------|
| localization.country         | Country         | select | Kenya         |
| localization.currency        | Currency        | select | KES           |
| localization.timezone        | Timezone        | select | Africa/Nairobi|
| localization.date_format     | Date format     | select | DD/MM/YYYY    |
| localization.time_format     | Time format     | select | 12-hour       |
| localization.language        | Default language| select | English       |

### Academic

| Key                                      | Label                              | Type   | Default |
|------------------------------------------|------------------------------------|--------|---------|
| academic.term_label                      | Term label                         | text   | Term    |
| academic.year_label                      | Academic year label                | text   | Academic Year |
| academic.grading_scheme                  | Grading scheme                     | select | Percentage |
| academic.passing_grade                   | Passing grade (%)                  | number | 50      |
| academic.attendance_required_days        | Required attendance days per term  | number | 80      |
| academic.report_card_period              | Report card period                 | select | Termly  |
| academic.auto_promote                    | Auto-promote students              | switch | 0       |

### Notifications

| Key                                  | Label                              | Type   | Default |
|--------------------------------------|------------------------------------|--------|---------|
| notifications.email_enabled          | Email notifications enabled        | switch | 1       |
| notifications.sms_enabled            | SMS notifications enabled          | switch | 0       |
| notifications.push_enabled           | Push notifications enabled         | switch | 1       |
| notifications.announcement_email     | Email on new announcements         | switch | 1       |
| notifications.reminder_days          | Days before due date reminders     | number | 1       |
| notifications.sender_email           | Sender email address               | text   | (empty) |

### Integrations

| Key                                      | Label                         | Type     | Default |
|------------------------------------------|-------------------------------|----------|---------|
| integrations.smtp_host                   | SMTP host                     | text     | (empty) |
| integrations.smtp_port                   | SMTP port                     | number   | 587     |
| integrations.smtp_user                   | SMTP username                 | text     | (empty) |
| integrations.smtp_password               | SMTP password                 | password | (empty) |
| integrations.smtp_encryption             | SMTP encryption               | select   | tls     |
| integrations.mpesa_enabled               | M-Pesa enabled                | switch   | 0       |
| integrations.mpesa_consumer_key          | M-Pesa consumer key           | text     | (empty) |
| integrations.mpesa_consumer_secret       | M-Pesa consumer secret        | password | (empty) |
| integrations.africas_talking_enabled     | Africa's Talking enabled      | switch   | 0       |
| integrations.africas_talking_api_key     | Africa's Talking API key      | password | (empty) |
| integrations.openai_api_key              | OpenAI API key                | password | (empty) |
| integrations.firebase_web_key            | Firebase web API key          | password | (empty) |

### Security

| Key                              | Label                                          | Type   | Default |
|----------------------------------|------------------------------------------------|--------|---------|
| security.registration_enabled    | Public registration enabled                     | switch | 1       |
| security.force_two_factor        | Require two-factor authentication for admins    | switch | 0       |
| security.session_timeout_minutes | Session timeout (minutes)                       | number | 30      |
| security.password_min_length     | Minimum password length                         | number | 8       |
| security.max_login_attempts      | Max login attempts                              | number | 5       |
| security.lockout_minutes         | Lockout duration (minutes)                      | number | 15      |

### Storage

| Key                              | Label                  | Type     | Default                   |
|----------------------------------|------------------------|----------|---------------------------|
| storage.driver                   | Storage driver         | select   | local                     |
| storage.s3_bucket                | Bucket name            | text     | (empty)                   |
| storage.s3_region                | Region                 | text     | us-east-1                 |
| storage.s3_access_key            | Access key             | text     | (empty)                   |
| storage.s3_secret_key            | Secret key             | password | (empty)                   |
| storage.upload_max_mb            | Max upload size (MB)   | number   | 10                        |
| storage.allowed_extensions       | Allowed file extensions| text     | jpg,png,pdf,doc,docx,...   |

### Backup

| Key                              | Label                       | Type   | Default |
|----------------------------------|-----------------------------|--------|---------|
| backup.automatic_enabled         | Automatic backups enabled   | switch | 0       |
| backup.schedule                  | Backup schedule             | select | weekly  |
| backup.retention_days            | Retention period (days)     | number | 30      |
| backup.include_files             | Include uploaded files      | switch | 1       |

### System

| Key                              | Label            | Type   | Default     |
|----------------------------------|------------------|--------|-------------|
| system.maintenance_mode          | Maintenance mode | switch | 0           |
| system.debug_mode                | Debug mode       | switch | 0           |
| system.environment               | Environment      | select | production  |
| system.app_url                   | Application URL  | text   | (empty)     |
| system.support_email             | Support email    | text   | (empty)     |
| system.log_level                 | Log level        | select | info        |

---

## 4. Backend API

### GET /admin/site/settings

Returns all settings grouped and sorted.

```json
{
  "success": true,
  "data": {
    "settings": [
      { "id": 1, "key": "general.site_name", "value": "Coder's Hero", "group": "general", "is_public": true, "sort_order": 0 }
    ],
    "groups": ["general", "branding", "localization"]
  }
}
```

### PUT /admin/site/settings

Accepts an array of setting objects. Uses `updateOrCreate` keyed on `key`.

```json
{
  "settings": [
    { "key": "general.site_name", "value": "New Name", "group": "general" }
  ]
}
```

**Validation rules (backend):**

| Parameter          | Rules                        |
|--------------------|------------------------------|
| settings           | required, array              |
| settings.*.key     | required, string, max:255    |
| settings.*.value   | nullable, string, max:5000   |
| settings.*.group   | sometimes, string, max:50    |
| settings.*.is_public | sometimes, boolean          |

**Note:** There are no per-field validation rules. Any string up to 5000 characters is accepted for any key. No type coercion, range checks, or format validation exists server-side.

### Authentication

- `auth:sanctum` middleware
- Role middleware restricts to `admin` or `super_admin`
- The `SiteSetting` model has a `scopePublic` query scope but it is not used by the controller -- the controller returns all settings regardless of `is_public`.

---

## 5. Frontend Architecture

### Schema-Driven Form System

**`SettingsField` interface** (`SettingsForm.tsx:18-27`):

```typescript
interface SettingsField {
  key: string;          // dot-notation key, e.g. "general.site_name"
  label: string;
  description?: string;
  type?: 'text' | 'textarea' | 'number' | 'switch' | 'select' | 'color' | 'password';
  options?: string[];
  placeholder?: string;
  default?: string;
  isPublic?: boolean;
}
```

**`settingsFields.ts`** defines 10 exported arrays (one per group), each containing `SettingsField[]`.

### Component Hierarchy

```
SettingsPage.tsx                     -- Hub page (tile grid + appearance/notifications/account sections)
  |
  +-- SettingsGroupPage.tsx          -- Per-group page wrapper
        |
        +-- SettingsNav.tsx          -- Sidebar navigation (10 admin groups + Profile link)
        +-- SettingsLayout.tsx       -- Flex layout with sidebar + content area
              |
              +-- SettingsForm.tsx   -- Renders fields from SettingsField[] array
```

### Data Flow

1. `useSiteSettings()` fetches `GET /admin/site/settings` via React Query (`queryKey: ['site-settings']`)
2. `SettingsForm` initializes local state from fetched values, falling back to `field.default`
3. On save, `useUpdateSiteSettings()` calls `PUT /admin/site/settings` and invalidates the query cache
4. `useSettingsGroup(group)` filters the full settings array by group name

### SettingsNav

Renders a sidebar with `NavLink` items for each group. The `SettingsLayout` wrapper composes the sidebar with a `PageHeader` and the form content.

---

## 6. Access Control

### Admin-Only (site settings)

The following items are only visible to users with `admin` or `super_admin` roles:

- All 10 settings group tiles on the hub page
- All `SettingsGroupPage` routes (`/settings/general`, `/settings/branding`, etc.)
- The `SettingsNav` sidebar links

The gate is applied in two places:

1. **`SettingsPage.tsx:30`** -- `isAdmin` check filters `visibleSections`
2. **`SiteSettingsController.php`** -- Route middleware enforces `role:admin|super_admin`

### Available to All Authenticated Users

- **Appearance** section on hub page (theme toggle: light/dark/system)
- **Notifications** section on hub page (toast toggle)
- **Profile** -- personal details editing
- **Two-Factor Authentication** -- per-user 2FA setup
- **Login History** -- per-user authentication events

---

## 7. Seeded Defaults

### Pre-Seeded via `SiteSettingsSeeder`

| Group     | Key                      | Value                                            |
|-----------|--------------------------|--------------------------------------------------|
| general   | site_name                | Coder's Hero                                     |
| general   | tagline                  | Where young minds code, build & innovate         |
| general   | description              | Coder's Hero is a modern learning centre...      |
| general   | phone                    | +1 (555) 123-4567                                |
| general   | email                    | hello@codershero.com                             |
| general   | address                  | 123 Innovation Drive, Tech City                  |
| general   | hours                    | Mon - Fri: 3pm - 8pm ... Sat: 9am - 2pm         |
| social    | facebook                 | https://facebook.com/codershero                  |
| social    | instagram                | https://instagram.com/codershero                 |
| social    | youtube                  | https://youtube.com/@codershero                  |
| social    | linkedin                 | https://linkedin.com/company/codershero          |
| social    | tiktok                   | https://tiktok.com/@codershero                   |
| social    | whatsapp                 | +15551234567                                     |
| seo       | meta_title               | Coder's Hero -- Coding, Robotics & STEM...      |
| seo       | meta_description         | Hands-on coding, robotics and STEM programs...  |
| seo       | og_image                 | (empty)                                          |
| analytics | gtag_id                  | (empty)                                          |
| chat      | widget_title             | Hi there!                                        |
| chat      | widget_subtitle          | Ask us anything about Coder's Hero               |
| chat      | welcome_message          | Hello! I'm the Coder's Hero assistant...         |
| chat      | primary_color            | #4F46E5                                          |
| chat      | enabled                  | 1                                                |

### Not Pre-Seeded (requires manual configuration)

- All **branding** fields except color defaults (logo_url, favicon_url)
- All **localization** fields except frontend defaults (timezone defaults to Africa/Nairobi in settingsFields.ts)
- All **academic** fields (grading scheme, passing grade, etc.)
- All **notifications** fields (sender email, etc.)
- All **integrations** fields (SMTP, M-Pesa, API keys)
- All **security** fields (session timeout, password rules)
- All **storage** fields (S3 credentials, allowed extensions)
- All **backup** fields
- All **system** fields (app_url, support_email)

---

## 8. Known Gaps

### 8.1 M-Pesa Consumer Key Shown in Plaintext

In `settingsFields.ts:58`, `mpesa_consumer_key` is defined as `type: 'text'`, not `type: 'password'`. The consumer secret on line 59 is correctly typed as `'password'`. This means the M-Pesa consumer key is visible in plaintext in the admin form.

**Affected field:** `integrations.mpesa_consumer_key`

### 8.2 No Server-Side Per-Field Validation

The `SiteSettingsController::update()` method validates only the shape of the payload (`key` is a string, `value` is a string). There are no rules for:
- Numeric ranges on `session_timeout_minutes`, `max_login_attempts`, `password_min_length`
- URL format on `logo_url`, `favicon_url`, `app_url`
- Email format on `sender_email`, `support_email`
- Enum validation on `storage_driver`, `backup_schedule`, `log_level`

A user could save `"banana"` as `session_timeout_minutes` and the backend would accept it.

### 8.3 No Unsaved-Changes Warning

`SettingsForm.tsx:46` initializes local state with `useState`, but there is no `beforeunload` handler or navigation guard. If an admin edits fields and navigates away, changes are silently lost.

### 8.4 `is_public` Column Not Used Effectively

The `site_settings` table has an `is_public` boolean column and the `SiteSetting` model exposes a `scopePublic` query scope. However, the `SiteSettingsController::index()` endpoint returns all settings regardless of `is_public`. There is no separate public endpoint that strips sensitive fields (e.g., SMTP credentials, API keys).

### 8.5 Seeder Keys vs Form Keys Mismatch

The seeder uses keys like `general.site_name` while the form in `settingsFields.ts` also uses `general.site_name` -- these match. However, the seeder seeds groups (`social`, `seo`, `analytics`, `chat`) that have **no corresponding SettingsForm pages** in `settingsFields.ts`. These are instead managed through `SiteContentPage.tsx` and `ChatWidgetSettingsPage.tsx`, creating two separate management paths for settings.

### 8.6 No Reset / Undo

There is no way to reset a group to defaults or undo a save. The "Save Changes" button writes immediately with no confirmation dialog.

---

## 9. Recommendations

### 9.1 Password Masking for Sensitive Fields

Change `integrations.mpesa_consumer_key` from `type: 'text'` to `type: 'password'` in `settingsFields.ts:58`. Audit all other integration fields to ensure sensitive values use `type: 'password'`.

### 9.2 Add Server-Side Validation Rules

Define a validation map in the controller or a Form Request class that validates each key against expected rules:

```php
$rules = [
    'security.session_timeout_minutes' => ['nullable', 'integer', 'min:5', 'max:1440'],
    'security.password_min_length' => ['nullable', 'integer', 'min:6', 'max:128'],
    'storage.upload_max_mb' => ['nullable', 'integer', 'min:1', 'max:512'],
    // ...
];
```

### 9.3 Add Unsaved-Changes Guard

Implement a `beforeunload` event listener in `SettingsForm.tsx` when the form state differs from the fetched values. For SPA navigation, use a route blocker via `useBlocker` from `react-router-dom`.

### 9.4 Create a Public Settings Endpoint

Add a separate `GET /api/settings/public` endpoint that returns only settings where `is_public = true`. This prevents leaking SMTP credentials, API keys, and other secrets to unauthenticated or low-privilege consumers.

### 9.5 Add Confirmation and Undo

- Show a confirmation dialog before saving destructive changes (maintenance_mode, debug_mode)
- Consider an undo toast with a short timer (5s) that reverts the last save

### 9.6 Consolidate Settings Management Paths

The social/seo/analytics/chat groups are managed through `SiteContentPage.tsx` and `ChatWidgetSettingsPage.tsx` rather than through the `SettingsForm` schema-driven system. Consider migrating these to use the same `SettingsGroupPage` pattern for consistency, or document the split clearly.
