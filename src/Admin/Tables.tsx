import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiGrid, FiCheckCircle, FiXCircle, FiDollarSign } from "react-icons/fi";
import "./Css/Tables.css";
import { API_BASE } from "../Config/api";

type Table = {
  id: number;
  number: string;
  seats: number;
  description: string;
  image: string;
  booked: number;
  booked_id: number | null;
  amount: number;
};

export default function Tables() {
  const navigate = useNavigate();
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

  const [authChecked, setAuthChecked] = useState(false);

const fetchTables = async () => {
  try {
    const res = await fetch(`${API_BASE}/getTable`, { credentials: "include" });
    const data = await res.json();
    if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
      navigate("/login", { replace: true });
      return;
    }
    const allTables = Object.values(data.floors || {}).flat();
    setTables(allTables as Table[]);
    setAuthChecked(true);
  } catch (err) {
    console.error("Failed to fetch tables:", err);
    navigate("/login", { replace: true });
  }
};
  
  useEffect(() => { fetchTables(); }, []);
  
  
  
  const totalTables = tables.length;
const bookedTables = tables.filter(t => t.booked === 1).length;
const availableTables = tables.filter(t => t.booked === 0).length;
const totalTableValue = tables.reduce((sum, t) => sum + (t.amount || 0), 0);


  const handleTableEdit = async (table: Table) => {
    try {
      const res = await fetch(`${API_BASE}/adminUpdateTable`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "edit",
          id: table.id,
          number: table.number,
          seats: table.seats,
          description: table.description,
          image: table.image,
          amount: table.amount,
        }),
      });
      const data = await res.json();
      if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
        navigate("/login", { replace: true });
        return;
      }
      if (!data.success) { alert("Update failed: " + data.error); fetchTables(); }
    } catch (err) {
      console.error("Update failed:", err);
      navigate("/login", { replace: true });
    }
  };

  const handleUpdate = async (table: Table, booked: number) => {
    setTables((prev) => prev.map((t) => (t.id === table.id ? { ...t, booked } : t)));
    try {
      const res = await fetch(`${API_BASE}/adminUpdateTable`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: table.id, booked_id: table.booked_id, action: "update", booked }),
      });
      const data = await res.json();
      if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
        navigate("/login", { replace: true });
        return;
      }
      if (!data.success) {
        alert("Update failed: " + data.error);
        setTables((prev) => prev.map((t) => (t.id === table.id ? { ...t, booked: table.booked } : t)));
      }
    } catch (err) {
      console.error("Update failed:", err);
      navigate("/login", { replace: true });
    }
  };

  const handleDelete = async (table: Table) => {
    if (!table.booked_id) return alert("Nothing to delete");
    try {
      const res = await fetch(`${API_BASE}/adminUpdateTable`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: table.id, booked_id: table.booked_id, action: "delete" }),
      });
      const data = await res.json();
      if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
        navigate("/login", { replace: true });
        return;
      }
      if (data.success) fetchTables();
      else alert("Delete failed: " + data.error);
    } catch (err) {
      console.error("Delete failed:", err);
      navigate("/login", { replace: true });
    }
  };

  if (!authChecked) return null;

return (
  <div className="admin-layout">

      {/* DESKTOP SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">ARTISAN <span>GRILLS</span></div>
        {navLinks.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}
        <button className="logout-link" onClick={() => navigate("/logout")}>
          <span>⎋</span> Logout
        </button>
      </aside>

      {/* MOBILE HEADER */}
      <header className="orderMobile-header">
        <div className="brand">ARTISAN <span>GRILLS</span></div>
        <button className={`hamburger ${menuOpen ? "active" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
          <span/><span/><span/>
        </button>
      </header>

      {/* BACKDROP */}
      <div
        className="mob-backdrop"
        style={{ display: menuOpen ? "block" : "none", opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? "all" : "none" }}
        onClick={() => setMenuOpen(false)}
      />

      {/* MOBILE DRAWER */}
      <nav className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        {navLinks.map(l => (
          <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
        ))}
        <button className="logout-link" onClick={() => navigate("/logout")}>
          <span>⎋</span> Logout
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <main className="main-content">
         {/* TABLE STATS */}
<div className="table-cards">
  <div className="table-stat-card">
    <h4>
      <FiGrid size={16} />
      Total Tables
    </h4>
    <p>{totalTables}</p>
  </div>

  <div className="table-stat-card">
    <h4>
      <FiCheckCircle size={16} />
      Booked Tables
    </h4>
    <p style={{ color: "#f87171" }}>{bookedTables}</p>
  </div>

  <div className="table-stat-card">
    <h4>
      <FiXCircle size={16} />
      Available Tables
    </h4>
    <p style={{ color: "#4ade80" }}>{availableTables}</p>
  </div>

  <div className="table-stat-card">
    <h4>
      <FiDollarSign size={16} />
      Total Table Value
    </h4>
    <p>₦{totalTableValue.toLocaleString()}</p>
  </div>
</div>
          <div className="table-grid">
            {tables.map((table) => (
              <div className="table-card" key={table.id}>
                <img src={table.image} alt={`Table ${table.number}`} />

                <h3>Table {table.number} • {table.seats} seats</h3>
                <p>{table.description}</p>
                <p><strong>Amount:</strong> ₦{table.amount}</p>

                <div className={`table-status ${table.booked ? "booked" : "available"}`}>
                  {table.booked ? "Booked" : "Available"}
                </div>

                <div className="table-form-row">
                  <input value={table.number} onChange={(e) => setTables((prev) => prev.map((t) => t.id === table.id ? { ...t, number: e.target.value } : t))} />
                  <input type="number" value={table.seats} onChange={(e) => setTables((prev) => prev.map((t) => t.id === table.id ? { ...t, seats: parseInt(e.target.value) } : t))} />
                </div>

                <div className="table-form-row">
                  <input value={table.image} onChange={(e) => setTables((prev) => prev.map((t) => t.id === table.id ? { ...t, image: e.target.value } : t))} />
                </div>

                <div className="table-form-row">
                  <input value={table.description} onChange={(e) => setTables((prev) => prev.map((t) => t.id === table.id ? { ...t, description: e.target.value } : t))} />
                </div>

                <div className="table-form-row">
                  <input type="number" value={table.amount} onChange={(e) => setTables((prev) => prev.map((t) => t.id === table.id ? { ...t, amount: parseFloat(e.target.value) } : t))} />
                </div>

                <div className="table-form-rowT">
                  <select value={table.booked} onChange={(e) => handleUpdate(table, parseInt(e.target.value))}>
                    <option value={0}>Available</option>
                    <option value={1}>Booked</option>
                  </select>
                  <button className="tables-btn" onClick={() => handleDelete(table)}>Delete</button>
                </div>

                <button className="table-btn" onClick={() => handleTableEdit(table)}>Save Changes</button>
              </div>
            ))}
          </div>
      </main>

    </div>
  );
}
