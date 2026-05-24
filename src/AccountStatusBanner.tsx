import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ZaraLogo from "./assets/ZaraLogo.png";
import { API_BASE } from "./Config/api";

type AccountStatus = {
  name: string;
  email: string;
  plan: string | null;
  status: "trial" | "active" | "expired" | "none";
  trial_ends_at: string | null;
  subscription_start: string | null;
  subscription_end: string | null;
  zara_credits: number;
  zara_credits_used: number;
};

function daysLeft(dateStr: string | null): number {
  if (!dateStr) return 0;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function fmt(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function AccountStatusBanner() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<AccountStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchStatus = () => {
    fetch(`${API_BASE}/accountStatus`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { setAccount(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  fetchStatus();
  const interval = setInterval(fetchStatus, 5000);
  return () => clearInterval(interval);
}, []);

  if (loading) return (
    <div style={styles.skeleton} />
  );

  if (!account) return null;

  const { name, email, plan, status, trial_ends_at, subscription_start, subscription_end, zara_credits, zara_credits_used } = account;
  const zaraUsedPct = zara_credits > 0 ? Math.min(100, Math.round((zara_credits_used / zara_credits) * 100)) : 0;
  const zaraRemaining = Math.max(0, zara_credits - zara_credits_used);
  const trialDays = daysLeft(trial_ends_at);
  const renewDays = daysLeft(subscription_end);

  // ── Colors per status ──
  const statusConfig = {
    trial: {
      accent: "#fbbf24",
      bg: "rgba(251,191,36,0.06)",
      border: "rgba(251,191,36,0.2)",
      label: `Trial · ${trialDays} day${trialDays !== 1 ? "s" : ""} left`,
      dot: "#fbbf24",
    },
    active: {
      accent: "#4ade80",
      bg: "rgba(74,222,128,0.05)",
      border: "rgba(74,222,128,0.18)",
      label: "Active Subscription",
      dot: "#4ade80",
    },
    expired: {
      accent: "#f87171",
      bg: "rgba(248,113,113,0.06)",
      border: "rgba(248,113,113,0.2)",
      label: "Subscription Expired",
      dot: "#f87171",
    },
    none: {
      accent: "#d6a86a",
      bg: "rgba(214,168,106,0.05)",
      border: "rgba(214,168,106,0.15)",
      label: "No Active Plan",
      dot: "#888",
    },
  }[status];

  return (
    <div style={{ ...styles.banner, background: statusConfig.bg, border: `1px solid ${statusConfig.border}` }}>

      {/* Left — identity */}
      <div style={styles.section}>
        <div style={styles.avatar}>{name.charAt(0).toUpperCase()}</div>
        <div>
          <p style={styles.name}>{name}</p>
          <p style={styles.email}>{email}</p>
        </div>
      </div>

      <div style={styles.divider} />

      {/* Status pill */}
      <div style={styles.section}>
        <div style={{ ...styles.pill, background: `${statusConfig.accent}18`, border: `1px solid ${statusConfig.accent}40` }}>
          <span style={{ ...styles.dot, background: statusConfig.dot }} />
          <span style={{ ...styles.pillText, color: statusConfig.accent }}>{statusConfig.label}</span>
        </div>
        {plan && (
          <p style={styles.planName}>{plan}</p>
        )}
      </div>

      <div style={styles.divider} />

      {/* Dates */}
      <div style={styles.section}>
        {status === "trial" && (
          <>
            <DateRow label="Trial ends" value={fmt(trial_ends_at)} accent={trialDays <= 2 ? "#f87171" : "#fbbf24"} />
         <DateRow label="Started" value={fmt(subscription_start)} accent="#aaaaaa" />
          </>
        )}
        {status === "active" && (
          <>
            <DateRow label="Started" value={fmt(subscription_start)} accent="#4ade80" />
            <DateRow label="Renews" value={`${fmt(subscription_end)} · ${renewDays}d left`} accent="#d6a86a" />
          </>
        )}
        {status === "expired" && (
          <DateRow label="Expired" value={fmt(subscription_end)} accent="#f87171" />
        )}
        {status === "none" && (
          <DateRow label="Plan" value="No plan selected" accent="#888" />
        )}
      </div>

      <div style={styles.divider} />

      {/* Zara Credits */}
{/* Zara Credits */}
<div style={{ ...styles.section, flexDirection: "column", alignItems: "flex-start", gap: 8, minWidth: 160 }}>
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
    <p style={styles.zaraLabel}>
      <img src={ZaraLogo} alt="Zara" style={{ height: 30, width: "auto", verticalAlign: "middle", marginRight: 6 }} />
      Zara Credits
    </p>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <p style={styles.zaraCount}>
        <span style={{ color: "#d6a86a", fontWeight: 700 }}>{zaraRemaining.toLocaleString()}</span>
        <span style={{ color: "#555", fontSize: 11 }}> / {zara_credits.toLocaleString()}</span>
      </p>
      <button
        onClick={() => navigate("/zara-topup")}
        style={styles.topupBtn}
        onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
        title="Top up Zara Credits"
      >
        + Top Up
      </button>
    </div>
  </div>
  {/* Progress bar */}
  <div style={styles.progressTrack}>
    <div style={{
      ...styles.progressFill,
      width: `${zaraUsedPct}%`,
      background: zaraUsedPct > 80 ? "#f87171" : zaraUsedPct > 50 ? "#fbbf24" : "#d6a86a",
    }} />
  </div>
  <p style={{ fontSize: 10, color: "#555", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
    {zaraUsedPct}% used
  </p>
</div>

      {/* CTA */}
      {(status === "trial" || status === "expired" || status === "none") && (
        <>
          <div style={styles.divider} />
          <button
            onClick={() => navigate("/plan")}
            style={styles.upgradeBtn}
            onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
          >
            {status === "trial" ? "Upgrade Plan" : "Choose a Plan"}
          </button>
        </>
      )}

    </div>
  );
}

function DateRow({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <p style={{ fontSize: 10, color: "#666", fontFamily: "'DM Mono', monospace", letterSpacing: 1.5, textTransform: "uppercase" }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: accent, fontFamily: "'DM Sans', sans-serif" }}>{value}</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  banner: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 20,
    borderRadius: 16,
    padding: "16px 20px",
    marginBottom: 18,
    transition: "all 0.3s ease",
  },
  skeleton: {
    height: 80,
    borderRadius: 16,
    marginBottom: 18,
    background: "linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
  },
  section: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  divider: {
    width: 1,
    height: 40,
    background: "rgba(255,238,215,0.08)",
    flexShrink: 0,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #d6a86a, #b8864a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 700,
    color: "#0c0602",
    flexShrink: 0,
    fontFamily: "'DM Sans', sans-serif",
  },
  name: {
    fontSize: 14,
    fontWeight: 700,
    color: "#f3eadf",
    fontFamily: "'DM Sans', sans-serif",
  },
  email: {
    fontSize: 11,
    color: "#888",
    fontFamily: "'DM Mono', monospace",
    letterSpacing: 0.3,
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 12px",
    borderRadius: 100,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    flexShrink: 0,
  },
  pillText: {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  planName: {
    fontSize: 12,
    color: "#aaaaaa",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
  },
  zaraLabel: {
    fontSize: 11,
    color: "#888",
    fontFamily: "'DM Mono', monospace",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  zaraCount: {
    fontSize: 13,
    fontFamily: "'DM Mono', monospace",
  },
  progressTrack: {
    width: "100%",
    height: 5,
    borderRadius: 100,
    background: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 100,
    transition: "width 0.6s ease",
  },
  topupBtn: {
  padding: "5px 12px",
  borderRadius: 100,
  background: "transparent",
  border: "1px solid rgba(214,168,106,0.4)",
  color: "#d6a86a",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 1.2,
  textTransform: "uppercase" as const,
  cursor: "pointer",
  fontFamily: "'DM Mono', monospace",
  transition: "transform 0.2s ease",
  whiteSpace: "nowrap" as const,
},
  upgradeBtn: {
    padding: "10px 20px",
    borderRadius: 100,
    background: "linear-gradient(135deg, #d6a86a, #b8864a)",
    border: "none",
    color: "#0c0602",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "transform 0.2s ease",
    whiteSpace: "nowrap",
  },
};

