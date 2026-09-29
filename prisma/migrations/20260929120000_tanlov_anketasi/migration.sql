-- Tanlov va festivallar uchun alohida admin roli hamda admin o'zi tuzadigan
-- ariza anketasi.
--
--   TANLOV roli — admin panelda faqat "Tanlov va festivallar" bo'limini ko'radi
--   competitions.formFields — anketa savollari (admin paneldagi quruvchidan)
--   competition_applications.answers — ishtirokchining shu savollarga javoblari

ALTER TYPE "AdminRole" ADD VALUE IF NOT EXISTS 'TANLOV';

ALTER TABLE "competitions" ADD COLUMN IF NOT EXISTS "formFields" JSONB;

ALTER TABLE "competition_applications" ADD COLUMN IF NOT EXISTS "answers" JSONB;
