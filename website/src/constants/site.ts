export const SITE_NAME = "radix-tour";

export const SITE_TITLE = "radix-tour | Composable product tours for React";

export const SITE_DESCRIPTION = "Composable product tours for React, built on Radix primitives.";

export const SITE_URL = "https://tour.bw3sley.dev";

/** Keep this literal in sync with --background in globals.css. */
export const SITE_THEME_COLOR = "#fbfaf8";

/** Keep these renderer colors in sync with the matching globals.css tokens. */
export const SITE_IMAGE_COLORS = {
  background: SITE_THEME_COLOR,
  foreground: "#18181b",
  card: "#ffffff",
  muted: "#6b6a66",
  subtle: "#a3a19b",
  border: "#e8e6e1",
  accent: "#c74007",
  darkMuted: "#a1a1aa",
} as const;
