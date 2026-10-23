---
"radix-tour": minor
---

Add step-transition motion, on by default and with no stylesheet to import. `Tour.Content` now stays mounted across steps and the card glides between targets (transform only). It scales in from 0.96 and fades on open, and fades out on close. The spotlight cut-out follows with the same duration and ease, and the title and description fade in on each step. Tune it with the `--tour-duration` and `--tour-ease` CSS variables, turn it off with `<Tour.Root motion={false}>`, and style it with the new `data-state` (`open` or `closed`) and `data-motion` (`from-start` or `from-end`) attributes on `Tour.Content`. `prefers-reduced-motion` removes movement and keeps a short opacity fade. `Tour.Root` now stays rendered while closed so the card can fade out; do not unmount `Tour.Content` yourself between steps. The spotlight CSS recipe from the docs is no longer needed.
