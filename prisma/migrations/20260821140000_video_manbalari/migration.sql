-- Videolar endi uch manbadan biri bo'lishi mumkin:
--   YouTube ID, Instagram havolasi yoki Storage'ga yuklangan video fayl.
--
-- Shu sababdan "youtubeId" majburiy bo'lmay qoldi va uchta yangi ustun qo'shildi.

ALTER TABLE "media_videos" ALTER COLUMN "youtubeId" DROP NOT NULL;

ALTER TABLE "media_videos" ADD COLUMN IF NOT EXISTS "instagramUrl" TEXT;
ALTER TABLE "media_videos" ADD COLUMN IF NOT EXISTS "fileUrl" TEXT;
ALTER TABLE "media_videos" ADD COLUMN IF NOT EXISTS "coverUrl" TEXT;
