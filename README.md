# radix-tour
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/bw3sley/radix-tour/badge)](https://securityscorecards.dev/viewer/?uri=github.com/bw3sley/radix-tour)

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
| `Tour.Content` | `data-step` (zero-based index), `data-side`, `data-align`, `data-state` (`open` or `closed`, set by Radix), `data-motion` (`from-start` or `from-end`, absent when `motion={false}`), `data-placed` (once the card has its first position) |
| `Tour.Previous` | `data-disabled` on the first step |
| `Tour.Spotlight` | `data-tour-spotlight` on the overlay, `data-tour-cutout` on the cut-out |

The spotlight is colored with `currentColor`, so a `text-*` class sets the overlay color and opacity.

### Motion

Step changes are animated by default, with nothing to import. The styles are one small CSS file built into the package and added to `<head>` when it loads, the way Sonner does it:

- The card stays mounted and glides to the next target (`transform` only).
- It scales in from `0.96` and fades in on open, and fades out on close, from the popover's own origin.
- The spotlight cut-out follows with the same duration and ease.
- The title and description fade in when the step changes.

Every selector sits in `:where()`, so it has no specificity and your own classes always win. It uses `:has()`, which every current browser supports. Tune it with two CSS variables, set on `:root` or any ancestor:

| Variable | Default | Used for |
| --- | --- | --- |
| `--tour-duration` | `220ms` | Card glide and cut-out. Enter and exit run at 70% of it, the text fade at 55% |
| `--tour-ease` | `cubic-bezier(0.23, 1, 0.32, 1)` | All of the above |

Pass `motion={false}` to `Tour.Root` to turn all of it off: the parts then carry no `data-motion` attribute, so none of the styles match. With `prefers-reduced-motion: reduce` the card and cut-out stop moving and the card keeps a short opacity fade.

A strict Content-Security-Policy that blocks inline `<style>` tags also blocks this file. Allow it with a nonce or `style-src 'unsafe-inline'`, or pass `motion={false}` and write your own CSS against the `data-*` attributes.

Do not unmount `Tour.Content` yourself between steps (for example by returning `null` from your card component while a step loads): a fresh card has nothing to glide from. `Tour.Content` already waits for the target and keeps the previous position while the next one is missing.

`Tour.Content` sets `data-motion="from-start" | "from-end"`: `from-start` when the last change moved forward, `from-end` when it moved back, so you can style enter and exit by direction.

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
| `motion` | `boolean` | Animate the card and spotlight between steps and on open and close. Defaults to `true`. See [Motion](#motion). |

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
| `Tour.Content` | Radix Popover content | Anchored to the current target. Accepts the Popover content props (`side`, `sideOffset`, `collisionPadding`, `onOpenAutoFocus`, ...), which override the step's values. Renders nothing until the target exists, then stays mounted across steps. Also renders a visually hidden `role="status"` live region (`data-tour-announcer`) that announces "Step N of M: title". |
| `Tour.Arrow` | Radix Popover arrow | Place it inside `Tour.Content`. Fill it with a `fill-*` class. |
| `Tour.Spotlight` | `svg` | Props: `padding` (px around the target, default 8) and `radius` (corner radius, default 8). |
| `Tour.Title` | `h2` | Shows the step's `title` unless given children. Labels the card (`aria-labelledby`). |
| `Tour.Description` | `p` | Shows the step's `description` unless given children. Describes the card (`aria-describedby`). |
| `Tour.Progress` | `span` | Shows `1 / 4` unless given children. |
| `Tour.Next` | `button` | Goes to the next step. On the last step, closes the tour. |
| `Tour.Previous` | `button` | Goes to the previous step. On the first step it gets `aria-disabled` and `data-disabled`, does nothing on click and stays focusable (it is not `disabled`). |
| `Tour.Close` | `button` | Closes the tour. |

Every part forwards its ref and accepts `asChild`. Event handlers run before the built-in behavior, and calling `event.preventDefault()` in `onClick` cancels it.

### `useTour()`

Returns `{ steps, step, index, isFirst, isLast, next, previous, close }`. It throws if called outside `Tour.Root`.

## Behavior

- The page stays interactive while the tour is open. Clicking outside the card does not close it.
- Each step scrolls its target into view.
- `Tour.Content` stays mounted while the tour is open and fades out on close, so it unmounts shortly after `open` becomes `false`.
- The spotlight is hidden from assistive technology (`aria-hidden`).

## Keyboard and screen readers

The card is a non-modal dialog. Focus is not trapped, so <kbd>Tab</kbd> can leave it, and the page stays usable.

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Move through the card's controls in DOM order. The card renders in a portal at the end of `<body>`, so Tab from the last control continues into the browser UI and Shift+Tab from the first control goes back to the page. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activate the focused `Tour.Next`, `Tour.Previous` or `Tour.Close` (they are native buttons). |
| <kbd>Esc</kbd> | Close the tour. |
| <kbd>→</kbd> / <kbd>←</kbd> | Next and previous step, from anywhere on the page. |
| <kbd>Home</kbd> / <kbd>End</kbd> | First and last step, while focus is inside the card. |
| <kbd>F6</kbd> | Return focus to the card from anywhere on the page. |

<kbd>→</kbd> and <kbd>←</kbd> work wherever focus is, so clicking the page or tabbing out of the card does not stop them. <kbd>Home</kbd> and <kbd>End</kbd> only work while focus is inside the card, because elsewhere they scroll the page. They do nothing when there is no step in that direction (the last step for <kbd>→</kbd> and <kbd>End</kbd>, the first for <kbd>←</kbd> and <kbd>Home</kbd>), so they never close the tour; use `Tour.Next` or <kbd>Esc</kbd> for that. They are ignored with a modifier key held, in inputs, textareas, selects and editable content, inside widgets that use the arrow keys themselves (`role` of `menu`, `menubar`, `listbox`, `tablist`, `slider`, `radiogroup`, `tree`, `grid`, `combobox`, `spinbutton` or `textbox`), and when your `onKeyDown` on `Tour.Content` calls `event.preventDefault()`. <kbd>F6</kbd> is the "next pane" key in most desktop apps; it works with no modifier and is skipped if another handler already called `preventDefault()` on it.

Focus:

- When the tour opens, focus moves to the card (`Tour.Content`, which has `tabindex="-1"`), so a screen reader reads its name and description and <kbd>Home</kbd> and <kbd>End</kbd> work straight away.
- On a step change focus stays where it is: if the user pressed `Tour.Next`, they stay on `Tour.Next`. If the focused element disappears with the step, focus moves to the card.
- To keep focus where it was when the tour opens, call `event.preventDefault()` in `onOpenAutoFocus` on `Tour.Content`. Focus then stays on the opener, and <kbd>F6</kbd> still brings the user into the card:

  ```tsx
  <Tour.Content onOpenAutoFocus={(event) => event.preventDefault()}>
  ```

- When the tour closes, by <kbd>Esc</kbd>, `Tour.Close` or finishing the last step, focus returns to the element that was focused when it opened (usually your "Start tour" button). If that element is no longer in the page, for example a menu item whose menu has closed, focus is left alone and falls back to the page.

Screen readers:

- `Tour.Content` is `role="dialog"`, labelled by `Tour.Title` and described by `Tour.Description` through `aria-labelledby` and `aria-describedby`. Give the card a `Tour.Title`; without one it has no accessible name.
- A visually hidden live region (`role="status"`, `aria-live="polite"`) inside `Tour.Content` announces "Step 2 of 4: Find an order fast" when a step shows. The text is English.
- The current target gets `aria-describedby` pointing at the card, added to any value it already has and removed when the step changes or the tour closes.
- Keep a visible focus style on your buttons. The spotlight is not a hit target and sits below the card, and its cut-out leaves `padding` px around the target, so an outline up to that size on the target stays uncovered.

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