import type { ReactNode } from 'react';

// The locale layout owns <html>; this root layout is a passthrough required by
// the App Router. Global styles are imported here so they apply everywhere.
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
