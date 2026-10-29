"use client";

import { X } from "lucide-react";
import * as Tour from "radix-tour";

interface DemoCardProps {
  bare?: boolean;
  keyed?: boolean;
  preventAutoFocus?: boolean;
  preventKeyDown?: boolean;
}

export function DemoCard({ bare, keyed, preventAutoFocus, preventKeyDown }: DemoCardProps) {
  const { step, isFirst, isLast } = Tour.useTour();

  return (
    <Tour.Content
      data-testid="card"
      onKeyDown={preventKeyDown ? (event) => event.preventDefault() : undefined}
      onOpenAutoFocus={preventAutoFocus ? (event) => event.preventDefault() : undefined}
    >
      {bare ? null : (
        <>
          <Tour.Title />
          <Tour.Description />
        </>
      )}

      <p data-testid="position">{`${isFirst ? "first" : "later"} ${isLast ? "last" : "more"}`}</p>

      <Tour.Progress />
      <Tour.Previous>Back</Tour.Previous>
      <Tour.Next key={keyed ? step.id : undefined}>Next</Tour.Next>

      <Tour.Close aria-label="Close tour">
        <X />
      </Tour.Close>

      <input aria-label="Note" />
    </Tour.Content>
  );
}
