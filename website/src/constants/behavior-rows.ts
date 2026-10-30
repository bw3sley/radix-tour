export interface BehaviorRow {
  keys: string[];
  label?: string;
  text: string;
}

export const BEHAVIOR_ROWS: BehaviorRow[] = [
  { keys: ["Esc"], text: "Closes the tour" },
  { keys: ["←", "→"], text: "Moves between steps from anywhere on the page" },
  { keys: [], label: "focus", text: "Returns to whatever opened the tour" },
  {
    keys: [],
    label: "targets",
    text: "A step waits until its element mounts, then scrolls it into view",
  },
  {
    keys: [],
    label: '"use client"',
    text: "Preserved in the build, so Server Components can import it",
  },
];
