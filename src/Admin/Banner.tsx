import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Css/Banner.css";
import { API_BASE } from "../Config/api";

const GET_URL = `${API_BASE}/banner`;
const SAVE_URL = `${API_BASE}/adminBanner`;

type Banner = {
  address: string;
  discount: {
    title: string;
    subtitle: string;
  };
};

export default function BannerAdmin() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const [authChecked, setAuthChecked] = useState(false);

useEffect(() => {
  fetch(`${API_BASE}/authCheck`, { credentials: "include" })
    .then(r => {
      if (r.status === 401) navigate("/login", { replace: true });
      else setAuthChecked(true);
    })
    .catch(() => navigate("/login", { replace: true }));
}, []);

  useEffect(() => {
    fetch(GET_URL)
      .then((res) => res.json())
      .then((data: Banner) => setBanner(data))
      .catch(console.error);
  }, []);

  const updateAddress = (value: string) => {
    if (!banner) return;
    setBanner({ ...banner, address: value });
  };

  const updateDiscount = (key: keyof Banner["discount"], value: string) => {
    if (!banner) return;
    setBanner({
      ...banner,
      discount: {
        ...banner.discount,
        [key]: value,
      },
    });
  };

  const save = async () => {
    if (!banner) return;

    const res = await fetch(SAVE_URL, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(banner),
    });

    const data = await res.json();

    if (res.status === 401 || data.error === "Unauthorized") {
      navigate("/login");
      return;
    }

    alert("Banner saved!");
  };

  const navLinks = [
  { href: "/", label: "All Orders" },
  { href: "/users", label: "Active Users" },
  { href: "/tables", label: "Available Tables" },
  { href: "/menu", label: "Add Menu" },
  { href: "/tax", label: "Set Tax" },
  { href: "/check-reservations", label: "View Reservations" },
  { href: "/scanner", label: "Scan Artisan Items" },
  { href: "/offers", label: "Set Artisanè Offers" },
  { href: "/banners", label: "Set Artisanè Banner" },
  { href: "/analytics", label: "See Business Analysis" },
  { href: "/plan", label: "Go Premium & ++" },
];

  if (!banner) return <p>Loading...</p>;
  
  if (!authChecked) return null;

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">ARTISAN <span>GRILLS</span></div>
        {navLinks.map(l => (
          <a key={l.href} href={l.href}>{l.label}</a>
        ))}
        <button onClick={() => navigate("/logout")}>Logout</button>
      </aside>

      {/* MOBILE HEADER */}
      <header className="orderMobile-header">
        <div className="brand">ARTISAN <span>GRILLS</span></div>

        <button
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span /><span /><span />
        </button>
      </header>

      {/* BACKDROP */}
      <div
        className="mob-backdrop"
        style={{
          display: menuOpen ? "block" : "none",
        }}
        onClick={() => setMenuOpen(false)}
      />

      {/* MOBILE MENU */}
      <nav className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        {navLinks.map(l => (
          <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
            {l.label}
          </a>
        ))}
        <button onClick={() => navigate("/logout")}>Logout</button>
      </nav>

      {/* MAIN */}
      <main className="main-content">
        <div className="page">
          <h2 className="title">Banner Editor</h2>

          <div className="card">
            <input
              value={banner.address}
              onChange={(e) => updateAddress(e.target.value)}
              placeholder="Address"
            />
          </div>

          <div className="card">
            <input
              value={banner.discount.title}
              onChange={(e) => updateDiscount("title", e.target.value)}
              placeholder="Discount Title"
            />
            <input
              value={banner.discount.subtitle}
              onChange={(e) => updateDiscount("subtitle", e.target.value)}
              placeholder="Discount Subtitle"
            />
          </div>

          <div className="actions">
            <button className="save" onClick={save}>
              Save Changes
            </button>
          </div>
        </div>
      </main>

    </div>
  );
}