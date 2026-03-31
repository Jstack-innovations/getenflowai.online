import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";
import "./BusinessAnalytics.css";

const COLORS = ["#d4af37", "#111", "#a0522d"];

export default function BusinessIntelligence() {
  
  const navigate = useNavigate();
  
const [menuOpen, setMenuOpen] = useState(false);

  
  // ===== REVENUE DATA FROM BACKEND =====
  const [revenueData, setRevenueData] = useState([]);
  
  const [hourlyRevenue, setHourlyRevenue] = useState([]);
  
  const [orderTypes, setOrderTypes] = useState([]);
  
const [topItems, setTopItems] = useState([]);

const [sendingReport, setSendingReport] = useState(false);

const handleSendReport = async () => {
  setSendingReport(true); // start sending
  try {
    const res = await fetch(
      "https://artisangrills-production.up.railway.app/sendReport",
      { method: "GET", credentials: "include" }
    );

    if (res.status === 401) {        // ✅ check 401
      navigate("/login", { replace: true });
      return;
    }

    if (res.ok) {
      alert("✅ Report sent successfully!");
    } else {
      alert("⚠️ Failed to send report. Status: " + res.status);
    }
  } catch (err) {
    console.error(err);
    alert("⚠️ Error sending report. Check console for details.");
  } finally {
    setSendingReport(false);
  }
};


useEffect(() => {
  const fetchAnalytics = async () => {
    try {
      const res = await fetch("https://artisangrills-production.up.railway.app/getAnalytics", {
        credentials: "include",
      });

      if (res.status === 401) {       // ✅ check 401
        navigate("/login", { replace: true });
        return;
      }

      const data = await res.json();

      setRevenueData(data.dailyRevenue || []);
      setHourlyRevenue(data.hourlyRevenue || []);

      const ordersArray = Object.values(data.orders || {});

      // Order Types
      const typesCount = ordersArray.reduce((acc, order) => {
        const type = order.info.order_type || "unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      setOrderTypes(
        Object.keys(typesCount).map((type) => ({ name: type, value: typesCount[type] }))
      );

      // Top Items
      const itemsCount: Record<string, number> = {};
      ordersArray.forEach((order) =>
        order.items.forEach((item) => {
          itemsCount[item.name] = (itemsCount[item.name] || 0) + item.qty;
        })
      );
      setTopItems(
        Object.keys(itemsCount).map((name) => ({ name, sales: itemsCount[name] }))
      );

    } catch (err) {
      console.error(err);
      navigate("/login", { replace: true }); // fallback redirect
    }
  };

  fetchAnalytics();
}, [navigate]);
  

  

  // ===== SMART INSIGHTS CALCULATIONS =====
const todayRevenue = revenueData?.[revenueData.length - 1]?.revenue || 0;
const yesterdayRevenue = revenueData?.[revenueData.length - 2]?.revenue || 0;

const salesChangePercent = yesterdayRevenue
  ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
  : 0;

const lunchHours = ["12PM", "1PM", "2PM"];
const thisWeekLunchRevenue = hourlyRevenue
  .filter((h) => lunchHours.includes(h.hour))
  .reduce((sum, h) => sum + h.revenue, 0);

const lastWeekLunchRevenue = 300000;
const lunchChangePercent = lastWeekLunchRevenue
  ? ((thisWeekLunchRevenue - lastWeekLunchRevenue) / lastWeekLunchRevenue) * 100
  : 0;

const totalSales = topItems.reduce((sum, item) => sum + item.sales, 0);
const highestItem = topItems.reduce((max, item) =>
  item.sales > max.sales ? item : max,
  { sales: 0, name: "" } // default max
);
const highestItemPercent = totalSales
  ? (highestItem.sales / totalSales) * 100
  : 0;

const ordersToday = orderTypes.reduce((sum, type) => sum + type.value, 0);

// ===== FINANCIAL METRICS =====
const grossRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0);
const costPercentage = 0.65;
const estimatedCost = grossRevenue * costPercentage;
const estimatedProfit = grossRevenue - estimatedCost;
const profitMargin = grossRevenue ? (estimatedProfit / grossRevenue) * 100 : 0;

  const handlePrint = () => {
    window.print();
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
      </nav>

      <button
        className="logout-link"
        onClick={() => navigate("/logout")}
        style={{
          all: "unset",
          cursor: "pointer",
          display: "flex",
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
    </div>

    <div className="bi-wrapper">

        <button className="export-btn" onClick={handlePrint}>
          Export as PDF
        </button>
        
        <button
  className="send-report-btn"
  onClick={handleSendReport}
  disabled={sendingReport} // prevent double clicks
>
  {sendingReport ? "Sending..." : "Send WhatsApp Report"}
</button>



      <h2 className="bi-title">Business Intelligence Dashboard</h2>

{/* ===== KPI CARDS ===== */}
<div className="bi-cards">

  <div className="bi-card">
    <h4>Total Revenue</h4>
    <p>₦{grossRevenue.toLocaleString()}</p> {/* backend total revenue */}
    <span className="positive">
      {salesChangePercent >= 0 
        ? `+${salesChangePercent.toFixed(1)}%` 
        : `${salesChangePercent.toFixed(1)}%`}
    </span>
  </div>

  <div className="bi-card">
    <h4>Total Orders</h4>
    <p>{ordersToday}</p>
    <span className="positive">+8%</span> {/* You can calculate % if needed */}
  </div>

  <div className="bi-card">
    <h4>Average Order Value</h4>
    <p>
      ₦{ordersToday ? Math.round(grossRevenue / ordersToday).toLocaleString() : 0}
    </p>
    <span className="positive">+5%</span>
  </div>

  <div className="bi-card">
    <h4>Gross Revenue</h4>
    <p>₦{grossRevenue.toLocaleString()}</p>
  </div>

  <div className="bi-card">
    <h4>Estimated Cost</h4>
    <p>₦{estimatedCost.toLocaleString()}</p>
  </div>

  <div className="bi-card">
    <h4>Estimated Profit</h4>
    <p>₦{estimatedProfit.toLocaleString()}</p>
  </div>

  <div className="bi-card">
    <h4>Profit Margin</h4>
    <p>{profitMargin.toFixed(1)}%</p>
  </div>

</div>





      {/* LOWER SECTION */}
<div className="bi-chart">
  <h3>Top Selling Items</h3>
  <div className="chart-scroll">
    <div style={{ minWidth: 800, height: 250 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={topItems}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sales" fill="#a0522d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>





      {/* REVENUE CHART */}
      <div className="bi-chart">
        <h3>Revenue - Last 7 Days</h3>
        <div className="chart-scroll">
          <ResponsiveContainer width={800} height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#d4af37"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>



      <div className="bi-insights">
        <h3>Smart Insights</h3>

       <div className="insight-card">
  <strong
    style={{
      color: salesChangePercent > 0 ? "greenyellow" : "inherit"
    }}
  >
    Sales {salesChangePercent >= 0 ? "increased" : "decreased"} by{" "}
    {Math.abs(salesChangePercent).toFixed(1)}%
  </strong>
  <p>Compared to yesterday</p>
</div>


       <div className="insight-card">
  <strong
    style={{
      color: lunchChangePercent < 0 ? "red" : "inherit"
    }}
  >
    Lunch revenue {lunchChangePercent >= 0 ? "increased" : "dropped"}{" "}
    by {Math.abs(lunchChangePercent).toFixed(1)}%
  </strong>
  <p>Compared to last week</p>
</div>

        <div className="insight-card">
  <strong style={{ color: "yellow" }}>
    {highestItem.name} generated {highestItemPercent.toFixed(1)}% of
    total sales
  </strong>
  <p>Highest selling item this week</p>
</div>

        <div className="insight-card">
          <strong>{ordersToday} orders</strong>
          <p>Were placed today</p>
        </div>
      </div>
      
      
            <div className="bi-chart">
        <h3>Revenue by Hour (Today)</h3>
        <div className="chart-scroll">
          <ResponsiveContainer width={1000} height={300}>
            <LineChart data={hourlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#111"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      
      
      
<div className="bi-chart">
  <h3>Order Types</h3>
  <div style={{ width: "100%", height: 250 }}>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={orderTypes} dataKey="value" outerRadius={90}>
          {orderTypes.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>



<div className="bi-chart">
  <h3>Revenue vs Cost - Last 7 Days</h3>
  <div className="chart-scroll">
    <div style={{ minWidth: 1200, height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={revenueData.map(day => ({
          day: day.day,
          revenue: day.revenue,
          cost: day.revenue * costPercentage
        }))}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" angle={-30} textAnchor="end" interval={0} />
          <YAxis />
          <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
          <Legend />
          <Bar dataKey="revenue" fill="#d4af37" radius={[6, 6, 0, 0]} />
          <Bar dataKey="cost" fill="#a0522d" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>

    </div>
    </>
  );
}
