-- Har bir tanlov/festivalning o'z hujjatlari ro'yxati (admin paneldan qo'shiladi).

CREATE TABLE IF NOT EXISTS "competition_documents" (
    "id" SERIAL NOT NULL,
    "competitionId" INTEGER NOT NULL,
    "title" JSONB NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "competition_documents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "competition_documents_competitionId_sortOrder_idx"
    ON "competition_documents"("competitionId", "sortOrder");

DO $$ BEGIN
  ALTER TABLE "competition_documents"
    ADD CONSTRAINT "competition_documents_competitionId_fkey"
    FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
