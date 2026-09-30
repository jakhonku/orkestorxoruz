import { anketaniOqi, yangiSavol, type Savol } from './anketa';

/**
 * Tayyor anketalar — admin panelda bir bosishda qo'yiladi, keyin xohlagancha
 * o'zgartiriladi.
 */

const s = (qism: Partial<Savol>): Savol => ({ ...yangiSavol(), ...qism });

/**
 * Ijrochilar tanlovi uchun hujjatlar to'plami.
 *
 * Aloqa ma'lumotlari (telefon, email) va F.I.SH. anketaga kirmaydi — ular
 * har bir arizada doim so'raladi. Saytda 5 qadam bo'lib chiqadi:
 * ishtirokchi → aloqa → hujjatlar → tarjimai hol va repertuar → tasdiqlash.
 */
export function hujjatliAnketa(): Savol[] {
  return [
    // 1-qadamga (F.I.Sh. yoniga) tushadi
    s({
      id: 'tugilganSana',
      tur: 'sana',
      talab: true,
      savol: {
        uz: 'Tug‘ilgan yili (kun/oy/yil)',
        ru: 'Дата рождения (день/месяц/год)',
        en: 'Date of birth (day/month/year)',
      },
    }),
    s({
      id: 'tugilganJoyi',
      tur: 'matn',
      talab: true,
      savol: { uz: 'Tug‘ilgan joyi', ru: 'Место рождения', en: 'Place of birth' },
    }),
    s({
      id: 'millati',
      tur: 'matn',
      talab: true,
      savol: { uz: 'Millati', ru: 'Национальность', en: 'Nationality' },
    }),
    s({
      id: 'malumoti',
      tur: 'matn',
      talab: true,
      savol: { uz: 'Ma’lumoti', ru: 'Образование', en: 'Education' },
    }),
    s({
      id: 'mutaxassislik',
      tur: 'matn',
      talab: true,
      savol: {
        uz: 'Ma’lumoti bo‘yicha mutaxassisligi',
        ru: 'Специальность по образованию',
        en: 'Specialty by education',
      },
    }),
    s({
      id: 'mukofotlar',
      tur: 'matnKatta',
      savol: { uz: 'Davlat mukofotlari', ru: 'Государственные награды', en: 'State awards' },
    }),
    s({
      id: 'bolimHujjat',
      tur: 'bolim',
      savol: { uz: 'Hujjatlar va suratlar', ru: 'Документы и фотографии', en: 'Documents and photos' },
      izoh: {
        uz: 'Surat va hujjat nusxalarini yuklang',
        ru: 'Загрузите фотографии и копии документов',
        en: 'Upload your photos and document copies',
      },
    }),
    s({
      id: 'surat',
      tur: 'fayl',
      qabul: 'rasm',
      talab: true,
      savol: { uz: 'Surat (3×4 sm)', ru: 'Фотография (3×4 см)', en: 'Photo (3×4 cm)' },
      izoh: {
        uz: 'Anketa uchun rasmiy surat — JPG, PNG yoki WEBP',
        ru: 'Официальное фото для анкеты — JPG, PNG или WEBP',
        en: 'Official photo for the application form — JPG, PNG or WEBP',
      },
    }),
    s({
      id: 'foto',
      tur: 'fayl',
      qabul: 'rasm',
      talab: true,
      savol: {
        uz: 'Badiiy fotosurat (yuqori sifatda)',
        ru: 'Художественная фотография (в высоком разрешении)',
        en: 'Artistic photo (high resolution)',
      },
      izoh: {
        uz: 'Buklet va afishalar uchun — 15 MB gacha',
        ru: 'Для буклетов и афиш — до 15 МБ',
        en: 'For booklets and posters — up to 15 MB',
      },
    }),
    s({
      id: 'pasport',
      tur: 'fayl',
      qabul: 'hammasi',
      talab: true,
      savol: {
        uz: 'Shaxsni tasdiqlovchi hujjat nusxasi (pasport yoki ID-karta)',
        ru: 'Копия документа, удостоверяющего личность (паспорт или ID-карта)',
        en: 'Copy of identity document (passport or ID card)',
      },
      izoh: {
        uz: 'Rasm yoki PDF. Fayl faqat tashkilotchilarga ko‘rinadi.',
        ru: 'Фото или PDF. Файл виден только организаторам.',
        en: 'Image or PDF. Only the organisers can see this file.',
      },
    }),
    s({
      id: 'bolimBio',
      tur: 'bolim',
      savol: {
        uz: 'Tarjimai hol va repertuar',
        ru: 'Биография и репертуар',
        en: 'Biography and repertoire',
      },
      izoh: {
        uz: 'O‘zingiz va I turda ijro etiladigan asar haqida',
        ru: 'О себе и о произведении, исполняемом в I туре',
        en: 'About you and the work performed in Round I',
      },
    }),
    s({
      id: 'biografiya',
      tur: 'matnKatta',
      talab: true,
      savol: { uz: 'Biografiya', ru: 'Биография', en: 'Biography' },
    }),
    s({
      id: 'asar',
      tur: 'matnKatta',
      talab: true,
      savol: {
        uz: 'I turda ijro etiladigan asar va muallif haqida ma’lumot',
        ru: 'Информация о произведении и его авторе, исполняемом в I туре',
        en: 'Information about the work and its author performed in Round I',
      },
    }),
    s({
      id: 'rozilik',
      tur: 'rozilik',
      talab: true,
      savol: {
        uz: 'Shaxsiy ma’lumotlarimni qayta ishlashga roziman',
        ru: 'Я даю согласие на обработку моих персональных данных',
        en: 'I consent to the processing of my personal data',
      },
    }),
  ];
}

/**
 * Tanlovning haqiqiy anketasi: admin o'zi tuzgan bo'lsa — o'sha, bo'sh bo'lsa —
 * tayyor andoza (id'lari doim bir xil, shuning uchun sayt va server mos keladi).
 */
export function tanlovAnketasi(xom: unknown): Savol[] {
  const saqlangan = anketaniOqi(xom);
  return saqlangan.length ? saqlangan : hujjatliAnketa();
}
