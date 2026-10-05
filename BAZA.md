# Maʼlumotlar bazasi — qoʻllanma

Sayt kontenti `src/data/*.ts` fayllardan emas, **Supabase Postgres** bazasidan olinadi.

---

## Tez boshlash

Baza Supabaseʼda turadi — kompyuterda hech narsa oʻrnatish shart emas.
Supabase loyihasini ochish va kalitlarni olish: [VERCEL.md](./VERCEL.md).

```bash
cp .env.example .env   # va Supabase qiymatlarini toʻldiring
npm install
npm run db:deploy      # jadvallarni yaratadi
npm run db:seed        # boshlangʻich maʼlumot bilan toʻldiradi
npm run dev            # http://localhost:3000
```

> Admin hisobi `.env` dagi `ADMIN_EMAIL` va `ADMIN_PASSWORD` bilan
> Supabase Authʼda ochiladi va unga ADMIN roli beriladi.
> `ADMIN_PASSWORD` boʻsh boʻlsa, hisob yaratilmaydi.

**Ikkita ulanish manzili bor:**

| Oʻzgaruvchi | Qachon ishlatiladi |
|-------------|--------------------|
| `DATABASE_URL` | sayt ish paytida — Supabase **transaction pooler** (port 6543) |
| `DIRECT_URL` | `prisma migrate` buyruqlari — toʻgʻridan-toʻgʻri ulanish (port 5432) |

---

## Buyruqlar

| Buyruq | Vazifasi |
|--------|----------|
| `npm run db:deploy` | Tayyor migratsiyalarni bazaga qoʻllaydi (Supabase uchun) |
| `npm run db:migrate` | Sxemadagi oʻzgarishni bazaga qoʻllaydi (migratsiya yaratadi) |
| `npm run db:seed` | Bazani boshlangʻich maʼlumot bilan toʻldiradi (avval tozalaydi) |
| `npm run db:matnlar` | Sahifa matnlarini `messages/*.json` dan bazaga sinxronlaydi |
| `npm run db:studio` | Brauzerda baza koʻrish/tahrirlash oynasini ochadi |
| `npm run db:generate` | Prisma klientini qayta yaratadi |
| `npm run db:reset` | Bazani butunlay tozalab, qaytadan quradi va toʻldiradi |

---

## Tuzilma

```
prisma/
  schema.prisma          # baza sxemasi — barcha jadvallar shu yerda
  migrations/            # baza tarixi (Gitʼga tushadi, oʻzgartirilmaydi)
  seed.ts                # boshlangʻich maʼlumot (src/data/* dan oʻqiydi)

src/
  lib/db.ts              # Prisma klienti (singleton)
  lib/supabase/
    muhit.ts             # Supabase muhit oʻzgaruvchilari bir joyda
    server.ts            # sessiya bilan ishlaydigan klient (cookie)
    admin.ts             # xizmat kaliti — Auth Admin API va Storage
  server/
    enums.ts             # baza enumʼlari <-> frontend tiplari
    map.ts               # Json -> Localized oʻgirish yordamchilari
    queries/             # sahifalar uchun oʻqish soʻrovlari
      ensembles.ts       # getEnsembles, getEnsembleBySlug, ...
      projects.ts
      competitions.ts
      events.ts
      news.ts
      experts.ts
      home.ts            # strategiya slaydlari, KPI, hamkorlar, vazifalar
      settings.ts        # kontakt maʼlumotlari, missiya matni
  generated/prisma/      # Prisma yaratgan kod (Gitʼga tushmaydi)
  data/                  # ESKI demo maʼlumot — endi faqat seed uchun manba
```

---

## Koʻp tillilik bazada

Uch tildagi matnlar bitta `jsonb` ustunda saqlanadi:

```json
{ "uz": "Oʻzbekiston Davlat simfonik orkestri",
  "ru": "Государственный симфонический оркестр Узбекистана",
  "en": "State Symphony Orchestra of Uzbekistan" }
```

Bu frontenddagi `Localized<T>` tipiga aynan mos keladi, shuning uchun sahifalardagi
`pick(value, locale)` chaqiruvlari oʻzgarmadi.

---

## Jadvallar

**Kontent:** `ensembles` (+ `ensemble_members`, `ensemble_repertoire`,
`ensemble_gallery`, `ensemble_videos`), `projects` (+ `project_results`,
`project_gallery`), `competitions` (+ `competition_timeline`, `competition_jury`),
`events`, `news`, `media_videos`, `media_photos`, `experts`, `leaders`,
`documents`, `strategy_slides`, `kpi_stats`, `partners`, `about_tasks`, `settings`

