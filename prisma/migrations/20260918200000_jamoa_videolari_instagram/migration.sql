-- Jamoa videolari endi Instagram postidan ham bo'lishi mumkin.
-- Shu sababli "youtubeId" majburiy bo'lmay qoldi.

ALTER TABLE "ensemble_videos" ALTER COLUMN "youtubeId" DROP NOT NULL;

ALTER TABLE "ensemble_videos" ADD COLUMN IF NOT EXISTS "instagramUrl" TEXT;
ALTER TABLE "ensemble_videos" ADD COLUMN IF NOT EXISTS "coverUrl" TEXT;
