'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { Landmark, Globe } from 'lucide-react';
import { ProjectCard } from '@/components/cards/project-card';
import { EmptyState } from '@/components/shared/empty-state';
import { cn } from '@/lib/utils';
import type { Project, ProjectScope } from '@/types';

export function ProjectsTabs({ projects }: { projects: Project[] }) {
  const t = useTranslations('Projects');
  const tc = useTranslations('Common');
  const [scope, setScope] = useState<ProjectScope>('respublika');

  const tabs: { key: ProjectScope; icon: typeof Landmark }[] = [
    { key: 'respublika', icon: Landmark },
    { key: 'xalqaro', icon: Globe },
  ];

  const filtered = projects.filter((p) => p.scope === scope);

  return (
    <div>
      <div className="no-scrollbar mx-auto mb-10 flex max-w-full gap-1 overflow-x-auto rounded-full border border-border bg-white p-1 shadow-soft sm:w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = scope === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setScope(tab.key)}
              className={cn(
                'relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors sm:px-5',
                active ? 'text-white' : 'text-navy/70 hover:text-navy'
              )}
            >
              {active && (
                <motion.span
                  layoutId="projectTab"
                  className="absolute inset-0 rounded-full bg-navy"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{t(`tab_${tab.key}`)}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={scope}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className={cn(filtered.length > 0 && 'grid gap-6 md:grid-cols-2 lg:grid-cols-3')}
        >
          {/* Tanlangan turdagi loyiha bo'lmasa — bo'sh joy emas, xabar ko'rsatiladi */}
          {filtered.length === 0 ? (
            <EmptyState title={tc('emptyTitle')} text={tc('emptyText')} />
          ) : (
            filtered.map((project) => <ProjectCard key={project.slug} project={project} />)
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
