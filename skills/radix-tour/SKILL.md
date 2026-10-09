---
name: radix-tour
description: Adds a product tour (onboarding walkthrough, guided tour, step-by-step coachmarks with a spotlight) to a React or Next.js app using the radix-tour library. Use when the user wants to create, edit, style or debug a product tour, feature introduction or onboarding flow in React, mentions radix-tour or Tour.Root, or needs a tooltip card that points at page elements one step at a time.
license: MIT
compatibility: React 18 or 19 project with npm (or another Node package manager). Needs no network access beyond installing the package.
---

# radix-tour

radix-tour is an unstyled React tour library built on Radix Popover. You compose a card from parts, point each step at a page element with a CSS selector, and style everything with the host project's own classes. The library ships no CSS.

## Procedure

1. **Inspect the project.** Find how it styles components (Tailwind, CSS modules, plain CSS) and whether it uses the Next.js App Router. Style the tour the same way.
2. **Install** if `radix-tour` is not in `package.json`: `npm install radix-tour` (use the project's package manager). `react` and `react-dom` 18 or 19 are peers.
3. **Give every target a stable hook** the selector can match: an `id` or `data-tour="..."` on the element. Prefer adding the attribute over writing a fragile selector like `.btn:nth-child(2)`.
4. **Write the steps** in display order, each with a unique `id` and a `target` selector.
5. **Create one client component** that owns the `open` state and renders the tour (see below), and render a trigger, or open it from app logic.
6. **Verify** with the checklist at the end.

## Working example

```tsx
"use client";

import * as React from "react";
import * as Tour from "radix-tour";

const steps: Tour.TourStep[] = [
  {
    id: "search",
    target: "#search",
    title: "Find an order fast",
    description: "Search by customer, product or order number.",
  },
  {
    id: "new-order",
    target: "#new-order",
    side: "bottom",
    align: "end",
    title: "Add an order",
    description: "Standing orders repeat every week.",
  },
];

function TourCard() {
  const { isFirst, isLast } = Tour.useTour();

  return (
    <Tour.Content className="z-50 w-80 rounded-2xl bg-slate-900 p-5 text-white">
      <Tour.Arrow className="fill-slate-900" />
      <Tour.Close aria-label="Close tour" className="float-right">Close</Tour.Close>
      <Tour.Title className="font-semibold" />
      <Tour.Description className="mt-1 text-sm text-slate-300" />
      <div className="mt-4 flex items-center justify-between">
        <Tour.Progress className="text-xs text-slate-400" />
        <div className="flex gap-2">
          {!isFirst && <Tour.Previous>Back</Tour.Previous>}
          <Tour.Next>{isLast ? "Done" : "Next"}</Tour.Next>
        </div>
      </div>
    </Tour.Content>
  );
}

export function OrdersTour() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Take the tour</button>

      <Tour.Root steps={steps} open={open} onOpenChange={setOpen}>
        <Tour.Spotlight className="z-40 text-slate-900/55" />
        <TourCard />
      </Tour.Root>
    </>
  );
}
```

Import the namespace (`import * as Tour from "radix-tour"`). Long names (`TourContent`, `TourNext`...) are also exported.

## Gotchas

- **The tour is controlled.** `open` and `onOpenChange` are both required. The library calls `onOpenChange(false)` on finish, `Tour.Close` and Esc. Setting `open` to `true` again restarts at step 0.
- **`target` is a CSS selector string**, not a ref or element. Without a matching element, `Tour.Content` renders nothing (and the spotlight too) until one mounts. A target that stays missing or hidden is a known open issue, so confirm every selector exists in the rendered markup.
- **`useTour()` only works inside `Tour.Root`** and throws elsewhere. Put anything that reads it (a "Done" label, an analytics effect) in a child component of `Tour.Root`, like `TourCard` above.
- **`Tour.Next` on the last step closes the tour.** It has no built-in label change, so switch the label with `useTour().isLast`.
- **Spotlight colour comes from `currentColor`.** Set it with a text colour with opacity (`text-slate-900/55`), not `bg-*` or `fill-*`. Give it a lower `z-index` than `Tour.Content`, or it covers the card. It never blocks clicks, so the page stays interactive.
- **`Tour.Arrow` goes inside `Tour.Content`** and is coloured with `fill-*`, matching the card background.
- **`Tour.Title`, `Tour.Description` and `Tour.Progress` read the current step** and show it unless you pass children. Do not duplicate step text as children.
- **Next.js and Server Components:** the package keeps `"use client"`, so a Server Component can import it, but `useState`, handlers and `useTour` need a Client Component. Start the file with `"use client"`.
- **Nothing is invented for you.** There is no `onStepChange`, `onSkip`, "show once" persistence, or `step`/`defaultOpen` prop. To track steps, read `useTour().index` in a child effect. To show a tour once, store a flag in app code. Both are in [references/recipes.md](references/recipes.md). Do not pass props that are not in the [API reference](references/api.md).
- **Per-step placement is on the step** (`side`, `align`). Props on `Tour.Content` (`side`, `sideOffset`, `collisionPadding`, ...) override them for every step.
- **Arrow keys** move between steps only while focus is inside the card, and Esc closes it. Do not add a second global key handler for the same keys.

## Where to read more

- Read [references/api.md](references/api.md) when you need a prop, a `data-*` attribute or the `useTour()` return fields that are not shown above.
- Read [references/recipes.md](references/recipes.md) for `asChild` custom elements, an animated spotlight, a "show once per user" flow, tracking step changes, Next.js App Router, or a step whose target appears late.

## Checklist before finishing

- [ ] `import * as Tour from "radix-tour"` (or named long-form imports) and nothing else from the package.
- [ ] `open` and `onOpenChange` are wired to state.
- [ ] The file with state or `useTour` starts with `"use client"` where the project uses the App Router.
- [ ] Every step `id` is unique and every `target` matches an element in the markup (search for the id or attribute).
- [ ] `Tour.Spotlight` z-index is lower than `Tour.Content`.
- [ ] The project's type check passes (for example `npx tsc --noEmit`). Fix any error from a prop that does not exist rather than casting around it.
