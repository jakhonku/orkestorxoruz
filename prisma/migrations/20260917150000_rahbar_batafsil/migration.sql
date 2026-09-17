-- Rahbarning to'liq ma'lumoti. Kartochkada qisqachasi turadi,
-- bu matn esa faqat "Batafsil" oynasida ochiladi.

ALTER TABLE "leaders" ADD COLUMN IF NOT EXISTS "fullBio" JSONB;
