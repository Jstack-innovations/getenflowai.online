/**
 * ZaraWidget.tsx
 * Place this file in your src/ folder.
 * Usage:  <ZaraWidget orders={orders} stats={stats} event={zaraEvent} />
 *
 * ─── CURRENT ENGINE: OpenRouter (free) ───────────────────────────────────────
 * In your .env file add:
 *   VITE_OPENROUTER_KEY=your-openrouter-key-here
 *
 * Get your free key at: openrouter.ai → Sign up → Keys (no card needed)
 * 
 * 
 *  * ─── ElevenLabsVoice──────────────────────────────────────
 * const ELEVENLABS_KEY     = import.meta.env.VITE_ELEVENLABS_KEY     as string | undefined;
const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID as string | undefined;
 *
 * 
 * 
 * ─── SWITCH TO GEMINI ────────────────────────────────────────────────────────
 * 1. Add VITE_GEMINI_KEY=your-gemini-key to your .env
 * 2. Comment out the OpenRouter block below  (marked  ▼ OPENROUTER BLOCK ▼)
 * 3. Uncomment the Gemini block below        (marked  ▼ GEMINI BLOCK ▼)
 *
 * ─── SWITCH TO CLAUDE ────────────────────────────────────────────────────────
 * 1. Add VITE_ANTHROPIC_KEY=sk-ant-xxxx to your .env
 * 2. Comment out the OpenRouter block below  (marked  ▼ OPENROUTER BLOCK ▼)
 * 3. Uncomment the Anthropic block below     (marked  ▼ ANTHROPIC BLOCK ▼)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState, useCallback } from "react";
import ZaraLogo from "./assets/ZaraLogo.png";
import { API_BASE } from "./Config/api";

// ── ENV keys ──────────────────────────────────────────────────────────────────

// ▼ OPENROUTER BLOCK ▼  — active now (free tier, works in Nigeria)
const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_KEY as string | undefined;

// ▼ ELEVENLABS VOICE ▼  ← ADD HERE
const ELEVENLABS_KEY      = import.meta.env.VITE_ELEVENLABS_KEY      as string | undefined;
const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID as string | undefined;

// ▼ GEMINI BLOCK ▼  — uncomment if switching to Gemini
// const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY as string | undefined;

// ▼ ANTHROPIC BLOCK ▼  — uncomment if switching to Claude
// const ANTHROPIC_KEY  = import.meta.env.VITE_ANTHROPIC_KEY  as string | undefined;
// const ZARA_PROXY_URL = import.meta.env.VITE_ZARA_PROXY     as string | undefined;

// ── Types ─────────────────────────────────────────────────────────────────────
type OrderItem = { image: string; name: string; qty: number };
type OrderInfo = {
  order_id: number; plate_order_no: string; name: string; phone: string;
  order_type: string; table_no?: string; total_amount: string;
  status: string; order_status: string; created_at: string;
};
export type ZaraOrder = { info: OrderInfo; items: OrderItem[] };
export type ZaraStats = {
  totalPlaced?: number; totalServed?: number; totalDelivered?: number;
  totalPickup?: number; totalRevenue?: number;
};

// ── NEW: Menu types for stock update ─────────────────────────────────────────
type MenuItem = {
  id: number; name: string; description: string; price: number;
  image: string; tags: string[]; badge?: string;
  available: number | boolean; stock: number;
};
type MenuData = Record<string, MenuItem[]>;

interface ZaraWidgetProps {
  orders: ZaraOrder[];
  stats:  ZaraStats;
    /** Pass a string like "edited #42" or "deleted #7" to trigger a Zara reaction */
  event?: string;
  onOrderUpdated?: () => void;
  onNavigate?: (path: string) => void;
}

