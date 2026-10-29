export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 [&>p]:text-base [&>p]:leading-relaxed [&>p]:text-pretty [&>p]:text-muted-foreground [&_p_code]:font-mono [&_p_code]:text-sm [&_p_code]:text-foreground">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>

      {children}
    </section>
  );
}
