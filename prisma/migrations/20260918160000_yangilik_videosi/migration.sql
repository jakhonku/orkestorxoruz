-- Yangilikka video havolasi (YouTube yoki Instagram) qo'shiladi.
-- Yangilik sahifasida matn tepasida pleyer bo'lib ochiladi.

ALTER TABLE "news" ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;