**Arizalar:** `contact_messages`, `ensemble_applications`,
`competition_applications`, `talent_applications`, `subscribers`

**Sayt matnlari:** `ui_texts` — tugma, sarlavha va izohlar (`messages/*.json` ustidan yoziladi)

**Tizim:** `admin_users`, `media_files`, `form_rate_hits`

Har bir kontent jadvalida:
- `published` — saytda koʻrinadimi (qoralama / eʼlon qilingan)
- `sortOrder` — admin panelda qoʻlda tartiblash uchun

---

## Muhim texnik shartlar

**Kodlash.** Supabase bazasi UTF-8 va `C.UTF-8` lokali bilan yaratiladi —
qoʻshimcha sozlash kerak emas. (Oʻzbekcha `oʻ`, `gʻ` belgilari va kirill
harflarida katta/kichik harfni farqlamaydigan qidiruv shunga bogʻliq.)

**Prisma 7 driver adapter talab qiladi** — `src/lib/db.ts` da `@prisma/adapter-pg`
orqali ulanadi, `DATABASE_URL` shu yerda oʻqiladi.

**Ulanishlar soni.** Vercelʼda har bir funksiya nusxasi oʻz hovuzini ochadi,
shuning uchun hovuz kichik ushlanadi (Vercelʼda 3, mahalliy ishda 5;
`DATABASE_POOL_MAX` bilan oʻzgartiriladi). Ulanish Supabaseʼning transaction
poolerʼi orqali boradi — pooler minglab qisqa ulanishni bitta bazaga jamlaydi.

---

## Sahifalar bazadan qanday oʻqiydi

Sahifalar build paytida tayyorlanadi va **har 5 daqiqada** bazadan qayta oʻqiladi
(`src/app/[locale]/layout.tsx` dagi `revalidate = 300`). Yaʼni bazadagi oʻzgarish
saytni qayta qurmasdan ham koʻrinadi.

Admin panelda biror yozuv saqlansa, `revalidatePath('/', 'layout')` chaqiriladi —
yaʼni tahrir qilingan zahoti sayt yangilanadi, 5 daqiqa kutish shart emas.

---

## Qidiruv

`GET /api/search?q=...&locale=uz` — jamoalar, loyihalar, tadbirlar va yangiliklar
sarlavhasi boʻyicha qidiradi. Butun maʼlumot brauzerga yuklanmaydi, qidiruv
serverda `ILIKE` bilan bajariladi.

---

## Admin panel (`/admin`)

Interfeys faqat oʻzbek tilida, sayt qismidan mustaqil (`src/app/admin/`).
Kirish — `/admin/kirish`: parolni **Supabase Auth** tekshiradi, sessiya
Supabase cookieʼsida saqlanadi va `src/middleware.ts` uni yangilab turadi.
Rol (`ADMIN` / `MUHARRIR` / `TANLOV`) va faollik esa `admin_users` jadvalida —
Supabaseʼda hisobi boʻlsa ham, jadvalda faol qaydi yoʻq odam panelga kira olmaydi.
Foydalanuvchi qoʻshish/oʻchirish va parol almashtirish Auth Admin API orqali
bajariladi (`src/server/admin/foydalanuvchilar.ts`).

`TANLOV` roli — "tanlov admini": panelda faqat "Tanlov va festivallar" va
"Tanlov arizalari" boʻlimlarini koʻradi. Ruxsat sahifalarda ham, server
amallarida ham tekshiriladi (`src/server/admin/huquq.ts`). Har bir tanlovning
ariza anketasini admin oʻzi tuzadi (`competitions.formFields`, tuzilmasi —
`src/lib/anketa.ts`), javoblar `competition_applications.answers` ga yoziladi.

**Boʻlimlar bitta joyda tavsiflanadi** — `src/server/admin/registr.ts`. Har bir
boʻlim uchun model nomi, maydonlar roʻyxati va roʻyxatdagi qator koʻrinishi
yoziladi; roʻyxat sahifasi (`/admin/<bolim>`), tahrirlash shakli
(`/admin/<bolim>/<id>`) va yangi yozuv (`/admin/<bolim>/yangi`) shu tavsifdan
avtomatik quriladi. Yangi boʻlim qoʻshish uchun registrga bitta yozuv va
`_lib/bolimlar.ts` dagi menyuga bitta qator qoʻshiladi — sahifa yozilmaydi.

