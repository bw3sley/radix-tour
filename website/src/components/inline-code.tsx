export function InlineCode({ children }: { children: React.ReactNode }) {
  return <code className="font-mono text-sm text-foreground">{children}</code>;
}
