import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Css/AddOrder.css";
import { API_BASE } from "../Config/api";

type Order = {
  name: string;
  phone: string;
  table_no?: string;
  order_type: string;
  total_amount: string;
  payment_ref?: string;
  order_status: string;
  full_address?: string;
  plate_order_no?: string;
};

export default function AddOrder() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [order, setOrder] = useState<Order>({
    name: "",
    phone: "",
    table_no: "",
    order_type: "",
    total_amount: "",
    payment_ref: "",
    order_status: "Order placed",
    full_address: "",
    plate_order_no: "",
  });

  useEffect(() => {
    fetch(`${API_BASE}/adminAuthCheck`, { credentials: "include" })
      .then(r => {
        if (r.status === 401) navigate("/login", { replace: true });
        else setAuthChecked(true);
      })
      .catch(() => navigate("/login", { replace: true }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOrder(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/adminAddOrder`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      const data = await res.json();
      if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
        navigate("/login");
        return;
      }
      if (data.success) {
        alert("Order added successfully!");
        navigate("/");
      } else {
        alert("Failed to add order: " + (data.error || "unknown"));
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  if (!authChecked) return null;

  return (
    <div className="wrapper">
      <div className="form-card">
        <h2>Add Order</h2>
        <p>Fill the details and click Add Order.</p>
        <form onSubmit={handleSubmit} className="form-group">
          <input name="name" placeholder="Name" value={order.name} onChange={handleChange} required />
          <input name="phone" placeholder="Phone" value={order.phone} onChange={handleChange} required />
          <input name="table_no" placeholder="Table No" value={order.table_no} onChange={handleChange} />
          <input name="order_type" placeholder="Order Type" value={order.order_type} onChange={handleChange} required />
          <input name="total_amount" placeholder="Total Amount" value={order.total_amount} onChange={handleChange} required />
          <input name="payment_ref" placeholder="Payment Ref" value={order.payment_ref} onChange={handleChange} />
          <select name="order_status" value={order.order_status} onChange={handleChange} required>
            <option value="Order placed">Order placed</option>
            <option value="Cooking">Cooking</option>
            <option value="Cooking done">Cooking done</option>
            <option value="Out for delivery">Out for delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Served">Served</option>
            <option value="Picked up">Picked up</option>
          </select>
          <input name="full_address" placeholder="Full Address" value={order.full_address} onChange={handleChange} />
          <input name="plate_order_no" placeholder="Plate Order No" value={order.plate_order_no} onChange={handleChange} />
          <button className="btn" type="submit">Add Order</button>
        </form>
      </div>
    </div>
  );
}