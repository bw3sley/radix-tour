# AGENTS.md

The docs site for radix-tour: a private npm workspace (`website`) that is never published. The repo-wide rules, commands and the library's own conventions are in the root `AGENTS.md`; this file covers the site only.

## Commands

Run these from the repo root, after `npm run build` so the `radix-tour` workspace link resolves to `dist/`:

```bash
npm run dev -w website    # dev server on port 3001
npm run build -w website  # production build
npm run start -w website  # serve the production build on port 3001
```

Before finishing a change, run `npx tsc --noEmit` in `website/`, `npx biome check website/src` and the production build.

## Structure

```
src/
  app/
    layout.tsx        # fonts (Geist, Geist Mono), metadata
    page.tsx          # the landing page, composed from section components
    globals.css       # Tailwind import and design tokens only
  components/         # one component per file
  constants/          # step data, demo orders, spotlight presets, code strings, the API reference rows
  contexts/           # playground-context.tsx: context and provider in one file
  hooks/              # use-playground.ts
  lib/                # shiki-theme.ts
postcss.config.mjs    # Tailwind through @tailwindcss/postcss
```

The site is the docs: it is served at `https://tour.bw3sley.dev` and its API reference section (`id="api-reference"`) is the full API. It is deployed on Coolify from the root `Dockerfile` (multi-stage: install, build the library and the site, then run only the Next standalone output as the non-root `node` user on port 3000). `next.config.ts` sets `output: "standalone"` and `outputFileTracingRoot` to the repo root so the workspace `radix-tour` package is traced into the bundle. Build the image locally with `docker build -t radix-tour-website .`.

The hero demo and the "Run it on the demo" button use the real `radix-tour` library. The Placement, Spotlight and Compose previews are static mock cards driven by the same tokens. Social images use a shared `OgImage` component rendered by `takumi-js`; `next.config.ts` leaves the native `@takumi-rs/core` binding external to the bundle.

## Conventions

- One component per file, kebab-case filename, exported inline: `export function Name() {}`. No `export { Name }` at the bottom. Only `page.tsx`, `layout.tsx` and `next.config.ts` use `export default`, because Next requires it.
- Use plain tags (`p`, `code`, `h2`, ...) directly and give each its own Tailwind classes. Do not wrap a single tag in a component, and do not style children through parent selectors such as `[&>p]:`. Name a component for what it is (`Footer`, not `SiteFooter`).
- Non-component code goes in the role folders above. A context and its provider share one file; the `use...` hook is in `hooks/`.
- Tailwind only. `globals.css` holds `@import "tailwindcss"`, the `:root` tokens (shadcn names: `--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--border`, `--radius`), the `@theme inline` mapping and a small base layer. No hand-written component CSS.
- No arbitrary values (`text-[22px]`, `w-[184px]`): use the nearest Tailwind scale value. Inline `style` is only for computed geometry (placement and spotlight positions).
- Colors come from tokens (`bg-popover`, `text-muted-foreground`), never raw hex in classes. Add a token to `globals.css` and map it in `@theme inline` when a new color is needed.
- Code blocks use Shiki's `codeToHtml` with the `css-variables` theme (`src/lib/shiki-theme.ts`); its colors are the `--shiki-*` tokens in `globals.css`.
- Components that use state, effects or the tour library start with `"use client"`. Section components without state stay server components.
- Icons come from `lucide-react` only. It has no brand icons, so the GitHub link uses `GitFork`.
- Import the library as `radix-tour`, never through a path into `../src`.
- Functions are `function fn() {}` declarations, always with braces, `import type` for type-only imports, no `any`. Biome is the linter and formatter.
