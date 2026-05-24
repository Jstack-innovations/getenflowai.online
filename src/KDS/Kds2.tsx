import { useState, useEffect, useRef, useCallback } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MENU_ITEMS = [
  "Wagyu Smash Burger", "Truffle Fries", "Lobster Bisque", "Pan-Seared Salmon",
  "Duck Confit", "Mushroom Risotto", "Caesar Salad", "Beef Tenderloin",
  "Miso Glazed Cod", "Burrata & Heirloom", "Short Rib Tacos", "Lamb Chops",
  "Gnocchi Pomodoro", "Seared Scallops", "Chicken Milanese", "Crab Cakes"
];
const STATIONS = ["GRILL", "SAUTÉ", "COLD", "FRYER", "PASTRY", "EXPO"];
const TABLES = ["T-01","T-02","T-03","T-04","T-05","T-06","T-07","T-08","T-09","T-10","BAR-1","BAR-2","TAKE-01","TAKE-02"];
const MODS = ["No onion","Extra sauce","Well done","Medium rare","Gluten-free","Dairy-free","Extra spicy","On the side"];

let nextId = 100;
function genOrder() {
  const id = nextId++;
  const itemCount = Math.floor(Math.random() * 3) + 1;
  const items = Array.from({ length: itemCount }, () => ({
    name: MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)],
    qty: Math.floor(Math.random() * 2) + 1,
    mod: Math.random() > 0.6 ? MODS[Math.floor(Math.random() * MODS.length)] : null,
    station: STATIONS[Math.floor(Math.random() * 4)],
    done: false,
  }));
  return {
    id,
    ticket: `#${String(id).padStart(4,"0")}`,
    table: TABLES[Math.floor(Math.random() * TABLES.length)],
    type: Math.random() > 0.8 ? (Math.random() > 0.5 ? "TAKEOUT" : "DELIVERY") : "DINE-IN",
    items,
    status: "NEW",        // NEW | COOKING | READY | BUMPED
    priority: Math.random() > 0.85 ? "RUSH" : "NORMAL",
    createdAt: Date.now() - Math.floor(Math.random() * 180000),
    note: Math.random() > 0.75 ? ["VIP guest","Allergy alert: nuts","Birthday table","Large party"][Math.floor(Math.random()*4)] : null,
  };
}

const ZARA_MESSAGES = [
  "Ticket #0107 approaching 12-min threshold — consider expediting.",
  "Grill station load high. 3 items can be reassigned to Sauté.",
  "Table T-04 allergic to shellfish. 2 tickets affected.",
  "Rush hour peak in 8 min. Prep Truffle Fries in advance.",
  "Ticket #0099 bumped 4 minutes ago — guest inquired at front.",
  "Average cook time trending +2 min above target. Adjust pacing.",
  "Delivery order TAKE-02 — driver ETA 6 min. Prioritize.",
  "Cold station idle. Assign T-08 salads now to stay ahead.",
  "3 scallop dishes queued. Recommend batch cooking for efficiency.",
  "VIP table T-01 — executive chef review recommended.",
];

// ─── UTILITIES ────────────────────────────────────────────────────────────────
function elapsed(ms) {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60), rem = s % 60;
  return `${m}:${String(rem).padStart(2,"0")}`;
}
function urgency(ms) {
  const m = (Date.now() - ms) / 60000;
  if (m > 15) return "critical";
  if (m > 8)  return "warn";
  return "ok";
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
function TimerBadge({ createdAt }) {
  const [, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(n => n+1), 1000); return () => clearInterval(t); }, []);
  const u = urgency(createdAt);
  const colors = { ok: "#22d3a0", warn: "#f59e0b", critical: "#ef4444" };
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700,
      color: colors[u], letterSpacing: 1,
      animation: u === "critical" ? "pulse 0.8s ease-in-out infinite" : "none",
    }}>{elapsed(createdAt)}</span>
  );
}

