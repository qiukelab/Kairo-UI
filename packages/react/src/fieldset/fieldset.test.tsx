import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { Fieldset, FieldsetLegend } from './fieldset';

function Example(props: Partial<React.ComponentProps<typeof Fieldset>>) {
  return (
    <Fieldset {...props}>
      <FieldsetLegend>Shipping address</FieldsetLegend>
      <label>
        Street
        <input name="street" />
      </label>
      <label>
        City
        <input name="city" />
      </label>
    </Fieldset>
  );
}

describe('Fieldset', () => {
  it('renders a native fieldset with its legend', () => {
    render(<Example />);
    const group = screen.getByRole('group', { name: 'Shipping address' });
    expect(group.tagName).toBe('FIELDSET');
    expect(screen.getByText('Shipping address')).toBeInTheDocument();
  });

  it('associates the legend to the fieldset via aria-labelledby', () => {
    render(<Example />);
    const group = screen.getByRole('group', { name: 'Shipping address' });
    const legend = screen.getByText('Shipping address');
    expect(group).toHaveAttribute('aria-labelledby', legend.id);
  });

  it('merges a custom className with the base kairo-fieldset class', () => {
    render(<Example className="extra-class" />);
    const group = screen.getByRole('group', { name: 'Shipping address' });
    expect(group).toHaveClass('kairo-fieldset');
    expect(group).toHaveClass('extra-class');
  });

  it('merges a custom className on the legend with its base class', () => {
    render(
      <Fieldset>
        <FieldsetLegend className="extra-legend-class">Legend</FieldsetLegend>
      </Fieldset>,
    );
    const legend = screen.getByText('Legend');
    expect(legend).toHaveClass('kairo-fieldset-legend');
    expect(legend).toHaveClass('extra-legend-class');
  });

  it('natively disables every nested control when disabled', () => {
    render(<Example disabled />);
    expect(screen.getByRole('textbox', { name: 'Street' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'City' })).toBeDisabled();
  });

  it('reflects disabled as data-disabled on both the fieldset and its legend', () => {
    render(<Example disabled />);
    const group = screen.getByRole('group', { name: 'Shipping address' });
    expect(group).toHaveAttribute('data-disabled');
    expect(screen.getByText('Shipping address')).toHaveAttribute('data-disabled');
  });

  it('has no data-disabled when not disabled', () => {
    render(<Example />);
    const group = screen.getByRole('group', { name: 'Shipping address' });
    expect(group).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Shipping address')).not.toHaveAttribute('data-disabled');
  });

  it('forwards the ref to the underlying fieldset element', () => {
    const ref = createRef<HTMLFieldSetElement>();
    render(<Fieldset ref={ref}>Content</Fieldset>);
    expect(ref.current).toBeInstanceOf(HTMLFieldSetElement);
  });

  it('has no axe violations', async () => {
    const { container } = render(<Example />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
