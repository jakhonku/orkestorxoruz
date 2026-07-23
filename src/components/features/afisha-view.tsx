'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CalendarDays, LayoutList, Calendar as CalendarIcon } from 'lucide-react';
import { EventCard } from '@/components/cards/event-card';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/shared/empty-state';
import { Reveal } from '@/components/shared/reveal';
import { cn, getMonthName, pick } from '@/lib/utils';
import type { ConcertEvent } from '@/types';
import type { Locale } from '@/i18n/routing';

type View = 'list' | 'calendar';

export function AfishaView({ events }: { events: ConcertEvent[] }) {
  const locale = useLocale() as Locale;
  const t = useTranslations('Afisha');
  const [view, setView] = useState<View>('list');
  const [month, setMonth] = useState<'all' | string>('all');

  const sorted = useMemo(
    () => [...events].sort((a, b) => a.date.localeCompare(b.date)),
    [events]
  );

  // Distinct year-month keys present in the data.
  const monthKeys = useMemo(() => {
    const set = new Set(sorted.map((e) => e.date.slice(0, 7)));
    return Array.from(set).sort();
  }, [sorted]);

  const filtered = useMemo(
    () => (month === 'all' ? sorted : sorted.filter((e) => e.date.startsWith(month))),
    [sorted, month]
  );

  function monthLabel(key: string) {
    const [year, m] = key.split('-');
    return `${getMonthName(Number(m) - 1, locale)} ${year}`;
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="sm:w-56"
          aria-label={t('allMonths')}
        >
          <option value="all">{t('allMonths')}</option>
          {monthKeys.map((key) => (
            <option key={key} value={key}>
              {monthLabel(key)}
            </option>
          ))}
        </Select>

        <div className="flex w-fit gap-1 rounded-full border border-border bg-white p-1 shadow-soft">
          <ViewButton active={view === 'list'} onClick={() => setView('list')} icon={LayoutList}>
            {t('viewList')}
          </ViewButton>
          <ViewButton
            active={view === 'calendar'}
            onClick={() => setView('calendar')}
            icon={CalendarIcon}
          >
            {t('viewCalendar')}
          </ViewButton>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={t('noEvents')} />
      ) : view === 'list' ? (
        <div className="space-y-5">
          {filtered.map((event, i) => (
            <Reveal key={event.slug} delay={(i % 4) * 0.06}>
              <EventCard event={event} />
            </Reveal>
          ))}
        </div>
      ) : (
        <CalendarView events={filtered} locale={locale} />
      )}
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof LayoutList;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
        active ? 'bg-navy text-white shadow-soft' : 'text-navy/70 hover:text-navy'
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function CalendarView({ events, locale }: { events: ConcertEvent[]; locale: Locale }) {
  const t = useTranslations('Afisha');
  // Group by year-month, render a grid per month present.
  const groups = useMemo(() => {
    const map = new Map<string, ConcertEvent[]>();
    for (const e of events) {
      const key = e.date.slice(0, 7);
      map.set(key, [...(map.get(key) ?? []), e]);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [events]);

  const weekdays =
    locale === 'ru'
      ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
      : locale === 'en'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

  return (
    <div className="space-y-10">
      {groups.map(([key, monthEvents]) => {
        const [year, m] = key.split('-').map(Number);
        const first = new Date(year, m - 1, 1);
        const daysInMonth = new Date(year, m, 0).getDate();
        // Monday-first offset.
        const startOffset = (first.getDay() + 6) % 7;
        const cells: (number | null)[] = [
          ...Array(startOffset).fill(null),
          ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
        ];
        const eventsByDay = new Map<number, ConcertEvent[]>();
        for (const e of monthEvents) {
          const d = Number(e.date.slice(8, 10));
          eventsByDay.set(d, [...(eventsByDay.get(d) ?? []), e]);
        }

        return (
          <div key={key} className="rounded-2xl border border-border bg-white p-4 shadow-soft md:p-6">
            <h3 className="mb-4 font-serif text-xl font-semibold text-navy">
              {getMonthName(m - 1, locale)} {year}
            </h3>
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {weekdays.map((w) => (
                <div
                  key={w}
                  className="pb-2 text-center text-xs font-semibold uppercase text-muted-foreground"
                >
                  {w}
                </div>
              ))}
              {cells.map((day, i) => {
                const dayEvents = day ? eventsByDay.get(day) : undefined;
                return (
                  <div
                    key={i}
                    className={cn(
                      'min-h-[64px] rounded-lg border p-1.5 md:min-h-[92px]',
                      day ? 'border-border' : 'border-transparent',
                      dayEvents && 'bg-gold/5'
                    )}
                  >
                    {day && (
                      <span
                        className={cn(
                          'text-xs font-medium',
                          dayEvents ? 'text-gold-700' : 'text-muted-foreground'
                        )}
                      >
                        {day}
                      </span>
                    )}
                    <div className="mt-1 space-y-1">
                      {dayEvents?.map((e) => (
                        <a
                          key={e.slug}
                          href={e.ticketUrl ?? '#'}
                          className="block truncate rounded bg-navy px-1.5 py-0.5 text-[10px] font-medium text-white"
                          title={pick(e.title, locale)}
                        >
                          {e.time} {pick(e.title, locale)}
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <CalendarDays className="h-4 w-4 text-gold" />
        {t('subtitle')}
      </p>
    </div>
  );
}
