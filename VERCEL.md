# Vercel + Supabase — ishga tushirish yo'riqnomasi

Sayt Vercel'da ishlaydi, backend esa Supabase'da:

| Vazifa | Qayerda |
|--------|---------|
| Sayt va admin panel (Next.js) | Vercel |
| Ma'lumotlar bazasi (PostgreSQL) | Supabase Postgres — Prisma orqali o'qiladi/yoziladi |
| Admin kirish (email + parol) | Supabase Auth |
| Yuklangan rasm va hujjatlar | Supabase Storage (`media` bucket) |

---

## 1-qadam. Supabase loyihasini yaratish

1. https://supabase.com — kiring va **New project** bosing.
2. To'ldiring:
   - **Name:** `orkestrvaxor`
   - **Database Password:** kuchli parol yarating va **saqlab qo'ying** (keyin kerak bo'ladi)
   - **Region:** `Central EU (Frankfurt)` yoki `Southeast Asia (Singapore)` — O'zbekistonga yaqinrog'i
3. Loyiha tayyor bo'lishini kuting (1–2 daqiqa).

---

## 2-qadam. Ulanish manzillari va kalitlarni olish

### Baza ulanishi

**Project Settings → Database → Connection string** bo'limida ikkita manzil kerak:

| O'zgaruvchi | Qaysi rejim | Port | Nima uchun |
|-------------|-------------|------|------------|
| `DATABASE_URL` | **Transaction pooler** | 6543 | Sayt ish paytida — serverless funksiyalar uchun |
| `DIRECT_URL` | **Direct connection** (yoki Session pooler) | 5432 | Faqat migratsiyalar uchun |

Manzil ichidagi `[YOUR-PASSWORD]` o'rniga 1-qadamdagi baza parolini qo'ying.
Parolda maxsus belgi bo'lsa (`@`, `#`, `:`), uni URL-kodlash kerak (`@` → `%40`).

### API kalitlari

**Project Settings → API** bo'limidan:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / publishable key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (brauzerga chiqadi, bu normal)
- **service_role / secret key** → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ `service_role` kalit RLS'ni chetlab o'tadi. U hech qachon frontend kodiga,
> Git'ga yoki `NEXT_PUBLIC_` prefiksi bilan qo'yilmaydi.

---

## 3-qadam. Storage bucket ochish

**Storage → New bucket:**

