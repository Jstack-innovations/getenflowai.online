import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "./Config/api";
import "./App.css";

type OrderItem = {
  image: string;
  name: string;
  qty: number;
};

type OrderInfo = {
  order_id: number;
  plate_order_no: string;
  user_id: number;
  name: string;
  phone: string;
  order_type: string;
  table_no?: string;
  total_amount: string;
  payment_ref: string;
  status: string;
  order_status: string;
  full_address?: string;
  pickup_time?: string;
  created_at: string;
};

type Order = {
  info: OrderInfo;
  items: OrderItem[];
};

type Stats = {
  totalPlaced?: number;
  totalServed?: number;
  totalDelivered?: number;
  totalPickup?: number;
  totalRevenue?: number;
};

export default function PaidOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({});
  
  // ✅ This fixes your TS errors for hamburger menu
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_BASE}/getOrder`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      const data = await res.json();
      setOrders(Object.values(data.orders || {}));
      setStats(data.stats || {});
    } catch (err) {
      console.error(err);
      navigate("/login", { replace: true });
    }
  };

  checkAuth();
}, [navigate]);
  

  const deleteOrder = async (id: number) => {
    if (!confirm("Delete this order?")) return;

    try {
      const res = await fetch(`${API_BASE}/adminDeleteOrder?id=${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o.info.order_id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };


  
  const renderStat = (value?: number) => <p>{value ?? 0}</p>;

    const renderOrders = () => {
  if (orders.length === 0) {
    return (
      <tr>
        <td colSpan={15}>No orders found</td>
      </tr>
    );
  }

  return orders.map((o) => (
    <tr key={o.info.order_id}>
      <td>{o.info.order_id}</td>
      <td>{o.info.plate_order_no}</td>
      <td>{o.info.user_id}</td>
      <td>
        {o.info.name}
        <br />
        {o.info.phone}
      </td>
      <td>{o.info.order_type.toUpperCase()}</td>
      <td>{o.info.table_no || "-"}</td>
      <td>
        <div className="order-items">
          {(o.items || []).map((i, idx) => (
            <div className="item" key={idx}>
              <img src={i.image} alt="" />
              <div>
                {i.name} x{i.qty}
              </div>
            </div>
          ))}
        </div>
      </td>
      <td>${parseFloat(o.info.total_amount).toFixed(2)}</td>
      <td>{o.info.payment_ref}</td>
      <td>{o.info.status}</td>
      <td>{o.info.order_status}</td>
      <td>{o.info.full_address || "-"}</td>
      <td>{o.info.pickup_time || "-"}</td>
      <td>{new Date(o.info.created_at).toLocaleString()}</td>
      <td>
        <button
          className="btn"
          onClick={() => navigate(`/edit-order/${o.info.order_id}`)}
        >
          Edit
        </button>
        <button
          className="btn"
          onClick={() => deleteOrder(o.info.order_id)}
        >
          Delete
        </button>
      </td>
    </tr>
  ));
};

  return (
    <>
            <header>

        <div className="brand">
          ARTISAN <span>GRILLS</span>
        </div>

        <nav className="nav">
        <a href="/">All Orders</a>
        <a href="/tables">Available Tables</a>
        <a href="/menu">Add Menu</a>
        <a href="/tax">Set Tax</a>
        <a href="/check-reservations">View Reservations</a>
        <a href="/scanner">Scan Artisan Items</a>
       <a href="/offers">Set Artisanè Offers</a>
       <a href="/banners">Set Artisanè Banner</a>
       <a href="/analytics">See Business Analysis</a>
        </nav>

<button
  className="logout-link"
  onClick={() => navigate("/logout")}
  style={{
    all: "unset",          // remove default button styles
    cursor: "pointer",     // pointer on hover
    display: "flex",       // keep the flex if you want icon + text
    alignItems: "center",
    gap: "6px",
  }}
>
  <span className="logout-icon">⎋</span> Logout
</button>

        <button
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </header>

      <div className={`mobile-menu ${menuOpen ? "" : "hidden"}`}>
        <a href="/">All Orders</a>
        <a href="/users">Active Users</a>
        <a href="/tables">Available Tables</a>
        <a href="/menu">Add Menu</a>
        <a href="/tax">Set Tax</a>
        <a href="/check-reservations">View Reservations</a>
       <a href="/scanner">Scan Artisan Items</a>
       <a href="/offers">Set Artisanè Offers</a>
       <a href="/banners">Set Artisanè Banner</a>
       <a href="/analytics">See Business Analysis</a>
      </div>

      
      <div className="wrapper">
        <h2>Paid Orders</h2>

        <div className="cards">
          <div className="card">
            <h3>Total Placed Orders</h3>
            {renderStat(stats.totalPlaced)}
          </div>

          <div className="card">
            <h3>Total Served Orders</h3>
            {renderStat(stats.totalServed)}
          </div>

          <div className="card">
            <h3>Total Delivered Orders</h3>
            {renderStat(stats.totalDelivered)}
          </div>

          <div className="card">
            <h3>Total Pickup Orders</h3>
            {renderStat(stats.totalPickup)}
          </div>

          <div className="card">
            <h3>Total Revenue</h3>
            <p>
  ${typeof stats.totalRevenue === "number" ? stats.totalRevenue.toFixed(2) : "0.00"}
</p>
          </div>
        </div>

        <button className="btn" onClick={() => navigate("/add-order")}>
          Add Order
        </button>

        <div className="scroll-table">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Plate Order No</th>
                <th>User ID</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Table</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment Ref</th>
                <th>Status</th>
                <th>Order Status</th>
                <th>Full Address</th>
                <th>Pickup Time</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>{renderOrders()}</tbody>
          </table>
        </div>
      </div>
    </>
  );
            }              
