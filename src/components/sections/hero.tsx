'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

/** Bosh ekran slaydi — matnlari joriy tilda tayyorlangan holda keladi */
export type Slide = {
  tag: string;
  title: string;
  text: string;
  points: string[];
  image: string;
};

const AUTOPLAY_MS = 6000;

export function Hero({ slides }: { slides: Slide[] }) {
  const t = useTranslations('Home');
  const s = useTranslations('Home.strategy');

  const count = slides.length;

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (dir: number) => {
      setDirection(dir);
      setIndex((prev) => (prev + dir + count) % count);
    },
    [count]
  );

  const goTo = useCallback(
    (target: number) => {
      setDirection(target > index ? 1 : -1);
      setIndex(target);
    },
    [index]
  );

  // Auto-advance (pauses on hover / focus / drag)
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => go(1), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, go, index]);

  // Keyboard arrows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const slide = slides[index];

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
  };

  return (
    <section
      className="relative min-h-screen min-h-[100dvh] overflow-hidden bg-navy-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Crossfading photo background — changes to match each slide's text */}
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image || '/hero.png'}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>

      {/* Navy overlay — keeps the photo visible while text on the left stays readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-900/55 to-navy-900/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-navy-900/20" />
      {/* gold glow accent */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 80% 22%, rgba(201,162,39,0.16), transparent 45%)',
        }}
      />

      <div className="container relative flex min-h-screen min-h-[100dvh] flex-col justify-center pt-28 pb-20">

        {/* Swipeable slide area */}
        <motion.div
          className="max-w-3xl cursor-grab touch-pan-y active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragStart={() => setPaused(true)}
          onDragEnd={(_, info) => {
            if (info.offset.x < -80 || info.velocity.x < -400) go(1);
            else if (info.offset.x > 80 || info.velocity.x > 400) go(-1);
            setPaused(false);
          }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: 'easeInOut' }}
            >
              <span className="inline-flex w-fit items-center rounded-md bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-200 ring-1 ring-white/15 backdrop-blur-sm">
                {slide.tag}
              </span>

              <h1 className="mt-5 max-w-4xl font-serif text-4xl font-semibold leading-[1.1] text-white drop-shadow-sm sm:text-5xl md:text-6xl">
                {slide.title}
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85 md:text-xl">
                {slide.text}
              </p>

              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                {slide.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-center gap-2 text-sm font-medium text-white/75 md:text-base"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Controls: arrows, dots, hint */}
        <div className="mt-8 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={s('prev')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={s('next')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {slides.map((item, i) => (
              <button
                key={item.title}
                type="button"
                onClick={() => goTo(i)}
                aria-label={item.title}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-7 bg-gold' : 'w-1.5 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          <span className="ml-1 hidden text-xs font-medium uppercase tracking-[0.15em] text-white/45 sm:inline">
            {s('hint')}
          </span>
        </div>

        {/* CTAs (constant) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Button
            asChild
            size="lg"
            className="group relative h-12 rounded-full border border-gold-300/40 bg-gradient-to-r from-amber-400 via-gold-400 to-amber-500 px-7 text-sm font-semibold tracking-wide text-navy-950 shadow-[0_4px_20px_rgba(201,162,39,0.35),inset_0_1px_0_rgba(255,255,255,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(201,162,39,0.5)] active:translate-y-0 active:scale-[0.98]"
          >
            <Link href="/afisha" className="flex items-center gap-2.5">
              <CalendarDays className="h-4.5 w-4.5 text-navy-950 transition-transform duration-200 group-hover:scale-110" />
              <span>{t('ctaAfisha')}</span>
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            className="group relative h-12 rounded-full border border-white/20 bg-white/10 px-7 text-sm font-medium tracking-wide text-white shadow-[0_4px_20px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/20 active:translate-y-0 active:scale-[0.98]"
          >
            <Link href="/jamoalar" className="flex items-center gap-2.5">
              <Users className="h-4.5 w-4.5 text-gold-300 transition-colors group-hover:text-gold-200" />
              <span>{t('ctaEnsembles')}</span>
              <ArrowRight className="h-4 w-4 text-white/70 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white" />
            </Link>
          </Button>
        </motion.div>
      </div>

    </section>
  );
}
