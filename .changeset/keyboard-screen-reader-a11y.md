---
"radix-tour": minor
---

Improve keyboard and screen reader accessibility: focus moves into the card on open (opt out with `onOpenAutoFocus`), F6 returns to it, the arrow keys change step from anywhere on the page (except in inputs and widgets that use arrows), Home/End jump to the first and last step while focus is in the card, `Tour.Content` renders a live region announcing "Step N of M: title" and gets `aria-labelledby`/`aria-describedby` from `Tour.Title` and `Tour.Description`, the active target gets `aria-describedby` pointing at the card, and `Tour.Previous` on the first step uses `aria-disabled` and `data-disabled` instead of staying a live no-op.
