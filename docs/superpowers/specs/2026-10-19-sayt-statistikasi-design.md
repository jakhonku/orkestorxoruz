# Sayt statistikasi (admin panel) — dizayn

## Maqsad
Admin panelda haqiqiy ma'lumotga asoslangan «Statistika» sahifasi: ko'rishlar soni,
kunlik noyob tashrif buyuruvchilar, tashrif davomiyligi, davlatlar bo'yicha taqsimot.
Hisobotni grafiklar bilan PDF qilib yuklab olish mumkin.

## Qarorlar
- Ma'lumot o'z bazamizda (Postgres/Prisma), tashqi analitika yo'q.
- Davlat: `x-vercel-ip-country` sarlavhasidan (lokalda «Noma'lum»).
- Maxfiylik: IP va cookie saqlanmaydi. `visitorHash = sha256(IP + User-Agent + sana + tuz)`,
  hash har kuni o'zgaradi. Tuz — muhit o'zgaruvchisi `STATISTIKA_TUZ`.
- Botlar (User-Agent) va `/admin`, `/api` yozilmaydi.
- PDF serverda `pdf-lib` + mavjud shriftlar (`src/server/shriftlar`, `malumotnoma-pdf.ts` uslubi) bilan chiziladi.
- Ekrandagi grafiklar yengil inline SVG (yangi paket yo'q).

## 1. Ma'lumot modeli
`PageView` (`page_views`): `id Int`, `visitorHash VarChar(64)`, `path VarChar(300)`,
`locale VarChar(5)`, `country VarChar(2)?`, `durationSec Int @default(0)`, `createdAt`.
Indekslar: `(createdAt)`, `(country)`, `(visitorHash, createdAt)`. Yangi Prisma migratsiyasi.

## 2. Yig‘ish
- `POST /api/korish` — `{path, locale}` qabul qiladi, yozuv `id`sini qaytaradi.
  Bot/admin yo'llari va IP bo'yicha tezlik chegarasi (`FormRateHit` namunasida) bilan.
- `POST /api/korish/davomiylik` — `{id, sekund}`; `durationSec` yangilanadi (eng kamida 0, eng ko'pi 1800 bilan qirqiladi).
- `src/components/features/kuzatuvchi.tsx` (client) `[locale]/layout.tsx`ga qo'shiladi:
  sahifa ochilganda `fetch`, yopilganda/yashirilganda `sendBeacon`. Barcha xatolar jim yutiladi.

## 3. Hisob-kitob
`src/server/queries/statistika.ts` — davr (7/30/90 kun) bo'yicha SQL guruhlash:
jami ko'rishlar, kunlik noyob tashrif buyuruvchilar, o'rtacha davomiylik,
davlatlar (top 10 + «Boshqa»), top 10 sahifa. Kunlar bo'sh bo'lsa 0 bilan to'ldiriladi.

## 4. Admin sahifa
`/admin/statistika`: `sahifaRuxsati('statistika')`, yon menyu va `bolimlar`ga qo'shiladi.
Davr tanlagich, 4 kartochka, kunlik chiziqli grafik, davlatlar ustunli grafigi, top sahifalar jadvali.
Davlat nomi `Intl.DisplayNames('uz')`. Ma'lumot yo'q bo'lsa «Hozircha ma'lumot yo'q».

## 5. PDF
`GET /api/admin/statistika-pdf?davr=30` — faqat kirgan admin (mavjud `tanlov-excel` marshrutidagi
tekshiruv bilan). Tarkib: sarlavha + sana, kartochkalar, chiziqli grafik, ustunli grafik, top sahifalar.
Sahifada «PDF yuklab olish» tugmasi.

## 6. Xato va test
Kuzatuv saytni hech qachon sindirmaydi. Birlik testlari: hash, bot filtri, davr/kun to'ldirish.
PDF generatsiya qilinib ko'zdan kechiriladi. Eski yozuvlarni tozalash hozircha yo'q.
