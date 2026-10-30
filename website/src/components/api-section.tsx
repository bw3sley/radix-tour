import { API_GROUPS } from "../constants/api-reference";
import { Section } from "./section";

export function ApiSection() {
  return (
    <Section id="api-reference" title="API reference">
      <p className="text-base leading-relaxed text-pretty text-muted-foreground">
        Every part forwards its ref and accepts{" "}
        <code className="font-mono text-sm text-foreground">asChild</code>. Event handlers run
        before the built-in behavior, and{" "}
        <code className="font-mono text-sm text-foreground">event.preventDefault()</code> in{" "}
        <code className="font-mono text-sm text-foreground">onClick</code> cancels it.
      </p>

      {API_GROUPS.map((group) => (
        <div key={group.title} className="flex flex-col gap-2">
          <h3 className="font-mono text-sm font-medium">{group.title}</h3>

          <div className="flex flex-col rounded-lg border bg-card">
            {group.rows.map((row) => (
              <div key={row.name} className="flex flex-col gap-1 px-4 py-3 not-first:border-t">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <code className="font-mono text-xs font-medium text-foreground">{row.name}</code>
                  {row.type && (
                    <code className="font-mono text-xs text-muted-foreground">{row.type}</code>
                  )}
                </div>

                <p className="text-sm text-secondary-foreground">{row.text}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </Section>
  );
}
