# Coder's Hero - Novahost Shared Hosting Deployment Guide

## Prerequisites
- Novahost shared hosting account (Linux, PHP 8.1+, MySQL 5.7+)
- File Manager access or FTP client (FileZilla)
- SSH access (optional but recommended)

---

## Step 1: Upload Files

1. Log into **Novahost cPanel** → **File Manager**
2. Navigate to `public_html/` (your domain root)
3. Upload `coders-hero-production.zip`
4. **Extract** the zip in `public_html/`
5. You should now have:
   ```
   public_html/
   ├── backend/        ← Laravel files
   ├── .env            ← Environment config
   ├── docker-compose.prod.yml  ← Ignore (not needed on shared hosting)
   ├── Dockerfile.prod          ← Ignore
   └── nginx.conf               ← Ignore
   ```

---

## Step 2: Move Backend to Root

The Laravel `public/` folder should be the web root. Move its contents:

1. **Move** everything from `backend/public/*` to `public_html/`
2. **Move** the `backend/` folder contents UP to `public_html/` EXCEPT the `public/` folder

Your structure should now be:
```
public_html/
├── app/
├── bootstrap/
├── config/
├── database/
├── public/          ← (empty or delete)
├── resources/
├── routes/
├── storage/
├── vendor/          ← (will install later)
├── .env
├── index.php        ← Laravel entry point
└── .htaccess        ← Apache rewrite
```

**IMPORTANT**: The `index.php` must be at the root (`public_html/index.php`), not inside `public/`.

---

## Step 3: Fix index.php Paths

Edit `public_html/index.php` and change these lines:

**Original (Laravel default):**
```php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
```

**Change to:**
```php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
```

Also update the `storage` and `bootstrap/cache` paths in `bootstrap/app.php` if needed.

---

## Step 4: Install Composer Dependencies

### Option A: SSH (Recommended)
```bash
ssh username@your-server
cd public_html
composer install --no-dev --optimize-autoloader
```

### Option B: If SSH not available
1. On your local computer, run `composer install --no-dev --optimize-autoloader` in the backend folder
2. Upload the entire `vendor/` folder to `public_html/vendor/` via FTP
3. This is a large upload (~30MB compressed)

---

## Step 5: Configure .env

Edit `public_html/.env` in File Manager:

```env
APP_NAME="Coder's Hero ERP"
APP_ENV=production
APP_KEY=base64:ZXVocN7uydr6tkuRuRWfCpkwzWCMLR4clplyqG245Eg=
APP_DEBUG=false
APP_URL=https://codershero.duncowebsolutions.co.ke

# Database (get these from Novahost cPanel → MySQL Databases)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=duncoweb_codersherok
DB_USERNAME=duncoweb_codershero
DB_PASSWORD=PM!cDo%1ojreI36T

# Session & Cache
SESSION_DRIVER=file
SESSION_LIFETIME=120
CACHE_STORE=file
QUEUE_CONNECTION=database

# Sanctum
SANCTUM_STATEFUL_DOMAINS=codershero.duncowebsolutions.co.ke
```

**Key changes for shared hosting:**
- `DB_HOST=localhost` (not `127.0.0.1` — use whatever Novahost provides)
- `SESSION_DRIVER=file` (not Redis)
- `CACHE_STORE=file` (not Redis)
- `QUEUE_CONNECTION=database` (not Redis)

---

## Step 6: Create MySQL Database

1. Go to **cPanel → MySQL Databases**
2. If not already created:
   - Create database: `duncoweb_codersherok`
   - Create user: `duncoweb_codershero` with password `PM!cDo%1ojreI36T`
   - Add user to database with **ALL PRIVILEGES**
3. Go to **phpMyAdmin** → select your database
4. Click **Import** → choose the SQL file from `backend/database/` or run migrations via SSH

### Import via phpMyAdmin:
1. Download the migration SQL (run `php artisan schema:dump` locally first)
2. In phpMyAdmin, click **Import**
3. Select the SQL file
4. Click **Go**

### Or run migrations via SSH:
```bash
cd public_html
php artisan migrate --force
php artisan db:seed --force
```

---

## Step 7: Set Permissions

In File Manager or via SSH:
```bash
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/
chmod 775 .env
chmod 644 .htaccess
chmod 644 index.php
```

If `chmod` not available in File Manager, set via **cPanel → File Manager → Change Permissions**:
- `storage/` → 775 (or 755)
- `bootstrap/cache/` → 775 (or 755)

---

## Step 8: Create .htaccess

If not already present, create `public_html/.htaccess`:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Front Controller
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]

    # Force HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    # Remove index.php from URL
    RewriteCond %{HTTP_HOST} !^www\. [NC]
    RewriteRule ^ https://www.%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Prevent directory listing
Options -Indexes

# Protect .env
<Files ".env">
    Order Allow,Deny
    Deny from all
</Files>

# Protect sensitive files
<FilesMatch "(\.env|composer\.(json|lock)|package\.json|\.git)">
    Order Allow,Deny
    Deny from all
</FilesMatch>
```

---

## Step 9: Create Storage Symlink

Via SSH:
```bash
cd public_html
php artisan storage:link
```

Or manually create a symlink:
- Create `public_html/storage` folder
- Point it to `storage/app/public`

---

## Step 10: Run Setup Commands

Via SSH (or cPanel Terminal if available):
```bash
cd public_html

# Generate app key (if not using the one from .env)
php artisan key:generate

# Cache configs for performance
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Create storage symlink
php artisan storage:link
```

---

## Step 11: Create Queue Table

```bash
cd public_html
php artisan queue:table
php artisan migrate --force
```

Or run all migrations:
```bash
php artisan migrate --force
php artisan db:seed --force
```

---

## Step 12: Test the Site

1. Visit `https://codershero.duncowebsolutions.co.ke`
2. You should see the login page
3. Login with:
   - **Email**: `admin@codershero.com`
   - **Password**: `password`

---

## Troubleshooting

### 500 Internal Server Error
```bash
# Check storage permissions
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### Database Connection Error
- Verify `DB_HOST` in `.env` (Novahost might use `localhost` or a specific host)
- Check database credentials in cPanel → MySQL Databases

### Blank Page / White Screen
- Set `APP_DEBUG=true` temporarily in `.env` to see errors
- Check `storage/logs/laravel.log`

### Routes Not Working (404 on all pages)
- Ensure `.htaccess` is in `public_html/` root
- Check that `mod_rewrite` is enabled (contact Novahost support)

### Assets Not Loading (CSS/JS 404)
- Verify `public/build/` folder exists and contains `assets/`
- Check `APP_URL` in `.env` matches your domain

---

## Cron Job (Optional)

Set up Laravel scheduler in cPanel → **Cron Jobs**:
```
* * * * * cd /home/username/public_html && php artisan schedule:run >> /dev/null 2>&1
```

---

## File Structure on Server

```
public_html/                    ← Web root
├── .env                        ← Environment config (HIDDEN)
├── .htaccess                   ← Apache rules
├── index.php                   ← Laravel entry point
├── app/                        ← Laravel app code
├── bootstrap/                  ← Bootstrap + cache
├── config/                     ← Configuration
├── database/                   ← Migrations + Seeders
├── public/build/assets/        ← Frontend React build
├── resources/                  ← Views
├── routes/                     ← API routes
├── storage/                    ← Logs, cache, uploads
├── vendor/                     ← Composer dependencies
├── docker-compose.prod.yml     ← Ignore (Docker only)
├── Dockerfile.prod             ← Ignore (Docker only)
├── nginx.conf                  ← Ignore (Docker only)
└── DEPLOYMENT.md               ← This guide
```
