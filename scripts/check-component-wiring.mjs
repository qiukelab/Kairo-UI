/**
 * Asserts that every component under `packages/react/src/*` (excluding
 * `i18n`, which is a provider, not a component) is registered everywhere a
 * new component has to land before it actually ships: both React package
 * build manifests, the src barrel, the theme's CSS bundle, the docs' sidebar
 * metadata, MDX content, prerender slug list, and the components index
 * table — plus a same-count assertion the `check-use-client` guard relies
 * on.
 *
 * None of these registrations depend on each other, so dropping one
 * produces no build error — just a component that silently doesn't export,
 * isn't styled, or isn't documented. Two are worse than silent:
 *
 *   - An unknown `icon:` value in MDX frontmatter renders nothing instead of
 *     throwing (see `apps/docs/src/lib/source.ts`'s `icon()` loader).
 *   - The docs-build CI step's `-ge` page-count floors
 *     (`.github/workflows/ci.yml`) use `>=`, so adding pages never fails
 *     them — they just go stale, and a floor left over from last month's
 *     component count keeps "passing" even if half of today's pages fail to
 *     render.
 *
 * Every assertion below derives both sides from the source files themselves
 * — never a hardcoded component list or page count — so this check can't
 * itself drift the way the gaps it closes did.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REACT_DIR = join(ROOT, 'packages/react');
const THEME_DIR = join(ROOT, 'packages/theme');
const DOCS_DIR = join(ROOT, 'apps/docs');
const COMPONENTS_DOCS_DIR = join(DOCS_DIR, 'content/docs/components');

const errors = [];
const fail = (message) => errors.push(message);

const toDisplayPath = (absPath) => relative(ROOT, absPath).split('\\').join('/');
const readText = (absPath) => readFileSync(absPath, 'utf8');

/** Extracts the first regex capture group, or throws — every pattern below
 * targets hand-written syntax that must exist for the rest of this check to
 * mean anything, so a miss is a bug in this script, not a wiring gap. */
function extract(source, regex, describe) {
  const match = source.match(regex);
  if (!match) throw new Error(`Could not find ${describe}`);
  return match[1];
}

function walkFiles(dir, predicate, results = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, predicate, results);
    else if (predicate(entry.name)) results.push(full);
  }
  return results;
}

/** English cardinal words for 0–99 — enough to cover any realistic component
 * count. Used to verify the spelled-out count in the EN hero lead, which is
 * written as a word ("Twenty-eight") rather than a digit for readability. */
