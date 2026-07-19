import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogClose,
} from './alert-dialog';
import { KairoLocaleProvider } from '../i18n/locale-provider';

function Example() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>Delete account</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Delete account?</AlertDialogTitle>
        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        <AlertDialogClose>Cancel</AlertDialogClose>
        <AlertDialogClose>Delete</AlertDialogClose>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Simulates a real mouse click the way floating-ui-react's `useDismiss`
 * listens for it: a `pointerdown`/`mousedown` followed by a `click`. */
function clickOutside(target: HTMLElement) {
  fireEvent.pointerDown(target, { pointerType: 'mouse' });
  fireEvent.mouseDown(target);
  fireEvent.click(target);
}

describe('AlertDialog', () => {
  it('does not render the popup until the trigger is activated', () => {
    render(<Example />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('opens on trigger click', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Delete account?')).toBeInTheDocument();
  });

  // Base UI (like Radix) deliberately emits no `aria-modal`, conveying modality
  // by marking everything outside the popup aria-hidden/inert instead; Kairo
  // used to hardcode `aria-modal="true"` here.
  it('sets no aria-modal on the popup', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    expect(await screen.findByRole('alertdialog')).not.toHaveAttribute('aria-modal');
  });

  // Unlike Dialog's, this backdrop is unconditional: Base UI hardcodes
  // `modal: true` for alert dialogs, so there is no non-modal case.
  it('always renders the backdrop', async () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>Delete account?</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    await screen.findByRole('alertdialog');
    expect(document.querySelector('.kairo-alert-dialog-backdrop')).toBeInTheDocument();
  });

  it('forwards the container prop to the portal', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    try {
      render(
        <AlertDialog defaultOpen>
          <AlertDialogContent container={container}>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>,
      );
      const dialog = await screen.findByRole('alertdialog');
      expect(container).toContainElement(dialog);
    } finally {
      container.remove();
    }
  });

  it('uses role="alertdialog", not role="dialog"', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    await screen.findByRole('alertdialog');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('wires the accessible name and description to the title/description parts', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveAccessibleName('Delete account?');
    expect(dialog).toHaveAccessibleDescription('This action cannot be undone.');
  });

  it('moves focus into the dialog when opened', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    const dialog = await screen.findByRole('alertdialog');
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
  });

  it('does not close when the backdrop is clicked', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    await screen.findByRole('alertdialog');
    const backdrop = document.querySelector('.kairo-alert-dialog-backdrop') as HTMLElement;
    expect(backdrop).toBeInTheDocument();
    clickOutside(backdrop);
    // Give any (incorrect) async dismissal a chance to happen before asserting.
    await waitFor(() => expect(screen.getByRole('alertdialog')).toBeInTheDocument());
  });

  it('closes when the explicit close/cancel action is clicked', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    await screen.findByRole('alertdialog');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('applies the kairo-alert-dialog-backdrop/kairo-alert-dialog-popup classes', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveClass('kairo-alert-dialog-popup');
    expect(document.querySelector('.kairo-alert-dialog-backdrop')).toBeInTheDocument();
  });

  it('merges a custom className onto the popup', async () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent className="custom-popup">
          <AlertDialogTitle>Title</AlertDialogTitle>
          <AlertDialogClose>Close</AlertDialogClose>
        </AlertDialogContent>
      </AlertDialog>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveClass('kairo-alert-dialog-popup');
    expect(dialog).toHaveClass('custom-popup');
  });

  it('forwards a ref to the popup element', async () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent ref={ref}>
          <AlertDialogTitle>Title</AlertDialogTitle>
          <AlertDialogClose>Close</AlertDialogClose>
        </AlertDialogContent>
      </AlertDialog>,
    );
    await screen.findByRole('alertdialog');
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('kairo-alert-dialog-popup');
  });

  it('has no axe violations when open', async () => {
    const { baseElement } = render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    await screen.findByRole('alertdialog');
    expect(await axe(baseElement)).toHaveNoViolations();
  });

  it('sets lang on the popup when wrapped in a KairoLocaleProvider with a locale', async () => {
    render(
      <KairoLocaleProvider locale="th">
        <Example />
      </KairoLocaleProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveAttribute('lang', 'th');
  });

  it('renders no lang attribute on the popup without a KairoLocaleProvider', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).not.toHaveAttribute('lang');
  });
});
