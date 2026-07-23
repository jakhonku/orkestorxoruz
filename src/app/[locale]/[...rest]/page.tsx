import { notFound } from 'next/navigation';

// Any unmatched path under a valid locale falls through to the localized 404.
export default function CatchAll() {
  notFound();
}
