"use client";

import { X } from "lucide-react";
import { usePlayground } from "../hooks/use-playground";
import { PreviewArrow } from "./preview-arrow";

export function ComposePreview() {
  const { parts } = usePlayground();

  return (
    <div className="relative w-68 rounded-2xl bg-popover px-4 pt-4 pb-3.5 text-left text-popover-foreground shadow-xl">
      {parts.arrow ? <PreviewArrow top={-6} left={30} /> : null}

      <div className="relative flex items-start justify-between gap-3">
        <div className="text-base leading-snug font-semibold tracking-tight">Filter by status</div>

        {parts.close ? (
          <span className="-mt-px -mr-1 grid size-6 shrink-0 place-items-center text-popover-muted">
            <X size={15} strokeWidth={1.75} aria-hidden />
          </span>
        ) : null}
      </div>

      <p className="relative mt-1 text-sm leading-normal text-pretty text-popover-muted">
        Jump between what's baking, ready and delivered.
      </p>

      <div className="relative mt-3.5 flex items-center justify-between gap-2">
        {parts.progress ? (
          <span className="font-mono text-xs font-medium text-popover-muted">3 / 4</span>
        ) : (
          <span />
        )}

        <div className="ml-auto flex gap-1.5">
          {parts.back ? (
            <span className="flex h-8 items-center rounded-md border border-popover-foreground/20 px-3 text-sm font-medium">
              Back
            </span>
          ) : null}

          <span className="flex h-8 items-center rounded-md bg-popover-foreground px-3 text-sm font-medium text-popover">
            Next
          </span>
        </div>
      </div>
    </div>
  );
}
