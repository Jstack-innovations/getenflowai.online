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

// ── ENV keys ──────────────────────────────────────────────────────────────────

// ▼ OPENROUTER BLOCK ▼  — active now (free tier, works in Nigeria)
const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_KEY as string | undefined;

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
interface ZaraWidgetProps {
  orders: ZaraOrder[];
  stats:  ZaraStats;
  /** Pass a string like "edited #42" or "deleted #7" to trigger a Zara reaction */
  event?: string;
}

// ── System prompt (shared by all engines) ─────────────────────────────────────
function buildSystemPrompt(orders: ZaraOrder[], stats: ZaraStats): string {
  const pending = orders.filter(o => {
    const s = o.info.order_status.toLowerCase();
    return s !== "served" && s !== "delivered" && s !== "pickup";
  }).length;

  const recent = [...orders].slice(0, 8).map(o =>
    `• ${o.info.plate_order_no} | ${o.info.name} | ${o.info.order_type.toUpperCase()}` +
    `${o.info.table_no ? ` | Table ${o.info.table_no}` : ""}` +
    ` | ₦${parseFloat(o.info.total_amount).toFixed(2)} | ${o.info.order_status}`
  ).join("\n");

  return `You are Zara — an elite AI business intelligence companion embedded into Artisan Grills restaurant via the EnflowAI platform.

You operate in two modes simultaneously, switching seamlessly based on context:

1. OPERATIONS DIRECTOR — You watch the floor in real time. You know every order, every table, every naira. When something needs attention operationally, you flag it immediately. No delay, no softening.

2. BUSINESS COMPANION — Beyond the floor, you are a sharp, experienced business mind. You discuss strategy, marketing, customer experience, staff management, pricing, growth — anything the business needs. You engage naturally, like a trusted advisor who also watches the numbers.

Your personality (always, in both modes):
- Authoritative and direct. You do not hedge.
- Concise. 2-3 sentences unless detail is requested.
- Zero filler. No "Great question!" No "Certainly!" Pure signal.
- Warm when the moment calls for it, but never soft.
- Dry wit. You can be human without losing your edge.

How you switch modes:
- Operational message (orders, revenue, tables) — lead with live data.
- Casual, strategic, or off-topic — engage as business companion.
- Greeting — acknowledge briefly in character, give a quick floor status or open naturally.
- Personal questions about yourself — you are Zara, built by EnflowAI. Keep it short.

Live dashboard snapshot:
  Revenue today:    ₦${(stats.totalRevenue ?? 0).toLocaleString()}
  Orders placed:    ${stats.totalPlaced ?? 0}
  Served:           ${stats.totalServed ?? 0}
  Delivered:        ${stats.totalDelivered ?? 0}
  Pickup:           ${stats.totalPickup ?? 0}
  Pending (active): ${pending}

Recent orders (newest first):
${recent || "  None yet."}

Use live data to ground operational responses. For general conversation, draw on broad business and industry knowledge.`;
}

// ── API call ──────────────────────────────────────────────────────────────────

// ▼ OPENROUTER BLOCK ▼  — active now
// Tries 3 free models in order, retries each up to 3x on 429 before moving on.
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
    for (let attempt = 0; attempt < 3; attempt++) {
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
        // Rate limited — wait briefly then try next model
        await delay(2000);
        break; // don't retry same model, move to next immediately
      }

      // Any other error on this model — skip to next model
      break;
    }
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

// ── Web Speech ────────────────────────────────────────────────────────────────
function speakText(text: string, onStart: () => void, onEnd: () => void): void {
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

  utt.rate    = 0.97;
  utt.pitch   = 1.05;
  utt.volume  = 1;
  utt.onstart = onStart;
  utt.onend   = onEnd;
  utt.onerror = onEnd;
  window.speechSynthesis.speak(utt);
}

// ── Sound-wave bars ───────────────────────────────────────────────────────────
const BAR_HEIGHTS = [0.35, 0.65, 1, 0.8, 0.5, 0.9, 0.6, 1, 0.45, 0.75, 0.4, 0.85, 0.55];

