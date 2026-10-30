export interface ApiRow {
  name: string;
  type?: string;
  text: string;
}

export interface ApiGroup {
  title: string;
  rows: ApiRow[];
}

export const API_GROUPS: ApiGroup[] = [
  {
    title: "Tour.Root",
    rows: [
      { name: "steps", type: "TourStep[]", text: "The steps, in order." },
      {
        name: "open",
        type: "boolean",
        text: "Whether the tour is showing. Opening starts at the first step.",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        text: "Called with false when the tour finishes or is closed.",
      },
      {
        name: "motion",
        type: "boolean",
        text: "Animate between steps and on open and close. Defaults to true.",
      },
    ],
  },
  {
    title: "TourStep",
    rows: [
      { name: "id", type: "string", text: "Unique id." },
      { name: "target", type: "string", text: "CSS selector of the element to point at." },
      {
        name: "title",
        type: "ReactNode",
        text: "Rendered by Tour.Title when it has no children.",
      },
      {
        name: "description",
        type: "ReactNode",
        text: "Rendered by Tour.Description when it has no children.",
      },
      {
        name: "side",
        type: '"top" | "right" | "bottom" | "left"',
        text: 'Side of the target the card sits on. Defaults to "bottom".',
      },
      {
        name: "align",
        type: '"start" | "center" | "end"',
        text: 'Alignment along that side. Defaults to "center".',
      },
    ],
  },
  {
    title: "Parts",
    rows: [
      {
        name: "Tour.Content",
        type: "Popover content",
        text: "The card, anchored to the current target. Accepts the Popover content props (side, sideOffset, collisionPadding, onOpenAutoFocus, ...), which override the step's values.",
      },
      {
        name: "Tour.Arrow",
        type: "Popover arrow",
        text: "Goes inside Tour.Content. Fill it with a fill-* class.",
      },
      {
        name: "Tour.Spotlight",
        type: "svg",
        text: "Dims the page around the target. Props: padding and radius, both 8 by default.",
      },
      {
        name: "Tour.Title",
        type: "h2",
        text: "The step's title unless given children. Labels the card.",
      },
      {
        name: "Tour.Description",
        type: "p",
        text: "The step's description unless given children. Describes the card.",
      },
      { name: "Tour.Progress", type: "span", text: "Shows 1 / 4 unless given children." },
      {
        name: "Tour.Next",
        type: "button",
        text: "Goes to the next step, and closes the tour on the last one.",
      },
      {
        name: "Tour.Previous",
        type: "button",
        text: "Goes to the previous step. On the first step it is aria-disabled and does nothing.",
      },
      { name: "Tour.Close", type: "button", text: "Closes the tour." },
    ],
  },
  {
    title: "useTour()",
    rows: [
      {
        name: "returns",
        text: "{ steps, step, index, isFirst, isLast, next, previous, close }. Only works inside Tour.Root.",
      },
    ],
  },
];
