# "Orkestr va Xor" ijodiy birlashmasi — veb-sayt (frontend)

Oʻzbekistonda orkestr va xor sanʼatini rivojlantiruvchi davlat ijodiy tashkiloti uchun
koʻp tilli (uz / ru / en) sayt. Kontent **Supabase Postgres** bazasida saqlanadi va
Prisma orqali oʻqiladi — batafsil: [BAZA.md](./BAZA.md).

Sayt **Vercel**'da ishlaydi, backend **Supabase**'da (baza, admin kirish, fayllar) —
ishga tushirish yoʻriqnomasi: **[VERCEL.md](./VERCEL.md)**.

---

## Texnologiyalar

| Soha | Vosita |
|------|--------|
| Framework | **Next.js 14** (App Router) + **TypeScript** |
| Uslublar | **Tailwind CSS** + shadcn/ui uslubidagi komponentlar |
| Animatsiya | **framer-motion** (yumshoq fade-in / scroll animatsiyalari) |
| Ikonkalar | **lucide-react** |
| Koʻp tillilik | **next-intl** (URL prefiks: `/uz`, `/ru`, `/en`) |
| Shriftlar | **Playfair Display** (sarlavha, serif) + **Manrope** (matn) |
| Maʼlumotlar bazasi | **Supabase Postgres** + **Prisma 7** |
| Admin kirish | **Supabase Auth** (email + parol) |
| Fayl saqlash | **Supabase Storage** (`media` bucket) |
| Deploy | **Vercel** — [VERCEL.md](./VERCEL.md) |

Brend ranglari: toʻq koʻk `#0B3C7D`, oltin `#C9A227`, oq.

---

## Oʻrnatish va ishga tushirish

Avval Supabase loyihasi ochilishi kerak — [VERCEL.md](./VERCEL.md) dagi 1–4 qadamlar.

```bash
# 1. Bogʻliqliklarni oʻrnatish
npm install

# 2. Muhit oʻzgaruvchilari (Supabase manzillari va kalitlari)
cp .env.example .env

# 3. Bazani tayyorlash (birinchi marta)
npm run db:deploy    # jadvallarni yaratadi
npm run db:seed      # boshlangʻich kontent + admin hisobi

# 4. Development server (http://localhost:3000 → /uz ga yoʻnaltiradi)
npm run dev

# 5. Production build
npm run build
npm run start

# 6. Lint
npm run lint
```

> Node.js 18.17+ (tavsiya: 20+) talab qilinadi.

### Chiqarish

Sayt Vercelʼda ishlaydi — GitHubʼga `push` qilinganda avtomatik deploy boʻladi.
Bosqichma-bosqich yoʻriqnoma: **[VERCEL.md](./VERCEL.md)**.

Kelajakda oʻz serveriga (VDS) koʻchirish kerak boʻlsa — [DEPLOY.md](./DEPLOY.md)
va `deploy/` papkasidagi konfiguratsiyalar saqlab qoʻyilgan.

---

## Papka strukturasi

```
src/
  app/
    [locale]/                 # barcha lokalizatsiyalangan sahifalar
      page.tsx                # Bosh sahifa
      haqida/                 # Birlashma haqida
      jamoalar/               # Jamoalar katalogi + [slug] profil
      loyihalar/              # Loyihalar (respublika / xalqaro tab) + [slug]
      tanlovlar/              # Tanlov va festivallar + [slug] (ariza modal)
      talent/                 # Talent platformasi
      afisha/                 # Konsertlar taqvimi (list / kalendar)
      media/                  # Yangiliklar / video / foto / matbuot + [slug]
      ekspertlar/             # Xorijiy ekspertlar
      aloqa/                  # Kontakt formasi + xarita
      layout.tsx              # <html>, shriftlar, Header/Footer, i18n provider
      not-found.tsx           # 404 (lokalizatsiyalangan)
    layout.tsx                # root (passthrough)
    not-found.tsx             # global 404
    sitemap.ts / robots.ts    # SEO
    globals.css
  components/
    ui/                       # shadcn uslubidagi primitivlar (button, card, ...)
    site/                     # Header, Footer, Logo, LocaleSwitcher, ...
    sections/                 # Bosh sahifa bloklari (Hero, KpiStats, ...)
    cards/                    # EnsembleCard, ProjectCard, EventCard, ...
    shared/                   # Reveal, SectionTitle, PageHeader, Modal, Lightbox, ...
    features/                 # Interaktiv bloklar (filtr, tab, forma, galereya)
  data/                       # boshlangʻich maʼlumot (faqat seed uchun manba)
  types/                      # barcha TypeScript interfaceʼlar
  lib/                        # utils, constants, images, db, supabase/
  i18n/                       # routing, request, navigation (next-intl)
  middleware.ts               # locale yoʻnaltirish + /admin sessiyasi
messages/                     # uz.json, ru.json, en.json (UI matnlari)
```

---

## Koʻp tillilik qanday ishlaydi

Ikki qatlam mavjud:

1. **UI matnlari** — `messages/{uz,ru,en}.json` (tugmalar, sarlavhalar, forma yorliqlari).
   Komponentlarda `useTranslations('Namespace')` orqali olinadi.
2. **Kontent maʼlumotlari** — `src/data/*` fayllarda har bir maydon `Localized<T>`
   koʻrinishida saqlanadi:

   ```ts
   type Localized<T = string> = { uz: T; ru: T; en: T };
   ```

   Sahifada `pick(value, locale)` yordamchisi joriy tildagi qiymatni tanlaydi.

Til almashganda URL prefiksi oʻzgaradi (`/uz/...` → `/ru/...`), sahifa saqlanadi.

---

## 🔌 Backend — Supabase

Kontent bazadan olinadi; `src/data/*` fayllari endi faqat seed uchun manba
sifatida qolgan. Batafsil: [BAZA.md](./BAZA.md).

| Qatlam | Qayerda |
|--------|---------|
| Soʻrovlar | `src/server/queries/*` — Prisma orqali Supabase Postgres |
| Saytdagi formalar | `src/server/forms/amallar.ts` — server amallari, toʻgʻridan-toʻgʻri bazaga yozadi |
| Admin panel | `src/app/admin/` — kirish Supabase Auth, rol `admin_users` jadvalida |
| Fayl yuklash | `POST /api/admin/yuklash` — Supabase Storage (`media` bucket) |
| Supabase klientlari | `src/lib/supabase/` — `server.ts` (sessiya), `admin.ts` (xizmat kaliti) |

### `Localized<T>` — uch tilli maydonlar

Uch tildagi matn bazada bitta `jsonb` ustunda saqlanadi
(`{"uz":"...","ru":"...","en":"..."}`) va frontenddagi
`Localized<T>` tipiga aynan mos keladi — sahifada `pick(value, locale)`
joriy tildagi qiymatni tanlaydi.

---

## Rasmlar

Demoʻda barcha rasmlar `src/lib/images.ts` orqali markazlashtirilgan va hozircha
`picsum.photos` placeholderʼlaridan foydalanadi (hech qachon buzilmaydi).
Real orkestr/konsert/xor rasmlariga oʻtish uchun `img('seed')` chaqiruvlarini
haqiqiy URL yoki CDN manzillari bilan almashtiring. Yangi hostni
`next.config.mjs` → `images.remotePatterns` ga qoʻshishni unutmang.

---

## Litsenziya

Ushbu loyiha "Orkestr va Xor" ijodiy birlashmasi uchun ishlab chiqilgan.
