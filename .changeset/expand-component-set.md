---
"@kairo-ui/theme": minor
"@kairo-ui/react": minor
---

Add 14 components, taking the set from 14 to 28

Display and disclosure: Separator, Progress, Meter, Accordion, Collapsible.

Form controls: RadioGroup, Slider, NumberField, ToggleGroup, Combobox.

Portalled popups: Menu, ContextMenu, AlertDialog, Drawer.

Every component follows the established pattern: a thin wrapper over the
matching Base UI primitive, with all styling shipped as vanilla CSS from
`@kairo-ui/theme`. Each is available both from the package root and as its
own subpath export (e.g. `@kairo-ui/react/radio-group`). Separator, Progress
and Meter carry no `'use client'` directive and render in React Server
Components.
