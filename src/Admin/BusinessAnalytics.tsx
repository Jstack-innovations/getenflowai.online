import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";
import {
  FiDollarSign, FiShoppingBag, FiTrendingUp, FiBarChart2,
  FiMinusCircle, FiPlusCircle, FiPercent
} from "react-icons/fi";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./Css/BusinessAnalytics.css";
import { API_BASE } from "../Config/api";

interface RevenueDay { day: string; revenue: number; }
interface HourlyRevenue { hour: string; revenue: number; }
interface OrderType { name: string; value: number; }
interface TopItem { name: string; sales: number; }
interface OrderItem { name: string; qty: number; }
interface Order { info: { order_type: string }; items: OrderItem[]; }

const COLORS = ["#d4af37", "#4ade80", "#a0522d"];

const NAV_LINKS = [
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
];

export default function BusinessIntelligence() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const [revenueData, setRevenueData] = useState<RevenueDay[]>([]);
  const [hourlyRevenue, setHourlyRevenue] = useState<HourlyRevenue[]>([]);
  const [orderTypes, setOrderTypes] = useState<OrderType[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [sendingReport, setSendingReport] = useState(false);

  const handleSendReport = async () => {
    setSendingReport(true);
    try {
      const res = await fetch(`${API_BASE}/sendTelegramReport`, { method: "GET", credentials: "include" });
      if (res.status === 401) { navigate("/login", { replace: true }); return; }
      alert(res.ok ? "✅ Report sent successfully!" : "⚠️ Failed to send report. Status: " + res.status);
    } catch (err) {
      console.error(err);
      alert("⚠️ Error sending report.");
    } finally {
      setSendingReport(false);
    }
  };

  const [authChecked, setAuthChecked] = useState(false);

useEffect(() => {
  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/getAnalytics`, { credentials: "include" });
      if (res.status === 401) { navigate("/login", { replace: true }); return; }
      const data = await res.json();
      setRevenueData(data.dailyRevenue || []);
      setHourlyRevenue(data.hourlyRevenue || []);
      const ordersArray = Object.values(data.orders || {}) as Order[];
      const typesCount = ordersArray.reduce<Record<string, number>>((acc, order) => {
        const type = order.info.order_type || "unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      setOrderTypes(Object.keys(typesCount).map((type) => ({ name: type, value: typesCount[type] })));
      const itemsCount: Record<string, number> = {};
      ordersArray.forEach((order) => order.items.forEach((item) => { itemsCount[item.name] = (itemsCount[item.name] || 0) + item.qty; }));
      setTopItems(Object.keys(itemsCount).map((name) => ({ name, sales: itemsCount[name] })));
      setAuthChecked(true);
    } catch (err) {
      console.error(err);
      navigate("/login", { replace: true });
    }
  };
  fetchAnalytics();
}, [navigate]);

  const todayRevenue = revenueData?.[revenueData.length - 1]?.revenue || 0;
  const yesterdayRevenue = revenueData?.[revenueData.length - 2]?.revenue || 0;
  const salesChangePercent = yesterdayRevenue ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;

  const lunchHours = ["12PM", "1PM", "2PM"];
  const thisWeekLunchRevenue = hourlyRevenue.filter((h) => lunchHours.includes(h.hour)).reduce((sum, h) => sum + h.revenue, 0);
  const lastWeekLunchRevenue = 300000;
  const lunchChangePercent = lastWeekLunchRevenue ? ((thisWeekLunchRevenue - lastWeekLunchRevenue) / lastWeekLunchRevenue) * 100 : 0;

  const totalSales = topItems.reduce((sum, item) => sum + item.sales, 0);
  const highestItem = topItems.reduce((max, item) => item.sales > max.sales ? item : max, { sales: 0, name: "" });
  const highestItemPercent = totalSales ? (highestItem.sales / totalSales) * 100 : 0;

  const ordersToday = orderTypes.reduce((sum, type) => sum + type.value, 0);
  const grossRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0);
  const costPercentage = 0.65;
  const estimatedCost = grossRevenue * costPercentage;
  const estimatedProfit = grossRevenue - estimatedCost;
  const profitMargin = grossRevenue ? (estimatedProfit / grossRevenue) * 100 : 0;

  const nairaFormatter = (value: any) => {
    if (Array.isArray(value)) return value.map((v) => `₦${Number(v).toLocaleString()}`).join(", ");
    if (value !== undefined && value !== null) return `₦${Number(value).toLocaleString()}`;
    return "-";
  };

  const iconStyle = { fontSize: 18 };
  
  if (!authChecked) return null;

  return (
    <div className="admin-layout">

      <aside className="sidebar">
        <div className="brand">ARTISAN <span>GRILLS</span></div>
        {NAV_LINKS.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}
        <button className="logout-link" onClick={() => navigate("/logout")}>
          <span>⎋</span> Logout
        </button>
      </aside>

      <header className="orderMobile-header">
        <div className="brand">ARTISAN <span>GRILLS</span></div>
        <button
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span/><span/><span/>
        </button>
      </header>

      <div
        className="mob-backdrop"
        style={{ display: menuOpen ? "block" : "none", opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? "all" : "none" }}
        onClick={() => setMenuOpen(false)}
      />
      <nav className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        {NAV_LINKS.map(l => (
          <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
        ))}
        <button className="logout-link" onClick={() => navigate("/logout")}>
          <span>⎋</span> Logout
        </button>
      </nav>

      <main className="main-content">

<button className="export-btn" onClick={async () => {
  const el = document.querySelector(".main-content") as HTMLElement;
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    scrollY: -window.scrollY,
    windowWidth: el.scrollWidth,
    windowHeight: el.scrollHeight,
    width: el.scrollWidth,
    height: el.scrollHeight,
  });
  const img = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgHeight = (canvas.height * pageWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(img, "PNG", 0, position, pageWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(img, "PNG", 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save("business-report.pdf");
}}>
  Export as PDF
</button>

        <button className="send-report-btn" onClick={handleSendReport} disabled={sendingReport}>
          {sendingReport ? "Sending..." : "Send Telegram Report"}
        </button>

        <h2 className="bi-title">Business Intelligence Dashboard</h2>

        <div className="bi-cards">
          <div className="bi-card">
            <div className="bi-card-top">
              <h4>Total Revenue</h4>
              <div className="bi-card-icon"><FiDollarSign style={iconStyle} /></div>
            </div>
            <p>₦{grossRevenue.toLocaleString()}</p>
            <span className="positive">{salesChangePercent >= 0 ? `+${salesChangePercent.toFixed(1)}%` : `${salesChangePercent.toFixed(1)}%`} vs yesterday</span>
          </div>
          <div className="bi-card">
            <div className="bi-card-top">
              <h4>Total Orders</h4>
              <div className="bi-card-icon"><FiShoppingBag style={iconStyle} /></div>
            </div>
            <p>{ordersToday}</p>
            <span className="positive">+8% this week</span>
          </div>
          <div className="bi-card">
            <div className="bi-card-top">
              <h4>Avg Order Value</h4>
              <div className="bi-card-icon"><FiTrendingUp style={iconStyle} /></div>
            </div>
            <p>₦{ordersToday ? Math.round(grossRevenue / ordersToday).toLocaleString() : 0}</p>
            <span className="positive">+5% this week</span>
          </div>
          <div className="bi-card">
            <div className="bi-card-top">
              <h4>Gross Revenue</h4>
              <div className="bi-card-icon"><FiBarChart2 style={iconStyle} /></div>
            </div>
            <p>₦{grossRevenue.toLocaleString()}</p>
          </div>
          <div className="bi-card">
            <div className="bi-card-top">
              <h4>Estimated Cost</h4>
              <div className="bi-card-icon"><FiMinusCircle style={iconStyle} /></div>
            </div>
            <p>₦{estimatedCost.toLocaleString()}</p>
          </div>
          <div className="bi-card">
            <div className="bi-card-top">
              <h4>Estimated Profit</h4>
              <div className="bi-card-icon"><FiPlusCircle style={iconStyle} /></div>
            </div>
            <p>₦{estimatedProfit.toLocaleString()}</p>
          </div>
          <div className="bi-card">
            <div className="bi-card-top">
              <h4>Profit Margin</h4>
              <div className="bi-card-icon"><FiPercent style={iconStyle} /></div>
            </div>
            <p>{profitMargin.toFixed(1)}%</p>
          </div>
        </div>

        <div className="bi-chart">
          <h3>Top Selling Items</h3>
          <div className="chart-scroll">
            <BarChart width={800} height={250} data={topItems}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#a0522d" />
            </BarChart>
          </div>
        </div>

        <div className="bi-chart">
          <h3>Revenue — Last 7 Days</h3>
          <div className="chart-scroll">
            <LineChart width={800} height={300} data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={nairaFormatter} />
              <Line type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={3} />
            </LineChart>
          </div>
        </div>

        <div className="bi-insights">
          <h3>Smart Insights</h3>
          <div className="insight-card">
            <strong style={{ color: salesChangePercent > 0 ? "greenyellow" : "inherit" }}>
              Sales {salesChangePercent >= 0 ? "increased" : "decreased"} by {Math.abs(salesChangePercent).toFixed(1)}%
            </strong>
            <p>Compared to yesterday</p>
          </div>
          <div className="insight-card">
            <strong style={{ color: lunchChangePercent < 0 ? "red" : "inherit" }}>
              Lunch revenue {lunchChangePercent >= 0 ? "increased" : "dropped"} by {Math.abs(lunchChangePercent).toFixed(1)}%
            </strong>
            <p>Compared to last week</p>
          </div>
          <div className="insight-card">
            <strong style={{ color: "yellow" }}>
              {highestItem.name} generated {highestItemPercent.toFixed(1)}% of total sales
            </strong>
            <p>Highest selling item this week</p>
          </div>
          <div className="insight-card">
            <strong>{ordersToday} orders placed today</strong>
            <p>Across all order types</p>
          </div>
        </div>

        <div className="bi-chart">
          <h3>Revenue by Hour (Today)</h3>
          <div className="chart-scroll">
            <LineChart width={1000} height={300} data={hourlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip formatter={nairaFormatter} />
              <Line type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </div>
        </div>

        <div className="bi-chart">
          <h3>Order Types</h3>
          <PieChart width={400} height={250}>
            <Pie data={orderTypes} dataKey="value" outerRadius={90}>
              {orderTypes.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </div>

        <div className="bi-chart">
          <h3>Revenue vs Cost — Last 7 Days</h3>
          <div className="chart-scroll">
            <BarChart width={1200} height={350} data={revenueData.map((day) => ({
              day: day.day,
              revenue: day.revenue,
              cost: day.revenue * costPercentage,
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" angle={-30} textAnchor="end" interval={0} />
              <YAxis />
              <Tooltip formatter={nairaFormatter} />
              <Legend />
              <Bar dataKey="revenue" fill="#d4af37" radius={[6, 6, 0, 0]} />
              <Bar dataKey="cost" fill="#a0522d" radius={[6, 6, 0, 0]} />
            </BarChart>
          </div>
        </div>

      </main>
    </div>
  );
}
