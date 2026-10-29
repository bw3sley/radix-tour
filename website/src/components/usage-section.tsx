import { USAGE_CODE } from "../constants/usage-code";
import { CodeBlock } from "./code-block";
import { Section } from "./section";

export function UsageSection() {
  return (
    <Section title="Usage">
      <p>
        Point each step at a selector, list them in order, and own the <code>open</code> state.{" "}
        <code>Tour.Content</code> is the card; <code>Tour.Spotlight</code> is the optional dimmed
        overlay.
      </p>

      <CodeBlock small code={USAGE_CODE} />
    </Section>
  );
}
