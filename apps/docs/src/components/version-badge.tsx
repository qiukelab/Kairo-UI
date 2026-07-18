import type { Locale } from '@/lib/i18n';

// Injected by Vite's `define` from `@kairo-ui/react`'s package.json at build
// time, so this can never drift from what changesets actually released.
declare const __KAIRO_VERSION__: string;

/**
 * Version chip shown at the top of the docs sidebar.
 *
 * Deliberately NOT a dropdown: there is only one version, and a picker that
 * opens to a single item is a worse lie than a label. Turn it into a real
 * selector the day a second version exists.
 */
export function VersionBadge({ locale = 'en' }: { locale?: Locale }) {
  const version = __KAIRO_VERSION__;
  // 0.0.0 is the pre-publish placeholder — saying "Latest" before anything has
  // ever shipped would be misleading.
  const isUnreleased = version === '0.0.0';
  const th = locale === 'th';

  return (
    <div
      className="flex items-center justify-between gap-2 border border-fd-border px-2.5 py-1.5 text-xs"
      title={
        isUnreleased
          ? th
            ? 'ยังไม่เผยแพร่ขึ้น npm'
            : 'Not published to npm yet'
          : `@kairo-ui/react v${version}`
      }
    >
      <span className="font-medium text-fd-foreground">
        {isUnreleased ? (th ? 'ยังไม่เผยแพร่' : 'Unreleased') : `v${version}`}
      </span>
      <span className="text-fd-muted-foreground">
        {isUnreleased ? 'main' : th ? 'ล่าสุด' : 'Latest'}
      </span>
    </div>
  );
}
