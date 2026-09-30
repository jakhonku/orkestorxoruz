'use client';

import { useEffect, useRef } from 'react';
import { Bold, Heading3, Italic, List, ListOrdered, Underline } from 'lucide-react';

import { boyMatnHtml, boyMatnniTozala } from '@/lib/boy-matn';
import { cn } from '@/lib/utils';

const TUGMALAR = [
  { buyruq: 'bold', yorliq: 'Qalin', Ikon: Bold },
  { buyruq: 'italic', yorliq: 'Qiya', Ikon: Italic },
  { buyruq: 'underline', yorliq: 'Tagi chizilgan', Ikon: Underline },
  { buyruq: 'formatBlock', arg: 'h3', yorliq: 'Kichik sarlavha', Ikon: Heading3 },
  { buyruq: 'insertUnorderedList', yorliq: 'Nuqtali ro‘yxat', Ikon: List },
  { buyruq: 'insertOrderedList', yorliq: 'Raqamli ro‘yxat', Ikon: ListOrdered },
] as const;

/**
 * Qalin, qiya, sarlavha va ro'yxat tugmalari bor tahrirlagich.
 * Til almashganda `key` o'zgarib, tahrirlagich yangidan yaratiladi.
 */
export function BoyTahrirlagich({
  qiymat,
  ozgartir,
}: {
  qiymat: string;
  ozgartir: (yangi: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = boyMatnHtml(qiymat);
      document.execCommand('defaultParagraphSeparator', false, 'p');
    }
    // Faqat birinchi ochilganda — yozayotganda kursor sakramasligi uchun
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const yubor = () => {
    if (ref.current) ozgartir(boyMatnniTozala(ref.current.innerHTML));
  };

  const buyruqBer = (buyruq: string, arg?: string) => {
    ref.current?.focus();
    // Sarlavha tugmasi qayta bosilsa oddiy abzatsga qaytadi
    if (buyruq === 'formatBlock') {
      const joriy = String(document.queryCommandValue('formatBlock')).toLowerCase();
      document.execCommand('formatBlock', false, joriy === arg ? 'p' : arg);
    } else {
      document.execCommand(buyruq, false, arg);
    }
    yubor();
  };

  return (
    <div className="overflow-hidden rounded-lg border border-input bg-white focus-within:border-navy focus-within:ring-2 focus-within:ring-navy/15">
      <div className="flex flex-wrap gap-1 border-b border-input bg-muted/40 p-1.5">
        {TUGMALAR.map(({ buyruq, yorliq, Ikon, ...q }) => (
          <button
            key={yorliq}
            type="button"
            title={yorliq}
            aria-label={yorliq}
            // Tugma bosilganda tanlangan matn belgisi yo'qolmasin
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => buyruqBer(buyruq, 'arg' in q ? q.arg : undefined)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-navy transition-colors hover:bg-navy/10"
          >
            <Ikon className="h-4 w-4" />
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={yubor}
        onBlur={yubor}
        onPaste={(e) => {
          // Tashqaridan nusxalangan matn uslubsiz, oddiy matn bo'lib tushadi
          e.preventDefault();
          document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
        }}
        className={cn(
          'min-h-[160px] px-3 py-2 text-sm leading-relaxed text-navy-900 outline-none',
          '[&_p]:mb-2 [&_strong]:font-bold [&_em]:italic [&_u]:underline',
          '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
          '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-navy'
        )}
      />
    </div>
  );
}
