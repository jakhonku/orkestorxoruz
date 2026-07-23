import Link from 'next/link';

// Fallback for requests that never reach the [locale] segment.
export default function GlobalNotFound() {
  return (
    <html lang="uz">
      <body
        style={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          color: '#0B3C7D',
        }}
      >
        <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
        <p style={{ color: '#64748b' }}>Sahifa topilmadi · Страница не найдена · Page not found</p>
        <Link href="/uz" style={{ marginTop: '1.5rem', color: '#C9A227', fontWeight: 600 }}>
          → Bosh sahifa
        </Link>
      </body>
    </html>
  );
}
