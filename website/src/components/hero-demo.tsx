"use client";

import { GitFork, Play } from "lucide-react";
import * as Tour from "radix-tour";
import * as React from "react";
import { HERO_STEPS } from "../constants/hero-steps";
import { usePlayground } from "../hooks/use-playground";
import { DemoDashboard } from "./demo-dashboard";
import { HeroCard } from "./hero-card";

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
      <div className="hero-actions">
        <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
          <Play size={14} strokeWidth={2} aria-hidden />
          {open ? "Restart tour" : "Start tour"}
        </button>

        <a
          className="btn btn-secondary"
          href="https://github.com/bw3sley/radix-tour"
          target="_blank"
          rel="noreferrer"
        >
          <GitFork size={15} strokeWidth={1.75} aria-hidden />
          GitHub
        </a>
      </div>

      <DemoDashboard />

      <div className="hint" data-visible={open ? "" : undefined}>
        ← → to move · Esc to close
      </div>

      <Tour.Root steps={HERO_STEPS} open={open} onOpenChange={setOpen}>
        <Tour.Spotlight
          padding={6}
          radius={9}
          style={{ color: "rgba(15,15,20,0.45)", zIndex: 40 }}
        />

        <HeroCard />
      </Tour.Root>
    </>
  );
}
