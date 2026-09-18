-- Loyihaning o'z sayti. Xalqaro loyihalarda ko'proq kerak bo'ladi:
-- "Batafsil" sahifasida tugma bo'lib chiqadi va o'sha saytga olib boradi.

ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "websiteUrl" TEXT;
