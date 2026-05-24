import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Css/Reservations.css";
import { API_BASE } from "../Config/api";

type Table = {
  id: number;
  number: string;
  image: string;
};

type Reservation = {
  id: number;
  table_id: number;
  name: string;
  email: string;
  phone: string;
  booking_date: string;
  transaction_id: string;
  status: number;
  reservation_code: string;
  created_at: string;
};

export default function ReservationsPage() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
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


  // ✅ Guarded GET
  const [authChecked, setAuthChecked] = useState(false);

const fetchReservations = async () => {
  try {
    const res = await fetch(`${API_BASE}/getReservations`, { credentials: "include" });
    const data = await res.json();
    if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
      navigate("/login", { replace: true });
      return;
    }
    const flatTables: Table[] = data.tables.map((t: any) => ({ id: Number(t.id), number: t.number, image: t.image }));
    const resData: Reservation[] = data.reservations.map((r: any) => ({ ...r, table_id: Number(r.table_id), status: Number(r.status) }));
    setTables(flatTables);
    setReservations(resData);
    setAuthChecked(true);
  } catch (err) {
    console.error("Failed to fetch reservations:", err);
  }
};

  // ✅ Guarded UPDATE
  const handleUpdate = async (reservation: Reservation) => {
    try {
      const res = await fetch(`${API_BASE}/adminUpdateReservations`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", reservation }),
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

      fetchReservations();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  // ✅ Guarded DELETE
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/adminUpdateReservations`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
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

      fetchReservations();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Update a field in state safely
  const updateField = (id: number, field: keyof Reservation, value: any) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  useEffect(() => {
    fetchReservations();
  }, []);
  
  if (!authChecked) return null;

  return (
  <div className="admin-layout">

    {/* ---- DESKTOP SIDEBAR ---- */}
    <aside className="sidebar">
      <div className="brand">ARTISAN <span>GRILLS</span></div>
      {navLinks.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}
      <button className="logout-link" onClick={() => navigate("/logout")}>
        <span>⎋</span> Logout
      </button>
    </aside>

    {/* ---- MOBILE HEADER ---- */}
    <header className="orderMobile-header">
      <div className="brand">ARTISAN <span>GRILLS</span></div>
      <button
        className={`hamburger ${menuOpen ? "active" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span/><span/><span/>
      </button>
    </header>

    {/* ---- MOBILE BACKDROP ---- */}
    <div
      className="mob-backdrop"
      style={{
        display: menuOpen ? "block" : "none",
        opacity: menuOpen ? 1 : 0,
        pointerEvents: menuOpen ? "all" : "none"
      }}
      onClick={() => setMenuOpen(false)}
    />

    {/* ---- MOBILE DRAWER ---- */}
    <nav className={`mobile-menu ${menuOpen ? "open" : ""}`}>
      {navLinks.map(l => (
        <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
          {l.label}
        </a>
      ))}
      <button className="logout-link" onClick={() => navigate("/logout")}>
        <span>⎋</span> Logout
      </button>
    </nav>

    {/* ---- MAIN CONTENT ---- */}
    <main className="main-content">
      <h2>Reservations</h2>

      <div className="reservations-grid">
        {reservations.map((r) => {
          const table = tables.find((t) => t.id === r.table_id);

          return (
            <div key={r.id} className="reservation-card">
              <img src={table?.image} alt={`Table ${table?.number ?? "?"}`} />

              <h3>Reservation • Table {table?.number ?? "?"}</h3>

              <p><strong>Name:</strong> {r.name}</p>
              <p><strong>Email:</strong> {r.email}</p>
              <p><strong>Phone:</strong> {r.phone}</p>
              <p><strong>Booking Date:</strong> {r.booking_date}</p>
              <p><strong>Transaction ID:</strong> {r.transaction_id}</p>
              <p><strong>Code:</strong> {r.reservation_code}</p>
              <p><strong>Date:</strong> {new Date(r.created_at).toLocaleString()}</p>

              <div className={`status ${r.status === 1 ? "active" : "cancelled"}`}>
                {r.status === 1 ? "Active" : "Cancelled"}
              </div>

              <div className="form-row">
                <input value={r.name} onChange={(e) => updateField(r.id, "name", e.target.value)} />
                <input value={r.email} onChange={(e) => updateField(r.id, "email", e.target.value)} />
              </div>

              <div className="form-row">
                <input value={r.phone} onChange={(e) => updateField(r.id, "phone", e.target.value)} />
                <input value={r.booking_date} onChange={(e) => updateField(r.id, "booking_date", e.target.value)} />
              </div>

              <div className="form-row">
                <input value={r.transaction_id} onChange={(e) => updateField(r.id, "transaction_id", e.target.value)} />
              </div>

              <div className="form-row">
                <select value={r.status.toString()} onChange={(e) => updateField(r.id, "status", parseInt(e.target.value))}>
                  <option value="1">Active</option>
                  <option value="0">Cancelled</option>
                </select>
                <input value={r.reservation_code} onChange={(e) => updateField(r.id, "reservation_code", e.target.value)} />
              </div>

              <div className="form-row">
                <button className="btn-edit" onClick={() => handleUpdate(r)}>Save</button>
                <button className="btn-delete" onClick={() => handleDelete(r.id)}>Delete</button>
              </div>

            </div>
          );
        })}
      </div>

    </main>
  </div>
);
              }
