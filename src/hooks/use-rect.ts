import { useEffect, useState } from "react";

/** Tracks an element's viewport rect across scroll, resize and layout shifts. */
export function useRect(element: Element | null): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!element) {
      setRect(null);

      return;
    }

    const observed = element;

    let frame = 0;

    function update() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setRect(observed.getBoundingClientRect()));
    }

    update();

    const resizeObserver = new ResizeObserver(update);

    resizeObserver.observe(observed);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [element]);

  return rect;
}