const ONES_WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
];
const TENS_WORDS = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
];
function numberToWords(n) {
  if (n < 0 || n > 99) throw new Error(`numberToWords only supports 0–99, got ${n}`);
  if (n < 20) return ONES_WORDS[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones === 0 ? TENS_WORDS[tens] : `${TENS_WORDS[tens]}-${ONES_WORDS[ones]}`;
}

// ---------------------------------------------------------------------------
// Source of truth: the component directories themselves.
// ---------------------------------------------------------------------------

const componentNames = readdirSync(join(REACT_DIR, 'src'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== 'i18n')
  .map((entry) => entry.name)
  .sort();

// ---------------------------------------------------------------------------
// 1. packages/react/package.json → "exports" has "./<name>"
// ---------------------------------------------------------------------------

const { exports: exportsMap } = JSON.parse(readText(join(REACT_DIR, 'package.json')));
for (const name of componentNames) {
  if (!(`./${name}` in exportsMap)) {
    fail(`packages/react/package.json: "exports" is missing "./${name}"`);
  }
}

// ---------------------------------------------------------------------------
// 2. packages/react/tsdown.config.ts → "entry" has "src/<name>/index.ts"
// ---------------------------------------------------------------------------

const tsdownSrc = readText(join(REACT_DIR, 'tsdown.config.ts'));
const tsdownEntryBlock = extract(
  tsdownSrc,
  /entry:\s*\[([\s\S]*?)\]/,
  'an `entry` array in packages/react/tsdown.config.ts',
);
const tsdownEntries = new Set([...tsdownEntryBlock.matchAll(/'([^']+)'/g)].map((m) => m[1]));
for (const name of componentNames) {
  if (!tsdownEntries.has(`src/${name}/index.ts`)) {
    fail(`packages/react/tsdown.config.ts: "entry" is missing 'src/${name}/index.ts'`);
  }
}

// ---------------------------------------------------------------------------
// 3. packages/react/src/index.ts → "export * from './<name>';"
// ---------------------------------------------------------------------------

const reactBarrelSrc = readText(join(REACT_DIR, 'src/index.ts'));
for (const name of componentNames) {
  if (!reactBarrelSrc.includes(`export * from './${name}';`)) {
    fail(`packages/react/src/index.ts: missing "export * from './${name}';"`);
  }
}

// ---------------------------------------------------------------------------
// 4. packages/theme/css/components/<name>.css exists
// ---------------------------------------------------------------------------

for (const name of componentNames) {
  const cssPath = join(THEME_DIR, 'css/components', `${name}.css`);
  if (!existsSync(cssPath)) {
    fail(`${toDisplayPath(cssPath)} does not exist`);
  }
}

// ---------------------------------------------------------------------------
// 5. packages/theme/css/index.css → "@import './components/<name>.css';"
// ---------------------------------------------------------------------------

const themeIndexSrc = readText(join(THEME_DIR, 'css/index.css'));
for (const name of componentNames) {
  if (!themeIndexSrc.includes(`@import './components/${name}.css';`)) {
    fail(`packages/theme/css/index.css: missing "@import './components/${name}.css';"`);
  }
}

// ---------------------------------------------------------------------------
// 6-7. components/meta.json and meta.th.json → "pages" contains <name>
// ---------------------------------------------------------------------------

for (const metaFile of ['meta.json', 'meta.th.json']) {
  const metaPath = join(COMPONENTS_DOCS_DIR, metaFile);
  const { pages } = JSON.parse(readText(metaPath));
  const pageSet = new Set(pages);
  for (const name of componentNames) {
    if (!pageSet.has(name)) {
      fail(`${toDisplayPath(metaPath)}: "pages" is missing "${name}"`);
    }
  }
}

// ---------------------------------------------------------------------------
// 8-9. components/<name>.mdx and <name>.th.mdx exist
// ---------------------------------------------------------------------------

for (const name of componentNames) {
  for (const suffix of ['.mdx', '.th.mdx']) {
    const mdxPath = join(COMPONENTS_DOCS_DIR, `${name}${suffix}`);
    if (!existsSync(mdxPath)) {
      fail(`${toDisplayPath(mdxPath)} does not exist`);
    }
  }
}

// ---------------------------------------------------------------------------
// 10. apps/docs/vite.config.ts → COMPONENT_SLUGS contains <name>
// ---------------------------------------------------------------------------

const viteConfigPath = join(DOCS_DIR, 'vite.config.ts');
const viteConfigSrc = readText(viteConfigPath);
const componentSlugsBlock = extract(
  viteConfigSrc,
  /const COMPONENT_SLUGS = \[([\s\S]*?)\]/,
  'a `COMPONENT_SLUGS` array in apps/docs/vite.config.ts',
);
const componentSlugs = [...componentSlugsBlock.matchAll(/'([^']+)'/g)].map((m) => m[1]);
const componentSlugSet = new Set(componentSlugs);
for (const name of componentNames) {
  if (!componentSlugSet.has(name)) {
    fail(`apps/docs/vite.config.ts: COMPONENT_SLUGS is missing "${name}"`);
  }
}

// ---------------------------------------------------------------------------
// 11-12. components/index.mdx and index.th.mdx → a table row links to it
// ---------------------------------------------------------------------------

const indexPages = [
  { file: 'index.mdx', hrefPrefix: '/docs/components/' },
  { file: 'index.th.mdx', hrefPrefix: '/th/docs/components/' },
];
for (const { file, hrefPrefix } of indexPages) {
  const indexPath = join(COMPONENTS_DOCS_DIR, file);
  const indexSrc = readText(indexPath);
  for (const name of componentNames) {
    if (!indexSrc.includes(`(${hrefPrefix}${name})`)) {
      fail(`${toDisplayPath(indexPath)}: no table row links to ${hrefPrefix}${name}`);
    }
  }
}

// ---------------------------------------------------------------------------
// 13. packages/react/scripts/check-use-client.mjs → EXPECTED_COMPONENT_COUNT
// ---------------------------------------------------------------------------

const useClientCheckPath = join(REACT_DIR, 'scripts/check-use-client.mjs');
const useClientCheckSrc = readText(useClientCheckPath);
const expectedCountStr = extract(
  useClientCheckSrc,
  /EXPECTED_COMPONENT_COUNT\s*=\s*(\d+)/,
  'an `EXPECTED_COMPONENT_COUNT` assignment in packages/react/scripts/check-use-client.mjs',
);
const expectedCount = Number(expectedCountStr);
if (expectedCount !== componentNames.length) {
  fail(
    `${toDisplayPath(useClientCheckPath)}: EXPECTED_COMPONENT_COUNT is ${expectedCount}, but ${componentNames.length} components exist under packages/react/src/`,
  );
}

// ---------------------------------------------------------------------------
// 14. Silent-failure #1 — every frontmatter `icon:` in apps/docs/content/docs
//     must exist as a key in BOTH the lucide-react import block and the
//     `icons` const in apps/docs/src/lib/source.ts.
// ---------------------------------------------------------------------------

const mdxFiles = walkFiles(join(DOCS_DIR, 'content/docs'), (name) => name.endsWith('.mdx'));
const iconUsages = new Map(); // icon name -> mdx files that use it

for (const mdxPath of mdxFiles) {
  const mdxSrc = readText(mdxPath);
  const frontmatter = mdxSrc.match(/^---\n([\s\S]*?)\n---/)?.[1];
  if (!frontmatter) continue;
  const iconName = frontmatter.match(/^icon:\s*(\S+)\s*$/m)?.[1];
  if (!iconName) continue;
  if (!iconUsages.has(iconName)) iconUsages.set(iconName, []);
  iconUsages.get(iconName).push(mdxPath);
}

const sourceTsPath = join(DOCS_DIR, 'src/lib/source.ts');
const sourceTsSrc = readText(sourceTsPath);
const lucideImportBlock = extract(
  sourceTsSrc,
  // `[^{}]*`, not `[\s\S]*?`: source.ts has an earlier `import { createElement }
  // from 'react';` — a non-greedy dotall group would backtrack across that
  // whole statement (and the `{` that opens this one) to find the next `}`,
  // capturing both imports as one blob. Excluding brace characters keeps the
  // match inside this single, unnested `{ ... }`.
  /\{([^{}]*)\}\s*from\s*'lucide-react';/,
  'a lucide-react import block in apps/docs/src/lib/source.ts',
);
const importedIcons = new Set(
  lucideImportBlock
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);
const iconsConstBlock = extract(
  sourceTsSrc,
  /const icons = \{([\s\S]*?)\} as const;/,
  'an `icons` const in apps/docs/src/lib/source.ts',
);
const iconsConstKeys = new Set(
  iconsConstBlock
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);

for (const [iconName, files] of iconUsages) {
  const usedIn = files.map(toDisplayPath).join(', ');
  if (!importedIcons.has(iconName)) {
    fail(
      `${toDisplayPath(sourceTsPath)}: lucide-react import block is missing "${iconName}" (used as icon: ${iconName} in ${usedIn})`,
    );
  }
  if (!iconsConstKeys.has(iconName)) {
    fail(
      `${toDisplayPath(sourceTsPath)}: "icons" const is missing "${iconName}" (used as icon: ${iconName} in ${usedIn})`,
    );
  }
}

// ---------------------------------------------------------------------------
// 15. Silent-failure #2 — .github/workflows/ci.yml's $html/$raw page-count
//     floors must match what apps/docs/vite.config.ts's prerender lists
//     actually produce, so they can't quietly go stale (they use -ge, so a
//     too-low floor never fails on its own).
//
//     raw = DOC_SLUGS.length * (number of RAW_MARKDOWN_PAGES locale bases)
//     html = raw + 3 (the '/' and '/th' landing pages, plus '/404' — the
//       only prerendered HTML routes that aren't one of the two-locale doc
//       pages `raw` already counts). Verified against today's tree: 28
//       components => DOC_SLUGS.length 32, 2 locale bases => raw 64,
//       html 67 — exactly what ci.yml hardcodes today.
// ---------------------------------------------------------------------------

const docSlugsBlock = extract(
  viteConfigSrc,
  /const DOC_SLUGS = \[([\s\S]*?)\];/,
  'a `DOC_SLUGS` array in apps/docs/vite.config.ts',
);
if (!/\.\.\.COMPONENT_SLUGS\.map/.test(docSlugsBlock)) {
  throw new Error(
    'apps/docs/vite.config.ts: DOC_SLUGS no longer spreads COMPONENT_SLUGS — update the CI-floor formula in scripts/check-component-wiring.mjs',
  );
}
const docSlugsFixedCount = [...docSlugsBlock.matchAll(/'[^']*'/g)].length;
const docSlugsCount = docSlugsFixedCount + componentSlugs.length;

const rawBasesBlock = extract(
  viteConfigSrc,
  /const RAW_MARKDOWN_PAGES = \(\[([\s\S]*?)\]\s*as const\)/,
  'a `RAW_MARKDOWN_PAGES` locale-bases array in apps/docs/vite.config.ts',
);
const rawBasesCount = [...rawBasesBlock.matchAll(/'[^']*'/g)].length;

const expectedRaw = docSlugsCount * rawBasesCount;
const expectedHtml = expectedRaw + 3;

const ciYmlPath = join(ROOT, '.github/workflows/ci.yml');
const ciYmlSrc = readText(ciYmlPath);
const ciHtmlFloor = Number(
  extract(
    ciYmlSrc,
    /test "\$html" -ge (\d+)/,
    'a `test "$html" -ge N` floor in .github/workflows/ci.yml',
  ),
);
const ciRawFloor = Number(
  extract(
    ciYmlSrc,
    /test "\$raw" -ge (\d+)/,
    'a `test "$raw" -ge N` floor in .github/workflows/ci.yml',
  ),
);

if (ciRawFloor !== expectedRaw) {
  fail(
    `${toDisplayPath(ciYmlPath)}: "$raw" floor is ${ciRawFloor}, but apps/docs/vite.config.ts's RAW_MARKDOWN_PAGES implies ${expectedRaw} — update the -ge ${ciRawFloor} floor`,
  );
}
if (ciHtmlFloor !== expectedHtml) {
  fail(
    `${toDisplayPath(ciYmlPath)}: "$html" floor is ${ciHtmlFloor}, but the derived prerendered-page count implies ${expectedHtml} — update the -ge ${ciHtmlFloor} floor`,
  );
}

// ---------------------------------------------------------------------------
// 16. Human-facing component-count literals — the landing/index copy that
//     tells a reader how many components Kairo ships. Unlike the registration
//     points above, nothing breaks the build when these drift, but a page
//     claiming "28 components" while 32 ship is a visible lie. Each entry
//     anchors on its surrounding phrase so an unrelated number is never
//     matched; a reworded sentence throws (a signal to update the anchor
//     here), a stale number fails. The EN hero writes the count as a word for
//     readability, so it is checked against numberToWords().
// ---------------------------------------------------------------------------

const countWord = numberToWords(componentNames.length);
const countLiterals = [
  {
    file: 'apps/docs/src/lib/home-copy.ts',
    form: 'word',
    regex: /\b([A-Za-z]+(?:-[A-Za-z]+)?) accessible components\b/,
    where: 'EN hero lead',
  },
  {
    file: 'apps/docs/src/lib/home-copy.ts',
    form: 'digit',
    regex: /คอมโพเนนต์ที่เข้าถึงง่าย (\d+) ตัว/,
    where: 'TH hero lead',
  },
  {
    file: 'apps/docs/content/docs/index.mdx',
    form: 'digit',
    regex: /Browse all (\d+) components and their props/,
    where: 'EN docs-index Components card',
  },
  {
    file: 'apps/docs/content/docs/index.th.mdx',
    form: 'digit',
    regex: /ดูคอมโพเนนต์ทั้ง (\d+) ตัวพร้อม props/,
    where: 'TH docs-index Components card',
  },
  {
    file: 'apps/docs/content/docs/components/index.mdx',
    form: 'digit',
    regex: /Browse all (\d+) Kairo components/,
    where: 'EN components-index frontmatter',
  },
  {
    file: 'apps/docs/content/docs/components/index.mdx',
    form: 'digit',
    regex: /Kairo ships (\d+) components across/,
    where: 'EN components-index body',
  },
  {
    file: 'apps/docs/content/docs/components/index.th.mdx',
    form: 'digit',
    regex: /เรียกดูคอมโพเนนต์ Kairo ทั้ง (\d+) ตัว/,
    where: 'TH components-index frontmatter',
  },
  {
    file: 'apps/docs/content/docs/components/index.th.mdx',
    form: 'digit',
    regex: /รวมทั้งหมด (\d+) คอมโพเนนต์/,
    where: 'TH components-index body',
  },
];

const countLiteralSrc = new Map();
for (const { file, form, regex, where } of countLiterals) {
  if (!countLiteralSrc.has(file)) countLiteralSrc.set(file, readText(join(ROOT, file)));
  const captured = extract(
    countLiteralSrc.get(file),
    regex,
    `the ${where} component-count phrase in ${file} (reword safely, but keep the anchor in scripts/check-component-wiring.mjs in sync)`,
  );
  if (form === 'digit') {
    if (Number(captured) !== componentNames.length) {
      fail(
        `${file}: the ${where} says "${captured}" components, but ${componentNames.length} exist under packages/react/src/`,
      );
    }
  } else if (captured.toLowerCase() !== countWord) {
    const titled = `${countWord[0].toUpperCase()}${countWord.slice(1)}`;
    fail(
      `${file}: the ${where} says "${captured}", but ${componentNames.length} components exist (write "${titled}")`,
    );
  }
}

// ---------------------------------------------------------------------------

if (errors.length > 0) {
  for (const message of errors) console.error(message);
  console.error(
    `\n${errors.length} component-wiring gap(s) found across ${componentNames.length} components.`,
  );
  process.exit(1);
}
console.log(
  `${componentNames.length} components fully wired across all registration points; icons and CI floors are in sync.`,
);
