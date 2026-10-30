export const USAGE_CODE = `import * as Tour from "radix-tour";

const steps = [
  { id: "search", target: "#search", title: "Find an order fast" },
  { id: "new", target: "#new-order", side: "bottom", align: "end" },
];

export function OrdersTour() {
  const [open, setOpen] = React.useState(false);

  return (
    <Tour.Root steps={steps} open={open} onOpenChange={setOpen}>
      <Tour.Spotlight className="text-black/50" />
      <Tour.Content className="w-72 rounded-2xl bg-zinc-900 p-4 text-white">
        <Tour.Title />
        <Tour.Description />
        <Tour.Next>Next</Tour.Next>
      </Tour.Content>
    </Tour.Root>
  );
}`;
