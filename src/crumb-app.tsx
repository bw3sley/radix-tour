import { CalendarDays, Package, Plus, Route, Search, Settings, Users, Wheat } from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { id: "orders", label: "Orders", icon: Package, active: true },
  { id: "route-nav", label: "Delivery routes", icon: Route },
  { id: "customers", label: "Customers", icon: Users },
  { id: "schedule", label: "Bake schedule", icon: CalendarDays },
  { id: "settings", label: "Settings", icon: Settings },
];

const statusTabs = [
  { label: "All", count: 14, active: true },
  { label: "To bake", count: 6 },
  { label: "Out for delivery", count: 5 },
  { label: "Delivered", count: 3 },
];

const statusStyles = {
  "To bake": "bg-amber/25 text-[#6b4300]",
  "Out for delivery": "bg-[#dbe8ff] text-[#1d3f8f]",
  Delivered: "bg-[#d6efe7] text-[#0a5a49]",
};

const orders = [
  {
    customer: "Harbour Café",
    items: "40 croissants, 12 sourdough batards",
    deliverBy: "6:30 am",
    status: "To bake",
  },
  {
    customer: "Nina's Deli",
    items: "8 rye loaves, 24 seeded rolls",
    deliverBy: "7:00 am",
    status: "To bake",
  },
  {
    customer: "The Stand, Pier 9",
    items: "60 cinnamon buns",
    deliverBy: "7:15 am",
    status: "Out for delivery",
  },
  {
    customer: "Okafor Catering",
    items: "20 focaccia trays",
    deliverBy: "8:00 am",
    status: "Out for delivery",
  },
  {
    customer: "Linden Street School",
    items: "120 milk rolls",
    deliverBy: "8:30 am",
    status: "Delivered",
  },
] as const;

/** A believable app to run the tour against. Targets are `#route-nav`, `#search`, `#status-tabs`, `#new-order`. */
export function CrumbApp({ actions, children }: { actions?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-mist font-sans text-ink">
      <aside className="flex w-14 shrink-0 flex-col gap-1 border-line border-r bg-white p-2 md:w-60 md:p-3">
        <div className="mb-4 flex items-center gap-2 px-2 py-2">
          <Wheat className="size-6 shrink-0 text-oven" aria-hidden />
          <span className="hidden font-semibold text-lg tracking-tight md:inline">Crumb</span>
        </div>

        <nav aria-label="Main" className="flex flex-col gap-1">
          {navItems.map((item) => (
            <a
              key={item.id}
              id={item.id === "route-nav" ? "route-nav" : undefined}
              href={`#${item.id}`}
              aria-current={item.active ? "page" : undefined}
              className="flex items-center gap-3 rounded-lg px-2.5 py-2 font-medium text-muted text-sm hover:bg-mist aria-[current=page]:bg-mist aria-[current=page]:text-ink"
            >
              <item.icon className="size-5 shrink-0" aria-hidden />
              <span className="hidden md:inline">{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 px-6 py-5 md:px-10">
        <header className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-52 max-w-sm flex-1">
            <span className="sr-only">Search orders</span>

            <Search
              className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted"
              aria-hidden
            />

            <input
              id="search"
              type="search"
              placeholder="Search customer or product"
              className="h-10 w-full rounded-lg border border-line bg-white pr-3 pl-9 text-sm outline-none placeholder:text-muted focus:border-oven focus:ring-2 focus:ring-oven/25"
            />
          </label>

          <div className="ml-auto flex items-center gap-2">
            {actions}

            <button
              id="new-order"
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-oven px-4 font-medium text-sm text-white hover:bg-oven/90"
            >
              <Plus className="size-4" aria-hidden />
              New order
            </button>
          </div>
        </header>

        <div className="mt-8">
          <h1 className="font-semibold text-3xl tracking-tight">Orders</h1>
          <p className="mt-1 text-muted text-sm">Wednesday, 7 May. 14 orders to deliver today.</p>
        </div>

        <div id="status-tabs" className="mt-6 inline-flex gap-1 rounded-xl bg-white p-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              aria-pressed={tab.active ?? false}
              className="rounded-lg px-3 py-1.5 font-medium text-muted text-sm hover:text-ink aria-pressed:bg-ink aria-pressed:text-white"
            >
              {tab.label} <span className="ml-1 tabular-nums opacity-70">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full min-w-136 text-left text-sm">
            <thead className="border-line border-b text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Deliver by</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.customer} className="border-line border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{order.customer}</td>
                  <td className="px-4 py-3 text-muted">{order.items}</td>
                  <td className="px-4 py-3 tabular-nums">{order.deliverBy}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 font-medium text-xs ${statusStyles[order.status]}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {children}
    </div>
  );
}
