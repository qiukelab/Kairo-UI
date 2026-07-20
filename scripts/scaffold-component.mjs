#!/usr/bin/env node
/**
 * Scaffolds a new Kairo component.
 *
 * Adding one component by hand means creating 7 files and touching ~13
 * registration points spread across `packages/react`, `packages/theme` and
 * `apps/docs` (plus `.github/workflows/ci.yml` and a changeset) — see
 * CONTRIBUTING.md's "Adding a component" section for the full list. This
 * script does that mechanical part so nothing gets forgotten; it does NOT
 * write the component's real behavior, its real docs prose, its Thai
 * translation, or its `DEMO_COPY.th.md` glossary entry — see the checklist
 * printed at the end.
 *
 * Usage:
 *   node scripts/scaffold-component.mjs <kebab-name> [--static] [--icon <LucideName>]
 *
 * `--static` marks the component RSC-safe (no `'use client'`, like
 * Button/Badge/Input) instead of the default interactive stub (`'use
 * client'`, like NumberField). `--icon` names the lucide-react icon used in
 * the docs sidebar (default: "Box" — pick a better one before shipping).
 *
 * Every insertion below is a surgical string edit, not a reformat: `.mdx`
 * files are never touched by a formatter (see `.oxfmtrc.jsonc`), and
 * `apps/docs/content/docs/components/meta.json` is hand-ordered, so both are
 * edited by locating an anchor and splicing text in, never by
 * parse-and-re-stringify. Every edit is idempotent — re-running against a
 * registration point that already has the new name is a no-op — and every
 * edit fails loudly (throws) if its expected anchor text isn't found, rather
 * than silently doing nothing. `scripts/check-component-wiring.mjs` is the
 * independent check that everything below actually landed correctly.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REACT_DIR = join(ROOT, 'packages/react');
const THEME_DIR = join(ROOT, 'packages/theme');
const DOCS_DIR = join(ROOT, 'apps/docs');
const COMPONENTS_DOCS_DIR = join(DOCS_DIR, 'content/docs/components');
const DEMOS_DIR = join(DOCS_DIR, 'src/components/demos');
const CHANGESET_DIR = join(ROOT, '.changeset');

const DEFAULT_ICON = 'Box';
const KEBAB_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

function toDisplay(absPath) {
  return relative(ROOT, absPath).split(sep).join('/');
}

function toPascalCase(kebab) {
  return kebab
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
}

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  let isStatic = false;
  let icon;
  const positionals = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--static') isStatic = true;
    else if (arg === '--icon') {
      icon = argv[++i];
      if (!icon) throw new Error('--icon requires a value, e.g. --icon Box');
    } else if (arg.startsWith('-')) {
      throw new Error(`Unknown flag: ${arg}`);
    } else {
      positionals.push(arg);
    }
  }
  if (positionals.length !== 1) {
    throw new Error(
      'Usage: node scripts/scaffold-component.mjs <kebab-name> [--static] [--icon <LucideName>]',
    );
  }
  return {
    name: positionals[0],
    isStatic,
    icon: icon ?? DEFAULT_ICON,
    iconExplicit: icon !== undefined,
  };
}

// ---------------------------------------------------------------------------
// Generic surgical-edit helpers
// ---------------------------------------------------------------------------

/** Adds the `d` (match indices) flag to a regex if it isn't already there. */
function withIndices(re) {
  return re.flags.includes('d') ? re : new RegExp(re.source, `${re.flags}d`);
}

/**
 * Inserts a plain, comma-less line (matched line-by-line via `^...$` with the
 * `m` flag; group 1 must capture the sortable key) in alphabetical position,
 * or appends after the last match if `key` sorts after everything found.
 * No-ops if `key` is already present. Used for files with one item per line
 * and no trailing punctuation: `packages/react/src/index.ts`'s `export *`
 * lines and `packages/theme/css/index.css`'s component `@import`s.
 */
function insertSortedPlainLine(content, lineRe, key, newLine, displayPath) {
  const matches = [...content.matchAll(lineRe)];
  if (matches.length === 0) throw new Error(`${displayPath}: found no lines matching ${lineRe}`);
  if (matches.some((m) => m[1] === key)) return { content, changed: false };
  const anchor = matches.find((m) => m[1] > key);
  if (anchor) {
    return {
      content: content.slice(0, anchor.index) + newLine + '\n' + content.slice(anchor.index),
      changed: true,
    };
  }
  const last = matches[matches.length - 1];
  const endIdx = last.index + last[0].length;
  return {
    content: content.slice(0, endIdx) + '\n' + newLine + content.slice(endIdx),
    changed: true,
  };
}

