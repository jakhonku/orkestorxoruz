'use client';

import { ArrowDown, ArrowUp, Info, Plus, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  ANKETA_CHEGARASI,
  SAVOL_TURLARI,
  variantliMi,
  yangiSavol,
  type Savol,
  type SavolTuri,
} from '@/lib/anketa';
import { INPUT, KopTilliKiritish, KopTilliRoyxatKiritish } from './maydon';

/**
 * Tanlov arizasi anketasini tuzish.
 *
 * Admin savollarni o'zi qo'shadi: turini tanlaydi, uch tilda yozadi,
 * majburiy yoki yo'qligini belgilaydi. Saytdagi ariza oynasi shu ro'yxatdan
 * quriladi. F.I.SH., email va telefon doim so'raladi — ular bu yerda yo'q.
 */

/** Tez-tez so'raladigan savollar — bir bosishda qo'shiladi */
const ANDOZALAR: { nom: string; savol: () => Savol }[] = [
  {
    nom: 'Jamoa nomi',
    savol: () => ({
      ...yangiSavol(),
      savol: { uz: 'Jamoa nomi', ru: 'Название коллектива', en: 'Ensemble name' },
    }),
  },
  {
    nom: 'Viloyat',
    savol: () => ({
      ...yangiSavol(),
      tur: 'tanlov',
      talab: true,
      savol: { uz: 'Viloyat', ru: 'Регион', en: 'Region' },
      variantlar: {
        uz: [
          'Toshkent shahri', 'Toshkent viloyati', 'Andijon', 'Buxoro', 'Farg‘ona', 'Jizzax',
          'Xorazm', 'Namangan', 'Navoiy', 'Qashqadaryo', 'Qoraqalpog‘iston', 'Samarqand',
          'Sirdaryo', 'Surxondaryo',
        ],
        ru: [
          'г. Ташкент', 'Ташкентская обл.', 'Андижан', 'Бухара', 'Фергана', 'Джизак', 'Хорезм',
          'Наманган', 'Навои', 'Кашкадарья', 'Каракалпакстан', 'Самарканд', 'Сырдарья',
          'Сурхандарья',
        ],
        en: [
          'Tashkent city', 'Tashkent region', 'Andijan', 'Bukhara', 'Fergana', 'Jizzakh',
          'Khorezm', 'Namangan', 'Navoi', 'Kashkadarya', 'Karakalpakstan', 'Samarkand',
          'Syrdarya', 'Surkhandarya',
        ],
      },
    }),
  },
  {
    nom: 'Yoshi',
    savol: () => ({
      ...yangiSavol(),
      tur: 'raqam',
      talab: true,
      savol: { uz: 'Yoshi', ru: 'Возраст', en: 'Age' },
    }),
  },
  {
    nom: 'Nominatsiya',
    savol: () => ({
      ...yangiSavol(),
      tur: 'variant',
      talab: true,
      savol: { uz: 'Nominatsiya', ru: 'Номинация', en: 'Category' },
    }),
  },
  {
    nom: 'Ijro videosi',
    savol: () => ({
      ...yangiSavol(),
      tur: 'havola',
      talab: true,
      savol: { uz: 'Ijro videosi havolasi', ru: 'Ссылка на видео выступления', en: 'Performance video link' },
      izoh: {
        uz: 'YouTube, Google Drive yoki boshqa ochiq havola',
        ru: 'YouTube, Google Drive или другая открытая ссылка',
        en: 'YouTube, Google Drive or another public link',
      },
    }),
  },
  {
    nom: 'Repertuar',
    savol: () => ({
      ...yangiSavol(),
      tur: 'matnKatta',
      savol: { uz: 'Ijro etiladigan asarlar', ru: 'Исполняемые произведения', en: 'Repertoire' },
    }),
  },
];

