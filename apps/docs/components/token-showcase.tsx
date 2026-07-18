'use client';

import { useEffect, useState } from 'react';

const COLOR_TOKENS = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'muted',
  'muted-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'accent',
  'accent-foreground',
  'success',
  'success-foreground',
  'warning',
  'warning-foreground',
  'danger',
  'danger-foreground',
  'border',
  'input',
  'ring',
];

const SWATCH_TOKENS = COLOR_TOKENS.filter((name) => !name.endsWith('-foreground'));
const RADIUS_TOKENS = ['radius-sm', 'radius-md', 'radius-lg', 'radius'];
const SHADOW_TOKENS = ['shadow-sm', 'shadow-md', 'shadow-lg'];
const MOTION_TOKENS = [
  'duration-fast',
  'duration-normal',
  'duration-slow',
  'ease-standard',
  'ease-emphasized',
  'ease-out',
];

function readTokens(names: string[]): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const styles = getComputedStyle(document.documentElement);
  const values: Record<string, string> = {};
  for (const name of names) {
    values[name] = styles.getPropertyValue(`--kairo-${name}`).trim();
  }
  return values;
}

const sectionHeadingStyle = { color: 'var(--kairo-muted-foreground)' } as const;

/**
 * Live showcase of every `--kairo-*` design token. Reads computed CSS
 * variable values from `<html>` and re-reads them whenever the `class`
 * (mode) or `data-kairo-theme` (preset) attribute changes, so it reflects
 * the active mode + preset without any coupling to the switcher components.
 */
export function TokenShowcase() {
  const [colors, setColors] = useState<Record<string, string>>({});
  const [radii, setRadii] = useState<Record<string, string>>({});
  const [shadows, setShadows] = useState<Record<string, string>>({});
  const [motion, setMotion] = useState<Record<string, string>>({});

  useEffect(() => {
    function refresh() {
      setColors(readTokens(COLOR_TOKENS));
      setRadii(readTokens(RADIUS_TOKENS));
      setShadows(readTokens(SHADOW_TOKENS));
      setMotion(readTokens(MOTION_TOKENS));
    }

    refresh();

    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-kairo-theme'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="not-prose flex flex-col gap-8">
      <section>
        <h3 className="mb-3 text-sm font-medium" style={sectionHeadingStyle}>
          Colors
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {SWATCH_TOKENS.map((name) => {
            const hasForeground = colors[`${name}-foreground`] !== undefined;
            return (
              <div
                key={name}
                className="flex flex-col overflow-hidden rounded-md"
                style={{ border: '1px solid var(--kairo-border)' }}
              >
                <div
                  className="flex h-16 items-center justify-center text-xs font-medium"
                  style={{
                    backgroundColor: `var(--kairo-${name})`,
                    color: hasForeground ? `var(--kairo-${name}-foreground)` : 'var(--kairo-foreground)',
                  }}
                >
                  Aa
                </div>
                <div className="p-2 text-xs" style={sectionHeadingStyle}>
                  <div className="font-mono">--kairo-{name}</div>
                  <div className="font-mono opacity-70">{colors[name]}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium" style={sectionHeadingStyle}>
          Radius
        </h3>
        <div className="flex flex-wrap gap-4">
          {RADIUS_TOKENS.map((name) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <div
                className="h-16 w-16"
                style={{
                  backgroundColor: 'var(--kairo-primary)',
                  borderRadius: `var(--kairo-${name})`,
                }}
              />
              <div className="text-center text-xs font-mono" style={sectionHeadingStyle}>
                --kairo-{name}
                <br />
                {radii[name]}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium" style={sectionHeadingStyle}>
          Shadow
        </h3>
        <div className="flex flex-wrap gap-6">
          {SHADOW_TOKENS.map((name) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <div
                className="h-16 w-16 rounded-md"
                style={{
                  backgroundColor: 'var(--kairo-card)',
                  boxShadow: `var(--kairo-${name})`,
                }}
              />
              <div className="text-center text-xs font-mono" style={sectionHeadingStyle}>
                --kairo-{name}
                <br />
                {shadows[name]}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium" style={sectionHeadingStyle}>
          Motion
        </h3>
        <ul className="grid grid-cols-2 gap-2 text-xs font-mono sm:grid-cols-3" style={sectionHeadingStyle}>
          {MOTION_TOKENS.map((name) => (
            <li key={name}>
              --kairo-{name}: {motion[name]}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium" style={sectionHeadingStyle}>
          Typography
        </h3>
        <div className="flex flex-col gap-2 text-sm">
          <p style={{ fontFamily: 'var(--kairo-font-sans)' }}>The quick brown fox jumps over the lazy dog (font-sans)</p>
          <p style={{ fontFamily: 'var(--kairo-font-mono)' }}>The quick brown fox jumps over the lazy dog (font-mono)</p>
        </div>
      </section>
    </div>
  );
}
