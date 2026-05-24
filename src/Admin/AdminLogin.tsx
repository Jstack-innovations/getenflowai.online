import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../Config/api";
import "./Css/AdminLogin.css";

type Admin = { id: number; email: string; password: string };

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);

  // Fetch admins
  useEffect(() => {
    fetch(`${API_BASE}/admin`)
      .then(res => res.json())
      .then(data => {
        console.log("Admins fetched:", data);
        setAdmins(data.admins || []);
      })
      .catch(err => console.error("Failed to fetch admins:", err));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/countdown`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "active") {
          const totalSeconds =
            data.remaining_days * 86400 +
            data.remaining_hours * 3600 +
            data.remaining_minutes * 60;
          setTimeLeft(totalSeconds);
        }
      })
      .catch(err => console.error("Countdown fetch failed:", err));
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    console.log("Logging in with:", { email, password });
    try {
      const res = await fetch(`${API_BASE}/adminLogin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      console.log("Login response:", data);
      if (data.success) {
    navigate("/");
} else if (data.error === "subscription_expired") {
    navigate("/plan"); // or your subscription page
} else {
    setError(data.error || "Invalid email or password");
}
    } catch (err) {
      console.error(err);
      setError("Login failed. Try again.");
    }
  };

  const days    = Math.floor(timeLeft / 86400);
  const hours   = Math.floor((timeLeft % 86400) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <>
      {/* ---- FIXED BANNER ---- */}
      <div className="login-banner">
        <div className="countdown">
          Free Trial Ends In: {days}d {hours}h {minutes}m {seconds}s
        </div>
        <button className="subscribe-btn" onClick={() => navigate("/plan")}>
          Subscribe to Premium Plan
        </button>
      </div>

      {/* ---- SPLIT LAYOUT ---- */}
      <div className="admin-login-wrapper">

        {/* LEFT — Branding */}
        <div className="login-left">
          <div className="grid-decor" />
          <div className="gold-rule" />
          <div className="left-brand">ARTISAN <span>GRILLS</span></div>
          <p className="left-tagline">
            Premium dining management.<br />Built for the people behind the flame.
          </p>
          <div className="left-stats">
            <div className="left-stat">
              <strong>Admin</strong>
              <span>Portal</span>
            </div>
            <div className="left-stat">
              <strong>v1.0</strong>
              <span>Dashboard</span>
            </div>
            <div className="left-stat">
              <strong>Live</strong>
              <span>System</span>
            </div>
          </div>
        </div>

        {/* RIGHT — Form */}
        <div className="login-right">
          <div className="login-box">

            <div className="form-heading">
              <h2>Welcome back</h2>
              <p>Sign in to your admin dashboard</p>
            </div>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="admin@artisangrills.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="field-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit">Sign In</button>
            </form>

            <div className="test-box">
              <h4>Admins (Test Mode)</h4>
              <div className="table-scroll">
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
        </div>

      </div>
    </>
  );
}
