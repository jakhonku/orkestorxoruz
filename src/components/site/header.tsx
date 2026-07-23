'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Menu, Search, X } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { LocaleSwitcher } from './locale-switcher';
import { SearchDialog } from './search-dialog';

export function Header() {
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

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'border-b border-white/10 bg-navy-900/80 backdrop-blur-md shadow-soft'
          : 'bg-transparent'
      )}
    >
      <div className="container flex h-20 items-center justify-between gap-4">
        <Logo light />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            if (item.children) {
              return (
                <div
                  key={item.key}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.key)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    className={cn(
                      'flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                      active ? 'text-white' : 'text-white/70 hover:text-white'
                    )}
                  >
                    {t(item.key)}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
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
                          {item.children.map((child) => (
                            <li key={child.key}>
                              <Link
                                href={child.href}
                                className="block px-4 py-2.5 text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                              >
                                {t(child.key)}
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
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
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
          <div className="hidden lg:block">
            <LocaleSwitcher light />
          </div>
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
            <nav className="container flex flex-col gap-1 py-4">
              {NAV_ITEMS.map((item) => (
                <div key={item.key}>
                  <Link
                    href={item.href}
                    className="block rounded-lg px-3 py-2.5 text-base font-medium text-white hover:bg-white/10"
                  >
                    {t(item.key)}
                  </Link>
                  {item.children && (
                    <div className="ml-3 border-l border-white/10 pl-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.key}
                          href={child.href}
                          className="block rounded-lg px-3 py-2 text-sm text-white/75 hover:bg-white/10"
                        >
                          {t(child.key)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="mt-3 border-t border-white/10 pt-3">
                <LocaleSwitcher light />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
