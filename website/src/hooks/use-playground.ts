import * as React from "react";
import { PlaygroundContext } from "../contexts/playground-context";

export function usePlayground() {
  const context = React.useContext(PlaygroundContext);

  if (!context) {
    throw new Error("usePlayground must be used inside PlaygroundProvider");
  }

  return context;
}
