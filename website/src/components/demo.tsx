"use client";

import * as Tour from "radix-tour";
import * as React from "react";

const steps: Tour.TourStep[] = [
  {
    id: "title",
    target: "#demo-title",
    title: "A step",
    description: "Each step points at an element.",
  },
  {
    id: "button",
    target: "#demo-start",
    title: "Another step",
    description: "Navigate with the buttons or the arrow keys.",
  },
];

function Demo() {
  const [open, setOpen] = React.useState(false);

  return (
    <section>
      <h2 id="demo-title">Demo</h2>

      <button type="button" id="demo-start" onClick={() => setOpen(true)}>
        Start tour
      </button>

      <Tour.Root steps={steps} open={open} onOpenChange={setOpen}>
        <Tour.Spotlight />

        <Tour.Content>
          <Tour.Title />
          <Tour.Description />
          <Tour.Progress />
          <Tour.Previous>Back</Tour.Previous>
          <Tour.Next>Next</Tour.Next>
        </Tour.Content>
      </Tour.Root>
    </section>
  );
}

export { Demo };