/**
 * Inserts `rawItem` into a comma-separated, one-item-per-line list block
 * (every item — including the last — carries a trailing comma, matching this
 * repo's `trailingComma: "all"` style, so there is no "is this the last one"
 * special case). `blockRe`'s first capture group must span exactly the
 * list's inner text. If `pinFirst` is set, the block's first existing item is
 * kept first and excluded from sorting (tsdown's `'src/index.ts'` root entry
 * sorts before some component names but must never move). If `sorted` is
 * false, `rawItem` is appended at the end instead (the `STATIC` set in
 * check-use-client.mjs has no alphabetical convention to preserve). No-ops if
 * `rawItem` is already present.
 */
function insertIntoList(
  content,
  blockRe,
  rawItem,
  { itemIndent = '  ', pinFirst = false, sorted = true, displayPath, label },
) {
  const re = withIndices(blockRe);
  const m = re.exec(content);
  if (!m) throw new Error(`${displayPath}: could not find ${label}`);
  const [start, end] = m.indices[1];
  const inner = content.slice(start, end);
  const closingIndentMatch = inner.match(/\n( *)$/);
  const closingIndent = closingIndentMatch ? closingIndentMatch[1] : '';
  const items = inner
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (items.includes(rawItem)) return { content, changed: false };

  const pinned = pinFirst ? items[0] : null;
  const rest = pinFirst ? items.slice(1) : items;
  if (sorted) {
    let insertAt = rest.findIndex((item) => item > rawItem);
    if (insertAt === -1) insertAt = rest.length;
    rest.splice(insertAt, 0, rawItem);
  } else {
    rest.push(rawItem);
  }
  const finalItems = pinned ? [pinned, ...rest] : rest;

  const rebuilt =
    '\n' + finalItems.map((item) => `${itemIndent}${item},`).join('\n') + '\n' + closingIndent;
  return { content: content.slice(0, start) + rebuilt + content.slice(end), changed: true };
}

/** Replaces the first capture group of a `N -> N + delta` numeric match. Throws if not found. */
function bumpNumber(content, re, delta, displayPath, label) {
  const m = re.exec(content);
  if (!m) throw new Error(`${displayPath}: could not find ${label}`);
  const next = String(Number(m[1]) + delta);
  return (
    content.slice(0, m.index) + m[0].replace(m[1], next) + content.slice(m.index + m[0].length)
  );
}

// ---------------------------------------------------------------------------
// File content generators
// ---------------------------------------------------------------------------

function buildCss(name, isStatic) {
  const cls = `kairo-${name}`;
  if (isStatic) {
    return `/**
 * Kairo ${toPascalCase(name)} — SCAFFOLDED STUB, generated by
 * \`scripts/scaffold-component.mjs\`. Replace with the real implementation
 * before shipping — see CONTRIBUTING.md's "Adding a component" section.
 *
 * Selectors this component keys on (for future ports, e.g. Vue):
 *   - \`.${cls}\` — the root element.
 */
@layer kairo.tokens, kairo.base, kairo.components, kairo.overrides;

@layer kairo.components {
  .${cls} {
    display: block;
    box-sizing: border-box;
    padding: 0.75rem;
    border: var(--kairo-border-width) solid var(--kairo-border);
    border-radius: var(--kairo-radius-md);
    background-color: var(--kairo-background);
    color: var(--kairo-foreground);
    font-family: var(--kairo-font-sans);
    font-size: 0.875rem;
  }
}
`;
  }
  return `/**
 * Kairo ${toPascalCase(name)} — SCAFFOLDED STUB, generated by
 * \`scripts/scaffold-component.mjs\`. Replace with the real implementation
 * before shipping — see CONTRIBUTING.md's "Adding a component" section.
 *
 * Selectors this component keys on (for future ports, e.g. Vue):
 *   - \`.${cls}\`      — the root element.
 *   - \`[data-active]\` — present while the widget is toggled active (this
 *     stub toggles it on click; replace with the real interaction state).
 */
@layer kairo.tokens, kairo.base, kairo.components, kairo.overrides;

@layer kairo.components {
  .${cls} {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: 0.5rem 0.75rem;
    border: var(--kairo-border-width) solid var(--kairo-border);
    border-radius: var(--kairo-radius-md);
    background-color: var(--kairo-background);
    color: var(--kairo-foreground);
    font-family: var(--kairo-font-sans);
    font-size: 0.875rem;
    cursor: pointer;
    transition-property: border-color, background-color;
    transition-duration: var(--kairo-duration-fast);
    transition-timing-function: var(--kairo-ease-standard);
  }

  .${cls}[data-active] {
    border-color: var(--kairo-ring);
    background-color: color-mix(in oklab, var(--kairo-ring) 12%, transparent);
  }
}
`;
}

