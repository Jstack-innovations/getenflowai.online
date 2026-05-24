import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE } from "../../Config/enflowApi";

type FormState = "idle" | "loading" | "success" | "error";

const COUNTRIES = [
  { code: "NG", flag: "🇳🇬", dial: "+234" },
  { code: "US", flag: "🇺🇸", dial: "+1" },
  { code: "GB", flag: "🇬🇧", dial: "+44" },
  { code: "GH", flag: "🇬🇭", dial: "+233" },
  { code: "KE", flag: "🇰🇪", dial: "+254" },
  { code: "ZA", flag: "🇿🇦", dial: "+27" },
  { code: "CA", flag: "🇨🇦", dial: "+1" },
  { code: "AU", flag: "🇦🇺", dial: "+61" },
  { code: "DE", flag: "🇩🇪", dial: "+49" },
  { code: "FR", flag: "🇫🇷", dial: "+33" },
  { code: "AE", flag: "🇦🇪", dial: "+971" },
  { code: "IN", flag: "🇮🇳", dial: "+91" },
];

export default function TrialSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const plan = location.state?.plan ?? null;

  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [status, setStatus] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const [trialDays, setTrialDays] = useState<number>(10);
  
  useEffect(() => {
  fetch(`${API_BASE}/settings`)
    .then(r => r.json())
    .then(data => setTrialDays(data.trial_days));
}, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #080502; }

      @keyframes grain {
        0%,100%{transform:translate(0,0)} 10%{transform:translate(-2%,-3%)} 20%{transform:translate(3%,2%)}
        30%{transform:translate(-1%,4%)} 40%{transform:translate(4%,-1%)} 50%{transform:translate(-3%,3%)}
        60%{transform:translate(2%,-4%)} 70%{transform:translate(-4%,2%)} 80%{transform:translate(3%,-2%)} 90%{transform:translate(-2%,4%)}
      }
      @keyframes float-orb {
        0%,100%{transform:translateY(0px) scale(1)} 50%{transform:translateY(-18px) scale(1.03)}
      }
      @keyframes fade-up {
        from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)}
      }
      @keyframes shimmer {
        0%{transform:translateX(-100%)} 100%{transform:translateX(400%)}
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes success-pop {
        0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1}
      }

      .enflow-input {
        width: 100%;
        background: rgba(255,238,215,0.03);
        border: 1px solid rgba(214,168,106,0.15);
        border-radius: 12px;
        padding: 16px 20px;
        color: #ffffff;
        font-size: 14px;
        font-family: 'DM Sans', sans-serif;
        font-weight: 300;
        outline: none;
        transition: border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
        letter-spacing: 0.3px;
      }
      .enflow-input::placeholder { color: #555555; }
      .enflow-input:focus {
        border-color: rgba(214,168,106,0.5);
        background: rgba(214,168,106,0.04);
        box-shadow: 0 0 0 3px rgba(214,168,106,0.06);
      }

      /* Phone */
      .phone-wrapper {
        display: flex;
        align-items: stretch;
        gap: 8px;
      }
      .phone-country-select {
        padding: 0 12px;
        background: rgba(214,168,106,0.08);
        border: 1px solid rgba(214,168,106,0.18);
        border-radius: 12px;
        color: #d6a86a;
        font-family: 'DM Mono', monospace;
        font-size: 13px;
        cursor: pointer;
        white-space: nowrap;
        flex-shrink: 0;
        outline: none;
        appearance: none;
        -webkit-appearance: none;
        transition: border-color 0.3s, background 0.3s;
        min-height: 52px;
      }
      .phone-country-select:focus {
        border-color: rgba(214,168,106,0.5);
        background: rgba(214,168,106,0.13);
      }
      .phone-country-select option { background: #120a04; color: #dddddd; }
      .phone-input { flex: 1; }

      .submit-btn {
        position: relative; overflow: hidden;
        width: 100%; padding: 16px;
        border-radius: 100px;
        background: linear-gradient(135deg, #d6a86a, #b8864a);
        border: none; color: #0c0602;
        font-size: 13px; font-weight: 700;
        letter-spacing: 2px; text-transform: uppercase;
        cursor: pointer; font-family: 'DM Sans', sans-serif;
        transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.3s;
      }
      .submit-btn::after {
        content:''; position:absolute; top:0; left:0; width:40px; height:100%;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);
        animation: shimmer 2.5s infinite;
      }
      .submit-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 32px rgba(214,168,106,0.35); }
      .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setStatus("error");
      setMessage("Please fill in all fields.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/trialSignup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: `${selectedCountry.dial} ${phone}`,
          plan: plan?.title ?? null,
        }),
      });

      const data = await res.json();
      
      if (data.status === "existing") {
  setStatus("success");
  setMessage("Welcome back! Redirecting you to upgrade...");
  setTimeout(() => navigate("/checkout", { state: { plan, user: data.user } }), 1800);
      } else if (data.status === "new") {
        setStatus("success");
        setMessage("Trial started! Taking you to set up your account...");
        setTimeout(() => navigate("/onboarding", { state: { user: data.user, plan } }), 1800);
      } else {
        setStatus("error");
        setMessage(data.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div style={{ background: "#080502", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#dddddd", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>

      {/* Grain */}
      <div style={{ position: "fixed", inset: "-50%", zIndex: 1, pointerEvents: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`, animation: "grain 0.5s steps(1) infinite", opacity: 0.4 }} />

      {/* Orbs */}
      <div style={{ position: "fixed", top: "5%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(214,168,106,0.08) 0%, transparent 70%)", animation: "float-orb 9s ease-in-out infinite", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "5%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)", animation: "float-orb 11s ease-in-out infinite reverse", zIndex: 0 }} />

      {/* Card */}
      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 460, animation: "fade-up 0.8s ease both" }}>

        {/* Back */}
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#888", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", cursor: "pointer", marginBottom: 32, display: "flex", alignItems: "center", gap: 8, padding: 0, transition: "color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#d6a86a")}
          onMouseLeave={e => (e.currentTarget.style.color = "#888")}
        >
          ← Back
        </button>

        {/* Logo / Brand */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "inline-block", fontSize: 10, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: "#d6a86a", fontFamily: "'DM Mono', monospace", border: "1px solid rgba(214,168,106,0.25)", borderRadius: 100, padding: "5px 16px", background: "rgba(214,168,106,0.05)", marginBottom: 20 }}>
            Enflow · Africa's First Restaurant Intelligence
          </div>
          <h1 style={{ fontSize: "clamp(30px, 5vw, 44px)", fontWeight: 300, fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.1, color: "#ffffff", marginBottom: 12 }}>
            Start Your <em style={{ fontStyle: "italic", color: "#d6a86a" }}>{trialDays}-Day Free</em> Trial
          </h1>
          <p style={{ fontSize: 14, color: "#aaaaaa", lineHeight: 1.7, fontWeight: 300 }}>
            Enter your details below. No credit card needed — full access to Enflow and Zara AI from day one.
          </p>
          {plan && (
            <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(214,168,106,0.07)", border: "1px solid rgba(214,168,106,0.2)", borderRadius: 100, padding: "6px 16px" }}>
              <span style={{ fontSize: 10, color: "#d6a86a", fontFamily: "'DM Mono', monospace", letterSpacing: 2, textTransform: "uppercase" }}>Selected plan</span>
              <span style={{ fontSize: 11, color: "#ffffff", fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{plan.title} — {plan.price}</span>
            </div>
          )}
        </div>

        {/* Form */}
        <div style={{ background: "rgba(255,238,215,0.02)", border: "1px solid rgba(214,168,106,0.1)", borderRadius: 20, padding: "36px 32px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#888", fontFamily: "'DM Mono', monospace" }}>Full Name</label>
            <input
              className="enflow-input"
              type="text"
              placeholder="e.g. Kendrell Powells"
              value={name}
              onChange={e => setName(e.target.value)}
              onFocus={() => setFocused("name")}
              onBlur={() => setFocused(null)}
              disabled={status === "loading" || status === "success"}
            />
          </div>

          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#888", fontFamily: "'DM Mono', monospace" }}>Email Address</label>
            <input
              className="enflow-input"
              type="email"
              placeholder="e.g. Powells@ccjitters.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              disabled={status === "loading" || status === "success"}
            />
          </div>

          {/* Phone with country code dropdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#888", fontFamily: "'DM Mono', monospace" }}>Phone Number</label>
            <div className="phone-wrapper">
              <select
                className="phone-country-select"
                value={selectedCountry.code}
                onChange={e => {
                  const found = COUNTRIES.find(c => c.code === e.target.value);
                  if (found) setSelectedCountry(found);
                }}
                disabled={status === "loading" || status === "success"}
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.dial}</option>
                ))}
              </select>
              <input
                className="enflow-input phone-input"
                type="tel"
                placeholder="e.g. 800 000 0000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onFocus={() => setFocused("phone")}
                onBlur={() => setFocused(null)}
                disabled={status === "loading" || status === "success"}
              />
            </div>
          </div>

          {/* Error / Success message */}
          {message && (
            <div style={{
              padding: "12px 16px",
              borderRadius: 10,
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.6,
              background: status === "error" ? "rgba(239,68,68,0.08)" : "rgba(214,168,106,0.08)",
              border: `1px solid ${status === "error" ? "rgba(239,68,68,0.25)" : "rgba(214,168,106,0.25)"}`,
              color: status === "error" ? "#f87171" : "#d6a86a",
              animation: "success-pop 0.4s ease both",
            }}>
              {status === "success" ? "✓ " : "⚠ "}{message}
            </div>
          )}

          {/* Submit */}
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={status === "loading" || status === "success"}
          >
            {status === "loading" ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 14, height: 14, border: "2px solid rgba(12,6,2,0.3)", borderTopColor: "#0c0602", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                Checking...
              </span>
            ) : status === "success" ? "✓ Redirecting..." : "Start Free Trial →"}
          </button>

          <p style={{ textAlign: "center", fontSize: 11, color: "#555", letterSpacing: 0.5 }}>
            By continuing you agree to Enflow's Terms of Service. No spam, ever.
          </p>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "#444", letterSpacing: 1, fontFamily: "'DM Mono', monospace" }}>
          © 2026 jSTack innovaTions · ENFLOW
        </p>
      </div>
    </div>
  );
}