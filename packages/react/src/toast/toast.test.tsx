import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { ToastProvider, useToast } from './toast';

function ToastButton() {
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={() =>
        // `timeout: 0` disables auto-dismiss so the toast doesn't
        // disappear mid-assertion (or mid-`waitFor`) in these tests.
        toast.add({
          title: 'Saved',
          description: 'Your changes have been saved.',
          timeout: 0,
        })
      }
    >
      Show toast
    </button>
  );
}

function Example() {
  return (
    <ToastProvider>
      <ToastButton />
    </ToastProvider>
  );
}

describe('Toast', () => {
  it('does not render a toast until one is added', () => {
    render(<Example />);
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('renders the toast title and description when added via useToast', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Show toast' }));
    expect(await screen.findByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('Your changes have been saved.')).toBeInTheDocument();
  });

  it('applies the kairo-toast-viewport/kairo-toast classes', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Show toast' }));
    await screen.findByText('Saved');
    expect(document.querySelector('.kairo-toast-viewport')).toBeInTheDocument();
    expect(document.querySelector('.kairo-toast')).toBeInTheDocument();
  });

  it('throws when useToast is called outside a ToastProvider', () => {
    function Unwrapped() {
      useToast();
      return null;
    }
    // Silence the expected React error boundary console noise for this case.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Unwrapped />)).toThrow();
    consoleError.mockRestore();
  });

  it('exposes the dismiss control to assistive tech (queryable by role/name, not aria-hidden)', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Show toast' }));
    await screen.findByText('Saved');
    // Kairo renders its own dismiss button instead of Base UI's `Toast.Close`
    // specifically so it's *always* exposed to assistive tech, not just once
    // the viewport is hovered/focused (see the `CloseButton` comment in
    // `toast.tsx`) — this asserts that promise directly.
    const closeButton = screen.getByRole('button', { name: /dismiss/i });
    expect(closeButton).not.toHaveAttribute('aria-hidden');
  });

  it('dismisses the toast when the close button is clicked', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Show toast' }));
    await screen.findByText('Saved');
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    await waitFor(() => expect(screen.queryByText('Saved')).not.toBeInTheDocument());
  });

  it('has no axe violations when a toast is visible', async () => {
    const { baseElement } = render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Show toast' }));
    await screen.findByText('Saved');
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});
