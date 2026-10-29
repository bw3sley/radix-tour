import { CodeBlock } from "./code-block";

export function InstallationSection() {
  return (
    <section className="section">
      <h2>Installation</h2>

      <CodeBlock lang="bash" code="npm install radix-tour" />

      <p>
        <code>react</code> and <code>react-dom</code> 18 or 19 are peer dependencies. Tailwind is
        optional.
      </p>
    </section>
  );
}
