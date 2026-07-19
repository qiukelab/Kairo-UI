'use client';

import { useState } from 'react';
import {
  Combobox,
  ComboboxControl,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxClear,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxSeparator,
} from '@kairo-ui/react';

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'grape', label: 'Grape' },
  { value: 'orange', label: 'Orange' },
];

type Fruit = (typeof fruits)[number];

/**
 * Interactive demo for the Combobox docs page: an uncontrolled filterable
 * combobox with a default value, a controlled one driven by local state, and
 * a static (unfiltered) combobox showing a group label and a separator.
 */
export function ComboboxDemo() {
  const [fruit, setFruit] = useState<Fruit | null>(fruits[1]);

  return (
    <div className="flex flex-wrap items-start gap-8">
      <Combobox items={fruits} defaultValue={fruits[0]}>
        <ComboboxControl className="w-56">
          <ComboboxInput aria-label="Fruit" placeholder="Search fruit…" />
          <ComboboxClear />
          <ComboboxTrigger />
        </ComboboxControl>
        <ComboboxContent>
          <ComboboxEmpty />
          <ComboboxList>
            {(item: Fruit) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      <div className="flex flex-col gap-2">
        <Combobox items={fruits} value={fruit} onValueChange={setFruit}>
          <ComboboxControl className="w-56">
            <ComboboxInput aria-label="Fruit (controlled)" placeholder="Search fruit…" />
            <ComboboxClear />
            <ComboboxTrigger />
          </ComboboxControl>
          <ComboboxContent>
            <ComboboxEmpty />
            <ComboboxList>
              {(item: Fruit) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <span className="text-sm" style={{ color: 'var(--kairo-muted-foreground)' }}>
          Selected: {fruit?.label ?? 'none'}
        </span>
      </div>

      <Combobox>
        <ComboboxControl className="w-56">
          <ComboboxInput aria-label="Fruit (grouped)" placeholder="Pick a fruit" />
        </ComboboxControl>
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="apple">Apple</ComboboxItem>
            <ComboboxItem value="banana">Banana</ComboboxItem>
            <ComboboxSeparator />
            <ComboboxGroup>
              <ComboboxGroupLabel>Citrus</ComboboxGroupLabel>
              <ComboboxItem value="orange">Orange</ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
