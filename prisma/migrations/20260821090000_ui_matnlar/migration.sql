-- Sahifa matnlari (tugmalar, sarlavhalar, izohlar) endi bazadan olinadi.
-- `messages/*.json` standart qiymat bo'lib qoladi: bazada qator bo'lmasa
-- yoki bo'sh bo'lsa, o'sha standart matn ko'rsatiladi.

CREATE TABLE IF NOT EXISTS "ui_texts" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(160) NOT NULL,
    "grp" VARCHAR(60) NOT NULL,
    "value" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ui_texts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ui_texts_key_key" ON "ui_texts"("key");
CREATE INDEX IF NOT EXISTS "ui_texts_grp_key_idx" ON "ui_texts"("grp", "key");

ALTER TABLE "ui_texts" ENABLE ROW LEVEL SECURITY;
