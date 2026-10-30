# radix-tour

![A four-step product tour on a bakery order dashboard: the spotlight glides from the sidebar to the search box, the status tabs and the New order button while a dark card explains each one.](https://raw.githubusercontent.com/bw3sley/radix-tour/main/radix-tour.gif)

An unstyled product tour component for React, built on [Radix](https://www.radix-ui.com/primitives) primitives.

## Usage

To start using the library, install it in your project:

```bash
npm install radix-tour
```

Using an AI coding agent? Install the [Agent Skill](https://agentskills.io) with `npx skills add bw3sley/radix-tour`.

Give each target an ID, list the steps in order, and control the tour's `open` state:

```tsx
import * as React from "react";
import * as Tour from "radix-tour";

const steps: Tour.TourStep[] = [
  {
    id: "search",
    target: "#search",
    title: "Find an order fast",
    description: "Search by customer, product or order number.",
  },
];

export function OrdersTour() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <input id="search" aria-label="Search orders" />
      <button type="button" onClick={() => setOpen(true)}>Take the tour</button>

      <Tour.Root steps={steps} open={open} onOpenChange={setOpen}>
        <Tour.Spotlight className="z-40 text-slate-900/55" />

        <Tour.Content className="z-50 w-80 rounded-2xl bg-slate-900 p-5 text-white">
          <Tour.Arrow className="fill-slate-900" />
          <Tour.Title className="font-semibold" />
          <Tour.Description className="mt-1 text-sm text-slate-300" />
          <Tour.Next>Next</Tour.Next>
        </Tour.Content>
      </Tour.Root>
    </>
  );
}
```

## Documentation

Find the full API reference, styling and examples at [tour.bw3sley.dev](https://tour.bw3sley.dev).

## License

Licensed under the [MIT License](./LICENSE.md). If radix-tour helps your project, leave feedback or ⭐ the repo.
