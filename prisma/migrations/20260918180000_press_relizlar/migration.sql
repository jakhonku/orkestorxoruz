-- "Media → Matbuot uchun" bo'limidagi press-relizlar.
-- Tadbir nomi, sanasi, matni va (ixtiyoriy) fayli.

CREATE TABLE IF NOT EXISTS "press_releases" (
    "id" SERIAL NOT NULL,
    "title" JSONB NOT NULL,
    "date" DATE NOT NULL,
    "summary" JSONB,
    "body" JSONB NOT NULL,
    "fileUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "press_releases_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "press_releases_published_date_idx" ON "press_releases"("published", "date");
