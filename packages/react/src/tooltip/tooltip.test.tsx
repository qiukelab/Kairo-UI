import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { Tooltip, TooltipProvider } from './tooltip';
import { KairoLocaleProvider } from '../i18n/locale-provider';

describe('Tooltip', () => {
  it('renders the trigger with its accessible name', () => {
    render(
      <Tooltip content="Helpful info">
        <button type="button">Hover me</button>
      </Tooltip>,
    );
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
  });

  it('does not render the popup content until opened', () => {
    render(
      <Tooltip content="Helpful info">
        <button type="button">Hover me</button>
      </Tooltip>,
    );
    expect(screen.queryByText('Helpful info')).not.toBeInTheDocument();
  });

  it('renders the popup content when open (controlled)', () => {
    render(
      <Tooltip content="Helpful info" open>
        <button type="button">Hover me</button>
      </Tooltip>,
    );
    expect(screen.getByText('Helpful info')).toBeInTheDocument();
  });

  it('applies the kairo-tooltip-popup class to the popup', () => {
    render(
      <Tooltip content="Helpful info" open>
        <button type="button">Hover me</button>
      </Tooltip>,
    );
    expect(screen.getByText('Helpful info')).toHaveClass('kairo-tooltip-popup');
  });

  it('closes when Escape is pressed', () => {
    const onOpenChange = vi.fn();
    render(
      <Tooltip content="Helpful info" open onOpenChange={onOpenChange}>
        <button type="button">Hover me</button>
      </Tooltip>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('mounts without error when wrapped in a TooltipProvider', () => {
    render(
      <TooltipProvider>
        <Tooltip content="Helpful info">
          <button type="button">Hover me</button>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
  });

  it('has no axe violations on the trigger', async () => {
    const { container } = render(
      <Tooltip content="Helpful info">
        <button type="button">Hover me</button>
      </Tooltip>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('sets lang on the popup when wrapped in a KairoLocaleProvider with a locale', () => {
    render(
      <KairoLocaleProvider locale="th">
        <Tooltip content="Helpful info" open>
          <button type="button">Hover me</button>
        </Tooltip>
      </KairoLocaleProvider>,
    );
    expect(screen.getByText('Helpful info')).toHaveAttribute('lang', 'th');
  });

  it('renders no lang attribute on the popup without a KairoLocaleProvider', () => {
    render(
      <Tooltip content="Helpful info" open>
        <button type="button">Hover me</button>
      </Tooltip>,
    );
    expect(screen.getByText('Helpful info')).not.toHaveAttribute('lang');
  });
});
