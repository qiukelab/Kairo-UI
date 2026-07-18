import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectGroupLabel,
  SelectSeparator,
} from './select';
import type { SelectRootProps } from '@base-ui/react/select';
import { KairoLocaleProvider } from '../i18n/locale-provider';

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'orange', label: 'Orange' },
];

function Example(props: Partial<SelectRootProps<string>>) {
  return (
    <Select items={fruits} {...props}>
      <SelectTrigger aria-label="Fruit">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="cherry" disabled>
          Cherry
        </SelectItem>
        <SelectSeparator />
        <SelectGroup>
          <SelectGroupLabel>Citrus</SelectGroupLabel>
          <SelectItem value="orange">Orange</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

/** Selects an item the way a mouse click would (pointerdown then click) —
 * Base UI's item only commits a plain `click` when it was preceded by a
 * `pointerdown` on the same item (this guards against accidental selection
 * when the popup opens with an item already under the cursor). */
function clickItem(item: HTMLElement) {
  fireEvent.pointerDown(item, { pointerType: 'mouse' });
  fireEvent.click(item);
}

describe('Select', () => {
  it('renders the trigger with its accessible name', () => {
    render(<Example />);
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toBeInTheDocument();
  });

  it('does not render the listbox until the trigger is activated', () => {
    render(<Example />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows the placeholder when no value is selected', () => {
    render(<Example />);
    expect(screen.getByText('Select a fruit')).toBeInTheDocument();
  });

  it('opens the listbox on trigger click', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Fruit' }));
    const listbox = await screen.findByRole('listbox');
    expect(listbox).toBeInTheDocument();
    expect(listbox).toHaveClass('kairo-select-popup');
    expect(screen.getAllByRole('option')).toHaveLength(4);
  });

  it('selects an item on click, updates the trigger value, and fires onValueChange', async () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Fruit' }));
    const banana = await screen.findByRole('option', { name: 'Banana' });
    clickItem(banana);
    expect(onValueChange).toHaveBeenCalledWith('banana', expect.anything());
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toHaveTextContent('Banana');
  });

  it('marks the selected item with aria-selected/data-selected', async () => {
    render(<Example defaultValue="apple" />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Fruit' }));
    const apple = await screen.findByRole('option', { name: 'Apple' });
    expect(apple).toHaveAttribute('aria-selected', 'true');
    expect(apple).toHaveAttribute('data-selected');
  });

  it('supports a controlled value', async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Example value="apple" onValueChange={onValueChange} />);
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toHaveTextContent('Apple');
    fireEvent.click(screen.getByRole('combobox', { name: 'Fruit' }));
    const banana = await screen.findByRole('option', { name: 'Banana' });
    clickItem(banana);
    expect(onValueChange).toHaveBeenCalledWith('banana', expect.anything());
    // Controlled: the displayed value doesn't change until the prop does.
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toHaveTextContent('Apple');
    rerender(<Example value="banana" onValueChange={onValueChange} />);
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toHaveTextContent('Banana');
  });

  it('does not select a disabled item', async () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Fruit' }));
    const cherry = await screen.findByRole('option', { name: 'Cherry' });
    expect(cherry).toHaveAttribute('data-disabled');
    clickItem(cherry);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('renders the disabled trigger with data-disabled and skips interaction', () => {
    const onValueChange = vi.fn();
    render(<Example disabled onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    expect(trigger).toHaveAttribute('data-disabled');
    fireEvent.click(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('opens with ArrowDown and selects the highlighted item with Enter', async () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    trigger.focus();
    // ArrowDown both opens the popup and moves real DOM focus onto the first
    // item (Base UI's combobox pattern uses roving focus inside the listbox,
    // not `aria-activedescendant`).
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    await screen.findByRole('listbox');
    await waitFor(() => expect(document.activeElement).not.toBe(trigger));
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' });
    await waitFor(() => expect(document.activeElement).toHaveAccessibleName('Banana'));
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Enter' });
    expect(onValueChange).toHaveBeenCalledWith('banana', expect.anything());
  });

  it('renders group labels and a separator', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Fruit' }));
    await screen.findByRole('listbox');
    expect(screen.getByText('Citrus')).toBeInTheDocument();
    expect(document.querySelector('.kairo-select-separator')).toBeInTheDocument();
  });

  it('has no axe violations when the listbox is open', async () => {
    const { baseElement } = render(<Example />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Fruit' }));
    await screen.findByRole('listbox');
    // `region` (all page content must be contained by a landmark) is a
    // best-practice, page-layout rule, not a WCAG A/AA requirement — it's
    // irrelevant here since this test renders an isolated combobox/listbox
    // fragment, not a full page with header/main/nav landmarks.
    expect(await axe(baseElement, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });

  it('sets lang on the popup when wrapped in a KairoLocaleProvider with a locale', async () => {
    render(
      <KairoLocaleProvider locale="th">
        <Example />
      </KairoLocaleProvider>,
    );
    fireEvent.click(screen.getByRole('combobox', { name: 'Fruit' }));
    const listbox = await screen.findByRole('listbox');
    expect(listbox).toHaveAttribute('lang', 'th');
  });

  it('renders no lang attribute on the popup without a KairoLocaleProvider', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Fruit' }));
    const listbox = await screen.findByRole('listbox');
    expect(listbox).not.toHaveAttribute('lang');
  });
});
