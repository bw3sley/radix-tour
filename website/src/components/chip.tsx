"use client";

interface ChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  mono?: boolean;
}

const BASE =
  "cursor-pointer border bg-card font-medium transition-colors data-active:border-primary data-active:bg-primary data-active:text-primary-foreground";

const SIZES = {
  default: "h-8 rounded-lg px-3 text-sm",
  mono: "inline-flex h-7 items-center gap-1.5 rounded-full pr-2.5 pl-2 font-mono text-xs",
};

export function Chip({ active, onClick, children, mono }: ChipProps) {
  return (
    <button
      type="button"
      className={`${BASE} ${mono ? SIZES.mono : SIZES.default}`}
      data-active={active ? "" : undefined}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
