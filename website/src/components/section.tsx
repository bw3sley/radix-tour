export function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex flex-col gap-3 scroll-mt-8">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>

      {children}
    </section>
  );
}
