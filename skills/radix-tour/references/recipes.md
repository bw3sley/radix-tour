# radix-tour recipes

## Custom elements with `asChild`

`asChild` applies the part's behaviour to your own element (a design-system button, say). The child must forward its ref and props.

```tsx
<Tour.Next asChild>
  <Button variant="primary">Continue</Button>
</Tour.Next>
```

## Animated spotlight

The cut-out is an SVG rect, so CSS can glide it between targets. Put this in the app's global stylesheet:

```css
@media (prefers-reduced-motion: no-preference) {
  [data-tour-cutout] {
    transition:
      x 360ms cubic-bezier(0.2, 0.8, 0.2, 1),
      y 360ms cubic-bezier(0.2, 0.8, 0.2, 1),
      width 360ms cubic-bezier(0.2, 0.8, 0.2, 1),
      height 360ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }
}
```

## Show the tour once per user

The library has no persistence. Read and write a flag in app code. Open from an effect, not during render, so server and client markup match.

```tsx
"use client";

import * as React from "react";
import * as Tour from "radix-tour";

const STORAGE_KEY = "orders-tour-seen";

export function OrdersTour() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setOpen(true);
      }
    } catch {
      // Storage can be blocked. Skip the tour rather than showing it every visit.
    }
  }, []);

  function handleOpenChange(next: boolean) {
    setOpen(next);

    if (!next) {
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {}
    }
  }

  return (
    <Tour.Root steps={steps} open={open} onOpenChange={handleOpenChange}>
      <Tour.Spotlight className="z-40 text-slate-900/55" />
      <TourCard />
    </Tour.Root>
  );
}
```

If the app has a user record, store the flag server-side instead and pass the initial value in as a prop. A "Replay tour" button just calls `setOpen(true)`.

## React to step changes (analytics)

There is no `onStepChange`. Mount a child inside `Tour.Root` and watch `useTour().index`. It mounts when the tour opens, so it also fires for step 0.

```tsx
function StepTracker({ onStep }: { onStep: (id: string, index: number) => void }) {
  const { step, index } = Tour.useTour();

  React.useEffect(() => {
    onStep(step.id, index);
  }, [step.id, index, onStep]);

  return null;
}

<Tour.Root steps={steps} open={open} onOpenChange={setOpen}>
  <StepTracker onStep={track} />
  <TourCard />
</Tour.Root>
```

Pass a stable `onStep` (module function or `useCallback`), otherwise the effect re-fires on every render. To track completion versus dismissal, compare `index` with the last step inside the `onOpenChange(false)` handler, or call `useTour().close` from your own button.

## Next.js App Router

`page.tsx` stays a Server Component. Put the tour and its state in a file marked `"use client"` and render it from the page:

```tsx
// app/orders/page.tsx (Server Component)
import { OrdersTour } from "./orders-tour";

export default function OrdersPage() {
  return (
    <main>
      <input id="search" aria-label="Search orders" />
      <button id="new-order" type="button">New order</button>
      <OrdersTour />
    </main>
  );
}
```

The targets can live in Server Components. Only the tour needs the client boundary. Do not import `radix-tour` parts with state or `useTour` into a file without `"use client"`.

## Step whose target appears late

A step waits until its selector matches, so a target that mounts after a click or a data load works. If the step belongs to something that only appears after the user acts, either open the tour after that point or make the earlier step's `Next` trigger the UI change:

```tsx
<Tour.Next onClick={() => setMenuOpen(true)}>Next</Tour.Next>
```

The handler runs before the step advances, so the menu starts mounting as the tour moves on. A target that never mounts leaves the tour stuck on a hidden card, so keep such steps rare and test them.

## Selecting targets reliably

Prefer `#id` or `[data-tour="search"]`. Avoid class selectors tied to styling (they change) and positional selectors. Keep the attribute on the element that has the visible box you want outlined, not a wrapper with `display: contents`.
