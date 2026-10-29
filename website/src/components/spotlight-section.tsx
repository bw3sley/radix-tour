"use client";

import * as React from "react";
import {
  SETTINGS_ROWS,
  SPOTLIGHT_PRESET_KEYS,
  SPOTLIGHT_PRESETS,
  type SpotlightPresetKey,
} from "../constants/spotlight-presets";
import { Chip } from "./chip";
import { CodeBlock } from "./code-block";
import { PreviewArrow } from "./preview-arrow";
import { Section } from "./section";

export function SpotlightSection() {
  const [preset, setPreset] = React.useState<SpotlightPresetKey>("default");

  const current = SPOTLIGHT_PRESETS[preset];
  const rowTop = 24 + 6 + 88;
  const cardTop = rowTop + 44 + current.pad + 12;

  return (
    <Section title="Spotlight">
      <p>
        The overlay is its own part. It's colored with <code>currentColor</code>, never blocks
        clicks, and you can leave it out entirely.
      </p>

      <div className="flex flex-wrap gap-1.5">
        {SPOTLIGHT_PRESET_KEYS.map((key) => (
          <Chip key={key} active={preset === key} onClick={() => setPreset(key)}>
            {SPOTLIGHT_PRESETS[key].label}
          </Chip>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl">
        <div className="relative h-80 min-w-150 overflow-hidden rounded-xl border bg-muted">
          <div className="absolute top-6 left-1/2 flex w-85 -translate-x-1/2 flex-col rounded-xl border bg-card py-1.5 text-sm">
            {SETTINGS_ROWS.map(([label, value]) => (
              <div
                key={label}
                className="flex h-11 items-center justify-between px-4 not-first:border-t"
              >
                <span>{label}</span>

                {value ? (
                  <span className="text-muted-foreground">{value}</span>
                ) : (
                  <span className="relative h-4.5 w-8 rounded-full bg-accent">
                    <span className="absolute top-0.5 right-0.5 size-3.5 rounded-full bg-card" />
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Computed geometry, so the position stays inline. */}
          <div
            className="pointer-events-none absolute transition-all duration-300 ease-snappy"
            style={{
              left: `calc(50% - 170px - ${current.pad}px)`,
              top: rowTop - current.pad,
              width: 340 + current.pad * 2,
              height: 44 + current.pad * 2,
              borderRadius: current.radius,
              boxShadow: `0 0 0 9999px color-mix(in oklab, var(--foreground) ${current.dim * 100}%, transparent)`,
            }}
          />

          <div
            className="absolute left-1/2 w-62 -translate-x-1/2 rounded-2xl bg-popover px-3.5 py-3 text-left text-popover-foreground shadow-xl transition-all duration-300 ease-snappy"
            style={{ top: cardTop }}
          >
            <PreviewArrow top={-6} left={119} />

            <div className="relative text-sm leading-5 font-semibold">Keep customers posted</div>
            <div className="relative mt-0.5 text-sm leading-5 text-popover-muted">
              They get a text when the order is ready.
            </div>
          </div>
        </div>
      </div>

      <CodeBlock small code={current.code} />
    </Section>
  );
}
