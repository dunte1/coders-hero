#!/bin/bash
# Coder's Hero ERP & LMS - Backup Script
# Run daily via cron: 0 2 * * * /path/to/backup.sh

set -euo pipefail

BACKUP_DIR="/backups/coders-hero"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Load environment
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/.env" ]; then
    export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
fi

DB_NAME="${DB_DATABASE:-coders_hero_prod}"
DB_USER="${DB_USERNAME:-root}"
DB_PASS="${DB_ROOT_PASSWORD:-}"
REDIS_PASS="${REDIS_PASSWORD:-}"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup..."

# Database backup
echo "[$(date)] Backing up MySQL database..."
if [ -n "$DB_PASS" ]; then
    mysqldump -u "$DB_USER" -p"$DB_PASS" --single-transaction --routines --triggers "$DB_NAME" | gzip > "$BACKUP_DIR/db_${DATE}.sql.gz"
else
    mysqldump -u "$DB_USER" --single-transaction --routines --triggers "$DB_NAME" | gzip > "$BACKUP_DIR/db_${DATE}.sql.gz"
fi
echo "[$(date)] Database backup complete: db_${DATE}.sql.gz"

# Redis backup (AOF persistence handles this, but we can snapshot)
echo "[$(date)] Backing up Redis..."
if [ -n "$REDIS_PASS" ]; then
    redis-cli -a "$REDIS_PASS" BGSAVE 2>/dev/null || true
else
    redis-cli BGSAVE 2>/dev/null || true
fi
echo "[$(date)] Redis backup triggered"

# Application files backup
echo "[$(date)] Backing up application files..."
tar -czf "$BACKUP_DIR/storage_${DATE}.tar.gz" \
    --exclude='vendor' \
    --exclude='node_modules' \
    --exclude='.git' \
    -C "$(dirname "$SCRIPT_DIR")" \
    backend/storage/app 2>/dev/null || true
echo "[$(date)] Storage backup complete: storage_${DATE}.tar.gz"

# Cleanup old backups
echo "[$(date)] Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

echo "[$(date)] Backup complete!"
echo "[$(date)] Files in backup directory:"
ls -lh "$BACKUP_DIR" | tail -5
