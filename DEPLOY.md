# Serverga chiqarish (Ahost VDS)

> **Diqqat.** Hozir sayt **Vercel + Supabase**'da ishlaydi — joriy yoʻriqnoma
> [VERCEL.md](./VERCEL.md) da. Bu fayl keyinchalik oʻz serveringizga
> (VDS) koʻchirish kerak boʻlsa qoʻl keladi.
>
> VDSʼga oʻtishda quyidagilar qoʻshimcha ish talab qiladi:
> - baza — Supabase oʻrniga serverdagi PostgreSQL (`DATABASE_URL` almashadi)
> - admin kirish — Supabase Authʼga ulanish saqlanib qoladi yoki oʻz tizimingizga
>   qaytariladi
> - yuklangan fayllar — Supabase Storageʼda qolaveradi (VDS diskiga koʻchirish shart emas)

«Orkestr va Xor» saytini VDSʼga oʻrnatish yoʻriqnomasi. Ubuntu 22.04 / 24.04 uchun
yozilgan; boshqa distributivda buyruqlar ozgina farq qilishi mumkin.

Barcha buyruqlar serverda, SSH orqali bajariladi.

---

## Nima kerak

| Talab | Izoh |
|---|---|
| Ubuntu 22.04 yoki 24.04 | boshqa distributiv ham boʻladi |
| 2 GB RAM | 1 GB boʻlsa — svop fayl qoʻshiladi (1-qadamga qarang) |
| 10 GB disk | ilova ~1 GB, qolgani baza, rasm va zaxira uchun |
| Node.js 20+ | |
| PostgreSQL 17+ | 17 dan pastda `C.UTF-8` lokali ishlamaydi |
| Domen | DNS `A` yozuvi server IP siga yoʻnaltirilgan boʻlsin |

---

## 1-qadam. Serverni tayyorlash

Root sifatida kiring va alohida foydalanuvchi yarating — sayt root nomidan
ishlamasligi kerak:

```bash
apt update && apt upgrade -y
adduser orkestr
usermod -aG sudo orkestr
```

Vaqt mintaqasi (admin paneldagi sana va vaqt toʻgʻri chiqishi uchun):

```bash
timedatectl set-timezone Asia/Tashkent
```

Xavfsizlik devori:

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

**RAM 2 GB dan kam boʻlsa** svop qoʻshing — aks holda `npm run build` xotira
yetmay toʻxtaydi:

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

Endi `orkestr` foydalanuvchisiga oʻting: `su - orkestr`

---

## 2-qadam. Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
node -v    # v20.x.x chiqishi kerak
```

---

## 3-qadam. PostgreSQL

Ubuntu omborida eski versiya boʻlishi mumkin, shuning uchun PostgreSQLʼning
rasmiy ombori ulanadi:

```bash
sudo apt install -y curl ca-certificates
sudo install -d /usr/share/postgresql-common/pgdg
sudo curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc --fail \
  https://www.postgresql.org/media/keys/ACCC4CF8.asc
sudo sh -c 'echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] \
  https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
  > /etc/apt/sources.list.d/pgdg.list'
sudo apt update
sudo apt install -y postgresql-17
```

> 18-versiya ham boʻladi (`postgresql-18`) — mahalliy ishlab chiqishda oʻsha
> ishlatiladi. 17 dan pastini oʻrnatmang.

### Baza va foydalanuvchi

```bash
sudo -u postgres psql
```

```sql
CREATE USER orkestr WITH PASSWORD 'BU_YERGA_KUCHLI_PAROL';

CREATE DATABASE orkestrvaxor
  OWNER orkestr
  ENCODING 'UTF8'
  LOCALE_PROVIDER builtin
  BUILTIN_LOCALE 'C.UTF-8'
  TEMPLATE template0;

