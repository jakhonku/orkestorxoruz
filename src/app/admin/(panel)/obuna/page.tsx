import { db } from '@/lib/db';
import { Obunachilar } from './obunachilar';

export const metadata = { title: 'Obunachilar' };

export default async function ObunaSahifasi() {
  const royxat = await db.subscriber.findMany({ orderBy: { createdAt: 'desc' }, take: 1000 });

  return (
    <Obunachilar
      obunachilar={royxat.map((o) => ({
        id: o.id,
        email: o.email,
        locale: o.locale,
        faol: o.active,
        sana: o.createdAt.toISOString().slice(0, 10),
      }))}
    />
  );
}
