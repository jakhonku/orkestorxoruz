'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Users } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export function Hero() {
  const t = useTranslations('Home');

  return (
    <section className="relative overflow-hidden bg-navy-900">
      {/* Real orchestra photo background */}
      <Image
        src="/hero.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Lighter navy overlay — keeps the orchestra visible, text on the left readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-900/85 via-navy-900/45 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-transparent to-navy-900/25" />
      {/* gold glow accent */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 80% 22%, rgba(201,162,39,0.16), transparent 45%)',
        }}
      />

      <div className="container relative flex min-h-[90vh] flex-col justify-center py-24">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-200 backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          {t('heroSlogan')}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-4xl font-serif text-4xl font-semibold leading-[1.1] text-white drop-shadow-sm sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {t('heroTitle')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl"
        >
          {t('heroSubtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Button asChild variant="gold" size="lg">
            <Link href="/afisha">
              <CalendarDays className="h-5 w-5" />
              {t('ctaAfisha')}
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="border border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
          >
            <Link href="/jamoalar">
              <Users className="h-5 w-5" />
              {t('ctaEnsembles')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* soft bottom fade into page */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
