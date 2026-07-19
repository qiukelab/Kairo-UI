'use client';

import { useState } from 'react';
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldIncrement,
  NumberFieldDecrement,
} from '@kairo-ui/react';

/**
 * Interactive demo for the NumberField docs page: an uncontrolled quantity
 * stepper clamped to [0, 10], a controlled stepper driven by local state,
 * and a disabled stepper.
 */
export function NumberFieldDemo() {
  const [quantity, setQuantity] = useState<number | null>(3);

  return (
    <div className="flex flex-wrap items-start gap-8">
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Quantity (uncontrolled)</span>
        <NumberField defaultValue={1} min={0} max={10} className="w-40">
          <NumberFieldGroup>
            <NumberFieldDecrement aria-label="Decrease quantity" />
            <NumberFieldInput aria-label="Quantity" />
            <NumberFieldIncrement aria-label="Increase quantity" />
          </NumberFieldGroup>
        </NumberField>
      </label>

      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Quantity (controlled)</span>
          <NumberField
            value={quantity}
            onValueChange={setQuantity}
            min={0}
            max={10}
            className="w-40"
          >
            <NumberFieldGroup>
              <NumberFieldDecrement aria-label="Decrease quantity" />
              <NumberFieldInput aria-label="Quantity" />
              <NumberFieldIncrement aria-label="Increase quantity" />
            </NumberFieldGroup>
          </NumberField>
        </label>
        <span className="text-sm" style={{ color: 'var(--kairo-muted-foreground)' }}>
          Value: {quantity ?? '—'}
        </span>
      </div>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Quantity (disabled)</span>
        <NumberField defaultValue={5} disabled className="w-40">
          <NumberFieldGroup>
            <NumberFieldDecrement aria-label="Decrease quantity" />
            <NumberFieldInput aria-label="Quantity" />
            <NumberFieldIncrement aria-label="Increase quantity" />
          </NumberFieldGroup>
        </NumberField>
      </label>
    </div>
  );
}
