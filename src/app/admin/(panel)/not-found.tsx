import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';

export default function PanelTopilmadi() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
      <SearchX className="mx-auto mb-3 h-8 w-8 text-navy/25" />
      <h1 className="font-serif text-xl font-semibold text-navy">Bo‘lim topilmadi</h1>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        Bunday manzil yo‘q yoki yozuv o‘chirib yuborilgan. Chap menyudan kerakli bo‘limni tanlang.
      </p>
      <Link
        href="/admin"
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-navy px-4 text-sm font-semibold text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Bosh sahifaga
      </Link>
    </div>
  );
}
