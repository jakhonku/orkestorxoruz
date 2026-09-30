import { redirect } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

/** Tanlov va festivallar endi "Loyihalar" sahifasining alohida bo'limi */
export default function TanlovlarQaytarish({ params }: { params: { locale: Locale } }) {
  redirect({ href: '/loyihalar#tanlovlar', locale: params.locale });
}
