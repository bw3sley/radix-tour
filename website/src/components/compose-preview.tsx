"use client";

import { X } from "lucide-react";
import { usePlayground } from "../hooks/use-playground";
import { themeVars } from "../lib/theme-styles";

export function ComposePreview() {
  const { theme, parts } = usePlayground();

  return (
    <div className="card compose-card" style={themeVars(theme)}>
      {parts.arrow ? (
        <div
          className="arrow-square"
          style={{ top: -6, left: 30, borderTop: theme.line, borderLeft: theme.line }}
        />
      ) : null}

      <div className="card-head">
        <div className="card-title">Filter by status</div>

        {parts.close ? (
          <span className="card-close">
            <X size={15} strokeWidth={1.75} aria-hidden />
          </span>
        ) : null}
      </div>

      <p className="card-desc">Jump between what's baking, ready and delivered.</p>

      <div className="card-foot">
        {parts.progress ? <span className="card-progress">3 / 4</span> : <span />}

        <div className="card-actions">
          {parts.back ? <span className="card-back">Back</span> : null}
          <span className="card-next">Next</span>
        </div>
      </div>
    </div>
  );
}
