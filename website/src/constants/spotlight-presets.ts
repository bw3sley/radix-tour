export const SPOTLIGHT_PRESETS = {
  default: {
    label: "Default",
    pad: 8,
    radius: 8,
    dim: 0.5,
    code: '<Tour.Spotlight className="z-40 text-black/50" />',
  },
  none: {
    label: "No spotlight",
    pad: 8,
    radius: 8,
    dim: 0,
    code: "{/* Leave <Tour.Spotlight /> out —\n    the card still points at the target. */}",
  },
  padded: {
    label: "padding={16}",
    pad: 16,
    radius: 12,
    dim: 0.5,
    code: "<Tour.Spotlight padding={16} radius={12} />",
  },
  pill: {
    label: "radius={999}",
    pad: 4,
    radius: 999,
    dim: 0.5,
    code: "<Tour.Spotlight padding={4} radius={999} />",
  },
  soft: {
    label: "text-black/20",
    pad: 8,
    radius: 8,
    dim: 0.2,
    code: '<Tour.Spotlight className="text-black/20" />',
  },
} as const;

export type SpotlightPresetKey = keyof typeof SPOTLIGHT_PRESETS;

export const SPOTLIGHT_PRESET_KEYS = Object.keys(SPOTLIGHT_PRESETS) as SpotlightPresetKey[];

// Rows of the fake settings panel the spotlight demo points at; a null value renders a toggle.
export const SETTINGS_ROWS: [string, string | null][] = [
  ["Store name", "Crumb & Co."],
  ["Delivery radius", "8 km"],
  ["Notify customers", null],
  ["Opening hours", "6:00 – 14:00"],
];
