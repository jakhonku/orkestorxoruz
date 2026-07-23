'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Modal } from '@/components/shared/modal';
import { pick } from '@/lib/utils';
import { ensembles } from '@/data/ensembles';
import { projects } from '@/data/projects';
import { events } from '@/data/events';
import { news } from '@/data/news';

interface Result {
  label: string;
  href: string;
  group: string;
}

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const locale = useLocale();
  const t = useTranslations('Common');
  const tNav = useTranslations('Nav');
  const [query, setQuery] = useState('');

  const index: Result[] = useMemo(
    () => [
      ...ensembles.map((e) => ({ label: pick(e.name, locale), href: `/jamoalar/${e.slug}`, group: tNav('ensembles') })),
      ...projects.map((p) => ({ label: pick(p.title, locale), href: `/loyihalar/${p.slug}`, group: tNav('projects') })),
      ...events.map((e) => ({ label: pick(e.title, locale), href: `/afisha`, group: tNav('afisha') })),
      ...news.map((n) => ({ label: pick(n.title, locale), href: `/media/${n.slug}`, group: tNav('media') })),
    ],
    [locale, tNav]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return index.filter((r) => r.label.toLowerCase().includes(q)).slice(0, 8);
  }, [query, index]);

  return (
    <Modal open={open} onClose={onClose} title={t('search')}>
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="h-11 w-full rounded-xl border border-input bg-white pl-11 pr-4 text-sm focus-visible:border-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20"
        />
      </div>

      {query && results.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">{t('notFound')}</p>
      )}

      <ul className="space-y-1">
        {results.map((r, i) => (
          <li key={i}>
            <Link
              href={r.href}
              onClick={onClose}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-navy/5"
            >
              <span className="text-sm font-medium text-navy">{r.label}</span>
              <span className="text-xs text-muted-foreground">{r.group}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