function buildComponentTsx(name, isStatic) {
  const pascal = toPascalCase(name);
  const cls = `kairo-${name}`;
  if (isStatic) {
    return `import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

export interface ${pascal}Props extends HTMLAttributes<HTMLDivElement> {}

/**
 * SCAFFOLDED STUB for ${pascal}, generated by \`scripts/scaffold-component.mjs\`.
 * Replace this with the real implementation before shipping — see
 * CONTRIBUTING.md's "Adding a component" section. Renders a native \`<div>\`
 * styled via \`.${cls}\` from \`@kairo-ui/theme\`. Stays RSC-safe (no
 * \`'use client'\`) — keep it that way only if the real component, like
 * Button/Badge/Input, has no interaction.
 */
export const ${pascal} = forwardRef<HTMLDivElement, ${pascal}Props>(function ${pascal}(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={className ? \`${cls} \${className}\` : '${cls}'}
      {...props}
    />
  );
});

${pascal}.displayName = '${pascal}';
`;
  }
  return `'use client';

import { forwardRef, useState } from 'react';
import type { ButtonHTMLAttributes } from 'react';

export interface ${pascal}Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether the widget starts active. @default false */
  defaultActive?: boolean;
}

/**
 * SCAFFOLDED STUB for ${pascal}, generated by \`scripts/scaffold-component.mjs\`.
 * Replace this with the real implementation before shipping — see
 * CONTRIBUTING.md's "Adding a component" section. Renders a native
 * \`<button>\` styled via \`.${cls}\` from \`@kairo-ui/theme\`, toggling
 * \`data-active\` on click so the CSS (and any future non-React port) can key
 * off the DOM alone.
 */
export const ${pascal} = forwardRef<HTMLButtonElement, ${pascal}Props>(function ${pascal}(
  { defaultActive = false, className, onClick, ...props },
  ref,
) {
  const [active, setActive] = useState(defaultActive);
  return (
    <button
      ref={ref}
      type="button"
      data-active={active ? '' : undefined}
      className={className ? \`${cls} \${className}\` : '${cls}'}
      onClick={(event) => {
        setActive((current) => !current);
        onClick?.(event);
      }}
      {...props}
    />
  );
});

${pascal}.displayName = '${pascal}';
`;
}

function buildIndexTs(name) {
  const pascal = toPascalCase(name);
  return `export { ${pascal} } from './${name}';
export type { ${pascal}Props } from './${name}';
`;
}

function buildTestTsx(name, isStatic) {
  const pascal = toPascalCase(name);
  const cls = `kairo-${name}`;
  const jestDomComment = `// Side-effect import so the jest-dom matcher types are visible to \`tsc\`,
// which only type-checks \`src\` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).`;
  if (isStatic) {
    return `import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
${jestDomComment}
import '@testing-library/jest-dom/vitest';
import { ${pascal} } from './${name}';

describe('${pascal}', () => {
  it('renders the given text content', () => {
    render(<${pascal}>Content</${pascal}>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('merges a custom className with the base ${cls} class', () => {
    render(<${pascal} className="extra-class">Content</${pascal}>);
    const el = screen.getByText('Content');
    expect(el).toHaveClass('${cls}');
    expect(el).toHaveClass('extra-class');
  });

  it('forwards the ref to the underlying element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<${pascal} ref={ref}>Content</${pascal}>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('has no axe violations', async () => {
    const { container } = render(<${pascal}>Content</${pascal}>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
`;
  }
  return `import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
${jestDomComment}
import '@testing-library/jest-dom/vitest';
import { ${pascal} } from './${name}';

describe('${pascal}', () => {
  it('renders the given text content', () => {
    render(<${pascal}>Content</${pascal}>);
    expect(screen.getByRole('button', { name: 'Content' })).toBeInTheDocument();
  });

  it('merges a custom className with the base ${cls} class', () => {
    render(<${pascal} className="extra-class">Content</${pascal}>);
    const el = screen.getByRole('button', { name: 'Content' });
    expect(el).toHaveClass('${cls}');
    expect(el).toHaveClass('extra-class');
  });

  it('forwards the ref to the underlying button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<${pascal} ref={ref}>Content</${pascal}>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('toggles data-active on click', () => {
    render(<${pascal}>Content</${pascal}>);
    const el = screen.getByRole('button', { name: 'Content' });
    expect(el).not.toHaveAttribute('data-active');
    fireEvent.click(el);
    expect(el).toHaveAttribute('data-active');
  });

  it('has no axe violations', async () => {
    const { container } = render(<${pascal}>Content</${pascal}>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
`;
}

