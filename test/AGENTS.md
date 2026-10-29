# AGENTS.md

The `test/` workspace (`radix-tour-test`, private, never published): a Next fixture app in `src/` and the Playwright specs in `tests/`. The fixture imports the built library, and this is the only test suite the repo has (there is no unit-test runner). The repo-wide rules are in the root `AGENTS.md`.

## Running

Run from the repo root:

```bash
npm test                                          # build the library, then run every spec (Chromium and WebKit)
npx playwright test test/tests/focus.spec.ts      # one file (build first: the fixture reads dist/)
npx playwright test --project=chromium -g "F6"    # one browser, tests matching a name
npx playwright test --reporter=line               # compact output
```

Playwright starts the fixture with `npm run dev -w radix-tour-test` on port 3000. Install the browsers once with `npx playwright install chromium webkit`. The HTML report goes to `playwright-report/` and never opens on its own.

## Files (in `tests/`)

| File | Covers |
| --- | --- |
| `tour.spec.ts` | Steps, navigation buttons, closing, late targets, placement, `useTour` state |
| `keyboard.spec.ts` | Arrow keys, Home and End, modifiers, inputs and widgets, `preventDefault` |
| `focus.spec.ts` | Focus on open, focus return, Tab order, F6, auto focus opt-out |
| `a11y.spec.ts` | Live region, accessible name and description, `aria-disabled` Previous, target `aria-describedby` |
| `motion.spec.ts` | `data-*` attributes for the stylesheet, same card across steps, `motion={false}` |
| `start-tour.ts` | `startTour(page, query)`: opens the page and the tour (not a spec) |

New behavior gets a spec in the file for its area; add a new file only for a new area.

## Locators

Use `data-testid`, not roles, text or CSS selectors. These ids exist in the fixture:

| Id | Element |
| --- | --- |
| `start` | The "Start tour" opener button |
| `card` | `Tour.Content` (the dialog) |
| `spotlight` | `Tour.Spotlight` |
| `title`, `description`, `progress` | `Tour.Title`, `Tour.Description`, `Tour.Progress` |
| `back`, `next`, `close` | `Tour.Previous`, `Tour.Next`, `Tour.Close` |
| `note` | An input inside the card |
| `position` | Text built from `useTour()`: `first more`, `later last` |
| `first-target`, `second-target`, `late-target` | The elements the steps point at |
| `show-target` | Button that mounts the second target (`?hideSecond=1`) |
| `elsewhere`, `page-field`, `page-tab` | A button, an input and a `role="tab"` outside the card |

Exceptions, on purpose:

- `a11y.spec.ts` keeps `getByRole("dialog")` and `getByRole("status")`, because those specs check the semantics themselves.
- `page.locator("body")` for "focus fell back to the page", and a `data-marker` attribute set with `evaluate` to prove an element was not replaced.

Add a `data-testid` to the fixture rather than reaching for a role or selector. Names are lowercase and kebab-case.

## Scenarios

The fixture is configured by query parameters, parsed in `test/src/app/page.tsx` and passed to `TourDemo`:

| Query | Effect |
| --- | --- |
| `?motion=off` | `<Tour.Root motion={false}>` |
| `?opener=remove-on-close` / `unmount-on-open` | The opener button disappears when the tour closes / opens |
| `?scenario=placement` / `late` | One step with `side="right" align="end"` / a target that mounts after 600 ms |
| `?bare=1` | Card without `Tour.Title` and `Tour.Description` |
| `?keyed=1` | `Tour.Next` is re-keyed on each step |
| `?hideSecond=1` | The second target is missing until `show-target` is clicked |
| `?autofocus=prevent` | `onOpenAutoFocus` calls `preventDefault()` |
| `?keydown=prevent` | `onKeyDown` on the card calls `preventDefault()` |

For a new scenario, add a prop to `TourDemo` and a query parameter in `page.tsx`. Keep fixture components one per file, exported inline, as in the website.

## Conventions

- Open the tour with `startTour(page, query)`. It uses the keyboard and retries until the page has hydrated, because WebKit does not focus a button on click and the opener must hold focus for the focus-return specs.
- Use web-first assertions (`expect(locator).toHaveText(...)`) so Playwright retries. No `waitForTimeout` and no sleeps.
- Prefer `locator.focus()` over `click()` when a spec depends on focus. WebKit does not focus buttons on click and does not Tab to buttons by default; skip a spec with `test.skip(browserName === "webkit", "reason")` only when it cannot be written another way.
- `aria-disabled` elements are not actionable for Playwright: assert `not.toHaveAttribute("disabled")` instead of `toBeEnabled()`, and use `click({ force: true })` to prove a click does nothing.
- One behavior per test. Test names read as sentences about the library, for example "returns focus to the opener after Escape".
- Specs import only from `@playwright/test` and `./start-tour`. Never import the library or fixture code.
- Biome formats the specs; run `npx biome check --write test`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
