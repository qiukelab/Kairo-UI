import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { Field, FieldLabel, FieldControl, FieldDescription, FieldError } from './field';

describe('Field', () => {
  it('renders a control whose accessible name comes from its associated label', () => {
    render(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <FieldControl />
      </Field>,
    );
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('merges a custom className with the base kairo-field class', () => {
    const { container } = render(
      <Field className="extra-class">
        <FieldLabel>Email</FieldLabel>
        <FieldControl />
      </Field>,
    );
    const root = container.querySelector('.kairo-field');
    expect(root).toHaveClass('kairo-field');
    expect(root).toHaveClass('extra-class');
  });

  it('merges a custom className on FieldControl with its base class', () => {
    render(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <FieldControl className="extra-control-class" />
      </Field>,
    );
    const control = screen.getByLabelText('Email');
    expect(control).toHaveClass('kairo-field-control');
    expect(control).toHaveClass('extra-control-class');
  });

  it("wires the description into the control's aria-describedby", () => {
    render(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <FieldControl />
        <FieldDescription>We will only use this to send a receipt.</FieldDescription>
      </Field>,
    );
    const control = screen.getByLabelText('Email');
    const description = screen.getByText('We will only use this to send a receipt.');
    expect(description).toHaveAttribute('id');
    expect(control.getAttribute('aria-describedby')).toContain(description.id);
  });

  it('disables the control when the field is disabled', () => {
    render(
      <Field disabled>
        <FieldLabel>Email</FieldLabel>
        <FieldControl />
      </Field>,
    );
    expect(screen.getByLabelText('Email')).toBeDisabled();
  });

  it('marks the control invalid and shows the error message once validation fails', () => {
    render(
      <Field
        validationMode="onBlur"
        validate={(value) => (value ? null : 'This field is required')}
      >
        <FieldLabel>Email</FieldLabel>
        <FieldControl />
        <FieldError />
      </Field>,
    );
    const control = screen.getByLabelText('Email');
    expect(control).not.toHaveAttribute('aria-invalid');
    fireEvent.focus(control);
    fireEvent.blur(control);
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).toHaveAttribute('data-invalid');
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('forwards the ref to the root element', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Field ref={ref}>
        <FieldLabel>Email</FieldLabel>
        <FieldControl />
      </Field>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('forwards the ref to the control element', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <FieldControl ref={ref} />
      </Field>,
    );
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('has no axe violations on a labelled field with a description', async () => {
    const { container } = render(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <FieldControl />
        <FieldDescription>We will only use this to send a receipt.</FieldDescription>
      </Field>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
