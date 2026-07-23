'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface LightboxImage {
  src: string;
  caption?: string;
}

interface LightboxProps {
  images: LightboxImage[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const open = index !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && index !== null) onNavigate((index + 1) % images.length);
      if (e.key === 'ArrowLeft' && index !== null)
        onNavigate((index - 1 + images.length) % images.length);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, index, images.length, onClose, onNavigate]);

  if (typeof document === 'undefined') return null;

  const current = index !== null ? images[index] : null;

  return createPortal(
    <AnimatePresence>
      {open && current && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-navy-900/90 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button
            onClick={onClose}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index! - 1 + images.length) % images.length);
            }}
            className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:left-8"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <motion.figure
            key={index}
            className="relative max-h-[85vh] w-full max-w-4xl"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl">
              <Image
                src={current.src}
                alt={current.caption ?? ''}
                fill
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover"
              />
            </div>
            {current.caption && (
              <figcaption className="mt-3 text-center text-sm text-white/80">
                {current.caption}
              </figcaption>
            )}
          </motion.figure>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index! + 1) % images.length);
            }}
            className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:right-8"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
