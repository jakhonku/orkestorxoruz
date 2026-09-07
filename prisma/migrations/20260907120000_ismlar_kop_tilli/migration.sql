-- Ism va familiyalar endi uch tilda saqlanadi.
--
-- Lotin, kirill va inglizcha yozuv bir-biridan farq qiladi ("Aziz Shohakimov"
-- / "Азиз Шохакимов"), shuning uchun bu ustunlar ham boshqa matnlar kabi
-- jsonb ga o'tkazildi: {"uz": "...", "ru": "...", "en": "..."}.
--
-- Mavjud yozuvlar "uz" ga ko'chiriladi, "ru" va "en" bo'sh qoladi —
-- saytda bo'sh til uchun o'zbekchasi ko'rsatiladi (`pick` zaxira tartibi),
-- ya'ni migratsiyadan keyin sayt ko'rinishi o'zgarmaydi.

ALTER TABLE "ensembles"
  ALTER COLUMN "conductor" TYPE jsonb
  USING jsonb_build_object('uz', "conductor", 'ru', '', 'en', '');

ALTER TABLE "ensemble_members"
  ALTER COLUMN "name" TYPE jsonb
  USING jsonb_build_object('uz', "name", 'ru', '', 'en', '');

ALTER TABLE "ensemble_repertoire"
  ALTER COLUMN "composer" TYPE jsonb
  USING jsonb_build_object('uz', "composer", 'ru', '', 'en', '');

ALTER TABLE "competition_jury"
  ALTER COLUMN "name" TYPE jsonb
  USING jsonb_build_object('uz', "name", 'ru', '', 'en', '');

ALTER TABLE "experts"
  ALTER COLUMN "name" TYPE jsonb
  USING jsonb_build_object('uz', "name", 'ru', '', 'en', '');

ALTER TABLE "leaders"
  ALTER COLUMN "name" TYPE jsonb
  USING jsonb_build_object('uz', "name", 'ru', '', 'en', '');
