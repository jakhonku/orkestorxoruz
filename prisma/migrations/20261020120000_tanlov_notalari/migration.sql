-- Tanlov ishtirokchilari yuklab oladigan notalar (tur boʻyicha)
CREATE TABLE IF NOT EXISTS "competition_notes" (
  "id" SERIAL NOT NULL,
  "competitionId" INTEGER NOT NULL,
  "category" JSONB NOT NULL,
  "title" JSONB NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "competition_notes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "competition_notes_competitionId_sortOrder_idx" ON "competition_notes"("competitionId", "sortOrder");
ALTER TABLE "competition_notes" ADD CONSTRAINT "competition_notes_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
