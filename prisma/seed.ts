/**
 * Bazani boshlang'ich ma'lumot bilan to'ldirish.
 *
 * Manba — saytda hozir ishlatilayotgan `src/data/*` fayllari va `messages/*.json`.
 * Ya'ni seed'dan keyin sayt tashqi ko'rinishi AYNAN hozirgidek qoladi,
 * faqat ma'lumot fayllardan emas, bazadan olinadi.
 *
 * Ishga tushirish:  npm run db:seed
 * Skript idempotent — qayta-qayta ishlatish mumkin (avval tozalaydi).
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client';
import { ensembles } from '../src/data/ensembles';
import { projects } from '../src/data/projects';
import { competitions } from '../src/data/competitions';
import { events } from '../src/data/events';
import { news, mediaVideos, mediaPhotos } from '../src/data/news';
import { experts, leaders, documents } from '../src/data/experts';
import { kpiStats, partners } from '../src/data/kpi';
import { SITE, SOCIALS } from '../src/lib/constants';
import {
  competitionKindToDb,
  competitionStatusToDb,
  ensembleTypeToDb,
  eventCategoryToDb,
  newsCategoryToDb,
  photoRatioToDb,
  projectScopeToDb,
  regionToDb,
} from '../src/server/enums';

import uz from '../messages/uz.json';
import ru from '../messages/ru.json';
import en from '../messages/en.json';

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

/** Bosh sahifa slaydlari uchun fon rasmlari (hero.tsx dagi tartib) */
const SLIDE_IMAGES = [
  '/hero/dso.jpg',
  '/hero/festival.jpg',
  '/hero/winds.jpg',
  '/hero/choir.jpg',
  '/hero.png',
  '/hero/festival.jpg',
  '/hero/dso.jpg',
  '/hero/choir.jpg',
];

/** Uchta tildagi qiymatdan Localized obyekt yasaydi */
const L = (u: string, r: string, e: string) => ({ uz: u, ru: r, en: e });

async function tozalash() {
  // Tartib muhim: bog'liq jadvallar avval o'chiriladi
  await db.$transaction([
    db.ensembleMember.deleteMany(),
    db.repertoireItem.deleteMany(),
    db.ensembleGalleryPhoto.deleteMany(),
    db.ensembleVideo.deleteMany(),
    db.ensemble.deleteMany(),
    db.projectResult.deleteMany(),
    db.projectGalleryPhoto.deleteMany(),
    db.project.deleteMany(),
    db.competitionStage.deleteMany(),
    db.juryMember.deleteMany(),
    db.competition.deleteMany(),
    db.concertEvent.deleteMany(),
    db.newsArticle.deleteMany(),
    db.mediaVideo.deleteMany(),
    db.mediaPhoto.deleteMany(),
    db.expert.deleteMany(),
    db.leader.deleteMany(),
    db.documentLink.deleteMany(),
    db.strategySlide.deleteMany(),
    db.kpiStat.deleteMany(),
    db.partner.deleteMany(),
    db.aboutTask.deleteMany(),
    db.setting.deleteMany(),
  ]);
}

async function jamoalar() {
  for (const [i, e] of ensembles.entries()) {
    await db.ensemble.create({
      data: {
        slug: e.slug,
        name: e.name,
        type: ensembleTypeToDb[e.type],
        region: regionToDb[e.region],
        city: e.city,
        conductor: e.conductor,
        memberCount: e.memberCount,
        foundedYear: e.foundedYear,
        logoUrl: e.logo,
        bannerUrl: e.banner,
        shortDescription: e.shortDescription,
        history: e.history,
        featured: e.featured ?? false,
        sortOrder: i,
        members: {
          create: e.members.map((m, j) => ({ name: m.name, role: m.role, sortOrder: j })),
        },
        repertoire: {
          create: e.repertoire.map((r, j) => ({
            composer: r.composer,
            work: r.work,
            sortOrder: j,
          })),
        },
        gallery: {
          create: e.gallery.map((g, j) => ({ src: g.src, caption: g.caption, sortOrder: j })),
        },
        videos: {
          create: e.videos.map((v, j) => ({
            title: v.title,
            youtubeId: v.youtubeId,
            sortOrder: j,
          })),
        },
      },
    });
  }
  console.log(`  jamoalar:            ${ensembles.length}`);
}

async function loyihalar() {
  for (const [i, p] of projects.entries()) {
    await db.project.create({
      data: {
        slug: p.slug,
        title: p.title,
        scope: projectScopeToDb[p.scope],
        coverUrl: p.cover,
        period: p.period,
        location: p.location,
        shortDescription: p.shortDescription,
        description: p.description,
        featured: p.featured ?? false,
        sortOrder: i,
        results: {
          create: p.results.map((r, j) => ({ label: r.label, value: r.value, sortOrder: j })),
        },
        gallery: {
          create: p.gallery.map((g, j) => ({ src: g.src, caption: g.caption, sortOrder: j })),
        },
      },
    });
  }
  console.log(`  loyihalar:           ${projects.length}`);
}

