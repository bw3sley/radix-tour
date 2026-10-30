// Computed geometry, so the position stays inline.
export function PreviewArrow({ top, left }: { top: number | string; left: number | string }) {
  return (
    <div
      className="absolute size-2.5 rotate-45 bg-popover transition-all duration-400 ease-snappy"
      style={{ top, left }}
    />
  );
}
