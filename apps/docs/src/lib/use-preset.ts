'use client';

import { useCallback, useEffect, useState } from 'react';
import { setPreset, themes } from '@kairo-ui/theme';

const STORAGE_KEY = 'kairo-preset';
/**
 * Two controls edit the same preset — the nav bar's menu and the inline demo
 * embedded in the theming page. Without a shared signal, changing one leaves
 * the other showing a stale selection until it happens to remount. A window
 * event is enough here: both live in the same document, and the value is a
 * single string that already round-trips through `localStorage`.
 */
const CHANGE_EVENT = 'kairo:preset-change';

const FALLBACK = themes[0]?.id ?? 'default';

export function usePreset() {
  const [active, setActive] = useState<string>(FALLBACK);

  // Restore on mount rather than during render: `localStorage` does not exist
  // while prerendering, and reading it in render would desync hydration.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && themes.some((preset) => preset.id === stored)) {
      setActive(stored);
      setPreset(stored);
    }
  }, []);

  useEffect(() => {
    function onChange(event: Event) {
      const id = (event as CustomEvent<string>).detail;
      if (typeof id === 'string') setActive(id);
    }
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, []);

  const choose = useCallback((id: string) => {
    setActive(id);
    setPreset(id);
    window.localStorage.setItem(STORAGE_KEY, id);
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: id }));
  }, []);

  return { active, choose };
}
