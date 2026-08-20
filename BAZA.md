# Ma'lumotlar bazasi — qo'llanma

Sayt kontenti `src/data/*.ts` fayllardan emas, **Supabase Postgres** bazasidan olinadi.

---

## Tez boshlash

Baza Supabase'da turadi — kompyuterda hech narsa o'rnatish shart emas.
Supabase loyihasini ochish va kalitlarni olish: [VERCEL.md](./VERCEL.md).

```bash
cp .env.example .env   # va Supabase qiymatlarini to'ldiring
npm install
npm run db:deploy      # jadvallarni yaratadi
npm run db:seed        # boshlang'ich ma'lumot bilan to'ldiradi
npm run dev            # http://localhost:3000
```

> Admin hisobi `.env` dagi `ADMIN_EMAIL` va `ADMIN_PASSWORD` bilan
> Supabase Auth'da ochiladi va unga ADMIN roli beriladi.
> `ADMIN_PASSWORD` bo'sh bo'lsa, hisob yaratilmaydi.

**Ikkita ulanish manzili bor:**

| O'zgaruvchi | Qachon ishlatiladi |
|-------------|--------------------|
| `DATABASE_URL` | sayt ish paytida — Supabase **transaction pooler** (port 6543) |
| `DIRECT_URL` | `prisma migrate` buyruqlari — to'g'ridan-to'g'ri ulanish (port 5432) |

---

## Buyruqlar

| Buyruq | Vazifasi |
|--------|----------|
| `npm run db:deploy` | Tayyor migratsiyalarni bazaga qo‘llaydi (Supabase uchun) |
| `npm run db:migrate` | Sxemadagi o'zgarishni bazaga qo'llaydi (migratsiya yaratadi) |
| `npm run db:seed` | Bazani boshlang'ich ma'lumot bilan to'ldiradi (avval tozalaydi) |
| `npm run db:matnlar` | Sahifa matnlarini `messages/*.json` dan bazaga sinxronlaydi |
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
  lib/supabase/
    muhit.ts             # Supabase muhit o'zgaruvchilari bir joyda
    server.ts            # sessiya bilan ishlaydigan klient (cookie)
    admin.ts             # xizmat kaliti — Auth Admin API va Storage
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

**Sayt matnlari:** `ui_texts` — tugma, sarlavha va izohlar (`messages/*.json` ustidan yoziladi)

**Tizim:** `admin_users`, `media_files`, `form_rate_hits`

Har bir kontent jadvalida:
- `published` — saytda ko'rinadimi (qoralama / e'lon qilingan)
- `sortOrder` — admin panelda qo'lda tartiblash uchun

---

## Muhim texnik shartlar

**Kodlash.** Supabase bazasi UTF-8 va `C.UTF-8` lokali bilan yaratiladi —
qo'shimcha sozlash kerak emas. (O'zbekcha `o‘`, `g‘` belgilari va kirill
harflarida katta/kichik harfni farqlamaydigan qidiruv shunga bog'liq.)

**Prisma 7 driver adapter talab qiladi** — `src/lib/db.ts` da `@prisma/adapter-pg`
orqali ulanadi, `DATABASE_URL` shu yerda o'qiladi.

