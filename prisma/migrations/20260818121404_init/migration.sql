-- CreateEnum
CREATE TYPE "EnsembleType" AS ENUM ('ORKESTR', 'XOR', 'ANSAMBL');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('TOSHKENT_SHAHRI', 'TOSHKENT', 'SAMARQAND', 'BUXORO', 'XORAZM', 'FARGONA', 'ANDIJON', 'NAMANGAN', 'QASHQADARYO', 'SURXONDARYO', 'NAVOIY', 'JIZZAX', 'SIRDARYO', 'QORAQALPOGISTON');

-- CreateEnum
CREATE TYPE "ProjectScope" AS ENUM ('RESPUBLIKA', 'XALQARO');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('REJALASHTIRILGAN', 'DAVOM_ETMOQDA', 'YAKUNLANGAN');

-- CreateEnum
CREATE TYPE "CompetitionKind" AS ENUM ('TANLOV', 'FESTIVAL');

-- CreateEnum
CREATE TYPE "CompetitionStatus" AS ENUM ('OCHIQ', 'YOPIQ', 'TEZ_KUNDA');

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('KONSERT', 'FESTIVAL', 'FORUM', 'TANLOV');

-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('YANGILIK', 'MATBUOT', 'ELON');

-- CreateEnum
CREATE TYPE "PhotoRatio" AS ENUM ('PORTRAIT', 'LANDSCAPE', 'SQUARE');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('YANGI', 'KORIB_CHIQILMOQDA', 'JAVOB_BERILDI', 'RAD_ETILDI');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'MUHARRIR');

