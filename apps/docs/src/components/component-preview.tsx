import type { ReactNode } from 'react';

export interface ComponentPreviewProps {
  /** The component/markup to render inside the preview panel. */
  children: ReactNode;
  /** Optional source snippet rendered below the preview. */
  code?: string;
}

/**
 * Reusable preview frame for component documentation pages.
 *
 * Renders `children` inside a bordered, token-themed panel (using
 * `--kairo-card`/`--kairo-border`/`--kairo-radius`) so previews automatically
 * follow the active mode + preset. This is currently an empty shell — future
 * component doc pages (Phase 2) plug their live examples into it.
 */
export function ComponentPreview({ children, code }: ComponentPreviewProps) {
  return (
    <div
      className="not-prose my-4 overflow-hidden"
      style={{
        border: '1px solid var(--kairo-border)',
        borderRadius: 'var(--kairo-radius-lg)',
        backgroundColor: 'var(--kairo-card)',
        color: 'var(--kairo-card-foreground)',
      }}
    >
      <div className="flex min-h-32 items-center justify-center p-6">{children}</div>
      {code ? (
        <pre
          className="overflow-x-auto p-4 text-sm"
          style={{
            borderTop: '1px solid var(--kairo-border)',
            fontFamily: 'var(--kairo-font-mono)',
          }}
        >
          <code>{code}</code>
        </pre>
      ) : null}
    </div>
  );
}