export function AnketaTuzuvchi({
  qiymat,
  ozgartir,
}: {
  qiymat: unknown;
  ozgartir: (yangi: unknown) => void;
}) {
  // Bu yerda tozalanmaydi: variantlar maydonida yangi (hali bo'sh) qator
  // yozilayotgan bo'ladi, tozalash uni darhol o'chirib yuborardi. Anketa
  // saqlanayotganda serverda tozalanadi (`anketaniOqi`).
  const savollar = Array.isArray(qiymat) ? (qiymat as Savol[]) : [];
  const toldi = savollar.length >= ANKETA_CHEGARASI;

  const yangila = (i: number, qism: Partial<Savol>) =>
    ozgartir(savollar.map((s, j) => (j === i ? { ...s, ...qism } : s)));

  const kochir = (i: number, yon: -1 | 1) => {
    const j = i + yon;
    if (j < 0 || j >= savollar.length) return;
    const yangi = [...savollar];
    [yangi[i], yangi[j]] = [yangi[j], yangi[i]];
    ozgartir(yangi);
  };

  const qosh = (s: Savol) => {
    if (!toldi) ozgartir([...savollar, s]);
  };

  return (
    <div className="space-y-3">
      <p className="flex items-start gap-2 rounded-xl bg-navy-50/60 p-3 text-xs leading-relaxed text-navy-900">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
        <span>
          <b>F.I.SH., email va telefon</b> har bir arizada avtomatik so‘raladi. Bu yerga
          qo‘shimcha savollarni qo‘shing. Anketa bo‘sh qolsa, saytda oddiy ariza shakli chiqadi
          (jamoa nomi, yo‘nalish, izoh).
        </span>
      </p>

      {savollar.map((s, i) => (
        <div key={s.id} className="rounded-xl border border-border bg-white p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-gold">
              {i + 1}
            </span>

            <select
              value={s.tur}
              onChange={(e) => yangila(i, { tur: e.target.value as SavolTuri })}
              className={cn(INPUT, 'h-9 w-auto flex-1 sm:max-w-[230px]')}
            >
              {SAVOL_TURLARI.map((t) => (
                <option key={t.qiymat} value={t.qiymat}>
                  {t.yorliq}
                </option>
              ))}
            </select>

            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-navy">
              <input
                type="checkbox"
                checked={s.talab}
                onChange={(e) => yangila(i, { talab: e.target.checked })}
                className="h-4 w-4 accent-navy"
              />
              Majburiy
            </label>

            <div className="ml-auto flex items-center gap-1">
              <TugmaIkonka nom="Yuqoriga" onClick={() => kochir(i, -1)} ochiq={i > 0}>
                <ArrowUp className="h-4 w-4" />
              </TugmaIkonka>
              <TugmaIkonka
                nom="Pastga"
                onClick={() => kochir(i, 1)}
                ochiq={i < savollar.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </TugmaIkonka>
              <TugmaIkonka
                nom="O‘chirish"
                xavfli
                onClick={() => ozgartir(savollar.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </TugmaIkonka>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="mb-1 text-xs font-medium text-navy">
                Savol <span className="text-red-500">*</span>
              </p>
              <KopTilliKiritish
                katta={false}
                qiymat={s.savol}
                ozgartir={(v) => yangila(i, { savol: v })}
              />
            </div>

            {variantliMi(s.tur) && (
              <div>
                <p className="mb-1 text-xs font-medium text-navy">
                  Variantlar <span className="text-red-500">*</span>
                  <span className="ml-1 font-normal text-muted-foreground">
                    — har biri alohida qatorda, tarjimalarda ham shu tartibda
                  </span>
                </p>
                <KopTilliRoyxatKiritish
                  qiymat={s.variantlar}
                  ozgartir={(v) => yangila(i, { variantlar: v })}
                />
              </div>
            )}

            <div>
              <p className="mb-1 text-xs font-medium text-navy">
                Izoh <span className="font-normal text-muted-foreground">(ixtiyoriy)</span>
              </p>
              <KopTilliKiritish
                katta={false}
                qiymat={s.izoh}
                ozgartir={(v) => yangila(i, { izoh: v })}
              />
            </div>
          </div>
        </div>
      ))}

      <div className="rounded-xl border border-dashed border-border bg-white p-3">
        <button
          type="button"
          disabled={toldi}
          onClick={() => qosh(yangiSavol())}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-navy px-3.5 text-xs font-semibold text-white transition-colors hover:bg-navy-900 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Savol qo‘shish
        </button>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Tayyor savollar:</span>
          {ANDOZALAR.map((a) => (
            <button
              key={a.nom}
              type="button"
              disabled={toldi}
              onClick={() => qosh(a.savol())}
              className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-navy transition-colors hover:border-gold/60 disabled:opacity-50"
            >
              + {a.nom}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TugmaIkonka({
  nom,
  onClick,
  ochiq = true,
  xavfli,
  children,
}: {
  nom: string;
  onClick: () => void;
  ochiq?: boolean;
  xavfli?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={nom}
      aria-label={nom}
      disabled={!ochiq}
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors disabled:opacity-30',
        xavfli ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-navy-50 hover:text-navy',
      )}
    >
      {children}
    </button>
  );
}
