import { CodeBlock } from "./code-block";
import { Section } from "./section";

export function InstallationSection() {
  return (
    <Section title="Installation">
      <CodeBlock lang="bash" code="npm install radix-tour" />

      <p className="text-base leading-relaxed text-pretty text-muted-foreground">
        <code className="font-mono text-sm text-foreground">react</code> and{" "}
        <code className="font-mono text-sm text-foreground">react-dom</code> 18 or 19 are peer
        dependencies. Tailwind is optional.
      </p>
    </Section>
  );
}
