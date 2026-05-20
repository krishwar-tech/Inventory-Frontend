import { useEffect, useState } from "react";
import api from "../services/api";

function Topbar({ logout }) {
  const [lowStockCount, setLowStockCount] = useState(0);

  const [time, setTime] = useState("");

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark",
  );

  useEffect(() => {
    loadLowStock();

    updateTime();

    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-theme");

      document.body.style.background = "#0f172a";
    } else {
      document.body.classList.remove("dark-theme");

      document.body.style.background = "#f8fafc";
    }

    localStorage.setItem("theme", darkMode ? "dark" : "light");

    applyDashboardTheme();
  }, [darkMode]);

  // LOW STOCK FUNCTION
  const loadLowStock = async () => {
    try {
      const data = await api.get("/products");

      if (Array.isArray(data)) {
        const lowStock = data.filter(
          (item) => Number(item.stockQuantity || item.stock || 0) < 10,
        );

        setLowStockCount(lowStock.length);
      } else {
        setLowStockCount(0);
      }
    } catch (error) {
      console.log(error);

      setLowStockCount(0);
    }
  };

  const updateTime = () => {
    const now = new Date();

    const currentTime = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setTime(currentTime);
  };

  const applyDashboardTheme = () => {
    const cards = document.querySelectorAll(
      ".stat-card,.dashboard-card,.card",
    );

    const dashboard = document.querySelector(".dashboard-section");

    const title = document.querySelector(".dashboard-title");

    const sub = document.querySelector(".dashboard-sub");

    if (darkMode) {
      cards.forEach((card) => {
        card.style.background = "#111827";

        card.style.border = "1px solid #1f2937";

        card.style.boxShadow = "none";
      });

      if (dashboard) {
        dashboard.style.background = "#0f172a";
      }

      if (title) {
        title.style.color = "#f9fafb";
      }

      if (sub) {
        sub.style.color = "#9ca3af";
      }
    } else {
      cards.forEach((card) => {
        card.style.background = "#ffffff";

        card.style.border = "1px solid #e5e7eb";

        card.style.boxShadow = "0 10px 30px rgba(0,0,0,.04)";
      });

      if (dashboard) {
        dashboard.style.background = "#f8fafc";
      }

      if (title) {
        title.style.color = "#111827";
      }

      if (sub) {
        sub.style.color = "#64748b";
      }
    }
  };

  return (
    <>
      <style>{`
        .topbar{
          height:68px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          padding:0 22px;
          background:#ffffff;
          border-bottom:1px solid #e5e7eb;
          position:sticky;
          top:0;
          z-index:100;
        }

        .dark-theme .topbar{
          background:#111827;
          border-bottom:1px solid #1f2937;
        }

        .logo{
          font-size:20px;
          font-weight:800;
          color:#111827;
          letter-spacing:-0.5px;
        }

        .dark-theme .logo{
          color:#f9fafb;
        }

        .logo span{
          color:#2563eb;
        }

        .topbar-right{
          display:flex;
          align-items:center;
          gap:12px;
        }

        .theme-btn{
          border:none;
          height:40px;
          padding:0 15px;
          border-radius:12px;
          cursor:pointer;
          font-weight:700;
          font-size:13px;
          background:#f3f4f6;
          color:#111827;
          transition:.25s ease;
        }

        .theme-btn:hover{
          transform:translateY(-1px);
        }

        .dark-theme .theme-btn{
          background:#1f2937;
          color:#f9fafb;
        }

        .clock-box{
          height:40px;
          padding:0 14px;
          border-radius:12px;
          background:#eff6ff;
          color:#2563eb;
          font-size:13px;
          font-weight:700;
          display:flex;
          align-items:center;
          border:1px solid #dbeafe;
        }

        .dark-theme .clock-box{
          background:#172554;
          color:#93c5fd;
          border:1px solid #1e3a8a;
        }

        .stock-alert{
          background:#ef4444;
          color:#fff;
          padding:10px 14px;
          border-radius:12px;
          font-size:13px;
          font-weight:700;
          display:flex;
          align-items:center;
          gap:7px;
        }

        .logout-btn{
          border:none;
          height:40px;
          padding:0 16px;
          border-radius:12px;
          cursor:pointer;
          font-weight:700;
          font-size:13px;
          background:#dc2626;
          color:#fff;
          transition:.25s ease;
        }

        .logout-btn:hover{
          transform:translateY(-1px);
        }

        .dark-theme .logout-btn{
          background:#b91c1c;
        }

        @media(max-width:700px){

          .topbar{
            padding:0 14px;
          }

          .logo{
            font-size:18px;
          }

          .theme-btn{
            padding:0 12px;
            font-size:12px;
          }

          .clock-box{
            padding:0 10px;
            font-size:11px;
          }

          .stock-alert{
            padding:9px 11px;
            font-size:12px;
          }

          .logout-btn{
            padding:0 12px;
            font-size:12px;
          }

        }
      `}</style>

      <header className="topbar">
        <div className="logo">
          Stock<span>Flow</span>
        </div>

        <div className="topbar-right">
          <div className="clock-box">🕒 {time}</div>

          <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "🌙 Dark" : "☀ Light"}
          </button>

          <div className="stock-alert">
            ⚠ {lowStockCount} Low Stock
          </div>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>
    </>
  );
}

export default Topbar;