Maydon turlari (`src/server/admin/turlar.ts`): `matn`, `matnKatta`, `raqam`,
`belgi`, `tanlov`, `sana`, `vaqt`, `havola`, `rasm`, `fayl`, `video`,
`youtube`, uch tilli `kopTilli` / `kopTilliKatta` / `kopTilliRoyxat` va
takrorlanuvchi `qatorlar` (aʼzolar, repertuar, galereya, hakamlar...).

**Manzil qismi (slug) panelda yoʻq** — muharrir faqat nomni yozadi. Slug
yozuv birinchi marta saqlanganda nomdan avtomatik yasaladi
(`src/lib/slug.ts`; kirill harflari lotinga oʻgiriladi, band nom oxiriga
raqam qoʻshiladi). Qaysi maydondan olinishi registrdagi `slugManbasi` da
koʻrsatiladi. Tahrirlashda slug **oʻzgarmaydi** — tarqatilgan havolalar
ishlab turaveradi.

Kam ishlatiladigan maydonga `qoshimcha: true` qoʻyiladi — u shaklda yopiq
"Qoʻshimcha maydonlar" boʻlimiga tushadi (ichida toʻldirilgani boʻlsa,
boʻlim ochiq holda chiqadi). Shakl shu tariqa qisqa va tushunarli qoladi.

> Bazada NULL qabul qilmaydigan ustunlar uchun maydonga `bosh` qiymati
> beriladi (masalan `sortOrder` uchun `bosh: 0`) — aks holda boʻsh qoldirilgan
> maydon saqlashda xato beradi.

Registrdan tashqari sahifalar: `/admin/arizalar` (murojaatlar holati va ichki
eslatma), `/admin/obuna`, `/admin/sozlamalar` (`settings` jadvali),
`/admin/foydalanuvchilar` (faqat ADMIN roli).

**Sahifa matnlari** (`/admin/matnlar`): saytdagi tayyor yozuvlar — tugmalar,
sarlavhalar, izohlar. Standart matnlar `messages/{uz,ru,en}.json` da qoladi,
admin tahriri esa `ui_texts` jadvalida saqlanadi va standart ustidan yoziladi.
Maydon boʻsh qoldirilsa — standart matn qaytadi. Kodga yangi matn qoʻshilganda
`npm run db:matnlar` ishga tushiriladi (bu buyruq mavjud tahrirlarga tegmaydi).

Panelga faqat **kodda haqiqatan ishlatiladigan** kalitlar chiqadi: skript `src/`
ni oʻqib, `useTranslations` orqali chaqirilgan kalitlarni aniqlaydi (dinamik
`t("type_" + x)` koʻrinishi ham hisobga olinadi). Ishlatilmaydigan kalit panelda
koʻrinmaydi — aks holda admin tahrirlaydi-yu, saytda hech narsa oʻzgarmaydi.

Shu sababdan `About.missionText` ham panelda yoʻq: missiya matni avval
`settings` jadvalidan olinadi, yaʼni **Sozlamalar** boʻlimida tahrirlanadi;
`messages` dagi matn faqat sozlama boʻsh boʻlganda ishlatiladi.

Sozlamalar saytning footerʼi, «Aloqa» sahifasi (manzil, telefon, email, ish
vaqti, ijtimoiy tarmoqlar va xarita nuqtasi) hamda «Haqida» sahifasidagi
missiya matnida ishlatiladi. Bazada kalit boʻlmasa, `src/lib/constants.ts`
dagi zaxira qiymat olinadi — shuning uchun baza boʻsh boʻlsa ham sayt ishlaydi.

**Rasm, hujjat va video yuklash** — fayl brauzerdan **toʻgʻridan-toʻgʻri**
Supabase Storageʼga ketadi, server orqali oʻtmaydi:

1. `POST /api/admin/yuklash` — sessiya, fayl turi va hajmi tekshiriladi,
   javobda bir martalik imzolangan manzil qaytadi;
2. brauzer faylni oʻsha manzilga `PUT` qiladi (`_lib/yuklash.ts`), yuklash
   foizi tugmada koʻrinib turadi;
3. `POST /api/admin/yuklash/qayd` — `media_files` jadvaliga qayd yoziladi
   (qayd yozilmasa ham fayl joyida qoladi).

Shu sxema tufayli Vercel funksiyasining soʻrov hajmi cheklovi yoʻl toʻsmaydi.
Yoʻl: `<papka>/<yil-oy>/<nom>-<tasodifiy>.<kengaytma>`.

