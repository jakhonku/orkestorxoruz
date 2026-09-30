import { redirect } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

/** Xalqaro loyihalar endi "Loyihalar" sahifasining Xalqaro bo'limida */
export default function XalqaroLoyihalarQaytarish({ params }: { params: { locale: Locale } }) {
  redirect({ href: '/loyihalar#xalqaro', locale: params.locale });
}
