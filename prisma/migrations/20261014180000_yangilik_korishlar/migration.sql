-- Yangilik sahifasining koʻrishlar soni
ALTER TABLE "news" ADD COLUMN IF NOT EXISTS "views" INTEGER NOT NULL DEFAULT 0;
