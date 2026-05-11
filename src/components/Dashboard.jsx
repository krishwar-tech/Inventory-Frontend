import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

function Dashboard() {
  const [greeting, setGreeting] = useState("");

  const [slide, setSlide] = useState(0);

  const [fade, setFade] = useState(true);

  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    revenue: 0,
    inventoryValue: 0,
    transactions: 0,

    categoryData: [],
    topSellingData: [],
    revenueTrend: [],
    inventoryCategoryValue: [],

    lowStockItems: [],
  });

  const COLORS = [
    "#22c55e",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#14b8a6",
    "#ec4899",
  ];

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour < 12) setGreeting("Good morning!");
    else if (hour < 18) setGreeting("Good afternoon!");
    else setGreeting("Good evening!");

    loadDashboard();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);

      setTimeout(() => {
        setSlide((prev) => (prev + 1) % 4);
        setFade(true);
      }, 500);
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await fetch("https://inventory-backend-final-1.onrender.com/api/reports/dashboard");
      const data = await res.json();

      setStats({
        // ✅ FIXED MAPPING
        totalProducts: data.totalProducts || 0,

        lowStock: data.lowStockCount || data.lowStock?.length || 0,

        revenue: Number(data.totalRevenue || data.totalSales || 0),

        inventoryValue: Number(data.inventoryValue || 0),

        transactions: data.transactions || 0,

        // ✅ CHART FIXES
        categoryData: data.categoryData || [],

        topSellingData: data.topSellingData || data.topProducts || [],

        revenueTrend: data.revenueTrend || [],

        inventoryCategoryValue: data.inventoryCategoryValue || [],

        // ✅ LOW STOCK FIX
        lowStockItems: data.lowStock || [],
      });
    } catch (err) {
      console.log(err);
    }
  };

  const getTitle = () => {
    if (slide === 0) return "📊 SALES BY CATEGORY";
    if (slide === 1) return "📈 TOP SELLING PRODUCTS";
    if (slide === 2) return "📉 REVENUE TREND";
    return "💰 INVENTORY VALUE";
  };

  const renderChart = () => {
    /* PIE */
    if (slide === 0) {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={stats.categoryData}
              dataKey="value"
              nameKey="name"
              innerRadius={65}
              outerRadius={105}
              label
            >
              {stats.categoryData.map((item, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    /* BAR */
    if (slide === 1) {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.topSellingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#22c55e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    /* LINE */
    if (slide === 2) {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stats.revenueTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    /* VALUE BAR */
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={stats.inventoryCategoryValue} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" />
          <Tooltip />
          <Bar dataKey="value" fill="#f59e0b" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <section className="section active">
      <style>{`
        .dash-hover{
          transition:all .25s ease;
          cursor:pointer;
        }

        .dash-hover:hover{
          transform:translateY(-6px) scale(1.01);
          box-shadow:0 18px 35px rgba(0,0,0,.18);
          border-color:#22c55e;
        }

        .stat-grid{
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
          gap:18px;
          margin-bottom:22px;
        }

        .two-col{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:22px;
          margin-bottom:22px;
        }

        .chart-box{
          height:330px;
          margin-top:10px;
          transition:all .6s ease;
          opacity:1;
        }

        .chart-box.fade-out{
          opacity:0;
          transform:scale(.96);
        }

        .low-stock-box{
          display:flex;
          justify-content:space-between;
          align-items:center;
          background:rgba(239,68,68,.12);
          border:1px solid rgba(239,68,68,.35);
          border-radius:14px;
          padding:16px 18px;
          margin-bottom:14px;
        }

        .low-name{
          color:var(--text);
          font-weight:700;
        }

        .low-left{
          color:#f87171;
          font-size:13px;
          margin-top:4px;
        }

        .restock-btn{
          border:none;
          background:#16a34a;
          color:#fff;
          padding:10px 16px;
          border-radius:10px;
          font-weight:700;
          cursor:pointer;
        }

        @media(max-width:900px){
          .two-col{
            grid-template-columns:1fr;
          }
        }
      `}</style>

      <div>
        <div className="page-title">Dashboard</div>

        <div className="page-sub">{greeting} Here's your store overview.</div>

        <br />
      </div>

      {/* TOP */}
      <div className="stat-grid">
        <div className="stat-card dash-hover">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{stats.totalProducts}</div>
        </div>

        <div className="stat-card dash-hover">
          <div className="stat-label">Low Stock</div>
          <div className="stat-value danger">{stats.lowStock}</div>
        </div>

        <div className="stat-card dash-hover">
          <div className="stat-label">Revenue</div>
          <div className="stat-value safe">
            ₹{Number(stats.revenue).toFixed(2)}
          </div>
        </div>

        <div className="stat-card dash-hover">
          <div className="stat-label">Inventory Value</div>
          <div className="stat-value">
            ₹{Number(stats.inventoryValue).toFixed(2)}
          </div>
        </div>
      </div>

      {/* MIDDLE */}
      <div className="two-col">
        <div className="card dash-hover">
          <div className="card-title">{getTitle()}</div>

          <div className={`chart-box ${fade ? "" : "fade-out"}`}>
            {renderChart()}
          </div>
        </div>

        <div className="card dash-hover">
          <div className="card-title">🚨 LOW STOCK ALERTS</div>

          {stats.lowStockItems.map((item, i) => (
            <div className="low-stock-box" key={i}>
              <div>
                <div className="low-name">{item.name}</div>
                <div className="low-left">Only {item.stock} left</div>
              </div>

              <button className="restock-btn">Restock</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
