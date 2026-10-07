import type { Meta, StoryObj } from "@storybook/react-vite";
import { X } from "lucide-react";
import * as React from "react";
import * as Tour from "../index";
import { CrumbApp } from "./stories/crumb-app";

const steps: Tour.TourStep[] = [
  {
    id: "routes",
    target: "#route-nav",
    side: "right",
    align: "start",
    title: "See today's routes",
    description: "Orders are grouped by van and stop, so drivers load in the order they deliver.",
  },
  {
    id: "search",
    target: "#search",
    align: "start",
    title: "Find an order fast",
    description: "Search by customer, product or order number.",
  },
  {
    id: "status",
    target: "#status-tabs",
    align: "start",
    title: "Filter by status",
    description: "Switch to To bake to see what the ovens need next.",
  },
  {
    id: "new-order",
    target: "#new-order",
    align: "end",
    title: "Add an order",
    description: "Standing orders repeat every week, so regulars only need setting up once.",
  },
];

type Tone = "dark" | "light";

const tones: Record<Tone, Record<string, string>> = {
  dark: {
    card: "bg-ink text-white shadow-[0_18px_40px_-12px_rgba(15,27,38,0.55)]",
    arrow: "fill-ink",
    description: "text-slate-300",
    progress: "text-slate-400",
    close: "text-slate-400 hover:bg-white/10 hover:text-white",
    back: "text-slate-300 hover:bg-white/10 hover:text-white",
    next: "bg-amber text-ink hover:bg-amber/90",
  },
  light: {
    card: "border border-line bg-white text-ink shadow-[0_18px_40px_-12px_rgba(15,27,38,0.28)]",
    arrow: "fill-white drop-shadow-[0_1px_0_#d8dee4]",
    description: "text-muted",
    progress: "text-muted",
    close: "text-muted hover:bg-mist hover:text-ink",
    back: "text-muted hover:bg-mist hover:text-ink",
    next: "bg-ink text-white hover:bg-ink/90",
  },
};

const focusRing = "outline-offset-2 focus-visible:outline-2 focus-visible:outline-amber";

function TourCard({ tone }: { tone: Tone }) {
  const { step, isFirst, isLast } = Tour.useTour();

  const styles = tones[tone];

  return (
    <Tour.Content className={`z-50 w-80 rounded-2xl p-5 ${styles.card}`}>
      <Tour.Arrow width={16} height={8} className={styles.arrow} />

      <Tour.Close
        aria-label="Close tour"
        className={`absolute top-3 right-3 rounded-md p-1.5 ${styles.close} ${focusRing}`}
      >
        <X className="size-4" aria-hidden />
      </Tour.Close>

      <div key={step.id} data-tour-body="">
        <Tour.Title className="pr-8 font-semibold text-base leading-snug" />
        <Tour.Description className={`mt-1.5 text-sm leading-relaxed ${styles.description}`} />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Tour.Progress className={`text-xs tabular-nums ${styles.progress}`} />

        <div className="flex items-center gap-1.5">
          {isFirst ? null : (
            <Tour.Previous
              className={`rounded-lg px-3 py-1.5 font-medium text-sm ${styles.back} ${focusRing}`}
            >
              Back
            </Tour.Previous>
          )}

          <Tour.Next
            className={`rounded-lg px-3.5 py-1.5 font-semibold text-sm ${styles.next} ${focusRing}`}
          >
            {isLast ? "Done" : "Next"}
          </Tour.Next>
        </div>
      </div>
    </Tour.Content>
  );
}

interface CrumbTourProps {
  tone: Tone;
  spotlight: boolean;
  padding: number;
  radius: number;
  startOpen: boolean;
}

function CrumbTour({ tone, spotlight, padding, radius, startOpen }: CrumbTourProps) {
  const [open, setOpen] = React.useState(startOpen);

  return (
    <CrumbApp
      actions={
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-10 rounded-lg px-3 font-medium text-muted text-sm hover:bg-white hover:text-ink"
        >
          Take the tour
        </button>
      }
    >
      <Tour.Root steps={steps} open={open} onOpenChange={setOpen}>
        {spotlight ? (
          <Tour.Spotlight padding={padding} radius={radius} className="z-40 text-ink/55" />
        ) : null}

        <TourCard tone={tone} />
      </Tour.Root>
    </CrumbApp>
  );
}

const meta = {
  title: "Tour",
  component: CrumbTour,
  args: { tone: "dark", spotlight: true, padding: 6, radius: 10, startOpen: true },
  argTypes: {
    tone: { control: "inline-radio", options: ["dark", "light"] },
    padding: { control: { type: "range", min: 0, max: 24, step: 2 } },
    radius: { control: { type: "range", min: 0, max: 24, step: 2 } },
  },
} satisfies Meta<typeof CrumbTour>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A dark card on a light app stands out from the page it explains. */
export const Default: Story = {};

/** Same parts, restyled with classes only. */
export const Light: Story = { args: { tone: "light" } };

/** Skip `Tour.Spotlight` to point at targets without dimming the page. */
export const WithoutSpotlight: Story = { args: { spotlight: false, tone: "light" } };

/** Start from "Take the tour", then close with Esc or Done: focus returns to that button. Arrow keys move between steps. */
export const StartsClosed: Story = { args: { startOpen: false } };
