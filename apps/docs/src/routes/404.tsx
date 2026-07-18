import { createFileRoute } from '@tanstack/react-router';
import { NotFound } from '@/components/not-found';

/**
 * A real, directly-navigable `/404` page — not just the router's client-side
 * `notFoundComponent` fallback — so it can be prerendered to `404.html` (see
 * the matching `pages` entry in `vite.config.ts`) and served by Cloudflare's
 * `not_found_handling: "404-page"` for any unmatched path on this static site.
 */
export const Route = createFileRoute('/404')({
  component: NotFound,
});
