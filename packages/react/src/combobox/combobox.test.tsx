import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
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
} from './combobox';
import type { ComboboxRootProps } from '@base-ui/react/combobox';
import { KairoLocaleProvider } from '../i18n/locale-provider';

interface Fruit {
  value: string;
  label: string;
}

const fruits: Fruit[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'orange', label: 'Orange' },
];

/** A filterable combobox: `items` + a function child on `ComboboxList`, the
 * pattern Base UI requires for filtering to actually happen. Cherry is
 * disabled so selection-skipping can be exercised. */
function Example(props: Partial<ComboboxRootProps<Fruit>>) {
  return (
    <Combobox items={fruits} {...props}>
      <ComboboxControl>
        <ComboboxInput aria-label="Fruit" placeholder="Search fruit" />
        <ComboboxClear />
        <ComboboxTrigger />
      </ComboboxControl>
      <ComboboxContent>
        <ComboboxEmpty />
        <ComboboxList>
          {(item: Fruit) => (
            <ComboboxItem key={item.value} value={item} disabled={item.value === 'cherry'}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

/** A static-children combobox (no `items` prop): renders a group and a
 * separator directly, the pattern Base UI never filters. */
function GroupedExample(props: Partial<ComboboxRootProps<string>>) {
  return (
    <Combobox {...props}>
      <ComboboxControl>
        <ComboboxInput aria-label="Fruit" />
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
  );
}

/** Opens the popup with ArrowDown, the way a keyboard user would — the input
 * keeps real DOM focus throughout (Base UI's combobox highlights items via
 * virtual `aria-activedescendant` navigation, unlike Select's roving focus),
 * so this is also how keyboard selection tests reach the first item. */
async function openWithArrowDown(input: HTMLElement) {
  input.focus();
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  return screen.findByRole('listbox');
}

describe('Combobox', () => {
  it('renders the input with its accessible name', () => {
    render(<Example />);
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toBeInTheDocument();
  });

  it('does not render the listbox until it is opened', () => {
    render(<Example />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows the placeholder when nothing is typed', () => {
    render(<Example />);
    expect(screen.getByPlaceholderText('Search fruit')).toBeInTheDocument();
  });

  it('opens the listbox on ArrowDown and highlights an item via aria-activedescendant', async () => {
    render(<Example />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    const listbox = await openWithArrowDown(input);
    expect(listbox).toBeInTheDocument();
    expect(listbox).toHaveClass('kairo-combobox-list');
    // Focus never leaves the input for a real combobox (unlike Select).
    expect(document.activeElement).toBe(input);
    await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant'));
  });

  it('filters the list as the user types', async () => {
    render(<Example />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await openWithArrowDown(input);
    fireEvent.change(input, { target: { value: 'ban' } });
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument();
  });

  it('shows the empty message when no item matches the query', async () => {
    render(<Example />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await openWithArrowDown(input);
    fireEvent.change(input, { target: { value: 'zzz' } });
    await waitFor(() => expect(screen.getByText('No results found')).toBeInTheDocument());
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('selects an item on click, fills the input, and fires onValueChange', async () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await openWithArrowDown(input);
    const banana = await screen.findByRole('option', { name: 'Banana' });
    fireEvent.click(banana);
    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'banana' }),
      expect.anything(),
    );
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(input).toHaveValue('Banana');
  });

  it('marks the selected item with aria-selected/data-selected', async () => {
    render(<Example defaultValue={fruits[0]} />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await openWithArrowDown(input);
    const apple = await screen.findByRole('option', { name: 'Apple' });
    expect(apple).toHaveAttribute('aria-selected', 'true');
    expect(apple).toHaveAttribute('data-selected');
  });

  it('does not select a disabled item on click', async () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await openWithArrowDown(input);
    const cherry = await screen.findByRole('option', { name: 'Cherry' });
    expect(cherry).toHaveAttribute('data-disabled');
    fireEvent.click(cherry);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('supports a controlled value', async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Example value={fruits[0]} onValueChange={onValueChange} />,
    );
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    expect(input).toHaveValue('Apple');
    await openWithArrowDown(input);
    const banana = await screen.findByRole('option', { name: 'Banana' });
    fireEvent.click(banana);
    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'banana' }),
      expect.anything(),
    );
    // Controlled: the displayed value doesn't change until the prop does.
    expect(input).toHaveValue('Apple');
    rerender(<Example value={fruits[1]} onValueChange={onValueChange} />);
    expect(input).toHaveValue('Banana');
  });

  it('selects the highlighted item with Enter after ArrowDown navigation', async () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await openWithArrowDown(input);
    // The first ArrowDown opened the popup and highlighted Apple; a second
    // one moves the highlight to Banana without moving real DOM focus.
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await waitFor(async () =>
      expect(await screen.findByRole('option', { name: 'Banana' })).toHaveAttribute(
        'data-highlighted',
      ),
    );
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'banana' }),
      expect.anything(),
    );
  });

  it('shows the clear button once there is a value and resets on click', async () => {
    const onValueChange = vi.fn();
    render(<Example defaultValue={fruits[0]} onValueChange={onValueChange} />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    expect(input).toHaveValue('Apple');
    const clear = screen.getByRole('button', { name: 'Clear selection' });
    fireEvent.click(clear);
    expect(onValueChange).toHaveBeenCalledWith(null, expect.anything());
    await waitFor(() => expect(input).toHaveValue(''));
  });

  it('renders the disabled control and skips interaction', () => {
    const onValueChange = vi.fn();
    render(<Example disabled onValueChange={onValueChange} />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    expect(input).toBeDisabled();
    expect(input.closest('.kairo-combobox-control')).toHaveAttribute('data-disabled');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('renders group labels and a separator for static children', async () => {
    render(<GroupedExample />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await openWithArrowDown(input);
    expect(screen.getByText('Citrus')).toBeInTheDocument();
    expect(document.querySelector('.kairo-combobox-separator')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('forwards refs to the input and the popup', async () => {
    const inputRef = createRef<HTMLInputElement>();
    const popupRef = createRef<HTMLDivElement>();
    render(
      <Combobox items={fruits}>
        <ComboboxControl>
          <ComboboxInput ref={inputRef} aria-label="Fruit" />
        </ComboboxControl>
        <ComboboxContent ref={popupRef}>
          <ComboboxList>
            {(item: Fruit) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    );
    expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
    await openWithArrowDown(screen.getByRole('combobox', { name: 'Fruit' }));
    expect(popupRef.current).toBeInstanceOf(HTMLDivElement);
    expect(popupRef.current).toHaveClass('kairo-combobox-popup');
  });

  it('sets lang on the popup when wrapped in a KairoLocaleProvider with a locale', async () => {
    render(
      <KairoLocaleProvider locale="th">
        <Example />
      </KairoLocaleProvider>,
    );
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await openWithArrowDown(input);
    expect(document.querySelector('.kairo-combobox-popup')).toHaveAttribute('lang', 'th');
  });

  it('renders no lang attribute on the popup without a KairoLocaleProvider', async () => {
    render(<Example />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await openWithArrowDown(input);
    expect(document.querySelector('.kairo-combobox-popup')).not.toHaveAttribute('lang');
  });

  it('has no axe violations when the listbox is open', async () => {
    const { baseElement } = render(<Example />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await openWithArrowDown(input);
    // `region` (all page content must be contained by a landmark) is a
    // best-practice, page-layout rule, not a WCAG A/AA requirement — it's
    // irrelevant here since this test renders an isolated combobox/listbox
    // fragment, not a full page with header/main/nav landmarks.
    expect(await axe(baseElement, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });

  it('portals the popup into a custom container element', async () => {
    const portalTarget = document.createElement('div');
    document.body.appendChild(portalTarget);
    render(
      <Combobox items={fruits}>
        <ComboboxControl>
          <ComboboxInput aria-label="Fruit" />
        </ComboboxControl>
        <ComboboxContent container={portalTarget}>
          <ComboboxList>
            {(item: Fruit) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    );
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    const listbox = await openWithArrowDown(input);
    expect(portalTarget.contains(listbox)).toBe(true);
    document.body.removeChild(portalTarget);
  });
});
