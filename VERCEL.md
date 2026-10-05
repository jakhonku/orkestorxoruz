# Vercel + Supabase — ishga tushirish yoʻriqnomasi

Sayt Vercelʼda ishlaydi, backend esa Supabaseʼda:

| Vazifa | Qayerda |
|--------|---------|
| Sayt va admin panel (Next.js) | Vercel |
| Maʼlumotlar bazasi (PostgreSQL) | Supabase Postgres — Prisma orqali oʻqiladi/yoziladi |
| Admin kirish (email + parol) | Supabase Auth |
| Yuklangan rasm va hujjatlar | Supabase Storage (`media` bucket) |

---

## 1-qadam. Supabase loyihasini yaratish

1. https://supabase.com — kiring va **New project** bosing.
2. Toʻldiring:
   - **Name:** `orkestrvaxor`
   - **Database Password:** kuchli parol yarating va **saqlab qoʻying** (keyin kerak boʻladi)
   - **Region:** `Central EU (Frankfurt)` yoki `Southeast Asia (Singapore)` — Oʻzbekistonga yaqinrogʻi
3. Loyiha tayyor boʻlishini kuting (1–2 daqiqa).

---

## 2-qadam. Ulanish manzillari va kalitlarni olish

### Baza ulanishi

**Project Settings → Database → Connection string** boʻlimida ikkita manzil kerak:

| Oʻzgaruvchi | Qaysi rejim | Port | Nima uchun |
|-------------|-------------|------|------------|
| `DATABASE_URL` | **Transaction pooler** | 6543 | Sayt ish paytida — serverless funksiyalar uchun |
| `DIRECT_URL` | **Direct connection** (yoki Session pooler) | 5432 | Faqat migratsiyalar uchun |

Manzil ichidagi `[YOUR-PASSWORD]` oʻrniga 1-qadamdagi baza parolini qoʻying.
Parolda maxsus belgi boʻlsa (`@`, `#`, `:`), uni URL-kodlash kerak (`@` → `%40`).

### API kalitlari

**Project Settings → API** boʻlimidan:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / publishable key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (brauzerga chiqadi, bu normal)
- **service_role / secret key** → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ `service_role` kalit RLSʼni chetlab oʻtadi. U hech qachon frontend kodiga,
> Gitʼga yoki `NEXT_PUBLIC_` prefiksi bilan qoʻyilmaydi.

---

## 3-qadam. Storage bucket ochish

**Storage → New bucket:**

- **Name:** `media`
- **Public bucket:** ✅ yoqilsin (rasm sayt mehmonlariga koʻrinishi kerak)

Yozish huquqi faqat serverda — fayllar `service_role` kaliti bilan yuklanadi,
shuning uchun tashqaridan hech kim bucketʼga fayl qoʻya olmaydi.

---

## 4-qadam. Auth sozlamalari

**Authentication → Sign In / Providers → Email:**

- **Confirm email** — oʻchirilsa ham boʻladi (hisoblarni administrator oʻzi ochadi)
- **Allow new users to sign up** — ❌ **oʻchiring**

Bu muhim: ochiq roʻyxatdan oʻtish yopilmasa, begona odam Supabaseʼda hisob ocha oladi.
(Panelga baribir kira olmaydi — `admin_users` jadvalida qaydi boʻlishi shart —
lekin keraksiz hisoblar toʻplanib qolmagani maʼqul.)

---

## 5-qadam. Bazani tayyorlash (kompyuterdan bir marta)

`.env.example` dan nusxa oling va toʻldiring:

```bash
cp .env.example .env
```

Keyin:

```bash
npm install
npm run db:deploy   # jadvallarni yaratadi (migratsiyalarni qoʻllaydi)
npm run db:seed     # boshlangʻich kontent + admin hisobi
```

`db:seed` `.env` dagi `ADMIN_EMAIL` va `ADMIN_PASSWORD` bilan Supabase Authʼda
hisob ochadi va unga ADMIN roli beradi.

Tekshirish:

```bash
npm run dev
```

- Sayt: http://localhost:3000
- Admin: http://localhost:3000/admin

---

## 6-qadam. Vercelʼga chiqarish

1. Kodni GitHubʼga joylang (agar hali joylanmagan boʻlsa):

   ```bash
   git add -A
   git commit -m "Vercel va Supabase uchun moslashtirildi"
   git push
   ```

