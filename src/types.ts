import type { ReactNode } from "react";

interface TourStep {
  id: string;

  /** CSS selector of the element this step points at. */
  target: string;

  title?: ReactNode;
  description?: ReactNode;

  /** Which side of the target the card sits on. Defaults to "bottom". */
  side?: "top" | "right" | "bottom" | "left";

  /** How the card aligns along that side. Defaults to "center". */
  align?: "start" | "center" | "end";
}

interface TourProps {
  steps: TourStep[];
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** Animate the card and spotlight between steps and on open and close. Defaults to true. */
  motion?: boolean;

  children?: ReactNode;
}

export type { TourProps, TourStep };
