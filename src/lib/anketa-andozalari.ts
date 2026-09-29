import { yangiSavol, type Savol } from './anketa';

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
      tur: 'sana',
      talab: true,
      savol: { uz: 'Tug‘ilgan sana', ru: 'Дата рождения', en: 'Date of birth' },
    }),
    s({
      tur: 'bolim',
      savol: { uz: 'Hujjatlar va suratlar', ru: 'Документы и фотографии', en: 'Documents and photos' },
      izoh: {
        uz: 'Surat va hujjat nusxalarini yuklang',
        ru: 'Загрузите фотографии и копии документов',
        en: 'Upload your photos and document copies',
      },
    }),
    s({
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
      tur: 'matnKatta',
      talab: true,
      savol: { uz: 'Qisqacha tarjimai hol', ru: 'Краткая биография', en: 'Short biography' },
    }),
    s({
      tur: 'matn',
      talab: true,
      savol: {
        uz: 'I tur: asar muallifi',
        ru: 'I тур: автор произведения',
        en: 'Round I: composer / author',
      },
    }),
    s({
      tur: 'matn',
      talab: true,
      savol: {
        uz: 'I tur: ijro etiladigan asar nomi',
        ru: 'I тур: название исполняемого произведения',
        en: 'Round I: title of the work performed',
      },
    }),
    s({
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
