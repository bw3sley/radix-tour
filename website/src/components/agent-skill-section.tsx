import { CodeBlock } from "./code-block";
import { Section } from "./section";
import { SectionText } from "./section-text";

export function AgentSkillSection() {
  return (
    <Section title="Agent skill">
      <SectionText>
        Teach your coding agent to add and style a tour. Not part of the npm package.
      </SectionText>

      <CodeBlock lang="bash" code="npx skills add bw3sley/radix-tour" />
    </Section>
  );
}
