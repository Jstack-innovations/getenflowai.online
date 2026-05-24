import { useState, useEffect, useRef } from "react";

// ─── CONFIG — swap this for your real endpoint ────────────────────────────────
const API_URL = "https://artisangrills.onrender.com/getOrder"; // ← your PHP file URL
const POLL_INTERVAL = 12000; // re-fetch every 12 s

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function elapsed(dateStr) {
  const ms = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60), rem = s % 60;
  return `${m}:${String(rem).padStart(2, "0")}`;
}
function urgency(dateStr) {
  const m = (Date.now() - new Date(dateStr).getTime()) / 60000;
  if (m > 15) return "critical";
  if (m > 8)  return "warn";
  return "ok";
}
function mapStatus(order_status) {
  const s = (order_status || "").toLowerCase();
  if (s === "served" || s === "delivered") return "READY";
  if (s === "preparing" || s === "cooking") return "COOKING";
  return "NEW";
}
function mapType(order_type) {
  const t = (order_type || "").toLowerCase();
  if (t === "pickup")   return "TAKEOUT";
  if (t === "delivery") return "DELIVERY";
  return "DINE-IN";
}

// Transform raw API { orders: { id: { info, items } }, stats } → KDS array
function transform(raw) {
  return Object.values(raw).map(({ info, items }) => ({
    id:           info.order_id,
    ticket:       `#${String(info.plate_order_no || info.order_id).padStart(4, "0")}`,
    table:        info.table_no || (info.order_type === "pickup" ? "PICKUP" : "DELIVERY"),
    customerName: info.name  || "",
    phone:        info.phone || "",
    type:         mapType(info.order_type),
    total:        parseFloat(info.total_amount || 0),
    paymentRef:   info.payment_ref  || "",
    address:      info.full_address || "",
    pickupTime:   info.pickup_time  || null,
    status:       mapStatus(info.order_status),
    rawStatus:    info.order_status,
    createdAt:    info.created_at,           // MySQL "YYYY-MM-DD HH:MM:SS"
    priority:     "NORMAL",
    items: (items || []).map(i => ({
      id:    i.order_item_id,
      name:  i.menu_name,
      qty:   i.quantity,
      price: parseFloat(i.price || 0),
      image: i.image || null,
      done:  false,
    })),
    bumped: false,
  }));
}

// Zara auto-insights triggered after a fetch
const AUTO_INSIGHTS = [
  o => o.filter(x => urgency(x.createdAt) === "critical").length > 0 &&
    `⚠ ${o.filter(x => urgency(x.createdAt) === "critical").length} ticket(s) over 15 min — expedite now.`,
  o => o.filter(x => x.type === "DELIVERY").length > 2 &&
    `${o.filter(x => x.type === "DELIVERY").length} delivery orders active. Confirm packaging speed.`,
  o => o.length > 8 &&
    `High volume — ${o.length} active tickets. Focus on oldest first.`,
];

// ─── TIMER BADGE ─────────────────────────────────────────────────────────────
function TimerBadge({ createdAt }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const u = urgency(createdAt);
  const col = { ok: "#22d3a0", warn: "#f59e0b", critical: "#ef4444" }[u];
  return (
    <span style={{
      fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700,
      color: col, letterSpacing: 1,
      animation: u === "critical" ? "pulse 0.8s ease-in-out infinite" : "none",
    }}>{elapsed(createdAt)}</span>
  );
}