-- CreateTable
CREATE TABLE "ensembles" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "name" JSONB NOT NULL,
    "type" "EnsembleType" NOT NULL,
    "region" "Region" NOT NULL,
    "city" JSONB NOT NULL,
    "conductor" VARCHAR(160) NOT NULL,
    "memberCount" INTEGER,
    "foundedYear" INTEGER,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "shortDescription" JSONB NOT NULL,
    "history" JSONB,
    "phone" VARCHAR(40),
    "email" VARCHAR(160),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ensembles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ensemble_members" (
    "id" SERIAL NOT NULL,
    "ensembleId" INTEGER NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "role" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ensemble_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ensemble_repertoire" (
    "id" SERIAL NOT NULL,
    "ensembleId" INTEGER NOT NULL,
    "composer" VARCHAR(160) NOT NULL,
    "work" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ensemble_repertoire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ensemble_gallery" (
    "id" SERIAL NOT NULL,
    "ensembleId" INTEGER NOT NULL,
    "src" TEXT NOT NULL,
    "caption" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ensemble_gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ensemble_videos" (
    "id" SERIAL NOT NULL,
    "ensembleId" INTEGER NOT NULL,
    "title" JSONB NOT NULL,
    "youtubeId" VARCHAR(40) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ensemble_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "title" JSONB NOT NULL,
    "scope" "ProjectScope" NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'YAKUNLANGAN',
    "coverUrl" TEXT,
    "period" JSONB NOT NULL,
    "location" JSONB NOT NULL,
    "shortDescription" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "partnersNote" JSONB,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_results" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "label" JSONB NOT NULL,
    "value" VARCHAR(60) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "project_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_gallery" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "src" TEXT NOT NULL,
    "caption" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "project_gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitions" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "title" JSONB NOT NULL,
    "kind" "CompetitionKind" NOT NULL,
    "status" "CompetitionStatus" NOT NULL DEFAULT 'TEZ_KUNDA',
    "coverUrl" TEXT,
    "date" JSONB NOT NULL,
    "location" JSONB NOT NULL,
    "shortDescription" JSONB NOT NULL,
    "regulations" JSONB NOT NULL,
    "regulationsFileUrl" TEXT,
    "applicationEmail" VARCHAR(160),
    "prizeFund" JSONB,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competition_timeline" (
    "id" SERIAL NOT NULL,
    "competitionId" INTEGER NOT NULL,
    "date" JSONB NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "competition_timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competition_jury" (
    "id" SERIAL NOT NULL,
    "competitionId" INTEGER NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "country" JSONB NOT NULL,
    "title" JSONB NOT NULL,
    "photoUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "competition_jury_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "title" JSONB NOT NULL,
    "category" "EventCategory" NOT NULL,
    "posterUrl" TEXT,
    "date" DATE NOT NULL,
    "time" VARCHAR(10) NOT NULL,
    "venue" JSONB NOT NULL,
    "city" JSONB NOT NULL,
    "ticketUrl" TEXT,
    "price" JSONB,
    "shortDescription" JSONB NOT NULL,
    "performerNote" JSONB,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "title" JSONB NOT NULL,
    "category" "NewsCategory" NOT NULL,
    "coverUrl" TEXT,
    "date" DATE NOT NULL,
    "author" JSONB NOT NULL,
    "excerpt" JSONB NOT NULL,
    "body" JSONB NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_videos" (
    "id" SERIAL NOT NULL,
    "title" JSONB NOT NULL,
    "youtubeId" VARCHAR(40) NOT NULL,
    "date" DATE NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "media_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_photos" (
    "id" SERIAL NOT NULL,
    "src" TEXT NOT NULL,
    "caption" JSONB NOT NULL,
    "ratio" "PhotoRatio" NOT NULL DEFAULT 'LANDSCAPE',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "media_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experts" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "countryCode" VARCHAR(2) NOT NULL,
    "country" JSONB NOT NULL,
    "photoUrl" TEXT,
    "role" JSONB NOT NULL,
    "bio" JSONB NOT NULL,
    "specialties" JSONB NOT NULL,
    "cooperation" JSONB,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "experts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaders" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "role" JSONB NOT NULL,
    "photoUrl" TEXT,
    "bio" JSONB NOT NULL,
    "honorific" JSONB,
    "receptionDay" JSONB,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" SERIAL NOT NULL,
    "title" JSONB NOT NULL,
    "href" TEXT NOT NULL,
    "meta" VARCHAR(60) NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategy_slides" (
    "id" SERIAL NOT NULL,
    "tag" JSONB NOT NULL,
    "title" JSONB NOT NULL,
    "text" JSONB NOT NULL,
    "points" JSONB NOT NULL,
    "imageUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "strategy_slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_stats" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL,
    "suffix" VARCHAR(8) NOT NULL,
    "icon" VARCHAR(40) NOT NULL,
    "label" JSONB NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "kpi_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "logoText" VARCHAR(60) NOT NULL,
    "logoUrl" TEXT,
    "country" JSONB NOT NULL,
    "url" TEXT,
    "agreement" VARCHAR(200),
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_tasks" (
    "id" SERIAL NOT NULL,
    "text" JSONB NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "about_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "key" VARCHAR(80) NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "subject" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "locale" VARCHAR(5) NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'YANGI',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ensemble_applications" (
    "id" SERIAL NOT NULL,
    "ensembleName" VARCHAR(200) NOT NULL,
    "type" "EnsembleType" NOT NULL,
    "region" "Region" NOT NULL,
    "city" VARCHAR(120) NOT NULL,
    "conductor" VARCHAR(160) NOT NULL,
    "memberCount" INTEGER,
    "contactName" VARCHAR(160) NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "phone" VARCHAR(40) NOT NULL,
    "message" TEXT,
    "locale" VARCHAR(5) NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'YANGI',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ensemble_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competition_applications" (
    "id" SERIAL NOT NULL,
    "competitionId" INTEGER,
    "fullName" VARCHAR(160) NOT NULL,
    "ensembleName" VARCHAR(200),
    "email" VARCHAR(160) NOT NULL,
    "phone" VARCHAR(40) NOT NULL,
    "category" VARCHAR(120),
    "message" TEXT,
    "locale" VARCHAR(5) NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'YANGI',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competition_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talent_applications" (
    "id" SERIAL NOT NULL,
    "fullName" VARCHAR(160) NOT NULL,
    "age" INTEGER NOT NULL,
    "instrument" VARCHAR(120) NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "phone" VARCHAR(40),
    "videoUrl" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "locale" VARCHAR(5) NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'YANGI',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "talent_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscribers" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "locale" VARCHAR(5) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'MUHARRIR',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_files" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "alt" JSONB,
    "folder" VARCHAR(60) NOT NULL DEFAULT 'umumiy',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ensembles_slug_key" ON "ensembles"("slug");

-- CreateIndex
CREATE INDEX "ensembles_type_idx" ON "ensembles"("type");

-- CreateIndex
CREATE INDEX "ensembles_region_idx" ON "ensembles"("region");

-- CreateIndex
CREATE INDEX "ensembles_published_sortOrder_idx" ON "ensembles"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "ensemble_members_ensembleId_sortOrder_idx" ON "ensemble_members"("ensembleId", "sortOrder");

-- CreateIndex
CREATE INDEX "ensemble_repertoire_ensembleId_sortOrder_idx" ON "ensemble_repertoire"("ensembleId", "sortOrder");

-- CreateIndex
CREATE INDEX "ensemble_gallery_ensembleId_sortOrder_idx" ON "ensemble_gallery"("ensembleId", "sortOrder");

-- CreateIndex
CREATE INDEX "ensemble_videos_ensembleId_sortOrder_idx" ON "ensemble_videos"("ensembleId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "projects_scope_idx" ON "projects"("scope");

-- CreateIndex
CREATE INDEX "projects_published_sortOrder_idx" ON "projects"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "project_results_projectId_sortOrder_idx" ON "project_results"("projectId", "sortOrder");

-- CreateIndex
CREATE INDEX "project_gallery_projectId_sortOrder_idx" ON "project_gallery"("projectId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "competitions_slug_key" ON "competitions"("slug");

-- CreateIndex
CREATE INDEX "competitions_kind_idx" ON "competitions"("kind");

-- CreateIndex
CREATE INDEX "competitions_status_idx" ON "competitions"("status");

-- CreateIndex
CREATE INDEX "competitions_published_sortOrder_idx" ON "competitions"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "competition_timeline_competitionId_sortOrder_idx" ON "competition_timeline"("competitionId", "sortOrder");

-- CreateIndex
CREATE INDEX "competition_jury_competitionId_sortOrder_idx" ON "competition_jury"("competitionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE INDEX "events_date_idx" ON "events"("date");

-- CreateIndex
CREATE INDEX "events_category_idx" ON "events"("category");

-- CreateIndex
CREATE INDEX "events_published_date_idx" ON "events"("published", "date");

-- CreateIndex
CREATE UNIQUE INDEX "news_slug_key" ON "news"("slug");

-- CreateIndex
CREATE INDEX "news_date_idx" ON "news"("date");

-- CreateIndex
CREATE INDEX "news_category_idx" ON "news"("category");

-- CreateIndex
CREATE INDEX "news_published_date_idx" ON "news"("published", "date");

-- CreateIndex
CREATE INDEX "media_videos_published_date_idx" ON "media_videos"("published", "date");

-- CreateIndex
CREATE INDEX "media_photos_published_sortOrder_idx" ON "media_photos"("published", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "experts_slug_key" ON "experts"("slug");

-- CreateIndex
CREATE INDEX "experts_published_sortOrder_idx" ON "experts"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "leaders_published_sortOrder_idx" ON "leaders"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "documents_published_sortOrder_idx" ON "documents"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "strategy_slides_published_sortOrder_idx" ON "strategy_slides"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "kpi_stats_published_sortOrder_idx" ON "kpi_stats"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "partners_published_sortOrder_idx" ON "partners"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "about_tasks_published_sortOrder_idx" ON "about_tasks"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "contact_messages_status_createdAt_idx" ON "contact_messages"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ensemble_applications_status_createdAt_idx" ON "ensemble_applications"("status", "createdAt");

-- CreateIndex
CREATE INDEX "competition_applications_competitionId_createdAt_idx" ON "competition_applications"("competitionId", "createdAt");

-- CreateIndex
CREATE INDEX "competition_applications_status_createdAt_idx" ON "competition_applications"("status", "createdAt");

-- CreateIndex
CREATE INDEX "talent_applications_status_createdAt_idx" ON "talent_applications"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_email_key" ON "subscribers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "media_files_url_key" ON "media_files"("url");

-- CreateIndex
CREATE INDEX "media_files_folder_createdAt_idx" ON "media_files"("folder", "createdAt");

-- AddForeignKey
ALTER TABLE "ensemble_members" ADD CONSTRAINT "ensemble_members_ensembleId_fkey" FOREIGN KEY ("ensembleId") REFERENCES "ensembles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ensemble_repertoire" ADD CONSTRAINT "ensemble_repertoire_ensembleId_fkey" FOREIGN KEY ("ensembleId") REFERENCES "ensembles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ensemble_gallery" ADD CONSTRAINT "ensemble_gallery_ensembleId_fkey" FOREIGN KEY ("ensembleId") REFERENCES "ensembles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ensemble_videos" ADD CONSTRAINT "ensemble_videos_ensembleId_fkey" FOREIGN KEY ("ensembleId") REFERENCES "ensembles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_results" ADD CONSTRAINT "project_results_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_gallery" ADD CONSTRAINT "project_gallery_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_timeline" ADD CONSTRAINT "competition_timeline_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_jury" ADD CONSTRAINT "competition_jury_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_applications" ADD CONSTRAINT "competition_applications_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
