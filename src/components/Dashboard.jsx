import { useEffect, useState } from "react";
import api from "../services/api";
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

    categoryData: [],
    topSellingData: [],
    revenueTrend: [],
    inventoryCategoryValue: [],

    lowStockItems: [],
  });

  const COLORS = [
    "#2563eb",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour < 12) setGreeting("Good Morning 👋");
    else if (hour < 18) setGreeting("Good Afternoon 👋");
    else setGreeting("Good Evening 👋");

    loadDashboard();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);

      setTimeout(() => {
        setSlide((prev) => (prev + 1) % 4);

        setFade(true);
      }, 400);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await api.get("/reports/dashboard");

      setStats({
        totalProducts: data.totalProducts || 0,

        lowStock: data.lowStockCount || data.lowStock?.length || 0,

        revenue: Number(data.totalRevenue || data.totalSales || 0),

        inventoryValue: Number(data.inventoryValue || 0),

        categoryData: data.categoryData || [],

        topSellingData: data.topSellingData || data.topProducts || [],

        revenueTrend: data.revenueTrend || [],

        inventoryCategoryValue: data.inventoryCategoryValue || [],

        lowStockItems: data.lowStock || [],
      });
    } catch (err) {
      console.log(err);
    }
  };

  const getTitle = () => {
    if (slide === 0) return "SALES BY CATEGORY";

    if (slide === 1) return "TOP SELLING PRODUCTS";

    if (slide === 2) return "REVENUE TREND";

    return "INVENTORY VALUE";
  };

  const renderChart = () => {
    if (slide === 0) {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={stats.categoryData}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={88}
              paddingAngle={4}
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

    if (slide === 1) {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.topSellingData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (slide === 2) {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stats.revenueTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#22c55e"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={stats.inventoryCategoryValue} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis type="number" />

          <YAxis dataKey="name" type="category" />

          <Tooltip />

          <Bar dataKey="value" fill="#f59e0b" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <section className="dashboard-section">
      <style>{`

      *{
        font-family:Inter,sans-serif;
      }

      .dashboard-section{
        padding:20px;
        background:#f8fafc;
        min-height:100vh;
      }

      .top-header{
        margin-bottom:20px;
      }

      .dashboard-title{
        font-size:32px;
        font-weight:800;
        color:#0f172a;
      }

      .dashboard-sub{
        color:#64748b;
        margin-top:5px;
        font-size:13px;
      }

      .stat-grid{
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(210px,1fr));
        gap:16px;
        margin-top:20px;
        margin-bottom:20px;
      }

      .stat-card{
        background:#ffffff;

        border-radius:18px;

        padding:20px;

        border:1px solid #e5e7eb;

        transition:.25s ease;
      }

      .stat-card:hover{
        transform:translateY(-3px);
      }

      .stat-top{
        display:flex;
        align-items:center;
        justify-content:space-between;
      }

      .stat-label{
        font-size:13px;
        font-weight:600;
        color:#64748b;
      }

      .stat-icon{
        width:42px;
        height:42px;

        border-radius:12px;

        display:flex;
        align-items:center;
        justify-content:center;

        font-size:18px;
      }

      .blue{
        background:rgba(37,99,235,.12);
      }

      .green{
        background:rgba(34,197,94,.12);
      }

      .red{
        background:rgba(239,68,68,.12);
      }

      .orange{
        background:rgba(245,158,11,.12);
      }

      .stat-value{
        margin-top:18px;

        font-size:28px;

        font-weight:800;

        color:black;
      }

      .safe{
        color:#16a34a;
      }

      .danger{
        color:#dc2626;
      }

      .middle-grid{
        display:grid;
        grid-template-columns:1.4fr .9fr;
        gap:18px;
      }

      .dashboard-card{
        background:#ffffff;

        border:1px solid #e5e7eb;

        border-radius:18px;

        padding:18px;
      }

      .card-title{
        font-size:15px;
        font-weight:800;
        color:#111827;
        margin-bottom:16px;
      }

      .chart-box{
        height:300px;
        transition:.4s ease;
      }

      .fade-out{
        opacity:0;
        transform:scale(.97);
      }

      .low-stock-box{
        display:flex;
        align-items:center;
        justify-content:space-between;

        background:#fff5f5;

        border:1px solid #0f172a;

        border-radius:14px;

        padding:14px;

        margin-bottom:14px;

        transition:.25s ease;
      }

      .low-stock-box:hover{
        transform:translateX(3px);
      }
      
      .dark-theme .low-stock-box{

        background:#0f172a;

        border:1px solid #1e293b;

      }
        .dark-theme .low-name{
        color:#f9fafb;
      }

      .dark-theme .dashboard-card{
        background:#111827;
        border:1px solid #1f2937;
      }

      .dark-theme .card-title{
        color:#f9fafb;
      }

      .dark-theme .dashboard-title{
        color:#f9fafb;
      }

      .dark-theme .dashboard-sub{
        color:#9ca3af;
      }

      .dark-theme .stat-card{
        background:#111827;
        border:1px solid #1f2937;
      }

      .dark-theme .stat-label{
        color:#9ca3af;
      }

      .dark-theme .stat-value{
        color:#f9fafb;
      }
      .low-name{
        font-size:14px;
        font-weight:700;
        color:#111827;
      }

      .low-left{
        margin-top:5px;
        font-size:12px;
        color:#ef4444;
      }

      .stock-bar{
        width:140px;
        height:6px;

        background:#fee2e2;

        border-radius:20px;

        overflow:hidden;

        margin-top:10px;
      }

      .stock-fill{
        height:100%;
        background:#ef4444;
      }

      .restock-btn{
        border:none;

        background:#16a34a;

        color:#fff;

        padding:9px 14px;

        border-radius:10px;

        font-size:12px;

        font-weight:700;

        cursor:pointer;

        transition:.25s ease;
      }

      .restock-btn:hover{
        transform:scale(1.03);
      }

      @media(max-width:1000px){

        .middle-grid{
          grid-template-columns:1fr;
        }

      }

      @media(max-width:700px){

        .dashboard-section{
          padding:14px;
        }

        .dashboard-title{
          font-size:26px;
        }

        .stat-value{
          font-size:23px;
        }

        .chart-box{
          height:260px;
        }

      }

      `}</style>

      <div className="top-header">
        <div className="dashboard-title">Dashboard</div>

        <div className="dashboard-sub">
          {greeting} Here's your inventory overview.
        </div>
      </div>

      {/* STATS */}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-label">Total Products</div>

            <div className="stat-icon blue">📦</div>
          </div>

          <div className="stat-value">{stats.totalProducts}</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-label">Low Stock</div>

            <div className="stat-icon red">⚠</div>
          </div>

          <div className="stat-value danger">{stats.lowStock}</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-label">Revenue</div>

            <div className="stat-icon green">💰</div>
          </div>

          <div className="stat-value safe">
            ₹{Number(stats.revenue).toFixed(2)}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-label">Inventory Value</div>

            <div className="stat-icon orange">📊</div>
          </div>

          <div className="stat-value">
            ₹{Number(stats.inventoryValue).toFixed(2)}
          </div>
        </div>
      </div>

      {/* CHART + ALERTS */}

      <div className="middle-grid">
        {/* CHART */}

        <div className="dashboard-card">
          <div className="card-title">{getTitle()}</div>

          <div className={`chart-box ${fade ? "" : "fade-out"}`}>
            {renderChart()}
          </div>
        </div>

        {/* LOW STOCK */}

        <div className="dashboard-card">
          <div className="card-title">🚨 LOW STOCK ALERTS</div>

          {stats.lowStockItems.map((item, i) => (
            <div className="low-stock-box" key={i}>
              <div>
                <div className="low-name">{item.name}</div>

                <div className="low-left">Only {item.stock} left</div>

                <div className="stock-bar">
                  <div
                    className="stock-fill"
                    style={{
                      width: `${Math.min(item.stock * 10, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <button
                className="restock-btn"
                onClick={() => {
                  localStorage.setItem("activePage", "procurement");

                  window.location.reload();
                }}
              >
                Restock
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