// ── System prompt (shared by all engines) ─────────────────────────────────────
// CHANGED: accepts menu so Zara knows item names/IDs for stock updates
function buildSystemPrompt(orders: ZaraOrder[], stats: ZaraStats, menu: MenuData): string {
  const pending = orders.filter(o => {
    const s = o.info.order_status.toLowerCase();
    return s !== "served" && s !== "delivered" && s !== "pickup";
  }).length;

  const recent = [...orders].slice(0, 8).map(o =>
    `• ${o.info.plate_order_no} | ${o.info.name} | ${o.info.order_type.toUpperCase()}` +
    `${o.info.table_no ? ` | Table ${o.info.table_no}` : ""}` +
    ` | ₦${parseFloat(o.info.total_amount).toFixed(2)} | ${o.info.order_status}`
  ).join("\n");

  // Flatten menu so Zara can match names to IDs
  const menuLines = Object.entries(menu).flatMap(([cat, items]) =>
    items.map(i =>
      `  [id:${i.id}|cat:${cat}] ${i.name} — stock:${i.stock} | available:${i.available ? "yes" : "no"} | ₦${i.price}`
    )
  ).join("\n");

  return `You are Zara — the embedded AI operations intelligence for Artisan Grills restaurant, built into the Enflow management system.

Your personality: Authoritative, precise, and concise. You think like a seasoned operations director who sees every number and every table. No filler. No pleasantries. Pure signal.

Constraints:
- Maximum 2–3 sentences per response unless asked for detail.
- Always ground your answer in the live data below.
- Flag anomalies: high pending counts, unusual order volumes, revenue gaps.
- When a new order arrives: confirm it, name the items, state the table, assign a prep priority.
- When an edit or delete happens: briefly note what it means operationally.

Live dashboard snapshot:
  Revenue today:    ₦${(stats.totalRevenue ?? 0).toLocaleString()}
  Orders placed:    ${stats.totalPlaced ?? 0}
  Served:           ${stats.totalServed ?? 0}
  Delivered:        ${stats.totalDelivered ?? 0}
  Pickup:           ${stats.totalPickup ?? 0}
  Pending (active): ${pending}

Recent orders (newest first):
${recent || "  None yet."}

Current menu inventory:
${menuLines || "  Menu not loaded yet."}

─── STOCK UPDATE INSTRUCTIONS ───────────────────────────────────────────────
If the user asks to update, set, restock, or change the stock of a menu item:
1. Find the best matching item from the menu inventory above (fuzzy match by name).
2. Respond with your confirmation sentence AND append this tag at the very end:
   [STOCK_UPDATE:id=<id>,stock=<new_stock>,category=<cat>,name=<name>]
   Example: [STOCK_UPDATE:id=3,stock=50,category=mains,name=Jollof Rice]
3. Only ONE tag per response. Never explain the tag.
4. If you cannot find the item, say so clearly — do NOT append a tag.
─────────────────────────────────────────────────────────────────────────────

─── ORDER STATUS UPDATE INSTRUCTIONS ────────────────────────────────────────
If the user asks to mark, update, set, or change the status of an order:
1. Find the plate number from the recent orders list above (fuzzy match by name or plate).
2. Valid statuses are: pending, preparing, ready, served, delivered, pickup.
3. Respond with your confirmation AND append this tag at the very end:
   [ORDER_UPDATE:plate=<plate_order_no>,status=<status>]
   Example: [ORDER_UPDATE:plate=AG-042,status=served]
4. Only ONE tag per response. Never explain the tag.
5. If you cannot find the order, say so — do NOT append a tag.
─────────────────────────────────────────────────────────────────────────────

─── SEND REPORT INSTRUCTIONS ────────────────────────────────────────────────
If the user asks to send a report, send business report, or send Telegram report:
1. Respond with a confirmation sentence AND append this tag at the very end:
   [SEND_REPORT]
2. Never explain the tag.
─────────────────────────────────────────────────────────────────────────────

Navigation: If the user asks to go to a page, respond normally BUT append a tag at the very end like [NAVIGATE:/menu] or [NAVIGATE:/analytics].
Available routes: / (orders), /users, /tables, /menu, /tax, /check-reservations, /scanner, /offers, /banners, /analytics, /plan
Only append the tag, never explain it.`;
}

// ── API call ──────────────────────────────────────────────────────────────────

// ▼ OPENROUTER BLOCK ▼  — active now
async function callZara(prompt: string, system: string): Promise<string> {
  if (!OPENROUTER_KEY) {
    throw new Error(
      "No OpenRouter key. Add VITE_OPENROUTER_KEY to your .env file. " +
      "Get a free key at openrouter.ai (no card needed, works in Nigeria)"
    );
  }

  const MODELS = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "google/gemma-3-4b-it:free",
    "google/gemma-3-12b-it:free",
    "deepseek/deepseek-r1-distill-llama-70b:free",
    "qwen/qwen3-8b:free",
  ];

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  for (const model of MODELS) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Artisan Grills - Zara",
      },
      body: JSON.stringify({
        model,
        max_tokens: 350,
        temperature: 0.7,
        messages: [
          { role: "system", content: system },
          { role: "user",   content: prompt  },
        ],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? "No response.";
    }

    if (res.status === 429) {
      await delay(2000);
      continue;
    }

    // Any other error — try next model
    continue;
  }

  throw new Error("All free models are currently busy. Please try again in a moment.");
}

// ▼ GEMINI BLOCK ▼  — comment out OpenRouter above and uncomment this to use Gemini
//
// async function callZara(prompt: string, system: string): Promise<string> {
//   if (!GEMINI_KEY) {
//     throw new Error(
//       "No Gemini key. Add VITE_GEMINI_KEY to your .env file. " +
//       "Get a free key at aistudio.google.com"
//     );
//   }
//   const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
//   const res = await fetch(url, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       contents: [{ role: "user", parts: [{ text: `${system}\n\n---\n\n${prompt}` }] }],
//       generationConfig: { maxOutputTokens: 350, temperature: 0.7 },
//     }),
//   });
//   if (!res.ok) {
//     const err = await res.text().catch(() => res.statusText);
//     throw new Error(`Gemini ${res.status}: ${err}`);
//   }
//   const data = await res.json();
//   return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response.";
// }

