-- Ariza muddati endi sana + vaqt. Avvalgi sana (kun oxirigacha, Toshkent) -> 23:59:59 Toshkent = 18:59:59 UTC
ALTER TABLE "competitions"
  ALTER COLUMN "applicationDeadline" TYPE TIMESTAMP(3)
  USING ("applicationDeadline"::timestamp + interval '18 hours 59 minutes 59 seconds');
