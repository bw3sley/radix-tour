export const DEMO_ORDERS = [
  { id: "#1042", name: "Lúcia Ferreira", items: "2× Sourdough, 1× Rye", status: "Baking" },
  { id: "#1041", name: "Kofi Mensah", items: "12× Butter croissant", status: "Ready" },
  { id: "#1040", name: "Hana Sato", items: "Birthday cake, 20 cm", status: "Ready" },
  { id: "#1039", name: "Bistro Alma", items: "30× Baguette", status: "Delivered" },
  { id: "#1038", name: "Pedro Alves", items: "6× Cinnamon roll", status: "Baking" },
];

export const STATUS_STYLES: Record<string, string> = {
  Baking: "bg-warning text-warning-foreground",
  Ready: "bg-success text-success-foreground",
  Delivered: "bg-secondary text-muted-foreground",
};
