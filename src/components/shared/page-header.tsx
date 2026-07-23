import { Breadcrumbs, type Crumb } from './breadcrumbs';
import { Reveal } from './reveal';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
}

/** Navy gradient page banner used at the top of inner pages. */
export function PageHeader({ title, subtitle, crumbs }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden bg-navy">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy to-navy-900" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(201,162,39,0.25), transparent 40%)',
        }}
      />
      <div className="container relative py-14 md:py-20">
        {crumbs && crumbs.length > 0 && (
          <div className="mb-5">
            <Breadcrumbs crumbs={crumbs} light />
          </div>
        )}
        <Reveal>
          <h1 className="max-w-3xl font-serif text-4xl font-semibold leading-tight text-white md:text-5xl">
            {title}
          </h1>
        </Reveal>
        {subtitle && (
          <Reveal delay={0.1}>
            <p className="mt-4 max-w-2xl text-lg text-white/70">{subtitle}</p>
          </Reveal>
        )}
        <div className="mt-6 h-1 w-20 rounded-full bg-gold" />
      </div>
    </header>
  );
}