2. https://vercel.com → **Add New → Project** → GitHub repozitoriyni tanlang.

3. Vercel Next.jsʼni oʻzi aniqlaydi. **Build Command** va **Output Directory**
   oʻzgartirilmaydi (`prisma generate && next build` `package.json` da yozilgan).

4. **Environment Variables** boʻlimiga quyidagilarni qoʻshing
   (Production, Preview va Development — uchalasiga):

   | Nom | Qiymat |
   |-----|--------|
   | `DATABASE_URL` | Transaction pooler manzili (port 6543) |
   | `DIRECT_URL` | Toʻgʻridan-toʻgʻri ulanish (port 5432) |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable kalit |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role kalit |
   | `SUPABASE_STORAGE_BUCKET` | `media` |
   | `NEXT_PUBLIC_SITE_URL` | domen tayyor boʻlgach: `https://orkestrvaxor.uz` |

   > `NEXT_PUBLIC_SITE_URL` qoʻyilmasa, sayt Vercel bergan manzildan foydalanadi —
   > previewʼlar uchun aynan shunday kerak.

5. **Deploy** bosing.

---

## 7-qadam. Domen ulash

**Project → Settings → Domains → Add** — `orkestrvaxor.uz` ni qoʻshing va
Vercel koʻrsatgan DNS yozuvlarini domen registratorida qoʻying:

| Turi | Nom | Qiymat |
|------|-----|--------|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

DNS tarqalgach (odatda 10–60 daqiqa), HTTPS sertifikat avtomatik olinadi.
Shundan keyin `NEXT_PUBLIC_SITE_URL` ni yangilab, qayta deploy qiling.

---

## Keyingi oʻzgarishlar

```bash
git push          # Vercel avtomatik yangi deploy qiladi
```

Baza sxemasi oʻzgarsa:

```bash
npm run db:migrate      # kompyuterda yangi migratsiya yaratadi
git push                # migratsiya fayli Git orqali boradi
npm run db:deploy       # migratsiyani Supabaseʼga qoʻllaydi
```

> `db:deploy` ni kompyuterdan ishga tushiring — Vercel build paytida
> migratsiya bajarilmaydi (build bir necha marta parallel ishlashi mumkin).

---

## Xavfsizlik: nima qanday himoyalangan

- **RLS** — barcha jadvallarda yoqilgan, hech qanday siyosat berilmagan.
  Yaʼni ochiq (anon) kalit bilan tashqaridan bazani oʻqib ham, yozib ham boʻlmaydi.
  Sayt bazaga faqat server tomonidan, Prisma orqali murojaat qiladi.
- **Admin panel** — `middleware.ts` `/admin` ni qoʻriqlaydi; sessiya Supabase Auth
  cookieʼsida, rol esa `admin_users` jadvalida tekshiriladi.
- **service_role kalit** — faqat server kodida (`src/lib/supabase/admin.ts`).

---

## Tez-tez uchraydigan xatoliklar

**`ECONNREFUSED` yoki `Can't reach database server` (build paytida)**
`DATABASE_URL` notoʻgʻri yoki Supabase loyihasi toʻxtatilgan (bepul rejada
loyiha uzoq ishlatilmasa uxlab qoladi). Supabase panelida loyihani uygʻoting.

**`password authentication failed`**
Baza paroli notoʻgʻri yoki maxsus belgilar URL-kodlanmagan (`@` → `%40`).

**`prepared statement ... already exists`**
`DATABASE_URL` da Session pooler oʻrniga Transaction pooler (6543) ishlatilsin.

**Admin panelga kira olmayapman**
Supabase Authʼda hisob bor, lekin `admin_users` jadvalida faol qayd yoʻq.
`npm run db:seed` ni qayta ishlating yoki jadvalga qayd qoʻshing.

**Rasm yuklanmayapti**
`media` bucket ochilmagan yoki `SUPABASE_SERVICE_ROLE_KEY` notoʻgʻri.

**Rasm koʻrinmayapti (`Invalid src prop`)**
`NEXT_PUBLIC_SUPABASE_URL` build paytida yoʻq edi — oʻzgaruvchini qoʻshib,
qayta deploy qiling (`next.config.mjs` host roʻyxatini shu qiymatdan oladi).
