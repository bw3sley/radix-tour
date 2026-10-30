import { USAGE_CODE } from "../constants/usage-code";
import { CodeBlock } from "./code-block";
import { Section } from "./section";

export function UsageSection() {
  return (
    <Section title="Usage">
      <p className="text-base leading-relaxed text-pretty text-muted-foreground">
        Point each step at a selector, list them in order, and own the{" "}
        <code className="font-mono text-sm text-foreground">open</code> state.{" "}
        <code className="font-mono text-sm text-foreground">Tour.Content</code> is the card;{" "}
        <code className="font-mono text-sm text-foreground">Tour.Spotlight</code> is the optional
        dimmed overlay.
      </p>

      <CodeBlock small code={USAGE_CODE} />
    </Section>
  );
}
