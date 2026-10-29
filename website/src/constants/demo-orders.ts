export const DEMO_ORDERS = [
  { id: "#1042", name: "Lúcia Ferreira", items: "2× Sourdough, 1× Rye", status: "Baking" },
  { id: "#1041", name: "Kofi Mensah", items: "12× Butter croissant", status: "Ready" },
  { id: "#1040", name: "Hana Sato", items: "Birthday cake, 20 cm", status: "Ready" },
  { id: "#1039", name: "Bistro Alma", items: "30× Baguette", status: "Delivered" },
  { id: "#1038", name: "Pedro Alves", items: "6× Cinnamon roll", status: "Baking" },
];

// Status pill colors as [background, text].
export const STATUS_COLORS: Record<string, [string, string]> = {
  Baking: ["oklch(0.95 0.05 75)", "oklch(0.45 0.1 65)"],
  Ready: ["oklch(0.95 0.05 150)", "oklch(0.42 0.1 150)"],
  Delivered: ["#f1f0ed", "#6b6a66"],
};
