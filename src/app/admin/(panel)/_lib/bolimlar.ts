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
  }[];
};

export const MENYU: BolimGuruhi[] = [
  {
    nom: 'Kontent',
    bolimlar: [
      { kalit: 'jamoalar', nom: 'Jamoalar', ikonka: 'users' },
      { kalit: 'loyihalar', nom: 'Loyihalar', ikonka: 'folder-kanban' },
      { kalit: 'tanlovlar', nom: 'Tanlov va festivallar', ikonka: 'trophy' },
      { kalit: 'afisha', nom: 'Afisha', ikonka: 'calendar-days' },
      { kalit: 'yangiliklar', nom: 'Yangiliklar', ikonka: 'newspaper' },
      { kalit: 'videolar', nom: 'Videolar', ikonka: 'video' },
      { kalit: 'fotolar', nom: 'Foto galereya', ikonka: 'images' },
    ],
  },
  {
    nom: 'Birlashma',
    bolimlar: [
      { kalit: 'rahbariyat', nom: 'Rahbariyat', ikonka: 'user-round' },
      { kalit: 'ekspertlar', nom: 'Ekspertlar', ikonka: 'globe' },
      { kalit: 'hujjatlar', nom: 'Hujjatlar', ikonka: 'file-text' },
      { kalit: 'vazifalar', nom: 'Tashkiliy vazifalar', ikonka: 'list-checks' },
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
      { kalit: 'sozlamalar', nom: 'Sayt sozlamalari', ikonka: 'settings' },
      { kalit: 'foydalanuvchilar', nom: 'Foydalanuvchilar', ikonka: 'shield', faqatAdmin: true },
    ],
  },
];
