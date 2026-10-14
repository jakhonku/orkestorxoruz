-- Mahalliy ekspertlar, yangiliklar tartibi va tanlov telefon raqami (hammasi qoʻshimcha ustunlar)
ALTER TABLE "experts" ADD COLUMN IF NOT EXISTS "local" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "news" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "competitions" ADD COLUMN IF NOT EXISTS "contactPhone" VARCHAR(40);
