# Ma'lumotlar bazasi — qo'llanma

Sayt kontenti endi `src/data/*.ts` fayllardan emas, **PostgreSQL bazasidan** olinadi.

---

## Tez boshlash

Ikki terminal kerak bo'ladi.

**1-terminal — baza:**
```bash
npm run db:start
```
PostgreSQL 18 ni `.postgres/` papkasida ko'taradi. Docker ham, tizimga o'rnatish ham
kerak emas. Ma'lumot papkada saqlanadi — qayta ishga tushirilganda yo'qolmaydi.
To'xtatish: `Ctrl+C`.

**2-terminal — sayt:**
```bash
npm run dev
```

Birinchi marta ishga tushirganda bazani tayyorlash kerak:
```bash
cp .env.example .env   # va qiymatlarni to'ldiring
npm run db:migrate     # jadvallarni yaratadi
npm run db:seed        # boshlang'ich ma'lumot bilan to'ldiradi
```

> Admin foydalanuvchi `.env` dagi `ADMIN_EMAIL` va `ADMIN_PASSWORD` bilan yaratiladi.
> `ADMIN_PASSWORD` bo'sh bo'lsa, admin yaratilmaydi (parol kodda saqlanmaydi).

---

## Buyruqlar

| Buyruq | Vazifasi |
|--------|----------|
| `npm run db:start` | Mahalliy PostgreSQL serverini ishga tushiradi |
| `npm run db:migrate` | Sxemadagi o'zgarishni bazaga qo'llaydi (migratsiya yaratadi) |
| `npm run db:seed` | Bazani boshlang'ich ma'lumot bilan to'ldiradi (avval tozalaydi) |
| `npm run db:studio` | Brauzerda baza ko'rish/tahrirlash oynasini ochadi |
| `npm run db:generate` | Prisma klientini qayta yaratadi |
| `npm run db:reset` | Bazani butunlay tozalab, qaytadan quradi va to'ldiradi |

---

## Tuzilma

```
prisma/
  schema.prisma          # baza sxemasi — barcha jadvallar shu yerda
  migrations/            # baza tarixi (Git'ga tushadi, o'zgartirilmaydi)
  seed.ts                # boshlang'ich ma'lumot (src/data/* dan o'qiydi)

src/
  lib/db.ts              # Prisma klienti (singleton)
  server/
    enums.ts             # baza enum'lari <-> frontend tiplari
    map.ts               # Json -> Localized o'girish yordamchilari
    queries/             # sahifalar uchun o'qish so'rovlari
      ensembles.ts       # getEnsembles, getEnsembleBySlug, ...
      projects.ts
      competitions.ts
      events.ts
      news.ts
      experts.ts
      home.ts            # strategiya slaydlari, KPI, hamkorlar, vazifalar
      settings.ts        # kontakt ma'lumotlari, missiya matni
  generated/prisma/      # Prisma yaratgan kod (Git'ga tushmaydi)
  data/                  # ESKI demo ma'lumot — endi faqat seed uchun manba
```

---

## Ko'p tillilik bazada

Uch tildagi matnlar bitta `jsonb` ustunda saqlanadi:

```json
{ "uz": "O‘zbekiston Davlat simfonik orkestri",
  "ru": "Государственный симфонический оркестр Узбекистана",
  "en": "State Symphony Orchestra of Uzbekistan" }
```

Bu frontenddagi `Localized<T>` tipiga aynan mos keladi, shuning uchun sahifalardagi
`pick(value, locale)` chaqiruvlari o'zgarmadi.

---

## Jadvallar

**Kontent:** `ensembles` (+ `ensemble_members`, `ensemble_repertoire`,
`ensemble_gallery`, `ensemble_videos`), `projects` (+ `project_results`,
`project_gallery`), `competitions` (+ `competition_timeline`, `competition_jury`),
`events`, `news`, `media_videos`, `media_photos`, `experts`, `leaders`,
`documents`, `strategy_slides`, `kpi_stats`, `partners`, `about_tasks`, `settings`

**Arizalar:** `contact_messages`, `ensemble_applications`,
`competition_applications`, `talent_applications`, `subscribers`

**Tizim:** `admin_users`, `media_files`

Har bir kontent jadvalida:
- `published` — saytda ko'rinadimi (qoralama / e'lon qilingan)
- `sortOrder` — admin panelda qo'lda tartiblash uchun

---

## Muhim texnik shartlar

**Baza kodlashi UTF-8, lokal C.UTF-8 bo'lishi shart.**

Aks holda ikki muammo chiqadi:
1. O'zbekcha `o‘`, `g‘` belgilari buziladi (Windows'ning WIN1251 kodlashida)
2. Qidiruv kirill harflarida katta/kichik harfni farqlamay ishlamaydi

Serverda bazani shunday yarating:
```sql
CREATE DATABASE orkestrvaxor
  ENCODING 'UTF8'
  LOCALE_PROVIDER builtin
  BUILTIN_LOCALE 'C.UTF-8'
  TEMPLATE template0;
```

**Prisma 7 driver adapter talab qiladi** — `src/lib/db.ts` da `@prisma/adapter-pg`
orqali ulanadi, `DATABASE_URL` shu yerda o'qiladi.

---

## Sahifalar bazadan qanday o'qiydi

Sahifalar build paytida tayyorlanadi va **har 5 daqiqada** bazadan qayta o'qiladi
(`src/app/[locale]/layout.tsx` dagi `revalidate = 300`). Ya'ni bazadagi o'zgarish
saytni qayta qurmasdan ham ko'rinadi.

Admin panel qo'shilganda bu "darhol yangilash" (`revalidatePath`) bilan
almashtiriladi — o'shanda kutish ham kerak bo'lmaydi.

---

## Qidiruv

`GET /api/search?q=...&locale=uz` — jamoalar, loyihalar, tadbirlar va yangiliklar
sarlavhasi bo'yicha qidiradi. Butun ma'lumot brauzerga yuklanmaydi, qidiruv
serverda `ILIKE` bilan bajariladi.

---

## Keyingi bosqichlar

- [ ] Admin panel (`/admin`) — kirish, kontentni tahrirlash, rasm yuklash
- [ ] Formalarni bazaga ulash (aloqa, jamoa arizasi, tanlov arizasi, talent, obuna)
- [ ] Rasm yuklash (`/uploads` yoki obyekt saqlash)
- [ ] Serverga chiqarish (Ahost VDS: Nginx + Node + PostgreSQL + SSL + backup)