async function tanlovlar() {
  for (const [i, c] of competitions.entries()) {
    await db.competition.create({
      data: {
        slug: c.slug,
        title: c.title,
        kind: competitionKindToDb[c.kind],
        status: competitionStatusToDb[c.status],
        coverUrl: c.cover,
        date: c.date,
        location: c.location,
        shortDescription: c.shortDescription,
        regulations: c.regulations,
        sortOrder: i,
        timeline: {
          create: c.timeline.map((s, j) => ({
            date: s.date,
            title: s.title,
            description: s.description,
            sortOrder: j,
          })),
        },
        jury: {
          create: c.jury.map((j2, j) => ({
            name: j2.name,
            country: j2.country,
            title: j2.title,
            sortOrder: j,
          })),
        },
      },
    });
  }
  console.log(`  tanlovlar:           ${competitions.length}`);
}

async function afisha() {
  for (const e of events) {
    await db.concertEvent.create({
      data: {
        slug: e.slug,
        title: e.title,
        category: eventCategoryToDb[e.category],
        posterUrl: e.poster,
        date: new Date(e.date),
        time: e.time,
        venue: e.venue,
        city: e.city,
        ticketUrl: e.ticketUrl,
        price: e.price ?? undefined,
        shortDescription: e.shortDescription,
        featured: e.featured ?? false,
      },
    });
  }
  console.log(`  afisha (konsertlar): ${events.length}`);
}

async function media() {
  for (const n of news) {
    await db.newsArticle.create({
      data: {
        slug: n.slug,
        title: n.title,
        category: newsCategoryToDb[n.category],
        coverUrl: n.cover,
        date: new Date(n.date),
        author: n.author,
        excerpt: n.excerpt,
        body: n.body,
        featured: n.featured ?? false,
      },
    });
  }

  for (const [i, v] of mediaVideos.entries()) {
    await db.mediaVideo.create({
      data: { title: v.title, youtubeId: v.youtubeId, date: new Date(v.date), sortOrder: i },
    });
  }

  for (const [i, p] of mediaPhotos.entries()) {
    await db.mediaPhoto.create({
      data: { src: p.src, caption: p.caption, ratio: photoRatioToDb[p.ratio], sortOrder: i },
    });
  }

  console.log(`  yangiliklar:         ${news.length}`);
  console.log(`  videolar:            ${mediaVideos.length}`);
  console.log(`  fotolar:             ${mediaPhotos.length}`);
}

async function odamlar() {
  for (const [i, e] of experts.entries()) {
    await db.expert.create({
      data: {
        slug: e.slug,
        name: e.name,
        countryCode: e.countryCode,
        country: e.country,
        photoUrl: e.photo,
        role: e.role,
        bio: e.bio,
        specialties: e.specialties,
        sortOrder: i,
      },
    });
  }

  for (const [i, l] of leaders.entries()) {
    await db.leader.create({
      data: { name: l.name, role: l.role, photoUrl: l.photo, bio: l.bio, sortOrder: i },
    });
  }

  for (const [i, d] of documents.entries()) {
    await db.documentLink.create({
      data: { title: d.title, href: d.href, meta: d.meta, sortOrder: i },
    });
  }

  console.log(`  ekspertlar:          ${experts.length}`);
  console.log(`  rahbariyat:          ${leaders.length}`);
  console.log(`  hujjatlar:           ${documents.length}`);
}

