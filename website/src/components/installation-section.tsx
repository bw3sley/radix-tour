import { CodeBlock } from "./code-block";
import { InlineCode } from "./inline-code";
import { Section } from "./section";
import { SectionText } from "./section-text";

export function InstallationSection() {
  return (
    <Section title="Installation">
      <CodeBlock lang="bash" code="npm install radix-tour" />

      <SectionText>
        <InlineCode>react</InlineCode> and <InlineCode>react-dom</InlineCode> 18 or 19 are peer
        dependencies. Tailwind is optional.
      </SectionText>
    </Section>
  );
}
