import { createRef } from 'react';
import type { FormEvent } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { Form } from './form';
import type { FormActions } from './form';

describe('Form', () => {
  it('renders a native, non-validating form element', () => {
    render(
      <Form aria-label="Example form">
        <button type="submit">Submit</button>
      </Form>,
    );
    const form = screen.getByRole('form', { name: 'Example form' });
    expect(form.tagName).toBe('FORM');
    // `noValidate` is set unconditionally so the browser's own
    // validation-bubble UI never appears — see the doc comment on `Form`.
    expect(form).toHaveAttribute('novalidate');
  });

  it('merges a custom className with the base kairo-form class', () => {
    render(
      <Form aria-label="Example form" className="extra-class">
        <button type="submit">Submit</button>
      </Form>,
    );
    const form = screen.getByRole('form', { name: 'Example form' });
    expect(form).toHaveClass('kairo-form');
    expect(form).toHaveClass('extra-class');
  });

  it('forwards the ref to the underlying form element', () => {
    const ref = createRef<HTMLFormElement>();
    render(<Form ref={ref} aria-label="Example form" />);
    expect(ref.current).toBeInstanceOf(HTMLFormElement);
  });

  it('forwards arbitrary native props, like id, to the form element', () => {
    render(<Form aria-label="Example form" id="signup-form" />);
    expect(screen.getByRole('form', { name: 'Example form' })).toHaveAttribute('id', 'signup-form');
  });

  // jsdom has no real constraint-validation UI, so this suite covers the
  // contract Form guarantees in plain React — that a valid submit reaches
  // `onSubmit`/`onFormSubmit` — rather than browser validation popups; see
  // the report back to the orchestrator for what still needs a browser pass.
  it('calls onSubmit once every field has validated (none, here) successfully', () => {
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    render(
      <Form aria-label="Example form" onSubmit={onSubmit}>
        <button type="submit">Submit</button>
      </Form>,
    );
    fireEvent.submit(screen.getByRole('form', { name: 'Example form' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onFormSubmit with the collected field values and prevents the native submit', () => {
    const onFormSubmit = vi.fn();
    const onSubmit = vi.fn();
    render(
      <Form aria-label="Example form" onSubmit={onSubmit} onFormSubmit={onFormSubmit}>
        <button type="submit">Submit</button>
      </Form>,
    );
    fireEvent.submit(screen.getByRole('form', { name: 'Example form' }));
    // `onSubmit` still fires — `onFormSubmit` only additionally prevents the
    // *native* submission, it doesn't replace `onSubmit`.
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onFormSubmit).toHaveBeenCalledTimes(1);
    // No `Field` is registered in this tree, so there are no named values to
    // collect.
    expect(onFormSubmit.mock.calls[0]?.[0]).toEqual({});
  });

  it('accepts an errors object keyed by control name without throwing', () => {
    expect(() =>
      render(
        <Form aria-label="Example form" errors={{ email: 'Email already registered' }}>
          <button type="submit">Submit</button>
        </Form>,
      ),
    ).not.toThrow();
  });

  it('exposes an imperative validate() action via actionsRef', () => {
    const actionsRef = createRef<FormActions>();
    render(
      <Form aria-label="Example form" actionsRef={actionsRef}>
        <button type="submit">Submit</button>
      </Form>,
    );
    expect(actionsRef.current?.validate).toBeInstanceOf(Function);
    expect(() => actionsRef.current?.validate()).not.toThrow();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <Form aria-label="Example form">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" />
        <button type="submit">Submit</button>
      </Form>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
