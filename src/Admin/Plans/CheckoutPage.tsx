import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const plan = location.state?.plan;
  const user = location.state?.user;

  // Strip dial code from stored phone so only the number goes in the input
  const rawPhone = (() => {
    if (!user?.phone) return "";
    for (const c of COUNTRIES) {
      if (user.phone.startsWith(c.dial + " ")) {
        return user.phone.slice(c.dial.length + 1);
      }
    }
    return user.phone;
  })();

  const [formData, setFormData] = useState({
    fullname:     user?.name         ?? "",
    username:     user?.username     ?? "",
    email:        user?.email        ?? "",
    phone:        rawPhone,
    country:      user?.country      ?? "",
    dob:          user?.dob          ?? "",
    gender:       user?.gender       ?? "",
    businessType: user?.businessType ?? "",
    businessName: user?.businessName ?? "",
  });

  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES.find(c => user?.phone?.startsWith(c.dial)) ?? COUNTRIES[0]
  );

  const businessTypeOptions = ["Restaurant", "Cafe", "Cloud Kitchen", "Lounge"];

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #080502; }

      .checkout-input, .checkout-select {
        width: 100%;
        padding: 12px 16px;
        background: rgba(255,238,215,0.04);
        border: 1px solid rgba(214,168,106,0.18);
        border-radius: 10px;
        color: #ffffff;
        font-size: 14px;
        font-family: 'DM Sans', sans-serif;
        outline: none;
        transition: border-color 0.3s, background 0.3s;
        appearance: none;
        -webkit-appearance: none;
      }
      .checkout-input::placeholder { color: #666666; }
      .checkout-input:focus, .checkout-select:focus {
        border-color: rgba(214,168,106,0.5);
        background: rgba(255,238,215,0.07);
      }
      .checkout-select option { background: #120a04; color: #dddddd; }
      .checkout-input[type="date"]::-webkit-calendar-picker-indicator {
        filter: invert(0.6) sepia(1) saturate(2) hue-rotate(5deg);
        cursor: pointer;
      }

      .phone-wrapper {
        display: flex;
        align-items: stretch;
        gap: 8px;
      }
      .phone-country-select {
        padding: 0 12px;
        background: rgba(214,168,106,0.08);
        border: 1px solid rgba(214,168,106,0.18);
        border-radius: 10px;
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
        min-height: 46px;
      }
      .phone-country-select:focus {
        border-color: rgba(214,168,106,0.5);
        background: rgba(214,168,106,0.13);
      }
      .phone-country-select option { background: #120a04; color: #dddddd; }
      .phone-input { flex: 1; }

      @keyframes shimmer-line {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(400%); }
      }
      .submit-btn {
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
      }
      .submit-btn::after {
        content: '';
        position: absolute;
        top: 0; left: 0;
        width: 40px; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
        animation: shimmer-line 2.5s infinite;
      }
      .submit-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 32px rgba(214,168,106,0.35);
      }

      .checkout-grid {
        max-width: 960px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr 1.6fr;
        gap: 28px;
        align-items: start;
      }
      .plan-summary-card {
        background: linear-gradient(160deg, #1a0f07 0%, #0f0804 100%);
        border: 1px solid rgba(214,168,106,0.35);
        border-radius: 20px;
        padding: 32px 28px;
        position: sticky;
        top: 24px;
      }
      .checkout-form-card {
        background: rgba(255,238,215,0.025);
        border: 1px solid rgba(214,168,106,0.12);
        border-radius: 20px;
        padding: 36px 32px;
      }

      @media (max-width: 720px) {
        .checkout-grid { grid-template-columns: 1fr; gap: 20px; }
        .plan-summary-card { position: static; padding: 24px 20px; border-radius: 16px; }
        .checkout-form-card { padding: 24px 20px; border-radius: 16px; }
      }
      @media (max-width: 480px) {
        .checkout-wrapper { padding: 40px 16px !important; }
        .checkout-heading { margin-bottom: 32px !important; }
        .plan-price { font-size: 36px !important; }
        .checkout-input, .checkout-select { font-size: 16px; padding: 13px 14px; }
        .submit-btn { font-size: 13px !important; padding: 14px 0 !important; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  if (!plan) {
    return (
      <div style={{ background: "#080502", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#dddddd", fontFamily: "'DM Sans', sans-serif" }}>No plan selected.</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(
      plan.price.match(/\(\$(\d+)\)/)?.[1] || plan.amount || 0
    );
    navigate("/subscription-payment", {
      state: {
        amount: numericAmount,
        planTitle: plan.title,
        formData: { ...formData, phone: `${selectedCountry.dial} ${formData.phone}` },
      },
    });
  };

  const labelStyle = {
    display: "block", fontSize: 11, letterSpacing: 1.5,
    textTransform: "uppercase" as const, color: "#aaaaaa",
    fontFamily: "'DM Mono', monospace", marginBottom: 8,
  };

  return (
    <div
      className="checkout-wrapper"
      style={{ background: "#080502", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#dddddd", padding: "60px 24px" }}
    >
      <div className="checkout-heading" style={{ textAlign: "center", marginBottom: 48 }}>
        <p style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#d6a86a", fontFamily: "'DM Mono', monospace", marginBottom: 12 }}>
          Checkout
        </p>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 300, fontFamily: "'Cormorant Garamond', serif", color: "#ffffff", lineHeight: 1.1 }}>
          Complete Your <em style={{ fontStyle: "italic", color: "#d6a86a" }}>Purchase</em>
        </h1>
      </div>

      <div className="checkout-grid">

        {/* Plan Summary */}
        <div className="plan-summary-card">
          <p style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#aaaaaa", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>
            {plan.subtitle || "Selected Plan"}
          </p>
          <h2 style={{ fontSize: 26, fontWeight: 600, fontFamily: "'Cormorant Garamond', serif", color: "#ffffff", marginBottom: 4 }}>
            {plan.title}
          </h2>
          <p className="plan-price" style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 300, fontFamily: "'Cormorant Garamond', serif", color: "#d6a86a", marginBottom: 4 }}>
            {plan.price}
          </p>
          {plan.period && <p style={{ fontSize: 12, color: "#aaaaaa", marginBottom: 4 }}>{plan.period}</p>}
          {plan.monthly && <p style={{ fontSize: 11, color: "#bbbbbb", fontStyle: "italic", marginBottom: 0 }}>{plan.monthly}</p>}
          <div style={{ margin: "24px 0", height: 1, background: "rgba(214,168,106,0.12)" }} />
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
            {plan.features.map((f: string, i: number) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "#dddddd", lineHeight: 1.5 }}>
                <span style={{ color: "#d6a86a", flexShrink: 0, fontSize: 10, marginTop: 2 }}>◆</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Checkout Form */}
        <div className="checkout-form-card">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                className="checkout-input"
                name="fullname"
                type="text"
                placeholder="Kendrell Powells"
                value={formData.fullname}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Username</label>
              <input
                className="checkout-input"
                name="username"
                type="text"
                placeholder="@_kPowells"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                className="checkout-input"
                name="email"
                type="email"
                placeholder="powells@ccjitters.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Phone Number</label>
              <div className="phone-wrapper">
                <select
                  className="phone-country-select"
                  value={selectedCountry.code}
                  onChange={(e) => {
                    const found = COUNTRIES.find(c => c.code === e.target.value);
                    if (found) setSelectedCountry(found);
                  }}
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.dial}</option>
                  ))}
                </select>
                <input
                  className="checkout-input phone-input"
                  name="phone"
                  type="tel"
                  placeholder="800 000 0000"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Country</label>
              <input
                className="checkout-input"
                name="country"
                type="text"
                placeholder="Nigeria"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Date of Birth</label>
              <input
                className="checkout-input"
                name="dob"
                type="date"
                placeholder="DD / MM / YYYY"
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Gender</label>
              <select className="checkout-select" name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Prefer Not To Say</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Business Type</label>
              <select className="checkout-select" name="businessType" value={formData.businessType} onChange={handleChange} required>
                <option value="">Select Business Type</option>
                {businessTypeOptions.map((type, i) => (
                  <option key={i} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Business Name</label>
              <input
                className="checkout-input"
                name="businessName"
                type="text"
                placeholder="artisangrilluxe"
                value={formData.businessName}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="submit-btn"
              style={{
                marginTop: 8, padding: "15px 0", borderRadius: 100,
                background: "linear-gradient(135deg, #d6a86a, #b8864a)",
                border: "none", color: "#0c0602", fontSize: 13, fontWeight: 700,
                letterSpacing: 2, textTransform: "uppercase", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", width: "100%",
              }}
            >
              Proceed To Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}