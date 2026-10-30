# radix-tour

## 1.0.0

### Major Changes

- c24b386: First stable release. The public API is now stable and follows semantic versioning from here: the `Tour.*` parts and their long names (`TourContent` and so on), `useTour()`, `createTourScope`, the `TourStep` fields, the `data-*` attributes, and the `--tour-duration` and `--tour-ease` CSS variables. There are no breaking changes from 0.3.0.
  
  Before 1.0.0 the package was checked in Vite, esbuild, webpack and Turbopack, in Chromium and WebKit, with React 18 and 19, and imported from a Server Component: the built-in stylesheet is added to `<head>` in every case, even when you import only one part. Known limits, documented in the README: a target that never appears keeps the card hidden until it does, a hidden target counts as present, and the live-region announcement and `Tour.Progress` text are English only.

## 0.3.0

### Minor Changes

- 84598ff: Improve keyboard and screen reader accessibility: focus moves into the card on open (opt out with `onOpenAutoFocus`), F6 returns to it, the arrow keys change step from anywhere on the page (except in inputs and widgets that use arrows), Home/End jump to the first and last step while focus is in the card, `Tour.Content` renders a live region announcing "Step N of M: title" and gets `aria-labelledby`/`aria-describedby` from `Tour.Title` and `Tour.Description`, the active target gets `aria-describedby` pointing at the card, and `Tour.Previous` on the first step uses `aria-disabled` and `data-disabled` instead of staying a live no-op.
- 04c8e7f: Add step-transition motion, on by default and with nothing to import: a small stylesheet is built into the package and added to `<head>` when it loads (the way Sonner does it), using `:where()` selectors so your own classes win. `Tour.Content` now stays mounted across steps and the card glides between targets (`transform` only). It scales in from 0.96 and fades on open, and fades out on close through Radix's own exit handling. The spotlight cut-out follows with the same duration and ease, and the title and description fade in on each step. Tune it with the `--tour-duration` and `--tour-ease` CSS variables, turn it off with `<Tour.Root motion={false}>`, and style it with the new `data-motion` (`from-start` or `from-end`) and `data-placed` attributes on `Tour.Content`. `prefers-reduced-motion` removes movement and keeps a short opacity fade. `Tour.Root` now stays rendered while closed so the card can fade out; do not unmount `Tour.Content` yourself between steps. The spotlight CSS recipe from the docs is no longer needed. A Content-Security-Policy that blocks inline `<style>` tags needs a nonce or `'unsafe-inline'`, or `motion={false}` with your own CSS.

## 0.2.1

### Patch Changes

- 2bf30b0: Ship readable, unminified build output (clears the Socket.dev "minified code" alert) and publish from GitHub Actions with npm trusted publishing.

## 0.2.0

### Minor Changes

- e24c864: Move between steps with the left and right arrow keys while focus is inside the card, and return focus to the element that was focused when the tour opened once it closes.

## 0.1.0

### Minor Changes

- 39ab6c6: Initial release.
