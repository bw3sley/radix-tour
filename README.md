# radix-tour

![A four-step product tour on a bakery order dashboard: the spotlight glides from the sidebar to the search box, the status tabs and the New order button while a dark card explains each one.](https://raw.githubusercontent.com/bw3sley/radix-tour/main/radix-tour.gif)

An unstyled product tour component for React, built on [Radix](https://www.radix-ui.com/primitives) primitives. The tour above is the demo in the [`website/`](./website) workspace.

## Usage

Install the package. `react` and `react-dom` (18 or 19) are peer dependencies, and Tailwind is optional (the examples use it for styling).

```bash
npm install radix-tour
```

Using an AI coding agent? Install the [Agent Skill](https://agentskills.io) in [`skills/radix-tour`](./skills/radix-tour) (not part of the npm package) with `npx skills add bw3sley/radix-tour`.

Give each target an element ID, define the steps in order, and control the tour's `open` state:

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
  {
    id: "new-order",
    target: "#new-order",
    side: "bottom",
    align: "end",
    title: "Add an order",
    description: "Standing orders repeat every week.",
  },
];

export function OrdersTour() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <input id="search" aria-label="Search orders" />
      <button id="new-order" type="button">New order</button>
      <button type="button" onClick={() => setOpen(true)}>Take the tour</button>

      <Tour.Root steps={steps} open={open} onOpenChange={setOpen}>
        <Tour.Spotlight className="z-40 text-slate-900/55" />

        <Tour.Content className="z-50 w-80 rounded-2xl bg-slate-900 p-5 text-white">
          <Tour.Arrow className="fill-slate-900" />
          <Tour.Close aria-label="Close tour" className="float-right">Close</Tour.Close>
          <Tour.Title className="font-semibold" />
          <Tour.Description className="mt-1 text-sm text-slate-300" />
          <Tour.Progress className="text-xs text-slate-400" />
          <Tour.Previous>Back</Tour.Previous>
          <Tour.Next>Next</Tour.Next>
        </Tour.Content>
      </Tour.Root>
    </>
  );
}
```

Opening starts at the first step. `Next` advances (and closes on the last step), `Previous` goes back, and `Close` or <kbd>Esc</kbd> closes the tour. The tour is controlled: the library calls `onOpenChange(false)` when it ends, and setting `open` to `true` restarts it. `Tour.Spotlight` is optional.

## Documentation

The rest of this README is the documentation: [steps and targets](#steps-and-targets), [styling](#styling) and the [API reference](#api-reference).

## Steps and targets

A step's `target` is a CSS selector (`#search`, `[data-tour="search"]`). If the element has not mounted yet, the card waits until it appears. A resolved target is scrolled into view and tracked while the page scrolls or resizes. A target that never appears keeps the card hidden (<kbd>Esc</kbd> still closes the tour), and a target that exists but is hidden with `display: none` still counts as found, so show it before its step. Both cases are tracked in [issue #1](https://github.com/bw3sley/radix-tour/issues/1).

## Styling

Parts render plain elements, so style them with `className`, or use `asChild` to apply a part's behavior to your own element:

```tsx
<Tour.Next asChild>
  <button className="rounded-md bg-blue-600 px-3 py-2 text-white">Continue</button>
</Tour.Next>
```

Give `Tour.Spotlight` a lower `z-index` than `Tour.Content`. The spotlight uses `currentColor`, so a text color with opacity sets the dimmed area, and it never blocks pointer events. State is exposed through attributes:

| Part | Attributes |
| --- | --- |
| `Tour.Content` | `data-step` (zero-based), `data-side`, `data-align`, `data-state`, `data-motion` (`from-start` or `from-end`), `data-placed` |
| `Tour.Previous` | `data-disabled` on the first step |
| `Tour.Spotlight` | `data-tour-spotlight` on the overlay, `data-tour-cutout` on the cut-out |

## API reference

### `Tour.Root`

| Prop | Type | Description |
| --- | --- | --- |
| `steps` | `TourStep[]` | The steps, in order. |
| `open` | `boolean` | Whether the tour is showing. Opening starts at the first step. |
| `onOpenChange` | `(open: boolean) => void` | Called with `false` when the tour finishes or is closed. |
| `motion` | `boolean` | Animate between steps and on open and close. Defaults to `true`. |

### `TourStep`

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique id. |
| `target` | `string` | CSS selector of the element to point at. |
| `title` | `ReactNode` | Rendered by `Tour.Title` when it has no children. |
| `description` | `ReactNode` | Rendered by `Tour.Description` when it has no children. |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | Side of the target the card sits on. Defaults to `"bottom"`. |
| `align` | `"start" \| "center" \| "end"` | Alignment along that side. Defaults to `"center"`. |

### Parts

| Part | Renders | Notes |
| --- | --- | --- |
| `Tour.Content` | Radix Popover content | Anchored to the current target and stays mounted across steps. Accepts the Popover content props (`side`, `sideOffset`, `collisionPadding`, `onOpenAutoFocus`, ...), which override the step's values. |
| `Tour.Arrow` | Radix Popover arrow | Place it inside `Tour.Content` and fill it with a `fill-*` class. |
| `Tour.Spotlight` | `svg` | `padding` (px around the target, default 8) and `radius` (default 8). |
| `Tour.Title` | `h2` | The step's `title` unless given children. Labels the card. |
| `Tour.Description` | `p` | The step's `description` unless given children. Describes the card. |
| `Tour.Progress` | `span` | `1 / 4` unless given children. |
| `Tour.Next` | `button` | Next step; closes the tour on the last one. |
| `Tour.Previous` | `button` | Previous step. On the first step it gets `aria-disabled` and `data-disabled`, does nothing and stays focusable. |
| `Tour.Close` | `button` | Closes the tour. |

Every part forwards its ref and accepts `asChild`. Event handlers run before the built-in behavior, and `event.preventDefault()` in `onClick` cancels it. The long names (`Tour`, `TourContent`, ...) are exported too.

### `useTour()`

Returns `{ steps, step, index, isFirst, isLast, next, previous, close }` and throws outside `Tour.Root`. Use it to label the last step:

```tsx
function NextButton() {
  const { isLast } = Tour.useTour();

  return <Tour.Next>{isLast ? "Done" : "Next"}</Tour.Next>;
}
```

## License

Licensed under the [MIT License](./LICENSE.md). If radix-tour helps your project, leave feedback or ⭐ the repo.
