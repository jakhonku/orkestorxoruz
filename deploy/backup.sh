#!/usr/bin/env bash
#
# Kunlik zaxira: baza + admin paneldan yuklangan rasmlar.
#
# Cron'ga qo'yish (har kuni soat 03:00 da):
#   crontab -e
#   0 3 * * * /var/www/orkestrvaxor/deploy/backup.sh >> /var/backups/orkestrvaxor/backup.log 2>&1
#
set -euo pipefail

ILOVA=/var/www/orkestrvaxor
KATALOG=/var/backups/orkestrvaxor
SAQLASH_KUNI=14

mkdir -p "$KATALOG"

# DATABASE_URL .env dan olinadi
set -a
# shellcheck disable=SC1091
source "$ILOVA/.env"
set +a

SANA=$(date +%F-%H%M)

echo "[$(date '+%F %T')] zaxira boshlandi"

# 1. Baza
pg_dump "$DATABASE_URL" | gzip > "$KATALOG/baza-$SANA.sql.gz"
echo "  baza:    $(du -h "$KATALOG/baza-$SANA.sql.gz" | cut -f1)"

# 2. Yuklangan fayllar (bo'lmasa — o'tkazib yuboriladi)
if [ -d "$ILOVA/public/uploads" ]; then
  tar -czf "$KATALOG/rasmlar-$SANA.tar.gz" -C "$ILOVA/public" uploads
  echo "  rasmlar: $(du -h "$KATALOG/rasmlar-$SANA.tar.gz" | cut -f1)"
fi

# 3. Eski nusxalarni tozalash
find "$KATALOG" -name '*.gz' -type f -mtime +$SAQLASH_KUNI -delete

echo "[$(date '+%F %T')] zaxira tayyor: $KATALOG"
