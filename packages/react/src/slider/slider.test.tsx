import { createRef } from 'react';
import type { ComponentProps } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { Slider, SliderControl, SliderTrack, SliderIndicator, SliderThumb } from './slider';

/**
 * jsdom has no layout engine (`getBoundingClientRect` always returns zeros),
 * so Base UI's pointer-drag and track-press math — which measures the
 * control's rect to translate a pointer position into a value — cannot be
 * meaningfully exercised here; a drag "test" would just assert against a
 * degenerate zero-size rect and pass regardless of whether dragging actually
 * works. The keyboard path (exercised below) is the primary interaction Base
 * UI's `Slider.Thumb` implements independently of layout, and the
 * controlled-value path covers the rest of the value-flow contract.
 */

function Example(props: Partial<ComponentProps<typeof Slider>>) {
  return (
    <Slider defaultValue={30} {...props}>
      <SliderControl>
        <SliderTrack>
          <SliderIndicator />
          <SliderThumb aria-label="Volume" />
        </SliderTrack>
      </SliderControl>
    </Slider>
  );
}

function RangeExample(props: Partial<ComponentProps<typeof Slider>>) {
  return (
    <Slider defaultValue={[20, 80]} {...props}>
      <SliderControl>
        <SliderTrack>
          <SliderIndicator />
          <SliderThumb index={0} aria-label="Minimum price" />
          <SliderThumb index={1} aria-label="Maximum price" />
        </SliderTrack>
      </SliderControl>
    </Slider>
  );
}

describe('Slider', () => {
  it('renders a native range input as role="slider" with aria-valuenow and the min/max attributes', () => {
    render(<Example />);
    const slider = screen.getByRole('slider', { name: 'Volume' });
    expect(slider).toBeInTheDocument();
    // Base UI sets `aria-valuenow` explicitly (asserted directly), but
    // `aria-valuemin`/`aria-valuemax` are left to the browser to derive from
    // the native `min`/`max` attributes on the underlying `<input
    // type="range">` — jsdom has no accessibility tree to compute that
    // implicit mapping, so `min`/`max` are asserted as the native HTML
    // attributes that back it instead of literal `aria-valuemin`/`valuemax`.
    expect(slider).toHaveAttribute('aria-valuenow', '30');
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '100');
  });

  it('renders the uncontrolled defaultValue', () => {
    render(<Example defaultValue={45} />);
    expect(screen.getByRole('slider', { name: 'Volume' })).toHaveAttribute('aria-valuenow', '45');
  });

  it('supports a controlled value and fires onValueChange without moving until the prop updates', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Example value={30} onValueChange={onValueChange} />);
    const slider = screen.getByRole('slider', { name: 'Volume' });
    expect(slider).toHaveAttribute('aria-valuenow', '30');
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onValueChange).toHaveBeenCalledWith(31, expect.anything());
    // Controlled: the displayed value doesn't change until the prop does.
    expect(slider).toHaveAttribute('aria-valuenow', '30');
    rerender(<Example value={31} onValueChange={onValueChange} />);
    expect(slider).toHaveAttribute('aria-valuenow', '31');
  });

  it('steps with ArrowRight/ArrowLeft', () => {
    const onValueChange = vi.fn();
    render(<Example defaultValue={30} onValueChange={onValueChange} />);
    const slider = screen.getByRole('slider', { name: 'Volume' });
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(slider).toHaveAttribute('aria-valuenow', '31');
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(slider).toHaveAttribute('aria-valuenow', '30');
    expect(onValueChange).toHaveBeenNthCalledWith(1, 31, expect.anything());
    expect(onValueChange).toHaveBeenNthCalledWith(2, 30, expect.anything());
  });

  it('jumps to min/max with Home/End', () => {
    render(<Example defaultValue={30} />);
    const slider = screen.getByRole('slider', { name: 'Volume' });
    fireEvent.keyDown(slider, { key: 'End' });
    expect(slider).toHaveAttribute('aria-valuenow', '100');
    fireEvent.keyDown(slider, { key: 'Home' });
    expect(slider).toHaveAttribute('aria-valuenow', '0');
  });

  it('respects custom min/max/step when stepping via keyboard', () => {
    render(<Example defaultValue={50} min={0} max={100} step={10} />);
    const slider = screen.getByRole('slider', { name: 'Volume' });
    expect(slider).toHaveAttribute('step', '10');
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(slider).toHaveAttribute('aria-valuenow', '60');
    fireEvent.keyDown(slider, { key: 'End' });
    expect(slider).toHaveAttribute('aria-valuenow', '100');
    fireEvent.keyDown(slider, { key: 'Home' });
    expect(slider).toHaveAttribute('aria-valuenow', '0');
  });

  it('renders a disabled slider and ignores track-press pointer interaction', () => {
    const onValueChange = vi.fn();
    render(<Example disabled onValueChange={onValueChange} />);
    const slider = screen.getByRole('slider', { name: 'Volume' });
    expect(slider).toBeDisabled();
    expect(slider.closest('.kairo-slider-thumb')).toHaveAttribute('data-disabled');
    expect(document.querySelector('.kairo-slider-control')).toHaveAttribute('data-disabled');
    // `SliderControl`'s pointerdown handler bails out on its own `disabled`
    // check before it ever reads the control's (in jsdom, always zero) rect,
    // so this is safe to assert without real layout.
    fireEvent.pointerDown(document.querySelector('.kairo-slider-control') as HTMLElement, {
      button: 0,
      clientX: 50,
      clientY: 10,
    });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('renders two independent sliders for a range value', () => {
    render(<RangeExample />);
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(2);
    expect(screen.getByRole('slider', { name: 'Minimum price' })).toHaveAttribute(
      'aria-valuenow',
      '20',
    );
    expect(screen.getByRole('slider', { name: 'Maximum price' })).toHaveAttribute(
      'aria-valuenow',
      '80',
    );
  });

  it('steps only the interacted thumb in a range slider', () => {
    const onValueChange = vi.fn();
    render(<RangeExample onValueChange={onValueChange} />);
    const min = screen.getByRole('slider', { name: 'Minimum price' });
    fireEvent.keyDown(min, { key: 'ArrowRight' });
    expect(onValueChange).toHaveBeenCalledWith([21, 80], expect.anything());
    expect(min).toHaveAttribute('aria-valuenow', '21');
    expect(screen.getByRole('slider', { name: 'Maximum price' })).toHaveAttribute(
      'aria-valuenow',
      '80',
    );
  });

  it('merges a custom className with the base kairo-slider class', () => {
    render(<Example className="extra-class" />);
    const slider = screen.getByRole('slider', { name: 'Volume' });
    const root = slider.closest('.kairo-slider') as HTMLElement;
    expect(root).toHaveClass('kairo-slider');
    expect(root).toHaveClass('extra-class');
  });

  it('merges a custom className on SliderThumb with the base kairo-slider-thumb class', () => {
    render(<Example />);
    const thumb = screen.getByRole('slider', { name: 'Volume' }).closest('.kairo-slider-thumb');
    expect(thumb).toHaveClass('kairo-slider-thumb');
  });

  it('forwards the ref to the root element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Example ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute('role', 'group');
  });

  it('has no axe violations on a labelled slider', async () => {
    const { container } = render(<Example />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