Chegaralar va turlar bitta joyda — `src/lib/yuklash.ts` (server ham, brauzer
ham shundan oʻqiydi): rasm — JPG, PNG, WEBP, AVIF, GIF, SVG, 15 MB gacha;
hujjat — PDF, DOC, DOCX, XLS, XLSX, 30 MB gacha; video — MP4, WEBM, MOV,
50 MB gacha (Supabase loyihasining umumiy chegarasi ham 50 MB). Brauzer fayl
turini aytmasa (koʻpincha `.mov` bilan shunday boʻladi) tur kengaytmadan
aniqlanadi. HEIC va MKV kabi qabul qilinmaydigan formatlar uchun nima qilish
kerakligi yozilgan tushunarli xato chiqadi.

Shakldagi `rasm` maydoni rasm yuklaydi, `fayl` — hujjat (Hujjatlar boʻlimi,
tanlov nizomi, press-kit), `video` — video fayl.

**Videolar uch manbadan biri boʻlishi mumkin** (`media_videos`): YouTube ID,
Instagram havolasi (`instagramUrl`) yoki Storageʼga yuklangan fayl (`fileUrl`).
Instagram va yuklangan video uchun muqova rasmi (`coverUrl`) qoʻyiladi —
YouTube oʻz muqovasini oʻzi beradi. Uchtasidan hech biri toʻldirilmagan yozuv
saytda koʻrsatilmaydi.
Bazaga faylning toʻliq (public) manzili saqlanadi. Vercelʼda disk faqat oʻqish
uchun ochiq — shuning uchun fayllar loyihaning ichida emas, Storageʼda turadi.

---

## Saytdagi formalar

Beshta forma bazaga yozadi — barchasi `src/server/forms/amallar.ts` dagi server
amallari orqali (alohida API yoʻllari yoʻq):

| Forma | Amal | Jadval |
|-------|------|--------|
| Aloqa sahifasi | `aloqaYuborish` | `contact_messages` |
| «Qoʻshilish uchun ariza» | `jamoaArizasi` | `ensemble_applications` |
| Tanlov arizasi | `tanlovArizasi` | `competition_applications` |
| Isteʼdod platformasi | `talentArizasi` | `talent_applications` |
| Yangiliklar obunasi | `obunaQoshish` | `subscribers` |

Har bir ariza zod bilan tekshiriladi, soʻng admin panelning «Arizalar va
xabarlar» boʻlimida `YANGI` holatida koʻrinadi.

**Spamdan himoya:**
- har bir formada yashirin «tuzoq» maydoni — robot toʻldirsa, ariza yozilmaydi
  (foydalanuvchiga esa muvaffaqiyat koʻrsatiladi, robot buni bilmaydi);
- bitta IP dan 10 daqiqada 5 tadan koʻp ariza qabul qilinmaydi. Hisoblagich
  bazada (`form_rate_hits`) — Vercelʼda soʻrovlar bir nechta nusxada bajarilishi
  mumkin va xotiradagi hisoblagich ularga umumiy boʻlmaydi. Eskirgan izlar
  oʻz-oʻzidan tozalanadi.

Xato matni serverdan qaytmaydi — faqat kod (`tekshiruv` / `limit` / `xato`)
qaytadi, matnni klient foydalanuvchi tilida koʻrsatadi.

> Baza talab qiladigan maydonlar formada ham majburiy qilingan: jamoa arizasida
> shahar va rahbar, isteʼdod arizasida yosh, video havolasi va «oʻzi haqida».
> Aloqa formasida mavzu boʻsh qolsa, foydalanuvchi tilidagi «Umumiy murojaat»
> yoziladi.

Tanlov arizasi tanlovning `id` si bilan bogʻlanadi (`getCompetitionMeta`), va
server tanlov haqiqatan «ochiq» ekanini qayta tekshiradi.

---

## Keyingi bosqichlar

- [x] Admin panel (`/admin`) — kirish, kontentni tahrirlash, rasm yuklash
- [x] Formalarni bazaga ulash (aloqa, jamoa arizasi, tanlov arizasi, talent, obuna)
- [x] Vercel + Supabaseʼga moslash — [VERCEL.md](./VERCEL.md)
- [x] VDS uchun yoʻriqnoma va konfiguratsiyalar (keyinroq kerak boʻlsa) — [DEPLOY.md](./DEPLOY.md)
- [ ] Yangi ariza tushganda xabarnoma emaili (`notifyEmail` sozlamasi tayyor)
- [ ] Supabase loyihasini ochish va saytni Vercelʼga chiqarish (VERCEL.md boʻyicha)
