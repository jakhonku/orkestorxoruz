'use client';

import Image from 'next/image';
import { useLocale } from 'next-intl';
import { CalendarDays, MapPin, ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { pick } from '@/lib/utils';
import type { Project } from '@/types';

export function ProjectCard({ project }: { project: Project }) {
  const locale = useLocale();

  return (
    <Link
      href={`/loyihalar/${project.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={project.cover}
          alt={pick(project.title, locale)}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-xl font-semibold leading-snug text-navy transition-colors group-hover:text-navy-600">
          {pick(project.title, locale)}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {pick(project.shortDescription, locale)}
        </p>
        <div className="mt-4 flex flex-col gap-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-gold" />
            {pick(project.period, locale)}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-gold" />
            {pick(project.location, locale)}
          </span>
        </div>
      </div>
    </Link>
  );
}