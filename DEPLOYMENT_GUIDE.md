# Coder's Hero — Deployment Guide (Shared Hosting / cPanel)

## Prerequisites
- PHP 8.3+ (check: `php -v`)
- MySQL 8.0+ (check: `mysql --version`)
- Composer (check: `composer -V`)
- Node.js 18+ (for frontend build if needed)
- SSH/Terminal access via cPanel
- Domain pointed to hosting

---

## Step 1: Upload Files

### Option A: cPanel File Manager
1. Login to cPanel → **File Manager**
2. Navigate to `public_html/` (or your subdomain folder)
3. Upload `coders-hero-production.zip`
4. Right-click → **Extract** → Extract to `public_html/`

### Option B: Terminal (SSH)
```bash
cd ~/public_html
# Upload via SCP from your local machine
scp production/coders-hero-production.zip user@yourserver:~/public_html/

# Or download directly on server
wget https://github.com/dunte1/coders-hero/raw/main/production/coders-hero-production.zip

# Extract
unzip coders-hero-production.zip
rm coders-hero-production.zip
```

---

## Step 2: Configure Environment

```bash
cd ~/public_html

# Create .env from example
cp .env.example .env

# Generate Laravel APP_KEY
php artisan key:generate

# Edit .env with your settings
nano .env
```

### .env Settings to Update
```env
APP_NAME="Coder's Hero"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_db_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync

# Mail (use cPanel email or SMTP)
MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=info@yourdomain.com
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=info@yourdomain.com
MAIL_FROM_NAME="Coder's Hero"

# Stripe (get from stripe.com/dashboard)
STRIPE_KEY=sk_live_...
STRIPE_SECRET=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# M-Pesa (get from Safaricom Daraja)
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=...
MPESA_PASSKEY=...

# OpenAI (optional)
OPENAI_API_KEY=sk-...
```

---

## Step 3: Setup Database

### Option A: cPanel MySQL Wizard
1. cPanel → **MySQL® Databases**
2. Create database: `your_db_name`
3. Create user: `your_db_user`
4. Add user to database with **ALL PRIVILEGES**

### Option B: Terminal
```bash
mysql -u root -p -e "CREATE DATABASE your_db_name CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p -e "CREATE USER 'your_db_user'@'localhost' IDENTIFIED BY 'your_db_password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON your_db_name.* TO 'your_db_user'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

---

## Step 4: Install Dependencies & Run Migrations

```bash
cd ~/public_html

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Run migrations
php artisan migrate --force

# Seed admin user (if needed)
php artisan db:seed

# Create storage symlink
php artisan storage:link

# Cache config for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Set permissions
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

---

## Step 5: Configure Web Server

### cPanel: Setup Apache/Vhost

#### If your app is at domain root (`public_html/`):
cPanel auto-detects Laravel. Just make sure the document root points to `public_html/public/`.

#### If your app is in a subfolder:
Create `.htaccess` in `public_html/`:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

#### Or change document root via cPanel:
1. cPanel → **Domains** → **Modify Domain**
2. Set Document Root to `yourdomain.com/public`

### Terminal: Nginx (if available)
```bash
sudo nano /etc/nginx/sites-available/yourdomain.com
```
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    root /home/user/public_html/public;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known) {
        deny all;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## Step 6: SSL Certificate

### Option A: cPanel Auto SSL
1. cPanel → **SSL/TLS** → **Manage Auto SSL**
2. Enable Auto SSL for your domain

### Option B: Let's Encrypt via Terminal
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renew
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## Step 7: Setup Cron Job (Scheduled Tasks)

```bash
# Access crontab
crontab -e

# Add Laravel scheduler (runs every minute)
* * * * * cd /home/user/public_html && php artisan schedule:run >> /dev/null 2>&1
```

### Or via cPanel:
1. cPanel → **Cron Jobs**
2. Add: `* * * * * cd /home/user/public_html && php artisan schedule:run`

---

## Step 8: Configure File Permissions

```bash
cd ~/public_html

# Storage and cache writable
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/

# .env protected
chmod 600 .env

# Ensure web server can read
chown -R $(whoami):$(whoami) .
# Or for Apache:
# chown -R www-data:www-data .
```

---

## Step 9: Setup Frontend (if building from source)

If the `public/assets/` folder is missing or you need to rebuild:
```bash
cd ~/public_html

# Install Node dependencies
npm install

# Build frontend
npm run build

# The build output goes to public/build/ or public/assets/
```

**Note:** The production zip already includes compiled assets in `/assets/` and `index.html` at root. Skip this step if deploying from the zip.

---

## Step 10: Verify Installation

### Check Health Endpoint
```bash
curl https://yourdomain.com/api/health
# Should return: {"status":"healthy","checks":{"database":"ok","cache":"ok"}}
```

### Check Frontend
Open `https://yourdomain.com` in browser — should show login page.

### Check API
```bash
curl https://yourdomain.com/api/courses
# Should return course data
```

---

## Troubleshooting

### 500 Internal Server Error
```bash
# Check Laravel logs
tail -50 storage/logs/laravel.log

# Check PHP errors
php artisan tinker --execute="echo phpversion();"

# Verify .env is loaded
php artisan config:clear && php artisan config:cache
```

### Database Connection Failed
```bash
# Verify DB credentials in .env
grep DB_ .env

# Test connection
mysql -u your_db_user -p your_db_name -e "SELECT 1;"
```

### Storage/Cache Permission Denied
```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### Migration Errors
```bash
# Check migration status
php artisan migrate:status

# Force run pending migrations
php artisan migrate --force
```

### Frontend Not Loading (Blank Page)
```bash
# Verify public/index.php exists
ls -la public/index.php

# Verify assets exist
ls -la assets/ | head -5

# Check .htaccess
cat public/.htaccess
```

### CORS Errors
```bash
# Clear route cache
php artisan route:clear
php artisan config:clear
```

---

## Post-Deployment Checklist

- [ ] `.env` configured with correct DB credentials
- [ ] `APP_KEY` generated
- [ ] `APP_DEBUG=false`
- [ ] `APP_URL=https://yourdomain.com`
- [ ] SSL certificate active
- [ ] Database migrated
- [ ] Storage symlink created
- [ ] Config/route/view cached
- [ ] Cron job set for scheduler
- [ ] File permissions correct
- [ ] Health check returns 200
- [ ] Login page loads
- [ ] API responds correctly
