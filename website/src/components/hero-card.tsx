"use client";

import { X } from "lucide-react";
import * as Tour from "radix-tour";
import { usePlayground } from "../hooks/use-playground";

export function HeroCard() {
  const { parts } = usePlayground();
  const { isFirst, isLast } = Tour.useTour();

  return (
    <Tour.Content
      className="z-50 w-68 rounded-2xl bg-popover px-4 pt-4 pb-3.5 text-left text-popover-foreground shadow-xl"
      collisionPadding={12}
    >
      {parts.arrow ? <Tour.Arrow className="fill-popover" width={12} height={6} /> : null}

      <div className="flex items-start justify-between gap-3">
        <Tour.Title className="text-base leading-snug font-semibold tracking-tight" />

        {parts.close ? (
          <Tour.Close
            className="-mt-px -mr-1 grid size-6 shrink-0 cursor-pointer place-items-center rounded-md text-popover-muted"
            aria-label="Close tour"
          >
            <X size={15} strokeWidth={1.75} aria-hidden />
          </Tour.Close>
        ) : null}
      </div>

      <Tour.Description className="mt-1 text-sm leading-normal text-pretty text-popover-muted" />

      <div className="mt-3.5 flex items-center justify-between gap-2">
        {parts.progress ? (
          <Tour.Progress className="font-mono text-xs font-medium text-popover-muted" />
        ) : (
          <span />
        )}

        <div className="ml-auto flex gap-1.5">
          {parts.back && !isFirst ? (
            <Tour.Previous className="h-8 cursor-pointer rounded-md border border-popover-foreground/20 px-3 text-sm font-medium">
              Back
            </Tour.Previous>
          ) : null}

          <Tour.Next className="h-8 cursor-pointer rounded-md bg-popover-foreground px-3 text-sm font-medium text-popover">
            {isLast ? "Done" : "Next"}
          </Tour.Next>
        </div>
      </div>
    </Tour.Content>
  );
}