// ▼ ANTHROPIC BLOCK ▼  — comment out OpenRouter above and uncomment this to use Claude
//
// async function callZara(prompt: string, system: string): Promise<string> {
//   const url = ZARA_PROXY_URL ?? "https://api.anthropic.com/v1/messages";
//   const headers: Record<string, string> = { "Content-Type": "application/json" };
//   if (!ZARA_PROXY_URL) {
//     if (!ANTHROPIC_KEY) {
//       throw new Error("No API key. Add VITE_ANTHROPIC_KEY to your .env file.");
//     }
//     headers["x-api-key"]        = ANTHROPIC_KEY;
//     headers["anthropic-version"] = "2023-06-01";
//     headers["anthropic-dangerous-allow-browser"] = "true";
//   }
//   const res = await fetch(url, {
//     method: "POST",
//     headers,
//     body: JSON.stringify({
//       model:      "claude-sonnet-4-20250514",
//       max_tokens: 350,
//       system,
//       messages: [{ role: "user", content: prompt }],
//     }),
//   });
//   if (!res.ok) {
//     const err = await res.text().catch(() => res.statusText);
//     throw new Error(`Anthropic ${res.status}: ${err}`);
//   }
//   const data = await res.json();
//   return (data.content as { type: string; text: string }[])
//     ?.filter(b => b.type === "text").map(b => b.text).join("") || "No response.";
// }

// ── NEW: Stock update — calls adminUpdateMenu ─────────────────────────────────
async function updateStock(params: {
  id: number; stock: number; category: string; currentItem: MenuItem;
}): Promise<void> {
  const { id, stock, category, currentItem } = params;
  const res = await fetch(`${API_BASE}/adminUpdateMenu`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action:      "update",
      category,
      id,
      name:        currentItem.name,
      description: currentItem.description,
      price:       currentItem.price,
      image:       currentItem.image,
      tags:        currentItem.tags,
      badge:       currentItem.badge ?? "",
      available:   currentItem.available,
      stock,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Stock update failed: ${res.status} — ${text}`);
  }
  const data = await res.json();
  if (!data.success) throw new Error("API returned success:false");
}



// ── Order status update — calls updateOrderStatus ─────────────────────────────
async function updateOrderStatus(plate: string, status: string): Promise<void> {
  const body = new URLSearchParams({ plate, status });
  const res = await fetch(`${API_BASE}/updateOrderStatus`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Order update failed: ${res.status} — ${text}`);
  }
  const data = await res.json();
  if (!data.success) throw new Error("API returned success:false");
}

// ── Web Speech ────────────────────────────────────────────────────────────────
function speakText(text: string, onStart: () => void, onEnd: () => void): void {
  if (ELEVENLABS_KEY && ELEVENLABS_VOICE_ID) {
    onStart();
    fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    })
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => { onEnd(); URL.revokeObjectURL(url); };
        audio.onerror = () => { onEnd(); URL.revokeObjectURL(url); };
        audio.play();
      })
      .catch(() => onEnd());
    return;
  }

  // Fallback to browser TTS if no ElevenLabs key
  if (!("speechSynthesis" in window)) {
    onStart();
    setTimeout(onEnd, Math.max(1500, text.length * 55));
    return;
  }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const pick =
    voices.find(v => /samantha|zira|victoria|karen|moira|fiona|google uk english female/i.test(v.name)) ||
    voices.find(v => v.lang.startsWith("en") && /female/i.test(v.name)) ||
    voices.find(v => v.lang.startsWith("en-")) ||
    voices[0];
  if (pick) utt.voice = pick;
  utt.rate = 0.97; utt.pitch = 1.05; utt.volume = 1;
  utt.onstart = onStart; utt.onend = onEnd; utt.onerror = onEnd;
  window.speechSynthesis.speak(utt);
}

// ── Sound-wave bars ───────────────────────────────────────────────────────────
const BAR_HEIGHTS = [0.35, 0.65, 1, 0.8, 0.5, 0.9, 0.6, 1, 0.45, 0.75, 0.4, 0.85, 0.55];

