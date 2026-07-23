'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { EnsembleCard } from '@/components/cards/ensemble-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Reveal } from '@/components/shared/reveal';
import { REGION_NAMES } from '@/lib/constants';
import { pick } from '@/lib/utils';
import type { Ensemble, EnsembleType, Region } from '@/types';

const types: EnsembleType[] = ['orkestr', 'xor', 'ansambl'];

export function EnsemblesExplorer({ ensembles }: { ensembles: Ensemble[] }) {
  const locale = useLocale();
  const t = useTranslations('Ensembles');
  const tc = useTranslations('Common');

  const [query, setQuery] = useState('');
  const [type, setType] = useState<'all' | EnsembleType>('all');
  const [region, setRegion] = useState<'all' | Region>('all');

  const regions = useMemo(
    () => Array.from(new Set(ensembles.map((e) => e.region))),
    [ensembles]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ensembles.filter((e) => {
      if (type !== 'all' && e.type !== type) return false;
      if (region !== 'all' && e.region !== region) return false;
      if (q) {
        const hay = `${pick(e.name, locale)} ${e.conductor}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [ensembles, query, type, region, locale]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 shadow-soft md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tc('searchPlaceholder')}
            className="pl-11"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 md:flex md:w-auto">
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            aria-label={t('filterType')}
            className="md:w-44"
          >
            <option value="all">{t('filterType')}</option>
            {types.map((tp) => (
              <option key={tp} value={tp}>
                {t(`type_${tp}`)}
              </option>
            ))}
          </Select>
          <Select
            value={region}
            onChange={(e) => setRegion(e.target.value as typeof region)}
            aria-label={t('filterRegion')}
            className="md:w-48"
          >
            <option value="all">{t('filterRegion')}</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {pick(REGION_NAMES[r], locale)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        {filtered.length} {t('found')}
      </p>

      {filtered.length === 0 ? (
        <EmptyState title={tc('emptyTitle')} text={tc('emptyText')} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ensemble, i) => (
            <Reveal key={ensemble.slug} delay={(i % 3) * 0.08}>
              <EnsembleCard ensemble={ensemble} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
