'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Menu, Search, X } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { DINAMIK_MENYU_KALITI, NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { LocaleSwitcher } from './locale-switcher';
import { SearchDialog } from './search-dialog';

/** Admin paneldan qo'shilgan sahifa — sarlavhasi bazadan keladi, tarjima kaliti yo'q */
export type DinamikHavola = { href: string; label: string };

/** Menyudagi ichki havola: tarjima kaliti bo'yicha yoki tayyor sarlavha bilan */
type Ichki = { href: string; key?: string; label?: string };

export function Header({ dinamikHavolalar = [] }: { dinamikHavolalar?: DinamikHavola[] }) {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /**
   * Bo'limning ichki havolalari: kodagi doimiylari + admin paneldan
   * qo'shilganlari. Ikkinchisining sarlavhasi bazadan keladi, shuning uchun
   * tarjima kaliti o'rniga tayyor matn bilan yuriladi.
   */
  const ichkiHavolalar = (item: (typeof NAV_ITEMS)[number]): Ichki[] => {
    const doimiy: Ichki[] = item.children ?? [];
    if (item.key !== DINAMIK_MENYU_KALITI) return doimiy;
    return [...doimiy, ...dinamikHavolalar.map((h) => ({ href: h.href, label: h.label }))];
  };

  const havolaMatni = (h: Ichki): string => (h.key ? t(h.key) : (h.label ?? ''));

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'border-b border-white/10 bg-navy-900/90 backdrop-blur-md shadow-soft'
          : 'bg-gradient-to-b from-navy-950/85 via-navy-950/40 to-transparent'
      )}
    >
      <div className="container flex h-20 items-center justify-between gap-2">
        <Logo light />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            const ichki = ichkiHavolalar(item);
            if (ichki.length > 0) {
              return (
                <div
                  key={item.key}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.key)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1 rounded-full px-2.5 py-2 text-sm font-medium transition-colors xl:px-4',
                      active ? 'text-white' : 'text-white/70 hover:text-white'
                    )}
                  >
                    {t(item.key)}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Link>
                  <AnimatePresence>
                    {openDropdown === item.key && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute left-0 top-full w-56 pt-2"
                      >
                        <ul className="overflow-hidden rounded-xl border border-white/10 bg-navy-900/95 py-1 shadow-soft-lg">
                          {ichki.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className="block px-4 py-2.5 text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                              >
                                {havolaMatni(child)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'rounded-full px-2.5 py-2 text-sm font-medium transition-colors xl:px-4',
                  active ? 'text-white' : 'text-white/70 hover:text-white'
                )}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            aria-label={t('home')}
          >
            <Search className="h-5 w-5" />
          </button>
          {/* Til almashtirish har qanday ekranda ko'rinib turadi — mobilda ham */}
          <LocaleSwitcher light />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 lg:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/10 bg-navy-900 lg:hidden"
          >
            {/* Menyu ekranga sig'masa — ichida aylantiriladi (kichik telefonlar) */}
            <nav className="container flex max-h-[calc(100vh-5rem)] flex-col gap-1 overflow-y-auto py-4">
              {NAV_ITEMS.map((item) => {
                const ichki = ichkiHavolalar(item);
                return (
                  <div key={item.key}>
                    <Link
                      href={item.href}
                      className="block rounded-lg px-3 py-2.5 text-base font-medium text-white hover:bg-white/10"
                    >
                      {t(item.key)}
                    </Link>
                    {ichki.length > 0 && (
                      <div className="ml-3 border-l border-white/10 pl-3">
                        {ichki.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block rounded-lg px-3 py-2 text-sm text-white/75 hover:bg-white/10"
                          >
                            {havolaMatni(child)}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="mt-3 border-t border-white/10 pt-4">
                <LocaleSwitcher light inline />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