function ZaraWave({ speaking, listening }: { speaking: boolean; listening: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);

  useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext("2d")!;
  const w = canvas.width;
  const h = canvas.height;
  const cy = h / 2;
  let t = 0;

  const draw = () => {
    ctx.clearRect(0, 0, w, h);

const layers = listening ? [
  { r: 250, g: 204, b:  21, amp: 22, freq: 0.030, speed: 0.055, phase: 0.0 }, // #facc15
  { r: 214, g: 168, b: 106, amp: 18, freq: 0.042, speed: 0.070, phase: 1.1 }, // #d6a86a
  { r: 249, g: 115, b:  22, amp: 15, freq: 0.055, speed: 0.060, phase: 2.2 }, // #f97316
  { r: 253, g: 222, b: 138, amp: 12, freq: 0.038, speed: 0.080, phase: 0.6 }, // #fde68a
  { r: 122, g:  58, b:  16, amp: 10, freq: 0.065, speed: 0.045, phase: 1.7 }, // #7a3a10
  { r: 214, g: 168, b: 106, amp: 8,  freq: 0.072, speed: 0.065, phase: 3.1 }, // #d6a86a
] : [
  { r: 250, g: 204, b:  21, amp: 22, freq: 0.030, speed: 0.055, phase: 0.0 }, // #facc15
  { r: 214, g: 168, b: 106, amp: 18, freq: 0.042, speed: 0.070, phase: 1.1 }, // #d6a86a
  { r: 249, g: 115, b:  22, amp: 15, freq: 0.055, speed: 0.060, phase: 2.2 }, // #f97316
  { r: 253, g: 222, b: 138, amp: 12, freq: 0.038, speed: 0.080, phase: 0.6 }, // #fde68a
  { r: 122, g:  58, b:  16, amp: 10, freq: 0.065, speed: 0.045, phase: 1.7 }, // #7a3a10
  { r: 214, g: 168, b: 106, amp: 8,  freq: 0.072, speed: 0.065, phase: 3.1 }, // #d6a86a
];

    layers.forEach(({ r, g, b, amp, freq, speed, phase }) => {
      const drawWave = (mirror: boolean) => {
        ctx.beginPath();
        for (let x = 0; x <= w; x++) {
          const envelope = Math.pow(Math.sin((x / w) * Math.PI), 0.6);
          const y = cy + (mirror ? -1 : 1) *
            amp * envelope *
            Math.sin(x * freq + t * speed + phase) *
            (0.7 + 0.3 * Math.sin(x * freq * 0.4 + t * speed * 0.5));
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0,   `rgba(${r},${g},${b},0)`);
        grad.addColorStop(0.2, `rgba(${r},${g},${b},0.7)`);
        grad.addColorStop(0.5, `rgba(${r},${g},${b},0.95)`);
        grad.addColorStop(0.8, `rgba(${r},${g},${b},0.7)`);
        grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2;
        ctx.globalAlpha = 0.75;
        ctx.stroke();
      };
      drawWave(false);
      drawWave(true);
    });

    ctx.globalAlpha = 1;
    t++;
    animRef.current = requestAnimationFrame(draw);
  };

  // ── KEY FIX: only animate when active ──
  if (speaking || listening) {
    draw();
  } else {
    // Draw flat line ONCE and stop — no loop
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.strokeStyle = "rgba(214,168,106,0.12)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  return () => cancelAnimationFrame(animRef.current);
}, [speaking, listening]);

  return (
    <canvas
      ref={canvasRef}
      width={260}
      height={56}
      style={{ display: "block", marginTop: 2 }}
    />
  );
}

// ── Character-by-character typed display ──────────────────────────────────────
function useTyped(full: string, running: boolean): string {
  const [shown, setShown] = useState(full);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running || !full) { setShown(full); return; }
    setShown("");
    let i = 0;
    timer.current = setInterval(() => {
      i++;
      setShown(full.slice(0, i));
      if (i >= full.length && timer.current) clearInterval(timer.current);
    }, 16);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [full, running]);

  return shown;
}

