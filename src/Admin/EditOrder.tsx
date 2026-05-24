import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Css/EditOrder.css";
import { API_BASE } from "../Config/api";

type Order = {
  info: any;
  items: any[];
};

export default function EditOrder() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_BASE}/adminEditOrder?id=${id}`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (res.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        const data = await res.json();
        setOrder(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch order:", err);
        navigate("/login", { replace: true });
      }
    };

    fetchOrder();
  }, [id, navigate]);

  // ✅ update ONLY info fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setOrder(prev =>
      prev
        ? {
            ...prev,
            info: {
              ...prev.info,
              [e.target.name]: e.target.value,
            },
          }
        : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !id) return;

    try {
      const res = await fetch(`${API_BASE}/adminEditOrder?id=${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order.info), // only send info
      });

      if (res.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      await res.json();

      alert("Order updated!");
      navigate("/");
    } catch (err) {
      console.error("Failed to update order:", err);
    }
  };

  if (loading || !order)
  return (
    <div className="loading-wrapper">
      <div className="spinner"></div>
      <p>Loading order...</p>
    </div>
  );

  return (
    <div className="wrapper">
      <div className="form-card">
        <h2>Edit Order</h2>

        {/* FORM (ONLY INFO) */}
        <form onSubmit={handleSubmit} className="form-grid">
          {Object.entries(order.info).map(([key, value]) => (
            <div key={key}>
              <label>{key.replace(/_/g, " ").toUpperCase()}</label>

              {key === "order_type" || key === "order_status" ? (
                <select
                  name={key}
                  value={value ?? ""}
                  onChange={handleChange}
                  required
                >
                  {key === "order_type" && (
                    <>
                      <option value="table">Table</option>
                      <option value="delivery">Delivery</option>
                      <option value="pickup">Pickup</option>
                    </>
                  )}

                  {key === "order_status" && (
                    <>
                      <option value="Order placed">Order placed</option>
                      <option value="Cooking">Cooking</option>
                      <option value="Cooking done">Cooking done</option>
                      <option value="Out for delivery">Out for delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Served">Served</option>
                      <option value="Picked up">Picked up</option>
                    </>
                  )}
                </select>
              ) : (
                <input
                  name={key}
                  value={value ?? ""}
                  onChange={handleChange}
                />
              )}
            </div>
          ))}

          <div className="btn-row">
            <button type="button" className="btn-back" onClick={() => navigate(-1)}>
              ← Back
            </button>
            <button type="submit" className="btn">
              Save Changes
            </button>
          </div>
        </form>

        {/* ITEMS PREVIEW (LIKE PAID ORDERS PAGE) */}
        <div className="order-items">
          {order.items?.map((item, idx) => (
            <div key={idx} className="item">
              <img
                src={item.image}
                alt={item.name}
                style={{
                  width: 50,
                  height: 50,
                  objectFit: "cover",
                  borderRadius: 6,
                }}
              />
              <div>
                {item.name} x{item.qty}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}