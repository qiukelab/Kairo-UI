import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { Drawer, DrawerTrigger, DrawerContent, DrawerTitle, DrawerDescription, DrawerClose } from './drawer';
import { KairoLocaleProvider } from '../i18n/locale-provider';

function Example() {
  return (
    <Drawer>
      <DrawerTrigger>Open drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle>Drawer title</DrawerTitle>
        <DrawerDescription>Drawer description</DrawerDescription>
        <DrawerClose>Close</DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}

describe('Drawer', () => {
  it('does not render the popup until the trigger is activated', () => {
    render(<Example />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens on trigger click', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Open drawer' }));
    const drawer = await screen.findByRole('dialog');
    expect(drawer).toBeInTheDocument();
    expect(screen.getByText('Drawer title')).toBeInTheDocument();
  });

  // Base UI (like Radix) deliberately emits no `aria-modal`, conveying modality
  // by marking everything outside the popup aria-hidden/inert instead. Kairo
  // used to hardcode `aria-modal="true"`, which lied for `modal={false}`.
  it('sets no aria-modal on the popup, whatever the root modality', async () => {
    const modes = [undefined, true, false, 'trap-focus'] as const;
    for (const modal of modes) {
      const { unmount } = render(
        <Drawer defaultOpen modal={modal}>
          <DrawerContent>
            <DrawerTitle>Drawer title</DrawerTitle>
          </DrawerContent>
        </Drawer>,
      );
      expect(await screen.findByRole('dialog')).not.toHaveAttribute('aria-modal');
      unmount();
    }
  });

  it('wires the accessible name and description to the title/description parts', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Open drawer' }));
    const drawer = await screen.findByRole('dialog');
    expect(drawer).toHaveAccessibleName('Drawer title');
    expect(drawer).toHaveAccessibleDescription('Drawer description');
  });

  it('moves focus into the drawer when opened', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Open drawer' }));
    const drawer = await screen.findByRole('dialog');
    await waitFor(() => expect(drawer).toContainElement(document.activeElement as HTMLElement));
  });

  it('closes when the Close button is clicked', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Open drawer' }));
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('closes when Escape is pressed', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Open drawer' }));
    const drawer = await screen.findByRole('dialog');
    fireEvent.keyDown(drawer, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('applies the kairo-drawer-backdrop/kairo-drawer-popup classes', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Open drawer' }));
    const drawer = await screen.findByRole('dialog');
    expect(drawer).toHaveClass('kairo-drawer-popup');
    expect(document.querySelector('.kairo-drawer-backdrop')).toBeInTheDocument();
  });

  it('defaults to side="right" when no side is given', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Open drawer' }));
    const drawer = await screen.findByRole('dialog');
    expect(drawer).toHaveAttribute('data-side', 'right');
  });

  it('sets the expected data-side for each of the four sides', async () => {
    const sides = ['top', 'right', 'bottom', 'left'] as const;
    for (const side of sides) {
      const { unmount } = render(
        <Drawer side={side} defaultOpen>
          <DrawerContent>
            <DrawerTitle>Settings</DrawerTitle>
          </DrawerContent>
        </Drawer>,
      );
      const drawer = await screen.findByRole('dialog');
      expect(drawer).toHaveAttribute('data-side', side);
      unmount();
    }
  });

  it('merges a custom className onto the popup', async () => {
    render(
      <Drawer>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent className="custom-popup">
          <DrawerTitle>Title</DrawerTitle>
          <DrawerClose>Close</DrawerClose>
        </DrawerContent>
      </Drawer>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    const drawer = await screen.findByRole('dialog');
    expect(drawer).toHaveClass('kairo-drawer-popup');
    expect(drawer).toHaveClass('custom-popup');
  });

  it('forwards a ref to the popup element', async () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Drawer defaultOpen>
        <DrawerContent ref={ref}>
          <DrawerTitle>Title</DrawerTitle>
          <DrawerClose>Close</DrawerClose>
        </DrawerContent>
      </Drawer>,
    );
    await screen.findByRole('dialog');
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('kairo-drawer-popup');
  });

  // A non-modal drawer must leave the page interactive: the decorative backdrop
  // is dropped entirely, and the viewport — which can't be dropped, since Base
  // UI's swipe/touch-scroll handling lives on it — carries the modality as
  // Kairo's own `data-modal`, which `drawer.css` uses to switch off its
  // `pointer-events`.
  it('drops the backdrop and marks the viewport when the root is not fully modal', async () => {
    const modes = [false, 'trap-focus'] as const;
    for (const modal of modes) {
      const { unmount } = render(
        <Drawer defaultOpen modal={modal}>
          <DrawerContent>
            <DrawerTitle>Drawer title</DrawerTitle>
          </DrawerContent>
        </Drawer>,
      );
      await screen.findByRole('dialog');
      expect(document.querySelector('.kairo-drawer-backdrop')).not.toBeInTheDocument();
      expect(document.querySelector('.kairo-drawer-viewport')).toHaveAttribute(
        'data-modal',
        String(modal),
      );
      unmount();
    }
  });

  it('keeps the backdrop and marks the viewport modal by default', async () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent>
          <DrawerTitle>Drawer title</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );
    await screen.findByRole('dialog');
    expect(document.querySelector('.kairo-drawer-backdrop')).toBeInTheDocument();
    expect(document.querySelector('.kairo-drawer-viewport')).toHaveAttribute('data-modal', 'true');
  });

  it('forwards the container prop to the portal', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    try {
      render(
        <Drawer defaultOpen>
          <DrawerContent container={container}>
            <DrawerTitle>Drawer title</DrawerTitle>
          </DrawerContent>
        </Drawer>,
      );
      const drawer = await screen.findByRole('dialog');
      expect(container).toContainElement(drawer);
    } finally {
      container.remove();
    }
  });

  it('has no axe violations when open', async () => {
    const { baseElement } = render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Open drawer' }));
    await screen.findByRole('dialog');
    expect(await axe(baseElement)).toHaveNoViolations();
  });

  it('sets lang on the popup when wrapped in a KairoLocaleProvider with a locale', async () => {
    render(
      <KairoLocaleProvider locale="th">
        <Example />
      </KairoLocaleProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open drawer' }));
    const drawer = await screen.findByRole('dialog');
    expect(drawer).toHaveAttribute('lang', 'th');
  });

  it('renders no lang attribute on the popup without a KairoLocaleProvider', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Open drawer' }));
    const drawer = await screen.findByRole('dialog');
    expect(drawer).not.toHaveAttribute('lang');
  });
});
