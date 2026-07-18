'use client';

import { useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectGroupLabel,
  SelectSeparator,
} from '@kairo-ui/react';

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'grape', label: 'Grape' },
  { value: 'orange', label: 'Orange' },
];

/**
 * Interactive demo for the Select docs page: an uncontrolled select with a
 * grouped option and a separator, plus a controlled select driven by local
 * state.
 */
export function SelectDemo() {
  const [value, setValue] = useState<string | null>('banana');

  return (
    <div className="flex flex-wrap items-start gap-8">
      <Select items={fruits} defaultValue="apple">
        <SelectTrigger aria-label="Fruit" className="w-40">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectSeparator />
          <SelectGroup>
            <SelectGroupLabel>Citrus</SelectGroupLabel>
            <SelectItem value="orange">Orange</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <div className="flex flex-col gap-2">
        <Select items={fruits} value={value} onValueChange={setValue}>
          <SelectTrigger aria-label="Fruit (controlled)" className="w-40">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            {fruits.map((fruit) => (
              <SelectItem key={fruit.value} value={fruit.value}>
                {fruit.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm" style={{ color: 'var(--kairo-muted-foreground)' }}>
          Selected: {value ?? 'none'}
        </span>
      </div>
    </div>
  );
}
