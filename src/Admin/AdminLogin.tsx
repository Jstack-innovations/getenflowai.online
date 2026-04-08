import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../Config/api";
import "./Css/AdminLogin.css";

type Admin = { id: number; email: string; password: string };

export default function Login() {

  const navigate = useNavigate();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [admins,setAdmins] = useState<Admin[]>([]);

  // Fetch admins
  useEffect(() => {

    fetch(`${API_BASE}/admin`)
      .then(res => res.json())
      .then(data => {
        console.log("Admins fetched:",data);
        setAdmins(data.admins || []);
      })
      .catch(err => console.error("Failed to fetch admins:",err));

  },[]);

  const handleSubmit = async (e:React.FormEvent) => {

    e.preventDefault();
    setError("");

    console.log("Logging in with:",{email,password});

    try{

      const res = await fetch(`${API_BASE}/adminLogin`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
  credentials: "include" // must be include for cookies
});

      const data = await res.json();
      console.log("Login response:",data);

      if(data.success){
        navigate("/");
      }else{
        setError(data.error || "Invalid email or password");
      }

    }catch(err){

      console.error(err);
      setError("Login failed. Try again.");

    }

  };

  return(

   <div className="admin-login-wrapper">

       {/* Floating Subscribe Button */}
  <button
    onClick={() => navigate("/subscribe")}
    style={{
      position: "fixed",      // stays on top of everything
      top: "10px",            // distance from top
      right: "10px",          // distance from right
      padding: "0.5rem 1rem",
      backgroundColor: "#d6a86a",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      zIndex: 9999            // ensure it’s above all other elements
    }}
  >
    Subscribe to our Premium Plan
  </button>

     
  <div className="login-box">
    <div className="brand">ARTISAN <span>GRILLS</span></div>
    {error && <div className="error">{error}</div>}
    <form onSubmit={handleSubmit}>
      <label>Email</label>
      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
      <label>Password</label>
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
      <button type="submit">Login</button>
    </form>
    <div className="test-box">
      <h4 style={{ color: "#d6a86a" }}>Admins (Test Mode)</h4>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Password</th>
          </tr>
        </thead>
        <tbody>
          {admins.map(a => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>{a.email}</td>
              <td>{a.password}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>

  );

}
