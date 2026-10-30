"use client";

import { Plus } from "lucide-react";
import * as React from "react";
import { Chip } from "./chip";
import { CodeBlock } from "./code-block";
import { PreviewArrow } from "./preview-arrow";
import { Section } from "./section";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

const SIDES: Side[] = ["top", "right", "bottom", "left"];
const ALIGNS: Align[] = ["start", "center", "end"];

// Stage geometry: the target is w-30 h-8.5 top-38 (120×34 at 152); the card is 210×122.
const TARGET = { w: 120, h: 34, top: 152 };
const CARD = { w: 210, h: 122 };
const GAP = 12;

export function Placement() {
  const [side, setSide] = React.useState<Side>("bottom");
  const [align, setAlign] = React.useState<Align>("center");

  function offset(length: number, size: number) {
    if (align === "start") {
      return 0;
    }

    if (align === "end") {
      return length - size;
    }

    return (length - size) / 2;
  }

  let top: string;
  let left: string;
  let arrowTop: number;
  let arrowLeft: number;

  if (side === "bottom" || side === "top") {
    top = `${side === "bottom" ? TARGET.top + TARGET.h + GAP : TARGET.top - GAP - CARD.h}px`;
    left = `calc(50% - ${TARGET.w / 2 - offset(TARGET.w, CARD.w)}px)`;
    arrowLeft = TARGET.w / 2 - offset(TARGET.w, CARD.w) - 5;
    arrowTop = side === "bottom" ? -6 : CARD.h - 6;
  } else {
    left =
      side === "right"
        ? `calc(50% + ${TARGET.w / 2 + GAP}px)`
        : `calc(50% - ${TARGET.w / 2 + GAP + CARD.w}px)`;
    top = `${TARGET.top + offset(TARGET.h, CARD.h)}px`;
    arrowTop = TARGET.h / 2 - offset(TARGET.h, CARD.h) - 5;
    arrowLeft = side === "right" ? -6 : CARD.w - 6;
  }

  const code = `{\n  id: "new-order",\n  target: "#new-order",\n  side: "${side}",\n  align: "${align}",\n}`;

  return (
    <Section title="Placement">
      <p className="text-base leading-relaxed text-pretty text-muted-foreground">
        Every step picks its own <code className="font-mono text-sm text-foreground">side</code> and{" "}
        <code className="font-mono text-sm text-foreground">align</code>. Radix handles collisions,
        so the card flips when it runs out of room.
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        {SIDES.map((value) => (
          <Chip key={value} active={side === value} onClick={() => setSide(value)}>
            {value}
          </Chip>
        ))}

        <div className="mx-1 h-5 w-px bg-border" />

        {ALIGNS.map((value) => (
          <Chip key={value} active={align === value} onClick={() => setAlign(value)}>
            {value}
          </Chip>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl">
        <div className="relative h-85 min-w-150 overflow-hidden rounded-xl border bg-card bg-dots">
          <div className="absolute top-38 left-1/2 flex h-8.5 w-30 -translate-x-1/2 items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-medium text-primary-foreground">
            <Plus size={15} strokeWidth={2} aria-hidden />
            New order
          </div>

          <PreviewArrow
            top={`calc(${top} + ${arrowTop}px)`}
            left={`calc(${left} + ${arrowLeft}px)`}
          />

          <div
            className="absolute rounded-2xl bg-popover px-3.5 py-3 text-left text-popover-foreground shadow-xl transition-all duration-400 ease-snappy"
            style={{ width: CARD.w, height: CARD.h, top, left }}
          >
            <div className="relative text-sm leading-5 font-semibold">Add an order</div>
            <div className="relative mt-0.5 text-sm leading-5 text-popover-muted">
              Standing orders repeat every week.
            </div>

            <div className="relative mt-2.5 flex items-center justify-between">
              <span className="font-mono text-xs font-medium text-popover-muted">4 / 4</span>
              <span className="flex h-6.5 items-center rounded-md bg-popover-foreground px-2.5 text-xs font-medium text-popover">
                Done
              </span>
            </div>
          </div>
        </div>
      </div>

      <CodeBlock small code={code} />
    </Section>
  );
}
