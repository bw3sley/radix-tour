"use client";

import * as React from "react";

// Mounts its element after a delay, to exercise a step whose target is not in the DOM yet.
export function LateTarget({ delay }: { delay: number }) {
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShown(true), delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return shown ? (
    <button type="button" id="late" data-testid="late-target">
      late target
    </button>
  ) : null;
}
