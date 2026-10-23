import { useCallbackRef } from "@radix-ui/react-use-callback-ref";
import { useEffect } from "react";

const ARROW_KEY_WIDGETS = [
  "menu",
  "menubar",
  "listbox",
  "tablist",
  "slider",
  "radiogroup",
  "tree",
  "grid",
  "combobox",
  "spinbutton",
  "textbox",
]
  .map((role) => `[role="${role}"]`)
  .join(",");

function isEditable(element: HTMLElement) {
  return (
    element.isContentEditable ||
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  );
}

/** Inputs, editors and composite widgets use the arrow keys themselves, so the tour leaves them alone. */
function ownsArrowKeys(element: HTMLElement) {
  return isEditable(element) || element.closest(ARROW_KEY_WIDGETS) !== null;
}

interface UseTourKeysOptions {
  enabled: boolean;

  card: React.RefObject<Element | null>;

  isFirst: boolean;
  isLast: boolean;
  stepCount: number;

  onNext: () => void;
  onPrevious: () => void;
  onGoTo: (index: number) => void;

  onFocusCard: () => void;
}

/** Arrows, Home, End and F6, listened for on the document. */
export function useTourKeys(options: UseTourKeysOptions) {
  const { enabled, card } = options;

  const handleKeyDown = useCallbackRef((event: KeyboardEvent) => {
    const { key, target } = event;

    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return;
    }

    if (key === "F6") {
      event.preventDefault();
      options.onFocusCard();

      return;
    }

    if (target instanceof HTMLElement && ownsArrowKeys(target)) {
      return;
    }

    const inCard = target instanceof Node && !!card.current?.contains(target);

    if (key === "ArrowRight" && !options.isLast) {
      event.preventDefault();
      options.onNext();
    }

    if (key === "ArrowLeft" && !options.isFirst) {
      event.preventDefault();
      options.onPrevious();
    }

    if (key === "Home" && inCard && !options.isFirst) {
      event.preventDefault();
      options.onGoTo(0);
    }

    if (key === "End" && inCard && !options.isLast) {
      event.preventDefault();
      options.onGoTo(options.stepCount - 1);
    }
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const ownerDocument = card.current?.ownerDocument ?? document;

    ownerDocument.addEventListener("keydown", handleKeyDown);

    return () => ownerDocument.removeEventListener("keydown", handleKeyDown);
  }, [enabled, card, handleKeyDown]);
}
