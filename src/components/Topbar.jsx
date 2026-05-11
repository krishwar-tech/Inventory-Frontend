import { useEffect, useState } from "react";

function Topbar() {
  const [time, setTime] = useState("");
  const [lowStockCount, setLowStockCount] = useState(0);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark",
  );

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const timeStr = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const ampm = now.getHours() >= 12 ? "pm" : "am";

      setTime(`${timeStr} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadLowStock();

    const interval = setInterval(() => {
      loadLowStock();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const loadLowStock = async () => {
    try {
      const res = await fetch("https://inventory-backend-final-1.onrender.com/api/reports/dashboard");
      const data = await res.json();

      setLowStockCount(data.lowStockCount || 0);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <header className="topbar">
      <div className="logo">
        Stock<span>Flow</span>
      </div>

      <div style={{ flex: 1 }}></div>

      <div className="topbar-right">
        {/* DARK MODE TOGGLE */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            border: "1px solid #374151",
            borderRadius: "30px",
            padding: "8px 14px",
            cursor: "pointer",
            fontWeight: "700",
            background: darkMode ? "#1e293b" : "#f3f4f6",
            color: darkMode ? "#fff" : "#111827",
          }}
        >
          {darkMode ? "🌙 Dark" : "☀ Light"}
        </button>

        {/* TIME */}
        <span style={{ fontFamily: "DM Mono, monospace" }}>{time}</span>

        {/* LOW STOCK */}
        <span
          style={{
            background: "#dc2626",
            color: "white",
            borderRadius: "20px",
            padding: "4px 10px",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          ⚠ {lowStockCount} Low Stock
        </span>
      </div>
    </header>
  );
}

export default Topbar;
