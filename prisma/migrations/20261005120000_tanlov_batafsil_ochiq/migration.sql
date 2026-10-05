-- "Tez kunda" tanlovning batafsil sahifasini admin ochib-yopadi (odatda yopiq).
ALTER TABLE "competitions" ADD COLUMN IF NOT EXISTS "detailOpen" BOOLEAN NOT NULL DEFAULT false;
