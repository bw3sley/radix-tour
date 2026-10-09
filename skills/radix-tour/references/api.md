# radix-tour API reference

All exports come from `radix-tour`. Every part has a long name (`TourContent`) and a short alias (`Content`).

## `Tour.Root` (`Tour`)

| Prop | Type | Description |
| --- | --- | --- |
| `steps` | `TourStep[]` | The steps, in order. |
| `open` | `boolean` | Whether the tour is showing. Opening always starts at the first step. |
| `onOpenChange` | `(open: boolean) => void` | Called with `false` when the last step is finished, or on `Tour.Close` or Esc. |
| `children` | `ReactNode` | The parts. Renders nothing while closed, so children unmount on close. |

## `TourStep`

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique id for the step. |
| `target` | `string` | CSS selector of the element to point at. |
| `title` | `ReactNode` | Rendered by `Tour.Title` when it has no children. |
| `description` | `ReactNode` | Rendered by `Tour.Description` when it has no children. |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | Side of the target the card sits on. Default `"bottom"`. |
| `align` | `"start" \| "center" \| "end"` | Alignment along that side. Default `"center"`. |

## Parts

| Part | Renders | Notes |
| --- | --- | --- |
| `Tour.Content` | Radix Popover content | Anchored to the current target. Accepts Popover content props (`side`, `sideOffset` default 14, `collisionPadding` default 12, ...) which override the step. Renders nothing until the target exists. Rendered in a portal. |
| `Tour.Arrow` | Radix Popover arrow | Place inside `Tour.Content`. Colour with `fill-*`. |
| `Tour.Spotlight` | `svg` | Props: `padding` (px around the target, default 8), `radius` (corner radius, default 8). Fixed, full-viewport, `pointer-events: none`, `aria-hidden`. Colour with `text-*`. Sibling of `Tour.Content`, can be omitted. |
| `Tour.Title` | `h2` | Shows `step.title` unless given children. |
| `Tour.Description` | `p` | Shows `step.description` unless given children. |
| `Tour.Progress` | `span` | Shows `1 / 4` unless given children. |
| `Tour.Next` | `button` | Next step. On the last step, closes the tour. |
| `Tour.Previous` | `button` | Previous step. Does nothing on the first step. |
| `Tour.Close` | `button` | Closes the tour. Give it an `aria-label` if it has no visible text. |

Every part forwards its ref and accepts `asChild`. Handlers you pass run before the built-in behaviour, and `event.preventDefault()` in `onClick` cancels it.

## `useTour()`

Returns `{ steps, step, index, isFirst, isLast, next, previous, close }`. `index` is zero-based, `next`/`previous`/`close` are the same actions the buttons run. Throws outside `Tour.Root`.

## Data attributes

| Part | Attributes |
| --- | --- |
| `Tour.Content` | `data-step` (zero-based index), `data-side`, `data-align`, `data-state` |
| `Tour.Spotlight` | `data-tour-spotlight` on the overlay, `data-tour-cutout` on the cut-out rect |

## Behaviour

- The page stays interactive. Clicking outside the card does not close it.
- Esc closes the tour.
- ArrowRight / ArrowLeft change step only while focus is inside the card. They never close the tour, are ignored on the last / first step, with a modifier key, inside inputs, textareas, selects and editable content, and when your `onKeyDown` on `Tour.Content` calls `preventDefault()`.
- On close, focus returns to the element that was focused when the tour opened (if still in the page).
- Each step scrolls its target into view (`block: "center"`, smooth) and the card and spotlight follow it on scroll and resize.
- The card is a Radix Popover, exposed to assistive technology as a dialog.

## Types

`TourProps`, `TourStep`, `TourContentProps`, `TourArrowProps`, `TourSpotlightProps`, `TourTitleProps`, `TourDescriptionProps`, `TourProgressProps`, `TourNextProps`, `TourPreviousProps`, `TourCloseProps`. Also exported: `createTourScope` (Radix context scoping, rarely needed).
