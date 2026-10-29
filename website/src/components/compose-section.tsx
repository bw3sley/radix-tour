"use client";

import { ArrowUp, Check, Plus } from "lucide-react";
import type { PartKey } from "../contexts/playground-context";
import { usePlayground } from "../hooks/use-playground";
import { Chip } from "./chip";
import { CodeBlock } from "./code-block";
import { ComposePreview } from "./compose-preview";
import { Section } from "./section";

const PART_LABELS: Record<PartKey, string> = {
  arrow: "Arrow",
  close: "Close",
  progress: "Progress",
  back: "Previous",
};

const PART_KEYS = Object.keys(PART_LABELS) as PartKey[];

export function ComposeSection() {
  const { parts, togglePart, startTour } = usePlayground();

  const code = [
    '<Tour.Content className="w-72 rounded-2xl bg-zinc-900 p-4 text-zinc-50 shadow-xl">',
    parts.arrow && '  <Tour.Arrow className="fill-zinc-900" />',
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
    <Section title="Compose the card">
      <p className="text-base leading-relaxed text-pretty text-muted-foreground">
        The library ships no CSS for the card. Render only the parts you need, style them with{" "}
        <code className="font-mono text-sm text-foreground">className</code>, or hand behavior to
        your own components with <code className="font-mono text-sm text-foreground">asChild</code>.
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
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

      <div className="relative grid h-58 place-items-center overflow-hidden rounded-xl border bg-card bg-dots">
        <ComposePreview />

        <button
          type="button"
          className="absolute right-2.5 bottom-2.5 flex h-7 cursor-pointer items-center gap-1.5 rounded-md border bg-card px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={startTour}
        >
          Run it on the demo
          <ArrowUp size={13} strokeWidth={2} aria-hidden />
        </button>
      </div>

      <CodeBlock small code={code} />
    </Section>
  );
}
