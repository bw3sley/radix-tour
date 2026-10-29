import { CodeBlock } from "./code-block";

export function AgentSkillSection() {
  return (
    <section className="section">
      <h2>Agent skill</h2>

      <p>Teach your coding agent to add and style a tour. Not part of the npm package.</p>

      <CodeBlock lang="bash" code="npx skills add bw3sley/radix-tour" />
    </section>
  );
}