function buildDemoTsx(name) {
  const pascal = toPascalCase(name);
  return `'use client';

import { ${pascal} } from '@kairo-ui/react';
import type { Locale } from '@/lib/i18n';
import { useDemoCopy } from './use-demo-locale';

interface ${pascal}Copy {
  label: string;
}

const COPY: Record<Locale, ${pascal}Copy> = {
  en: {
    label: 'Toggle ${pascal}',
  },
  th: {
    // TODO: real Thai translation — add a "## ${name}-demo.tsx" section to
    // DEMO_COPY.th.md documenting the EN -> TH strings you choose.
    label: 'สลับ ${pascal}',
  },
};

/**
 * SCAFFOLDED STUB demo for the ${pascal} docs page, generated by
 * \`scripts/scaffold-component.mjs\`. Replace with a real demo before
 * shipping — see CONTRIBUTING.md's "Adding a component" section.
 */
export function ${pascal}Demo() {
  const t = useDemoCopy(COPY);

  return (
    <div className="flex flex-wrap items-start gap-8">
      <${pascal}>{t.label}</${pascal}>
    </div>
  );
}
`;
}

function buildMdxEn(name, isStatic, icon) {
  const pascal = toPascalCase(name);
  const cls = `kairo-${name}`;
  const importLine = isStatic
    ? `import { ${pascal} } from '@kairo-ui/react';`
    : `import { ${pascal}Demo } from '@/components/demos/${name}-demo';`;
  const usageExample = isStatic
    ? `import { ${pascal} } from '@kairo-ui/react';

export function Example() {
  return <${pascal} />;
}`
    : `import { ${pascal} } from '@kairo-ui/react';

export function Example() {
  return <${pascal}>Toggle</${pascal}>;
}`;
  const previewCode = isStatic ? `<${pascal} />` : `<${pascal}>Toggle</${pascal}>`;
  const previewChildren = isStatic ? `<${pascal} />` : `<${pascal}Demo />`;

  return `---
title: ${pascal}
description: TODO — describe ${pascal} in one sentence.
icon: ${icon}
---

${importLine}

## Usage

\`\`\`tsx
${usageExample}
\`\`\`

TODO: describe ${pascal}'s anatomy, behavior and accessibility here — see an
existing page (e.g. \`number-field.mdx\`) for the level of detail expected.

## Default

<ComponentPreview code={\`${previewCode}\`}>
  ${previewChildren}
</ComponentPreview>

## Props

| Prop        | Type              | Default | Description                                              |
| ----------- | ----------------- | ------- | ------------------------------------------------------------ |
| \`className\` | \`string\`          | —       | Merged with the base \`${cls}\` class.                         |
| ...         | Additional props | —       | All other props are forwarded to the underlying element.   |
`;
}

function buildMdxTh(name, isStatic, icon) {
  const pascal = toPascalCase(name);
  const cls = `kairo-${name}`;
  const importLine = isStatic
    ? `import { ${pascal} } from '@kairo-ui/react';`
    : `import { ${pascal}Demo } from '@/components/demos/${name}-demo';`;
  const usageExample = isStatic
    ? `import { ${pascal} } from '@kairo-ui/react';

export function Example() {
  return <${pascal} />;
}`
    : `import { ${pascal} } from '@kairo-ui/react';

export function Example() {
  return <${pascal}>สลับ</${pascal}>;
}`;
  const previewCode = isStatic ? `<${pascal} />` : `<${pascal}>สลับ</${pascal}>`;
  const previewChildren = isStatic ? `<${pascal} />` : `<${pascal}Demo />`;

  return `---
title: ${pascal}
description: TODO — แปลคำอธิบายของ ${pascal} เป็นภาษาไทย
icon: ${icon}
---

${importLine}

## การใช้งาน

\`\`\`tsx
${usageExample}
\`\`\`

TODO: แปลเนื้อหาอธิบาย ${pascal} เป็นภาษาไทย (ดูตัวอย่างจาก \`number-field.th.mdx\`)

## ค่าเริ่มต้น

<ComponentPreview code={\`${previewCode}\`}>
  ${previewChildren}
</ComponentPreview>

## Props

| Prop        | Type              | Default | Description                                          |
| ----------- | ----------------- | ------- | ---------------------------------------------------------- |
| \`className\` | \`string\`          | —       | รวมกับคลาสพื้นฐาน \`${cls}\`                                  |
| ...         | Additional props | —       | props อื่น ๆ ที่เหลือจะถูกส่งต่อไปยังอีลีเมนต์ด้านใน        |
`;
}

