'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  CalendarDays,
  ExternalLink,
  FileText,
  FolderKanban,
  Globe,
  Handshake,
  Images,
  Inbox,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  Presentation,
  Settings,
  Shield,
  Trophy,
  Type,
  UserRound,
  Users,
  Video,
  X,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { MENYU } from '../_lib/bolimlar';
import { chiqish } from '../../actions';

const IKONKALAR: Record<string, LucideIcon> = {
  users: Users,
  'folder-kanban': FolderKanban,
  trophy: Trophy,
  'calendar-days': CalendarDays,
  newspaper: Newspaper,
  video: Video,
  images: Images,
  'user-round': UserRound,
  globe: Globe,
  'file-text': FileText,
  'list-checks': ListChecks,
  presentation: Presentation,
  'bar-chart-3': BarChart3,
  handshake: Handshake,
  inbox: Inbox,
  mail: Mail,
  settings: Settings,
  shield: Shield,
  type: Type,
};

export function YonMenyu({
  foydalanuvchi,
  adminMi,
  yangiArizalar,
}: {
  foydalanuvchi: { name: string; email: string };
  adminMi: boolean;
  yangiArizalar: number;
}) {
  const pathname = usePathname();
  const [ochiq, setOchiq] = useState(false);

  const guruhlar = MENYU.map((g) => ({
    ...g,
    bolimlar: g.bolimlar.filter((b) => !b.faqatAdmin || adminMi),
  })).filter((g) => g.bolimlar.length > 0);

  return (
    <>
      {/* Mobil uchun ochish tugmasi */}
      <button
        onClick={() => setOchiq(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white shadow-soft lg:hidden"
        aria-label="Menyuni ochish"
      >
        <Menu className="h-5 w-5 text-navy" />
      </button>

      {ochiq && (
        <div
          className="fixed inset-0 z-40 bg-navy-900/40 lg:hidden"
          onClick={() => setOchiq(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-white transition-transform lg:translate-x-0',
          ochiq ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Sarlavha */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Link href="/admin" onClick={() => setOchiq(false)}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
              Orkestr va Xor
            </p>
            <p className="font-serif text-lg font-semibold text-navy">Boshqaruv paneli</p>
          </Link>
          <button
            onClick={() => setOchiq(false)}
            className="lg:hidden"
            aria-label="Menyuni yopish"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Menyu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <Havola
            href="/admin"
            faol={pathname === '/admin'}
            ikonka={LayoutDashboard}
            onClick={() => setOchiq(false)}
          >
            Bosh sahifa
          </Havola>

          {guruhlar.map((guruh) => (
            <div key={guruh.nom} className="mt-5">
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                {guruh.nom}
              </p>
              {guruh.bolimlar.map((b) => {
                const href = `/admin/${b.kalit}`;
                return (
                  <Havola
                    key={b.kalit}
                    href={href}
                    faol={pathname === href || pathname.startsWith(href + '/')}
                    ikonka={IKONKALAR[b.ikonka] ?? FileText}
                    belgi={b.kalit === 'arizalar' && yangiArizalar > 0 ? yangiArizalar : undefined}
                    onClick={() => setOchiq(false)}
                  >
                    {b.nom}
                  </Havola>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Pastki qism */}
        <div className="border-t border-border p-3">
          <a
            href="/uz"
            target="_blank"
            rel="noreferrer"
            className="mb-2 flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-navy/5 hover:text-navy"
          >
            <ExternalLink className="h-4 w-4" />
            Saytni ochish
          </a>

          <div className="rounded-xl bg-navy-50/60 p-3">
            <p className="truncate text-sm font-medium text-navy">{foydalanuvchi.name}</p>
            <p className="truncate text-xs text-muted-foreground">{foydalanuvchi.email}</p>
            <form action={chiqish} className="mt-2">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-white py-1.5 text-xs font-medium text-navy transition-colors hover:border-gold/40"
              >
                <LogOut className="h-3.5 w-3.5" />
                Chiqish
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}

function Havola({
  href,
  faol,
  ikonka: Ikonka,
  belgi,
  onClick,
  children,
}: {
  href: string;
  faol: boolean;
  ikonka: LucideIcon;
  belgi?: number;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors',
        faol
          ? 'bg-navy font-semibold text-white'
          : 'text-navy-900 hover:bg-navy/5',
      )}
    >
      <Ikonka className={cn('h-4 w-4 shrink-0', faol ? 'text-gold' : 'text-muted-foreground')} />
      <span className="flex-1 truncate">{children}</span>
      {belgi !== undefined && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[11px] font-bold text-navy-900">
          {belgi}
        </span>
      )}
    </Link>
  );
}
