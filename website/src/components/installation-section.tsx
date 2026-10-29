import { CodeBlock } from "./code-block";
import { Section } from "./section";

export function InstallationSection() {
  return (
    <Section title="Installation">
      <CodeBlock lang="bash" code="npm install radix-tour" />

      <p>
        <code>react</code> and <code>react-dom</code> 18 or 19 are peer dependencies. Tailwind is
        optional.
      </p>
    </Section>
  );
}