\q
```

> ⚠️ **`ENCODING` va `BUILTIN_LOCALE` ni oʻzgartirmang.** Ularsiz oʻzbekcha
> `o'`, `g'` harflari buziladi va kirillcha qidiruv katta/kichik harfni
> farqlamay ishlamay qoladi. Batafsil: [BAZA.md](./BAZA.md).

Tekshirish:

```bash
psql "postgresql://orkestr:PAROL@localhost:5432/orkestrvaxor" -c "select version()"
```

---

## 4-qadam. Kodni joylashtirish

```bash
sudo mkdir -p /var/www
sudo chown orkestr:orkestr /var/www
cd /var/www
git clone https://github.com/jakhonku/orkestorxoruz.git orkestrvaxor
cd orkestrvaxor
```

### `.env` faylini toʻldirish

```bash
cp .env.example .env
nano .env
```

Kerakli qiymatlar:

```ini
DATABASE_URL="postgresql://orkestr:PAROL@localhost:5432/orkestrvaxor?schema=public"
SHADOW_DATABASE_URL=""
AUTH_SECRET="<pastdagi buyruq bilan yaratiladi>"
ADMIN_EMAIL="admin@orkestrvaxor.uz"
ADMIN_PASSWORD="<kuchli parol>"
NEXT_PUBLIC_SITE_URL="https://orkestrvaxor.uz"
```

`AUTH_SECRET` uchun yangi tasodifiy qiymat yarating (mahalliy qiymatni
**koʻchirmang**):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Faylni himoyalang:

```bash
chmod 600 .env
```

### Oʻrnatish va bazani tayyorlash

```bash
npm ci
npx prisma generate      # Prisma klienti Gitʼga tushmaydi — har safar yaratiladi
npx prisma migrate deploy
```

Endi bazani toʻldirish. **Bir marta**, birinchi oʻrnatishda:

```bash
npm run db:seed
```

> ⚠️ **`db:seed` bazadagi butun kontentni oʻchirib, namunaviy maʼlumot yozadi.**
> Sayt ishga tushib, admin paneldan haqiqiy kontent kiritilgandan keyin uni
> **hech qachon qayta ishlatmang**. Yangilash uchun `deploy/yangilash.sh`
> ishlatiladi — u seedʼni chaqirmaydi.

Seed admin foydalanuvchini ham yaratadi (`.env` dagi `ADMIN_EMAIL` /
`ADMIN_PASSWORD` bilan).

### Qurish

```bash
npm run build
```

Sinab koʻrish: `npm run start` → boshqa terminalda `curl -I http://127.0.0.1:3000/uz`
javob bersa, `Ctrl+C` bilan toʻxtating.

---

## 5-qadam. Xizmat sifatida ishga tushirish (systemd)

```bash
sudo cp /var/www/orkestrvaxor/deploy/orkestrvaxor.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now orkestrvaxor
sudo systemctl status orkestrvaxor
```

Loglar:

```bash
sudo journalctl -u orkestrvaxor -f
```

Endi sayt `127.0.0.1:3000` da ishlaydi, lekin tashqaridan hali ochilmaydi.

---

## 6-qadam. Nginx va SSL

```bash
sudo apt install -y nginx
sudo cp /var/www/orkestrvaxor/deploy/nginx.conf /etc/nginx/sites-available/orkestrvaxor
sudo nano /etc/nginx/sites-available/orkestrvaxor    # domen nomini yozing
sudo ln -s /etc/nginx/sites-available/orkestrvaxor /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Nginx `public/uploads/` papkasini oʻqiy olishi kerak:

```bash
sudo chmod o+x /var/www /var/www/orkestrvaxor /var/www/orkestrvaxor/public
```

SSL sertifikat (bepul, avtomatik yangilanadi):

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d orkestrvaxor.uz -d www.orkestrvaxor.uz
```

Shu bilan sayt `https://orkestrvaxor.uz` da ochiladi.

