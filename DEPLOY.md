# Serverga chiqarish (Ahost VDS)

> **Diqqat.** Hozir sayt **Vercel + Supabase**'da ishlaydi — joriy yo'riqnoma
> [VERCEL.md](./VERCEL.md) da. Bu fayl keyinchalik o'z serveringizga
> (VDS) ko'chirish kerak bo'lsa qo'l keladi.
>
> VDS'ga o'tishda quyidagilar qo'shimcha ish talab qiladi:
> - baza — Supabase o'rniga serverdagi PostgreSQL (`DATABASE_URL` almashadi)
> - admin kirish — Supabase Auth'ga ulanish saqlanib qoladi yoki o'z tizimingizga
>   qaytariladi
> - yuklangan fayllar — Supabase Storage'da qolaveradi (VDS diskiga ko'chirish shart emas)

«Orkestr va Xor» saytini VDS'ga o'rnatish yo'riqnomasi. Ubuntu 22.04 / 24.04 uchun
yozilgan; boshqa distributivda buyruqlar ozgina farq qilishi mumkin.

Barcha buyruqlar serverda, SSH orqali bajariladi.

---

## Nima kerak

| Talab | Izoh |
|---|---|
| Ubuntu 22.04 yoki 24.04 | boshqa distributiv ham bo'ladi |
| 2 GB RAM | 1 GB bo'lsa — svop fayl qo'shiladi (1-qadamga qarang) |
| 10 GB disk | ilova ~1 GB, qolgani baza, rasm va zaxira uchun |
| Node.js 20+ | |
| PostgreSQL 17+ | 17 dan pastda `C.UTF-8` lokali ishlamaydi |
| Domen | DNS `A` yozuvi server IP siga yo'naltirilgan bo'lsin |

---

## 1-qadam. Serverni tayyorlash

Root sifatida kiring va alohida foydalanuvchi yarating — sayt root nomidan
ishlamasligi kerak:

```bash
apt update && apt upgrade -y
adduser orkestr
usermod -aG sudo orkestr
```

Vaqt mintaqasi (admin paneldagi sana va vaqt to'g'ri chiqishi uchun):

```bash
timedatectl set-timezone Asia/Tashkent
```

Xavfsizlik devori:

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

**RAM 2 GB dan kam bo'lsa** svop qo'shing — aks holda `npm run build` xotira
yetmay to'xtaydi:

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

Endi `orkestr` foydalanuvchisiga o'ting: `su - orkestr`

---

## 2-qadam. Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
node -v    # v20.x.x chiqishi kerak
```

---

## 3-qadam. PostgreSQL

Ubuntu omborida eski versiya bo'lishi mumkin, shuning uchun PostgreSQL'ning
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

> 18-versiya ham bo'ladi (`postgresql-18`) — mahalliy ishlab chiqishda o'sha
> ishlatiladi. 17 dan pastini o'rnatmang.

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

> ⚠️ **`ENCODING` va `BUILTIN_LOCALE` ni o'zgartirmang.** Ularsiz o'zbekcha
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

### `.env` faylini to'ldirish

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
**ko'chirmang**):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Faylni himoyalang:

```bash
chmod 600 .env
```

### O'rnatish va bazani tayyorlash

```bash
npm ci
npx prisma generate      # Prisma klienti Git'ga tushmaydi — har safar yaratiladi
npx prisma migrate deploy
```

Endi bazani to'ldirish. **Bir marta**, birinchi o'rnatishda:

```bash
npm run db:seed
```

> ⚠️ **`db:seed` bazadagi butun kontentni o'chirib, namunaviy ma'lumot yozadi.**
> Sayt ishga tushib, admin paneldan haqiqiy kontent kiritilgandan keyin uni
> **hech qachon qayta ishlatmang**. Yangilash uchun `deploy/yangilash.sh`
> ishlatiladi — u seed'ni chaqirmaydi.

Seed admin foydalanuvchini ham yaratadi (`.env` dagi `ADMIN_EMAIL` /
`ADMIN_PASSWORD` bilan).

### Qurish

```bash
npm run build
```

Sinab ko'rish: `npm run start` → boshqa terminalda `curl -I http://127.0.0.1:3000/uz`
javob bersa, `Ctrl+C` bilan to'xtating.

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

Nginx `public/uploads/` papkasini o'qiy olishi kerak:

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
«Foydalanuvchilar» bo'limidan parolni almashtiring.

---

## 7-qadam. Zaxira nusxa (backup)

```bash
chmod +x /var/www/orkestrvaxor/deploy/backup.sh
sudo mkdir -p /var/backups/orkestrvaxor
sudo chown orkestr:orkestr /var/backups/orkestrvaxor

# Sinab ko'rish
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
o'chiradi. Nusxalarni vaqti-vaqti bilan boshqa joyga (masalan, o'z
kompyuteringizga) ham ko'chirib turing — server buzilsa, undagi zaxira ham
yo'qoladi.

**Zaxiradan tiklash:**

```bash
gunzip -c /var/backups/orkestrvaxor/baza-2026-08-19-0300.sql.gz | psql "$DATABASE_URL"
tar -xzf /var/backups/orkestrvaxor/rasmlar-2026-08-19-0300.tar.gz -C /var/www/orkestrvaxor/public
```

---

## Keyinchalik: saytni yangilash

Kodda o'zgarish bo'lganda:

```bash
cd /var/www/orkestrvaxor
chmod +x deploy/yangilash.sh     # birinchi marta
./deploy/yangilash.sh
```

Skript: yangi kodni oladi → bog'liqliklarni o'rnatadi → Prisma klientini
yaratadi → migratsiyalarni qo'llaydi → saytni quradi → xizmatni qayta ishga
tushiradi. Qurish paytida sayt eski versiyada ishlab turadi, faqat qayta ishga
tushishda bir necha soniya uzilish bo'ladi.

> **Papkani qayta `git clone` qilmang.** `public/uploads/` Git'ga tushmaydi —
> yangi klonda admin paneldan yuklangan barcha rasmlar yo'qoladi. Doim shu
> papkada `git pull` qiling.

---

## Muammolar

| Belgi | Sabab va yechim |
|---|---|
| Sayt ochilmaydi, `502 Bad Gateway` | Xizmat o'chgan: `sudo systemctl status orkestrvaxor`, loglar: `journalctl -u orkestrvaxor -n 50` |
| `AUTH_SECRET o'rnatilmagan` xatosi | `.env` da `AUTH_SECRET` yo'q yoki 16 belgidan qisqa |
| Rasm yuklashda `413` xatosi | Nginx'da `client_max_body_size 10M;` yo'q |
| O'zbekcha harflar buzilgan | Baza noto'g'ri kodlash bilan yaratilgan — 3-qadamga qaytish kerak |
| `npm run build` xotira yetmay to'xtadi | Svop qo'shing (1-qadam) |
| `too many clients already` | `.env` ga `DATABASE_POOL_MAX=3` qo'shing |
| Admin paneldagi o'zgarish saytda ko'rinmayapti | Odatda darhol ko'rinadi. Ko'rinmasa brauzer keshini tekshiring, so'ng: `sudo systemctl restart orkestrvaxor` |

---

## Xavfsizlik eslatmalari

- `.env` faylini hech qachon Git'ga qo'shmang (u `.gitignore` da).
- Server parolini emas, **SSH kalit**ini ishlatish tavsiya etiladi.
- Admin panelga birinchi kirgandan keyin parolni almashtiring.
- Xodimlarga `MUHARRIR` roli bering — `ADMIN` faqat kerak bo'lganda.
- `sudo apt update && sudo apt upgrade` ni oyiga bir marta bajaring.
