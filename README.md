# "Orkestr va Xor" ijodiy birlashmasi — veb-sayt (frontend)

O‘zbekistonda orkestr va xor san’atini rivojlantiruvchi davlat ijodiy tashkiloti uchun
ko‘p tilli (uz / ru / en) frontend sayt. **Backend hozircha yo‘q** — barcha ma’lumot
`src/data/` papkasidagi typed mock fayllarda saqlanadi va keyinchalik API ga oson
almashtiriladi.

---

## Texnologiyalar

| Soha | Vosita |
|------|--------|
| Framework | **Next.js 14** (App Router) + **TypeScript** |
| Uslublar | **Tailwind CSS** + shadcn/ui uslubidagi komponentlar |
| Animatsiya | **framer-motion** (yumshoq fade-in / scroll animatsiyalari) |
| Ikonkalar | **lucide-react** |
| Ko‘p tillilik | **next-intl** (URL prefiks: `/uz`, `/ru`, `/en`) |
| Shriftlar | **Playfair Display** (sarlavha, serif) + **Manrope** (matn) |
| Deploy | **Vercel** ga tayyor |

Brend ranglari: to‘q ko‘k `#0B3C7D`, oltin `#C9A227`, oq.

---

## O‘rnatish va ishga tushirish

```bash
# 1. Bog‘liqliklarni o‘rnatish
npm install

# 2. Development server (http://localhost:3000 → /uz ga yo‘naltiradi)
npm run dev

# 3. Production build
npm run build
npm run start

# 4. Lint
npm run lint
```

> Node.js 18.17+ (tavsiya: 20+) talab qilinadi.

### Vercel ga deploy

1. Repozitoriyni GitHub ga yuklang.
2. [vercel.com](https://vercel.com) da "New Project" → repo ni tanlang.
3. Framework avtomatik **Next.js** deb aniqlanadi — hech qanday qo‘shimcha sozlash shart emas.
4. Deploy tugmasini bosing. Muhit o‘zgaruvchilari kerak emas (backend yo‘q).

Yoki CLI orqali: `npm i -g vercel && vercel`.

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
  data/                       # ⚙️ MOCK DATA — keyin API ga almashtiriladi
  types/                      # barcha TypeScript interface'lar
  lib/                        # utils, constants, images
  i18n/                       # routing, request, navigation (next-intl)
  middleware.ts               # locale yo‘naltirish
messages/                     # uz.json, ru.json, en.json (UI matnlari)
```

---

## Ko‘p tillilik qanday ishlaydi

Ikki qatlam mavjud:

1. **UI matnlari** — `messages/{uz,ru,en}.json` (tugmalar, sarlavhalar, forma yorliqlari).
   Komponentlarda `useTranslations('Namespace')` orqali olinadi.
2. **Kontent ma’lumotlari** — `src/data/*` fayllarda har bir maydon `Localized<T>`
   ko‘rinishida saqlanadi:

   ```ts
   type Localized<T = string> = { uz: T; ru: T; en: T };
   ```

   Sahifada `pick(value, locale)` yordamchisi joriy tildagi qiymatni tanlaydi.

Til almashganda URL prefiksi o‘zgaradi (`/uz/...` → `/ru/...`), sahifa saqlanadi.

---

## 🔌 Backend ulash (keyingi bosqich)

Har bir data fayli alohida va **typed** — API ga o‘tish uchun faqat data'ni
qaytaruvchi funksiyani `fetch` bilan almashtirish kifoya. Interfeys o‘zgarmaydi.

| Data fayli | Nima saqlaydi | Tavsiya etilgan API endpoint |
|------------|---------------|------------------------------|
| `data/ensembles.ts` | Orkestr / xor jamoalari | `GET /api/ensembles`, `GET /api/ensembles/:slug` |
| `data/projects.ts` | Loyihalar (respublika/xalqaro) | `GET /api/projects`, `GET /api/projects/:slug` |
| `data/competitions.ts` | Tanlov va festivallar | `GET /api/competitions`, `GET /api/competitions/:slug` |
| `data/events.ts` | Afisha (konsertlar) | `GET /api/events` |
| `data/news.ts` | Yangiliklar, video, foto | `GET /api/news`, `GET /api/news/:slug`, `GET /api/media` |
| `data/experts.ts` | Ekspertlar, rahbariyat, hujjatlar | `GET /api/experts`, `GET /api/leaders`, `GET /api/documents` |
| `data/kpi.ts` | KPI raqamlari, hamkorlar | `GET /api/stats`, `GET /api/partners` |

### Formalar (hozircha faqat UI validatsiya)

Quyidagi formalar `// UI-only: ... here later` izohi bilan belgilangan —
o‘sha joyga `fetch(POST ...)` qo‘shiladi:

- `components/site/newsletter-form.tsx` → `POST /api/subscribe`
- `components/features/contact-form.tsx` → `POST /api/contact`
- `components/features/apply-modal.tsx` → `POST /api/competitions/:slug/apply`
- `components/features/talent-form.tsx` → `POST /api/talent/apply`

### Muhim eslatma: `Localized<T>` va API

Agar backend bitta tildagi qiymatni qaytarsa, `pick()` chaqiruvlarini olib
tashlang. Agar backend uch tilni ham qaytarsa (`{ uz, ru, en }`), hech narsa
o‘zgartirmasdan ishlayveradi.

---

## Rasmlar

Demo’da barcha rasmlar `src/lib/images.ts` orqali markazlashtirilgan va hozircha
`picsum.photos` placeholder’laridan foydalanadi (hech qachon buzilmaydi).
Real orkestr/konsert/xor rasmlariga o‘tish uchun `img('seed')` chaqiruvlarini
haqiqiy URL yoki CDN manzillari bilan almashtiring. Yangi hostni
`next.config.mjs` → `images.remotePatterns` ga qo‘shishни unutmang.

---

## Litsenziya

Ushbu loyiha "Orkestr va Xor" ijodiy birlashmasi uchun ishlab chiqilgan.
