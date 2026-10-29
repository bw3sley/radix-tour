"use client";

import * as React from "react";
import {
  SETTINGS_ROWS,
  SPOTLIGHT_PRESET_KEYS,
  SPOTLIGHT_PRESETS,
  type SpotlightPresetKey,
} from "../constants/spotlight-presets";
import { usePlayground } from "../hooks/use-playground";
import { themeVars } from "../lib/theme-styles";
import { Chip } from "./chip";
import { CodeBlock } from "./code-block";

export function SpotlightSection() {
  const { theme } = usePlayground();
  const [preset, setPreset] = React.useState<SpotlightPresetKey>("default");

  const current = SPOTLIGHT_PRESETS[preset];
  const rowTop = 24 + 6 + 88;
  const cardTop = rowTop + 44 + current.pad + 12;

  return (
    <section className="section">
      <h2>Spotlight</h2>

      <p>
        The overlay is its own part. It's colored with <code>currentColor</code>, never blocks
        clicks, and you can leave it out entirely.
      </p>

      <div className="chip-row">
        {SPOTLIGHT_PRESET_KEYS.map((key) => (
          <Chip key={key} active={preset === key} onClick={() => setPreset(key)}>
            {SPOTLIGHT_PRESETS[key].label}
          </Chip>
        ))}
      </div>

      <div className="stage-scroll">
        <div className="stage stage-plain" style={{ height: 320 }}>
          <div className="settings-list">
            {SETTINGS_ROWS.map(([label, value]) => (
              <div key={label} className="settings-row">
                <span>{label}</span>

                {value ? (
                  <span className="demo-muted">{value}</span>
                ) : (
                  <span className="toggle">
                    <span />
                  </span>
                )}
              </div>
            ))}
          </div>

          <div
            className="spot-cutout"
            style={{
              left: `calc(50% - 170px - ${current.pad}px)`,
              top: rowTop - current.pad,
              width: 340 + current.pad * 2,
              height: 44 + current.pad * 2,
              borderRadius: current.radius,
              boxShadow: `0 0 0 9999px rgba(15,15,20,${current.dim})`,
            }}
          />

          <div className="card spot-card" style={{ ...themeVars(theme), top: cardTop }}>
            <div
              className="arrow-square"
              style={{ top: -6, left: 119, borderTop: theme.line, borderLeft: theme.line }}
            />

            <div className="stage-card-title">Keep customers posted</div>
            <div className="stage-card-desc">They get a text when the order is ready.</div>
          </div>
        </div>
      </div>

      <CodeBlock small code={current.code} />
    </section>
  );
}
