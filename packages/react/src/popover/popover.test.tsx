import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
  PopoverArrow,
} from './popover';
import { KairoLocaleProvider } from '../i18n/locale-provider';

function Example() {
  return (
    <Popover>
      <PopoverTrigger>Open popover</PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverTitle>Popover title</PopoverTitle>
        <PopoverDescription>Popover description</PopoverDescription>
        <PopoverClose>Close</PopoverClose>
      </PopoverContent>
    </Popover>
  );
}

describe('Popover', () => {
  it('does not render the popup until the trigger is activated', () => {
    render(<Example />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens on trigger click', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Open popover' }));
    const popover = await screen.findByRole('dialog');
    expect(popover).toBeInTheDocument();
    expect(screen.getByText('Popover title')).toBeInTheDocument();
  });

  it('renders the popup in a portal on document.body', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Open popover' }));
    const popover = await screen.findByRole('dialog');
    expect(document.body.contains(popover)).toBe(true);
  });

  it('wires aria-labelledby/aria-describedby from PopoverTitle/PopoverDescription', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Open popover' }));
    const popover = await screen.findByRole('dialog');
    const title = screen.getByText('Popover title');
    const description = screen.getByText('Popover description');
    expect(popover).toHaveAttribute('aria-labelledby', title.id);
    expect(popover).toHaveAttribute('aria-describedby', description.id);
  });

  it('closes when the Close button is clicked', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Open popover' }));
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('closes when Escape is pressed', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Open popover' }));
    const popover = await screen.findByRole('dialog');
    fireEvent.keyDown(popover, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('applies the kairo-popover-popup/kairo-popover-arrow classes', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Open popover' }));
    const popover = await screen.findByRole('dialog');
    expect(popover).toHaveClass('kairo-popover-popup');
    expect(document.querySelector('.kairo-popover-arrow')).toBeInTheDocument();
  });

  it('forwards the ref to the popup element', async () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Popover open>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent ref={ref}>
          <PopoverTitle>Popover title</PopoverTitle>
        </PopoverContent>
      </Popover>,
    );
    const popover = await screen.findByRole('dialog');
    expect(ref.current).toBe(popover);
  });

  it('has no axe violations when open', async () => {
    const { baseElement } = render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Open popover' }));
    await screen.findByRole('dialog');
    expect(await axe(baseElement)).toHaveNoViolations();
  });

  it('sets lang on the popup when wrapped in a KairoLocaleProvider with a locale', async () => {
    render(
      <KairoLocaleProvider locale="th">
        <Example />
      </KairoLocaleProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open popover' }));
    const popover = await screen.findByRole('dialog');
    expect(popover).toHaveAttribute('lang', 'th');
  });

  it('renders no lang attribute on the popup without a KairoLocaleProvider', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Open popover' }));
    const popover = await screen.findByRole('dialog');
    expect(popover).not.toHaveAttribute('lang');
  });

  it('portals the popup into a custom container element', async () => {
    const portalTarget = document.createElement('div');
    document.body.appendChild(portalTarget);
    render(
      <Popover>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent container={portalTarget}>
          <PopoverTitle>Popover title</PopoverTitle>
        </PopoverContent>
      </Popover>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open popover' }));
    const popover = await screen.findByRole('dialog');
    expect(portalTarget.contains(popover)).toBe(true);
    document.body.removeChild(portalTarget);
  });
});
