/**
 * Centralised image URLs.
 *
 * Demo uses deterministic placeholder photos (picsum.photos) so nothing ever
 * renders broken. Replace `img('seed')` calls with real orchestra/choir/concert
 * photography (or a CDN URL) when content is ready — the shape stays the same.
 */
export function img(seed: string, w = 1200, h = 800): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

export function portrait(seed: string): string {
  return img(seed, 600, 800);
}

export function square(seed: string): string {
  return img(seed, 800, 800);
}