**Ulanishlar soni.** Vercel'da har bir funksiya nusxasi o'z hovuzini ochadi,
shuning uchun hovuz kichik ushlanadi (Vercel'da 3, mahalliy ishda 5;
`DATABASE_POOL_MAX` bilan o'zgartiriladi). Ulanish Supabase'ning transaction
pooler'i orqali boradi — pooler minglab qisqa ulanishni bitta bazaga jamlaydi.

---

## Sahifalar bazadan qanday o'qiydi

Sahifalar build paytida tayyorlanadi va **har 5 daqiqada** bazadan qayta o'qiladi
(`src/app/[locale]/layout.tsx` dagi `revalidate = 300`). Ya'ni bazadagi o'zgarish
saytni qayta qurmasdan ham ko'rinadi.

Admin panelda biror yozuv saqlansa, `revalidatePath('/', 'layout')` chaqiriladi —
ya'ni tahrir qilingan zahoti sayt yangilanadi, 5 daqiqa kutish shart emas.

---

## Qidiruv

`GET /api/search?q=...&locale=uz` — jamoalar, loyihalar, tadbirlar va yangiliklar
sarlavhasi bo'yicha qidiradi. Butun ma'lumot brauzerga yuklanmaydi, qidiruv
serverda `ILIKE` bilan bajariladi.

---

## Admin panel (`/admin`)

Interfeys faqat o'zbek tilida, sayt qismidan mustaqil (`src/app/admin/`).
Kirish — `/admin/kirish`: parolni **Supabase Auth** tekshiradi, sessiya
Supabase cookie'sida saqlanadi va `src/middleware.ts` uni yangilab turadi.
Rol (`ADMIN` / `MUHARRIR`) va faollik esa `admin_users` jadvalida —
Supabase'da hisobi bo'lsa ham, jadvalda faol qaydi yo'q odam panelga kira olmaydi.
Foydalanuvchi qo'shish/o'chirish va parol almashtirish Auth Admin API orqali
bajariladi (`src/server/admin/foydalanuvchilar.ts`).

**Bo'limlar bitta joyda tavsiflanadi** — `src/server/admin/registr.ts`. Har bir
bo'lim uchun model nomi, maydonlar ro'yxati va ro'yxatdagi qator ko'rinishi
yoziladi; ro'yxat sahifasi (`/admin/<bolim>`), tahrirlash shakli
(`/admin/<bolim>/<id>`) va yangi yozuv (`/admin/<bolim>/yangi`) shu tavsifdan
avtomatik quriladi. Yangi bo'lim qo'shish uchun registrga bitta yozuv va
`_lib/bolimlar.ts` dagi menyuga bitta qator qo'shiladi — sahifa yozilmaydi.

Maydon turlari (`src/server/admin/turlar.ts`): `matn`, `matnKatta`, `slug`,
`raqam`, `belgi`, `tanlov`, `sana`, `vaqt`, `havola`, `rasm`, uch tilli
`kopTilli` / `kopTilliKatta` / `kopTilliRoyxat` va takrorlanuvchi `qatorlar`
(a'zolar, repertuar, galereya, hakamlar...).

> Bazada NULL qabul qilmaydigan ustunlar uchun maydonga `bosh` qiymati
> beriladi (masalan `sortOrder` uchun `bosh: 0`) — aks holda bo'sh qoldirilgan
> maydon saqlashda xato beradi.

Registrdan tashqari sahifalar: `/admin/arizalar` (murojaatlar holati va ichki
eslatma), `/admin/obuna`, `/admin/sozlamalar` (`settings` jadvali),
`/admin/foydalanuvchilar` (faqat ADMIN roli).

**Sahifa matnlari** (`/admin/matnlar`): saytdagi tayyor yozuvlar — tugmalar,
sarlavhalar, izohlar. Standart matnlar `messages/{uz,ru,en}.json` da qoladi,
admin tahriri esa `ui_texts` jadvalida saqlanadi va standart ustidan yoziladi.
Maydon bo'sh qoldirilsa — standart matn qaytadi. Kodga yangi matn qo'shilganda
`npm run db:matnlar` ishga tushiriladi (bu buyruq mavjud tahrirlarga tegmaydi).

Sozlamalar saytning footer'i, «Aloqa» sahifasi (manzil, telefon, email, ish
vaqti, ijtimoiy tarmoqlar va xarita nuqtasi) hamda «Haqida» sahifasidagi
missiya matnida ishlatiladi. Bazada kalit bo'lmasa, `src/lib/constants.ts`
dagi zaxira qiymat olinadi — shuning uchun baza bo'sh bo'lsa ham sayt ishlaydi.

**Rasm va hujjat yuklash:** `POST /api/admin/yuklash` — fayl **Supabase Storage**'dagi
`media` bucket'iga (`<papka>/<yil-oy>/<nom>`) yoziladi va `media_files`
jadvaliga qayd qilinadi. Rasmlar: JPG, PNG, WEBP, AVIF, SVG — 8 MB gacha;
hujjatlar: PDF, DOC, DOCX, XLS, XLSX — 20 MB gacha. Shakldagi `rasm` maydoni
rasm yuklaydi, `fayl` maydoni esa hujjat (Hujjatlar bo'limi va tanlov nizomi).
Bazaga faylning to'liq (public) manzili saqlanadi. Vercel'da disk faqat o'qish
uchun ochiq — shuning uchun fayllar loyihaning ichida emas, Storage'da turadi.

---

## Saytdagi formalar

Beshta forma bazaga yozadi — barchasi `src/server/forms/amallar.ts` dagi server
amallari orqali (alohida API yo'llari yo'q):

| Forma | Amal | Jadval |
|-------|------|--------|
| Aloqa sahifasi | `aloqaYuborish` | `contact_messages` |
| «Qo'shilish uchun ariza» | `jamoaArizasi` | `ensemble_applications` |
| Tanlov arizasi | `tanlovArizasi` | `competition_applications` |
| Iste'dod platformasi | `talentArizasi` | `talent_applications` |
| Yangiliklar obunasi | `obunaQoshish` | `subscribers` |

Har bir ariza zod bilan tekshiriladi, so'ng admin panelning «Arizalar va
xabarlar» bo'limida `YANGI` holatida ko'rinadi.

**Spamdan himoya:**
- har bir formada yashirin «tuzoq» maydoni — robot to'ldirsa, ariza yozilmaydi
  (foydalanuvchiga esa muvaffaqiyat ko'rsatiladi, robot buni bilmaydi);
- bitta IP dan 10 daqiqada 5 tadan ko'p ariza qabul qilinmaydi. Hisoblagich
  bazada (`form_rate_hits`) — Vercel'da so'rovlar bir nechta nusxada bajarilishi
  mumkin va xotiradagi hisoblagich ularga umumiy bo'lmaydi. Eskirgan izlar
  o'z-o'zidan tozalanadi.

Xato matni serverdan qaytmaydi — faqat kod (`tekshiruv` / `limit` / `xato`)
qaytadi, matnni klient foydalanuvchi tilida ko'rsatadi.

> Baza talab qiladigan maydonlar formada ham majburiy qilingan: jamoa arizasida
> shahar va rahbar, iste'dod arizasida yosh, video havolasi va «o'zi haqida».
> Aloqa formasida mavzu bo'sh qolsa, foydalanuvchi tilidagi «Umumiy murojaat»
> yoziladi.

Tanlov arizasi tanlovning `id` si bilan bog'lanadi (`getCompetitionMeta`), va
server tanlov haqiqatan «ochiq» ekanini qayta tekshiradi.

---

## Keyingi bosqichlar

- [x] Admin panel (`/admin`) — kirish, kontentni tahrirlash, rasm yuklash
- [x] Formalarni bazaga ulash (aloqa, jamoa arizasi, tanlov arizasi, talent, obuna)
- [x] Vercel + Supabase'ga moslash — [VERCEL.md](./VERCEL.md)
- [x] VDS uchun yo'riqnoma va konfiguratsiyalar (keyinroq kerak bo'lsa) — [DEPLOY.md](./DEPLOY.md)
- [ ] Yangi ariza tushganda xabarnoma emaili (`notifyEmail` sozlamasi tayyor)
- [ ] Supabase loyihasini ochish va saytni Vercel'ga chiqarish (VERCEL.md bo'yicha)
