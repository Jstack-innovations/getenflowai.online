import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiDollarSign, FiShoppingBag, FiCheckCircle,
  FiTruck, FiPackage, FiClock, FiList
} from "react-icons/fi";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { API_BASE } from "./Config/api";
//import ZaraWidget from "./ZaraWidget";
//import type { ZaraOrder, ZaraStats } from "./ZaraWidget";
import ZaraProWidget from "./ZaraProWidget";
import type { ZaraOrder, ZaraStats } from "./ZaraProWidget";

import AccountStatusBanner from "./AccountStatusBanner";
import "./App.css";

type OrderItem = { image: string; name: string; qty: number };
type OrderInfo = {
  order_id: number; plate_order_no: string; user_id: number;
  name: string; phone: string; order_type: string; table_no?: string;
  total_amount: string; payment_ref: string; status: string;
  order_status: string; full_address?: string; pickup_time?: string;
  created_at: string;
};
type Order = { info: OrderInfo; items: OrderItem[] };

export default function PaidOrders() {
  const navigate = useNavigate();
  
  

  const [orders,    setOrders]    = useState<Order[]>([]);
  const [stats,     setStats]     = useState<ZaraStats>({});
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [page,      setPage]      = useState(1);
  const [zaraEvent, setZaraEvent] = useState<string | undefined>(undefined); // already exists

// ADD THIS LINE right after:
const prevMenuRef = useRef<Record<number, { stock: number; available: number | boolean }>>({});

const briefingFired   = useRef(false);
const lastOrderTime   = useRef<number>(Date.now());
const idleAlertFired  = useRef(false);
const prevOrderCount  = useRef(0);
const orderTimes      = useRef<number[]>([]);
const [authChecked, setAuthChecked] = useState(false);


  // ── Fetch + 15-second poll (Zara fires on orders.length change) ────────────

const load = async () => {
  try {
    const res = await fetch(`${API_BASE}/getOrder`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (res.status === 401) { 
      navigate("/login", { replace: true }); 
      return; 
    }
    const data = await res.json();
    const sorted = (Object.values(data.orders || {}) as Order[])
      .sort((a, b) => new Date(b.info.created_at).getTime() - new Date(a.info.created_at).getTime());
    setOrders(sorted);
    setStats(data.stats || {});
    setAuthChecked(true);
  } catch (err) {
    console.error(err);
  }
};

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [navigate]);
  

// ADD THIS BLOCK right after:
useEffect(() => {
  const checkStock = async () => {
    try {
      const res = await fetch(`${API_BASE}/getMenu`, { credentials: "include" });
      if (res.status === 401) return;
      const data = await res.json();
      if (!data.menu) return;

      const allItems = Object.values(data.menu).flat() as any[];

      allItems.forEach((item: any) => {
  const prev = prevMenuRef.current[item.id];
  if (prev) {
    if (prev.stock > 0 && item.stock === 0) {
      setZaraEvent(`Stock alert: ${item.name} just ran out of stock. Remove from active service immediately. [${Date.now()}]`);
    } else if (prev.available && !item.available) {
      setZaraEvent(`Availability alert: ${item.name} has been marked unavailable. Notify kitchen and floor staff. [${Date.now()}]`);
    } else if (prev.stock > 5 && item.stock <= 5 && item.stock > 0) {
      setZaraEvent(`Low stock warning: ${item.name} has only ${item.stock} units left. Consider restocking. [${Date.now()}]`);
    } else if (prev.stock <= 5 && item.stock > 5) {
      // ADD THIS ↑ right here, as the last else if
      setZaraEvent(`Restock confirmed: ${item.name} is back in stock with ${item.stock} units. Floor staff can resume service. [${Date.now()}]`);
    }
  }
  prevMenuRef.current[item.id] = { stock: item.stock, available: item.available };
});
    } catch (err) {
      console.error("Stock poll error:", err);
    }
  };

  const t = setInterval(checkStock, 10000);
  checkStock();
  return () => clearInterval(t);
}, []);




// ── 1. DAILY BRIEFING — fires once when stats first load ──────────────────
useEffect(() => {
  if (!briefingFired.current && stats.totalPlaced) {
    const hour = new Date().getHours();
    const period = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
    setZaraEvent(
      `Dashboard opened this ${period}. Give a sharp operations briefing: ` +
      `revenue so far, orders placed, pending count, served vs delivered vs pickup split. ` +
      `Flag anything that needs attention. [${Date.now()}]`
    );
    briefingFired.current = true;
  }
}, [stats.totalPlaced]);


// ── 2. IDLE ALERT — fires if no new order in 25 minutes during peak hours ─
useEffect(() => {
  const IDLE_MINUTES = 25;
  const checkIdle = () => {
    const hour = new Date().getHours();
    const isPeak = (hour >= 11 && hour <= 14) || (hour >= 18 && hour <= 22);
    if (!isPeak) return;

    const idleMs = Date.now() - lastOrderTime.current;
    const idleMinutes = Math.floor(idleMs / 60000);

    if (idleMinutes >= IDLE_MINUTES && !idleAlertFired.current) {
      setZaraEvent(
        `Idle alert: No new orders in the last ${idleMinutes} minutes during peak hours. ` +
        `Flag this — check if the customer app or ordering system is reachable. [${Date.now()}]`
      );
      idleAlertFired.current = true;
    }
  };

  const t = setInterval(checkIdle, 60000); // check every minute
  return () => clearInterval(t);
}, []);


// ── 3. ORDER VELOCITY — detects surge or drought vs last hour ─────────────
useEffect(() => {
  if (orders.length === 0) return;

  const now = Date.now();

  // Track new orders
  if (orders.length > prevOrderCount.current) {
    const newCount = orders.length - prevOrderCount.current;
    for (let i = 0; i < newCount; i++) {
      orderTimes.current.push(now);
    }
    lastOrderTime.current = now;
    idleAlertFired.current = false;
  }
  prevOrderCount.current = orders.length;

  // Keep only last 60 minutes of timestamps
  const oneHourAgo = now - 60 * 60 * 1000;
  orderTimes.current = orderTimes.current.filter(ts => ts > oneHourAgo);

  const recentCount = orderTimes.current.length;

  // Surge: 5+ orders in last 10 minutes
  const tenMinAgo = now - 10 * 60 * 1000;
  const last10min = orderTimes.current.filter(ts => ts > tenMinAgo).length;
  if (last10min >= 5) {
    setZaraEvent(
      `Order surge detected: ${last10min} orders in the last 10 minutes. ` +
      `Kitchen needs to be on high alert. Prioritise prep speed. [${Date.now()}]`
    );
  }

  // Drought: fewer than 2 orders in last hour during peak
  const hour = new Date().getHours();
  const isPeak = (hour >= 11 && hour <= 14) || (hour >= 18 && hour <= 22);
  if (isPeak && recentCount < 2 && orders.length > 5) {
    setZaraEvent(
      `Order drought: Only ${recentCount} order(s) in the last hour during peak time. ` +
      `This is below normal — investigate. [${Date.now()}]`
    );
  }
}, [orders.length]);




  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalPlaced   = stats.totalPlaced  ?? 0;
  const totalRevenue  = stats.totalRevenue ?? 0;
  const totalServed   = stats.totalServed  ?? 0;

  const totalCompleted = orders.filter(o => {
    const s = o.info.order_status.toLowerCase();
    return s === "served" || s === "delivered" || s === "pickup";
  }).length;
  const totalPending = orders.filter(o => {
    const s = o.info.order_status.toLowerCase();
    return s !== "served" && s !== "delivered" && s !== "pickup";
  }).length;

  const pieData     = [{ name: "Completed", value: totalCompleted }, { name: "Pending", value: totalPending }];
  const PIE_COLORS  = ["#4ade80", "#fbbf24"];

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteOrder = async (id: number, plateno: string) => {
    if (!confirm("Delete this order?")) return;
    try {
      const res = await fetch(`${API_BASE}/adminDeleteOrder?id=${id}`, {
        method: "DELETE", credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 401) { navigate("/login"); return; }
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.filter(o => o.info.order_id !== id));
        setZaraEvent(`Order ${plateno} (ID #${id}) was permanently deleted by admin at ${new Date().toLocaleTimeString()}.`);
      }
    } catch (err) { console.error(err); }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const editOrder = (id: number, plateno: string) => {
    setZaraEvent(`Admin opened the edit screen for order ${plateno} (ID #${id}) at ${new Date().toLocaleTimeString()}.`);
    navigate(`/edit-order/${id}`);
  };

  // ── Pagination ─────────────────────────────────────────────────────────────
  const ROWS_PER_PAGE = 10;
  const totalPages    = Math.ceil(orders.length / ROWS_PER_PAGE);
  const paginated     = orders.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  
  if (!authChecked) return null;

  const navLinks = [
    { href: "/",                   label: "All Orders"            },
    { href: "/users",              label: "Active Users"          },
    { href: "/tables",             label: "Available Tables"      },
    { href: "/menu",               label: "Add Menu"              },
    { href: "/tax",                label: "Set Tax"               },
    { href: "/check-reservations", label: "View Reservations"     },
    { href: "/scanner",            label: "Scan Artisan Items"    },
    { href: "/offers",             label: "Set Artisanè Offers"   },
    { href: "/banners",            label: "Set Artisanè Banner"   },
    { href: "/analytics",          label: "See Business Analysis" },
    { href: "/plan",               label: "Go Premium & ++"       },
  ];

  return (
    <div className="admin-layout">

      {/* DESKTOP SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">ARTISAN <span>GRILLS</span></div>
        {navLinks.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}
        <button className="logout-link" onClick={() => navigate("/logout")}>
          <span>⎋</span> Logout
        </button>
      </aside>

      {/* MOBILE HEADER */}
      <header className="orderMobile-header">
        <div className="brand">ARTISAN <span>GRILLS</span></div>
        <button className={`hamburger ${menuOpen ? "active" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </header>

      {/* MOBILE DRAWER */}
      <div
        className="mob-backdrop"
        style={{ display: menuOpen ? "block" : "none", opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? "all" : "none" }}
        onClick={() => setMenuOpen(false)}
      />
      <nav className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        {navLinks.map(l => <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>)}
        <button className="logout-link" onClick={() => navigate("/logout")}><span>⎋</span> Logout</button>
      </nav>

      {/* MAIN */}
      <main className="main-content">
        <h2>Paid Orders</h2>
        
        {/* ── ACCOUNT STATUS ── */}
          <AccountStatusBanner />

        {/* Stat cards */}
        <div className="orderCards">
          <div className="orderCard">
            <h3><FiDollarSign style={{ marginRight: 6, verticalAlign: "middle" }} />Total Revenue</h3>
            <p>₦{(stats.totalRevenue ?? 0).toLocaleString()}</p>
            <span style={{ color: "#4ade80", fontSize: "0.8rem", fontWeight: 700 }}>{totalRevenue > 0 ? "📈 Active" : "—"}</span>
          </div>
          <div className="orderCard">
            <h3><FiShoppingBag style={{ marginRight: 6, verticalAlign: "middle" }} />Total Orders</h3>
            <p>{totalPlaced}</p>
            <span style={{ color: "#4ade80", fontSize: "0.8rem", fontWeight: 700 }}>{totalPlaced > 0 ? "Growing" : "—"}</span>
          </div>
          <div className="orderCard">
            <h3><FiList style={{ marginRight: 6, verticalAlign: "middle" }} />Total Served</h3>
            <p>{stats.totalServed ?? 0}</p>
            <span style={{ color: "#4ade80", fontSize: "0.8rem", fontWeight: 700 }}>{totalServed > 0 ? "Active" : "—"}</span>
          </div>
          <div className="orderCard">
            <h3><FiTruck style={{ marginRight: 6, verticalAlign: "middle" }} />Total Delivered</h3>
            <p>{stats.totalDelivered ?? 0}</p>
            <span style={{ color: "#93c5fd", fontSize: "0.8rem", fontWeight: 700 }}>Delivery</span>
          </div>
          <div className="orderCard">
            <h3><FiPackage style={{ marginRight: 6, verticalAlign: "middle" }} />Total Pickup</h3>
            <p>{stats.totalPickup ?? 0}</p>
            <span style={{ color: "#c4b5fd", fontSize: "0.8rem", fontWeight: 700 }}>Pickup</span>
          </div>
          <div className="orderCard">
            <h3><FiCheckCircle style={{ marginRight: 6, verticalAlign: "middle" }} />Completed</h3>
            <p>{totalCompleted}</p>
            <span style={{ color: "#4ade80", fontSize: "0.8rem", fontWeight: 700 }}>Served + Delivered + Pickup</span>
          </div>
          <div className="orderCard">
            <h3><FiClock style={{ marginRight: 6, verticalAlign: "middle" }} />Pending</h3>
            <p>{totalPending}</p>
            <span style={{ color: "#fbbf24", fontSize: "0.8rem", fontWeight: 700 }}>Awaiting</span>
          </div>
          <div className="orderCard" style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h3 style={{ marginBottom: 8 }}>Orders Overview</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                  dataKey="value" paddingAngle={3}
                  label={({ value }) => {
                    const total = totalCompleted + totalPending;
                    return total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "";
                  }}
                  labelLine={false}
                >
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(value: any, name: any) => {
                  const total = totalCompleted + totalPending;
                  return [`${value} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`, name];
                }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 16, fontSize: "0.78rem", fontWeight: 700, marginTop: 4 }}>
              <span style={{ color: "#4ade80" }}>● Completed: {totalCompleted}</span>
              <span style={{ color: "#fbbf24" }}>● Pending: {totalPending}</span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            ZARA — above the Add Order button
            ══════════════════════════════════════════ */}
{/*<ZaraWidget
  orders={orders as ZaraOrder[]}
  stats={stats}
  event={zaraEvent}
  onOrderUpdated={load}
/>*/}

<ZaraProWidget
  orders={orders as ZaraOrder[]}
  stats={stats}
  event={zaraEvent}
  onOrderUpdated={load}
  onNavigate={(path) => navigate(path)} // ADD THIS
/>

        <button className="orderBtn" onClick={() => navigate("/add-order")}>Add Order</button>

        {/* Orders table */}
        <div className="table-wrapper">
          <div className="table-body-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th><th>Plate No</th><th>User ID</th><th>Customer</th>
                  <th>Type</th><th>Table</th><th>Items</th><th>Total</th>
                  <th>Payment Ref</th><th>Status</th><th>Order Status</th>
                  <th>Address</th><th>Pickup Time</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={15}>No orders found</td></tr>
                ) : paginated.map(o => (
                  <tr key={o.info.order_id}>
                    <td>{o.info.order_id}</td>
                    <td>{o.info.plate_order_no}</td>
                    <td>{o.info.user_id}</td>
                    <td>{o.info.name}<br />{o.info.phone}</td>
                    <td>{o.info.order_type.toUpperCase()}</td>
                    <td>{o.info.table_no || "-"}</td>
                    <td>
                      <div className="order-items">
                        {(o.items || []).map((i, idx) => (
                          <div className="item" key={idx}>
                            <img src={i.image} alt="" />
                            <div>{i.name} x{i.qty}</div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>${parseFloat(o.info.total_amount).toFixed(2)}</td>
                    <td>{o.info.payment_ref}</td>
                    <td><span className={`status ${o.info.status.toLowerCase()}`}>{o.info.status}</span></td>
                    <td><span className={`status ${o.info.order_status.toLowerCase()}`}>{o.info.order_status}</span></td>
                    <td>{o.info.full_address || "-"}</td>
                    <td>{o.info.pickup_time || "-"}</td>
                    <td>{new Date(o.info.created_at).toLocaleString()}</td>
                    <td style={{ display: "flex", gap: 6 }}>
                      <button className="btn-edit"   onClick={() => editOrder(o.info.order_id, o.info.plate_order_no)}>Edit</button>
                      <button className="btn-delete" onClick={() => deleteOrder(o.info.order_id, o.info.plate_order_no)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce((acc: (number | string)[], n, idx, arr) => {
                  if (idx > 0 && (n as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(n); return acc;
                }, [])
                .map((n, idx) => n === "..." ? (
                  <span key={`e${idx}`} className="page-info">…</span>
                ) : (
                  <button key={n} className={`page-btn ${page === n ? "active" : ""}`} onClick={() => setPage(n as number)}>{n}</button>
                ))}
              <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
              <span className="page-info">Page {page} of {totalPages}</span>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
