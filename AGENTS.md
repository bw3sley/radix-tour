# AGENTS.md

## Project Context

radix-tour is a React library for product tours (onboarding walkthroughs), built on Radix primitives and styled by the consumer with Tailwind. It is published to npm as a package, not an app. Parts are unstyled and expose `data-*` attributes, so consumers control the look with `className`. The Radix code in `packages/react/alert-dialog` (radix-ui/primitives) is the reference for how components are structured and written.

## Package Manager

**Always use `npm`.** Never use `pnpm` or `yarn`.

```bash
npm install             # install deps
npm run storybook       # start Storybook on port 6006
npm run build-storybook # static Storybook build
npm run build           # library build (ESM + CJS + types) via Vite
npm run format          # format via Biome
npm run check:fix       # apply Biome lint fixes, format and organize imports
npm test                # Vitest, single run
npm run test:watch      # Vitest, watch mode
npm run test:coverage   # Vitest with v8 coverage
npx tsc --noEmit        # typecheck (no npm script)
npx biome check .       # lint + format check without writing (no npm script)
```

Before finishing a change, run `npx tsc --noEmit`, `npx biome check .` and `npm test`. When the change touches the build or public API, also run `npm run build` and `npm run build-storybook`.

## Stack

- **Library** - React 18/19 (peer dependency), published as ESM + CJS with type declarations
- **Build** - Vite 8 in library mode (`vite.config.ts`), `vite-plugin-dts` for types, React and `@radix-ui/*` kept external
- **UI primitives** - Radix UI: `@radix-ui/react-popover`, `react-primitive`, `react-context`, `primitive`
- **Styling** - consumer-owned Tailwind CSS v4; the library ships no styles
- **Testing** - Vitest + Testing Library (jsdom)
- **Stories** - Storybook 10 (`@storybook/react-vite`, a11y addon)
- **Icons** - Lucide React (stories only, dev dependency)
- **Linting / formatting** - Biome
- **Language** - TypeScript 5

## Project Structure

```
.storybook/
  main.ts             # Storybook config, Tailwind added through viteFinal
  preview.ts          # global parameters (a11y checks)
  preview.css         # Tailwind entry, story theme tokens, spotlight and card motion
  preview-head.html   # loads the story font (Schibsted Grotesk)
src/
  index.ts            # public API; anything not exported here is internal
  test-setup.ts       # Vitest setup (jest-dom, jsdom stubs)
  components/
    tour.tsx          # every Tour part in one file, Radix-style
    tour.test.tsx     # unit tests
    tour.stories.tsx  # Storybook stories
    stories/
      crumb-app.tsx   # fictional bakery dashboard the stories run the tour against
  hooks/
    use-target.ts     # resolve a selector to an element, waiting for it to mount
    use-rect.ts       # track an element's viewport rect
skills/
  radix-tour/         # Agent Skill for consumers (SKILL.md + references/); repo only, not in the npm package
.github/workflows/
  ci.yml              # typecheck, Biome, tests and build on pull requests and main
  release.yml         # changesets/action: opens the Version Packages PR, publishes to npm
.changeset/           # changeset config and pending changesets
radix-tour.gif        # README demo, recorded from the Default story
dist/                 # build output (ESM, CJS, .d.ts)
storybook-static/     # Storybook build output
vite.config.ts        # library build; re-adds the "use client" banner
vitest.config.ts      # test config (jsdom, setup file, coverage)
biome.json            # lint and format rules, including useBlockStatements
README.md             # public docs: install, quick start, API reference, roadmap
LICENSE.md            # MIT
CLAUDE.md             # points agents back to this file
```

## Component Structure

Follow Radix's alert-dialog layout in `src/components/tour.tsx`:

- One file per component. Each part gets a banner comment (`/* --- TourContent --- */`).
- A `const CONTENT_NAME = "TourContent"` per part, used for `displayName` and context errors.
- Context comes from `createContextScope`. Cross-part props use `ScopedProps<P>`.
- Parts are `React.forwardRef` components built on `Primitive.*`, so every part supports `asChild`.
- Merge handlers with `composeEventHandlers` so consumers can call `preventDefault()`.
- Parts emit `data-*` attributes for state; they never hardcode colors or sizes.
- Exports go at the bottom of the file: long names (`TourContent`) plus short aliases (`Content`), so consumers write `import * as Tour from "radix-tour"`.
- Re-export public names and prop types from `src/index.ts`.

Public API today: `Tour.Root`, `Content`, `Arrow`, `Spotlight`, `Title`, `Description`, `Progress`, `Next`, `Previous`, `Close`, plus the `useTour()` hook and the `TourStep` type (`id`, `target`, `title`, `description`, `side`, `align`). The spotlight exposes `data-tour-spotlight` and `data-tour-cutout`; the library applies no styling or motion to them.

## Stories

- Stories run the tour against the fictional Crumb dashboard in `src/components/stories/crumb-app.tsx`. Its tour targets are `#route-nav`, `#search`, `#status-tabs` and `#new-order`. Keep those ids in sync with the steps in `tour.stories.tsx`.
- Story-only styling (theme tokens, spotlight glide, card entrance) lives in `.storybook/preview.css`, not in the library.
- Story files and `stories/` are excluded from the published type declarations in `vite.config.ts`.
- When a change alters how the `Default` story looks or behaves, re-record `radix-tour.gif` (repo root) and commit the new file. The README embeds it through its `raw.githubusercontent.com` URL, so the npm page shows it too.

## Path Aliases

None. Use relative imports.

## Client Components

Components that use state, effects, refs or Radix internals start with `"use client"`, so the package works under React Server Components. Keep it at the top of `src/components/tour.tsx`.

Bundlers drop module-level directives, so `vite.config.ts` re-adds `"use client";` as a banner on every output file. Do not remove it. After changing the build, check that `dist/index.js` and `dist/index.cjs` still start with it.

## Key Conventions

- Reusable parts belong in `src/components/`. Shared hooks belong in `src/hooks/`.
- Build only what a story or test renders today. Do not add speculative parts or options.
- New behavior needs a test. A change to what users see also needs a story.
- A change to the public API (parts, props, step fields, `data-*` attributes) also updates the API reference in `README.md`.
- A user-facing change also needs a changeset: run `npx changeset`, pick the bump (`minor` for breaking changes while below 1.0), and commit the generated `.changeset/*.md`. Do not run `npm run version` or `npm run release` by hand: the Release workflow (`.github/workflows/release.yml`) opens a "Version Packages" PR on `main`, and merging it publishes to npm. `prepublishOnly` runs typecheck, Biome, tests and the build first.
- Use named exports only. No default exports, except Storybook's `export default meta`.
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
