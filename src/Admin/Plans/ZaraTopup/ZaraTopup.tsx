import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ZaraLogo from "../../../assets/ZaraLogo.png";
import { API_BASE } from "../../../Config/api";

declare global {
  interface Window {
    FlutterwaveCheckout: (config: Record<string, unknown>) => void;
  }
}

type AccountStatus = {
  name: string;
  email: string;
  zara_credits: number;
  zara_credits_used: number;
};

const PACKS = [
  { id: "starter",    credits: 500,   full: 55000,   discount: 5,  price: 52250,  label: "Starter",    popular: false },
  { id: "basic",      credits: 1000,  full: 110000,  discount: 8,  price: 101200, label: "Basic",      popular: false },
  { id: "standard",   credits: 2500,  full: 275000,  discount: 12, price: 242000, label: "Standard",   popular: false },
  { id: "popular",    credits: 3000,  full: 330000,  discount: 15, price: 280500, label: "Popular",    popular: true  },
  { id: "pro",        credits: 5000,  full: 550000,  discount: 18, price: 451000, label: "Pro",        popular: false },
  { id: "business",   credits: 7000,  full: 770000,  discount: 22, price: 600600, label: "Business",   popular: false },
  { id: "enterprise", credits: 10000, full: 1100000, discount: 25, price: 825000, label: "Enterprise", popular: false },
];

function fmt(n: number) {
  return n.toLocaleString("en-NG");
}

