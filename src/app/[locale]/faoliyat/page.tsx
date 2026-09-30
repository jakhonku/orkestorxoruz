import { redirect } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

/** "Faoliyat" sahifasi olib tashlandi — uning o'rniga "Loyihalar" */
export default function FaoliyatQaytarish({ params }: { params: { locale: Locale } }) {
  redirect({ href: '/loyihalar', locale: params.locale });
}
