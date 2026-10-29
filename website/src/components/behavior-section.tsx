import { BEHAVIOR_ROWS } from "../constants/behavior-rows";
import { Section } from "./section";
import { SectionText } from "./section-text";

export function BehaviorSection() {
  return (
    <Section title="Behavior">
      <SectionText>
        Accessible by default. The card is a Radix Popover, exposed as a dialog.
      </SectionText>

      <div className="flex flex-col rounded-lg border bg-card">
        {BEHAVIOR_ROWS.map((row) => (
          <div
            key={row.text}
            className="flex items-center gap-4 px-4 py-3 text-sm text-secondary-foreground not-first:border-t"
          >
            {row.keys.length ? (
              <div className="flex w-30 shrink-0 gap-1">
                {row.keys.map((key) => (
                  <kbd
                    key={key}
                    className="rounded-sm border border-b-2 bg-background px-1.5 py-px font-mono text-xs font-medium text-foreground"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            ) : (
              <span className="w-30 shrink-0 font-mono text-xs font-medium text-muted-foreground">
                {row.label}
              </span>
            )}

            <span>{row.text}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}