// ─── ORDER CARD ───────────────────────────────────────────────────────────────
function OrderCard({ order, onBump, onToggle, onCycle, showFullId, setShowFullId }) {
  const u = urgency(order.createdAt);
  const border = u === "critical" ? "#ef4444" : u === "warn" ? "#f59e0b" : "#1e1e1e";
  const allDone = order.items.length > 0 && order.items.every(i => i.done);

  return (
    <div style={{
      background: "linear-gradient(160deg,#111 0%,#0d0d0d 100%)",
      border: `1.5px solid ${border}`, borderRadius: 10,
      padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10,
      position: "relative", overflow: "hidden",
      boxShadow: u === "critical" ? "0 0 16px #ef444428" : "none",
      animation: "slideIn 0.35s ease",
    }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span
  onClick={() => setShowFullId(order.id)}
  style={{
    fontFamily: "'JetBrains Mono',monospace",
    fontSize: 17,
    fontWeight: 800,
    color: "#f5f5f5",
    letterSpacing: 1,
    cursor: "pointer"
  }}
>
  {showFullId === order.id
    ? order.id
    : `${String(order.id).slice(0, 5)}...`}
</span>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: "2px 7px", borderRadius: 3,
              background: order.type === "DINE-IN" ? "#1e3a2f" : order.type === "TAKEOUT" ? "#1e2a3a" : "#2a1e3a",
              color:      order.type === "DINE-IN" ? "#22d3a0" : order.type === "TAKEOUT" ? "#60a5fa" : "#c084fc",
            }}>{order.type}</span>
          </div>
<div style={{
  fontSize: 12,
  color: "#b5b5b5",
  marginTop: 3,
  fontFamily: "'JetBrains Mono',monospace"
}}>
            {order.table}
            {order.customerName && <span style={{ color: "#3a3a3a", marginLeft: 8 }}>· {order.customerName}</span>}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
          <TimerBadge createdAt={order.createdAt} />
          <button onClick={() => onCycle(order.id)} style={{
            fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: "2px 8px",
            borderRadius: 3, cursor: "pointer", border: "none",
            background: order.status === "NEW" ? "#1a1a2e" : order.status === "COOKING" ? "#2a1a00" : "#0a2a1a",
            color:      order.status === "NEW" ? "#818cf8" : order.status === "COOKING" ? "#f59e0b" : "#22d3a0",
          }}>{order.status}</button>
        </div>
      </div>

      {/* Pickup / Delivery meta */}
      {order.pickupTime && (
        <div style={{ background: "#1a1200", border: "1px solid #f59e0b30", borderRadius: 5, padding: "5px 10px", fontSize: 11, color: "#f59e0b" }}>
          ⏱ Pickup: {order.pickupTime}
        </div>
      )}
      {order.type === "DELIVERY" && order.address && (
        <div style={{ background: "#14001a", border: "1px solid #c084fc30", borderRadius: 5, padding: "5px 10px", fontSize: 11, color: "#c084fc" }}>
          📍 {order.address}
        </div>
      )}

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {order.items.map((item, i) => (
          <div key={item.id || i} style={{
            display: "flex", alignItems: "center", gap: 9,
            opacity: item.done ? 0.35 : 1, transition: "opacity 0.3s",
          }}>
            <button onClick={() => onToggle(order.id, i)} style={{
              width: 18, height: 18, borderRadius: 4, flexShrink: 0,
              background: item.done ? "#22d3a0" : "transparent",
              border: `1.5px solid ${item.done ? "#22d3a0" : "#333"}`,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}>
              {item.done && <span style={{ fontSize: 10, color: "#000", fontWeight: 900 }}>✓</span>}
            </button>

            {item.image && (
              <img src={item.image} alt={item.name}
                onError={e => { e.target.style.display = "none"; }}
                style={{ width: 28, height: 28, borderRadius: 5, objectFit: "cover", flexShrink: 0, border: "1px solid #1e1e1e" }} />
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 700,
                color: item.done ? "#333" : "#e8e8e8",
                textDecoration: item.done ? "line-through" : "none",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {item.qty > 1 && <span style={{ color: "#f97316", marginRight: 4 }}>×{item.qty}</span>}
                {item.name}
              </div>
            </div>

            <span style={{ fontSize: 11, color: "#2a2a2a", fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>
              ${(item.price * item.qty).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4, borderTop: "1px solid #141414" }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#cfcfcf" }}>
          ${order.total.toFixed(2)}
          {order.paymentRef && <span style={{ marginLeft: 8, color: "#1e1e1e" }}>{order.paymentRef}</span>}
        </span>
        <button onClick={() => onBump(order.id)} style={{
          padding: "6px 14px", borderRadius: 6, border: "1px solid #1e1e1e",
          background: allDone ? "linear-gradient(135deg,#0f3d2a,#0a2a1a)" : "#0d0d0d",
          color: allDone ? "#22d3a0" : "#333",
          fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700,
          letterSpacing: 1, cursor: "pointer", transition: "all 0.2s",
        }}>{allDone ? "✓ BUMP" : "BUMP"}</button>
      </div>
    </div>
  );
}

// ─── ZARA PANEL ───────────────────────────────────────────────────────────────
function ZaraPanel({ messages, onAsk, input, setInput, thinking }) {
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div style={{
      background: "#080808", display: "flex", flexDirection: "column",
      height: "100%", minHeight: 0, borderLeft: "1px solid #141414",
    }}>
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid #141414",
        display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "linear-gradient(135deg,#7c3aed,#a855f7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, animation: "zaraGlow 2s ease-in-out infinite",
        }}>✦</div>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, color: "#c4b5fd", letterSpacing: 2 }}>ZARA AI</div>
          <div style={{ fontSize: 9, color: "#333", letterSpacing: 1 }}>KITCHEN INTELLIGENCE</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22d3a0", animation: "pulse 1.5s ease-in-out infinite" }} />
          <span style={{ fontSize: 9, color: "#22d3a0", fontFamily: "'JetBrains Mono',monospace" }}>LIVE</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex", gap: 8,
            flexDirection: m.role === "user" ? "row-reverse" : "row",
            animation: "fadeUp 0.3s ease",
          }}>
            {m.role === "zara" && (
              <div style={{
                width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10,
              }}>✦</div>
            )}
            <div style={{
              maxWidth: "85%", padding: "9px 12px", borderRadius: 8,
              background: m.role === "user" ? "#1a1a2e" : "#111",
              border: `1px solid ${m.role === "user" ? "#3730a3" : "#1e1e1e"}`,
              fontSize: 12, color: m.role === "user" ? "#a5b4fc" : "#ccc",
              lineHeight: 1.6,
            }}>
              {m.role === "zara" && (
                <div style={{ fontSize: 9, color: "#7c3aed", fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>ZARA</div>
              )}
              {m.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0 }}>✦</div>
            <div style={{ padding: "9px 14px", borderRadius: 8, background: "#111", border: "1px solid #1e1e1e" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map(j => (
                  <div key={j} style={{ width: 5, height: 5, borderRadius: "50%", background: "#7c3aed", animation: `dotBounce 1s ease-in-out ${j * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "10px 12px", borderTop: "1px solid #141414", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onAsk()}
            placeholder="Ask Zara about any order…"
            style={{
              flex: 1, background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 7,
              padding: "8px 12px", color: "#e0e0e0", fontSize: 12, outline: "none",
            }}
          />
          <button onClick={onAsk} style={{
            padding: "8px 14px", borderRadius: 7,
            background: "linear-gradient(135deg,#7c3aed,#a855f7)",
            border: "none", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: 1,
          }}>ASK</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function EnflowKDS() {
  const [showFullId, setShowFullId] = useState(null);
  const [orders,   setOrders]   = useState([]);
  const [apiStats, setApiStats] = useState({ totalPlaced: 0, totalServed: 0, totalDelivered: 0, totalPickup: 0, totalRevenue: 0 });
  const [loading,  setLoading]  = useState(true);
  const [apiError, setApiError] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  const [typeFilter, setTypeFilter]   = useState("ALL");
  const [view,       setView]         = useState("KDS");
  const [notif,      setNotif]        = useState(null);

  const [zaraMessages, setZaraMessages] = useState([
    { role: "zara", text: "Good evening. Connecting to Enflow kitchen data…" },
  ]);
  const [zaraInput,    setZaraInput]    = useState("");
  const [zaraThinking, setZaraThinking] = useState(false);

  function notify(msg) {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3500);
  }

  // ── FETCH ──────────────────────────────────────────────────────────────────
  async function fetchOrders(silent = false) {
    if (!silent) setLoading(true);
    try {
      const res  = await fetch(API_URL, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const fresh = transform(data.orders || {});

      // Merge: preserve local item.done toggles for existing orders
      setOrders(prev => {
        const prevMap = Object.fromEntries(prev.map(o => [o.id, o]));
        return fresh.map(o => {
          const old = prevMap[o.id];
          if (!old) return o;
          // Keep bumped state + item done state; refresh everything else
          return {
            ...o,
            bumped: old.bumped,
            status: old.status,          // keep local status cycle
            items: o.items.map((item, i) => ({
              ...item,
              done: old.items[i]?.done ?? false,
            })),
          };
        });
      });

      setApiStats(data.stats || {});
      setLastSync(new Date());
      setApiError(null);

      // Zara intro on first load
      if (!silent) {
        const active = fresh.filter(o => !o.bumped);
        setZaraMessages(prev => [
          ...prev,
          {
            role: "zara",
            text: `Loaded ${fresh.length} orders — ${fresh.filter(o => o.type === "DINE-IN").length} dine-in · ${fresh.filter(o => o.type === "TAKEOUT").length} pickup · ${fresh.filter(o => o.type === "DELIVERY").length} delivery. Revenue today: $${parseFloat(data.stats?.totalRevenue || 0).toFixed(2)}.`,
          },
        ]);
        for (const fn of AUTO_INSIGHTS) {
          const msg = fn(active);
          if (msg) {
            setZaraMessages(prev => [...prev, { role: "zara", text: msg }]);
            break;
          }
        }
      }
    } catch (e) {
      setApiError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders(false);
    const t = setInterval(() => fetchOrders(true), POLL_INTERVAL);
    return () => clearInterval(t);
  }, []);

  // ── KDS ACTIONS ────────────────────────────────────────────────────────────
  function bumpOrder(id) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, bumped: true } : o));
    notify("Ticket bumped — sent to expo ✓");
  }
  function toggleItem(orderId, idx) {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const items = o.items.map((item, i) => i === idx ? { ...item, done: !item.done } : item);
      const allDone = items.every(x => x.done);
      return { ...o, items, status: allDone ? "READY" : o.status === "NEW" ? "COOKING" : o.status };
    }));
  }
  function cycleStatus(id) {
    const cycle = { NEW: "COOKING", COOKING: "READY", READY: "NEW" };
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: cycle[o.status] || o.status } : o));
  }

  // ── ZARA ───────────────────────────────────────────────────────────────────
  async function askZara() {
    if (!zaraInput.trim()) return;
    const q = zaraInput.trim();
    setZaraInput("");
    setZaraMessages(prev => [...prev, { role: "user", text: q }]);
    setZaraThinking(true);

    const active = visibleOrders;
    const orderSummary = active.slice(0, 12).map(o =>
      `Ticket ${o.ticket} | ${o.type} | Table: ${o.table} | Items: ${o.items.map(i => `${i.qty}× ${i.name}`).join(", ")} | Age: ${elapsed(o.createdAt)} | Status: ${o.status}`
    ).join("\n");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are Zara, the AI kitchen intelligence inside Enflow restaurant software. Be sharp, concise, and actionable — sous-chef tone. No fluff.

Live kitchen data:
- Active tickets: ${active.length}
- Critical (>15 min): ${active.filter(o => urgency(o.createdAt) === "critical").length}
- Revenue today: $${apiStats.totalRevenue?.toFixed(2) || "0.00"}
- Total served: ${apiStats.totalServed || 0}

Active orders:
${orderSummary || "None active"}`,
          messages: [{ role: "user", content: q }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "Can't respond right now.";
      setZaraMessages(prev => [...prev, { role: "zara", text }]);
    } catch {
      setZaraMessages(prev => [...prev, { role: "zara", text: "Network error. Check connection." }]);
    } finally {
      setZaraThinking(false);
    }
  }

  // ── DERIVED ────────────────────────────────────────────────────────────────
  const visibleOrders = orders
    .filter(o => !o.bumped)
    .filter(o => typeFilter === "ALL" || o.type === typeFilter)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));  // oldest first

  const counts = {
    new:      visibleOrders.filter(o => o.status === "NEW").length,
    cooking:  visibleOrders.filter(o => o.status === "COOKING").length,
    ready:    visibleOrders.filter(o => o.status === "READY").length,
    critical: visibleOrders.filter(o => urgency(o.createdAt) === "critical").length,
  };

  const now     = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      background: "#060606", minHeight: "100vh",
      fontFamily: "'DM Sans',sans-serif", color: "#e0e0e0",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0a0a0a}::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:2px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes shimmer{0%{background-position:0% 0}100%{background-position:200% 0}}
        @keyframes slideIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes zaraGlow{0%,100%{box-shadow:0 0 12px #7c3aed60}50%{box-shadow:0 0 22px #a855f780}}
        @keyframes dotBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes notifIn{from{transform:translateY(-50px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        button:hover{filter:brightness(1.15)}
      `}</style>

      {/* Toast */}
      {notif && (
        <div style={{
          position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)",
          background: "#0d1f17", border: "1px solid #22d3a0", borderRadius: 8,
          padding: "10px 20px", fontSize: 12, color: "#22d3a0", fontWeight: 600,
          zIndex: 999, animation: "notifIn 0.3s ease", boxShadow: "0 4px 24px #22d3a030",
          whiteSpace: "nowrap",
        }}>{notif}</div>
      )}

      {/* ── TOP BAR ── */}
      <div style={{
        display: "flex", alignItems: "center", padding: "0 20px", height: 56,
        borderBottom: "1px solid #141414",
        background: "linear-gradient(180deg,#0a0a0a,#060606)",
        flexShrink: 0, gap: 14,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 7,
            background: "linear-gradient(135deg,#0ea5e9,#22d3a0)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 900, color: "#000",
          }}>E</div>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 800, color: "#f5f5f5", letterSpacing: 2 }}>ENFLOW</div>
            <div style={{ fontSize: 8, color: "#2a2a2a", letterSpacing: 2 }}>KDS · KITCHEN DISPLAY</div>
          </div>
        </div>

        <div style={{ width: 1, height: 30, background: "#1a1a1a" }} />

        {["KDS","ANALYTICS"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            background: view === v ? "#111" : "transparent",
            border: `1px solid ${view === v ? "#2a2a2a" : "transparent"}`,
            borderRadius: 6, padding: "5px 12px",
            color: view === v ? "#e0e0e0" : "#3a3a3a",
            fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: 1.5,
          }}>{v}</button>
        ))}

        <div style={{ width: 1, height: 30, background: "#1a1a1a" }} />

        {/* Type filter */}
        {["ALL","DINE-IN","TAKEOUT","DELIVERY"].map(t => {
          const n = t === "ALL" ? visibleOrders.length : visibleOrders.filter(o => o.type === t).length;
          return (
            <button key={t} onClick={() => setTypeFilter(t)} style={{
              padding: "4px 10px", borderRadius: 5,
              background: typeFilter === t ? "#111" : "transparent",
              border: `1px solid ${typeFilter === t ? "#2a2a2a" : "transparent"}`,
              color: typeFilter === t ? "#e0e0e0" : "#3a3a3a",
              fontSize: 9, fontWeight: 700, cursor: "pointer", letterSpacing: 1,
            }}>{t} {n > 0 && <span style={{ color: "#444" }}>{n}</span>}</button>
          );
        })}

        {/* Right KPIs */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 18 }}>
          {[
            { label: "NEW",      val: counts.new,      color: "#818cf8" },
            { label: "COOKING",  val: counts.cooking,  color: "#f59e0b" },
            { label: "READY",    val: counts.ready,    color: "#22d3a0" },
            { label: "CRITICAL", val: counts.critical, color: "#ef4444" },
          ].map(k => (
            <div key={k.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 17, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.val}</div>
              <div style={{ fontSize: 8, color: "#2a2a2a", letterSpacing: 1 }}>{k.label}</div>
            </div>
          ))}

          <div style={{ width: 1, height: 30, background: "#1a1a1a" }} />

          {/* Sync status */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: apiError ? "#ef4444" : "#22d3a0", animation: "pulse 1.5s ease-in-out infinite" }} />
              <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: apiError ? "#ef4444" : "#22d3a0" }}>
                {apiError ? "ERROR" : "LIVE"}
              </span>
            </div>
            {lastSync && <span style={{ fontSize: 8, color: "#222", fontFamily: "'JetBrains Mono',monospace" }}>{lastSync.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false})}</span>}
          </div>

          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 17, fontWeight: 800, color: "#1e1e1e", letterSpacing: 2 }}>{timeStr}</div>

          <button onClick={() => fetchOrders(false)} title="Refresh" style={{
            width: 28, height: 28, borderRadius: 6, background: "#0d0d0d",
            border: "1px solid #1a1a1a", cursor: "pointer", color: "#444", fontSize: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>↻</button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {view === "KDS" ? (
          <>
            {/* ORDER GRID */}
            <div style={{
              flex: 1, overflowY: "auto", padding: 16,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))",
              gap: 12, alignContent: "start",
            }}>
              {/* Loading */}
              {loading && orders.length === 0 && (
                <div style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80, gap: 14 }}>
                  <div style={{ width: 32, height: 32, border: "2px solid #1a1a1a", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#333", letterSpacing: 2 }}>CONNECTING TO ENFLOW…</div>
                </div>
              )}

              {/* API Error */}
              {apiError && (
                <div style={{
                  gridColumn: "1/-1", background: "#140a0a", border: "1px solid #ef444430",
                  borderRadius: 10, padding: "28px 24px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 11, color: "#ef4444", fontFamily: "'JetBrains Mono',monospace", marginBottom: 8, letterSpacing: 2 }}>API ERROR</div>
                  <div style={{ fontSize: 12, color: "#555", marginBottom: 16 }}>{apiError}</div>
                  <div style={{ fontSize: 11, color: "#2a2a2a", lineHeight: 1.8 }}>
                    Update <code style={{ color: "#7c3aed", background: "#1a1a1a", padding: "1px 6px", borderRadius: 3 }}>API_URL</code> at the top of this file to your Enflow PHP endpoint.
                  </div>
                  <button onClick={() => fetchOrders(false)} style={{
                    marginTop: 18, padding: "8px 20px", borderRadius: 6,
                    background: "#1a0a0a", border: "1px solid #ef444440",
                    color: "#ef4444", fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: 1,
                  }}>RETRY</button>
                </div>
              )}

              {/* Empty */}
              {!loading && !apiError && visibleOrders.length === 0 && (
                <div style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80, gap: 10 }}>
                  <div style={{ fontSize: 36 }}>✓</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: "#22d3a0", letterSpacing: 2 }}>ALL CLEAR</div>
                  <div style={{ fontSize: 12, color: "#2a2a2a" }}>No active orders</div>
                </div>
              )}

              {/* Cards */}
              {visibleOrders.map(order => (
<OrderCard
  key={order.id}
  order={order}
  onBump={bumpOrder}
  onToggle={toggleItem}
  onCycle={cycleStatus}
  showFullId={showFullId}
  setShowFullId={setShowFullId}
/>
              ))}
            </div>

            {/* ZARA SIDEBAR */}
            <div style={{ width: 300, flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <ZaraPanel
                messages={zaraMessages}
                onAsk={askZara}
                input={zaraInput}
                setInput={setZaraInput}
                thinking={zaraThinking}
              />
            </div>
          </>
        ) : (
          /* ── ANALYTICS ── */
          <div style={{ flex: 1, padding: 28, overflowY: "auto" }}>
            <div style={{ maxWidth: 860, margin: "0 auto" }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#333", letterSpacing: 2, marginBottom: 24 }}>
                SHIFT ANALYTICS · {now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                {lastSync && <span style={{ color: "#222", marginLeft: 16 }}>synced {lastSync.toLocaleTimeString()}</span>}
              </div>

              {/* API stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "TOTAL ORDERS", val: apiStats.totalPlaced,    color: "#60a5fa", unit: "placed today"  },
                  { label: "SERVED",       val: apiStats.totalServed,     color: "#22d3a0", unit: "completed"    },
                  { label: "PICKUP",       val: apiStats.totalPickup,     color: "#a78bfa", unit: "takeout"      },
                  { label: "REVENUE",      val: `$${(apiStats.totalRevenue||0).toFixed(2)}`, color: "#f59e0b", unit: "today" },
                ].map(s => (
                  <div key={s.label} style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 10, padding: "18px 20px" }}>
                    <div style={{ fontSize: 8, color: "#2a2a2a", letterSpacing: 2, marginBottom: 10 }}>{s.label}</div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 26, fontWeight: 800, color: s.color }}>{s.val ?? 0}</div>
                    <div style={{ fontSize: 10, color: "#1e1e1e", marginTop: 4 }}>{s.unit}</div>
                  </div>
                ))}
              </div>

              {/* Active status breakdown */}
              <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 10, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: "#333", letterSpacing: 2, marginBottom: 14, fontFamily: "'JetBrains Mono',monospace" }}>ACTIVE STATUS</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { label: "NEW",      count: counts.new,      color: "#818cf8" },
                    { label: "COOKING",  count: counts.cooking,  color: "#f59e0b" },
                    { label: "READY",    count: counts.ready,    color: "#22d3a0" },
                    { label: "CRITICAL", count: counts.critical, color: "#ef4444" },
                  ].map(s => (
                    <div key={s.label} style={{ flex:1, background:"#111", border:"1px solid #1a1a1a", borderRadius:8, padding:"14px 0", textAlign:"center" }}>
                      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:26, fontWeight:800, color:s.color }}>{s.count}</div>
                      <div style={{ fontSize:8, color:"#2a2a2a", letterSpacing:1, marginTop:4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Type breakdown */}
              <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 10, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: "#333", letterSpacing: 2, marginBottom: 14, fontFamily: "'JetBrains Mono',monospace" }}>ORDER TYPE MIX</div>
                {[
                  { label: "DINE-IN",  color: "#22d3a0", type: "DINE-IN"  },
                  { label: "TAKEOUT",  color: "#60a5fa", type: "TAKEOUT"  },
                  { label: "DELIVERY", color: "#c084fc", type: "DELIVERY" },
                ].map(row => {
                  const count = orders.filter(o => o.type === row.type).length;
                  const pct   = orders.length ? (count / orders.length) * 100 : 0;
                  return (
                    <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
                      <div style={{ width: 70, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: "#444", letterSpacing: 1 }}>{row.label}</div>
                      <div style={{ flex: 1, height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 3, width: `${pct}%`, background: row.color, transition: "width 0.8s ease" }} />
                      </div>
                      <div style={{ width: 24, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: "#333", textAlign: "right" }}>{count}</div>
                    </div>
                  );
                })}
              </div>

              {/* Live order log */}
              <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 10, padding: 20 }}>
                <div style={{ fontSize: 10, color: "#333", letterSpacing: 2, marginBottom: 14, fontFamily: "'JetBrains Mono',monospace" }}>ACTIVE ORDER LOG</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {visibleOrders.slice(0, 20).map(o => (
                    <div key={o.id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 12px", background: "#111", borderRadius: 6, border: "1px solid #1a1a1a", gap: 12,
                    }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "#444", flexShrink: 0 }}>{o.ticket}</span>
                      <span style={{ fontSize: 11, color: "#333", flexShrink: 0 }}>{o.table}</span>
                      <span style={{ fontSize: 11, color: "#222", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {o.items.map(i => `${i.qty}× ${i.name}`).join(", ")}
                      </span>
                      <TimerBadge createdAt={o.createdAt} />
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 3, flexShrink: 0,
                        background: o.status === "NEW" ? "#1a1a2e" : o.status === "COOKING" ? "#2a1a00" : "#0a2a1a",
                        color:      o.status === "NEW" ? "#818cf8" : o.status === "COOKING" ? "#f59e0b" : "#22d3a0",
                      }}>{o.status}</span>
                    </div>
                  ))}
                  {visibleOrders.length === 0 && <div style={{ fontSize: 12, color: "#1e1e1e", textAlign: "center", padding: 20 }}>No active orders</div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