**Birinchi ish:** `https://orkestrvaxor.uz/admin/kirish` ga kiring va
«Foydalanuvchilar» boʻlimidan parolni almashtiring.

---

## 7-qadam. Zaxira nusxa (backup)

```bash
chmod +x /var/www/orkestrvaxor/deploy/backup.sh
sudo mkdir -p /var/backups/orkestrvaxor
sudo chown orkestr:orkestr /var/backups/orkestrvaxor

# Sinab koʻrish
/var/www/orkestrvaxor/deploy/backup.sh
```

Har kuni soat 03:00 da ishlashi uchun:

```bash
crontab -e
```

```
0 3 * * * /var/www/orkestrvaxor/deploy/backup.sh >> /var/backups/orkestrvaxor/backup.log 2>&1
```

Skript bazani va yuklangan rasmlarni saqlaydi, 14 kundan eski nusxalarni
oʻchiradi. Nusxalarni vaqti-vaqti bilan boshqa joyga (masalan, oʻz
kompyuteringizga) ham koʻchirib turing — server buzilsa, undagi zaxira ham
yoʻqoladi.

**Zaxiradan tiklash:**

```bash
gunzip -c /var/backups/orkestrvaxor/baza-2026-08-19-0300.sql.gz | psql "$DATABASE_URL"
tar -xzf /var/backups/orkestrvaxor/rasmlar-2026-08-19-0300.tar.gz -C /var/www/orkestrvaxor/public
```

---

## Keyinchalik: saytni yangilash

Kodda oʻzgarish boʻlganda:

```bash
cd /var/www/orkestrvaxor
chmod +x deploy/yangilash.sh     # birinchi marta
./deploy/yangilash.sh
```

Skript: yangi kodni oladi → bogʻliqliklarni oʻrnatadi → Prisma klientini
yaratadi → migratsiyalarni qoʻllaydi → saytni quradi → xizmatni qayta ishga
tushiradi. Qurish paytida sayt eski versiyada ishlab turadi, faqat qayta ishga
tushishda bir necha soniya uzilish boʻladi.

> **Papkani qayta `git clone` qilmang.** `public/uploads/` Gitʼga tushmaydi —
> yangi klonda admin paneldan yuklangan barcha rasmlar yoʻqoladi. Doim shu
> papkada `git pull` qiling.

---

## Muammolar

| Belgi | Sabab va yechim |
|---|---|
| Sayt ochilmaydi, `502 Bad Gateway` | Xizmat oʻchgan: `sudo systemctl status orkestrvaxor`, loglar: `journalctl -u orkestrvaxor -n 50` |
| `AUTH_SECRET oʻrnatilmagan` xatosi | `.env` da `AUTH_SECRET` yoʻq yoki 16 belgidan qisqa |
| Rasm yuklashda `413` xatosi | Nginxʼda `client_max_body_size 10M;` yoʻq |
| Oʻzbekcha harflar buzilgan | Baza notoʻgʻri kodlash bilan yaratilgan — 3-qadamga qaytish kerak |
| `npm run build` xotira yetmay toʻxtadi | Svop qoʻshing (1-qadam) |
| `too many clients already` | `.env` ga `DATABASE_POOL_MAX=3` qoʻshing |
| Admin paneldagi oʻzgarish saytda koʻrinmayapti | Odatda darhol koʻrinadi. Koʻrinmasa brauzer keshini tekshiring, soʻng: `sudo systemctl restart orkestrvaxor` |

---

## Xavfsizlik eslatmalari

- `.env` faylini hech qachon Gitʼga qoʻshmang (u `.gitignore` da).
- Server parolini emas, **SSH kalit**ini ishlatish tavsiya etiladi.
- Admin panelga birinchi kirgandan keyin parolni almashtiring.
- Xodimlarga `MUHARRIR` roli bering — `ADMIN` faqat kerak boʻlganda.
- `sudo apt update && sudo apt upgrade` ni oyiga bir marta bajaring.
