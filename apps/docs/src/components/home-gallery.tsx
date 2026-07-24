'use client';

import type { ReactNode } from 'react';
import {
  Badge,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  SliderControl,
  SliderIndicator,
  SliderLabel,
  SliderThumb,
  SliderTrack,
  SliderValue,
  Switch,
} from '@kairo-ui/react';
import { HOME_COPY } from '@/lib/home-copy';
import type { Locale } from '@/lib/i18n';

/**
 * Small caps caption for a gallery cell — the same type scale as
 * `SectionLabel` in `home-page.tsx`, minus its spanning rule (a cell this
 * small has no room for one).
 */
function CellCaption({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-medium tracking-widest text-fd-muted-foreground uppercase">
      {children}
    </span>
  );
}

/** Shared frame for a gallery cell — a hairline border shared with its
 *  neighbours (see the outer grid's `gap-px bg-fd-border`), the same trick
 *  already used by the theming section's two-column grid below. */
function Cell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center gap-4 bg-fd-background p-6">
      {children}
    </div>
  );
}

/**
 * Curated live component gallery for the landing page's "See it in action"
 * section. Sits below the primary `ComponentPreview` (Buttons) in
 * `home-page.tsx` and rounds it out with a handful of diverse, real
 * `@kairo-ui/react` components — Switch, Checkbox, Badge, Slider, Select.
 *
 * Every component reads its styling from `--kairo-*` tokens, so the whole
 * grid follows the active preset and light/dark mode toggled from the nav
 * bar above it, the same as the Buttons preview.
 */
export function HomeGallery({ locale }: { locale: Locale }) {
  const copy = HOME_COPY[locale].gallery;
  const sizes = [
    { value: 'sm', label: copy.selectSmall },
    { value: 'md', label: copy.selectMedium },
    { value: 'lg', label: copy.selectLarge },
  ];

  return (
    <div className="grid grid-cols-1 gap-px border border-fd-border bg-fd-border sm:grid-cols-2 lg:grid-cols-3">
      <Cell>
        <CellCaption>{copy.switch}</CellCaption>
        <Switch defaultChecked aria-label={copy.switch} />
      </Cell>

      <Cell>
        <CellCaption>{copy.checkbox}</CellCaption>
        <Checkbox defaultChecked aria-label={copy.checkbox} />
      </Cell>

      <Cell>
        <CellCaption>{copy.badges}</CellCaption>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="soft" intent="default">
            {copy.badgeDefault}
          </Badge>
          <Badge variant="soft" intent="primary">
            {copy.badgePrimary}
          </Badge>
          <Badge variant="soft" intent="success">
            {copy.badgeSuccess}
          </Badge>
          <Badge variant="soft" intent="warning">
            {copy.badgeWarning}
          </Badge>
          <Badge variant="soft" intent="danger">
            {copy.badgeDanger}
          </Badge>
        </div>
      </Cell>

      <Cell>
        {/* Its own label/value row already reads as the cell's caption —
            a `CellCaption` above it would just repeat "Volume" twice. */}
        <Slider defaultValue={65} className="w-full max-w-52">
          <div className="flex items-center justify-between">
            <SliderLabel>{copy.slider}</SliderLabel>
            <SliderValue />
          </div>
          <SliderControl>
            <SliderTrack>
              <SliderIndicator />
              <SliderThumb />
            </SliderTrack>
          </SliderControl>
        </Slider>
      </Cell>

      <Cell>
        <CellCaption>{copy.select}</CellCaption>
        <Select items={sizes} defaultValue="md">
          <SelectTrigger aria-label={copy.select} className="w-32">
            <SelectValue placeholder={copy.selectPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {sizes.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Cell>
    </div>
  );
}
