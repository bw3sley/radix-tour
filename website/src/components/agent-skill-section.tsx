import { CodeBlock } from "./code-block";
import { Section } from "./section";

export function AgentSkillSection() {
  return (
    <Section title="Agent skill">
      <p className="text-base leading-relaxed text-pretty text-muted-foreground">
        Teach your coding agent to add and style a tour. Not part of the npm package.
      </p>

      <CodeBlock lang="bash" code="npx skills add bw3sley/radix-tour" />
    </Section>
  );
}
