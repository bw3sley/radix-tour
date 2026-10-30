"use client";

import { GitFork, Play } from "lucide-react";
import * as Tour from "radix-tour";
import * as React from "react";
import { HERO_STEPS } from "../constants/hero-steps";
import { usePlayground } from "../hooks/use-playground";
import { DemoDashboard } from "./demo-dashboard";
import { HeroCard } from "./hero-card";

const BUTTON =
  "inline-flex h-10 items-center gap-2 rounded-lg border pr-4 pl-3.5 text-sm font-medium";

export function HeroDemo() {
  const [open, setOpen] = React.useState(false);
  const { registerStart } = usePlayground();

  React.useEffect(() => {
    registerStart(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setOpen(false);
      requestAnimationFrame(() => setOpen(true));
    });

    return () => registerStart(null);
  }, [registerStart]);

  return (
    <>
      <div className="mt-2.5 flex gap-2">
        <button
          type="button"
          className={`${BUTTON} cursor-pointer border-primary bg-primary text-primary-foreground hover:bg-primary/90`}
          onClick={() => setOpen(true)}
        >
          <Play size={14} strokeWidth={2} aria-hidden />
          {open ? "Restart tour" : "Start tour"}
        </button>

        <a
          className={`${BUTTON} bg-card shadow-xs hover:border-ring`}
          href="https://github.com/bw3sley/radix-tour"
          target="_blank"
          rel="noreferrer"
        >
          <GitFork size={15} strokeWidth={1.75} aria-hidden />
          GitHub
        </a>
      </div>

      <DemoDashboard />

      <div
        className="h-4 font-mono text-xs text-subtle-foreground opacity-0 transition-opacity duration-300 data-visible:opacity-100"
        data-visible={open ? "" : undefined}
      >
        ← → to move · Esc to close
      </div>

      <Tour.Root steps={HERO_STEPS} open={open} onOpenChange={setOpen}>
        <Tour.Spotlight padding={6} radius={9} className="z-40 text-foreground/45" />

        <HeroCard />
      </Tour.Root>
    </>
  );
}
