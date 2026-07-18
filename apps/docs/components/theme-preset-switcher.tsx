'use client';

import { useEffect, useState } from 'react';
import { setPreset, themes } from '@kairo-ui/theme';

const STORAGE_KEY = 'kairo-preset';

/**
 * Segmented control for switching the active Kairo theme preset
 * (default/ocean/sunset). Persists the choice to `localStorage` and
 * re-applies it on mount.
 *
 * Independent from light/dark mode, which is handled by Fumadocs' built-in
 * `next-themes`-powered toggle (see `RootProvider`'s `theme.attribute="class"`
 * in `app/layout.tsx`).
 */
export function ThemePresetSwitcher() {
  const [active, setActive] = useState<string>(themes[0]?.id ?? 'default');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && themes.some((preset) => preset.id === stored)) {
      setActive(stored);
      setPreset(stored);
    }
  }, []);

  function handleSelect(id: string) {
    setActive(id);
    setPreset(id);
    window.localStorage.setItem(STORAGE_KEY, id);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme preset"
      className="flex items-center gap-1 rounded-md border border-fd-border p-1"
    >
      {themes.map((preset) => (
        <button
          key={preset.id}
          type="button"
          role="radio"
          aria-checked={active === preset.id}
          title={preset.label}
          onClick={() => handleSelect(preset.id)}
          className="flex h-6 w-6 items-center justify-center rounded-sm transition-shadow"
          style={{
            backgroundColor: preset.swatch,
            boxShadow: active === preset.id ? '0 0 0 2px var(--color-fd-background), 0 0 0 4px currentColor' : 'none',
            color: preset.swatch,
          }}
        >
          <span className="sr-only">{preset.label}</span>
        </button>
      ))}
    </div>
  );
}
