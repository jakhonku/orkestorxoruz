/**
 * Admin paneldagi bo'limlar ro'yxati — yon menyu va bosh sahifa shu yerdan quriladi.
 */

export type BolimGuruhi = {
  nom: string;
  bolimlar: {
    kalit: string;
    nom: string;
    /** lucide-react ikonka nomi */
    ikonka: string;
    /** faqat ADMIN roli ko'radi */
    faqatAdmin?: boolean;
    /**
     * "Tanlov admini" (TANLOV roli) ham ko'radi. Bu rol boshqa hech bir
     * bo'limga kira olmaydi — ruxsat serverda ham shu ro'yxat bo'yicha
     * tekshiriladi (`src/server/admin/huquq.ts`).
     */
    tanlovRoli?: boolean;
  }[];
};

export const MENYU: BolimGuruhi[] = [
  {
    nom: 'Kontent',
    bolimlar: [
      { kalit: 'jamoalar', nom: 'Jamoalar', ikonka: 'users' },
      { kalit: 'loyihalar', nom: 'Loyihalar', ikonka: 'folder-kanban' },
      { kalit: 'afisha', nom: 'Afisha', ikonka: 'calendar-days' },
      { kalit: 'yangiliklar', nom: 'Yangiliklar', ikonka: 'newspaper' },
      { kalit: 'press', nom: 'Press-relizlar', ikonka: 'file-text' },
      { kalit: 'videolar', nom: 'Videolar', ikonka: 'video' },
      { kalit: 'fotolar', nom: 'Foto galereya', ikonka: 'images' },
    ],
  },
  {
    nom: 'Tanlov va festivallar',
    bolimlar: [
      { kalit: 'tanlovlar', nom: 'Tanlov va festivallar', ikonka: 'trophy', tanlovRoli: true },
      {
        kalit: 'tanlov-arizalari',
        nom: 'Tanlov arizalari',
        ikonka: 'clipboard-list',
        tanlovRoli: true,
      },
    ],
  },
  {
    nom: 'Birlashma',
    bolimlar: [
      { kalit: 'rahbariyat', nom: 'Rahbariyat', ikonka: 'user-round' },
      { kalit: 'hujjatlar', nom: 'Hujjatlar', ikonka: 'file-text' },
      { kalit: 'vazifalar', nom: 'Tashkiliy vazifalar', ikonka: 'list-checks' },
    ],
  },
  {
    nom: 'Sahifalar',
    bolimlar: [
      { kalit: 'faoliyat', nom: 'Faoliyat sahifasi', ikonka: 'layout-dashboard' },
      { kalit: 'xalqaro', nom: 'Xalqaro sahifalar', ikonka: 'globe' },
      { kalit: 'ekspertlar', nom: 'Ekspertlar', ikonka: 'user-search' },
    ],
  },
  {
    nom: 'Bosh sahifa',
    bolimlar: [
      { kalit: 'slaydlar', nom: 'Strategiya slaydlari', ikonka: 'presentation' },
      { kalit: 'kpi', nom: 'Raqamlar (KPI)', ikonka: 'bar-chart-3' },
      { kalit: 'hamkorlar', nom: 'Hamkorlar', ikonka: 'handshake' },
    ],
  },
  {
    nom: 'Murojaatlar',
    bolimlar: [
      { kalit: 'arizalar', nom: 'Arizalar va xabarlar', ikonka: 'inbox' },
      { kalit: 'obuna', nom: 'Obunachilar', ikonka: 'mail' },
    ],
  },
  {
    nom: 'Sozlamalar',
    bolimlar: [
      { kalit: 'matnlar', nom: 'Sahifa matnlari', ikonka: 'type' },
      { kalit: 'sozlamalar', nom: 'Sayt sozlamalari', ikonka: 'settings' },
      { kalit: 'foydalanuvchilar', nom: 'Foydalanuvchilar', ikonka: 'shield', faqatAdmin: true },
    ],
  },
];

/** Tanlov admini kira oladigan bo'limlar */
export const TANLOV_ROLI_BOLIMLARI: string[] = MENYU.flatMap((g) => g.bolimlar)
  .filter((b) => b.tanlovRoli)
  .map((b) => b.kalit);

/** Rol nomlari — foydalanuvchilar sahifasi va yon menyu uchun */
export const ROLLAR = [
  { qiymat: 'ADMIN', nom: 'Administrator', izoh: 'hamma narsani boshqaradi' },
  { qiymat: 'MUHARRIR', nom: 'Muharrir', izoh: 'kontentni tahrirlaydi' },
  { qiymat: 'TANLOV', nom: 'Tanlov admini', izoh: 'faqat tanlov, festival va ularning arizalari' },
] as const;

export type Rol = (typeof ROLLAR)[number]['qiymat'];