function OrderCard({ order, onBump, onStatusCycle, activeStation }) {
  const u = urgency(order.createdAt);
  const borderColor = order.priority === "RUSH" ? "#f97316"
    : u === "critical" ? "#ef4444" : u === "warn" ? "#f59e0b" : "#2a2a2a";

  const visibleItems = activeStation === "ALL"
    ? order.items
    : order.items.filter(i => i.station === activeStation);
  if (visibleItems.length === 0) return null;

  const allDone = order.items.every(i => i.done);

  return (
    <div style={{
      background: "linear-gradient(160deg,#111111 0%,#0d0d0d 100%)",
      border: `1.5px solid ${borderColor}`,
      borderRadius: 10,
      padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: 10,
      position: "relative", overflow: "hidden",
      boxShadow: order.priority === "RUSH" ? "0 0 18px #f9731640" : u === "critical" ? "0 0 14px #ef444430" : "none",
      animation: order.status === "NEW" ? "slideIn 0.35s ease" : "none",
      minWidth: 0,
    }}>
      {/* Rush stripe */}
      {order.priority === "RUSH" && (
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:3,
          background:"linear-gradient(90deg,#f97316,#ef4444,#f97316)",
          backgroundSize:"200% 100%",
          animation:"shimmer 1.5s linear infinite",
        }}/>
      )}

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:17, fontWeight:800, color:"#f5f5f5", letterSpacing:1 }}>
              {order.ticket}
            </span>
            {order.priority === "RUSH" && (
              <span style={{ background:"#f97316", color:"#000", fontSize:9, fontWeight:900, padding:"2px 6px", borderRadius:3, letterSpacing:1 }}>RUSH</span>
            )}
            <span style={{
              fontSize:9, fontWeight:700, letterSpacing:1, padding:"2px 7px", borderRadius:3,
              background: order.type === "DINE-IN" ? "#1e3a2f" : order.type === "TAKEOUT" ? "#1e2a3a" : "#2a1e3a",
              color: order.type === "DINE-IN" ? "#22d3a0" : order.type === "TAKEOUT" ? "#60a5fa" : "#c084fc",
            }}>{order.type}</span>
          </div>
          <div style={{ fontSize:12, color:"#666", marginTop:2, fontFamily:"'JetBrains Mono',monospace" }}>
            {order.table}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
          <TimerBadge createdAt={order.createdAt} />
          <span style={{
            fontSize:9, fontWeight:700, letterSpacing:1, padding:"2px 7px", borderRadius:3,
            background: order.status === "NEW" ? "#1a1a2e" : order.status === "COOKING" ? "#2a1a00" : "#0a2a1a",
            color: order.status === "NEW" ? "#818cf8" : order.status === "COOKING" ? "#f59e0b" : "#22d3a0",
            cursor:"pointer", border:"1px solid transparent",
          }}
            onClick={() => onStatusCycle(order.id)}
          >{order.status}</span>
        </div>
      </div>

      {/* Note */}
      {order.note && (
        <div style={{
          background:"#1a1200", border:"1px solid #f59e0b40", borderRadius:5,
          padding:"5px 10px", fontSize:11, color:"#f59e0b", fontWeight:600, letterSpacing:0.5,
        }}>⚠ {order.note}</div>
      )}

      {/* Items */}
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {visibleItems.map((item, i) => (
          <div key={i} style={{
            display:"flex", alignItems:"flex-start", gap:8,
            opacity: item.done ? 0.4 : 1,
            transition:"opacity 0.3s",
          }}>
            <button
              onClick={() => onStatusCycle(order.id, i)}
              style={{
                width:18, height:18, borderRadius:4, flexShrink:0, marginTop:1,
                background: item.done ? "#22d3a0" : "transparent",
                border: `1.5px solid ${item.done ? "#22d3a0" : "#444"}`,
                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all 0.2s",
              }}
            >
              {item.done && <span style={{ fontSize:10, color:"#000", fontWeight:900 }}>✓</span>}
            </button>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{
                  fontSize:13, fontWeight:700, color: item.done ? "#444" : "#e8e8e8",
                  textDecoration: item.done ? "line-through" : "none",
                  fontFamily:"'DM Sans',sans-serif",
                }}>
                  {item.qty > 1 && <span style={{ color:"#f97316", marginRight:4 }}>×{item.qty}</span>}
                  {item.name}
                </span>
                <span style={{
                  fontSize:9, color:"#555", fontFamily:"'JetBrains Mono',monospace",
                  letterSpacing:1, marginLeft:6, flexShrink:0,
                }}>{item.station}</span>
              </div>
              {item.mod && (
                <div style={{ fontSize:11, color:"#a78bfa", marginTop:2 }}>↳ {item.mod}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bump button */}
      <button
        onClick={() => onBump(order.id)}
        style={{
          marginTop:4, padding:"7px", borderRadius:6, border:"1px solid #2a2a2a",
          background: allDone ? "linear-gradient(135deg,#0f3d2a,#0a2a1a)" : "#111",
          color: allDone ? "#22d3a0" : "#555",
          fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700,
          letterSpacing:1, cursor:"pointer", transition:"all 0.2s",
        }}
      >{allDone ? "✓ BUMP ORDER" : "BUMP"}</button>
    </div>
  );
}

function ZaraPanel({ messages, onAsk, zaraInput, setZaraInput, zaraThinking }) {
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  return (
    <div style={{
      background:"#080808", border:"1px solid #1a1a1a", borderRadius:12,
      display:"flex", flexDirection:"column", overflow:"hidden",
      height:"100%", minHeight:0,
    }}>
      <div style={{
        padding:"12px 16px", borderBottom:"1px solid #1a1a1a",
        display:"flex", alignItems:"center", gap:10, flexShrink:0,
      }}>
        <div style={{
          width:32, height:32, borderRadius:"50%",
          background:"linear-gradient(135deg,#7c3aed,#a855f7)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:14, boxShadow:"0 0 12px #7c3aed60",
          animation:"zaraGlow 2s ease-in-out infinite",
        }}>✦</div>
        <div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, color:"#c4b5fd", letterSpacing:2 }}>ZARA AI</div>
          <div style={{ fontSize:9, color:"#555", letterSpacing:1 }}>KITCHEN INTELLIGENCE</div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:5 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#22d3a0", animation:"pulse 1.5s ease-in-out infinite" }}/>
          <span style={{ fontSize:9, color:"#22d3a0", fontFamily:"'JetBrains Mono',monospace" }}>LIVE</span>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display:"flex", gap:8,
            flexDirection: m.role === "user" ? "row-reverse" : "row",
            animation:"fadeUp 0.3s ease",
          }}>
            {m.role === "zara" && (
              <div style={{
                width:24, height:24, borderRadius:"50%", flexShrink:0,
                background:"linear-gradient(135deg,#7c3aed,#a855f7)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:10,
              }}>✦</div>
            )}
            <div style={{
              maxWidth:"85%", padding:"9px 12px", borderRadius:8,
              background: m.role === "user" ? "#1a1a2e" : "#111",
              border: `1px solid ${m.role === "user" ? "#3730a3" : "#1e1e1e"}`,
              fontSize:12, color: m.role === "user" ? "#a5b4fc" : "#ccc",
              lineHeight:1.6, fontFamily:"'DM Sans',sans-serif",
            }}>
              {m.role === "zara" && (
                <div style={{ fontSize:9, color:"#7c3aed", fontWeight:700, letterSpacing:1, marginBottom:4 }}>ZARA</div>
              )}
              {m.text}
            </div>
          </div>
        ))}
        {zaraThinking && (
          <div style={{ display:"flex", gap:8 }}>
            <div style={{ width:24, height:24, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, flexShrink:0 }}>✦</div>
            <div style={{ padding:"9px 14px", borderRadius:8, background:"#111", border:"1px solid #1e1e1e" }}>
              <div style={{ display:"flex", gap:4 }}>
                {[0,1,2].map(j => (
                  <div key={j} style={{
                    width:5, height:5, borderRadius:"50%", background:"#7c3aed",
                    animation:`dotBounce 1s ease-in-out ${j*0.2}s infinite`,
                  }}/>
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div style={{ padding:"10px 12px", borderTop:"1px solid #1a1a1a", flexShrink:0 }}>
        <div style={{ display:"flex", gap:8 }}>
          <input
            value={zaraInput}
            onChange={e => setZaraInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onAsk()}
            placeholder="Ask Zara anything…"
            style={{
              flex:1, background:"#0d0d0d", border:"1px solid #222", borderRadius:7,
              padding:"8px 12px", color:"#e0e0e0", fontSize:12,
              fontFamily:"'DM Sans',sans-serif", outline:"none",
            }}
          />
          <button onClick={onAsk} style={{
            padding:"8px 14px", borderRadius:7,
            background:"linear-gradient(135deg,#7c3aed,#a855f7)",
            border:"none", color:"#fff", fontSize:11, fontWeight:700,
            cursor:"pointer", letterSpacing:1,
          }}>ASK</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN KDS ─────────────────────────────────────────────────────────────────
export default function EnflowKDS() {
  const [orders, setOrders] = useState(() => Array.from({ length: 8 }, genOrder));
  const [activeStation, setActiveStation] = useState("ALL");
  const [zaraMessages, setZaraMessages] = useState([
    { role:"zara", text:"Good evening. I'm monitoring 8 active tickets across all stations. Grill has highest load. Rush hour in ~10 minutes — I'd suggest prepping cold items now." },
  ]);
  const [zaraInput, setZaraInput] = useState("");
  const [zaraThinking, setZaraThinking] = useState(false);
  const [ticker, setTicker] = useState(0);
  const [notification, setNotification] = useState(null);
  const [view, setView] = useState("KDS"); // KDS | ANALYTICS
  const [stats] = useState({ bumped: 14, avgTime: "9:42", onTime: 87, covers: 64 });

  // Live ticker
  useEffect(() => { const t = setInterval(() => setTicker(n => n+1), 1000); return () => clearInterval(t); }, []);

  // Auto-inject orders
  useEffect(() => {
    const t = setInterval(() => {
      if (orders.filter(o => o.status !== "BUMPED").length < 12) {
        const o = genOrder();
        setOrders(prev => [o, ...prev.filter(x => x.status !== "BUMPED").slice(0, 11)]);
        showNotification(`New ticket ${o.ticket} — ${o.table}`);
      }
    }, 12000);
    return () => clearInterval(t);
  }, [orders]);

  // Zara auto-tips
  useEffect(() => {
    const t = setInterval(() => {
      const msg = ZARA_MESSAGES[Math.floor(Math.random() * ZARA_MESSAGES.length)];
      setZaraMessages(prev => [...prev.slice(-20), { role:"zara", text: msg }]);
    }, 25000);
    return () => clearInterval(t);
  }, []);

  function showNotification(msg) {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  }

  function bumpOrder(id) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status:"BUMPED" } : o));
    showNotification(`Ticket bumped — sent to expo ✓`);
  }

  function cycleStatus(id, itemIndex) {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      if (itemIndex !== undefined) {
        const items = o.items.map((item, i) => i === itemIndex ? { ...item, done: !item.done } : item);
        const allDone = items.every(i => i.done);
        return { ...o, items, status: allDone ? "READY" : "COOKING" };
      }
      const cycle = { NEW:"COOKING", COOKING:"READY", READY:"NEW" };
      return { ...o, status: cycle[o.status] || o.status };
    }));
  }

  async function askZara() {
    if (!zaraInput.trim()) return;
    const q = zaraInput.trim();
    setZaraInput("");
    setZaraMessages(prev => [...prev, { role:"user", text:q }]);
    setZaraThinking(true);

    const activeOrders = orders.filter(o => o.status !== "BUMPED");
    const rushCount = activeOrders.filter(o => o.priority === "RUSH").length;
    const criticalCount = activeOrders.filter(o => urgency(o.createdAt) === "critical").length;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`You are Zara, an AI kitchen intelligence system built into Enflow — a modern restaurant SaaS platform. You assist kitchen staff in real-time with order prioritization, station management, timing, and efficiency. You are concise, confident, and kitchen-savvy. Speak like a sharp sous chef — brief, actionable, no fluff. Current kitchen state: ${activeOrders.length} active tickets, ${rushCount} rush orders, ${criticalCount} critical (over 15 min). Avg completion time today: 9:42. On-time rate: 87%. Covers served: 64.`,
          messages:[{ role:"user", content:q }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "Unable to respond right now.";
      setZaraMessages(prev => [...prev, { role:"zara", text }]);
    } catch {
      setZaraMessages(prev => [...prev, { role:"zara", text:"Connection issue. Check network and retry." }]);
    } finally {
      setZaraThinking(false);
    }
  }

  const visibleOrders = orders.filter(o => {
    if (o.status === "BUMPED") return false;
    if (activeStation === "ALL") return true;
    return o.items.some(i => i.station === activeStation);
  });

  const stationCounts = {};
  STATIONS.forEach(s => {
    stationCounts[s] = orders.filter(o => o.status !== "BUMPED" && o.items.some(i => i.station === s)).length;
  });

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false });

  return (
    <div style={{
      background:"#060606", minHeight:"100vh", fontFamily:"'DM Sans',sans-serif",
      color:"#e0e0e0", display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:#0a0a0a; } ::-webkit-scrollbar-thumb { background:#222; border-radius:2px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes shimmer { 0%{background-position:0% 0} 100%{background-position:200% 0} }
        @keyframes slideIn { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes zaraGlow { 0%,100%{box-shadow:0 0 12px #7c3aed60} 50%{box-shadow:0 0 22px #a855f780} }
        @keyframes dotBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes notifSlide { from{transform:translateY(-60px);opacity:0} to{transform:translateY(0);opacity:1} }
        button:hover { filter: brightness(1.15); }
      `}</style>

      {/* NOTIFICATION */}
      {notification && (
        <div style={{
          position:"fixed", top:12, left:"50%", transform:"translateX(-50%)",
          background:"#0d1f17", border:"1px solid #22d3a0", borderRadius:8,
          padding:"10px 20px", fontSize:12, color:"#22d3a0", fontWeight:600,
          zIndex:999, animation:"notifSlide 0.3s ease", letterSpacing:0.5,
          boxShadow:"0 4px 24px #22d3a030",
        }}>{notification}</div>
      )}

      {/* TOP BAR */}
      <div style={{
        display:"flex", alignItems:"center", padding:"0 20px",
        height:56, borderBottom:"1px solid #141414",
        background:"linear-gradient(180deg,#0a0a0a,#060606)",
        flexShrink:0, gap:16,
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:32, height:32, borderRadius:7,
            background:"linear-gradient(135deg,#0ea5e9,#22d3a0)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:15, fontWeight:900, color:"#000",
          }}>E</div>
          <div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:800, color:"#f5f5f5", letterSpacing:2 }}>ENFLOW</div>
            <div style={{ fontSize:8, color:"#444", letterSpacing:2 }}>KDS · KITCHEN DISPLAY</div>
          </div>
        </div>

        <div style={{ width:1, height:32, background:"#1a1a1a", marginLeft:4 }}/>

        {/* Nav */}
        {["KDS","ANALYTICS"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            background:"none", border:`1px solid ${view===v?"#333":"transparent"}`,
            borderRadius:6, padding:"5px 12px",
            color: view===v ? "#e0e0e0" : "#555", fontSize:10, fontWeight:700,
            cursor:"pointer", letterSpacing:1.5,
            background: view===v ? "#111" : "transparent",
          }}>{v}</button>
        ))}

        {/* Station Filter */}
        <div style={{ display:"flex", gap:6, marginLeft:8 }}>
          {["ALL",...STATIONS].map(s => (
            <button key={s} onClick={() => setActiveStation(s)} style={{
              padding:"4px 10px", borderRadius:5,
              background: activeStation===s ? "#1a1a1a" : "transparent",
              border: `1px solid ${activeStation===s ? "#333" : "#1a1a1a"}`,
              color: activeStation===s ? "#e0e0e0" : "#444",
              fontSize:9, fontWeight:700, cursor:"pointer", letterSpacing:1,
            }}>
              {s}
              {s !== "ALL" && stationCounts[s] > 0 && (
                <span style={{ marginLeft:4, color:"#f59e0b" }}>{stationCounts[s]}</span>
              )}
            </button>
          ))}
        </div>

        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:20 }}>
          {/* KPIs */}
          <div style={{ display:"flex", gap:20 }}>
            {[
              { label:"ACTIVE", val: visibleOrders.length, color:"#60a5fa" },
              { label:"RUSH", val: visibleOrders.filter(o=>o.priority==="RUSH").length, color:"#f97316" },
              { label:"CRITICAL", val: visibleOrders.filter(o=>urgency(o.createdAt)==="critical").length, color:"#ef4444" },
            ].map(k => (
              <div key={k.label} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:18, fontWeight:800, color:k.color, lineHeight:1 }}>{k.val}</div>
                <div style={{ fontSize:8, color:"#444", letterSpacing:1 }}>{k.label}</div>
              </div>
            ))}
          </div>
          <div style={{ width:1, height:32, background:"#1a1a1a" }}/>
          {/* Clock */}
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:18, fontWeight:800, color:"#333", letterSpacing:2 }}>
            {timeStr}
          </div>
        </div>
      </div>

      {/* MAIN BODY */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>

        {view === "KDS" ? (
          <>
            {/* ORDER GRID */}
            <div style={{
              flex:1, overflowY:"auto", padding:16,
              display:"grid",
              gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",
              gap:12, alignContent:"start",
            }}>
              {visibleOrders.length === 0 ? (
                <div style={{
                  gridColumn:"1/-1", display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center", padding:60, gap:12,
                }}>
                  <div style={{ fontSize:40 }}>✓</div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, color:"#22d3a0", letterSpacing:2 }}>ALL CLEAR</div>
                  <div style={{ fontSize:12, color:"#444" }}>No active tickets on this station</div>
                </div>
              ) : visibleOrders.map(o => (
                <OrderCard
                  key={o.id}
                  order={o}
                  onBump={bumpOrder}
                  onStatusCycle={cycleStatus}
                  activeStation={activeStation}
                />
              ))}
            </div>

            {/* ZARA SIDEBAR */}
            <div style={{
              width:300, borderLeft:"1px solid #141414",
              display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0,
            }}>
              <ZaraPanel
                messages={zaraMessages}
                onAsk={askZara}
                zaraInput={zaraInput}
                setZaraInput={setZaraInput}
                zaraThinking={zaraThinking}
              />
            </div>
          </>
        ) : (
          /* ANALYTICS VIEW */
          <div style={{ flex:1, padding:24, overflowY:"auto" }}>
            <div style={{ maxWidth:900, margin:"0 auto" }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"#555", letterSpacing:2, marginBottom:20 }}>
                SHIFT ANALYTICS · {now.toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}
              </div>

              {/* Stat Cards */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
                {[
                  { label:"TICKETS BUMPED", val:stats.bumped, unit:"today", color:"#22d3a0" },
                  { label:"AVG COOK TIME", val:stats.avgTime, unit:"mm:ss", color:"#60a5fa" },
                  { label:"ON-TIME RATE", val:`${stats.onTime}%`, unit:"target 90%", color:"#f59e0b" },
                  { label:"COVERS SERVED", val:stats.covers, unit:"tonight", color:"#a78bfa" },
                ].map(s => (
                  <div key={s.label} style={{
                    background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:10, padding:"18px 20px",
                  }}>
                    <div style={{ fontSize:8, color:"#444", letterSpacing:2, marginBottom:10 }}>{s.label}</div>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:28, fontWeight:800, color:s.color }}>{s.val}</div>
                    <div style={{ fontSize:10, color:"#333", marginTop:4 }}>{s.unit}</div>
                  </div>
                ))}
              </div>

              {/* Station Load */}
              <div style={{ background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:10, padding:20, marginBottom:16 }}>
                <div style={{ fontSize:10, color:"#555", letterSpacing:2, marginBottom:16, fontFamily:"'JetBrains Mono',monospace" }}>STATION LOAD</div>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {STATIONS.map(s => {
                    const count = stationCounts[s] || 0;
                    const pct = Math.min((count / 6) * 100, 100);
                    return (
                      <div key={s} style={{ display:"flex", alignItems:"center", gap:14 }}>
                        <div style={{ width:60, fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:"#666", letterSpacing:1 }}>{s}</div>
                        <div style={{ flex:1, height:6, background:"#1a1a1a", borderRadius:3, overflow:"hidden" }}>
                          <div style={{
                            height:"100%", borderRadius:3,
                            width:`${pct}%`,
                            background: pct > 80 ? "#ef4444" : pct > 50 ? "#f59e0b" : "#22d3a0",
                            transition:"width 0.8s ease",
                          }}/>
                        </div>
                        <div style={{ width:20, fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:"#555", textAlign:"right" }}>{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent bumps */}
              <div style={{ background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:10, padding:20 }}>
                <div style={{ fontSize:10, color:"#555", letterSpacing:2, marginBottom:16, fontFamily:"'JetBrains Mono',monospace" }}>RECENT COMPLETIONS</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {orders.filter(o => o.status === "BUMPED").slice(0,5).map(o => (
                    <div key={o.id} style={{
                      display:"flex", justifyContent:"space-between", alignItems:"center",
                      padding:"8px 12px", background:"#111", borderRadius:6, border:"1px solid #1a1a1a",
                    }}>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:"#555" }}>{o.ticket}</span>
                      <span style={{ fontSize:11, color:"#555" }}>{o.table}</span>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"#22d3a0" }}>BUMPED ✓</span>
                    </div>
                  ))}
                  {orders.filter(o => o.status === "BUMPED").length === 0 && (
                    <div style={{ fontSize:12, color:"#333", textAlign:"center", padding:20 }}>No completions yet this session</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

