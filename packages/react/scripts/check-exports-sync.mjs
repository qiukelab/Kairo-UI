/**
 * Asserts that `package.json`'s `exports` map and `tsdown.config.ts`'s
 * `entry` array name exactly the same set of subpaths.
 *
 * The two are hand-synced (tsdown does not write `exports` for us), so
 * nothing else stops a new component's entry from landing without a
 * matching export, or vice versa — a subpath in one but not the other
 * resolves to nothing for consumers.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const toExportKey = (entry) => {
  const match = entry.match(/^src\/(?:([\w-]+)\/)?index\.ts$/);
  if (!match) throw new Error(`tsdown entry does not match 'src/<name>/index.ts': ${entry}`);
  return match[1] ? `./${match[1]}` : '.';
};

const configSrc = readFileSync(join(ROOT, 'tsdown.config.ts'), 'utf8');
const entryArray = configSrc.match(/entry:\s*\[([\s\S]*?)\]/)?.[1];
if (!entryArray) throw new Error('Could not find an `entry` array in tsdown.config.ts');
const entryKeys = new Set([...entryArray.matchAll(/'([^']+)'/g)].map((m) => toExportKey(m[1])));

const { exports } = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const exportKeys = new Set(Object.keys(exports));

const onlyInEntry = [...entryKeys].filter((key) => !exportKeys.has(key));
const onlyInExports = [...exportKeys].filter((key) => !entryKeys.has(key));

for (const key of onlyInEntry)
  console.error(`tsdown entry has no matching "exports" subpath: ${key}`);
for (const key of onlyInExports) console.error(`"exports" has no matching tsdown entry: ${key}`);

if (onlyInEntry.length || onlyInExports.length) process.exit(1);
console.log(`exports and tsdown entry are in sync (${exportKeys.size} subpaths).`);
