import { Package, Plus, Search, Settings, ShoppingBag, Truck, Users } from "lucide-react";
import { DEMO_ORDERS, STATUS_STYLES } from "../constants/demo-orders";

const NAV_ITEM = "flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground";

export function DemoDashboard() {
  return (
    <div className="mt-11 w-full overflow-x-auto pb-1">
      <div className="relative flex h-108 min-w-170 overflow-hidden rounded-xl border bg-card text-left text-sm shadow-xl">
        <aside className="flex w-46 shrink-0 flex-col gap-5 border-r bg-muted px-3 py-4">
          <div className="flex items-center gap-2 px-1.5 text-sm font-semibold">
            <div className="size-5 rounded-md bg-accent" />
            <div>Crumb &amp; Co.</div>
          </div>

          <nav id="demo-nav" className="flex flex-col gap-0.5">
            <div className={`${NAV_ITEM} bg-card font-medium text-foreground ring-1 ring-border`}>
              <ShoppingBag size={15} strokeWidth={1.75} aria-hidden />
              Orders
            </div>
            <div className={NAV_ITEM}>
              <Package size={15} strokeWidth={1.75} aria-hidden />
              Products
            </div>
            <div className={NAV_ITEM}>
              <Users size={15} strokeWidth={1.75} aria-hidden />
              Customers
            </div>
            <div className={NAV_ITEM}>
              <Truck size={15} strokeWidth={1.75} aria-hidden />
              Deliveries
            </div>
            <div className={NAV_ITEM}>
              <Settings size={15} strokeWidth={1.75} aria-hidden />
              Settings
            </div>
          </nav>

          <div className="mt-auto flex items-center gap-2 px-1.5 text-muted-foreground">
            <div className="size-5 rounded-full bg-border" />
            Marta
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div
              id="demo-search"
              className="flex h-8 w-64 items-center gap-2 rounded-lg border px-2.5 text-subtle-foreground"
            >
              <Search size={15} strokeWidth={1.75} aria-hidden />
              Search orders…
            </div>

            <div
              id="demo-add"
              className="flex h-8 items-center gap-1.5 rounded-lg bg-primary pr-3.5 pl-2.5 font-medium text-primary-foreground"
            >
              <Plus size={15} strokeWidth={2} aria-hidden />
              New order
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="text-xl font-semibold tracking-tight">Orders</div>

            <div
              id="demo-tabs"
              className="flex gap-1 self-start rounded-lg bg-secondary p-0.75 text-muted-foreground"
            >
              <div className="rounded-md bg-card px-2.5 py-1 font-medium text-foreground shadow-xs">
                All 24
              </div>
              <div className="px-2.5 py-1">Baking 6</div>
              <div className="px-2.5 py-1">Ready 9</div>
              <div className="px-2.5 py-1">Delivered 31</div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex gap-3 border-b py-2 text-xs text-subtle-foreground">
              <span className="w-16 shrink-0">Order</span>
              <span className="flex-1">Customer</span>
              <span className="flex-1">Items</span>
              <span className="w-21 shrink-0">Status</span>
            </div>

            {DEMO_ORDERS.map((order) => (
              <div key={order.id} className="flex items-center gap-3 border-b py-2">
                <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">
                  {order.id}
                </span>
                <span className="min-w-0 flex-1 truncate">{order.name}</span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{order.items}</span>
                <span className="w-21 shrink-0">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[order.status]}`}
                  >
                    {order.status}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
