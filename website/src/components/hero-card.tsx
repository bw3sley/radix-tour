"use client";

import { X } from "lucide-react";
import * as Tour from "radix-tour";
import { usePlayground } from "../hooks/use-playground";
import { themeVars } from "../lib/theme-styles";

export function HeroCard() {
  const { theme, parts } = usePlayground();
  const { isFirst, isLast } = Tour.useTour();

  return (
    <Tour.Content
      className="card hero-card"
      style={{ ...themeVars(theme), zIndex: 50 }}
      collisionPadding={12}
    >
      {parts.arrow ? <Tour.Arrow className="hero-arrow" width={12} height={6} /> : null}

      <div className="card-head">
        <Tour.Title className="card-title" />

        {parts.close ? (
          <Tour.Close className="card-close" aria-label="Close tour">
            <X size={15} strokeWidth={1.75} aria-hidden />
          </Tour.Close>
        ) : null}
      </div>

      <Tour.Description className="card-desc" />

      <div className="card-foot">
        {parts.progress ? <Tour.Progress className="card-progress" /> : <span />}

        <div className="card-actions">
          {parts.back && !isFirst ? (
            <Tour.Previous className="card-back">Back</Tour.Previous>
          ) : null}

          <Tour.Next className="card-next">{isLast ? "Done" : "Next"}</Tour.Next>
        </div>
      </div>
    </Tour.Content>
  );
}