async function boshSahifa() {
  // --- Strategiya slaydlari (messages/*.json dan) ---
  const uzSlides = uz.Home.strategy.slides;
  const ruSlides = ru.Home.strategy.slides;
  const enSlides = en.Home.strategy.slides;

  for (const [i, s] of uzSlides.entries()) {
    await db.strategySlide.create({
      data: {
        tag: L(s.tag, ruSlides[i].tag, enSlides[i].tag),
        title: L(s.title, ruSlides[i].title, enSlides[i].title),
        text: L(s.text, ruSlides[i].text, enSlides[i].text),
        points: { uz: s.points, ru: ruSlides[i].points, en: enSlides[i].points },
        imageUrl: SLIDE_IMAGES[i] ?? SLIDE_IMAGES[0],
        sortOrder: i,
      },
    });
  }

  // --- KPI ko'rsatkichlari ---
  for (const [i, k] of kpiStats.entries()) {
    await db.kpiStat.create({
      data: { value: k.value, suffix: k.suffix, icon: k.icon, label: k.label, sortOrder: i },
    });
  }

  // --- Hamkorlar ---
  for (const [i, p] of partners.entries()) {
    await db.partner.create({
      data: {
        name: p.name,
        logoText: p.logoText,
        logoUrl: p.logo,
        country: p.country,
        url: p.url,
        sortOrder: i,
      },
    });
  }

  // --- "Birlashma haqida" sahifasidagi 6 ta vazifa ---
  const taskKeys = ['task1', 'task2', 'task3', 'task4', 'task5', 'task6'] as const;
  for (const [i, key] of taskKeys.entries()) {
    await db.aboutTask.create({
      data: { text: L(uz.About[key], ru.About[key], en.About[key]), sortOrder: i },
    });
  }

  console.log(`  strategiya slaydlari:${String(uzSlides.length).padStart(3)}`);
  console.log(`  KPI ko'rsatkichlari: ${kpiStats.length}`);
  console.log(`  hamkorlar:           ${partners.length}`);
  console.log(`  vazifalar:           ${taskKeys.length}`);
}

async function sozlamalar() {
  const entries: { key: string; value: unknown }[] = [
    { key: 'siteName', value: SITE.name },
    { key: 'siteShortName', value: SITE.shortName },
    { key: 'slogan', value: SITE.slogan },
    { key: 'address', value: SITE.address },
    { key: 'phone', value: SITE.phone },
    { key: 'email', value: SITE.email },
    { key: 'siteUrl', value: SITE.url },
    { key: 'socials', value: SOCIALS },
    { key: 'missionText', value: L(uz.About.missionText, ru.About.missionText, en.About.missionText) },
    {
      key: 'workingHours',
      value: L('Dushanba–Juma, 09:00–18:00', 'Понедельник–Пятница, 09:00–18:00', 'Monday–Friday, 09:00–18:00'),
    },
    { key: 'mapCoords', value: { lat: 41.311081, lng: 69.279737 } },
    // Formalardan kelgan arizalar shu manzilga yuboriladi
    { key: 'notifyEmail', value: SITE.email },
  ];

  for (const e of entries) {
    await db.setting.create({ data: { key: e.key, value: e.value as never } });
  }
  console.log(`  sozlamalar:          ${entries.length}`);
}

async function adminFoydalanuvchi() {
  // Parol .env dan olinadi — kodda ochiq saqlanmaydi.
  // Hisob Supabase Auth'da ochiladi, bazada esa faqat rol va ism saqlanadi.
  const email = process.env.ADMIN_EMAIL ?? 'admin@orkestrvaxor.uz';
  const parol = process.env.ADMIN_PASSWORD;

  if (!parol) {
    console.log('');
    console.log('  Admin foydalanuvchi yaratilmadi: ADMIN_PASSWORD o‘rnatilmagan.');
    console.log('  .env fayliga qo‘shing, masalan:  ADMIN_PASSWORD="kuchli-parol"');
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const xizmatKaliti = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !xizmatKaliti) {
    console.log('');
    console.log('  Admin foydalanuvchi yaratilmadi: NEXT_PUBLIC_SUPABASE_URL yoki');
    console.log('  SUPABASE_SERVICE_ROLE_KEY o‘rnatilmagan.');
    return;
  }

  const supabase = createClient(url, xizmatKaliti, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Hisob bor bo'lsa — paroli yangilanadi, yo'q bo'lsa — yaratiladi
  const { data: royxat } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const bor = royxat?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  let authUserId = bor?.id ?? null;
  if (authUserId) {
    await supabase.auth.admin.updateUserById(authUserId, { password: parol });
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: parol,
      email_confirm: true,
    });
    if (error) {
      console.log('');
      console.log(`  Supabase Auth'da hisob ochilmadi: ${error.message}`);
      return;
    }
    authUserId = data.user?.id ?? null;
  }

  await db.adminUser.upsert({
    where: { email },
    update: { authUserId, active: true, role: 'ADMIN' },
    create: { email, name: 'Bosh administrator', role: 'ADMIN', authUserId },
  });

  console.log('');
  console.log('  Admin panelga kirish:');
  console.log(`    login:  ${email}`);
  console.log('    parol:  .env dagi ADMIN_PASSWORD');
}

async function main() {
  console.log('\nBaza to’ldirilmoqda...\n');
  await tozalash();
  await jamoalar();
  await loyihalar();
  await tanlovlar();
  await afisha();
  await media();
  await odamlar();
  await boshSahifa();
  await sozlamalar();
  await adminFoydalanuvchi();
  console.log('\nTayyor.\n');
}

main()
  .catch((e) => {
    console.error('\nXatolik:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
