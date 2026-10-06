import { useEffect, useState } from "react";

/** Resolves a CSS selector to an element, waiting for it to appear in the DOM. */
export function useTarget(selector: string | undefined): Element | null {
  const [element, setElement] = useState<Element | null>(null);

  useEffect(() => {
    if (!selector) {
      setElement(null);

      return;
    }

    const found = document.querySelector(selector);

    setElement(found);

    if (found) {
      return;
    }

    const observer = new MutationObserver(() => {
      const appeared = document.querySelector(selector);

      if (!appeared) {
        return;
      }

      setElement(appeared);
      observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [selector]);

  return element;
}
