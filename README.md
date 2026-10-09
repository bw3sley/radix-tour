# radix-tour

An unstyled product tour library for React, built on [Radix](https://www.radix-ui.com/primitives) primitives. Use it to introduce a feature, guide someone through a page, or explain a workflow one step at a time.

You build the card from composable parts and style it with your own classes. The library finds each target, positions the card beside it, handles navigation, and can draw a spotlight around it. Your app decides when the tour opens and whether a user should see it again.

![A four-step product tour on a bakery order dashboard: the spotlight glides from the sidebar to the search box, the status tabs and the New order button while a dark card explains each one.](https://raw.githubusercontent.com/bw3sley/radix-tour/main/radix-tour.gif)

The tour above is the `Default` story in [`src/components/tour.stories.tsx`](./src/components/tour.stories.tsx).

## Features

- **Composable.** Every part accepts `asChild`, so you can render your own button, heading or card.
- **Unstyled.** The library ships no CSS. Style parts with `className` and `data-*` attributes.
- **Radix underneath.** Positioning, collision handling and portals come from `@radix-ui/react-popover`.
- **Waits for targets.** A step whose element is not on the page yet renders once it appears.
- **Per-step placement.** Each step chooses its own `side` and `align`.
- **Independent spotlight.** The overlay is a separate part. Leave it out to point at things without dimming the page.
- **Server Components ready.** The build keeps the `"use client"` directive.
- **Small.** The library build is about 2 kB gzipped, with React and Radix external to the bundle.

## Installation

The package has not had its first npm release. After it is published, install it with:

```bash
npm install radix-tour
```

`react` and `react-dom` (18 or 19) are peer dependencies. Tailwind is optional; the examples use it to show how consumers can style the parts.

## Quick start

Give each target an element ID, define the steps in order, and control the tour's `open` state. `Tour.Content` is the card; `Tour.Spotlight` is the optional dimmed overlay.

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
      <input id="search" aria-label="Search orders" />
      <button id="new-order" type="button">New order</button>
      <button type="button" onClick={() => setOpen(true)}>Take the tour</button>

      <Tour.Root steps={steps} open={open} onOpenChange={setOpen}>
        <Tour.Spotlight className="z-40 text-slate-900/55" />
        <TourCard />
      </Tour.Root>
    </>
  );
}
```

The `target` of each step is a CSS selector for an element in your page. When the tour opens, it starts at the first step. `Next` advances; on the last step it calls `onOpenChange(false)`. `Previous` moves back, and `Close` or <kbd>Esc</kbd> closes the tour.

## Anatomy

Import the namespace and compose only the parts you need:

```tsx
<Tour.Root steps={steps} open={open} onOpenChange={setOpen}>
  <Tour.Spotlight />

  <Tour.Content>
    <Tour.Arrow />
    <Tour.Close aria-label="Close tour">Close</Tour.Close>
    <Tour.Title />
    <Tour.Description />
    <Tour.Progress />
    <Tour.Previous>Back</Tour.Previous>
    <Tour.Next>Next</Tour.Next>
  </Tour.Content>
</Tour.Root>
```

`Root` owns the active step. `Content` positions the card beside that step's target. `Spotlight` is separate and can be omitted. You can also import the long names (`Tour`, `TourContent`, `TourSpotlight`, and so on) directly.

## How steps and targets work

A step has a unique `id` and a `target` CSS selector, such as `#search` or `[data-tour="search"]`. Optional `title` and `description` values appear in the matching parts; passing children to those parts overrides the values. `side` and `align` place the card for that step.

