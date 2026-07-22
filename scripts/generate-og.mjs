// Regenerates `apps/docs/public/apple-touch-icon.png` and
// `apps/docs/public/og-image.png` from hand-authored SVG sources.
//
// Run from the repo root: `node scripts/generate-og.mjs`
//
// Why this doesn't just `import sharp from 'sharp'`: sharp isn't a direct
// dependency of any workspace package here — it's only pulled in
// transitively (by `miniflare`, and optionally by `next`, neither of which
// this docs app uses at runtime), so pnpm's strict, per-package
// `node_modules` never symlinks a bare `sharp` specifier into either the
// repo root or `apps/docs`. It IS fully installed (see
// `pnpm.onlyBuiltDependencies` in the root `package.json`), just nested in
// pnpm's content-addressed store — so we resolve it from there directly.
// This is deterministic across machines that share this lockfile (the
// store's `sharp@<version>` directory name is derived from the lockfile),
// the same way `apps/docs/vite.config.ts` reads `packages/react/package.json`
// straight off disk instead of through package resolution.
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const publicDir = path.join(repoRoot, 'apps/docs/public');

function resolveSharp() {
  const pnpmDir = path.join(repoRoot, 'node_modules/.pnpm');
  const storeDirName = readdirSync(pnpmDir).find((name) => name.startsWith('sharp@'));
  if (!storeDirName) {
    throw new Error(
      "Could not find a 'sharp@...' directory under node_modules/.pnpm — run `pnpm install` first.",
    );
  }
  return require(path.join(pnpmDir, storeDirName, 'node_modules/sharp'));
}

// Same brand mark as `apps/docs/public/favicon.svg` (kept in sync by hand —
// see the comment there for where #171717 comes from), parameterised so the
// OG card can use it inverted (white square, dark linework) for contrast
// against its own dark background.
function kMarkSvg({ x, y, size, background, foreground }) {
  const scale = size / 32;
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <rect width="32" height="32" fill="${background}" />
    <path
      d="M10 6 L10 26 M10 16 L22 6 M10 16 L22 26"
      fill="none"
      stroke="${foreground}"
      stroke-width="4"
      stroke-linecap="square"
      stroke-linejoin="miter"
    />
  </g>`;
}

async function generateAppleTouchIcon(sharp) {
  const faviconSvg = readFileSync(path.join(publicDir, 'favicon.svg'), 'utf8');
  const outPath = path.join(publicDir, 'apple-touch-icon.png');
  await sharp(Buffer.from(faviconSvg)).resize(180, 180).png().toFile(outPath);
  return outPath;
}

async function generateOgImage(sharp) {
  // 1200x630 is the standard OG/Twitter "summary_large_image" size. Sharp
  // corners throughout (no rx anywhere), monochrome (#171717 / white / one
  // muted gray for the tagline) — matches the site's brand identity.
  //
  // Text uses "Arial, Helvetica, sans-serif" for BOTH lines deliberately:
  // rsvg/Pango resolves the bare generic `sans-serif` family differently
  // from a family list that *starts* with named fonts before the generic
  // fallback (observed a monospace-looking fallback for a bare `sans-serif`
  // during authoring) — verified visually (see the tool report) that this
  // exact family list renders a proper bold/regular sans on this machine.
  // If regenerating on a machine where these fonts render oddly, either
  // widen the family list or convert the text to paths.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#171717" />
    ${kMarkSvg({ x: 100, y: 97, size: 76, background: '#ffffff', foreground: '#171717' })}
    <text
      x="210"
      y="153"
      font-family="Arial, Helvetica, sans-serif"
      font-size="52"
      font-weight="700"
      fill="#ffffff"
    >Kairo</text>
    <text
      x="100"
      y="380"
      font-family="Arial, Helvetica, sans-serif"
      font-size="64"
      font-weight="700"
      fill="#ffffff"
    >Lightweight, themeable</text>
    <text
      x="100"
      y="460"
      font-family="Arial, Helvetica, sans-serif"
      font-size="64"
      font-weight="700"
      fill="#ffffff"
    >React components</text>
    <text
      x="100"
      y="530"
      font-family="Arial, Helvetica, sans-serif"
      font-size="30"
      fill="#a3a3a3"
    >kairo-docs.quantumdevq.workers.dev</text>
  </svg>`;

  const outPath = path.join(publicDir, 'og-image.png');
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  return outPath;
}

const sharp = resolveSharp();
const applePath = await generateAppleTouchIcon(sharp);
const ogPath = await generateOgImage(sharp);
console.log(`Wrote ${path.relative(repoRoot, applePath)}`);
console.log(`Wrote ${path.relative(repoRoot, ogPath)}`);
