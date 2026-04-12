import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Css/Menu.css";
import { API_BASE } from "../Config/api";

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  tags: string[];
  badge?: string;
  available: number | boolean;
  stock: number;
};
type Menu = Record<string, MenuItem[]>;

export default function MenuPage() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState<Menu>({});
  const [form, setForm] = useState({
    category: "",
    name: "",
    price: "",
    description: "",
    image: "",
    tags: "",
    badge: "",
    available: "1",
    stock: "",
  });
  const [hamburgerActive, setHamburgerActive] = useState(false);

  // GET menu is free
  const fetchMenu = async () => {
  const res = await fetch(`${API_BASE}/getMenu`, {
    credentials: "include", // <-- send the session cookie
  });
  const data = await res.json();

  if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
    navigate("/login", { replace: true });
    return;
  }

  setMenu(data.menu);
};

  useEffect(() => {
  fetchMenu();
}, []);

const handleAdd = async (e: React.FormEvent) => {
  e.preventDefault();
  const res = await fetch(`${API_BASE}/adminUpdateMenu`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // <-- session cookie sent
    body: JSON.stringify({
      action: "add",
      category: form.category,
      name: form.name,
      description: form.description,
      price: form.price,
      image: form.image,
      tags: form.tags.split(","),
      badge: form.badge,
      available: form.available === "1",
      stock: item.stock,

    }),
  });

  const data = await res.json();
  if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
    navigate("/login", { replace: true });
    return;
  }

  fetchMenu();
};

const handleUpdate = async (category: string, item: MenuItem) => {
  const res = await fetch(`${API_BASE}/adminUpdateMenu`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // <-- session cookie sent
    body: JSON.stringify({
      action: "update",
      category,
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      tags: item.tags,
      badge: item.badge,
      available: item.available,
      stock: form.stock,

    }),
  });

  const data = await res.json();
  if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
    navigate("/login", { replace: true });
    return;
  }

  fetchMenu();
};

const handleDelete = async (category: string, id: number) => {
  const res = await fetch(`${API_BASE}/adminUpdateMenu`, { // fixed typo here
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // <-- session cookie sent
    body: JSON.stringify({
      action: "delete",
      category,
      id,
    }),
  });

  const data = await res.json();
  if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
    navigate("/login", { replace: true });
    return;
  }

  fetchMenu();
};
  
  return (
    <div className="menu-page">
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
        </nav>
        <button
          className={`hamburger ${hamburgerActive ? "active" : ""}`}
          onClick={() => setHamburgerActive(!hamburgerActive)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      <div className={`mobile-menu ${hamburgerActive ? "" : "hidden"}`}>
        <a href="/">All Orders</a>
        <a href="/tables">Available Tables</a>
        <a href="/menu">Add Menu</a>
        <a href="/tax">Set Tax</a>
        <a href="/check-reservations">View Reservations</a>
      </div>

      <div className="container">
        <div className="add-form">
          <h2>Add New Menu Item</h2>
          <form onSubmit={handleAdd}>
            <input type="hidden" name="action" value="add" />
            <div className="form-row">
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select Category</option>
                {Object.keys(menu).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <input
                placeholder="Item Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <input
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
              <input
                placeholder="Badge (optional)"
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
              />
            </div>

            <div className="form-row">
              <input
                placeholder="Image URL"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                required
              />
              <input
                placeholder="Tags (comma separated)"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                required
              />
            </div>

            <div className="form-rowT">
              <input
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
              <select
                value={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.value })}
              >
                <option value="1">Available</option>
                <option value="0">Not Available</option>
              </select>          
  <input
    type="number"
    placeholder="Stock"
    value={form.stock}
    onChange={(e) => setForm({ ...form, stock: e.target.value })}
    required
  />
            </div>

            <button className="btn" type="submit">
              Add Item
            </button>
          </form>
        </div>

        {Object.entries(menu).map(([category, items]) => (
          <div key={category} className="category">
            <h2>{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
            <div className="grid">
              {items.map((item) => (
                <div key={item.id} className="card">
                  <img src={item.image} alt={item.name} />
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <p><strong>Price:</strong> ${item.price}</p>
                  <p><strong>Tags:</strong> {item.tags.join(", ")}</p>
                  <p><strong>Badge:</strong> {item.badge ?? "—"}</p>
                  <p><strong>Stock:</strong> {item.stock} 
                    <br />
                  <strong>Available:</strong> {item.available ? "Yes" : "No"}
                  </p>

                  {/* Editable fields */}
                  <div className="form-row">
                    <input
                      value={item.name}
                      onChange={(e) => {
                        const newItems = menu[category].map((i) =>
                          i.id === item.id ? { ...i, name: e.target.value } : i
                        );
                        setMenu({ ...menu, [category]: newItems });
                      }}
                    />
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => {
                        const newItems = menu[category].map((i) =>
                          i.id === item.id ? { ...i, price: parseFloat(e.target.value) } : i
                        );
                        setMenu({ ...menu, [category]: newItems });
                      }}
                    />
                  </div>
                  <div className="form-row">
                    <input
                      value={item.image}
                      onChange={(e) => {
                        const newItems = menu[category].map((i) =>
                          i.id === item.id ? { ...i, image: e.target.value } : i
                        );
                        setMenu({ ...menu, [category]: newItems });
                      }}
                    />
                    <input
                      value={item.badge ?? ""}
                      onChange={(e) => {
                        const newItems = menu[category].map((i) =>
                          i.id === item.id ? { ...i, badge: e.target.value } : i
                        );
                        setMenu({ ...menu, [category]: newItems });
                      }}
                    />
                  </div>
                  <div className="form-row">
                    <input
                      value={item.description}
                      onChange={(e) => {
                        const newItems = menu[category].map((i) =>
                          i.id === item.id ? { ...i, description: e.target.value } : i
                        );
                        setMenu({ ...menu, [category]: newItems });
                      }}
                    />
                    <input
                      value={item.tags.join(", ")}
                      onChange={(e) => {
                        const newItems = menu[category].map((i) =>
                          i.id === item.id ? { ...i, tags: e.target.value.split(",") } : i
                        );
                        setMenu({ ...menu, [category]: newItems });
                      }}
                    />
                  </div>
                  <div className="form-rowT">
                    <select
                      value={item.available ? "1" : "0"}
                      onChange={(e) => {
                        const newItems = menu[category].map((i) =>
                          i.id === item.id ? { ...i, available: e.target.value === "1" } : i
                        );
                        setMenu({ ...menu, [category]: newItems });
                      }}
                    >
                      <option value="1">Available</option>
                      <option value="0">Not Available</option>
                    </select>
  <input
    type="number"
    value={item.stock}
    onChange={(e) => {
      const newItems = menu[category].map((i) =>
        i.id === item.id ? { ...i, stock: parseInt(e.target.value) } : i
      );
      setMenu({ ...menu, [category]: newItems });
    }}
  />
                    <button
                      className="btn"
                      onClick={() => handleUpdate(category, item)}
                    >
                      Update
                    </button>
                  </div>
                  <button
                    className="btn"
                    onClick={() => handleDelete(category, item.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
                                  }
