import type { TourStep } from "radix-tour";

export const HERO_STEPS: TourStep[] = [
  {
    id: "nav",
    target: "#demo-nav",
    side: "right",
    align: "start",
    title: "Everything lives here",
    description: "Orders, products and deliveries are one click away.",
  },
  {
    id: "search",
    target: "#demo-search",
    side: "bottom",
    align: "start",
    title: "Find an order fast",
    description: "Search by customer, product or order number.",
  },
  {
    id: "tabs",
    target: "#demo-tabs",
    side: "bottom",
    align: "start",
    title: "Filter by status",
    description: "Jump between what's baking, ready and delivered.",
  },
  {
    id: "add",
    target: "#demo-add",
    side: "bottom",
    align: "end",
    title: "Add an order",
    description: "Standing orders repeat every week.",
  },
];
