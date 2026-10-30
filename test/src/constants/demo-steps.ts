import type { TourStep } from "radix-tour";

export const STEPS: TourStep[] = [
  { id: "first", target: "#first", title: "First", description: "First step." },
  { id: "second", target: "#second", title: "Second", description: "Second step." },
];

export const PLACEMENT_STEPS: TourStep[] = [
  { id: "a", target: "#first", side: "right", align: "end", title: "A" },
];

export const LATE_STEPS: TourStep[] = [{ id: "late", target: "#late", title: "Late" }];
