import { useLayoutEffect } from "@radix-ui/react-use-layout-effect";
import type { RefObject } from "react";
import { useRef } from "react";

const FADE_DURATION = 120;
const DEFAULT_EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

/**
 * Fades an element in whenever `key` changes, so text swapped between steps does not pop.
 * Skips the first render, and does nothing when `enabled` is false or the browser has no
 * Web Animations API. Uses WAAPI so it leaves no inline styles behind.
 */
export function useStepFade(ref: RefObject<HTMLElement | null>, key: string, enabled: boolean) {
  const previousKey = useRef(key);

  useLayoutEffect(() => {
    const changed = previousKey.current !== key;

    previousKey.current = key;

    const node = ref.current;

    if (!enabled || !changed || !node || typeof node.animate !== "function") {
      return;
    }

    const ease = getComputedStyle(node).getPropertyValue("--tour-ease").trim() || DEFAULT_EASE;

    node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE_DURATION, easing: ease });
  }, [key, enabled, ref]);
}