export default function ZaraTopup() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<AccountStatus | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const scriptLoaded = useRef(false);
  const publicKeyRef = useRef<string>("");

  useEffect(() => {
    fetch(`${API_BASE}/accountStatus`, { credentials: "include" })
      .then(r => r.json())
      .then(setAccount)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (scriptLoaded.current) return;
    scriptLoaded.current = true;

    fetch(`${API_BASE}/flutterwave`)
      .then(r => r.json())
      .then(data => {
        if (!data.publicKey) return;
        publicKeyRef.current = data.publicKey;

        const script = document.createElement("script");
        script.src = "https://checkout.flutterwave.com/v3.js";
        script.async = true;
        document.body.appendChild(script);
      })
      .catch(() => {});
  }, []);

  const zaraRemaining = account
    ? Math.max(0, account.zara_credits - account.zara_credits_used)
    : 0;

  const selectedPack = PACKS.find(p => p.id === selected);

  function handlePay() {
    if (!selectedPack || !account) return;
    if (!publicKeyRef.current) return;
    setPaying(true);

    window.FlutterwaveCheckout({
      public_key: publicKeyRef.current,
      tx_ref: `zara-topup-${Date.now()}`,
      amount: selectedPack.price,
      currency: "NGN",
      payment_options: "card,banktransfer,ussd",
      customer: {
        email: account.email,
        name: account.name,
      },
      customizations: {
        title: "Zara Credit Top-Up",
        description: `${fmt(selectedPack.credits)} Zara Credits`,
        logo: ZaraLogo,
      },
      meta: {
        pack_id: selectedPack.id,
        credits: selectedPack.credits,
        email: account.email,
      },
      callback: async (response: { status: string; tx_ref: string; transaction_id: string }) => {
  if (response.status === "successful" || response.status === "completed") {
    try {
      const res = await fetch(`${API_BASE}/zaraTopup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tx_ref: response.tx_ref,
          transaction_id: response.transaction_id,
          pack_id: selectedPack.id,
          email: account.email,
          credits: selectedPack.credits,
        }),
      });
      const result = await res.json();
      if (result.status === "success") {
        setSuccess(true);
      }
    } catch (_) {}
  }
  setPaying(false);
},
      onclose: () => setPaying(false),
    });
  }

  if (success) {
    return (
      <div style={styles.page}>
        <Particles />
        <div style={styles.successWrap}>
          <div style={styles.successGlow} />
          <img src={ZaraLogo} alt="Zara" style={styles.successLogo} />
          <h2 style={styles.successTitle}>Credits Loaded</h2>
          <p style={styles.successSub}>
            <span style={{ color: "#d6a86a", fontWeight: 700 }}>
              {fmt(selectedPack?.credits ?? 0)}
            </span>{" "}
            Zara credits have been added to your account.
          </p>
          <button
            style={styles.backBtn}
            onClick={() => window.location.href = "https://admin-artisangrilluxe.vercel.app"}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Particles />

      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backLink} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div style={styles.headerCenter}>
          <img src={ZaraLogo} alt="Zara" style={styles.zaraLogoLg} />
          <div>
            <h1 style={styles.pageTitle}>Top Up Credits</h1>
            <p style={styles.pageSubtitle}>Purchase standalone Zara credits — no subscription needed</p>
          </div>
        </div>
      </div>

      {/* Balance card */}
      {account && (
        <div style={styles.balanceCard}>
          <div style={styles.balanceInner}>
            <p style={styles.balanceLabel}>Current Balance</p>
            <p style={styles.balanceValue}>
              <span style={{ color: "#d6a86a" }}>{fmt(zaraRemaining)}</span>
              <span style={{ color: "#444", fontSize: 16 }}> / {fmt(account.zara_credits)}</span>
            </p>
          </div>
          <div style={styles.balanceDivider} />
          <div style={styles.balanceInner}>
            <p style={styles.balanceLabel}>Account</p>
            <p style={{ fontSize: 13, color: "#aaa", fontFamily: "'DM Mono', monospace" }}>{account.email}</p>
          </div>
        </div>
      )}

      {/* Packs grid */}
      <div style={styles.grid}>
        {PACKS.map((pack, i) => {
          const isSelected = selected === pack.id;
          const saving = pack.full - pack.price;
          return (
            <div
              key={pack.id}
              style={{
                ...styles.card,
                ...(pack.popular ? styles.cardPopular : {}),
                ...(isSelected ? styles.cardSelected : {}),
                animationDelay: `${i * 60}ms`,
              }}
              onClick={() => setSelected(pack.id)}
            >
              {pack.popular && (
                <div style={styles.popularBadge}>⚡ Most Popular</div>
              )}
              <div style={styles.discountBadge}>{pack.discount}% OFF</div>

              <p style={styles.packLabel}>{pack.label}</p>
              <p style={styles.packCredits}>
                {fmt(pack.credits)}
                <span style={styles.packCreditsSub}> credits</span>
              </p>

              <div style={styles.pricingRow}>
                <p style={styles.packFullPrice}>₦{fmt(pack.full)}</p>
                <p style={styles.packPrice}>₦{fmt(pack.price)}</p>
              </div>

              <p style={styles.savingTag}>Save ₦{fmt(saving)}</p>

              <div style={styles.perCredit}>
                ₦{(pack.price / pack.credits).toFixed(0)} per credit
              </div>

              <div style={{
                ...styles.selectIndicator,
                ...(isSelected ? styles.selectIndicatorActive : {}),
              }}>
                {isSelected ? "✓ Selected" : "Select"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky CTA */}
      {selected && (
        <div style={styles.stickyBar}>
          <div style={styles.stickyInfo}>
            <p style={styles.stickyLabel}>
              {selectedPack?.label} Pack —{" "}
              <span style={{ color: "#d6a86a" }}>{fmt(selectedPack?.credits ?? 0)} credits</span>
            </p>
            <p style={styles.stickyPrice}>₦{fmt(selectedPack?.price ?? 0)}</p>
          </div>
          <button
            style={{ ...styles.payBtn, opacity: paying ? 0.6 : 1 }}
            onClick={handlePay}
            disabled={paying}
            onMouseEnter={e => { if (!paying) e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {paying ? "Opening Payment…" : "Pay with Flutterwave →"}
          </button>
        </div>
      )}

      <p style={styles.footer}>
        Credits are non-refundable and do not expire. Used exclusively for Zara AI interactions.
      </p>
    </div>
  );
}

// ── Ambient particles ──────────────────────────────────────
function Particles() {
  const dots = Array.from({ length: 28 }, (_, i) => i);
  return (
    <div style={styles.particles} aria-hidden>
      {dots.map(i => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: Math.random() * 3 + 1 + "px",
            height: Math.random() * 3 + 1 + "px",
            borderRadius: "50%",
            background: `rgba(214,168,106,${Math.random() * 0.25 + 0.05})`,
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%",
            animation: `float ${Math.random() * 6 + 6}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0a0702",
    color: "#f3eadf",
    fontFamily: "'DM Sans', sans-serif",
    padding: "32px 24px 120px",
    position: "relative",
    overflowX: "hidden",
  },
  particles: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
    position: "relative",
    zIndex: 1,
    marginBottom: 28,
  },
  backLink: {
    background: "transparent",
    border: "none",
    color: "#666",
    fontSize: 12,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: 1,
    cursor: "pointer",
    padding: "0 0 16px",
    textTransform: "uppercase" as const,
  },
  headerCenter: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  zaraLogoLg: {
    height: 48,
    width: "auto",
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: "#f3eadf",
    margin: 0,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: "#666",
    margin: "4px 0 0",
    fontFamily: "'DM Mono', monospace",
    letterSpacing: 0.3,
  },
  balanceCard: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: 20,
    background: "rgba(255,238,215,0.03)",
    border: "1px solid rgba(214,168,106,0.12)",
    borderRadius: 14,
    padding: "14px 20px",
    marginBottom: 32,
  },
  balanceDivider: {
    width: 1,
    height: 36,
    background: "rgba(255,238,215,0.08)",
  },
  balanceInner: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 4,
  },
  balanceLabel: {
    fontSize: 10,
    color: "#555",
    fontFamily: "'DM Mono', monospace",
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
    margin: 0,
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: 700,
    fontFamily: "'DM Mono', monospace",
    margin: 0,
  },
  grid: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16,
    marginBottom: 32,
  },
  card: {
    background: "rgba(255,238,215,0.025)",
    border: "1px solid rgba(255,238,215,0.07)",
    borderRadius: 16,
    padding: "22px 18px 18px",
    cursor: "pointer",
    position: "relative" as const,
    transition: "all 0.25s ease",
    animation: "fadeUp 0.4s ease both",
    overflow: "hidden" as const,
  },
  cardPopular: {
    border: "1px solid rgba(214,168,106,0.35)",
    background: "rgba(214,168,106,0.05)",
  },
  cardSelected: {
    border: "1px solid rgba(214,168,106,0.7)",
    background: "rgba(214,168,106,0.08)",
    transform: "translateY(-3px)",
    boxShadow: "0 12px 40px rgba(214,168,106,0.12)",
  },
  popularBadge: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(90deg, #d6a86a, #b8864a)",
    color: "#0a0702",
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
    textAlign: "center" as const,
    padding: "5px 0",
    fontFamily: "'DM Mono', monospace",
  },
  discountBadge: {
    display: "inline-block",
    background: "rgba(74,222,128,0.1)",
    border: "1px solid rgba(74,222,128,0.25)",
    color: "#4ade80",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
    borderRadius: 100,
    padding: "3px 8px",
    marginBottom: 14,
    marginTop: 4,
    fontFamily: "'DM Mono', monospace",
  },
  packLabel: {
    fontSize: 10,
    color: "#666",
    fontFamily: "'DM Mono', monospace",
    letterSpacing: 2,
    textTransform: "uppercase" as const,
    margin: "0 0 8px",
  },
  packCredits: {
    fontSize: 28,
    fontWeight: 800,
    color: "#f3eadf",
    margin: "0 0 12px",
    fontFamily: "'DM Sans', sans-serif",
    lineHeight: 1,
  },
  packCreditsSub: {
    fontSize: 13,
    fontWeight: 400,
    color: "#555",
  },
  pricingRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  packFullPrice: {
    fontSize: 11,
    color: "#444",
    fontFamily: "'DM Mono', monospace",
    textDecoration: "line-through",
    margin: 0,
  },
  packPrice: {
    fontSize: 16,
    fontWeight: 700,
    color: "#d6a86a",
    fontFamily: "'DM Mono', monospace",
    margin: 0,
  },
  savingTag: {
    fontSize: 10,
    color: "#4ade80",
    fontFamily: "'DM Mono', monospace",
    letterSpacing: 0.5,
    margin: "0 0 14px",
  },
  perCredit: {
    fontSize: 10,
    color: "#444",
    fontFamily: "'DM Mono', monospace",
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  selectIndicator: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "7px 0",
    borderRadius: 100,
    border: "1px solid rgba(255,238,215,0.1)",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
    fontFamily: "'DM Mono', monospace",
    color: "#555",
    transition: "all 0.2s ease",
  },
  selectIndicatorActive: {
    background: "linear-gradient(135deg, #d6a86a, #b8864a)",
    border: "1px solid transparent",
    color: "#0a0702",
  },
  stickyBar: {
    position: "fixed" as const,
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    gap: 20,
    background: "rgba(15,11,7,0.92)",
    border: "1px solid rgba(214,168,106,0.25)",
    borderRadius: 100,
    padding: "12px 16px 12px 24px",
    backdropFilter: "blur(20px)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(214,168,106,0.1)",
    flexWrap: "wrap" as const,
  },
  stickyInfo: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 2,
  },
  stickyLabel: {
    fontSize: 11,
    color: "#888",
    fontFamily: "'DM Mono', monospace",
    margin: 0,
    letterSpacing: 0.5,
  },
  stickyPrice: {
    fontSize: 16,
    fontWeight: 700,
    color: "#f3eadf",
    fontFamily: "'DM Mono', monospace",
    margin: 0,
  },
  payBtn: {
    padding: "12px 24px",
    borderRadius: 100,
    background: "linear-gradient(135deg, #d6a86a, #b8864a)",
    border: "none",
    color: "#0a0702",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "transform 0.2s ease",
    whiteSpace: "nowrap" as const,
  },
  successWrap: {
    position: "relative" as const,
    zIndex: 1,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "80vh",
    gap: 16,
    textAlign: "center" as const,
  },
  successGlow: {
    position: "absolute" as const,
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(214,168,106,0.12) 0%, transparent 70%)",
    pointerEvents: "none" as const,
  },
  successLogo: {
    height: 80,
    width: "auto",
    animation: "pulse 2s ease-in-out infinite",
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 800,
    color: "#f3eadf",
    margin: 0,
    letterSpacing: -1,
  },
  successSub: {
    fontSize: 15,
    color: "#888",
    fontFamily: "'DM Mono', monospace",
    margin: 0,
    letterSpacing: 0.3,
  },
  backBtn: {
    marginTop: 8,
    padding: "12px 28px",
    borderRadius: 100,
    background: "linear-gradient(135deg, #d6a86a, #b8864a)",
    border: "none",
    color: "#0a0702",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  footer: {
    position: "relative" as const,
    zIndex: 1,
    textAlign: "center" as const,
    fontSize: 11,
    color: "#333",
    fontFamily: "'DM Mono', monospace",
    letterSpacing: 0.5,
    marginTop: 16,
  },
};

// ── Global keyframes (inject once) ────────────────────────
const css = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-12px); }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%       { transform: scale(1.08); opacity: 0.75; }
  }
`;
if (typeof document !== "undefined" && !document.getElementById("zara-topup-styles")) {
  const tag = document.createElement("style");
  tag.id = "zara-topup-styles";
  tag.textContent = css;
  document.head.appendChild(tag);
}
