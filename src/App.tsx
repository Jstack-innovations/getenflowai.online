import { useState, useEffect, useRef } from "react";
import {
  Zap, BarChart2, ShoppingBag, CreditCard, Bell,
  Globe, ArrowRight, Play, Check, ChevronDown,
  Bot, TrendingUp, Layers, Shield, Clock, Users,
  Building2, Smartphone, Lock, Plug, HeadphonesIcon,
  Star, ChevronUp, Mail, MessageCircle, Globe2,
  FileText, BookOpen, Activity, Cpu
} from "lucide-react";
import './App.css';

function useInView(ref, threshold = 0.1) {
  const [v, setV] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const o = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setV(true); },
      { threshold, rootMargin: "0px 0px 0px 0px" }
    );
    o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return v;
}

function Reveal({ children, delay = 0, y = 36, style = {}, className = "" }) {
  const ref = useRef(null);
  const v = useInView(ref);
  return (
    <div ref={ref} className={className} style={{
      opacity: 1,
      transform: "translateY(0)",
      transition: `opacity 0.85s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.85s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      ...style,
    }}>{children}</div>
  );
}

const LOGS = [
  { tag: "ZARA",        col: "#7c6200", msg: "Good evening. 4 tables active, 2 pending." },
  { tag: "ORDER #041",  col: "#1a7a3a", msg: "PAID · Table 5 · ₦12,400" },
  { tag: "STOCK ALERT", col: "#b05a00", msg: "Jollof Rice — 4 portions remaining" },
  { tag: "ORDER #042",  col: "#1a7a3a", msg: "NEW · Takeout · ₦8,700" },
  { tag: "PEAK ALERT",  col: "#0050a0", msg: "Rush hour detected — 11 mins away" },
  { tag: "ORDER #043",  col: "#1a7a3a", msg: "NEW · Table 2 · ₦21,000" },
  { tag: "ZARA",        col: "#7c6200", msg: "Today's revenue: ₦187,400 · ↑14% vs yesterday" },
];

function Terminal() {
  const [lines, setLines] = useState([]);
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (idx >= LOGS.length) return;
    const t = setTimeout(() => { setLines(l => [...l, LOGS[idx]]); setIdx(i => i + 1); }, idx === 0 ? 700 : 950);
    return () => clearTimeout(t);
  }, [idx]);
  return (
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, lineHeight: 2, color: "#555" }}>
      {lines.map((l, i) => (
        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ color: l.col, minWidth: 108, fontSize: 9, letterSpacing: 0.8, paddingTop: 2, flexShrink: 0 }}>{l.tag}</span>
          <span style={{ color: i === lines.length - 1 ? "#ccc" : "#888" }}>{l.msg}</span>
        </div>
      ))}
      {idx < LOGS.length && (
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ color: "#333", minWidth: 108 }}>···</span>
          <span style={{ color: "#555" }}>█</span>
        </div>
      )}
    </div>
  );
}

const FEATURES_MAIN = [
  { icon: Bot,        label: "AI Operations",    title: "Zara knows your floor before you do.",        body: "Voice-controlled AI that monitors every order, fires stock alerts, detects peak hours, and briefs management at close — automatically.", stat: "< 3s",  statLabel: "order to kitchen alert" },
  { icon: BarChart2,  label: "Live Intelligence", title: "Your numbers, updated every second.",          body: "Revenue by hour, item velocity, peak detection, stock burn rate. Not a weekly report — a live operator briefing you act on right now.", stat: "24/7",  statLabel: "live monitoring" },
  { icon: ShoppingBag,label: "Unified Orders",    title: "Dine-in. Delivery. Takeout. One view.",       body: "Every channel unified in one live dashboard with Flutterwave payment verification, session codes, and pay-later tabs built in.",      stat: "100%", statLabel: "payment verified" },
];

const FEATURE_CARDS = [
  { icon: CreditCard, title: "Flutterwave Payments", desc: "Pay Now, Pay Later, table sessions. Naira-native. Fully verified." },
  { icon: Bell,       title: "Multi-Channel Alerts", desc: "Telegram, email, kitchen screen. Every critical event, instantly." },
  { icon: Globe,      title: "Built for Africa",     desc: "Mobile-first. Naira pricing. Local infrastructure. SME costs." },
];

const HOW = [
  { n: "01", icon: Layers,      title: "Onboard in minutes",    desc: "Connect your menu, tables, and payment account. No hardware. No technician. Just a browser." },
  { n: "02", icon: Bot,         title: "Zara learns your floor", desc: "AI monitors from day one — orders, stock, velocity, staff patterns, and revenue trends." },
  { n: "03", icon: TrendingUp,  title: "You get total clarity",  desc: "Live dashboards, instant alerts to Telegram and email, and daily Zara briefs so you run the business, not the noise." },
];

const MARQUEE_ITEMS = ["Artisan Grills", "Lagos SMEs", "Abuja Kitchens", "Port Harcourt", "Enugu Operators", "African Restaurants"];

const STATS = [
  { val: "₦2.1B+", label: "transactions processed",  sub: "across all clients" },
  { val: "99.9%",  label: "historical uptime",        sub: "Zara never sleeps" },
  { val: "< 3s",   label: "order to kitchen alert",   sub: "real-time every time" },
  { val: "50+",    label: "Nigerian restaurants",     sub: "and growing fast" },
];

const TESTIMONIALS = [
  { stars: 5, icon: Users,       quote: "We used to lose track of table orders during peak hours. Zara tells us before it becomes a problem. EnflowAI changed how we run the floor — completely.", name: "Artisan Grills",    role: "Flagship Partner · Lagos, Nigeria" },
  { stars: 5, icon: ShoppingBag, quote: "The Flutterwave integration alone saved us from so many payment disputes. And Zara's stock alerts? We haven't run out of anything in 3 months.",         name: "CcJitters",         role: "Partner · Abuja, Nigeria" },
  { stars: 5, icon: TrendingUp,  quote: "EnflowAI gave us visibility we never had before. Revenue tracking, order history, peak detection — all in one place. Worth every kobo.",                 name: "Lagos Kitchen Co.", role: "Client · Lagos Island, Nigeria" },
];

const ENTERPRISE_CARDS = [
  { icon: Zap,            title: "Fast Implementation",  desc: "Up and running in under 10 minutes. No hardware. Works on any device with a browser." },
  { icon: Lock,           title: "Enterprise Security",  desc: "Role-based access, session management, encrypted payments. Protected at every layer." },
  { icon: Building2,      title: "Multi-Location Ready", desc: "Manage multiple restaurant locations from one dashboard. Unified reporting across all outlets." },
  { icon: Smartphone,     title: "Mobile First",         desc: "Designed for Nigerian internet conditions. Lightweight, fast, fully functional on any Android." },
  { icon: HeadphonesIcon, title: "Dedicated Support",    desc: "WhatsApp support, onboarding assistance, and ongoing help from the EnflowAI team." },
  { icon: Plug,           title: "API & Integrations",   desc: "Connect your existing tools. Flutterwave, Telegram, email, and more integrations coming." },
];

const FAQS = [
  { q: "What is EnflowAI and who is it for?",       a: "EnflowAI is an AI-powered restaurant operations platform built for African SMEs. It's for restaurant owners and operators who want enterprise-grade intelligence without enterprise costs." },
  { q: "Do I need special hardware or equipment?",   a: "No. EnflowAI runs entirely in a web browser. Any smartphone, tablet, or computer with internet access is all you need." },
  { q: "How does Zara AI work?",                     a: "Zara monitors every order in real-time, fires alerts when stock runs low, detects peak hours, and delivers a full operations brief at end of day. She also responds to voice commands." },
  { q: "How does the Flutterwave integration work?", a: "EnflowAI integrates directly with Flutterwave. Customers can Pay Now or use Pay Later/table sessions. All transactions verify automatically and reflect instantly in your dashboard." },
  { q: "Can I cancel anytime?",                      a: "Yes. Cancel anytime with no fees. Your 14-day free trial gives you full access before any payment is required." },
  { q: "Is my data secure?",                         a: "Yes. Encrypted connections, secure session management, and role-based access control protect your business data and customer payment information at every layer." },
];

function useIsMobile() {
  const [mob, setMob] = useState(window.innerWidth < 900);
  useEffect(() => {
    const fn = () => setMob(window.innerWidth < 900);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mob;
}

export default function EnflowHome() {
  const [scroll, setScroll]         = useState(0);
  const [activeFeat, setActiveFeat] = useState(0);
  const [openFaq, setOpenFaq]       = useState(0);
  const mob = useIsMobile();
  const hp  = mob ? "20px" : "48px";

  useEffect(() => {
    const onS = () => setScroll(window.scrollY);
    window.addEventListener("scroll", onS, { passive: true });
    return () => window.removeEventListener("scroll", onS);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveFeat(f => (f + 1) % FEATURES_MAIN.length), 4200);
    return () => clearInterval(t);
  }, []);

  const serif = "'Instrument Serif', Georgia, serif";
  const sans  = "'Syne', system-ui, sans-serif";
  const mono  = "'JetBrains Mono', monospace";
  const nav   = scroll > 50;

  return (
    <div style={{ background:"#fff", color:"#111", fontFamily: sans, overflowX:"hidden" }}>

      {/* NAV */}
      <header style={{
        position:"fixed", top:0, left:0, right:0, zIndex:200, height:62,
        background: nav ? "rgba(255,255,255,0.96)" : "transparent",
        backdropFilter: nav ? "blur(20px)" : "none",
        borderBottom: nav ? "1px solid rgba(0,0,0,0.07)" : "none",
        transition:"all 0.4s ease",
        display:"flex", alignItems:"center", padding:`0 ${hp}`, justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <img
            src={nav ? "https://waitlist.getenflowai.online/assets/darkLogo.png" : "https://waitlist.getenflowai.online/assets/logo.png"}
            alt="EnflowAI"
            style={{height:40, objectFit:"contain" }}
          />
        </div>
        <nav className="hide-mob" style={{ display:"flex", gap:36 }}>
          {["Product","Features","How It Works","Enterprise","FAQ"].map(l => (
            <button key={l} className="nav-item"
              onClick={() => document.getElementById(l.toLowerCase().replace(/ /g,"-"))?.scrollIntoView({ behavior:"smooth" })}>
              {l}
            </button>
          ))}
        </nav>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn-ghost" style={{ padding:"8px 18px", fontSize:10 }} onClick={() => window.location.href = "https://signin.getenflowai.online"}>Sign In</button>
          <button className="btn-black" style={{ padding:"8px 18px", fontSize:10 }} onClick={() => window.location.href = "https://plans.getenflowai.online"}>Get Started</button>
        </div>
      </header>

      {/* HERO */}
      <section style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", overflow:"hidden", padding:`80px ${hp} 0` }}>
        <video autoPlay muted loop playsInline style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", objectFit:"cover", zIndex:0 }}>
          <source src="https://waitlist.getenflowai.online/Video/Hero.mp4" type="video/mp4" />
        </video>
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.70)", zIndex:1 }} />
        <div className="two-col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:72, maxWidth:1280, margin:"0 auto", width:"100%", paddingTop:64, alignItems:"center", position:"relative", zIndex:2 }}>
          <div style={{ animation:"hero-in 0.9s ease both" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 14px", borderRadius:100, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", marginBottom:32 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#6bcf7f", boxShadow:"0 0 8px #6bcf7f", animation:"blink 2s infinite" }} />
              <span style={{ fontFamily:mono, fontSize:10, color:"#ccc", letterSpacing:2, textTransform:"uppercase" }}>Live — Africa's First Restaurant AI</span>
            </div>
            <h1 style={{ fontFamily:serif, fontSize:"clamp(50px,5.5vw,86px)", fontWeight:400, lineHeight:1.04, letterSpacing:"-0.02em", color:"#fff", marginBottom:26 }}>
              Your Business,<br /><em style={{ fontStyle:"italic", color:"beige" }}>Finally Intelligent.</em>
            </h1>
            <p style={{ fontSize:15.5, color:"#ddd", lineHeight:1.85, maxWidth:460, marginBottom:42 }}>
              EnflowAI gives African SMEs the operational intelligence that was reserved for enterprise — AI automation, live analytics, and Zara, your always-on operations brain.
            </p>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              <button className="btn-black" style={{ background:"#fff", color:"#000" }} onClick={() => window.location.href = "https://plans.getenflowai.online/trial-signup"}>Start Free Trial <ArrowRight size={14} /></button>
              <button className="btn-ghost" style={{ borderColor:"rgba(255,255,255,0.2)", color:"#ccc" }}><Play size={12} /> Watch Demo</button>
            </div>
            <div style={{ display:"flex", gap:36, marginTop:52, paddingTop:32, borderTop:"1px solid rgba(255,255,255,0.1)" }}>
              {[["₦0","Setup cost"],["10-day","Free trial"],["24/7","Zara active"]].map(([v,l]) => (
                <div key={l}>
                  <div style={{ fontFamily:serif, fontSize:26, color:"beige" }}>{v}</div>
                  <div style={{ fontFamily:mono, fontSize:9, color:"#aaa", letterSpacing:1.2, textTransform:"uppercase", marginTop:4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position:"relative", animation:"hero-in 0.9s ease 0.15s both" }}>
            <div style={{ borderRadius:14, overflow:"hidden", border:"1px solid rgba(255,255,255,0.12)", background:"#111", boxShadow:"0 48px 100px rgba(0,0,0,0.6)" }}>
              <div style={{ padding:"10px 16px", background:"#1a1a1a", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ display:"flex", gap:6 }}>
                  {["#e74c3c","#f39c12","#2ecc71"].map(c => <div key={c} style={{ width:10, height:10, borderRadius:"50%", background:c, opacity:0.7 }} />)}
                </div>
                <div style={{ flex:1, background:"rgba(255,255,255,0.05)", borderRadius:6, padding:"4px 12px", display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:"#6bcf7f" }} />
                  <span style={{ fontFamily:mono, fontSize:10, color:"#666" }}>app.getenflowai.online/dashboard</span>
                </div>
              </div>
              <div style={{ padding:"20px 22px", minHeight:370 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                  <div>
                    <div style={{ fontFamily:mono, fontSize:9, color:"#666", letterSpacing:1, textTransform:"uppercase" }}>Good Evening</div>
                    <div style={{ fontFamily:serif, fontSize:17, color:"#fff", marginTop:2 }}>Artisan Grills</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:6, background:"rgba(107,207,127,0.1)", border:"1px solid rgba(107,207,127,0.22)" }}>
                    <Bot size={11} color="#6bcf7f" />
                    <span style={{ fontFamily:mono, fontSize:9, color:"#6bcf7f", letterSpacing:1 }}>ZARA ACTIVE</span>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16 }}>
                  {[
                    { label:"Revenue Today", value:"₦187,400", delta:"+14%",          col:"beige",   Icon:TrendingUp },
                    { label:"Active Orders",  value:"7",         delta:"4 tables",     col:"#6bcf7f", Icon:ShoppingBag },
                    { label:"Avg Order",      value:"₦12,800",   delta:"↑ vs last wk", col:"#74b9ff", Icon:BarChart2 },
                  ].map((s,i) => (
                    <div key={i} style={{ padding:12, borderRadius:8, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                        <span style={{ fontFamily:mono, fontSize:8, color:"#666", letterSpacing:0.8, textTransform:"uppercase" }}>{s.label}</span>
                        <s.Icon size={10} color={s.col} />
                      </div>
                      <div style={{ fontFamily:serif, fontSize:18, color:s.col }}>{s.value}</div>
                      <div style={{ fontFamily:mono, fontSize:8, color:"#666", marginTop:3 }}>{s.delta}</div>
                    </div>
                  ))}
                </div>
                <div style={{ borderRadius:8, background:"#0a0a0a", border:"1px solid rgba(255,255,255,0.07)", padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, paddingBottom:8, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                    <Bot size={11} color="#ccc" />
                    <span style={{ fontFamily:mono, fontSize:9, color:"#ccc", letterSpacing:1.5 }}>ZARA OPERATIONS LOG</span>
                  </div>
                  <Terminal />
                </div>
              </div>
            </div>
            <div className="hide-mob" style={{ position:"absolute", top:"8%", right:"-8%", padding:"10px 14px", borderRadius:10, background:"rgba(10,10,10,0.96)", border:"1px solid rgba(107,207,127,0.25)", backdropFilter:"blur(16px)", animation:"float-med 6s ease-in-out infinite" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                <ShoppingBag size={10} color="#6bcf7f" />
                <span style={{ fontFamily:mono, fontSize:9, color:"#6bcf7f", letterSpacing:0.8 }}>ORDER #044 PAID</span>
              </div>
              <div style={{ fontFamily:serif, fontSize:14, color:"#fff" }}>₦9,200 · Table 3</div>
            </div>
            <div className="hide-mob" style={{ position:"absolute", bottom:"10%", left:"-9%", padding:"10px 14px", borderRadius:10, background:"rgba(10,10,10,0.96)", border:"1px solid rgba(255,255,255,0.15)", backdropFilter:"blur(16px)", animation:"float-slow 8s ease-in-out infinite reverse" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                <Zap size={10} color="#ccc" />
                <span style={{ fontFamily:mono, fontSize:9, color:"#ccc", letterSpacing:0.8 }}>ZARA ALERT</span>
              </div>
              <div style={{ fontFamily:serif, fontSize:13, color:"#fff" }}>Peak hour in 8 min</div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ borderTop:"1px solid rgba(0,0,0,0.07)", borderBottom:"1px solid rgba(0,0,0,0.07)", padding:"16px 0", overflow:"hidden", background:"#f6f6f4" }}>
        <div className="marquee-track">
          {[...MARQUEE_ITEMS,...MARQUEE_ITEMS].map((l,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:72, flexShrink:0 }}>
              <span style={{ fontFamily:mono, fontSize:10, color:"#aaa", letterSpacing:2.5, textTransform:"uppercase" }}>{l}</span>
              <span style={{ color:"rgba(0,0,0,0.15)", fontSize:8 }}>◆</span>
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div style={{ padding:`80px ${hp}`, background:"#f6f6f4", borderBottom:"1px solid rgba(0,0,0,0.07)" }}>
        <div className="stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:40, maxWidth:1280, margin:"0 auto", textAlign:"center" }}>
          {STATS.map((s,i) => (
            <Reveal key={i} delay={i*80}>
              <div style={{ fontFamily:serif, fontSize:"clamp(36px,4vw,56px)", color:"#111", lineHeight:1, marginBottom:10 }}>{s.val}</div>
              <div style={{ fontSize:13, color:"#555", lineHeight:1.6 }}>{s.label}</div>
              <div style={{ fontFamily:mono, fontSize:10, color:"#aaa", marginTop:4, letterSpacing:0.5 }}>{s.sub}</div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* PLATFORM */}
      <section id="product" style={{ padding:`130px ${hp}`, maxWidth:1280, margin:"0 auto" }}>
        <div className="two-col" style={{ display:"grid", gridTemplateColumns:"1fr 1.15fr", gap:96, alignItems:"center" }}>
          <Reveal>
            <p style={{ fontFamily:mono, fontSize:10, letterSpacing:3, color:"#555", textTransform:"uppercase", marginBottom:20 }}>The Platform</p>
            <h2 style={{ fontFamily:serif, fontSize:"clamp(34px,3.8vw,56px)", fontWeight:400, lineHeight:1.1, color:"#111", marginBottom:24 }}>
              One Platform.<br /><em>Every Operation.</em>
            </h2>
            <p style={{ fontSize:14.5, color:"#555", lineHeight:1.9, marginBottom:18 }}>
              EnflowAI is Africa's first vertical AI SaaS that gives SMEs enterprise-grade operational intelligence — replacing scattered WhatsApp groups, paper logs, and guesswork with one unified platform.
            </p>
            <p style={{ fontSize:14.5, color:"#555", lineHeight:1.9, marginBottom:36 }}>
              Artisan Grills runs their entire restaurant floor on EnflowAI: orders, payments, kitchen comms, reservations, stock, and Zara AI. That's the proof of concept. And it works.
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {["Orders, tables, payments — one unified view","Zara AI monitors your floor 24/7","Telegram + email alerts, zero manual effort","Built for naira, built for Lagos, built for Africa"].map((item,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", background:"#111", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Check size={10} color="#fff" strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize:13.5, color:"#555" }}>{item}</span>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div>
              {FEATURES_MAIN.map((f,i) => {
                const Icon = f.icon;
                const isActive = activeFeat === i;
                return (
                  <div key={i} className="feat-tab" onClick={() => setActiveFeat(i)}
                    style={{ borderLeft: isActive ? "2px solid #000" : "2px solid transparent", paddingLeft: isActive ? 20 : 0, transition:"all 0.35s ease" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom: isActive ? 10 : 0 }}>
                      <Icon size={16} color={isActive ? "#111" : "#bbb"} strokeWidth={1.8} style={{ flexShrink:0 }} />
                      <div style={{ flex:1 }}>
                        <p style={{ fontFamily:mono, fontSize:9, color: isActive ? "#555" : "#bbb", letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>{f.label}</p>
                        <h3 style={{ fontFamily:serif, fontSize:19, color: isActive ? "#111" : "#bbb", lineHeight:1.25 }}>{f.title}</h3>
                      </div>
                      <ChevronDown size={14} color="#bbb" style={{ transform: isActive ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 0.3s", flexShrink:0 }} />
                    </div>
                    <div style={{ maxHeight: isActive ? 200 : 0, overflow:"hidden", transition:"max-height 0.42s ease", paddingLeft:28 }}>
                      <p style={{ fontSize:13.5, color:"#555", lineHeight:1.85, marginBottom:14, paddingTop:4 }}>{f.body}</p>
                      <div style={{ display:"inline-flex", gap:6, alignItems:"baseline" }}>
                        <span style={{ fontFamily:serif, fontSize:30, color:"#111" }}>{f.stat}</span>
                        <span style={{ fontFamily:mono, fontSize:9, color:"#aaa", letterSpacing:1 }}>{f.statLabel}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" style={{ padding:`110px ${hp}`, background:"#f6f6f4", borderTop:"1px solid rgba(0,0,0,0.07)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <Reveal>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:72, flexWrap:"wrap", gap:20 }}>
              <div>
                <p style={{ fontFamily:mono, fontSize:10, letterSpacing:3, color:"#888", textTransform:"uppercase", marginBottom:16 }}>Everything Included</p>
                <h2 style={{ fontFamily:serif, fontSize:"clamp(34px,3.8vw,54px)", fontWeight:400, color:"#111", lineHeight:1.1 }}>
                  Designed for Operators.<br /><em>Not Technologists.</em>
                </h2>
              </div>
              <button className="btn-ghost" style={{ alignSelf:"flex-end" }}>See All Features <ArrowRight size={13} /></button>
            </div>
          </Reveal>
          <div className="two-col" style={{ display:"grid", gridTemplateColumns:"1.35fr 1fr", gap:18, marginBottom:18 }}>
            <Reveal>
              <div className="card-hover" style={{ padding:"48px 44px", borderRadius:18, background:"#fff", border:"1px solid rgba(0,0,0,0.1)", height:"100%", display:"flex", flexDirection:"column", justifyContent:"space-between", minHeight:280 }}>
                <div>
                  <div style={{ width:44, height:44, borderRadius:12, background:"#f0f0ee", border:"1px solid rgba(0,0,0,0.1)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:24 }}>
                    <Bot size={22} color="#111" strokeWidth={1.6} />
                  </div>
                  <h3 style={{ fontFamily:serif, fontSize:28, color:"#111", marginBottom:14, lineHeight:1.2 }}>Zara AI — Your Operations Brain</h3>
                  <p style={{ fontSize:13.5, color:"#555", lineHeight:1.85, maxWidth:400 }}>Voice-controlled, always-on. Monitors every order, alerts your team before things go wrong, briefs management at close, and learns your floor over time.</p>
                </div>
                <div style={{ display:"flex", gap:20, marginTop:36 }}>
                  {[["Voice Input",Zap],["Auto Alerts",Bell],["Daily Briefs",Clock]].map(([l,Icon]) => (
                    <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <Icon size={11} color="#555" />
                      <span style={{ fontFamily:mono, fontSize:9, color:"#888", letterSpacing:1 }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              {[
                { Icon:ShoppingBag, title:"Unified Order Hub",    desc:"Dine-in, delivery, takeout — one real-time view. Every ticket accounted for." },
                { Icon:CreditCard,  title:"Flutterwave Payments", desc:"Pay Now, Pay Later, table sessions. Verified. Secure. Naira-native." },
              ].map((f,i) => (
                <Reveal key={i} delay={i*100} style={{ flex:1 }}>
                  <div className="card-hover" style={{ padding:"30px 32px", borderRadius:14, background:"#fff", border:"1px solid rgba(0,0,0,0.08)", height:"100%" }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:"#f0f0ee", border:"1px solid rgba(0,0,0,0.08)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:18 }}>
                      <f.Icon size={18} color="#111" strokeWidth={1.6} />
                    </div>
                    <h3 style={{ fontFamily:serif, fontSize:20, color:"#111", marginBottom:8 }}>{f.title}</h3>
                    <p style={{ fontSize:13, color:"#555", lineHeight:1.8 }}>{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <div className="three-col" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }}>
            {FEATURE_CARDS.map((f,i) => (
              <Reveal key={i} delay={i*80}>
                <div className="card-hover" style={{ padding:"30px", borderRadius:14, background:"#fff", border:"1px solid rgba(0,0,0,0.08)" }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:"#f0f0ee", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:18 }}>
                    <f.icon size={18} color="#111" strokeWidth={1.6} />
                  </div>
                  <h3 style={{ fontFamily:serif, fontSize:20, color:"#111", marginBottom:8 }}>{f.title}</h3>
                  <p style={{ fontSize:13, color:"#555", lineHeight:1.8 }}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding:`130px ${hp}`, maxWidth:1280, margin:"0 auto" }}>
        <Reveal>
          <div style={{ textAlign:"center", marginBottom:80 }}>
            <p style={{ fontFamily:mono, fontSize:10, letterSpacing:3, color:"#888", textTransform:"uppercase", marginBottom:16 }}>How It Works</p>
            <h2 style={{ fontFamily:serif, fontSize:"clamp(34px,4vw,58px)", fontWeight:400, color:"#111", lineHeight:1.1 }}>
              From signup to<br /><em>fully automated.</em>
            </h2>
          </div>
        </Reveal>
        <div className="three-col" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2 }}>
          {HOW.map((s,i) => (
            <Reveal key={i} delay={i*110}>
              <div style={{ padding:"48px 40px", background:"#fff", border:"1px solid rgba(0,0,0,0.08)", borderTopColor:"#111", borderTopWidth:2, borderRadius: i===0?"14px 0 0 14px":i===2?"0 14px 14px 0":0 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:"#f0f0ee", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:24 }}>
                  <s.icon size={18} color="#111" strokeWidth={1.6} />
                </div>
                <div style={{ fontFamily:mono, fontSize:10, color:"#aaa", letterSpacing:2, marginBottom:16 }}>{s.n}</div>
                <h3 style={{ fontFamily:serif, fontSize:22, color:"#111", marginBottom:14, lineHeight:1.2 }}>{s.title}</h3>
                <p style={{ fontSize:13.5, color:"#555", lineHeight:1.85 }}>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section style={{ padding:`90px ${hp}`, background:"#f6f6f4", borderTop:"1px solid rgba(0,0,0,0.07)", borderBottom:"1px solid rgba(0,0,0,0.07)" }}>
        <Reveal>
          <div style={{ maxWidth:820, margin:"0 auto" }}>
            <div style={{ display:"grid", gridTemplateColumns:"3px 1fr", gap:44, alignItems:"start" }}>
              <div style={{ background:"#111", height:"100%", minHeight:110, borderRadius:2 }} />
              <div>
                <p style={{ fontFamily:serif, fontSize:"clamp(20px,2.8vw,32px)", fontWeight:400, fontStyle:"italic", color:"#111", lineHeight:1.65, marginBottom:32 }}>
                  "We used to lose track of table orders during peak hours. Zara tells us before it becomes a problem. EnflowAI changed how we run the floor — completely."
                </p>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:42, height:42, borderRadius:"50%", background:"#f0f0ee", border:"1px solid rgba(0,0,0,0.12)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Users size={18} color="#111" strokeWidth={1.6} />
                  </div>
                  <div>
                    <div style={{ fontFamily:sans, fontWeight:600, fontSize:13, color:"#111" }}>Artisan Grills</div>
                    <div style={{ fontFamily:mono, fontSize:9, color:"#aaa", letterSpacing:1, marginTop:3 }}>FLAGSHIP PARTNER · LAGOS, NIGERIA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* SOCIAL PROOF */}
      <section style={{ padding:`110px ${hp}`, background:"#fff" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:72 }}>
              <p style={{ fontFamily:mono, fontSize:10, letterSpacing:3, color:"#888", textTransform:"uppercase", marginBottom:16 }}>Trusted by Operators</p>
              <h2 style={{ fontFamily:serif, fontSize:"clamp(34px,4vw,54px)", fontWeight:400, color:"#111", lineHeight:1.1 }}>
                Powering restaurants<br /><em>across Nigeria.</em>
              </h2>
            </div>
          </Reveal>
          <div className="three-col" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
            {TESTIMONIALS.map((t,i) => (
              <Reveal key={i} delay={i*100}>
                <div className="card-hover" style={{ padding:32, borderRadius:16, background:"#f6f6f4", border:"1px solid rgba(0,0,0,0.08)", height:"100%", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ display:"flex", gap:3, marginBottom:18 }}>
                      {Array(t.stars).fill(0).map((_,si) => <Star key={si} size={13} color="#111" fill="#111" />)}
                    </div>
                    <p style={{ fontFamily:serif, fontSize:16, color:"#555", lineHeight:1.8, fontStyle:"italic", marginBottom:24 }}>"{t.quote}"</p>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:"50%", background:"#e8e8e6", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <t.icon size={16} color="#111" strokeWidth={1.6} />
                    </div>
                    <div>
                      <div style={{ fontFamily:sans, fontWeight:600, fontSize:13, color:"#111" }}>{t.name}</div>
                      <div style={{ fontFamily:mono, fontSize:9, color:"#aaa", letterSpacing:1, marginTop:2 }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ENTERPRISE */}
      <section id="enterprise" style={{ padding:`110px ${hp}`, background:"#f6f6f4", borderTop:"1px solid rgba(0,0,0,0.07)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:72 }}>
              <p style={{ fontFamily:mono, fontSize:10, letterSpacing:3, color:"#888", textTransform:"uppercase", marginBottom:16 }}>For Every Scale</p>
              <h2 style={{ fontFamily:serif, fontSize:"clamp(34px,4vw,54px)", fontWeight:400, color:"#111", lineHeight:1.1 }}>
                From one outlet to<br /><em>a national chain.</em>
              </h2>
              <p style={{ fontSize:15, color:"#555", lineHeight:1.85, maxWidth:480, margin:"20px auto 0" }}>
                EnflowAI grows with your business. One location or multi-city — the infrastructure adapts.
              </p>
            </div>
          </Reveal>
          <div className="three-col" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }}>
            {ENTERPRISE_CARDS.map((c,i) => (
              <Reveal key={i} delay={i*80}>
                <div className="card-hover" style={{ padding:"36px 32px", borderRadius:16, background:"#fff", border:"1px solid rgba(0,0,0,0.08)" }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:"#f0f0ee", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
                    <c.icon size={20} color="#111" strokeWidth={1.6} />
                  </div>
                  <h3 style={{ fontFamily:serif, fontSize:20, color:"#111", marginBottom:10 }}>{c.title}</h3>
                  <p style={{ fontSize:13.5, color:"#555", lineHeight:1.85 }}>{c.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding:`110px ${hp}`, background:"#fff" }}>
        <div style={{ maxWidth:800, margin:"0 auto" }}>
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:72 }}>
              <p style={{ fontFamily:mono, fontSize:10, letterSpacing:3, color:"#888", textTransform:"uppercase", marginBottom:16 }}>FAQ</p>
              <h2 style={{ fontFamily:serif, fontSize:"clamp(34px,4vw,54px)", fontWeight:400, color:"#111", lineHeight:1.1 }}>
                Common questions,<br /><em>answered.</em>
              </h2>
            </div>
          </Reveal>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {FAQS.map((f,i) => {
              const isOpen = openFaq === i;
              return (
                <Reveal key={i} delay={i*50}>
                  <div onClick={() => setOpenFaq(isOpen ? -1 : i)}
                    style={{ padding:"22px 26px", borderRadius:14, background: isOpen ? "#f6f6f4" : "#fff", border:`1px solid ${isOpen ? "rgba(0,0,0,0.14)" : "rgba(0,0,0,0.08)"}`, cursor:"pointer", transition:"all 0.3s" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontFamily:sans, fontWeight:600, fontSize:14, color:"#111" }}>{f.q}</span>
                      {isOpen ? <ChevronUp size={16} color="#111" /> : <ChevronDown size={16} color="#aaa" />}
                    </div>
                    <div style={{ maxHeight: isOpen ? 200 : 0, overflow:"hidden", transition:"max-height 0.42s cubic-bezier(.16,1,.3,1)" }}>
                      <p style={{ paddingTop:14, fontSize:13.5, color:"#555", lineHeight:1.85 }}>{f.a}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding:`150px ${hp}`, textAlign:"center", position:"relative", overflow:"hidden", background:"#000" }}>
        <Reveal>
          <div style={{ maxWidth:680, margin:"0 auto", position:"relative" }}>
            <p style={{ fontFamily:mono, fontSize:10, letterSpacing:3, color:"#666", textTransform:"uppercase", marginBottom:24 }}>Start Today</p>
            <h2 style={{ fontFamily:serif, fontSize:"clamp(48px,7vw,86px)", fontWeight:400, color:"#fff", lineHeight:1.0, marginBottom:26, letterSpacing:"-0.02em" }}>
              Stop Managing.<br /><em style={{ color:"beige" }}>Start Scaling.</em>
            </h2>
            <p style={{ fontSize:15, color:"#ddd", lineHeight:1.85, maxWidth:440, margin:"0 auto 44px" }}>
              10-day free trial. Full access. No credit card. Cancel anytime.
            </p>
            <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
              <button className="btn-black" style={{ padding:"15px 40px", fontSize:12, background:"#fff", color:"#000" }} onClick={() => window.location.href = "https://plans.getenflowai.online/trial-signup"}>Start Free Trial <ArrowRight size={14} /></button>
              <button className="btn-ghost" style={{ padding:"15px 40px", fontSize:12, borderColor:"rgba(255,255,255,0.2)", color:"#ccc" }} onClick={() => window.location.href = "mailto:sales@getenflowai.online"}>Talk to Sales</button>
            </div>
            <p style={{ marginTop:22, fontFamily:mono, fontSize:10, color:"#555", letterSpacing:2 }}>getenflowai.online</p>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:"1px solid rgba(0,0,0,0.08)", padding:`64px ${hp} 36px`, background:"#f6f6f4" }}>
        <div className="footer-grid" style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr 1fr 1fr 1fr", gap:48, maxWidth:1280, margin:"0 auto", marginBottom:56 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:18 }}>
              <div style={{ width:28, height:28, borderRadius:7, background:"#000", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Zap size={14} color="#fff" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily:serif, fontSize:20, color:"#111" }}>EnflowAI</span>
            </div>
            <p style={{ fontSize:13, color:"#aaa", lineHeight:1.75, maxWidth:240, marginBottom:24 }}>
              Africa's first AI-powered restaurant operations platform. Built in Lagos, for Nigeria, for Africa.
            </p>
            <div style={{ display:"flex", gap:12 }}>
              {[MessageCircle,Mail,Globe2].map((Icon,i) => (
                <div key={i} style={{ width:36, height:36, borderRadius:9, background:"#efefed", border:"1px solid rgba(0,0,0,0.1)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                  <Icon size={15} color="#aaa" strokeWidth={1.6} />
                </div>
              ))}
            </div>
          </div>
          {[
            { title:"Product",   links:[["Zara AI",Bot],["Orders",ShoppingBag],["Payments",CreditCard],["Analytics",BarChart2],["Kitchen",Activity]] },
            { title:"Solutions", links:[["Restaurants",Users],["Cafes",Clock],["Food Courts",Layers],["Enterprise",Building2],["Chains",Globe]] },
            { title:"Resources", links:[["Docs",FileText],["Blog",BookOpen],["Case Studies",TrendingUp],["Changelog",Cpu],["Status",Shield]] },
            { title:"Company",   links:[["About",Users],["Contact",Mail],["Telegram",MessageCircle],["Globe2",Globe2],["Privacy",Lock]] },
          ].map((col,ci) => (
            <div key={ci}>
              <p style={{ fontFamily:mono, fontSize:9, fontWeight:700, letterSpacing:2, color:"#888", textTransform:"uppercase", marginBottom:20 }}>{col.title}</p>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {col.links.map(([label,Icon],li) => (
                  <a key={li} href="#" style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#aaa", textDecoration:"none" }}
                    onMouseEnter={e => e.currentTarget.style.color="#111"}
                    onMouseLeave={e => e.currentTarget.style.color="#aaa"}>
                    <Icon size={13} strokeWidth={1.6} />{label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ maxWidth:1280, margin:"0 auto", paddingTop:28, borderTop:"1px solid rgba(0,0,0,0.08)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:20 }}>
          <p style={{ fontFamily:mono, fontSize:10, color:"#aaa", letterSpacing:2, textTransform:"uppercase" }}>© 2026 JSTACK Innovations · Lagos, Nigeria</p>
          <div style={{ display:"flex", gap:28 }}>
            {["Privacy","Terms","Telegram","Contact"].map(l => (
              <button key={l} className="nav-item" style={{ fontSize:10 }}>{l}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
