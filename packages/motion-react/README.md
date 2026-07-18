# @kairo-ui/motion-react

Optional, [Motion](https://motion.dev)-powered animation addon for Kairo.
`@kairo-ui/react` and `@kairo-ui/theme` stay motion-free — `motion` is only
ever a dependency of this package, opt in by installing it.

## Install

```bash
pnpm add @kairo-ui/motion-react motion
```

### Peer dependencies

- `motion` `^12.0.0`
- `react` `^18.0.0 || ^19.0.0`
- `react-dom` `^18.0.0 || ^19.0.0`

## What's inside

- `transitions` — Motion `Transition` presets (`fast`/`normal`/`slow` +
  `emphasized`) mirroring `@kairo-ui/theme`'s CSS motion tokens, so
  JS-driven animation matches Kairo's CSS-first components.
- `variants` — reusable Motion `Variants` (`fade`, `slideUp`, `slideDown`,
  `scale`), token-consistent by default.
- `<AnimatedNumber value />` — spring-animates its text between numeric
  values.
- `<Reveal>` — animates its children in the first time they scroll into
  view.

This package intentionally doesn't re-export Motion's own API — import
`motion`/`AnimatePresence`/etc. directly from `motion/react` alongside it.

## License

MIT