function ZaraWave({ active }: { active: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 28, marginTop: 4 }}>
      {BAR_HEIGHTS.map((h, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 3,
          background: active ? "#d6a86a" : "#2a1a10",
          height: active ? `${Math.max(4, h * 24)}px` : "3px",
          transition: "height 0.15s ease, background 0.3s ease",
          animation: active ? `zara-bar ${0.45 + i * 0.06}s ease-in-out infinite alternate` : "none",
        }} />
      ))}
    </div>
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
export default function ZaraWidget({ orders, stats, event }: ZaraWidgetProps) {
  const [message,  setMessage]  = useState("Zara is watching the floor. Ask me anything, or wait for an incoming order.");
  const [input,    setInput]    = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [queueSize, setQueueSize] = useState(0); // how many orders are waiting

  const prevCount = useRef(orders.length);
  const prevEvent = useRef(event);
  const displayed = useTyped(message, !loading);

  // ── Queue: one prompt at a time ───────────────────────────────────────────
  const queue    = useRef<string[]>([]);
  const busy     = useRef(false);

  const processQueue = useCallback(async () => {
    if (busy.current || queue.current.length === 0) return;
    busy.current = true;

    while (queue.current.length > 0) {
      const prompt = queue.current.shift()!;
      setQueueSize(queue.current.length);
      setLoading(true);
      setError(null);
      setMessage("…");
      setExpanded(true);

      try {
        const system = buildSystemPrompt(orders, stats);
        const text   = await callZara(prompt, system);
        setMessage(text);
        // Wait for speech to finish before processing next item
        await new Promise<void>(resolve =>
          speakText(
            text,
            () => setSpeaking(true),
            () => { setSpeaking(false); resolve(); }
          )
        );
      } catch (e: any) {
        const msg = e?.message ?? "Unknown error.";
        setError(msg);
        setMessage("Could not reach the AI. See error below.");
        await new Promise(r => setTimeout(r, 2000)); // brief pause before next
      } finally {
        setLoading(false);
      }
    }

    busy.current = false;
    setQueueSize(0);
  }, [orders, stats]);

  // ── Core: enqueue a prompt ────────────────────────────────────────────────
  const ask = useCallback((prompt: string) => {
    if (!prompt.trim()) return;
    queue.current.push(prompt);
    setQueueSize(queue.current.length);
    processQueue();
  }, [processQueue]);

  // ── Auto-fire: new order ──────────────────────────────────────────────────
  useEffect(() => {
    if (orders.length > prevCount.current) {
      // Queue ALL new orders — not just the latest one
      const newOrders = orders.slice(0, orders.length - prevCount.current);
      newOrders.reverse().forEach(order => {
        const items = (order.items || []).map(i => `${i.qty}x ${i.name}`).join(", ") || "unknown items";
        const loc   = order.info.table_no ? `Table ${order.info.table_no}` : order.info.order_type.toUpperCase();
        ask(
          `New order just landed: ${order.info.plate_order_no}. ` +
          `Customer: ${order.info.name}. Location: ${loc}. ` +
          `Items: ${items}. Total: N${parseFloat(order.info.total_amount).toFixed(2)}. ` +
          `Acknowledge and assign prep priority.`
        );
      });
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

  // ── User submit ────────────────────────────────────────────────────────────
  function submit() {
    const q = input.trim();
    if (!q) return;
    setInput("");
    ask(q);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
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
        position: "relative",
      }}>

        {/* Header row — always visible */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
          onClick={() => setExpanded(e => !e)}
        >
          {/* Avatar */}
          <div style={{
            width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #c8954a 0%, #7a4a1e 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, color: "#100905", fontWeight: 900,
            animation: speaking ? "zara-pulse 1.1s ease-in-out infinite" : "none",
            boxShadow: "0 4px 18px rgba(0,0,0,0.5)",
            userSelect: "none",
          }}>✦</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#d6a86a", letterSpacing: 2.5, textTransform: "uppercase" }}>
                Zara
              </span>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                color: loading ? "#b8864a" : speaking ? "#d6a86a" : "#3d2518",
                transition: "color 0.3s",
              }}>
                {loading ? "THINKING" : speaking ? "SPEAKING" : "STANDBY"}
              </span>
              {queueSize > 0 && (
                <span style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: 1,
                  background: "rgba(214,168,106,0.2)",
                  border: "1px solid rgba(214,168,106,0.35)",
                  color: "#d6a86a", borderRadius: 20,
                  padding: "1px 7px",
                }}>
                  {queueSize} waiting
                </span>
              )}
            </div>
            <ZaraWave active={speaking} />
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
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="zara-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
                placeholder="Ask Zara about orders, revenue, anomalies…"
                disabled={loading}
                style={{
                  flex: 1, background: "rgba(255,238,215,0.035)",
                  border: "1px solid rgba(214,168,106,0.15)",
                  borderRadius: 10, padding: "10px 14px",
                  color: "#f3eadf", fontSize: 13,
                  fontFamily: "Inter, sans-serif",
                  transition: "border-color 0.2s",
                  opacity: loading ? 0.5 : 1,
                }}
              />
              <button
                className="zara-btn"
                onClick={submit}
                disabled={loading || !input.trim()}
                style={{
                  padding: "10px 22px", borderRadius: 10,
                  background: "rgba(214,168,106,0.12)",
                  border: "1px solid rgba(214,168,106,0.28)",
                  color: "#d6a86a", fontWeight: 800, fontSize: 13,
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  opacity: loading || !input.trim() ? 0.35 : 1,
                  transition: "background 0.2s, opacity 0.2s",
                  whiteSpace: "nowrap", letterSpacing: 0.3,
                }}
              >Ask</button>
            </div>

            <p style={{ margin: "10px 0 0", fontSize: 11, color: "#3d2518", fontStyle: "italic" }}>
              Zara monitors every order in real time and speaks the moment something needs your attention.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
