"use client";

import { Plus } from "lucide-react";
import * as React from "react";
import { usePlayground } from "../hooks/use-playground";
import { arrowBorders, themeVars } from "../lib/theme-styles";
import { Chip } from "./chip";
import { CodeBlock } from "./code-block";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

const SIDES: Side[] = ["top", "right", "bottom", "left"];
const ALIGNS: Align[] = ["start", "center", "end"];

// Stage geometry: target 120×34 centered at top 133, card 210×104.
const TARGET = { w: 120, h: 34, top: 133 };
const CARD = { w: 210, h: 104 };
const GAP = 12;

export function Placement() {
  const { theme } = usePlayground();
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
    <section className="section">
      <h2>Placement</h2>

      <p>
        Every step picks its own <code>side</code> and <code>align</code>. Radix handles collisions,
        so the card flips when it runs out of room.
      </p>

      <div className="chip-row">
        {SIDES.map((value) => (
          <Chip key={value} active={side === value} onClick={() => setSide(value)}>
            {value}
          </Chip>
        ))}

        <div className="chip-sep" />

        {ALIGNS.map((value) => (
          <Chip key={value} active={align === value} onClick={() => setAlign(value)}>
            {value}
          </Chip>
        ))}
      </div>

      <div className="stage-scroll">
        <div className="stage stage-dots" style={{ height: 300 }}>
          <div className="stage-target">
            <Plus size={15} strokeWidth={2} aria-hidden />
            New order
          </div>

          <div
            className="card stage-card"
            style={{ ...themeVars(theme), width: CARD.w, height: CARD.h, top, left }}
          >
            <div
              className="arrow-square"
              style={{ top: arrowTop, left: arrowLeft, ...arrowBorders(side, theme.line) }}
            />

            <div className="stage-card-title">Add an order</div>
            <div className="stage-card-desc">Standing orders repeat weekly.</div>

            <div className="stage-card-foot">
              <span className="card-progress">4 / 4</span>
              <span className="card-next stage-done">Done</span>
            </div>
          </div>
        </div>
      </div>

      <CodeBlock small code={code} />
    </section>
  );
}
