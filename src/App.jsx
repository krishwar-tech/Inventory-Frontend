import { useState, useEffect } from "react";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Billing from "./components/Billing";
import Procurement from "./components/Procurement";
import Products from "./components/Products";
import Inventory from "./components/Inventory";
import Reports from "./components/Reports";
import Masters from "./components/Masters";
import Settings from "./components/Settings";
import PendingProducts from "./components/PendingProducts";
import Finance from "./components/Finance";

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePageChange = (page) => {
    setActivePage(page);
    setMenuOpen(false);
  };

  return (
    <>
      <div className="app-layout">
        {/* TOPBAR */}
        <header className="mobile-topbar">
          <button className="menu-btn" onClick={() => setMenuOpen(true)}>
            ☰
          </button>

          <div className="topbar-holder">
            <Topbar />
          </div>
        </header>

        {/* OVERLAY */}
        {menuOpen && (
          <div className="overlay" onClick={() => setMenuOpen(false)}></div>
        )}

        {/* SIDEBAR */}
        <aside className={`sidebar-panel ${menuOpen ? "show" : ""}`}>
          <Sidebar activePage={activePage} setActivePage={handlePageChange} />
        </aside>

        {/* MAIN */}
        <main className="main-content">
          {activePage === "dashboard" && <Dashboard />}
          {activePage === "billing" && <Billing />}
          {activePage === "procurement" && <Procurement />}
          {activePage === "products" && <Products />}
          {activePage === "inventory" && <Inventory />}
          {activePage === "reports" && <Reports />}
          {activePage === "masters" && <Masters />}
          {activePage === "settings" && <Settings />}
          {activePage === "pending" && <PendingProducts />}
          {activePage === "finance" && <Finance />}
        </main>
      </div>

      {/* CSS */}
      <style>{`
        .app-layout{
          display:grid;
          grid-template-columns:220px 1fr;
          grid-template-rows:56px 1fr;
          height:100vh;
        }

        .mobile-topbar{
          grid-column:1 / -1;
          display:flex;
          align-items:center;
          background:#fff;
          border-bottom:1px solid #e5e7eb;
          z-index:1000;
        }

        .topbar-holder{
          flex:1;
        }

        .menu-btn{
          display:none;
          margin-left:12px;
          margin-right:10px;
          border:none;
          background:#fff;
          font-size:28px;
          cursor:pointer;
          border-radius:8px;
          padding:2px 10px;
        }

        .sidebar-panel{
          background:#fff;
          border-right:1px solid #e5e7eb;
          overflow-y:auto;
        }

        .main-content{
          overflow-y:auto;
          padding:20px;
          background:#f5f5f0;
        }

        .overlay{
          display:none;
        }

        /* MOBILE */
        @media(max-width:768px){

          .app-layout{
            display:block;
            height:100vh;
          }

          .menu-btn{
            display:block;
          }

          .mobile-topbar{
            position:sticky;
            top:0;
            height:56px;
          }

          .sidebar-panel{
            position:fixed;
            top:56px;
            left:-270px;
            width:250px;
            height:calc(100vh - 56px);
            z-index:1001;
            transition:0.3s ease;
            box-shadow:4px 0 18px rgba(0,0,0,.08);
          }

          .sidebar-panel.show{
            left:0;
          }

          .overlay{
            display:block;
            position:fixed;
            inset:0;
            background:rgba(0,0,0,.45);
            z-index:1000;
          }

          .main-content{
            padding:12px;
          }
        }
      `}</style>
    </>
  );
}

export default App;
