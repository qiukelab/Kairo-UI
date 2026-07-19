import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { KairoLocaleProvider } from './locale-provider';
import { useKairoLocale, useKairoMessages } from './use-kairo-messages';
import { defaultMessages } from './messages';

function Probe({ dismissLabel }: { dismissLabel?: string }) {
  const messages = useKairoMessages();
  const locale = useKairoLocale();
  return (
    <div>
      <span data-testid="locale">{locale ?? 'none'}</span>
      <span data-testid="spinner-label">{messages.spinnerLabel}</span>
      <span data-testid="dismiss-label">{dismissLabel ?? messages.toastDismissLabel}</span>
    </div>
  );
}

describe('i18n', () => {
  it('falls back to defaultMessages and an undefined locale when no provider is mounted', () => {
    render(<Probe />);
    expect(screen.getByTestId('locale')).toHaveTextContent('none');
    expect(screen.getByTestId('spinner-label')).toHaveTextContent(defaultMessages.spinnerLabel);
    expect(screen.getByTestId('dismiss-label')).toHaveTextContent(
      defaultMessages.toastDismissLabel,
    );
  });

  it('supplies the locale and overrides messages via KairoLocaleProvider', () => {
    render(
      <KairoLocaleProvider locale="th" messages={{ toastDismissLabel: 'ปิดการแจ้งเตือน' }}>
        <Probe />
      </KairoLocaleProvider>,
    );
    expect(screen.getByTestId('locale')).toHaveTextContent('th');
    // Untouched keys still fall back to defaultMessages.
    expect(screen.getByTestId('spinner-label')).toHaveTextContent(defaultMessages.spinnerLabel);
    expect(screen.getByTestId('dismiss-label')).toHaveTextContent('ปิดการแจ้งเตือน');
  });

  it('lets an explicit prop beat the provider', () => {
    render(
      <KairoLocaleProvider messages={{ toastDismissLabel: 'ปิดการแจ้งเตือน' }}>
        <Probe dismissLabel="Close notification" />
      </KairoLocaleProvider>,
    );
    expect(screen.getByTestId('dismiss-label')).toHaveTextContent('Close notification');
  });
});
