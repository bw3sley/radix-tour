import type { Meta, StoryObj } from "@storybook/react-vite";
import { X } from "lucide-react";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
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

function TourCard({ tone, alwaysShowBack }: { tone: Tone; alwaysShowBack: boolean }) {
  const { isFirst, isLast } = Tour.useTour();

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

      <Tour.Title className="pr-8 font-semibold text-base leading-snug" />
      <Tour.Description className={`mt-1.5 text-sm leading-relaxed ${styles.description}`} />

      <div className="mt-5 flex items-center justify-between">
        <Tour.Progress className={`text-xs tabular-nums ${styles.progress}`} />

        <div className="flex items-center gap-1.5">
          {isFirst && !alwaysShowBack ? null : (
            <Tour.Previous
              className={`rounded-lg px-3 py-1.5 font-medium text-sm data-[disabled]:opacity-50 ${styles.back} ${focusRing}`}
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
  alwaysShowBack: boolean;
  motion: boolean;
}

function CrumbTour({
  tone,
  spotlight,
  padding,
  radius,
  startOpen,
  alwaysShowBack,
  motion,
}: CrumbTourProps) {
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
      <Tour.Root steps={steps} open={open} onOpenChange={setOpen} motion={motion}>
        {spotlight ? (
          <Tour.Spotlight padding={padding} radius={radius} className="z-40 text-ink/55" />
        ) : null}

        <TourCard tone={tone} alwaysShowBack={alwaysShowBack} />
      </Tour.Root>
    </CrumbApp>
  );
}

const meta = {
  title: "Tour",
  component: CrumbTour,
  args: {
    tone: "dark",
    spotlight: true,
    padding: 6,
    radius: 10,
    startOpen: true,
    alwaysShowBack: false,
    motion: true,
  },
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

/**
 * Keyboard only. Tab to "Take the tour" and press Enter: focus lands in the card. Tab reaches Back
 * (focusable but inert on step 1), Next and Close. Space on Next keeps focus on Next, Home and End
 * jump to the first and last step, F6 returns to the card after tabbing out, Esc returns focus to the
 * opener. The spotlight sits below the card (z-40 against z-50) and its cut-out leaves room for focus rings.
 */
export const KeyboardFlow: Story = {
  args: { startOpen: false, alwaysShowBack: true },
  play: async ({ canvasElement }) => {
    const opener = within(canvasElement).getByRole("button", { name: "Take the tour" });

    opener.focus();
    await userEvent.keyboard("{Enter}");

    const card = await within(document.body).findByRole("dialog");

    await waitFor(() => expect(card).toHaveFocus());

    await userEvent.tab();
    await expect(within(card).getByRole("button", { name: "Back" })).toHaveFocus();

    await userEvent.tab();

    const next = within(card).getByRole("button", { name: "Next" });

    await expect(next).toHaveFocus();

    await userEvent.keyboard(" ");
    await waitFor(() => expect(card).toHaveAttribute("data-step", "1"));
    await expect(next).toHaveFocus();

    await userEvent.keyboard("{End}");
    await waitFor(() => expect(card).toHaveAttribute("data-step", "3"));
  },
};

/** `motion={false}` turns off the glide, the enter and exit, and the text fade: every change is instant. */
export const WithoutMotion: Story = { args: { motion: false } };
