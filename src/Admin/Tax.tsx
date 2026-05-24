import { useEffect, useState } from "react";  
import { useNavigate } from "react-router-dom";  
import "./Css/Tax.css";  
import { API_BASE } from "../Config/api";  
  
type Tax = {  
  tax: number;  
  delivery_fee: number;  
  service_fee: number;  
};  
  
export default function TaxPage() {  
  const navigate = useNavigate();  
  const [tax, setTax] = useState<Tax>({  
    tax: 0,  
    delivery_fee: 0,  
    service_fee: 0  
  });  
  
  // ✅ Guarded GET
  const [authChecked, setAuthChecked] = useState(false);

const fetchTax = async () => {
  try {
    const res = await fetch(`${API_BASE}/getTax`, { credentials: "include" });
    const data = await res.json();
    if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
      navigate("/login", { replace: true });
      return;
    }
    setTax(data);
    setAuthChecked(true);
  } catch (err) {
    console.error("Failed to fetch tax:", err);
  }
};
  
  useEffect(() => {  
    fetchTax();  
  }, []);  
  
  // ✅ Guarded UPDATE
  const updateTax = async () => {  
    try {
      const res = await fetch(`${API_BASE}/adminUpdateTax`, {  
        method: "PUT",  
        credentials: "include",
        headers: { "Content-Type": "application/json" },  
        body: JSON.stringify({  
          action: "update",  
          tax: tax.tax,  
          delivery_fee: tax.delivery_fee,  
          service_fee: tax.service_fee  
        })  
      });  

      const data = await res.json();

      if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
        navigate("/login", { replace: true });
        return;
      }

      fetchTax();  
    } catch (err) {
      console.error("Failed to update tax:", err);
    }
  };  
  
  // ✅ Guarded DELETE / Reset
  const resetTax = async () => {  
    try {
      const res = await fetch(`${API_BASE}/adminUpdateTax`, {  
        method: "PUT",  
        credentials: "include",
        headers: { "Content-Type": "application/json" },  
        body: JSON.stringify({ action: "delete" })  
      });  

      const data = await res.json();

      if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
        navigate("/login", { replace: true });
        return;
      }

      fetchTax();  
    } catch (err) {
      console.error("Failed to reset tax:", err);
    }
  };  
  
  if (!authChecked) return null;

return (
  <div className="tax-page">
      <div className="tax-container">  
        <h1>Tax Management</h1>  

        <div className="tax-values">  
          <p><strong>Tax:</strong> {tax.tax}</p>  
          <p><strong>Delivery Fee:</strong> {tax.delivery_fee}</p>  
          <p><strong>Service Fee:</strong> {tax.service_fee}</p>  
        </div>  

        <input  
          type="number"  
          step="0.01"  
          value={tax.tax}  
          onChange={(e) => setTax({ ...tax, tax: Number(e.target.value) })}  
          placeholder="Tax"  
        />  

        <input  
          type="number"  
          step="0.01"  
          value={tax.delivery_fee}  
          onChange={(e) => setTax({ ...tax, delivery_fee: Number(e.target.value) })}  
          placeholder="Delivery Fee"  
        />  

        <input  
          type="number"  
          step="0.01"  
          value={tax.service_fee}  
          onChange={(e) => setTax({ ...tax, service_fee: Number(e.target.value) })}  
          placeholder="Service Fee"  
        />  

        <button className="update-btn" onClick={updateTax}>  
          Update Settings  
        </button>  

        <button className="delete-btn" onClick={resetTax}>  
          Reset All  
        </button>  
      </div>  
    </div>  
  );  
}
