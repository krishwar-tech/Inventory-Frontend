function Sidebar({ activePage, setActivePage }) {
  return (
    <nav className="sidebar">
      <div className="nav-section">Overview</div>

      <div
        className={`nav-item ${activePage === "dashboard" ? "active" : ""}`}
        onClick={() => setActivePage("dashboard")}
      >
        📊 Dashboard
      </div>

      <div className="nav-section">Operations</div>

      <div
        className={`nav-item ${activePage === "billing" ? "active" : ""}`}
        onClick={() => setActivePage("billing")}
      >
        🧾 Billing
      </div>

      <div
        className={`nav-item ${activePage === "procurement" ? "active" : ""}`}
        onClick={() => setActivePage("procurement")}
      >
        📦 Procurement
      </div>

      <div className="nav-section">Catalog</div>

      <div
        className={`nav-item ${activePage === "products" ? "active" : ""}`}
        onClick={() => setActivePage("products")}
      >
        🏷️ Products
      </div>

      <div
        className={`nav-item ${activePage === "pending" ? "active" : ""}`}
        onClick={() => setActivePage("pending")}
      >
        🟡 Pending Approvals
      </div>

      <div
        className={`nav-item ${activePage === "inventory" ? "active" : ""}`}
        onClick={() => setActivePage("inventory")}
      >
        📋 Inventory
      </div>

      <div className="nav-section">Analysis</div>

      <div
        className={`nav-item ${activePage === "reports" ? "active" : ""}`}
        onClick={() => setActivePage("reports")}
      >
        📈 Reports
      </div>

      <div
        className={`nav-item ${activePage === "masters" ? "active" : ""}`}
        onClick={() => setActivePage("masters")}
      >
        🗂️ Masters
      </div>
      <div
        className={`nav-item ${activePage === "finance" ? "active" : ""}`}
        onClick={() => setActivePage("finance")}
      >
        💰 Finance
      </div>
      <div className="nav-section">System</div>

      <div
        className={`nav-item ${activePage === "settings" ? "active" : ""}`}
        onClick={() => setActivePage("settings")}
      >
        ⚙️ Settings
      </div>
    </nav>
  );
}

export default Sidebar;
