"use client";

import { X } from "lucide-react";
import * as React from "react";
import * as Tour from "radix-tour";

const steps: Tour.TourStep[] = [
  { id: "first", target: "#first", title: "First", description: "First step." },
  { id: "second", target: "#second", title: "Second", description: "Second step." },
  { id: "third", target: "#third", title: "Third", description: "Third step." },
];

function TourDemo({ motion }: { motion?: boolean }) {
  const [open, setOpen] = React.useState(false);

  return (
    <main>
      <button type="button" data-testid="start" onClick={() => setOpen(true)}>
        Start tour
      </button>

      <button type="button" id="first">
        first target
      </button>

      <button type="button" id="second">
        second target
      </button>

      <button type="button" id="third">
        third target
      </button>

      <Tour.Root steps={steps} open={open} onOpenChange={setOpen} motion={motion}>
        <Tour.Spotlight />

        <Tour.Content data-testid="card">
          <Tour.Title />
          <Tour.Description />
          <Tour.Progress />
          <Tour.Previous>Back</Tour.Previous>
          <Tour.Next>Next</Tour.Next>
          <Tour.Close aria-label="Close tour">
            <X />
          </Tour.Close>
        </Tour.Content>
      </Tour.Root>
    </main>
  );
}

export { TourDemo };
