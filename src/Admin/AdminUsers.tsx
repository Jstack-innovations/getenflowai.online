import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiUserCheck } from "react-icons/fi";
import { API_BASE } from "../Config/api";
import "../App.css";

export default function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<any[]>([]);
  const [editUser, setEditUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [page, setPage] = useState(1);

  const ROWS_PER_PAGE = 10;

  const totalUsers = users.length;
  const totalActive = users.filter(u => u.status?.toLowerCase() === "active").length;

  const [authChecked, setAuthChecked] = useState(false);

useEffect(() => {
  fetch(`${API_BASE}/UandV`, { credentials: "include" })
    .then(async res => {
      const data = await res.json();
      if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
        navigate("/login", { replace: true });
        return;
      }
      setUsers(data.users || []);
      setAuthChecked(true);
    })
    .catch(err => {
      console.error(err);
      navigate("/login", { replace: true });
    });
}, []);

  function startEdit(user: any) {
    setEditUser({ ...user });
  }

  function saveEdit() {
    fetch(`${API_BASE}/adminUpdateUser`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(editUser),
    })
      .then(async res => {
        const data = await res.json();
        if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
          navigate("/login", { replace: true });
          return;
        }
        if (data.success) {
          setUsers(users.map(u => u.id === editUser.id ? editUser : u));
          setEditUser(null);
        } else {
          alert("Update failed: " + data.error);
        }
      })
      .catch(err => {
        console.error("Save edit failed:", err);
        navigate("/login", { replace: true });
      });
  }

  function deleteUser(id: number) {
    if (!confirm("Delete this user?")) return;
    fetch(`${API_BASE}/adminDeleteUser`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id }),
    })
      .then(async res => {
        const data = await res.json();
        if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
          navigate("/login", { replace: true });
          return;
        }
        if (data.success) {
          setUsers(users.filter(u => u.id !== id));
        } else {
          alert("Delete failed: " + data.error);
        }
      })
      .catch(err => {
        console.error("Delete failed:", err);
        navigate("/login", { replace: true });
      });
  }

  const totalPages = Math.ceil(users.length / ROWS_PER_PAGE);
  const paginated = users.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

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
          <span /><span /><span />
        </button>
      </header>

      {/* ---- MOBILE DRAWER ---- */}
      <div
        className="mob-backdrop"
        style={{ display: menuOpen ? "block" : "none", opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? "all" : "none" }}
        onClick={() => setMenuOpen(false)}
      />
      <nav className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        {navLinks.map(l => (
          <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
        ))}
        <button className="logout-link" onClick={() => navigate("/logout")}>
          <span>⎋</span> Logout
        </button>
      </nav>

      {/* ---- MAIN CONTENT ---- */}
      <main className="main-content">
        <h2>Users</h2>

        {/* STAT CARDS */}
        <div className="orderCards">
          <div className="orderCard">
            <h3><FiUsers style={{ marginRight: 6, verticalAlign: "middle" }} />Total Users</h3>
            <p>{totalUsers}</p>
            <span style={{ color: "#4ade80", fontSize: "0.8rem", fontWeight: 700 }}>
              {totalUsers > 0 ? "Registered" : "—"}
            </span>
          </div>

          <div className="orderCard">
            <h3><FiUserCheck style={{ marginRight: 6, verticalAlign: "middle" }} />Total Active</h3>
            <p>{totalActive}</p>
            <span style={{ color: "#4ade80", fontSize: "0.8rem", fontWeight: 700 }}>
              {totalActive > 0 ? "Active" : "—"}
            </span>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-wrapper">
          <div className="table-body-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={6}>No users found</td></tr>
                ) : (
                  paginated.map((user: any) => {
                    const editing = editUser?.id === user.id;
                    return (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>
                          {editing
                            ? <input value={editUser.full_name} onChange={e => setEditUser({ ...editUser, full_name: e.target.value })} />
                            : user.full_name}
                        </td>
                        <td>
                          {editing
                            ? <input value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} />
                            : user.email}
                        </td>
                        <td>
                          {editing
                            ? <input value={editUser.phone} onChange={e => setEditUser({ ...editUser, phone: e.target.value })} />
                            : user.phone}
                        </td>
                        <td>
                          {editing ? (
                            <select value={editUser.status} onChange={e => setEditUser({ ...editUser, status: e.target.value })}>
                              <option value="pending">pending</option>
                              <option value="active">active</option>
                            </select>
                          ) : (
                            <span className={`status ${user.status?.toLowerCase()}`}>{user.status}</span>
                          )}
                        </td>
                        <td style={{ display: "flex", gap: 6 }}>
                          {editing ? (
                            <button className="btn-edit" onClick={saveEdit}>Save</button>
                          ) : (
                            <>
                              <button className="btn-edit" onClick={() => startEdit(user)}>Edit</button>
                              <button className="btn-delete" onClick={() => deleteUser(user.id)}>Delete</button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce((acc: (number | string)[], n, idx, arr) => {
                  if (idx > 0 && (n as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(n);
                  return acc;
                }, [])
                .map((n, idx) =>
                  n === "..." ? (
                    <span key={`e${idx}`} className="page-info">…</span>
                  ) : (
                    <button
                      key={n}
                      className={`page-btn ${page === n ? "active" : ""}`}
                      onClick={() => setPage(n as number)}
                    >
                      {n}
                    </button>
                  )
                )}

              <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
              <span className="page-info">Page {page} of {totalPages}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
