# Coder's Hero ERP & LMS - Production Deployment Guide

## Prerequisites

- Docker & Docker Compose v2+
- A Linux server (Ubuntu 22.04+ recommended)
- Domain name with DNS pointing to your server
- SSL certificate (Let's Encrypt via Certbot recommended)

## Quick Deploy

### 1. Clone the repository

```bash
git clone https://github.com/dunte1/coders-hero.git
cd coders-hero
```

### 2. Build the frontend

```bash
cd frontend
npm ci
npm run build
cd ..
```

### 3. Configure environment

```bash
cd production
cp .env.production .env
# Edit .env with your real values
nano .env
```

### 4. Generate APP_KEY

```bash
docker compose -f docker-compose.prod.yml run --rm app php artisan key:generate
```

### 5. Start services

```bash
docker compose -f docker-compose.prod.yml up -d
```

### 6. Run migrations and seed

```bash
docker compose -f docker-compose.prod.yml run --rm app php artisan migrate --force
docker compose -f docker-compose.prod.yml run --rm app php artisan db:seed --force
```

### 7. Storage link

```bash
docker compose -f docker-compose.prod.yml run --rm app php artisan storage:link
```

### 8. Set up SSL (recommended)

```bash
# Install Certbot
sudo apt install certbot

# Get certificate (stop nginx first)
docker compose -f docker-compose.prod.yml stop nginx
sudo certbot certonly --standalone -d your-domain.com

# Copy certs
mkdir -p ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/

# Uncomment HTTPS server block in nginx.conf
# Restart nginx
docker compose -f docker-compose.prod.yml up -d nginx
```

## Services

| Service | Port | Purpose |
|---------|------|---------|
| nginx | 80, 443 | Web server + reverse proxy |
| app | 9000 | PHP-FPM application |
| mysql | 3306 (localhost only) | Database |
| redis | 6379 (localhost only) | Cache, queue, sessions |
| queue | - | Background job processing |
| scheduler | - | Cron task execution |

## Useful Commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f app
docker compose -f docker-compose.prod.yml logs -f nginx

# Run artisan commands
docker compose -f docker-compose.prod.yml run --rm app php artisan <command>

# Restart services
docker compose -f docker-compose.prod.yml restart

# Stop all services
docker compose -f docker-compose.prod.yml down

# Rebuild after code changes
docker compose -f docker-compose.prod.yml up -d --build
```

## Backup

### Database backup

```bash
docker compose -f docker-compose.prod.yml exec mysql mysqldump -u root -p${DB_ROOT_PASSWORD} coders_hero_prod > backup_$(date +%Y%m%d).sql
```

### Restore database

```bash
cat backup_20260817.sql | docker compose -f docker-compose.prod.yml exec -T mysql mysql -u root -p${DB_ROOT_PASSWORD} coders_hero_prod
```

## Monitoring

- **Logs**: `docker compose -f docker-compose.prod.yml logs -f`
- **Queue status**: `docker compose -f docker-compose.prod.yml run --rm app php artisan queue:status`
- **Cache clear**: `docker compose -f docker-compose.prod.yml run --rm app php artisan cache:clear`

## Security Checklist

- [ ] APP_DEBUG=false
- [ ] Strong database passwords
- [ ] Redis password set
- [ ] SSL/TLS configured
- [ ] Firewall enabled (only ports 80, 443, 22 open)
- [ ] Regular backups scheduled
- [ ] M-Pesa credentials secured
- [ ] OpenAI API key secured
- [ ] AWS credentials secured
