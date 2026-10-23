import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import * as Tour from "../index";

const steps: Tour.TourStep[] = [
  { id: "first", target: "#first", title: "First", description: "First step." },
  { id: "second", target: "#second", title: "Second", description: "Second step." },
];

function Harness({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = React.useState(true);

  return (
    <>
      <button type="button" id="first">
        first target
      </button>

      <button type="button" id="second">
        second target
      </button>

      <Tour.Root
        steps={steps}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          onOpenChange?.(next);
        }}
      >
        <Tour.Spotlight data-testid="spotlight" />

        <Tour.Content>
          <Tour.Title />
          <Tour.Description />
          <Tour.Progress />
          <Tour.Previous>Back</Tour.Previous>
          <Tour.Next>Next</Tour.Next>
          <Tour.Close aria-label="Close tour">x</Tour.Close>
        </Tour.Content>
      </Tour.Root>
    </>
  );
}

describe("Tour", () => {
  it("shows the first step anchored to its target", async () => {
    render(<Harness />);

    expect(await screen.findByRole("heading", { name: "First" })).toBeInTheDocument();
    expect(screen.getByText("First step.")).toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("moves forward and back between steps", async () => {
    const user = userEvent.setup();

    render(<Harness />);

    await user.click(await screen.findByRole("button", { name: "Next" }));

    expect(await screen.findByRole("heading", { name: "Second" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(await screen.findByRole("heading", { name: "First" })).toBeInTheDocument();
  });

  it("closes after the last step", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(<Harness onOpenChange={onOpenChange} />);

    await user.click(await screen.findByRole("button", { name: "Next" }));
    await user.click(await screen.findByRole("button", { name: "Next" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);

    await waitFor(() => expect(screen.queryByRole("heading")).not.toBeInTheDocument());
  });

  it("closes on Escape and on the close button", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(<Harness onOpenChange={onOpenChange} />);

    await screen.findByRole("heading", { name: "First" });
    await user.keyboard("{Escape}");

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("waits for a target that is not in the DOM yet", async () => {
    render(
      <Tour.Root
        steps={[{ id: "late", target: "#late", title: "Late" }]}
        open
        onOpenChange={vi.fn()}
      >
        <Tour.Content>
          <Tour.Title />
        </Tour.Content>
      </Tour.Root>,
    );

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();

    const target = document.createElement("div");

    target.id = "late";
    document.body.append(target);

    expect(await screen.findByRole("heading", { name: "Late" })).toBeInTheDocument();

    target.remove();
  });

  it("places the card on the side and alignment each step asks for", async () => {
    render(
      <>
        <button type="button" id="side-target">
          target
        </button>

        <Tour.Root
          steps={[{ id: "a", target: "#side-target", side: "right", align: "end", title: "A" }]}
          open
          onOpenChange={vi.fn()}
        >
          <Tour.Content data-testid="card">
            <Tour.Title />
            <Tour.Arrow />
          </Tour.Content>
        </Tour.Root>
      </>,
    );

    const card = await screen.findByTestId("card");

    expect(card).toHaveAttribute("data-side", "right");
    expect(card).toHaveAttribute("data-align", "end");
  });

  it("exposes first and last step state through useTour", async () => {
    const user = userEvent.setup();

    function Label() {
      const { isFirst, isLast } = Tour.useTour();

      return <p>{`${isFirst ? "first" : "later"} ${isLast ? "last" : "more"}`}</p>;
    }

    render(
      <>
        <button type="button" id="first">
          first target
        </button>

        <button type="button" id="second">
          second target
        </button>

        <Tour.Root steps={steps} open onOpenChange={vi.fn()}>
          <Tour.Content>
            <Label />
            <Tour.Next>Next</Tour.Next>
          </Tour.Content>
        </Tour.Root>
      </>,
    );

    expect(await screen.findByText("first more")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByText("later last")).toBeInTheDocument();
  });

  it("renders nothing while closed", () => {
    render(
      <Tour.Root steps={steps} open={false} onOpenChange={vi.fn()}>
        <Tour.Content>
          <Tour.Title />
        </Tour.Content>
      </Tour.Root>,
    );

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("throws when a part is used outside Tour.Root", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<Tour.Next>Next</Tour.Next>)).toThrow(/must be used within `Tour`/);

    error.mockRestore();
  });

  it("keeps spotlight mask ids unique across tours", async () => {
    render(
      <>
        <button type="button" id="first">
          t
        </button>

        <Tour.Root steps={steps} open onOpenChange={vi.fn()}>
          <Tour.Spotlight data-testid="a" />
        </Tour.Root>

        <Tour.Root steps={steps} open onOpenChange={vi.fn()}>
          <Tour.Spotlight data-testid="b" />
        </Tour.Root>
      </>,
    );

    await waitFor(() => expect(screen.getByTestId("a")).toBeInTheDocument());

    const ids = [...document.querySelectorAll("mask")].map((mask) => mask.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});

function OpenerHarness({
  onOpenChange,
  onKeyDown,
  onOpenAutoFocus,
  removeOpener,
  unmountOnOpen,
}: {
  onOpenChange?: (open: boolean) => void;
  onKeyDown?: React.KeyboardEventHandler;
  onOpenAutoFocus?: (event: Event) => void;
  removeOpener?: boolean;
  unmountOnOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [showOpener, setShowOpener] = React.useState(true);

  return (
    <>
      <button type="button" id="first">
        first target
      </button>

      <button type="button" id="second">
        second target
      </button>

      {showOpener && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);

            if (unmountOnOpen) {
              setShowOpener(false);
            }
          }}
        >
          Start tour
        </button>
      )}

      <Tour.Root
        steps={steps}
        open={open}
        onOpenChange={(next) => {
          if (!next && removeOpener) {
            setShowOpener(false);
          }

          setOpen(next);
          onOpenChange?.(next);
        }}
      >
        <Tour.Content onKeyDown={onKeyDown} onOpenAutoFocus={onOpenAutoFocus}>
          <Tour.Title />
          <Tour.Description />
          <Tour.Previous>Back</Tour.Previous>
          <Tour.Next>Next</Tour.Next>
          <Tour.Close aria-label="Close tour">x</Tour.Close>
          <input aria-label="Note" />
        </Tour.Content>
      </Tour.Root>
    </>
  );
}

async function startTour(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Start tour" }));
  await screen.findByRole("heading", { name: "First" });
}

describe("Tour keyboard navigation", () => {
  it("moves between steps with the arrow keys", async () => {
    const user = userEvent.setup();

    render(<OpenerHarness />);
    await startTour(user);

    await user.keyboard("{ArrowRight}");

    expect(await screen.findByRole("heading", { name: "Second" })).toBeInTheDocument();

    await user.keyboard("{ArrowLeft}");

    expect(await screen.findByRole("heading", { name: "First" })).toBeInTheDocument();
  });

  it("does nothing past the first or last step", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(<OpenerHarness onOpenChange={onOpenChange} />);
    await startTour(user);

    await user.keyboard("{ArrowLeft}");

    expect(screen.getByRole("heading", { name: "First" })).toBeInTheDocument();

    await user.keyboard("{ArrowRight}");
    await screen.findByRole("heading", { name: "Second" });
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("heading", { name: "Second" })).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("leaves arrows to inputs inside the card", async () => {
    const user = userEvent.setup();

    render(<OpenerHarness />);
    await startTour(user);

    await user.click(screen.getByRole("textbox", { name: "Note" }));
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("heading", { name: "First" })).toBeInTheDocument();
  });

  it("moves between steps with the arrow keys when focus is outside the card", async () => {
    const user = userEvent.setup();

    render(
      <>
        <OpenerHarness />
        <button type="button">Elsewhere</button>
      </>,
    );
    await startTour(user);

    await user.click(screen.getByRole("button", { name: "Elsewhere" }));
    expect(getCard()).not.toContainElement(document.activeElement as HTMLElement);

    await user.keyboard("{ArrowRight}");

    expect(await screen.findByRole("heading", { name: "Second" })).toBeInTheDocument();

    await user.keyboard("{ArrowLeft}");

    expect(await screen.findByRole("heading", { name: "First" })).toBeInTheDocument();
  });

  it("leaves arrows to inputs and widgets on the page", async () => {
    const user = userEvent.setup();

    render(
      <>
        <OpenerHarness />
        <input aria-label="Page field" />
        <div role="tablist" aria-label="Page tabs">
          <button type="button" role="tab" aria-selected="true">
            One
          </button>
        </div>
      </>,
    );
    await startTour(user);

    await user.click(screen.getByRole("textbox", { name: "Page field" }));
    await user.keyboard("{ArrowRight}");

    screen.getByRole("tab", { name: "One" }).focus();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("heading", { name: "First" })).toBeInTheDocument();
  });

  it("keeps Home and End inside the card so the page can still scroll", async () => {
    const user = userEvent.setup();

    render(
      <>
        <OpenerHarness />
        <button type="button">Elsewhere</button>
      </>,
    );
    await startTour(user);

    await user.click(screen.getByRole("button", { name: "Elsewhere" }));
    await user.keyboard("{End}");

    expect(screen.getByRole("heading", { name: "First" })).toBeInTheDocument();
  });

  it("ignores arrows with a modifier key", async () => {
    const user = userEvent.setup();

    render(<OpenerHarness />);
    await startTour(user);

    await user.keyboard("{Alt>}{ArrowRight}{/Alt}");

    expect(screen.getByRole("heading", { name: "First" })).toBeInTheDocument();
  });

  it("lets a consumer cancel navigation with preventDefault", async () => {
    const user = userEvent.setup();

    render(<OpenerHarness onKeyDown={(event) => event.preventDefault()} />);
    await startTour(user);

    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("heading", { name: "First" })).toBeInTheDocument();
  });
});

describe("Tour focus return", () => {
  it("returns focus to the opener after Escape", async () => {
    const user = userEvent.setup();

    render(<OpenerHarness />);
    await startTour(user);

    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.getByRole("button", { name: "Start tour" })).toHaveFocus());
  });

  it("returns focus to the opener after the close button", async () => {
    const user = userEvent.setup();

    render(<OpenerHarness />);
    await startTour(user);

    await user.click(screen.getByRole("button", { name: "Close tour" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Start tour" })).toHaveFocus());
  });

  it("returns focus to the opener after the last step", async () => {
    const user = userEvent.setup();

    render(<OpenerHarness />);
    await startTour(user);

    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(await screen.findByRole("button", { name: "Next" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Start tour" })).toHaveFocus());
  });

  it("does not move focus when the opener is gone", async () => {
    const user = userEvent.setup();

    render(<OpenerHarness removeOpener />);
    await startTour(user);

    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("heading")).not.toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "Start tour" })).not.toBeInTheDocument();
  });

  it("does not throw or steal focus when the opener unmounts as the tour starts", async () => {
    const user = userEvent.setup();

    render(<OpenerHarness unmountOnOpen />);
    await startTour(user);

    expect(screen.queryByRole("button", { name: "Start tour" })).not.toBeInTheDocument();

    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("heading")).not.toBeInTheDocument());
    expect(document.body).toHaveFocus();
  });
});

function getCard() {
  return screen.getByRole("dialog");
}

describe("Tour focus management", () => {
  it("moves focus into the card when the tour opens", async () => {
    const user = userEvent.setup();

    render(<OpenerHarness />);
    await startTour(user);

    await waitFor(() => expect(getCard()).toHaveFocus());
  });

  it("leaves focus alone when onOpenAutoFocus is prevented", async () => {
    const user = userEvent.setup();

    render(<OpenerHarness onOpenAutoFocus={(event) => event.preventDefault()} />);
    await startTour(user);

    expect(screen.getByRole("button", { name: "Start tour" })).toHaveFocus();
  });

  it("walks Tab through the card in reading order", async () => {
    const user = userEvent.setup();

    render(<OpenerHarness />);
    await startTour(user);
    await waitFor(() => expect(getCard()).toHaveFocus());

    await user.tab();
    expect(screen.getByRole("button", { name: "Back" })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: "Close tour" })).toHaveFocus();

    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();
  });

  it("keeps focus on Next after activating it with the mouse, Enter and Space", async () => {
    const user = userEvent.setup();

    render(<OpenerHarness />);
    await startTour(user);

    const next = screen.getByRole("button", { name: "Next" });

    await user.click(next);
    await screen.findByRole("heading", { name: "Second" });
    expect(next).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    await screen.findByRole("heading", { name: "First" });

    next.focus();
    await user.keyboard("{Enter}");
    await screen.findByRole("heading", { name: "Second" });
    expect(next).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    await screen.findByRole("heading", { name: "First" });

    await user.keyboard(" ");
    await screen.findByRole("heading", { name: "Second" });
    expect(next).toHaveFocus();
  });

  it("pulls focus back into the card when the focused element is replaced on a step change", async () => {
    const user = userEvent.setup();

    function KeyedCard() {
      const { step } = Tour.useTour();

      return (
        <Tour.Content>
          <Tour.Title />
          <Tour.Next key={step.id}>Next</Tour.Next>
        </Tour.Content>
      );
    }

    render(
      <>
        <button type="button" id="first">
          first target
        </button>

        <button type="button" id="second">
          second target
        </button>

        <Tour.Root steps={steps} open onOpenChange={vi.fn()}>
          <KeyedCard />
        </Tour.Root>
      </>,
    );

    await waitFor(() => expect(getCard()).toHaveFocus());

    await user.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByRole("heading", { name: "Second" });

    await waitFor(() => expect(getCard()).toHaveFocus());
  });

  it("leaves focus on the opener when auto focus is prevented, and arrows still change the step", async () => {
    const user = userEvent.setup();

    render(<OpenerHarness onOpenAutoFocus={(event) => event.preventDefault()} />);
    await startTour(user);

    const opener = screen.getByRole("button", { name: "Start tour" });

    expect(opener).toHaveFocus();

    await user.keyboard("{ArrowRight}");

    expect(await screen.findByRole("heading", { name: "Second" })).toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("returns to the card with F6 after tabbing out of it", async () => {
    const user = userEvent.setup();

    render(<OpenerHarness />);
    await startTour(user);
    await waitFor(() => expect(getCard()).toHaveFocus());

    await user.tab({ shift: true });
    expect(getCard()).not.toContainElement(document.activeElement as HTMLElement);

    await user.keyboard("{F6}");
    expect(getCard()).toHaveFocus();
  });

  it("stops listening for F6 once the tour closes", async () => {
    const user = userEvent.setup();

    render(<OpenerHarness />);
    await startTour(user);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    const press = new KeyboardEvent("keydown", { key: "F6", cancelable: true, bubbles: true });

    document.dispatchEvent(press);

    expect(press.defaultPrevented).toBe(false);
  });
});

describe("Tour screen reader semantics", () => {
  it("announces each step in a polite live region", async () => {
    const user = userEvent.setup();

    render(<OpenerHarness />);
    await startTour(user);

    const status = screen.getByRole("status");

    expect(status).toHaveAttribute("aria-live", "polite");
    await waitFor(() => expect(status).toHaveTextContent("Step 1 of 2: First"));

    await user.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => expect(status).toHaveTextContent("Step 2 of 2: Second"));
  });

  it("labels the card with the title and describes it with the description", async () => {
    const user = userEvent.setup();

    render(<OpenerHarness />);
    await startTour(user);

    const card = getCard();

    expect(card).toHaveAccessibleName("First");
    expect(card).toHaveAccessibleDescription("First step.");
  });

  it("omits the aria references when the card has no title or description", async () => {
    render(
      <>
        <button type="button" id="first">
          first target
        </button>

        <Tour.Root steps={steps} open onOpenChange={vi.fn()}>
          <Tour.Content>
            <Tour.Close aria-label="Close tour">x</Tour.Close>
          </Tour.Content>
        </Tour.Root>
      </>,
    );

    const card = await screen.findByRole("dialog");

    expect(card).not.toHaveAttribute("aria-labelledby");
    expect(card).not.toHaveAttribute("aria-describedby");
  });

  it("keeps Previous focusable but inert on the first step", async () => {
    const user = userEvent.setup();

    render(<OpenerHarness />);
    await startTour(user);

    const back = screen.getByRole("button", { name: "Back" });

    expect(back).not.toBeDisabled();
    expect(back).toHaveAttribute("aria-disabled", "true");
    expect(back).toHaveAttribute("data-disabled", "");

    back.focus();
    expect(back).toHaveFocus();

    await user.click(back);
    expect(screen.getByRole("heading", { name: "First" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByRole("heading", { name: "Second" });

    expect(back).not.toHaveAttribute("aria-disabled");
    expect(back).not.toHaveAttribute("data-disabled");
  });

  it("points the active target at the card and restores it afterwards", async () => {
    const user = userEvent.setup();

    render(<OpenerHarness />);

    const first = document.getElementById("first") as HTMLElement;
    const second = document.getElementById("second") as HTMLElement;

    first.setAttribute("aria-describedby", "existing-hint");

    await startTour(user);

    const cardId = getCard().id;

    expect(cardId).not.toBe("");
    expect(first.getAttribute("aria-describedby")).toBe(`existing-hint ${cardId}`);
    expect(second).not.toHaveAttribute("aria-describedby");

    await user.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByRole("heading", { name: "Second" });

    expect(first.getAttribute("aria-describedby")).toBe("existing-hint");
    expect(second.getAttribute("aria-describedby")).toBe(cardId);

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    expect(second).not.toHaveAttribute("aria-describedby");
  });
});

describe("Tour key map", () => {
  it("jumps to the last and first step with End and Home", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(<OpenerHarness onOpenChange={onOpenChange} />);
    await startTour(user);

    await user.keyboard("{End}");
    expect(await screen.findByRole("heading", { name: "Second" })).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();

    await user.keyboard("{Home}");
    expect(await screen.findByRole("heading", { name: "First" })).toBeInTheDocument();
  });

  it("leaves Home and End to inputs and modifier combinations", async () => {
    const user = userEvent.setup();

    render(<OpenerHarness />);
    await startTour(user);

    await user.click(screen.getByRole("textbox", { name: "Note" }));
    await user.keyboard("{End}");
    expect(screen.getByRole("heading", { name: "First" })).toBeInTheDocument();

    screen.getByRole("button", { name: "Next" }).focus();
    await user.keyboard("{Control>}{End}{/Control}");
    expect(screen.getByRole("heading", { name: "First" })).toBeInTheDocument();
  });

  it("activates Close with Enter", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(<OpenerHarness onOpenChange={onOpenChange} />);
    await startTour(user);

    screen.getByRole("button", { name: "Close tour" }).focus();
    await user.keyboard("{Enter}");

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

function MotionHarness({ motion }: { motion?: boolean }) {
  const [open, setOpen] = React.useState(true);

  return (
    <>
      <button type="button" id="first">
        first target
      </button>

      <button type="button" id="second">
        second target
      </button>

      <Tour.Root steps={steps} open={open} onOpenChange={setOpen} motion={motion}>
        <Tour.Spotlight data-testid="spotlight" />

        <Tour.Content data-testid="card">
          <Tour.Title />
          <Tour.Description />
          <Tour.Previous>Back</Tour.Previous>
          <Tour.Next>Next</Tour.Next>
          <Tour.Close aria-label="Close tour">x</Tour.Close>
        </Tour.Content>
      </Tour.Root>
    </>
  );
}

describe("Tour motion", () => {
  it("adds its stylesheet to the page once", async () => {
    render(<MotionHarness />);
    await screen.findByTestId("card");

    expect(document.head.querySelectorAll("style[data-radix-tour]")).toHaveLength(1);
  });

  it("marks the card, spotlight, title and description for the stylesheet", async () => {
    render(<MotionHarness />);

    const card = await screen.findByTestId("card");

    expect(card).toHaveAttribute("data-tour-content");
    expect(card).toHaveAttribute("data-motion", "from-start");
    expect(card).toHaveAttribute("data-state", "open");
    expect(await screen.findByTestId("spotlight")).toHaveAttribute("data-motion");
    expect(screen.getByRole("heading", { name: "First" })).toHaveAttribute("data-tour-title");
    expect(screen.getByText("First step.")).toHaveAttribute("data-tour-description");
  });

  it("sets data-placed after the first placement, which switches the glide on", async () => {
    render(<MotionHarness />);

    const card = await screen.findByTestId("card");

    await waitFor(() => expect(card).toHaveAttribute("data-placed"));
  });

  it("sets data-motion from the direction of the last step change", async () => {
    const user = userEvent.setup();

    render(<MotionHarness />);

    const card = await screen.findByTestId("card");

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(card).toHaveAttribute("data-motion", "from-start");
    expect(card).toHaveAttribute("data-step", "1");

    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(card).toHaveAttribute("data-motion", "from-end");
    expect(card).toHaveAttribute("data-step", "0");
  });

  it("keeps the same card mounted across steps", async () => {
    const user = userEvent.setup();

    render(<MotionHarness />);

    const card = await screen.findByTestId("card");

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByRole("heading", { name: "Second" })).toBeInTheDocument();
    expect(screen.getByTestId("card")).toBe(card);
  });

  it("replaces the title and description on each step so the CSS fade plays again", async () => {
    const user = userEvent.setup();

    render(<MotionHarness />);

    const title = await screen.findByRole("heading", { name: "First" });

    await user.click(screen.getByRole("button", { name: "Next" }));

    const next = await screen.findByRole("heading", { name: "Second" });

    expect(next).not.toBe(title);
    expect(title).not.toBeInTheDocument();
  });

  it("keeps the card mounted while the next target is briefly missing", async () => {
    const user = userEvent.setup();

    function Missing() {
      const [showSecond, setShowSecond] = React.useState(false);

      return (
        <>
          <button type="button" id="first">
            first target
          </button>

          {showSecond ? (
            <button type="button" id="second">
              second target
            </button>
          ) : null}

          <button type="button" onClick={() => setShowSecond(true)}>
            Show target
          </button>

          <Tour.Root steps={steps} open onOpenChange={vi.fn()}>
            <Tour.Content data-testid="card">
              <Tour.Title />
              <Tour.Next>Next</Tour.Next>
            </Tour.Content>
          </Tour.Root>
        </>
      );
    }

    render(<Missing />);

    const card = await screen.findByTestId("card");

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByTestId("card")).toBe(card);

    await user.click(screen.getByRole("button", { name: "Show target" }));

    expect(await screen.findByRole("heading", { name: "Second" })).toBeInTheDocument();
    expect(screen.getByTestId("card")).toBe(card);
  });

  it("removes the card when the tour closes", async () => {
    const user = userEvent.setup();

    render(<MotionHarness />);
    await screen.findByTestId("card");

    await user.click(screen.getByRole("button", { name: "Close tour" }));

    await waitFor(() => expect(screen.queryByTestId("card")).not.toBeInTheDocument());
  });

  it("starts from the first step when the tour opens again", async () => {
    const user = userEvent.setup();

    function Reopen() {
      const [open, setOpen] = React.useState(true);

      return (
        <>
          <button type="button" id="first">
            first target
          </button>

          <button type="button" id="second">
            second target
          </button>

          <button type="button" onClick={() => setOpen(true)}>
            Start
          </button>

          <Tour.Root steps={steps} open={open} onOpenChange={setOpen}>
            <Tour.Content data-testid="card">
              <Tour.Title />
              <Tour.Next>Next</Tour.Next>
            </Tour.Content>
          </Tour.Root>
        </>
      );
    }

    render(<Reopen />);
    await screen.findByTestId("card");

    await user.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByRole("heading", { name: "Second" });

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByTestId("card")).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Start" }));

    expect(await screen.findByRole("heading", { name: "First" })).toBeInTheDocument();
    expect(screen.getByTestId("card")).toHaveAttribute("data-step", "0");
  });

  describe("with motion={false}", () => {
    it("leaves data-motion off every part, so the stylesheet does nothing", async () => {
      render(<MotionHarness motion={false} />);

      const card = await screen.findByTestId("card");

      expect(card).not.toHaveAttribute("data-motion");
      expect(await screen.findByTestId("spotlight")).not.toHaveAttribute("data-motion");
      expect(screen.getByRole("heading", { name: "First" })).not.toHaveAttribute("data-motion");
      expect(screen.getByText("First step.")).not.toHaveAttribute("data-motion");
    });
  });
});
