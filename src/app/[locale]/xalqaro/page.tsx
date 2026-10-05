import { redirect } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

/** Xalqaro boʻlim endi "Loyihalar" sahifasining alohida boʻlimi */
export default function XalqaroQaytarish({ params }: { params: { locale: Locale } }) {
  redirect({ href: '/loyihalar#xalqaro', locale: params.locale });
}
