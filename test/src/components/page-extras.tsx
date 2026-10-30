// Page elements outside the tour, for focus and keyboard specs.
export function PageExtras() {
  return (
    <>
      <button type="button" data-testid="elsewhere">
        Elsewhere
      </button>

      <input aria-label="Page field" data-testid="page-field" />

      <div role="tablist" aria-label="Page tabs">
        <button type="button" role="tab" aria-selected="true" data-testid="page-tab">
          One
        </button>
      </div>
    </>
  );
}