- **Name:** `media`
- **Public bucket:** ✅ yoqilsin (rasm sayt mehmonlariga ko'rinishi kerak)

Yozish huquqi faqat serverda — fayllar `service_role` kaliti bilan yuklanadi,
shuning uchun tashqaridan hech kim bucket'ga fayl qo'ya olmaydi.

---

## 4-qadam. Auth sozlamalari

**Authentication → Sign In / Providers → Email:**

- **Confirm email** — o'chirilsa ham bo'ladi (hisoblarni administrator o'zi ochadi)
- **Allow new users to sign up** — ❌ **o'chiring**

Bu muhim: ochiq ro'yxatdan o'tish yopilmasa, begona odam Supabase'da hisob ocha oladi.
(Panelga baribir kira olmaydi — `admin_users` jadvalida qaydi bo'lishi shart —
lekin keraksiz hisoblar to'planib qolmagani ma'qul.)

---

## 5-qadam. Bazani tayyorlash (kompyuterdan bir marta)

`.env.example` dan nusxa oling va to'ldiring:

```bash
cp .env.example .env
```

Keyin:

```bash
npm install
npm run db:deploy   # jadvallarni yaratadi (migratsiyalarni qo'llaydi)
npm run db:seed     # boshlang'ich kontent + admin hisobi
```

`db:seed` `.env` dagi `ADMIN_EMAIL` va `ADMIN_PASSWORD` bilan Supabase Auth'da
hisob ochadi va unga ADMIN roli beradi.

Tekshirish:

```bash
npm run dev
```

- Sayt: http://localhost:3000
- Admin: http://localhost:3000/admin

---

## 6-qadam. Vercel'ga chiqarish

1. Kodni GitHub'ga joylang (agar hali joylanmagan bo'lsa):

   ```bash
   git add -A
   git commit -m "Vercel va Supabase uchun moslashtirildi"
   git push
   ```

2. https://vercel.com → **Add New → Project** → GitHub repozitoriyni tanlang.

3. Vercel Next.js'ni o'zi aniqlaydi. **Build Command** va **Output Directory**
   o'zgartirilmaydi (`prisma generate && next build` `package.json` da yozilgan).

4. **Environment Variables** bo'limiga quyidagilarni qo'shing
   (Production, Preview va Development — uchalasiga):

   | Nom | Qiymat |
   |-----|--------|
   | `DATABASE_URL` | Transaction pooler manzili (port 6543) |
   | `DIRECT_URL` | To'g'ridan-to'g'ri ulanish (port 5432) |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable kalit |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role kalit |
   | `SUPABASE_STORAGE_BUCKET` | `media` |
   | `NEXT_PUBLIC_SITE_URL` | domen tayyor bo'lgach: `https://orkestrvaxor.uz` |

   > `NEXT_PUBLIC_SITE_URL` qo'yilmasa, sayt Vercel bergan manzildan foydalanadi —
   > preview'lar uchun aynan shunday kerak.

5. **Deploy** bosing.

---

## 7-qadam. Domen ulash

**Project → Settings → Domains → Add** — `orkestrvaxor.uz` ni qo'shing va
Vercel ko'rsatgan DNS yozuvlarini domen registratorida qo'ying:

| Turi | Nom | Qiymat |
|------|-----|--------|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

DNS tarqalgach (odatda 10–60 daqiqa), HTTPS sertifikat avtomatik olinadi.
Shundan keyin `NEXT_PUBLIC_SITE_URL` ni yangilab, qayta deploy qiling.

---

## Keyingi o'zgarishlar

```bash
git push          # Vercel avtomatik yangi deploy qiladi
```

Baza sxemasi o'zgarsa:

```bash
npm run db:migrate      # kompyuterda yangi migratsiya yaratadi
git push                # migratsiya fayli Git orqali boradi
npm run db:deploy       # migratsiyani Supabase'ga qo'llaydi
```

> `db:deploy` ni kompyuterdan ishga tushiring — Vercel build paytida
> migratsiya bajarilmaydi (build bir necha marta parallel ishlashi mumkin).

---

## Xavfsizlik: nima qanday himoyalangan

- **RLS** — barcha jadvallarda yoqilgan, hech qanday siyosat berilmagan.
  Ya'ni ochiq (anon) kalit bilan tashqaridan bazani o'qib ham, yozib ham bo'lmaydi.
  Sayt bazaga faqat server tomonidan, Prisma orqali murojaat qiladi.
- **Admin panel** — `middleware.ts` `/admin` ni qo'riqlaydi; sessiya Supabase Auth
  cookie'sida, rol esa `admin_users` jadvalida tekshiriladi.
- **service_role kalit** — faqat server kodida (`src/lib/supabase/admin.ts`).

---

## Tez-tez uchraydigan xatoliklar

**`ECONNREFUSED` yoki `Can't reach database server` (build paytida)**
`DATABASE_URL` noto'g'ri yoki Supabase loyihasi to'xtatilgan (bepul rejada
loyiha uzoq ishlatilmasa uxlab qoladi). Supabase panelida loyihani uyg'oting.

**`password authentication failed`**
Baza paroli noto'g'ri yoki maxsus belgilar URL-kodlanmagan (`@` → `%40`).

**`prepared statement ... already exists`**
`DATABASE_URL` da Session pooler o'rniga Transaction pooler (6543) ishlatilsin.

**Admin panelga kira olmayapman**
Supabase Auth'da hisob bor, lekin `admin_users` jadvalida faol qayd yo'q.
`npm run db:seed` ni qayta ishlating yoki jadvalga qayd qo'shing.

**Rasm yuklanmayapti**
`media` bucket ochilmagan yoki `SUPABASE_SERVICE_ROLE_KEY` noto'g'ri.

**Rasm ko'rinmayapti (`Invalid src prop`)**
`NEXT_PUBLIC_SUPABASE_URL` build paytida yo'q edi — o'zgaruvchini qo'shib,
qayta deploy qiling (`next.config.mjs` host ro'yxatini shu qiymatdan oladi).
