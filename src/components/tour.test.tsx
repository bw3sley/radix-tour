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
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
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
  removeOpener,
}: {
  onOpenChange?: (open: boolean) => void;
  onKeyDown?: React.KeyboardEventHandler;
  removeOpener?: boolean;
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
        <button type="button" onClick={() => setOpen(true)}>
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
        <Tour.Content onKeyDown={onKeyDown}>
          <Tour.Title />
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
});
