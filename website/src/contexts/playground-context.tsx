"use client";

import * as React from "react";
import { THEMES } from "../constants/themes";
import type { Theme, ThemeKey } from "../types/theme";

export type PartKey = "arrow" | "close" | "progress" | "back";

export type Parts = Record<PartKey, boolean>;

export interface PlaygroundValue {
  themeKey: ThemeKey;
  theme: Theme;
  setTheme: (key: ThemeKey) => void;
  parts: Parts;
  togglePart: (key: PartKey) => void;
  registerStart: (start: (() => void) | null) => void;
  startTour: () => void;
}

export const PlaygroundContext = React.createContext<PlaygroundValue | null>(null);

export function PlaygroundProvider({ children }: { children: React.ReactNode }) {
  const [themeKey, setTheme] = React.useState<ThemeKey>("dark");
  const [parts, setParts] = React.useState<Parts>({
    arrow: true,
    close: true,
    progress: true,
    back: true,
  });

  const startRef = React.useRef<(() => void) | null>(null);

  const value = React.useMemo<PlaygroundValue>(
    () => ({
      themeKey,
      theme: THEMES[themeKey],
      setTheme,
      parts,
      togglePart: (key) => setParts((current) => ({ ...current, [key]: !current[key] })),
      registerStart: (start) => {
        startRef.current = start;
      },
      startTour: () => startRef.current?.(),
    }),
    [themeKey, parts],
  );

  return <PlaygroundContext.Provider value={value}>{children}</PlaygroundContext.Provider>;
}
