'use client';

import { forwardRef } from 'react';
import { Slider as BaseSlider } from '@base-ui/react/slider';
import type {
  SliderRootProps,
  SliderLabelProps,
  SliderValueProps,
  SliderControlProps,
  SliderTrackProps,
  SliderIndicatorProps,
  SliderThumbProps,
} from '@base-ui/react/slider';

/**
 * Kairo's Slider. Thin wrappers over Base UI's `Slider.Root`/`Label`/`Value`/
 * `Control`/`Track`/`Indicator`/`Thumb` anatomy — all interaction and
 * accessibility logic (the `role="slider"` `<input type="range">` nested
 * inside each `Thumb`, Arrow/Home/End/Page-Up/Page-Down keyboard stepping,
 * pointer drag & track-press, controlled/uncontrolled value, multi-thumb
 * range collision handling) comes from `@base-ui/react`. Kairo only supplies
 * the `kairo-slider-*` classes so `@kairo-ui/theme` can style everything
 * purely off Base UI's data attributes.
 *
 * Anatomy: `Slider` > (optional `SliderLabel`, `SliderValue`) and
 * `SliderControl` > `SliderTrack` > `SliderIndicator` + one `SliderThumb` per
 * value (two for a range slider). `SliderTrack` is the positioning context
 * `SliderThumb` measures its `insetInlineStart`/`top` offsets against — Base
 * UI sets this inline (`position: relative`) — so a `SliderThumb` must be
 * rendered inside a `SliderTrack`, not directly inside `SliderControl`.
 *
 * Unlike `Select.Root`, `Slider.Root` renders a real `<div role="group">`
 * rather than nothing, so it gets a normal `forwardRef` wrapper for the
 * default `kairo-slider` class instead of being re-exported as-is. That
 * wrapper can't preserve `Slider.Root`'s own generic `<Value extends number |
 * readonly number[]>` signature (`forwardRef` has no way to express a
 * generic component), so `value`/`defaultValue`/`onValueChange` are typed
 * against the non-generic default (`number | readonly number[]`) here —
 * consumers who want the narrowed `number`-only or `readonly number[]`-only
 * shape can still import `SliderRootProps<Value>` from `@base-ui/react/slider`
 * for their own annotations.
 */
export const Slider = forwardRef<HTMLDivElement, SliderRootProps>(function Slider(
  { className, ...props },
  ref,
) {
  return (
    <BaseSlider.Root
      ref={ref}
      className={className ? `kairo-slider ${className}` : 'kairo-slider'}
      {...props}
    />
  );
});

Slider.displayName = 'Slider';

export interface SliderLabelComponentProps extends SliderLabelProps {}

/**
 * An accessible label, automatically associated with every `SliderThumb`'s
 * `<input>` inside the same `Slider` (via `aria-labelledby`) unless a thumb
 * sets its own `aria-label`/`aria-labelledby`.
 */
export const SliderLabel = forwardRef<HTMLDivElement, SliderLabelComponentProps>(
  function SliderLabel({ className, ...props }, ref) {
    return (
      <BaseSlider.Label
        ref={ref}
        className={className ? `kairo-slider-label ${className}` : 'kairo-slider-label'}
        {...props}
      />
    );
  },
);

SliderLabel.displayName = 'SliderLabel';

export interface SliderValueComponentProps extends SliderValueProps {}

/**
 * Displays the current value(s) as text. Renders Base UI's `<output>`,
 * `htmlFor`-associated with the underlying thumb `<input>`(s).
 */
export const SliderValue = forwardRef<HTMLOutputElement, SliderValueComponentProps>(
  function SliderValue({ className, ...props }, ref) {
    return (
      <BaseSlider.Value
        ref={ref}
        className={className ? `kairo-slider-value ${className}` : 'kairo-slider-value'}
        {...props}
      />
    );
  },
);

SliderValue.displayName = 'SliderValue';

export interface SliderControlComponentProps extends SliderControlProps {}

/**
 * The clickable/draggable surface: owns pointer capture, track-press
 * (jump-to-click), and drag handling for every `SliderThumb` inside it.
 */
export const SliderControl = forwardRef<HTMLDivElement, SliderControlComponentProps>(
  function SliderControl({ className, ...props }, ref) {
    return (
      <BaseSlider.Control
        ref={ref}
        className={className ? `kairo-slider-control ${className}` : 'kairo-slider-control'}
        {...props}
      />
    );
  },
);

SliderControl.displayName = 'SliderControl';

export interface SliderTrackComponentProps extends SliderTrackProps {}

/**
 * The full-range rail. Renders with an inline `position: relative` from Base
 * UI — the positioning context `SliderThumb` and `SliderIndicator` measure
 * their offsets against.
 */
export const SliderTrack = forwardRef<HTMLDivElement, SliderTrackComponentProps>(
  function SliderTrack({ className, ...props }, ref) {
    return (
      <BaseSlider.Track
        ref={ref}
        className={className ? `kairo-slider-track ${className}` : 'kairo-slider-track'}
        {...props}
      />
    );
  },
);

SliderTrack.displayName = 'SliderTrack';

export interface SliderIndicatorComponentProps extends SliderIndicatorProps {}

/** The filled portion of the track, from `min` (or the lower thumb) to the value. */
export const SliderIndicator = forwardRef<HTMLDivElement, SliderIndicatorComponentProps>(
  function SliderIndicator({ className, ...props }, ref) {
    return (
      <BaseSlider.Indicator
        ref={ref}
        className={className ? `kairo-slider-indicator ${className}` : 'kairo-slider-indicator'}
        {...props}
      />
    );
  },
);

SliderIndicator.displayName = 'SliderIndicator';

export interface SliderThumbComponentProps extends SliderThumbProps {}

/**
 * The draggable handle. Renders a `<div>` (the visible, round handle Kairo
 * styles) wrapping Base UI's visually-hidden `<input type="range">`, which is
 * the actual `role="slider"` element carrying `aria-valuenow`/keyboard
 * support/focus. Pass `index` for a range slider's second (and later)
 * thumbs during server-rendering; in client-only rendering it's inferred
 * from mount order.
 */
export const SliderThumb = forwardRef<HTMLDivElement, SliderThumbComponentProps>(
  function SliderThumb({ className, ...props }, ref) {
    return (
      <BaseSlider.Thumb
        ref={ref}
        className={className ? `kairo-slider-thumb ${className}` : 'kairo-slider-thumb'}
        {...props}
      />
    );
  },
);

SliderThumb.displayName = 'SliderThumb';