function buildChangeset(name) {
  const pascal = toPascalCase(name);
  return `---
"@kairo-ui/theme": minor
"@kairo-ui/react": minor
---

Add ${pascal} component
`;
}

// ---------------------------------------------------------------------------
// Registration-point editors (one per file)
// ---------------------------------------------------------------------------

function editReactBarrel(content, name) {
  const displayPath = 'packages/react/src/index.ts';
  return insertSortedPlainLine(
    content,
    /^export \* from '\.\/([\w-]+)';$/gm,
    name,
    `export * from './${name}';`,
    displayPath,
  );
}

function editThemeIndexCss(content, name) {
  const displayPath = 'packages/theme/css/index.css';
  return insertSortedPlainLine(
    content,
    /^@import '\.\/components\/([\w-]+)\.css';$/gm,
    name,
    `@import './components/${name}.css';`,
    displayPath,
  );
}

function editTsdownConfig(content, name) {
  const displayPath = 'packages/react/tsdown.config.ts';
  return insertIntoList(content, /entry:\s*\[([\s\S]*?)\]/, `'src/${name}/index.ts'`, {
    itemIndent: '    ',
    pinFirst: true, // 'src/index.ts' (the root barrel) always stays first, out of alpha order
    displayPath,
    label: 'the `entry` array',
  });
}

function editReactPackageJson(content, name) {
  const displayPath = 'packages/react/package.json';
  const entryRe =
    /( {4}"\.\/([a-z0-9-]+)": \{\n {6}"types": "\.\/dist\/\2\/index\.d\.mts",\n {6}"import": "\.\/dist\/\2\/index\.mjs"\n {4}\})(,)?\n/g;
  const matches = [...content.matchAll(entryRe)];
  if (matches.length === 0) throw new Error(`${displayPath}: no "exports" subpath entries matched`);
  const entries = matches.map((m) => ({ name: m[2], block: m[1] }));
  if (entries.some((e) => e.name === name)) return { content, changed: false };
  const newBlock = `    "./${name}": {\n      "types": "./dist/${name}/index.d.mts",\n      "import": "./dist/${name}/index.mjs"\n    }`;
  let insertAt = entries.findIndex((e) => e.name > name);
  if (insertAt === -1) insertAt = entries.length;
  entries.splice(insertAt, 0, { name, block: newBlock });
  const rebuilt = entries
    .map((e, i) => e.block + (i < entries.length - 1 ? ',' : '') + '\n')
    .join('');
  const first = matches[0];
  const last = matches[matches.length - 1];
  return {
    content: content.slice(0, first.index) + rebuilt + content.slice(last.index + last[0].length),
    changed: true,
  };
}

function editCheckUseClient(content, name, isStatic) {
  const displayPath = 'packages/react/scripts/check-use-client.mjs';
  let result = { content, changed: false };

  if (isStatic) {
    const staticResult = insertIntoList(
      result.content,
      /const STATIC = new Set\(\[([\s\S]*?)\]\)/,
      `'${name}'`,
      { itemIndent: '  ', sorted: false, displayPath, label: 'the `STATIC` set' },
    );
    result = { content: staticResult.content, changed: result.changed || staticResult.changed };
  }

  const countRe = /const EXPECTED_COMPONENT_COUNT = (\d+);/;
  const m = countRe.exec(result.content);
  if (!m) throw new Error(`${displayPath}: could not find EXPECTED_COMPONENT_COUNT`);
  const bumped = bumpNumber(result.content, countRe, 1, displayPath, 'EXPECTED_COMPONENT_COUNT');
  result = { content: bumped, changed: true };

  return result;
}

