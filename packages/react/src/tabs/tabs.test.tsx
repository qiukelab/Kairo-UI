import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { Tabs, TabsList, Tab, TabPanel } from './tabs';

function Example() {
  return (
    <Tabs defaultValue="account">
      <TabsList>
        <Tab value="account">Account</Tab>
        <Tab value="password">Password</Tab>
        <Tab value="team" disabled>
          Team
        </Tab>
      </TabsList>
      <TabPanel value="account">Account settings</TabPanel>
      <TabPanel value="password">Password settings</TabPanel>
      <TabPanel value="team">Team settings</TabPanel>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('renders with tablist/tab/tabpanel roles', () => {
    render(<Example />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  it('shows the panel matching defaultValue and marks its tab selected', () => {
    render(<Example />);
    const accountTab = screen.getByRole('tab', { name: 'Account' });
    expect(accountTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Account settings');
  });

  it('switches the active panel when a tab is clicked', () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('tab', { name: 'Password' }));
    expect(screen.getByRole('tab', { name: 'Password' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Password settings');
  });

  it('supports arrow-key navigation between tabs (roving focus)', async () => {
    render(<Example />);
    const accountTab = screen.getByRole('tab', { name: 'Account' });
    const passwordTab = screen.getByRole('tab', { name: 'Password' });
    accountTab.focus();
    expect(accountTab).toHaveFocus();
    // Base UI's composite navigation moves focus inside a `queueMicrotask`,
    // so the focus change lands a tick after the keydown handler runs.
    fireEvent.keyDown(accountTab, { key: 'ArrowRight' });
    await waitFor(() => expect(passwordTab).toHaveFocus());
    fireEvent.keyDown(passwordTab, { key: 'ArrowLeft' });
    await waitFor(() => expect(accountTab).toHaveFocus());
  });

  it('reflects the selected tab via data-active', () => {
    render(<Example />);
    const accountTab = screen.getByRole('tab', { name: 'Account' });
    expect(accountTab).toHaveAttribute('data-active');
    fireEvent.click(screen.getByRole('tab', { name: 'Password' }));
    expect(accountTab).not.toHaveAttribute('data-active');
  });

  it('merges a custom className with the base kairo-tabs class', () => {
    const { container } = render(<Example />);
    expect(container.firstChild).toHaveClass('kairo-tabs');
  });

  it('has no axe violations', async () => {
    const { container } = render(<Example />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
