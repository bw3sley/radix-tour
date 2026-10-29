// Page elements outside the tour, for focus and keyboard specs.
export function PageExtras() {
  return (
    <>
      <button type="button">Elsewhere</button>

      <input aria-label="Page field" />

      <div role="tablist" aria-label="Page tabs">
        <button type="button" role="tab" aria-selected="true">
          One
        </button>
      </div>
    </>
  );
}
