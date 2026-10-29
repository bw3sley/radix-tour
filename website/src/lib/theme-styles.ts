import type { CSSProperties } from "react";
import type { Theme } from "../types/theme";

export function themeVars(theme: Theme): CSSProperties {
  return {
    "--bg": theme.bg,
    "--fg": theme.fg,
    "--sub": theme.sub,
    "--border": theme.border,
    "--line": theme.line,
    "--radius": `${theme.radius}px`,
    "--shadow": theme.shadow,
    "--btn-bg": theme.btnBg,
    "--btn-fg": theme.btnFg,
    "--btn-border": theme.btnBorder,
    "--btn-radius": `${theme.btnRadius}px`,
    "--ghost": theme.ghost,
    "--card-font": theme.font,
    "--arrow": theme.arrow,
  } as CSSProperties;
}

// Border sides that draw the visible half of the rotated arrow square for each card side.
export function arrowBorders(side: string, line: string): CSSProperties {
  const none = "none";

  if (side === "bottom") {
    return { borderTop: line, borderLeft: line, borderBottom: none, borderRight: none };
  }

  if (side === "top") {
    return { borderTop: none, borderLeft: none, borderBottom: line, borderRight: line };
  }

  if (side === "right") {
    return { borderTop: none, borderLeft: line, borderBottom: line, borderRight: none };
  }

  return { borderTop: line, borderLeft: none, borderBottom: none, borderRight: line };
}
