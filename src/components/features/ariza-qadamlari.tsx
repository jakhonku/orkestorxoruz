'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, Check, Download, Loader2, Paperclip, PencilLine, SendHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { qadamlargaBol, tilda, variantlarTilda, type Savol } from '@/lib/anketa';
import { malumotnomaOldindan, tanlovArizasi, type XatoKodi } from '@/server/forms/amallar';
import { Tuzoq, XatoXabari } from './forma-yordam';
import { AnketaSavoli, KATTA, Maydon, type JavobQiymati } from './anketa-savoli';

/**
 * Tanlov arizasi — qadamma-qadam.
 *
 *   1. Ishtirokchi   — familiya, ism, otasining ismi (+ anketaning birinchi savollari)
 *   2. Aloqa         — telefon, email
 *   3…n. Anketa      — admin "Yangi qadam" bilan ajratgan bo'limlar
 *   oxirgi. Tasdiq   — hamma javoblar ko'rinadi, rozilik belgilari va yuborish
 *
 * Har bir qadam "Keyingi qadam" bosilganda tekshiriladi — xato bo'lsa
 * keyingisiga o'tilmaydi. To'ldirilgan ma'lumot brauzerda (sessionStorage)
 * saqlanib turadi: sahifa tasodifan yangilansa ham yo'qolmaydi.
 */

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const havolaRe = /^https?:\/\/\S+$/i;
const sonRe = /^-?\d+([.,]\d+)?$/;

type Shaxs = { fio: string };
type Aloqa = { phone: string; email: string };
type Oddiy = { ensemble: string; category: string; message: string };
type Javoblar = Record<string, JavobQiymati>;

type Qadam = {
  kalit: string;
  tur: 'shaxs' | 'aloqa' | 'oddiy' | 'savollar' | 'tasdiq';
  sarlavha: string;
  tavsif: string;
  savollar: Savol[];
};

type Qoralama = { shaxs: Shaxs; aloqa: Aloqa; oddiy: Oddiy; javoblar: Javoblar; qadam: number };