function editViteConfig(content, name) {
  const displayPath = 'apps/docs/vite.config.ts';
  return insertIntoList(content, /const COMPONENT_SLUGS = \[([\s\S]*?)\] as const;/, `'${name}'`, {
    itemIndent: '  ',
    displayPath,
    label: 'the `COMPONENT_SLUGS` array',
  });
}

function editSourceTsIcon(content, iconName) {
  const displayPath = 'apps/docs/src/lib/source.ts';
  const importResult = insertIntoList(content, /\{([^{}]*)\}\s*from\s*'lucide-react';/, iconName, {
    itemIndent: '  ',
    displayPath,
    label: 'the lucide-react import block',
  });
  const constResult = insertIntoList(
    importResult.content,
    /const icons = \{([\s\S]*?)\} as const;/,
    iconName,
    { itemIndent: '  ', displayPath, label: 'the `icons` const' },
  );
  return { content: constResult.content, changed: importResult.changed || constResult.changed };
}

function editCiFloors(content) {
  const displayPath = '.github/workflows/ci.yml';
  let out = content;
  out = bumpNumber(out, /test "\$html" -ge (\d+)/, 2, displayPath, 'the `$html` floor');
  out = bumpNumber(out, /test "\$raw" -ge (\d+)/, 2, displayPath, 'the `$raw` floor');
  // The `-ge` literal and the number quoted back in the failure message are
  // two separate occurrences on the same line. Bumping only the first leaves
  // CI telling you it "expected >=67" while actually enforcing 69 — a message
  // that sends the next reader looking in the wrong place.
  out = bumpNumber(
    out,
    /expected >=(\d+) prerendered pages/,
    2,
    displayPath,
    'the `$html` message',
  );
  out = bumpNumber(
    out,
    /expected >=(\d+) raw markdown files/,
    2,
    displayPath,
    'the `$raw` message',
  );
  return { content: out, changed: true };
}

/**
 * `meta.json`/`meta.th.json`'s `pages` array is grouped by hand under
 * `---Category---` separators (see the file). This script is not clever
 * enough to pick the *right* group for an unknown new component, so it
 * always appends the slug as the last item of the LAST group and reports
 * which group that was — move it by hand if that's not a sane home.
 */
function editMetaJson(content, name, displayPath) {
  const startMarker = '"pages": [\n';
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) throw new Error(`${displayPath}: could not find "pages": [`);
  const arrayStart = startIdx + startMarker.length;
  const endMarker = '\n  ]\n}';
  const endIdx = content.indexOf(endMarker, arrayStart);
  if (endIdx === -1) throw new Error(`${displayPath}: could not find the closing "]" of "pages"`);
  const body = content.slice(arrayStart, endIdx);
  if (new RegExp(`"${name}"`).test(body)) return { content, changed: false, group: null };

  const groupMatches = [...body.matchAll(/---([^-]+)---/g)];
  const group = groupMatches.length ? groupMatches[groupMatches.length - 1][1].trim() : null;

  const lines = body.split('\n');
  lines[lines.length - 1] = lines[lines.length - 1].replace(/,?\s*$/, ',');
  lines.push(`    "${name}"`);
  const newBody = lines.join('\n');
  return {
    content: content.slice(0, arrayStart) + newBody + content.slice(endIdx),
    changed: true,
    group,
  };
}

/**
 * Like `bumpNumber`, but for a `(prefix)(N)(suffix)` regex — used to pin the
 * match to one specific sentence in a file that mentions numbers in more than
 * one place, rather than bumping the first bare digit run found.
 */
function bumpComponentCount(content, re, displayPath, label) {
  const m = re.exec(content);
  if (!m) throw new Error(`${displayPath}: could not find ${label}`);
  const next = String(Number(m[2]) + 1);
  const replacement = m[1] + next + m[3];
  return content.slice(0, m.index) + replacement + content.slice(m.index + m[0].length);
}

/**
 * `components/index.mdx` / `index.th.mdx`: appends a new table row after the
 * LAST row in the file (i.e. into whatever the last category's table is —
 * kept consistent with `editMetaJson`'s "last group" choice above), and
 * bumps the two component-count mentions in the page header.
 */
