# AGENTS.md

## Project Context

radix-tour is a React library for product tours (onboarding walkthroughs), built on Radix primitives and styled by the consumer with Tailwind. It is published to npm as a package, not an app. Parts are unstyled and expose `data-*` attributes, so consumers control the look with `className`. The Radix code in `packages/react/alert-dialog` (radix-ui/primitives) is the reference for how components are structured and written.

The repo is an npm workspaces monorepo: the library lives at the root, and `test/` (end-to-end app) and `website/` (docs site) are private workspaces that are never published. The npm package contains only `dist/`, plus `README.md`, `LICENSE.md` and `package.json`. Website-specific rules live in `website/AGENTS.md`.

## Package Manager

**Always use `npm`.** Never use `pnpm` or `yarn`.

```bash
npm install             # install deps
npm run build           # library build (ESM + CJS + types) via Vite
npm run format          # format via Biome
npm run check:fix       # apply Biome lint fixes, format and organize imports
npm test                # build, then Playwright (Chromium + WebKit) against test/
npm run dev -w radix-tour-website    # docs site on port 3001 (run `npm run build` first)
npm run build -w radix-tour-website  # build the docs site
npx tsc --noEmit        # typecheck (no npm script)
npx biome check .       # lint + format check without writing (no npm script)
```

Before finishing a change, run `npx tsc --noEmit`, `npx biome check .` and `npm test`. When the change touches the build or public API, also run `npm run build`. When the change touches `website/`, also run `npm run build -w radix-tour-website`.

## Stack

- **Library** - React 18/19 (peer dependency), published as ESM + CJS with type declarations
- **Build** - Vite 8 in library mode (`vite.config.ts`), `vite-plugin-dts` for types, React and `@radix-ui/*` kept external
- **UI primitives** - Radix UI: `@radix-ui/react-popover`, `react-primitive`, `react-context`, `react-compose-refs`, `primitive`
- **Styling** - consumer-owned Tailwind CSS v4. The library ships one zero-specificity stylesheet (`src/styles.css`, today the step motion), added to `<head>` by the build when the package loads; everything else is unstyled
- **Testing** - Playwright (Chromium + WebKit) in the `test/` workspace; there is no unit-test runner
- **Website** - Next.js (App Router) in `website/`, styled with Tailwind CSS v4 and shadcn-style tokens, Shiki for code blocks; it runs the real `radix-tour` workspace package
- **Icons** - Lucide React (the test app and the website; dev dependencies)
- **Linting / formatting** - Biome
- **Language** - TypeScript 5

## Project Structure

```
src/
  index.ts            # public API; anything not exported here is internal
  types.ts            # shared public types (TourStep, TourProps)
  tour.tsx            # every Tour part in one file, Radix-style
  hooks.ts            # useTarget (wait for the target), useRect (track its rect), useTourKeys (document keys)
  styles.css          # the library's own CSS (step motion), put in the bundle by vite-plugin-css-injected-by-js and added to <head> when the package loads, like Sonner
  tour.test.tsx       # unit tests
test/                 # private npm workspace (radix-tour-test): Next app + Playwright specs, never published
  src/app/            # pages that render a tour against the built package
  src/components/     # fixture components, one per file (TourDemo, DemoCard, ...)
  src/constants/      # fixture steps
  tests/              # Playwright specs: tour, keyboard, focus, a11y, motion (+ start-tour helper)
website/              # private npm workspace (radix-tour-website): the docs site, never published
  src/app/            # layout, page and `globals.css` (Tailwind import and design tokens only)
  src/components/     # one component per file
  src/constants/      # step data, code strings, presets
  src/contexts/       # the playground context and its provider, in one file
  src/hooks/          # hooks (usePlayground)
  src/lib/            # helpers (Shiki theme)
  postcss.config.mjs  # Tailwind through @tailwindcss/postcss
skills/
  radix-tour/         # Agent Skill for consumers (SKILL.md + references/); repo only, not in the npm package
.github/workflows/
  ci.yml              # typecheck, Biome and the library and website builds, plus a Playwright e2e job, on pull requests and main
  release.yml         # changesets/action: opens the Version Packages PR, publishes to npm
.changeset/           # changeset config and pending changesets
radix-tour.gif        # README demo, recorded from the hero demo on the website
dist/                 # build output (ESM, CJS, .d.ts)
playwright.config.ts  # e2e config; starts the test app, needs `npm run build` first
vite.config.ts        # library build; re-adds the "use client" banner
biome.json            # lint and format rules, including useBlockStatements
README.md             # public docs: install, quick start, API reference, roadmap
LICENSE.md            # MIT
CLAUDE.md             # points agents back to this file
```

