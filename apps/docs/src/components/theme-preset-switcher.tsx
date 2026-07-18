'use client';

import { themes } from '@kairo-ui/theme';
import { PRESET_NAMES } from '@/lib/home-copy';
import { usePreset } from '@/lib/use-preset';

/**
 * Inline preset picker, embedded in the theming docs page so the prose about
 * presets sits next to a control that actually switches them.
 *
 * Distinct from `PresetToggleButton` in the nav bar: that one is a compact
 * menu for everyday use, this one is a demo laid out as a visible row of named
 * options. Both drive the same state through `usePreset`, so changing the
 * preset in the nav updates this control's selection immediately.
 *
 * Rendered from MDX, which has no locale prop to pass — it is only mounted on
 * the theming page, and English names are used since the surrounding prose
 * names the presets in English either way.
 */
export function ThemePresetSwitcher() {
  const { active, choose } = usePreset();

  return (
    <div
      role="radiogroup"
      aria-label="Theme preset"
      className="flex flex-wrap items-center gap-2 not-prose"
    >
      {themes.map((preset) => {
        const selected = active === preset.id;
        return (
          <button
            key={preset.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => choose(preset.id)}
            className={`flex items-center gap-2 border px-3 py-2 text-sm transition-colors ${
              selected
                ? 'border-fd-primary bg-fd-accent text-fd-accent-foreground'
                : 'border-fd-border text-fd-foreground hover:bg-fd-accent hover:text-fd-accent-foreground'
            }`}
          >
            <span
              aria-hidden="true"
              className="size-4 shrink-0 border border-fd-border"
              style={{ backgroundColor: preset.swatch }}
            />
            <span>{PRESET_NAMES.en[preset.id] ?? preset.label}</span>
            {/* A checkmark, not just the highlight: `aria-checked` covers
                assistive tech, but a sighted user comparing tinted options
                needs a non-colour cue too. */}
            <span aria-hidden="true" className="text-xs">
              {selected ? '✓' : ''}
            </span>
          </button>
        );
      })}
    </div>
  );
}