function editComponentsIndexMdx(content, name, pascal, lang, displayPath) {
  const hrefPrefix = lang === 'th' ? '/th/docs/components/' : '/docs/components/';
  if (content.includes(`(${hrefPrefix}${name})`)) return { content, changed: false };

  // The trailing anchor is `[ \t]*$`, NOT `\s*$`: `\s` matches `\n` too, so a
  // greedy `\s*` right before a multiline `$` swallows the row's own newline
  // (and, for the last row in the file, the file's final newline with it) —
  // which then inserts the new row with a spurious blank line before it and
  // silently drops the file's trailing newline.
  const rowRe = /^\|\s*\[.+\]\(.+\)\s*\|.*\|[ \t]*$/gm;
  const matches = [...content.matchAll(rowRe)];
  if (matches.length === 0)
    throw new Error(`${displayPath}: found no table rows to anchor the new row after`);
  const last = matches[matches.length - 1];
  const insertIdx = last.index + last[0].length;
  const description =
    lang === 'th' ? `TODO — เขียนคำอธิบาย ${pascal} เป็นภาษาไทย` : `TODO: describe ${pascal}.`;
  const newRow = `\n| [${pascal}](${hrefPrefix}${name}) | ${description} |`;
  let newContent = content.slice(0, insertIdx) + newRow + content.slice(insertIdx);

  if (lang === 'th') {
    newContent = bumpComponentCount(
      newContent,
      /(เรียกดูคอมโพเนนต์ Kairo ทั้ง )(\d+)( ตัว)/,
      displayPath,
      'the Thai frontmatter component count',
    );
    newContent = bumpComponentCount(
      newContent,
      /(รวมทั้งหมด )(\d+)( คอมโพเนนต์)/,
      displayPath,
      'the Thai body component count',
    );
  } else {
    newContent = bumpComponentCount(
      newContent,
      /(Browse all )(\d+)( Kairo components)/,
      displayPath,
      'the frontmatter component count',
    );
    newContent = bumpComponentCount(
      newContent,
      /(Kairo ships )(\d+)( components across)/,
      displayPath,
      'the body component count',
    );
  }
  return { content: newContent, changed: true };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const { name, isStatic, icon, iconExplicit } = parseArgs(process.argv.slice(2));
  if (!KEBAB_RE.test(name)) {
    throw new Error(`"${name}" is not kebab-case (expected e.g. "avatar-group")`);
  }
  const pascal = toPascalCase(name);

  const componentDir = join(REACT_DIR, 'src', name);
  if (existsSync(componentDir)) {
    throw new Error(
      `${toDisplay(componentDir)} already exists — pick a different name, or remove it first.`,
    );
  }

  const created = [];
  const edited = [];
  const skipped = [];
  const notes = [];

  function createFile(absPath, content) {
    mkdirSync(dirname(absPath), { recursive: true });
    writeFileSync(absPath, content, 'utf8');
    created.push(toDisplay(absPath));
  }

  function editFile(absPath, transform) {
    const before = readFileSync(absPath, 'utf8');
    const { content: after, changed, ...rest } = transform(before);
    if (!changed) {
      skipped.push(toDisplay(absPath));
      return rest;
    }
    writeFileSync(absPath, after, 'utf8');
    edited.push(toDisplay(absPath));
    return rest;
  }

  // --- 1-7: the 7 new files ------------------------------------------------

  createFile(join(THEME_DIR, 'css/components', `${name}.css`), buildCss(name, isStatic));
  createFile(join(componentDir, `${name}.tsx`), buildComponentTsx(name, isStatic));
  createFile(join(componentDir, 'index.ts'), buildIndexTs(name));
  createFile(join(componentDir, `${name}.test.tsx`), buildTestTsx(name, isStatic));
  if (!isStatic) {
    createFile(join(DEMOS_DIR, `${name}-demo.tsx`), buildDemoTsx(name));
  }
  createFile(join(COMPONENTS_DOCS_DIR, `${name}.mdx`), buildMdxEn(name, isStatic, icon));
  createFile(join(COMPONENTS_DOCS_DIR, `${name}.th.mdx`), buildMdxTh(name, isStatic, icon));

  // --- 8-17: registration points -------------------------------------------

  editFile(join(REACT_DIR, 'src/index.ts'), (c) => editReactBarrel(c, name));
  editFile(join(REACT_DIR, 'package.json'), (c) => editReactPackageJson(c, name));
  editFile(join(REACT_DIR, 'tsdown.config.ts'), (c) => editTsdownConfig(c, name));
  editFile(join(REACT_DIR, 'scripts/check-use-client.mjs'), (c) =>
    editCheckUseClient(c, name, isStatic),
  );
  editFile(join(THEME_DIR, 'css/index.css'), (c) => editThemeIndexCss(c, name));

  const metaGroup = editFile(join(COMPONENTS_DOCS_DIR, 'meta.json'), (c) =>
    editMetaJson(c, name, 'apps/docs/content/docs/components/meta.json'),
  );
  const metaThGroup = editFile(join(COMPONENTS_DOCS_DIR, 'meta.th.json'), (c) =>
    editMetaJson(c, name, 'apps/docs/content/docs/components/meta.th.json'),
  );

  editFile(join(COMPONENTS_DOCS_DIR, 'index.mdx'), (c) =>
    editComponentsIndexMdx(c, name, pascal, 'en', 'apps/docs/content/docs/components/index.mdx'),
  );
  editFile(join(COMPONENTS_DOCS_DIR, 'index.th.mdx'), (c) =>
    editComponentsIndexMdx(c, name, pascal, 'th', 'apps/docs/content/docs/components/index.th.mdx'),
  );

  editFile(join(DOCS_DIR, 'vite.config.ts'), (c) => editViteConfig(c, name));
  editFile(join(DOCS_DIR, 'src/lib/source.ts'), (c) => editSourceTsIcon(c, icon));
  editFile(join(ROOT, '.github/workflows/ci.yml'), (c) => editCiFloors(c));

  // --- 18: changeset ---------------------------------------------------------

  const changesetPath = join(CHANGESET_DIR, `add-${name}.md`);
  if (existsSync(changesetPath)) {
    skipped.push(toDisplay(changesetPath));
  } else {
    createFile(changesetPath, buildChangeset(name));
  }

  if (metaGroup?.group) {
    notes.push(
      `meta.json: added "${name}" to the "${metaGroup.group}" group (the last one in the file) — move it to a more fitting category by hand if "${metaGroup.group}" isn't right for ${pascal}.`,
    );
  }
  if (metaThGroup?.group) {
    notes.push(
      `meta.th.json: same slug added to its "${metaThGroup.group}" group, for the same reason.`,
    );
  }
  if (!iconExplicit) {
    notes.push(
      `No --icon was given, so "${DEFAULT_ICON}" was used as a placeholder. Pick a real one from https://lucide.dev/icons before shipping.`,
    );
  }

  // --- summary ---------------------------------------------------------------

  console.log(
    `\nScaffolded ${pascal} (${name}${isStatic ? ', static/RSC-safe' : ', interactive'}).\n`,
  );
  if (created.length) {
    console.log('Created:');
    for (const f of created) console.log(`  + ${f}`);
  }
  if (edited.length) {
    console.log('\nEdited:');
    for (const f of edited) console.log(`  ~ ${f}`);
  }
  if (skipped.length) {
    console.log('\nAlready up to date (no change needed):');
    for (const f of skipped) console.log(`  = ${f}`);
  }
  if (notes.length) {
    console.log('\nNotes:');
    for (const n of notes) console.log(`  ! ${n}`);
  }

  console.log(`
Next steps — this script only did the mechanical wiring. Still on you:

  1. Write the real ${pascal} implementation in
     packages/react/src/${name}/${name}.tsx (currently a scaffolded stub).
  2. Style it for real in packages/theme/css/components/${name}.css
     (currently a scaffolded stub).
  3. Write the real docs prose in
     apps/docs/content/docs/components/${name}.mdx (replace the TODOs).
  4. Translate apps/docs/content/docs/components/${name}.th.mdx into Thai
     (replace the TODOs) — see docs/PROJECT.md or an existing *.th.mdx page
     for tone/conventions.${
       isStatic
         ? ''
         : `
  5. Flesh out apps/docs/src/components/demos/${name}-demo.tsx into a real
     demo, and give it a real Thai COPY entry.
  6. Add a "## ${name}-demo.tsx" section to
     apps/docs/src/components/demos/DEMO_COPY.th.md documenting the EN -> TH
     strings you chose (see the existing sections for the expected format).`
     }
  7. Fill in the real Props table(s) in both mdx pages once the API is final.
  8. Sanity-check the changeset at .changeset/add-${name}.md.

Root package.json is out of scope for this script (per the brief) — wire it
up with something like:
  "scaffold-component": "node scripts/scaffold-component.mjs"
`);
}

main();
