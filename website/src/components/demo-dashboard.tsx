import { Package, Plus, Search, Settings, ShoppingBag, Truck, Users } from "lucide-react";
import { DEMO_ORDERS, STATUS_COLORS } from "../constants/demo-orders";

export function DemoDashboard() {
  return (
    <div className="demo-scroll">
      <div className="demo">
        <aside className="demo-side">
          <div className="demo-brand">
            <div className="demo-logo" />
            <div>Crumb &amp; Co.</div>
          </div>

          <nav id="demo-nav" className="demo-nav">
            <div className="demo-nav-item" data-active="">
              <ShoppingBag size={15} strokeWidth={1.75} aria-hidden />
              Orders
            </div>
            <div className="demo-nav-item">
              <Package size={15} strokeWidth={1.75} aria-hidden />
              Products
            </div>
            <div className="demo-nav-item">
              <Users size={15} strokeWidth={1.75} aria-hidden />
              Customers
            </div>
            <div className="demo-nav-item">
              <Truck size={15} strokeWidth={1.75} aria-hidden />
              Deliveries
            </div>
            <div className="demo-nav-item">
              <Settings size={15} strokeWidth={1.75} aria-hidden />
              Settings
            </div>
          </nav>

          <div className="demo-user">
            <div className="demo-avatar" />
            Marta
          </div>
        </aside>

        <div className="demo-main">
          <div className="demo-bar">
            <div id="demo-search" className="demo-search">
              <Search size={15} strokeWidth={1.75} aria-hidden />
              Search orders…
            </div>

            <div id="demo-add" className="demo-add">
              <Plus size={15} strokeWidth={2} aria-hidden />
              New order
            </div>
          </div>

          <div className="demo-title-group">
            <div className="demo-title">Orders</div>

            <div id="demo-tabs" className="demo-tabs">
              <div data-active="">All 24</div>
              <div>Baking 6</div>
              <div>Ready 9</div>
              <div>Delivered 31</div>
            </div>
          </div>

          <div className="demo-table">
            <div className="demo-row demo-row-head">
              <span>Order</span>
              <span>Customer</span>
              <span>Items</span>
              <span>Status</span>
            </div>

            {DEMO_ORDERS.map((order) => (
              <div key={order.id} className="demo-row">
                <span className="demo-id">{order.id}</span>
                <span className="demo-ellipsis">{order.name}</span>
                <span className="demo-ellipsis demo-muted">{order.items}</span>
                <span
                  className="demo-status"
                  style={{
                    background: STATUS_COLORS[order.status][0],
                    color: STATUS_COLORS[order.status][1],
                  }}
                >
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