/** To'liq va haqiqiy sanami (31-fevral kabi emas) */
function sanaTogrimi(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

/** Sana hali tanlanmaganmi ("--" yoki bo'sh) */
function bosh(s: Savol, v: JavobQiymati | undefined): boolean {
  if (Array.isArray(v)) return v.length === 0;
  const m = String(v ?? '').trim();
  return s.tur === 'sana' ? m.replace(/-/g, '') === '' : m === '';
}

export function ArizaQadamlari({
  tanlovId,
  slug,
  anketa,
}: {
  tanlovId: number;
  slug: string;
  anketa: Savol[];
}) {
  const t = useTranslations('Ariza');
  const tc = useTranslations('Common');
  const tk = useTranslations('Competitions');
  const locale = useLocale();

  const [shaxs, setShaxs] = useState<Shaxs>({ fio: '' });
  const [aloqa, setAloqa] = useState<Aloqa>({ phone: '', email: '' });
  const [oddiy, setOddiy] = useState<Oddiy>({ ensemble: '', category: '', message: '' });
  const [javoblar, setJavoblar] = useState<Javoblar>({});
  const [qadam, setQadam] = useState(0);
  const [xatolar, setXatolar] = useState<Record<string, string>>({});
  const [yuklanayotgan, setYuklanayotgan] = useState(0);
  const [tuzoq, setTuzoq] = useState('');
  const [serverXato, setServerXato] = useState<XatoKodi | null>(null);
  const [yuborildi, setYuborildi] = useState(false);
  const [yuborilmoqda, boshla] = useTransition();
  const karta = useRef<HTMLDivElement>(null);

  const anketaBor = anketa.length > 0;

  const qadamlar = useMemo<Qadam[]>(() => {
    const { boshi, bolimlar, roziliklar } = qadamlargaBol(anketa);
    return [
      { kalit: 'shaxs', tur: 'shaxs', sarlavha: t('participantTitle'), tavsif: t('participantText'), savollar: boshi },
      { kalit: 'aloqa', tur: 'aloqa', sarlavha: t('contactTitle'), tavsif: t('contactText'), savollar: [] },
      ...(anketaBor
        ? bolimlar.map(
            (b): Qadam => ({
              kalit: b.sarlavha.id,
              tur: 'savollar',
              sarlavha: tilda(b.sarlavha.savol, locale),
              tavsif: tilda(b.sarlavha.izoh, locale),
              savollar: b.savollar,
            }),
          )
        : [
            {
              kalit: 'oddiy',
              tur: 'oddiy' as const,
              sarlavha: t('detailsTitle'),
              tavsif: t('detailsText'),
              savollar: [],
            },
          ]),
      { kalit: 'tasdiq', tur: 'tasdiq', sarlavha: t('reviewTitle'), tavsif: t('reviewText'), savollar: roziliklar },
    ];
  }, [anketa, anketaBor, locale, t]);

  const joriy = qadamlar[Math.min(qadam, qadamlar.length - 1)];
  const oxirgimi = joriy.tur === 'tasdiq';

  // ---------------- qoralama (sahifa yangilansa yo'qolmasin) ----------------
  const qoralamaKaliti = `tanlov-arizasi-${tanlovId}`;
  // Holat (ref emas): saqlash qoralama TIKLANGAN holat bilan qayta chizilgandan
  // keyingina boshlanadi. Aks holda birinchi chizishdagi bo'sh qiymatlar
  // saqlangan qoralamani ustidan yozib yuborardi.
  const [tiklandi, setTiklandi] = useState(false);

  useEffect(() => {
    try {
      const xom = sessionStorage.getItem(qoralamaKaliti);
      if (xom) {
        const q = JSON.parse(xom) as Partial<Qoralama>;
        if (typeof q.shaxs?.fio === 'string') setShaxs({ fio: q.shaxs.fio });
        if (q.aloqa) setAloqa(q.aloqa);
        if (q.oddiy) setOddiy(q.oddiy);
        if (q.javoblar) setJavoblar(q.javoblar);
        if (typeof q.qadam === 'number') setQadam(Math.max(0, Math.min(q.qadam, qadamlar.length - 1)));
      }
    } catch {
      // Saqlab bo'lmaydigan brauzer — qoralamasiz ishlaymiz
    }
    setTiklandi(true);
    // Faqat birinchi ochilganda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!tiklandi || yuborildi) return;
    try {
      const q: Qoralama = { shaxs, aloqa, oddiy, javoblar, qadam };
      sessionStorage.setItem(qoralamaKaliti, JSON.stringify(q));
    } catch {
      // e'tiborsiz
    }
  }, [tiklandi, shaxs, aloqa, oddiy, javoblar, qadam, yuborildi, qoralamaKaliti]);

  // ---------------- tekshiruv ----------------
  function savolXatosi(s: Savol): string | null {
    const v = javoblar[s.id];
    if (bosh(s, v)) return s.talab ? tc('required') : null;
    const m = Array.isArray(v) ? '' : String(v).trim();
    if (s.tur === 'havola' && !havolaRe.test(m)) return tk('form_invalidUrl');
    if (s.tur === 'raqam' && !sonRe.test(m)) return tk('form_invalid');
    if (s.tur === 'sana' && !sanaTogrimi(m)) return tk('form_invalid');
    return null;
  }

  function qadamXatolari(q: Qadam): Record<string, string> {
    const x: Record<string, string> = {};
    if (q.tur === 'shaxs') {
      if (shaxs.fio.trim().length < 2) x.fio = tc('required');
    }
    if (q.tur === 'aloqa') {
      if (aloqa.phone.replace(/\D/g, '').length < 7) x.phone = tc('required');
      // Elektron pochta majburiy emas — yozilgan bo'lsa to'g'riligi tekshiriladi
      if (aloqa.email.trim() && !emailRe.test(aloqa.email.trim())) x.email = tc('invalidEmail');
    }
    for (const s of q.savollar) {
      const xato = savolXatosi(s);
      if (xato) x[s.id] = xato;
    }
    return x;
  }

  function tepagaChiq() {
    karta.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function birinchiXatogaOt(x: Record<string, string>) {
    const kalit = Object.keys(x)[0];
    if (!kalit) return;
    requestAnimationFrame(() => {
      document
        .querySelector(`[data-maydon="${kalit}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  function keyingi() {
    if (yuklanayotgan > 0) return;
    const x = qadamXatolari(joriy);
    setXatolar(x);
    if (Object.keys(x).length) return birinchiXatogaOt(x);
    setQadam((n) => Math.min(n + 1, qadamlar.length - 1));
    tepagaChiq();
  }

  function orqaga() {
    setXatolar({});
    setQadam((n) => Math.max(0, n - 1));
    tepagaChiq();
  }

  function qadamgaOt(i: number) {
    setXatolar({});
    setQadam(i);
    tepagaChiq();
  }

  function yubor() {
    if (yuklanayotgan > 0) return;

    // Oxirgi marta hamma qadamlar tekshiriladi — birortasida xato bo'lsa o'sha qadamga qaytamiz
    for (const [i, q] of qadamlar.entries()) {
      const x = qadamXatolari(q);
      if (Object.keys(x).length) {
        setXatolar(x);
        // Xato shu qadamda bo'lsa (masalan rozilik belgilanmagan) — o'sha maydonga,
        // boshqa qadamda bo'lsa — o'sha qadamning boshiga
        if (i === qadam) {
          birinchiXatogaOt(x);
        } else {
          setQadam(i);
          tepagaChiq();
        }
        return;
      }
    }

    // Chala tanlangan (ixtiyoriy) sanalar yuborilmaydi
    const tayyor: Javoblar = {};
    for (const s of anketa) {
      const v = javoblar[s.id];
      if (v === undefined || bosh(s, v)) continue;
      tayyor[s.id] = v;
    }

    setServerXato(null);
    boshla(async () => {
      const natija = await tanlovArizasi({
        competitionId: tanlovId,
        fullName: shaxs.fio.trim(),
        ensembleName: oddiy.ensemble,
        email: aloqa.email.trim(),
        phone: aloqa.phone.trim(),
        category: oddiy.category,
        message: oddiy.message,
        javoblar: anketaBor ? tayyor : undefined,
        locale,
        tuzoq,
      });
      if (natija.ok) {
        setYuborildi(true);
        try {
          sessionStorage.removeItem(qoralamaKaliti);
        } catch {
          // e'tiborsiz
        }
        tepagaChiq();
      } else {
        setServerXato(natija.kod);
      }
    });
  }

  const xatoTozala = (kalit: string) =>
    setXatolar((x) => {
      if (!x[kalit]) return x;
      const { [kalit]: _, ...qolgan } = x;
      return qolgan;
    });

  const javobYoz = (id: string, v: JavobQiymati) => {
    setJavoblar((j) => ({ ...j, [id]: v }));
    xatoTozala(id);
  };

  const yuklanmoqda = (ha: boolean) => setYuklanayotgan((n) => Math.max(0, n + (ha ? 1 : -1)));

  // ---------------- muvaffaqiyat ----------------
  if (yuborildi) {
    return (
      <div ref={karta} className="scroll-mt-28 rounded-3xl border border-border bg-white px-6 py-14 text-center shadow-soft sm:px-12">
        <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check className="h-8 w-8" />
        </span>
        <h2 className="font-serif text-3xl font-semibold text-navy-900">{t('successTitle')}</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">{t('successText')}</p>
        <Button asChild size="lg" className="mt-8">
          <Link href={`/tanlovlar/${slug}`}>
            <ArrowLeft className="h-4 w-4" />
            {t('backToCompetition')}
          </Link>
        </Button>
      </div>
    );
  }

  // ---------------- qadam ----------------
  return (
    <div ref={karta} className="scroll-mt-28 rounded-3xl border border-border bg-white p-6 shadow-soft sm:p-10 md:p-12">
      {/* Jarayon chizig'i */}
      <div className="mb-8 flex gap-1.5" aria-hidden="true">
        {qadamlar.map((q, i) => (
          <span
            key={q.kalit}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              i < qadam ? 'bg-gold' : i === qadam ? 'bg-navy' : 'bg-navy-50',
            )}
          />
        ))}
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">
        {t('stepOf', { n: qadam + 1, jami: qadamlar.length })}
      </p>
      <h2 className="mt-3 font-serif text-3xl font-semibold text-navy-900 sm:text-4xl">
        {joriy.sarlavha}
      </h2>
      {joriy.tavsif && <p className="mt-2 text-muted-foreground">{joriy.tavsif}</p>}

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (oxirgimi) yubor();
          else keyingi();
        }}
        className="mt-8"
      >
        <div className="space-y-6">
          {joriy.tur === 'shaxs' && (
            <div data-maydon="fio">
              <Maydon label={t('fullName')} required error={xatolar.fio}>
                <Input
                  className={KATTA}
                  autoComplete="name"
                  placeholder={t('fullNamePh')}
                  value={shaxs.fio}
                  onChange={(e) => {
                    setShaxs({ fio: e.target.value });
                    xatoTozala('fio');
                  }}
                />
              </Maydon>
            </div>
          )}

          {joriy.tur === 'aloqa' && (
            <div className="grid gap-6 sm:grid-cols-2">
              <div data-maydon="phone">
                <Maydon label={t('phone')} required error={xatolar.phone}>
                  <Input
                    className={KATTA}
                    type="tel"
                    autoComplete="tel"
                    placeholder="+998 90 123 45 67"
                    value={aloqa.phone}
                    onChange={(e) => {
                      setAloqa((a) => ({ ...a, phone: e.target.value }));
                      xatoTozala('phone');
                    }}
                  />
                </Maydon>
              </div>
              <div data-maydon="email">
                <Maydon label={t('email')} ixtiyoriy={t('optional')} error={xatolar.email}>
                  <Input
                    className={KATTA}
                    type="email"
                    autoComplete="email"
                    placeholder="example@mail.uz"
                    value={aloqa.email}
                    onChange={(e) => {
                      setAloqa((a) => ({ ...a, email: e.target.value }));
                      xatoTozala('email');
                    }}
                  />
                </Maydon>
              </div>
            </div>
          )}

          {joriy.tur === 'oddiy' && (
            <>
              <Maydon label={tk('form_ensemble')} ixtiyoriy={t('optional')}>
                <Input
                  className={KATTA}
                  value={oddiy.ensemble}
                  onChange={(e) => setOddiy((o) => ({ ...o, ensemble: e.target.value }))}
                />
              </Maydon>
              <Maydon label={tk('form_category')} ixtiyoriy={t('optional')}>
                <Input
                  className={KATTA}
                  value={oddiy.category}
                  onChange={(e) => setOddiy((o) => ({ ...o, category: e.target.value }))}
                />
              </Maydon>
              <Maydon label={tk('form_message')} ixtiyoriy={t('optional')}>
                <Textarea
                  rows={5}
                  className="rounded-xl px-4 py-3 text-[15px]"
                  value={oddiy.message}
                  onChange={(e) => setOddiy((o) => ({ ...o, message: e.target.value }))}
                />
              </Maydon>
            </>
          )}

          {joriy.tur === 'tasdiq' && anketaBor && (
            <MalumotnomaPdf
              tanlovId={tanlovId}
              fullName={shaxs.fio.trim()}
              anketa={anketa}
              javoblar={javoblar}
            />
          )}

          {joriy.tur === 'tasdiq' && (
            <Korib
              qadamlar={qadamlar.slice(0, -1)}
              shaxs={shaxs}
              aloqa={aloqa}
              oddiy={oddiy}
              javoblar={javoblar}
              locale={locale}
              tahrirla={qadamgaOt}
            />
          )}

          {/* Anketa savollari: shaxs qadamida F.I.Sh. dan keyin, tasdiq qadamida — roziliklar */}
          {joriy.savollar.map((s) => (
            <div key={s.id} data-maydon={s.id}>
              <AnketaSavoli
                savol={s}
                locale={locale}
                qiymat={javoblar[s.id]}
                xato={xatolar[s.id]}
                ozgartir={(v) => javobYoz(s.id, v)}
                tanlovId={tanlovId}
                yuklanmoqda={yuklanmoqda}
              />
            </div>
          ))}

          {Object.keys(xatolar).length > 1 && (
            <p className="text-sm font-medium text-red-600">{t('fixErrors')}</p>
          )}
          {oxirgimi && <XatoXabari kod={serverXato} />}
          <Tuzoq qiymat={tuzoq} ozgartir={setTuzoq} />
        </div>

        {/* Pastki tugmalar */}
        <div className="mt-10 flex flex-col-reverse items-stretch gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          {qadam === 0 ? (
            <Button asChild variant="ghost" size="lg" className="text-muted-foreground">
              <Link href={`/tanlovlar/${slug}`}>
                <ArrowLeft className="h-4 w-4" />
                {t('back')}
              </Link>
            </Button>
          ) : (
            <Button type="button" variant="ghost" size="lg" className="text-muted-foreground" onClick={orqaga}>
              <ArrowLeft className="h-4 w-4" />
              {t('back')}
            </Button>
          )}

          <Button
            type="submit"
            size="lg"
            variant={oxirgimi ? 'gold' : 'default'}
            disabled={yuborilmoqda || yuklanayotgan > 0}
            className="group min-w-[200px]"
          >
            {yuklanayotgan > 0 ? (
              tk('form_fileWait')
            ) : oxirgimi ? (
              <>
                <SendHorizontal className="h-4 w-4 transition-transform group-hover:-rotate-12" />
                {yuborilmoqda ? t('sending') : t('submit')}
              </>
            ) : (
              <>
                {t('next')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

/** Tasdiqlash qadami: kiritilgan hamma narsa qadamlar bo'yicha, "Tahrirlash" havolasi bilan */
function Korib({
  qadamlar,
  shaxs,
  aloqa,
  oddiy,
  javoblar,
  locale,
  tahrirla,
}: {
  qadamlar: Qadam[];
  shaxs: Shaxs;
  aloqa: Aloqa;
  oddiy: Oddiy;
  javoblar: Javoblar;
  locale: string;
  tahrirla: (i: number) => void;
}) {
  const t = useTranslations('Ariza');
  const tk = useTranslations('Competitions');

  function savolQiymati(s: Savol): React.ReactNode {
    const v = javoblar[s.id];
    if (v === undefined || bosh(s, v)) return t('empty');
    if (s.tur === 'fayl') {
      return (
        <span className="inline-flex items-center gap-1.5 text-emerald-700">
          <Paperclip className="h-3.5 w-3.5" />
          {t('fileAttached')}
        </span>
      );
    }
    const variantlar = variantlarTilda(s, locale);
    if (s.tur === 'belgilar' && Array.isArray(v)) return v.map((k) => variantlar[Number(k)]).join(', ');
    if (s.tur === 'variant' || s.tur === 'tanlov') return variantlar[Number(v)] ?? t('empty');
    if (s.tur === 'sana') return String(v).split('-').reverse().join('.');
    return String(v);
  }

  return (
    <div className="space-y-4">
      {qadamlar.map((q, i) => {
        const qatorlar: [string, React.ReactNode][] = [];
        if (q.tur === 'shaxs') {
          qatorlar.push([
            t('fullName'),
            shaxs.fio.trim(),
          ]);
        }
        if (q.tur === 'aloqa') {
          qatorlar.push([t('phone'), aloqa.phone], [t('email'), aloqa.email.trim() || t('empty')]);
        }
        if (q.tur === 'oddiy') {
          qatorlar.push(
            [tk('form_ensemble'), oddiy.ensemble || t('empty')],
            [tk('form_category'), oddiy.category || t('empty')],
            [tk('form_message'), oddiy.message || t('empty')],
          );
        }
        for (const s of q.savollar) qatorlar.push([tilda(s.savol, locale), savolQiymati(s)]);

        return (
          <section key={q.kalit} className="rounded-2xl border border-border bg-navy-50/30 p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-serif text-lg font-semibold text-navy-900">{q.sarlavha}</h3>
              <button
                type="button"
                onClick={() => tahrirla(i)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-navy/5"
              >
                <PencilLine className="h-3.5 w-3.5" />
                {t('edit')}
              </button>
            </div>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {qatorlar.map(([yorliq, qiymat], j) => (
                <div key={j} className="min-w-0">
                  <dt className="text-xs text-muted-foreground">{yorliq}</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap break-words text-sm font-medium text-navy-900">
                    {qiymat}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}
    </div>
  );
}

/**
 * Tasdiqlash qadamida ishtirokchi Ma'lumotnomani PDF ko'rinishida ko'radi va
 * yuklab oladi. Yuborilganda aynan shu hujjat arizaga biriktiriladi.
 */
function MalumotnomaPdf({
  tanlovId,
  fullName,
  anketa,
  javoblar,
}: {
  tanlovId: number;
  fullName: string;
  anketa: Savol[];
  javoblar: Javoblar;
}) {
  const t = useTranslations('Ariza');
  const [holat, setHolat] = useState<'yuklanmoqda' | 'tayyor' | 'xato'>('yuklanmoqda');
  const [url, setUrl] = useState<string | null>(null);
  const [urinish, setUrinish] = useState(0);

  useEffect(() => {
    let bekor = false;
    let yaratilgan: string | null = null;
    setHolat('yuklanmoqda');

    const tayyor: Javoblar = {};
    for (const s of anketa) {
      const v = javoblar[s.id];
      if (v === undefined || bosh(s, v)) continue;
      tayyor[s.id] = v;
    }

    malumotnomaOldindan({ competitionId: tanlovId, fullName, javoblar: tayyor })
      .then((r) => {
        if (bekor) return;
        if (!r.ok) return setHolat('xato');
        const bayt = Uint8Array.from(atob(r.pdf), (c) => c.charCodeAt(0));
        yaratilgan = URL.createObjectURL(new Blob([bayt], { type: 'application/pdf' }));
        setUrl(yaratilgan);
        setHolat('tayyor');
      })
      .catch(() => !bekor && setHolat('xato'));

    return () => {
      bekor = true;
      if (yaratilgan) URL.revokeObjectURL(yaratilgan);
    };
    // Faqat qadam ochilganda yoki "Qayta urinish" bosilganda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urinish]);

  return (
    <section className="rounded-2xl border border-gold/40 bg-gold/5 p-5">
      <h3 className="font-serif text-lg font-semibold text-navy-900">{t('pdfTitle')}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{t('pdfText')}</p>

      {holat === 'yuklanmoqda' && (
        <p className="mt-4 flex items-center gap-2 text-sm text-navy">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('pdfLoading')}
        </p>
      )}

      {holat === 'xato' && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-sm font-medium text-red-600">{t('pdfError')}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => setUrinish((n) => n + 1)}>
            {t('pdfRetry')}
          </Button>
        </div>
      )}

      {holat === 'tayyor' && url && (
        <>
          <iframe
            src={`${url}#toolbar=0&navpanes=0`}
            title={t('pdfTitle')}
            className="mt-4 h-[560px] w-full rounded-xl border border-border bg-white"
          />
          <Button asChild variant="gold" size="lg" className="mt-4">
            <a href={url} download={`malumotnoma-${(fullName || 'ariza').replace(/\s+/g, '-')}.pdf`}>
              <Download className="h-4 w-4" />
              {t('pdfDownload')}
            </a>
          </Button>
        </>
      )}
    </section>
  );
}
