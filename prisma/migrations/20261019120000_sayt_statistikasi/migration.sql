-- Sayt statistikasi: sahifa koʻrishlari (IP va cookie saqlanmaydi)
CREATE TABLE IF NOT EXISTS "page_views" (
    "id" SERIAL NOT NULL,
    "visitorHash" VARCHAR(64) NOT NULL,
    "path" VARCHAR(300) NOT NULL,
    "locale" VARCHAR(5) NOT NULL,
    "country" VARCHAR(2),
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "page_views_createdAt_idx" ON "page_views"("createdAt");
CREATE INDEX IF NOT EXISTS "page_views_country_idx" ON "page_views"("country");
CREATE INDEX IF NOT EXISTS "page_views_visitorHash_createdAt_idx" ON "page_views"("visitorHash", "createdAt");
