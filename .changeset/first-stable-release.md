---
"radix-tour": major
---

First stable release. The public API is now stable and follows semantic versioning from here: the `Tour.*` parts and their long names (`TourContent` and so on), `useTour()`, `createTourScope`, the `TourStep` fields, the `data-*` attributes, and the `--tour-duration` and `--tour-ease` CSS variables. There are no breaking changes from 0.3.0.

Before 1.0.0 the package was checked in Vite, esbuild, webpack and Turbopack, in Chromium and WebKit, with React 18 and 19, and imported from a Server Component: the built-in stylesheet is added to `<head>` in every case, even when you import only one part. Known limits, documented in the README: a target that never appears keeps the card hidden until it does, a hidden target counts as present, and the live-region announcement and `Tour.Progress` text are English only.
