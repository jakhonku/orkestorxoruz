#!/usr/bin/env bash
#
# Saytni yangilash: GitHub'dan yangi kodni olib, qayta quradi va qayta ishga tushiradi.
#
#   cd /var/www/orkestrvaxor && ./deploy/yangilash.sh
#
# DIQQAT: bu skript `npm run db:seed` ni CHAQIRMAYDI — seed bazadagi butun
# kontentni o'chirib, namunaviy ma'lumot yozadi. U faqat birinchi o'rnatishda
# bir marta ishlatiladi.
#
set -euo pipefail

ILOVA=/var/www/orkestrvaxor
XIZMAT=orkestrvaxor

cd "$ILOVA"

echo "==> Yangi kod olinmoqda"
git pull --ff-only

echo "==> Bog'liqliklar o'rnatilmoqda"
npm ci

echo "==> Prisma klienti yaratilmoqda"
npx prisma generate

echo "==> Baza migratsiyalari qo'llanmoqda"
npx prisma migrate deploy

echo "==> Sayt qurilmoqda"
npm run build

echo "==> Xizmat qayta ishga tushirilmoqda"
sudo systemctl restart "$XIZMAT"

sleep 3
sudo systemctl status "$XIZMAT" --no-pager --lines 5

echo
echo "Tayyor. Loglarni ko'rish:  sudo journalctl -u $XIZMAT -f"
