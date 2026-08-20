-- Supabase Auth'ga o'tish
--
-- Parol endi Supabase Auth'da saqlanadi; "admin_users" jadvalida faqat
-- rol, ism va faollik qoladi. "authUserId" — auth.users.id ga bog'lanish.

ALTER TABLE "admin_users" DROP COLUMN IF EXISTS "passwordHash";
ALTER TABLE "admin_users" ADD COLUMN IF NOT EXISTS "authUserId" UUID;

CREATE UNIQUE INDEX IF NOT EXISTS "admin_users_authUserId_key" ON "admin_users"("authUserId");

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Supabase har bir jadvalni ochiq (anon) kalit orqali REST API'da ko'rsatadi.
-- Sayt bazaga faqat server tomonidan, Prisma orqali (postgres roli bilan)
-- murojaat qiladi — u RLS'ni chetlab o'tadi. Shuning uchun barcha jadvallarda
-- RLS yoqiladi va hech qanday siyosat berilmaydi: ochiq kalit bilan tashqaridan
-- na o'qish, na yozish mumkin bo'ladi.
-- ---------------------------------------------------------------------------

ALTER TABLE "ensembles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ensemble_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ensemble_repertoire" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ensemble_gallery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ensemble_videos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_results" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_gallery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "competitions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "competition_timeline" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "competition_jury" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "news" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "media_videos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "media_photos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "experts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leaders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "strategy_slides" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "kpi_stats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "partners" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "about_tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contact_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ensemble_applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "competition_applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "talent_applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscribers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "admin_users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "media_files" ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Formalar uchun spam chegarasi
--
-- Avval hisoblagich jarayon xotirasida edi — Vercel'da har bir so'rov alohida
-- nusxada bajarilishi mumkin, shuning uchun iz bazada saqlanadi.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "form_rate_hits" (
    "id" SERIAL NOT NULL,
    "ip" VARCHAR(64) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_rate_hits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "form_rate_hits_ip_createdAt_idx" ON "form_rate_hits"("ip", "createdAt");

ALTER TABLE "form_rate_hits" ENABLE ROW LEVEL SECURITY;
