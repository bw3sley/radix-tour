"use client";

import * as Tour from "radix-tour";
import * as React from "react";
import { LATE_STEPS, PLACEMENT_STEPS, STEPS } from "../constants/demo-steps";
import { DemoCard } from "./demo-card";
import { LateTarget } from "./late-target";
import { PageExtras } from "./page-extras";

export interface TourDemoProps {
  motion?: boolean;
  opener?: "keep" | "remove-on-close" | "unmount-on-open";
  scenario?: "default" | "placement" | "late";
  bare?: boolean;
  keyed?: boolean;
  hideSecond?: boolean;
  preventAutoFocus?: boolean;
  preventKeyDown?: boolean;
}

export function TourDemo({
  motion,
  opener = "keep",
  scenario = "default",
  bare,
  keyed,
  hideSecond,
  preventAutoFocus,
  preventKeyDown,
}: TourDemoProps) {
  const [open, setOpen] = React.useState(false);
  const [showOpener, setShowOpener] = React.useState(true);
  const [showSecond, setShowSecond] = React.useState(!hideSecond);

  const steps = { default: STEPS, placement: PLACEMENT_STEPS, late: LATE_STEPS }[scenario];

  function handleOpenChange(next: boolean) {
    if (!next && opener === "remove-on-close") {
      setShowOpener(false);
    }

    setOpen(next);
  }

  return (
    <main>
      {showOpener ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);

            if (opener === "unmount-on-open") {
              setShowOpener(false);
            }
          }}
        >
          Start tour
        </button>
      ) : null}

      <button type="button" id="first" aria-describedby="existing-hint">
        first target
      </button>

      {showSecond ? (
        <button type="button" id="second">
          second target
        </button>
      ) : null}

      {hideSecond ? (
        <button type="button" onClick={() => setShowSecond(true)}>
          Show target
        </button>
      ) : null}

      {scenario === "late" ? <LateTarget delay={600} /> : null}

      <PageExtras />

      <Tour.Root steps={steps} open={open} onOpenChange={handleOpenChange} motion={motion}>
        <Tour.Spotlight data-testid="spotlight" />

        <DemoCard
          bare={bare}
          keyed={keyed}
          preventAutoFocus={preventAutoFocus}
          preventKeyDown={preventKeyDown}
        />
      </Tour.Root>
    </main>
  );
}
