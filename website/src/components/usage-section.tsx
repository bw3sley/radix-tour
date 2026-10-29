import { USAGE_CODE } from "../constants/usage-code";
import { CodeBlock } from "./code-block";
import { InlineCode } from "./inline-code";
import { Section } from "./section";
import { SectionText } from "./section-text";

export function UsageSection() {
  return (
    <Section title="Usage">
      <SectionText>
        Point each step at a selector, list them in order, and own the <InlineCode>open</InlineCode>{" "}
        state. <InlineCode>Tour.Content</InlineCode> is the card;{" "}
        <InlineCode>Tour.Spotlight</InlineCode> is the optional dimmed overlay.
      </SectionText>

      <CodeBlock small code={USAGE_CODE} />
    </Section>
  );
}
