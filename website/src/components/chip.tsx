"use client";

interface ChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  mono?: boolean;
}

export function Chip({ active, onClick, children, mono }: ChipProps) {
  return (
    <button
      type="button"
      className={mono ? "chip chip-mono" : "chip"}
      data-active={active ? "" : undefined}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
