"use client";

import { ArrowUp, Check, Plus } from "lucide-react";
import { THEME_KEYS, THEMES } from "../constants/themes";
import type { PartKey } from "../contexts/playground-context";
import { usePlayground } from "../hooks/use-playground";
import { Chip } from "./chip";
import { CodeBlock } from "./code-block";
import { ComposePreview } from "./compose-preview";

const PART_LABELS: Record<PartKey, string> = {
  arrow: "Arrow",
  close: "Close",
  progress: "Progress",
  back: "Previous",
};

const PART_KEYS = Object.keys(PART_LABELS) as PartKey[];

export function ComposeSection() {
  const { themeKey, theme, setTheme, parts, togglePart, startTour } = usePlayground();

  const code = [
    theme.contentClass ? `<Tour.Content ${theme.contentClass}>` : "<Tour.Content>",
    parts.arrow && `  <Tour.Arrow${theme.arrowClass} />`,
    parts.close && '  <Tour.Close aria-label="Close tour" />',
    "  <Tour.Title />",
    "  <Tour.Description />",
    parts.progress && "  <Tour.Progress />",
    parts.back && "  <Tour.Previous>Back</Tour.Previous>",
    "  <Tour.Next>Next</Tour.Next>",
    "</Tour.Content>",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <section className="section">
      <h2>Compose the card</h2>

      <p>
        The library ships no CSS for the card. Render only the parts you need, style them with{" "}
        <code>className</code>, or hand behavior to your own components with <code>asChild</code>.
      </p>

      <div className="chip-row">
        {THEME_KEYS.map((key) => (
          <Chip key={key} active={themeKey === key} onClick={() => setTheme(key)}>
            {THEMES[key].label}
          </Chip>
        ))}
      </div>

      <div className="chip-row">
        {PART_KEYS.map((key) => (
          <Chip key={key} mono active={parts[key]} onClick={() => togglePart(key)}>
            {parts[key] ? (
              <Check size={12} strokeWidth={2.25} aria-hidden />
            ) : (
              <Plus size={12} strokeWidth={2.25} aria-hidden />
            )}
            {PART_LABELS[key]}
          </Chip>
        ))}
      </div>

      <div className="stage stage-dots stage-center" style={{ height: 230 }}>
        <ComposePreview />

        <button type="button" className="run-above" onClick={startTour}>
          Run it on the demo
          <ArrowUp size={13} strokeWidth={2} aria-hidden />
        </button>
      </div>

      <CodeBlock small code={code} />
    </section>
  );
}
