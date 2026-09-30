-- Tanlov sahifasidagi "Ishtirok etish" kartasi matnlari admin paneldan tahrirlanadi.
-- Bo'sh qoldirilsa saytdagi standart matn ishlatiladi.

ALTER TABLE "competitions" ADD COLUMN IF NOT EXISTS "participateTitle" JSONB;
ALTER TABLE "competitions" ADD COLUMN IF NOT EXISTS "participateText" JSONB;
ALTER TABLE "competitions" ADD COLUMN IF NOT EXISTS "prepareTitle" JSONB;
ALTER TABLE "competitions" ADD COLUMN IF NOT EXISTS "prepareList" JSONB;