If a target has not mounted, the card waits until a matching element appears. The tour scrolls a resolved target into view and tracks its position while the page scrolls or resizes. Behavior for targets that remain missing or become hidden is tracked in [issue #1](https://github.com/bw3sley/radix-tour/issues/1).

The tour is controlled: your component owns `open`, and the library calls `onOpenChange(false)` when it finishes or closes. Set `open` to `true` again to restart it.

## Styling

Parts render plain elements, so style them with `className`. Use `asChild` to apply a part's behavior to your own element:

```tsx
<Tour.Next asChild>
  <button className="rounded-md bg-blue-600 px-3 py-2 text-white">
    Continue
  </button>
</Tour.Next>
```

The card and spotlight are separate layers. Give `Tour.Spotlight` a lower `z-index` than `Tour.Content`. The spotlight uses `currentColor`, so a text color with opacity controls the dimmed area. It does not block pointer events. State is exposed through attributes:

| Part | Attributes |
| --- | --- |
| `Tour.Content` | `data-step` (zero-based index), `data-side`, `data-align`, `data-state` |
| `Tour.Spotlight` | `data-tour-spotlight` on the overlay, `data-tour-cutout` on the cut-out |

The spotlight is colored with `currentColor`, so a `text-*` class sets the overlay color and opacity.

### Animate the spotlight

The cut-out is an SVG rect, so you can make it glide between targets with CSS:

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

### Label the last step

`useTour` reads the tour's state from inside `Tour.Root`:

```tsx
function NextButton() {
  const { isLast } = Tour.useTour();

  return <Tour.Next>{isLast ? "Done" : "Next"}</Tour.Next>;
}
```

## API reference

### `Tour.Root`

| Prop | Type | Description |
| --- | --- | --- |
| `steps` | `TourStep[]` | The steps, in order. |
| `open` | `boolean` | Whether the tour is showing. Opening always starts at the first step. |
| `onOpenChange` | `(open: boolean) => void` | Called with `false` when the last step is finished or the tour is closed. |

### `TourStep`

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique id for the step. |
| `target` | `string` | CSS selector of the element to point at. |
| `title` | `ReactNode` | Rendered by `Tour.Title` when it has no children. |
| `description` | `ReactNode` | Rendered by `Tour.Description` when it has no children. |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | Side of the target the card sits on. Defaults to `"bottom"`. |
| `align` | `"start" \| "center" \| "end"` | Alignment along that side. Defaults to `"center"`. |

### Parts

| Part | Renders | Notes |
| --- | --- | --- |
| `Tour.Content` | Radix Popover content | Anchored to the current target. Accepts the Popover content props (`side`, `sideOffset`, `collisionPadding`, ...), which override the step's values. Renders nothing until the target exists. |
| `Tour.Arrow` | Radix Popover arrow | Place it inside `Tour.Content`. Fill it with a `fill-*` class. |
| `Tour.Spotlight` | `svg` | Props: `padding` (px around the target, default 8) and `radius` (corner radius, default 8). |
| `Tour.Title` | `h2` | Shows the step's `title` unless given children. |
| `Tour.Description` | `p` | Shows the step's `description` unless given children. |
| `Tour.Progress` | `span` | Shows `1 / 4` unless given children. |
| `Tour.Next` | `button` | Goes to the next step. On the last step, closes the tour. |
| `Tour.Previous` | `button` | Goes to the previous step. |
| `Tour.Close` | `button` | Closes the tour. |

Every part forwards its ref and accepts `asChild`. Event handlers run before the built-in behavior, and calling `event.preventDefault()` in `onClick` cancels it.

### `useTour()`

Returns `{ steps, step, index, isFirst, isLast, next, previous, close }`. It throws if called outside `Tour.Root`.

## Behavior

- The page stays interactive while the tour is open. Clicking outside the card does not close it.
- <kbd>Esc</kbd> closes the tour.
- <kbd>→</kbd> and <kbd>←</kbd> move to the next and previous step while focus is inside the card. They do nothing on the last step (→) and the first step (←), so they never close the tour; use `Tour.Next` or <kbd>Esc</kbd> for that. They are ignored with a modifier key held, inside inputs, textareas, selects and editable content, and when your `onKeyDown` on `Tour.Content` calls `event.preventDefault()`.
- When the tour closes, by <kbd>Esc</kbd>, `Tour.Close` or finishing the last step, focus returns to the element that was focused when it opened (usually your "Start tour" button). If that element is no longer in the page, focus is left alone.
- Each step scrolls its target into view.
- The card is a Radix Popover, so it is exposed to assistive technology as a dialog. The spotlight is hidden from it.

## Server Components

The build preserves `"use client"`, so a Server Component can import the package. Put state and event handlers, such as the `open` state in the quick start, in a Client Component.

## Agent skill

The repo includes an [Agent Skill](https://agentskills.io) that teaches AI coding agents how to add and style a tour with radix-tour. It lives in [`skills/radix-tour`](./skills/radix-tour) and is not part of the npm package. Install it into your project with the [`skills` CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add bw3sley/radix-tour
```

Or copy the `skills/radix-tour` folder into your agent's skills directory, for example `.claude/skills/` for Claude Code.

## License

License under the [MIT License](./LICENSE.md). If radix-tour helps your project, leave a feedback or ⭐ the repo.