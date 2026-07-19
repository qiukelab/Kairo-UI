import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionPanel,
} from './accordion';
import type { AccordionProps } from './accordion';

function Example(props: Partial<AccordionProps<string>>) {
  return (
    <Accordion {...props}>
      <AccordionItem value="a">
        <AccordionHeader>
          <AccordionTrigger>Section A</AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>Content A</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionHeader>
          <AccordionTrigger>Section B</AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>Content B</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="c" disabled>
        <AccordionHeader>
          <AccordionTrigger>Section C</AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>Content C</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

/**
 * Activates a trigger the way a keyboard user pressing Enter/Space on a
 * focused native `<button>` would. Unlike a real browser, jsdom does not
 * translate a keydown/keyup for these keys into a `click` event on its own
 * (a known jsdom gap — https://github.com/jsdom/jsdom/issues/1226), so the
 * resulting `click` is fired explicitly to stand in for that native browser
 * behavior; `AccordionTrigger` itself does nothing beyond rendering a plain
 * `<button>`, so exercising the key events plus the click they produce is
 * what this component contributes to keyboard activation.
 */
function activateWithKeyboard(trigger: HTMLElement, key: 'Enter' | ' ') {
  trigger.focus();
  fireEvent.keyDown(trigger, { key });
  fireEvent.keyUp(trigger, { key });
  fireEvent.click(trigger);
}

describe('Accordion', () => {
  it('renders a heading and a trigger button for each item', () => {
    render(<Example />);
    expect(screen.getByRole('heading', { level: 3, name: 'Section A' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Section B' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Section A' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Section B' })).toBeInTheDocument();
  });

  it('keeps a panel out of the DOM until its item is expanded', () => {
    render(<Example />);
    expect(screen.queryByText('Content A')).not.toBeInTheDocument();
    expect(screen.queryByText('Content B')).not.toBeInTheDocument();
  });

  it('expands a panel on trigger click', () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Section A' }));
    expect(screen.getByText('Content A')).toBeInTheDocument();
    expect(screen.getByText('Content A').closest('[role="region"]')).toBeInTheDocument();
  });

  it('collapses the previously open item in single-open mode', () => {
    render(<Example defaultValue={['a']} />);
    expect(screen.getByText('Content A')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Section B' }));
    expect(screen.getByText('Content B')).toBeInTheDocument();
    expect(screen.queryByText('Content A')).not.toBeInTheDocument();
  });

  it('allows more than one open item when multiple is set', () => {
    render(<Example multiple defaultValue={['a']} />);
    fireEvent.click(screen.getByRole('button', { name: 'Section B' }));
    expect(screen.getByText('Content A')).toBeInTheDocument();
    expect(screen.getByText('Content B')).toBeInTheDocument();
  });

  it('expands on Enter and collapses again on Space', () => {
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Section A' });
    activateWithKeyboard(trigger, 'Enter');
    expect(screen.getByText('Content A')).toBeInTheDocument();
    activateWithKeyboard(trigger, ' ');
    expect(screen.queryByText('Content A')).not.toBeInTheDocument();
  });

  it('wires aria-expanded and aria-controls between the trigger and its panel', () => {
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Section A' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    // Base UI only sets `aria-controls` while the panel is open (the panel
    // isn't even mounted otherwise, so there'd be nothing for it to point at).
    expect(trigger).not.toHaveAttribute('aria-controls');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const panelId = trigger.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    expect(screen.getByText('Content A').closest('[role="region"]')).toHaveAttribute('id', panelId);
  });

  it('does not expand a disabled item', () => {
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Section C' });
    expect(trigger).toHaveAttribute('data-disabled');
    fireEvent.click(trigger);
    expect(screen.queryByText('Content C')).not.toBeInTheDocument();
  });

  it('merges a custom className with the base kairo-accordion class', () => {
    const { container } = render(<Example className="custom" />);
    expect(container.firstChild).toHaveClass('kairo-accordion');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards a ref to the root element', () => {
    const ref = vi.fn();
    render(<Accordion ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('has no axe violations with a panel open', async () => {
    const { container } = render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Section A' }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
