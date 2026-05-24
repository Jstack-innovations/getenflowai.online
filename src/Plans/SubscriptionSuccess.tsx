import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ZaraLogo from "../../assets/ZaraLogo.png";

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  const saved = localStorage.getItem("subscriptionSuccess");

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      body {
        background: #080502;
        font-family: 'DM Sans', sans-serif;
      }

      /* ── Entrance animations ── */
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.6); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes drawCircle {
        from { stroke-dashoffset: 220; }
        to   { stroke-dashoffset: 0; }
      }
      @keyframes shimmer {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(400%); }
      }
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 0 0 rgba(214,168,106,0.0); }
        50%       { box-shadow: 0 0 32px 8px rgba(214,168,106,0.12); }
      }

      .success-page {
        min-height: 100vh;
        background: #080502;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 48px 20px;
        position: relative;
        overflow: hidden;
      }

      /* Subtle radial ambient light */
      .success-page::before {
        content: '';
        position: fixed;
        top: -20%;
        left: 50%;
        transform: translateX(-50%);
        width: 700px;
        height: 500px;
        background: radial-gradient(ellipse, rgba(214,168,106,0.06) 0%, transparent 70%);
        pointer-events: none;
        z-index: 0;
      }

      .success-card {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 540px;
        background: linear-gradient(160deg, #130c05 0%, #0c0703 100%);
        border: 1px solid rgba(214,168,106,0.22);
        border-radius: 24px;
        overflow: hidden;
        animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both;
      }

      /* Top gold accent bar */
      .success-card::before {
        content: '';
        display: block;
        height: 2px;
        background: linear-gradient(90deg, transparent, #d6a86a, #e8c07a, #d6a86a, transparent);
      }

      /* ── Header block ── */
      .success-header {
        padding: 44px 40px 36px;
        text-align: center;
        border-bottom: 1px solid rgba(214,168,106,0.1);
        animation: fadeUp 0.6s 0.1s cubic-bezier(0.22,1,0.36,1) both;
      }

      .check-ring {
        width: 72px;
        height: 72px;
        margin: 0 auto 20px;
        animation: scaleIn 0.5s 0.2s cubic-bezier(0.34,1.56,0.64,1) both;
      }

      .check-ring circle {
        stroke-dasharray: 220;
        stroke-dashoffset: 220;
        animation: drawCircle 0.7s 0.4s ease forwards;
      }

      .success-label {
        font-size: 10px;
        letter-spacing: 4px;
        text-transform: uppercase;
        color: #d6a86a;
        font-family: 'DM Mono', monospace;
        margin-bottom: 10px;
      }

      .success-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: clamp(26px, 4vw, 34px);
        font-weight: 400;
        color: #ffffff;
        line-height: 1.15;
        margin-bottom: 8px;
      }

      .success-title em {
        font-style: italic;
        color: #d6a86a;
      }

      .success-subtext {
        font-size: 13px;
        color: #888888;
        line-height: 1.5;
      }

      /* ── Sections ── */
      .info-section {
        padding: 28px 40px;
        border-bottom: 1px solid rgba(214,168,106,0.08);
        animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
      }
      .info-section:nth-child(3) { animation-delay: 0.18s; }
      .info-section:nth-child(4) { animation-delay: 0.24s; }

      .section-label {
        font-size: 9px;
        letter-spacing: 3px;
        text-transform: uppercase;
        color: #555555;
        font-family: 'DM Mono', monospace;
        margin-bottom: 16px;
      }

      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 9px 0;
        border-bottom: 1px solid rgba(255,255,255,0.04);
        gap: 16px;
      }
      .info-row:last-child { border-bottom: none; }

      .info-row span {
        font-size: 12px;
        color: #666666;
        letter-spacing: 0.3px;
        flex-shrink: 0;
      }

      .info-row strong {
        font-size: 13px;
        font-weight: 500;
        color: #dddddd;
        text-align: right;
        word-break: break-all;
      }

      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(52,199,89,0.1);
        border: 1px solid rgba(52,199,89,0.25);
        color: #34c759;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        padding: 4px 10px;
        border-radius: 100px;
        font-family: 'DM Mono', monospace;
      }
      .status-badge::before {
        content: '';
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #34c759;
        display: block;
      }

      /* ── Subscription code box ── */
      .code-section {
        padding: 28px 40px;
        border-bottom: 1px solid rgba(214,168,106,0.08);
        animation: fadeUp 0.5s 0.3s cubic-bezier(0.22,1,0.36,1) both;
      }

      .code-label {
        font-size: 9px;
        letter-spacing: 3px;
        text-transform: uppercase;
        color: #555555;
        font-family: 'DM Mono', monospace;
        margin-bottom: 14px;
      }

      .code-box {
        background: rgba(214,168,106,0.05);
        border: 1px solid rgba(214,168,106,0.2);
        border-radius: 12px;
        padding: 18px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        animation: pulse-glow 3s 1.2s ease-in-out infinite;
      }

      .code-value {
        font-family: 'DM Mono', monospace;
        font-size: clamp(12px, 3vw, 15px);
        color: #d6a86a;
        letter-spacing: 2px;
        word-break: break-all;
      }

      .copy-hint {
        font-size: 10px;
        color: #555;
        font-family: 'DM Mono', monospace;
        letter-spacing: 1px;
        flex-shrink: 0;
        cursor: pointer;
        transition: color 0.2s;
      }
      .copy-hint:hover { color: #d6a86a; }

      /* ── Buttons ── */
      .button-group {
        padding: 28px 40px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        animation: fadeUp 0.5s 0.38s cubic-bezier(0.22,1,0.36,1) both;
      }

      .btn-primary {
        position: relative;
        overflow: hidden;
        width: 100%;
        padding: 15px 0;
        border-radius: 100px;
        background: linear-gradient(135deg, #d6a86a, #b8864a);
        border: none;
        color: #0c0602;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2.5px;
        text-transform: uppercase;
        cursor: pointer;
        font-family: 'DM Sans', sans-serif;
        transition: transform 0.25s ease, box-shadow 0.25s ease;
      }
      .btn-primary::after {
        content: '';
        position: absolute;
        top: 0; left: 0;
        width: 40px; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
        animation: shimmer 2.8s infinite;
      }
      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 28px rgba(214,168,106,0.3);
      }

      .btn-secondary {
        width: 100%;
        padding: 14px 0;
        border-radius: 100px;
        background: transparent;
        border: 1px solid rgba(214,168,106,0.25);
        color: #aaaaaa;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 2px;
        text-transform: uppercase;
        cursor: pointer;
        font-family: 'DM Sans', sans-serif;
        transition: all 0.25s ease;
      }
      .btn-secondary:hover {
        border-color: rgba(214,168,106,0.5);
        color: #d6a86a;
      }

      /* ── Print styles ── */
      @media print {
        body { background: #fff !important; }
        .success-page { background: #fff !important; padding: 0; }
        .success-page::before { display: none; }
        .success-card {
          background: #fff !important;
          border: 1px solid #ddd !important;
          max-width: 100%;
          border-radius: 0;
          box-shadow: none;
        }
        .success-card::before { background: #d6a86a !important; }
        .success-label, .section-label, .code-label { color: #999 !important; }
        .success-title, .info-row strong { color: #111 !important; }
        .success-title em { color: #b8864a !important; }
        .success-subtext, .info-row span { color: #555 !important; }
        .code-value { color: #b8864a !important; }
        .button-group { display: none !important; }
      }

      /* ── Mobile ── */
      @media (max-width: 480px) {
        .success-header  { padding: 36px 24px 28px; }
        .info-section    { padding: 22px 24px; }
        .code-section    { padding: 22px 24px; }
        .button-group    { padding: 22px 24px; }
        .code-value      { letter-spacing: 1px; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  if (!saved) {
    return (
      <div style={{ background: "#080502", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#888", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>Invalid session.</p>
      </div>
    );
  }

  const { planTitle, amount, formData, subscriptionCode, renewal_date, zara_credits } = JSON.parse(saved);

  const handleCopy = () => {
    navigator.clipboard.writeText(subscriptionCode);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  };

  const formatAmount = (val: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(val);

  return (
    <div className="success-page">
      <div className="success-card" ref={cardRef}>

        {/* ── Header ── */}
        <div className="success-header">
          {/* Animated SVG checkmark */}
          <svg className="check-ring" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="34" stroke="rgba(214,168,106,0.2)" strokeWidth="1.5" />
            <circle cx="36" cy="36" r="34" stroke="#d6a86a" strokeWidth="1.5"
              strokeLinecap="round" strokeDasharray="220" />
            <polyline points="22,37 31,46 50,27" stroke="#d6a86a" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <p className="success-label">Payment Confirmed</p>
          <h1 className="success-title">
            Subscription <em>Activated</em>
          </h1>
          <p className="success-subtext">
            Your {planTitle} is now live and ready to use.
          </p>
        </div>

        {/* ── Plan Details ── */}
        <div className="info-section">
          <p className="section-label">Plan Details</p>
          <div className="info-row">
            <span>Plan</span>
            <strong>{planTitle}</strong>
          </div>
          <div className="info-row">
            <span>Amount Paid</span>
            <strong>{formatAmount(amount)}</strong>
          </div>
          <div className="info-row">
            <span>Status</span>
            <span className="status-badge">Active</span>
          </div>
          {renewal_date && (
            <div className="info-row">
              <span>Renews On</span>
              <strong>{formatDate(renewal_date)}</strong>
            </div>
          )}
        </div>

        {/* ── Subscriber Info ── */}
        <div className="info-section">
          <p className="section-label">Subscriber</p>
          <div className="info-row">
            <span>Full Name</span>
            <strong>{formData.fullname}</strong>
          </div>
          <div className="info-row">
            <span>Email</span>
            <strong>{formData.email}</strong>
          </div>
          <div className="info-row">
            <span>Phone</span>
            <strong>{formData.phone}</strong>
          </div>
          <div className="info-row">
            <span>Business</span>
            <strong>{formData.businessName}</strong>
          </div>
        </div>

        {/* ── Subscription Code ── */}
        <div className="code-section">
          <p className="code-label">Subscription Code</p>
          <div className="code-box">
            <span className="code-value">{subscriptionCode}</span>
            <span className="copy-hint" onClick={handleCopy}>COPY</span>
          </div>
        </div>
        
        {/* ── Zara Credits ── */}
<div className="info-section">
  <p className="section-label">Zara AI Credits</p>
  <div className="info-row">
    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <img src={ZaraLogo} alt="Zara" style={{ height: 30, width: 30, borderRadius: "50%" }} />
      Zara Credits
    </span>
<strong style={{ color: "#d6a86a" }}>{zara_credits ?? 0} credits</strong>
  </div>
  <div className="info-row">
    <span>Status</span>
    <span className="status-badge">Ready</span>
  </div>
  <div className="info-row">
    <span>Resets On</span>
    <strong>{formatDate(renewal_date)}</strong>
  </div>
</div>

        {/* ── Actions ── */}
        <div className="button-group">
          <button
            className="btn-primary"
            onClick={() => {
  localStorage.removeItem("subscriptionSuccess");
  window.location.href = "https://admin-artisangrilluxe.vercel.app/";
}}
          >
            Go to Dashboard
          </button>
          <button className="btn-secondary" onClick={() => window.print()}>
            Print Receipt
          </button>
        </div>

      </div>
    </div>
  );
}
