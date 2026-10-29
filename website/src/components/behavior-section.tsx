import { BEHAVIOR_ROWS } from "../constants/behavior-rows";

export function BehaviorSection() {
  return (
    <section className="section">
      <h2>Behavior</h2>

      <p>Accessible by default. The card is a Radix Popover, exposed as a dialog.</p>

      <div className="behavior">
        {BEHAVIOR_ROWS.map((row) => (
          <div key={row.text} className="behavior-row">
            {row.keys.length ? (
              <div className="kbd-group">
                {row.keys.map((key) => (
                  <kbd key={key}>{key}</kbd>
                ))}
              </div>
            ) : (
              <span className="behavior-label">{row.label}</span>
            )}

            <span>{row.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
