import { useTranslations } from 'next-intl';
import { Home } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const t = useTranslations('Common');
  const tn = useTranslations('Nav');

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-white px-6 text-center">
      <p className="font-serif text-8xl font-bold text-navy/10">404</p>
      <h1 className="mt-4 font-serif text-3xl font-semibold text-navy">{t('notFound')}</h1>
      <p className="mt-2 max-w-md text-muted-foreground">{t('emptyText')}</p>
      <Button asChild className="mt-8">
        <Link href="/">
          <Home className="h-4 w-4" />
          {tn('home')}
        </Link>
      </Button>
    </div>
  );
}
