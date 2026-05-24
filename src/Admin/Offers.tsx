import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Css/Offers.css";
import { API_BASE } from "../Config/api";

const GET_URL = `${API_BASE}/offer`;
const SAVE_URL = `${API_BASE}/adminOffer`;

type Offer = {
  title: string;
  main: string;
  sub: string;
  bg: string;
  image: string;
};

export default function OffersAdmin() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const navigate = useNavigate();


const [authChecked, setAuthChecked] = useState(false);

useEffect(() => {
  fetch(`${API_BASE}/authAdminCheck`, { credentials: "include" })
    .then(r => {
      if (r.status === 401) navigate("/login", { replace: true });
      else setAuthChecked(true);
    })
    .catch(() => navigate("/login", { replace: true }));
}, []);


  // ✅ GET is free
  useEffect(() => {
    fetch(GET_URL)
      .then((res) => res.json())
      .then((data: Offer[]) => setOffers(data))
      .catch((err) => console.error("Failed to fetch offers:", err));
  }, []);

  const update = (i: number, key: keyof Offer, value: string) => {
    const copy = [...offers];
    copy[i] = { ...copy[i], [key]: value };
    setOffers(copy);
  };

  const add = () => {
    setOffers([...offers, { title: "", main: "", sub: "", bg: "#fff", image: "" }]);
  };

  const remove = (i: number) => {
    setOffers(offers.filter((_, index) => index !== i));
  };

  // ✅ Only SAVE is guarded
  const save = async () => {
    try {
      const res = await fetch(SAVE_URL, {
        method: "POST",
        credentials: "include", // send session cookie
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offers),
      });

      const data = await res.json();

      if (
        res.status === 401 ||
        data.error === "Unauthorized" ||
        data.error === "Session expired"
      ) {
        navigate("/login", { replace: true });
        return;
      }

      alert("Offers saved!");
    } catch (err) {
      console.error("Failed to save offers:", err);
    }
  };

  const [menuOpen, setMenuOpen] = useState(false);

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

if (!authChecked) return null;

return (
  <div className="admin-layout">

    {/* DESKTOP SIDEBAR */}
    <aside className="sidebar">
      <div className="brand">ARTISAN <span>GRILLS</span></div>
      {navLinks.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}
      <button className="logout-link" onClick={() => navigate("/logout")}>
        ⎋ Logout
      </button>
    </aside>

    {/* MOBILE HEADER */}
    <header className="orderMobile-header">
      <div className="brand">ARTISAN <span>GRILLS</span></div>
      <button
        className={`hamburger ${menuOpen ? "active" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span/><span/><span/>
      </button>
    </header>

    {/* BACKDROP */}
    <div
      className="mob-backdrop"
      style={{
        display: menuOpen ? "block" : "none",
        opacity: menuOpen ? 1 : 0,
        pointerEvents: menuOpen ? "all" : "none"
      }}
      onClick={() => setMenuOpen(false)}
    />

    {/* MOBILE DRAWER */}
    <nav className={`mobile-menu ${menuOpen ? "open" : ""}`}>
      {navLinks.map(l => (
        <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
          {l.label}
        </a>
      ))}
      <button className="logout-link" onClick={() => navigate("/logout")}>
        ⎋ Logout
      </button>
    </nav>

    {/* MAIN CONTENT */}
    <main className="main-content">
      <div className="page">
        <h2 className="title">Offers Admin Panel</h2>

        {offers.map((o, i) => (
          <div key={i} className="offercard">
            <input value={o.title} placeholder="Title"
              onChange={(e) => update(i, "title", e.target.value)} />
            <input value={o.main} placeholder="Main"
              onChange={(e) => update(i, "main", e.target.value)} />
            <input value={o.sub} placeholder="Sub"
              onChange={(e) => update(i, "sub", e.target.value)} />
            <input value={o.bg} placeholder="BG Color"
              onChange={(e) => update(i, "bg", e.target.value)} />
            <input value={o.image} placeholder="Image URL"
              onChange={(e) => update(i, "image", e.target.value)} />
            <button className="delete" onClick={() => remove(i)}>
              Delete
            </button>
          </div>
        ))}

        <div className="actions">
          <button onClick={add}>Add Offer</button>
          <button onClick={save} className="save">
            Save Changes
          </button>
        </div>
      </div>
    </main>

  </div>
);
}