## Component Structure

Follow Radix's alert-dialog layout in `src/tour.tsx`:

- One file per component. Each part gets a banner comment (`/* --- TourContent --- */`).
- A `const CONTENT_NAME = "TourContent"` per part, used for `displayName` and context errors.
- Context comes from `createContextScope`. Cross-part props use `ScopedProps<P>`.
- Parts are `React.forwardRef` components built on `Primitive.*`, so every part supports `asChild`.
- Merge handlers with `composeEventHandlers` so consumers can call `preventDefault()`.
- Parts emit `data-*` attributes for state; they never hardcode colors or sizes.
- Exports go at the bottom of the file: long names (`TourContent`) plus short aliases (`Content`), so consumers write `import * as Tour from "radix-tour"`.
- Re-export public names and prop types from `src/index.ts`.

Public API today: `Tour.Root`, `Content`, `Arrow`, `Spotlight`, `Title`, `Description`, `Progress`, `Next`, `Previous`, `Close`, plus the `useTour()` hook and the `TourStep` type (`id`, `target`, `title`, `description`, `side`, `align`). The spotlight exposes `data-tour-spotlight` and `data-tour-cutout`. Motion ships in `src/styles.css`, injected into `<head>` on import: `Tour.Root` takes `motion` (default true), `--tour-duration` and `--tour-ease` tune it, and `Tour.Content` stays mounted across steps and sets `data-motion` and `data-placed`.

## Demo and recording

- The website's hero demo runs the tour against the fictional Crumb dashboard (`website/src/components/demo-dashboard.tsx`). Its tour targets are `#demo-nav`, `#demo-search`, `#demo-tabs` and `#demo-add`. Keep those ids in sync with the steps in `website/src/constants/hero-steps.ts`.
- When a change alters how the hero demo looks or behaves, re-record `radix-tour.gif` (repo root) and commit the new file. The README embeds it through its `raw.githubusercontent.com` URL, so the npm page shows it too.

## Path Aliases

None. Use relative imports.

## Client Components

Components that use state, effects, refs or Radix internals start with `"use client"`, so the package works under React Server Components. Keep it at the top of `src/tour.tsx`.

Bundlers drop module-level directives, so `vite.config.ts` re-adds `"use client";` as a banner on every output file. Do not remove it. After changing the build, check that `dist/index.js` and `dist/index.cjs` still start with it.

## Key Conventions

- Keep `src/` flat: the parts in `src/tour.tsx`, shared hooks in `src/hooks.ts`. Add a file, not a folder, when something new needs its own module.
- Build only what a test or the website demo renders today. Do not add speculative parts or options.
- New behavior needs a Playwright spec in `test/tests/`. A change to what users see also updates the website demo.
- A change to the public API (parts, props, step fields, `data-*` attributes) also updates the API reference in `README.md`.
- A user-facing change also needs a changeset: run `npx changeset`, pick the bump (`minor` for breaking changes while below 1.0), and commit the generated `.changeset/*.md`. Do not run `npm run version` or `npm run release` by hand: the Release workflow (`.github/workflows/release.yml`) opens a "Version Packages" PR on `main`, and merging it publishes to npm. `prepublishOnly` runs typecheck, Biome and the build first; CI runs the Playwright suite on every pull request and on `main`.
- Use named exports only. No default exports, except Next's `page.tsx` and `layout.tsx`.
- Keep `test/` and `website/` private and listed in `ignore` in `.changeset/config.json`. After changing the package, run `npm pack --dry-run` and check it lists only `dist/`, `README.md`, `LICENSE.md` and `package.json`.
- Write functions as `function fn() {}` declarations, not `const fn = () => {}`. Applies to
  components, hooks, and standalone utilities. Inline one-off callbacks
  (e.g. `array.map((x) => ...)`, `onClick={() => ...}`) are unaffected — this rule targets named
  function definitions, not throwaway callback expressions.
- Always use braces. Write `if (x) {\n  return y;\n}`, never `if (x) return y;`. Biome enforces this
  (`useBlockStatements`).
- Put a blank line between logical groups of statements: after a guard clause, before `return`, and
  between hook calls and derived values. Biome does not enforce this, so keep it by hand.
- No `any`. Use `import type` for type-only imports.
- Icons come from Lucide React only. Never inline glyph characters.
- Biome is the linter and formatter. Do not add ESLint, oxlint or Prettier config.

## Documentation Rules

- Keep this file updated when stack, scripts, or folder structure changes.
- Keep `README.md` accurate: document only behavior that exists, and list planned work under its Roadmap section.
- Keep `CLAUDE.md` as a pointer file only.
