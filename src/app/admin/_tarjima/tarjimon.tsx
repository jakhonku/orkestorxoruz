'use client';

import { useEffect } from 'react';

import { tarjimaQil } from '@/lib/admin-tarjima';

/**
 * Ruscha tanlanganda ekrandagi o'zbekcha matnlarni ruschaga almashtiradi.
 *
 * - Sahifa ochilganda hammasi bir marta o'tiladi, keyin `MutationObserver`
 *   yangi paydo bo'lgan yoki o'zgargan matnlarni (server javobi, ochilgan
 *   oynalar, xato xabarlari) shu zahoti tarjima qiladi.
 * - Matn tugunlari va `placeholder`/`title`/`aria-label`/`alt` atributlari;
 *   `confirm`/`alert` oynalari ham. Foydalanuvchi yozgan qiymatlarga
 *   (input, textarea) tegilmaydi.
 * - Ochilish paytida sahifa yashirin turadi (`data-tarjima` qo'yilguncha) —
 *   o'zbekcha matn bir lahza "yaltirab" ko'rinmasligi uchun.
 */

const ATRIBUTLAR = ['placeholder', 'title', 'aria-label', 'alt'];
const TEGILMAYDI = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'NOSCRIPT', 'CODE', 'PRE']);

function tuguniOgir(t: Text) {
  const ota = t.parentElement;
  if (!ota || TEGILMAYDI.has(ota.tagName) || ota.closest('[data-tarjima-yoq]')) return;
  const eski = t.nodeValue ?? '';
  const yangi = tarjimaQil(eski);
  if (yangi !== eski) t.nodeValue = yangi;
}

function elementniOgir(el: Element) {
  for (const a of ATRIBUTLAR) {
    const v = el.getAttribute(a);
    if (v) {
      const y = tarjimaQil(v);
      if (y !== v) el.setAttribute(a, y);
    }
  }
  if (el instanceof HTMLInputElement && (el.type === 'submit' || el.type === 'button') && el.value) {
    const y = tarjimaQil(el.value);
    if (y !== el.value) el.value = y;
  }
}

function daraxtniOgir(ildiz: Node) {
  if (ildiz.nodeType === Node.TEXT_NODE) return tuguniOgir(ildiz as Text);
  if (ildiz.nodeType !== Node.ELEMENT_NODE) return;
  const el = ildiz as Element;
  elementniOgir(el);
  const yurgich = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  for (let n = yurgich.nextNode(); n; n = yurgich.nextNode()) {
    if (n.nodeType === Node.TEXT_NODE) tuguniOgir(n as Text);
    else elementniOgir(n as Element);
  }
}

export function AdminTarjimon() {
  useEffect(() => {
    const html = document.documentElement;

    const sarlavha = () => {
      const y = tarjimaQil(document.title);
      if (y !== document.title) document.title = y;
    };

    const boshlash = () => {
      daraxtniOgir(document.body);
      sarlavha();
      html.setAttribute('data-tarjima', '1');
    };

    // Gidratsiya tugashini kutamiz: bundan oldin matnni o'zgartirsak React nomuvofiqlik deb hisoblaydi
    const kutish = window.setTimeout(boshlash, 60);

    const kuzatuvchi = new MutationObserver((royxat) => {
      for (const m of royxat) {
        if (m.type === 'characterData') tuguniOgir(m.target as Text);
        else if (m.type === 'attributes') elementniOgir(m.target as Element);
        else m.addedNodes.forEach(daraxtniOgir);
      }
      sarlavha();
    });
    kuzatuvchi.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATRIBUTLAR,
    });

    // Brauzerning o'z oynalari (masalan "Rostdan o'chirilsinmi?")
    const { confirm: asliConfirm, alert: asliAlert } = window;
    window.confirm = (xabar?: string) => asliConfirm.call(window, xabar ? tarjimaQil(xabar) : xabar);
    window.alert = (xabar?: unknown) =>
      asliAlert.call(window, typeof xabar === 'string' ? tarjimaQil(xabar) : xabar);

    return () => {
      window.clearTimeout(kutish);
      kuzatuvchi.disconnect();
      window.confirm = asliConfirm;
      window.alert = asliAlert;
    };
  }, []);

  return null;
}