// ── Main widget ───────────────────────────────────────────────────────────────
export default function ZaraWidget({ orders, stats, event, onNavigate }: ZaraWidgetProps) {
  
  const [message,  setMessage]  = useState("Zara is watching the floor. Ask me anything, or wait for an incoming order.");
  const [input,    setInput]    = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  
  // ── Add this state near your other states For Microphone ──────────────────────────────────
const [locked, setLocked] = useState(false);
const audioRef = useRef<any>(null);

  // ── NEW: menu cache for stock updates ─────────────────────────────────────
  const [menu, setMenu] = useState<MenuData>({});

  const prevCount      = useRef(orders.length);
  const prevEvent      = useRef(event);
  const recognitionRef = useRef<any>(null);
  const displayed      = useTyped(message, !loading);

// ── Queue ─────────────────────────────────────────
const queue    = useRef<string[]>([]);
const busy     = useRef(false);
const [queueSize, setQueueSize] = useState(0);

  // ── NEW: fetch menu internally so Zara knows item IDs ────────────────────
  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/getMenu`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.menu) setMenu(data.menu);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchMenu();
    const t = setInterval(fetchMenu, 30_000);
    return () => clearInterval(t);
  }, [fetchMenu]);

  // ── NEW: parse and execute [STOCK_UPDATE:...] tag ─────────────────────────
  const handleStockTag = useCallback(async (tag: string): Promise<string> => {
    const inner = tag.replace("[STOCK_UPDATE:", "").replace("]", "");
    const parts: Record<string, string> = {};
    inner.split(",").forEach(pair => {
      const eqIdx = pair.indexOf("=");
      if (eqIdx === -1) return;
      parts[pair.slice(0, eqIdx).trim()] = pair.slice(eqIdx + 1).trim();
    });

    const id       = parseInt(parts.id ?? "0");
    const stock    = parseInt(parts.stock ?? "0");
    const category = parts.category ?? "";

    if (!id || isNaN(stock) || !category) {
      return "Stock update failed — could not parse the item details.";
    }

    // Find item in cache, search all categories as fallback
    let currentItem: MenuItem | undefined = (menu[category] ?? []).find(i => i.id === id);
    let realCat = category;
    if (!currentItem) {
      for (const [cat, items] of Object.entries(menu)) {
        const found = items.find(i => i.id === id);
        if (found) { currentItem = found; realCat = cat; break; }
      }
    }
    if (!currentItem) return `Stock update failed — item ID ${id} not found. Try again in a moment.`;

    await updateStock({ id, stock, category: realCat, currentItem });
    await fetchMenu();
    return `Done. ${currentItem.name} stock updated to ${stock} units.`;
  }, [menu, fetchMenu]);

  // ── Parse and execute [ORDER_UPDATE:...] tag ─────────────────────────────
  const handleOrderTag = useCallback(async (tag: string): Promise<string> => {
    const inner = tag.replace("[ORDER_UPDATE:", "").replace("]", "");
    const parts: Record<string, string> = {};
    inner.split(",").forEach(pair => {
      const eqIdx = pair.indexOf("=");
      if (eqIdx === -1) return;
      parts[pair.slice(0, eqIdx).trim()] = pair.slice(eqIdx + 1).trim();
    });

    const plate  = parts.plate ?? "";
    const status = parts.status ?? "";

    if (!plate || !status) return "Order update failed — missing plate or status.";

    await updateOrderStatus(plate, status);
    return `Done. Order ${plate} marked as ${status}.`;
  }, []);


  // ── Core: ask Zara ────────────────────────────────────────────────────────
  const processQueue = useCallback(async () => {
  if (busy.current || queue.current.length === 0) return;
  busy.current = true;
  while (queue.current.length > 0) {
    const prompt = queue.current.shift()!;
    localStorage.setItem("zaraQueue", JSON.stringify(queue.current));
    setQueueSize(queue.current.length);
    setLoading(true);
    setError(null);
    setMessage("…");
    setExpanded(true);
    try {
      // CHANGED: pass menu into buildSystemPrompt
      const system = buildSystemPrompt(orders, stats, menu);
      
      // ── Deduct 1 Zara credit before firing ──
const creditRes = await fetch(`${API_BASE}/deductCredits`, {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ credits: 1 }),
});
const creditData = await creditRes.json();

if (creditData.status === "error") {
  setMessage("You've run out of Zara credits. Please upgrade your plan.");
  setLoading(false);
  break;
}

const text = await callZara(prompt, system);

      // Handle NAVIGATE tag (unchanged)
      const navMatch = text.match(/\[NAVIGATE:([^\]]+)\]/);
      if (navMatch && onNavigate) onNavigate(navMatch[1]);

      // NEW: handle STOCK_UPDATE tag
      const stockMatch = text.match(/\[STOCK_UPDATE:[^\]]+\]/);
      let cleanText = text
        .replace(/\[NAVIGATE:[^\]]+\]/, "")
        .replace(/\[STOCK_UPDATE:[^\]]+\]/, "")
        .trim();

if (stockMatch) {
        setLoading(false);
        setMessage("Updating stock…");
        try {
          const confirmation = await handleStockTag(stockMatch[0]);
          cleanText = cleanText ? `${cleanText} ${confirmation}` : confirmation;
        } catch (e: any) {
          cleanText = cleanText || `Stock update failed: ${e?.message ?? "Unknown error"}`;
          setError(e?.message ?? "Stock update error");
        }
      }

      // ── Handle ORDER_UPDATE tag ──────────────────────────────────────────
      const orderMatch = text.match(/\[ORDER_UPDATE:[^\]]+\]/);
      cleanText = cleanText.replace(/\[ORDER_UPDATE:[^\]]+\]/, "").trim();
      if (orderMatch) {
        setMessage("Updating order…");
        try {
          const confirmation = await handleOrderTag(orderMatch[0]);
          cleanText = cleanText ? `${cleanText} ${confirmation}` : confirmation;
        } catch (e: any) {
          cleanText = cleanText || `Order update failed: ${e?.message ?? "Unknown error"}`;
          setError(e?.message ?? "Order update error");
        }
      }
      
      // ── Handle SEND_REPORT tag ──────────────────────────────────────────
const reportMatch = text.match(/\[SEND_REPORT\]/);
cleanText = cleanText.replace(/\[SEND_REPORT\]/, "").trim();
if (reportMatch) {
  setMessage("Sending report…");
  try {
    const res = await fetch(`${API_BASE}/sendTelegramReport`, {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    const confirmation = data.success
      ? "Report sent to Telegram successfully."
      : `Report failed: ${data.message}`;
    cleanText = cleanText ? `${cleanText} ${confirmation}` : confirmation;
  } catch (e: any) {
    cleanText = cleanText || `Report failed: ${e?.message ?? "Unknown error"}`;
    setError(e?.message ?? "Report send error");
  }
}


      setMessage(cleanText);  // ← this line stays here
      
      await new Promise<void>(resolve =>
        speakText(cleanText, () => setSpeaking(true), () => { setSpeaking(false); resolve(); })
      );
    } catch (e: any) {
      setError(e?.message ?? "Unknown error.");
      setMessage("Could not reach the AI. See error below.");
      await new Promise(r => setTimeout(r, 1500));
    } finally {
      setLoading(false);
    }
  }
  localStorage.removeItem("zaraQueue");
  busy.current = false;
  setQueueSize(0);
}, [orders, stats, menu, onNavigate, handleStockTag, handleOrderTag]);

const ask = useCallback((prompt: string) => {
  if (!prompt.trim()) return;
  queue.current.push(prompt);
  localStorage.setItem("zaraQueue", JSON.stringify(queue.current));
  setQueueSize(queue.current.length);
  processQueue();
}, [processQueue]);




  // ── Voice input ───────────────────────────────────────────────────────────
  // ── ElevenLabs STT via MediaRecorder chunks ───────────────────────────────
const mediaRecorderRef = useRef<MediaRecorder | null>(null);
const sttActiveRef     = useRef(false);

const stopListening = useCallback(() => {
  sttActiveRef.current = false;
  mediaRecorderRef.current?.stop();
  mediaRecorderRef.current = null;
  setListening(false);
  setLocked(false);
}, []);

const startListening = useCallback(async () => {
  // ── Try ElevenLabs STT first ──────────────────────────────────────────
  if (ELEVENLABS_KEY) {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      alert("Microphone permission denied.");
      return;
    }

    sttActiveRef.current = true;
    setListening(true);

    const runChunk = () => {
      if (!sttActiveRef.current) return;
      const chunks: Blob[] = [];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = async () => {
        if (!sttActiveRef.current) return;
        const blob = new Blob(chunks, { type: mimeType });
        if (blob.size < 1500) { runChunk(); return; }

        try {
          const ext = mimeType.includes("mp4") ? "mp4" : "webm";
          const form = new FormData();
          form.append("file", blob, `audio.${ext}`);
          form.append("model_id", "scribe_v1");
          form.append("language_code", "en");

          const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
            method: "POST",
            headers: { "xi-api-key": ELEVENLABS_KEY },
            body: form,
          });
          if (res.ok) {
  const data = await res.json();
  const transcript = (data.text ?? "").trim();
  if (transcript) {
  setListening(false);
  setLoading(true);    // ← add this line
  setExpanded(true);
  ask(transcript);
  setTimeout(() => setInput(""), 400);
}
}
        } catch { /* silent */ }

        const waitAndResume = () => {
  if (busy.current) {
    setTimeout(waitAndResume, 400);
  } else {
    if (sttActiveRef.current) runChunk();
  }
};
waitAndResume();
      };

      recorder.start();
      setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 6000);
    };

    runChunk();
    return; // ← ElevenLabs handled it, don't fall through
  }

  // ── Fallback: browser Web Speech API ─────────────────────────────────
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("No ElevenLabs key and your browser doesn't support voice input.");
    return;
  }

  window.speechSynthesis.cancel();
  setSpeaking(false);

  const rec = new SpeechRecognition();
  rec.lang = "en-NG";
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.continuous = false;

  rec.onstart = () => setListening(true);
  rec.onresult = (e: any) => {
    const transcript = e.results[e.results.length - 1][0].transcript;
    setInput(transcript);
    setListening(false);
    setTimeout(() => { ask(transcript); setInput(""); }, 300);
  };
  rec.onerror = () => setListening(false);
  rec.onend = () => {
    if (sttActiveRef.current) {
      setTimeout(() => { try { rec.start(); } catch { startListening(); } }, 250);
    } else {
      setListening(false);
    }
  };

  recognitionRef.current = rec;
  sttActiveRef.current = true;
  rec.start();
}, [ask]);

const toggleLock = useCallback(() => {
  if (locked) {
    stopListening();
  } else {
    setLocked(true);
    startListening();
  }
}, [locked, startListening, stopListening]);

  // ── Auto-fire: new order ──────────────────────────────────────────────────
  useEffect(() => {
    if (orders.length > prevCount.current) {
      const newest = orders[0];
      const items  = (newest.items || []).map(i => `${i.qty}× ${i.name}`).join(", ") || "unknown items";
      const loc    = newest.info.table_no ? `Table ${newest.info.table_no}` : newest.info.order_type.toUpperCase();
      ask(
        `New order just landed: ${newest.info.plate_order_no}. ` +
        `Customer: ${newest.info.name}. Location: ${loc}. ` +
        `Items: ${items}. Total: ₦${parseFloat(newest.info.total_amount).toFixed(2)}. ` +
        `Acknowledge and assign prep priority.`
      );
    }
    prevCount.current = orders.length;
  }, [orders.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-fire: edit / delete / external event ─────────────────────────────
  useEffect(() => {
    if (event && event !== prevEvent.current) {
      ask(`System event: ${event}. Give a brief operational note.`);
      prevEvent.current = event;
    }
}, [event]); // eslint-disable-line react-hooks/exhaustive-deps

// ── Restore queue on refresh ──────────────────────
useEffect(() => {
  const saved = localStorage.getItem("zaraQueue");
  if (saved) {
    try {
      const restored = JSON.parse(saved) as string[];
      if (restored.length > 0) {
        queue.current = restored;
        setQueueSize(restored.length);
        processQueue();
      }
    } catch {}
  }
}, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── User submit ────────────────────────────────────────────────────────────
  function submit() {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    ask(q);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      
         <style>{`
         @keyframes zara-lock-float {
  from { opacity: 0; transform: translateX(-50%) translateY(6px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
@keyframes zara-record-pulse {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
        @keyframes zara-bar {
          from { transform: scaleY(0.35); opacity: 0.7; }
          to   { transform: scaleY(1);    opacity: 1;   }
        }
        @keyframes zara-pulse {
          0%,100% { box-shadow: 0 0 0 0    rgba(214,168,106,0.4); }
          50%      { box-shadow: 0 0 0 10px rgba(214,168,106,0);   }
        }
        @keyframes zara-think {
          0%,80%,100% { transform: scale(0); opacity: 0.3; }
          40%          { transform: scale(1); opacity: 1;   }
        }
        .zara-input:focus { outline: none; border-color: rgba(214,168,106,0.55) !important; }
        .zara-input::placeholder { color: #5a3a24; }
        .zara-btn:hover:not(:disabled) { background: rgba(214,168,106,0.24) !important; }
        .zara-toggle:hover { opacity: 0.7; }
      `}</style>

   
      <div style={{
        background: "linear-gradient(135deg, #100905 0%, #1a0f07 60%, #0c0603 100%)",
        border: `1px solid ${speaking ? "rgba(214,168,106,0.45)" : "rgba(214,168,106,0.15)"}`,
        borderRadius: 18,
        padding: "16px 20px",
        marginBottom: 20,
        boxShadow: speaking
          ? "0 0 40px rgba(214,168,106,0.14), 0 8px 36px rgba(0,0,0,0.5)"
          : "0 6px 28px rgba(0,0,0,0.4)",
        transition: "border-color 0.4s ease, box-shadow 0.4s ease",
        /*position: "relative",*/
      }}>
        {/* Powered by tag */}
<div style={{
  display: "flex", alignItems: "center", justifyContent: "space-between",
  marginBottom: 12,
}}>
  <span style={{
    fontSize: 9, fontWeight: 700, letterSpacing: 2, /*textTransform: "uppercase",*/
    color: "#fff",
  }}>
    Powered by ZaraAI
  </span>
  <span style={{
    fontSize: 9, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase",
    color: "#ddd", fontStyle: "italic",
  }}>
    Africa's First Intelligence
  </span>
</div>

        {/* Header row — always visible */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
          onClick={() => setExpanded(e => !e)}
        >
          
          {/* ZaraLogo */}
  <img src={ZaraLogo} width={44} height={44} style={{ borderRadius: "50%", flexShrink: 0 }} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#d6a86a", letterSpacing: 2.5, textTransform: "uppercase" }}>
                Zara
              </span>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                color: loading ? "#b8864a" : speaking ? "#d6a86a" : listening ? "#d6a86a" : "#3d2518",
                transition: "color 0.3s",
              }}>
{loading ? "THINKING" : speaking ? "SPEAKING" : listening && !loading && !speaking ? "LISTENING" : "STANDBY"}
              </span>

              {queueSize > 0 && (
                <span style={{
                  fontSize: 9, fontWeight: 800,
                  background: "rgba(214,168,106,0.2)",
                  border: "1px solid rgba(214,168,106,0.4)",
                  color: "#d6a86a", borderRadius: 20,
                  padding: "1px 7px", letterSpacing: 1,
                }}>
                  {queueSize} waiting
                </span>
              )}
            </div>
         <ZaraWave speaking={speaking} listening={listening} />
          </div>

          {/* Collapsed one-line preview */}
          {!expanded && !loading && (
            <p style={{
              margin: 0, fontSize: 12, color: "#5a3a24",
              maxWidth: "55%", overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap",
              textAlign: "right", flexShrink: 0,
            }}>{displayed}</p>
          )}

          {/* Chevron */}
          <span className="zara-toggle" style={{
            fontSize: 13, color: "#5a3a24", flexShrink: 0,
            transition: "transform 0.25s ease",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}>▼</span>
        </div>

        {/* Expanded body */}
        {expanded && (
          <div style={{ marginTop: 16 }}>

            {/* Message bubble */}
            <div style={{
              background: "rgba(255,238,215,0.035)",
              border: "1px solid rgba(214,168,106,0.1)",
              borderRadius: 12, padding: "14px 16px",
              minHeight: 60, marginBottom: 14,
            }}>
              {loading ? (
                <div style={{ display: "flex", gap: 6, alignItems: "center", height: 22 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: "50%", background: "#b8864a",
                      animation: `zara-think 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              ) : (
                <p style={{
                  margin: 0, fontSize: 13.5, lineHeight: 1.75,
                  color: "#f3eadf", fontFamily: "Inter, sans-serif", fontWeight: 400,
                }}>{displayed}</p>
              )}
            </div>

            {/* Error callout */}
            {error && (
              <div style={{
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 10, padding: "10px 14px", marginBottom: 12,
                fontSize: 12, color: "#f87171", lineHeight: 1.5,
              }}>
                <strong>Setup needed:</strong> {error}
              </div>
            )}

            {/* Input row */}
{/* Input row */}
<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
  <div style={{ flex: 1, position: "relative" }}>
    <input
      className="zara-input"
      value={input}
      onChange={e => setInput(e.target.value)}
      onKeyDown={e => e.key === "Enter" && submit()}
      placeholder="Ask Zara or tap to speak…"
      disabled={loading}
      style={{
        width: "100%", boxSizing: "border-box",
        background: "rgba(255,238,215,0.035)",
        border: "1px solid rgba(214,168,106,0.15)",
        borderRadius: 10,
        padding: input.trim() ? "10px 44px 10px 14px" : "10px 14px",
        color: "peru", fontSize: 13,
        fontFamily: "Inter, sans-serif",
        transition: "border-color 0.2s, padding 0.15s",
        opacity: loading ? 0.5 : 1,
      }}
    />
    {input.trim() && (
      <button
        onMouseDown={e => { e.preventDefault(); submit(); }}
        disabled={loading}
        style={{
          position: "absolute", right: 6, top: "50%",
          transform: "translateY(-50%)",
          background: "rgba(214,168,106,0.15)",
          border: "1px solid rgba(214,168,106,0.35)",
          borderRadius: 7, width: 30, height: 30,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.4 : 1,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 19V5M5 12l7-7 7 7" stroke="#d6a86a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    )}
  </div>
{/* Record button + lock */}
<div style={{ position: "relative", display: "flex", alignItems: "center" }}>

  {/* Lock icon — floats above when listening */}
{listening && !ELEVENLABS_KEY && (
  <button onClick={toggleLock}
      title={locked ? "Unlock — stop listening" : "Lock — keep listening"}
      style={{
        position: "absolute",
        top: locked ? -38 : -32,
        left: "50%",
        transform: "translateX(-50%)",
        background: locked ? "rgba(214,168,106,0.25)" : "rgba(40,20,10,0.85)",
        border: `1px solid ${locked ? "rgba(214,168,106,0.8)" : "rgba(214,168,106,0.3)"}`,
        borderRadius: 20,
        padding: "4px 10px",
        cursor: "pointer",
        fontSize: 13,
        color: locked ? "#facc15" : "#d6a86a",
        transition: "all 0.25s ease",
        animation: "zara-lock-float 0.3s ease",
        whiteSpace: "nowrap",
        zIndex: 10,
      }}
    >
      {locked ? "🔒" : "🔓"}
    </button>
  )}

  {/* Record button */}
  <button
    className="zara-btn"
onClick={listening ? stopListening : startListening}
    disabled={loading}
    title={listening ? "Listening…" : "Speak to Zara"}
    style={{
      padding: "10px 14px",
      borderRadius: 10,
      background: listening
        ? "rgba(239,68,68,0.15)"
        : "rgba(214,168,106,0.08)",
      border: `1px solid ${listening
        ? "rgba(239,68,68,0.6)"
        : "rgba(214,168,106,0.28)"}`,
      color: listening ? "#f87171" : "#d6a86a",
      cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.35 : 1,
      transition: "all 0.2s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 44,
      height: 44,
    }}
  >
    {/* Clean record icon — circle with dot */}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    {listening ? (
  // Animated stop square
  <rect x="6" y="6" width="12" height="12" rx="2.5"
    fill="#f87171"
    style={{ animation: "zara-record-pulse 1s ease-in-out infinite" }}
  />
) : (
  // Real mic icon
  <>
    {/* Mic capsule */}
    <rect x="9" y="2" width="6" height="11" rx="3" fill="#d6a86a" />
    {/* Mic stand arc */}
    <path d="M5 11a7 7 0 0 0 14 0" stroke="#d6a86a" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    {/* Stem */}
    <line x1="12" y1="18" x2="12" y2="21" stroke="#d6a86a" strokeWidth="1.8" strokeLinecap="round"/>
    {/* Base */}
    <line x1="9" y1="21" x2="15" y2="21" stroke="#d6a86a" strokeWidth="1.8" strokeLinecap="round"/>
  </>
)}
    </svg>
  </button>
</div>
            </div>

            <p style={{ margin: "10px 0 0", fontSize: 11, color: "peru", fontStyle: "italic" }}>
              Zara monitors every order in real time and speaks the moment something needs your attention.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
