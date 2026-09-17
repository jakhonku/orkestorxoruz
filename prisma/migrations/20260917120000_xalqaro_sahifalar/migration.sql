-- "Xalqaro" menyusidagi erkin sahifalar.
-- Admin paneldan qo'shiladi, menyuga va /xalqaro ro'yxatiga o'zi chiqadi.

CREATE TABLE IF NOT EXISTS "international_pages" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "title" JSONB NOT NULL,
    "summary" JSONB NOT NULL,
    "body" JSONB,
    "coverUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "international_pages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "international_pages_slug_key" ON "international_pages"("slug");
CREATE INDEX IF NOT EXISTS "international_pages_published_sortOrder_idx" ON "international_pages"("published", "sortOrder");

CREATE TABLE IF NOT EXISTS "international_page_links" (
    "id" SERIAL NOT NULL,
    "pageId" INTEGER NOT NULL,
    "label" JSONB NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "international_page_links_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "international_page_links_pageId_sortOrder_idx" ON "international_page_links"("pageId", "sortOrder");

ALTER TABLE "international_page_links"
    ADD CONSTRAINT "international_page_links_pageId_fkey"
    FOREIGN KEY ("pageId") REFERENCES "international_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "international_pages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "international_page_links" ENABLE ROW LEVEL SECURITY;
