import { useEffect, useState } from "react";

function Masters() {
  const API = "https://inventory-backend-final-1.onrender.com/api/masters";

  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [supplierName, setSupplierName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const s = await fetch(`${API}/suppliers`);
      const c = await fetch(`${API}/categories`);
      const cu = await fetch(`${API}/customers`);

      setSuppliers(await s.json());
      setCategories(await c.json());
      setCustomers(await cu.json());
    } catch (err) {
      console.log(err);
    }
  };

  const addSupplier = async () => {
    if (!supplierName.trim()) return;

    await fetch(`${API}/suppliers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: supplierName,
      }),
    });

    setSupplierName("");
    loadAll();
  };

  const addCategory = async () => {
    if (!categoryName.trim()) return;

    await fetch(`${API}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: categoryName,
      }),
    });

    setCategoryName("");
    loadAll();
  };

  const addCustomer = async () => {
    if (!customerName.trim()) return;

    await fetch(`${API}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: customerName,
      }),
    });

    setCustomerName("");
    loadAll();
  };

  const deleteSupplier = async (id) => {
    await fetch(`${API}/suppliers/${id}`, {
      method: "DELETE",
    });
    loadAll();
  };

  const deleteCategory = async (id) => {
    await fetch(`${API}/categories/${id}`, {
      method: "DELETE",
    });
    loadAll();
  };

  const deleteCustomer = async (id) => {
    await fetch(`${API}/customers/${id}`, {
      method: "DELETE",
    });
    loadAll();
  };

  return (
    <section className="section active">
      <div className="page-title">Masters</div>

      <div className="page-sub">
        Manage Suppliers, Categories, and Customers used across the system
      </div>

      {/* TOP SUMMARY */}
      <div className="masters-top-grid">
        <div className="top-master-card">
          <div className="card-circle"></div>
          <div className="top-label">Suppliers</div>
          <div className="top-value blue">{suppliers.length}</div>
        </div>

        <div className="top-master-card">
          <div className="card-circle"></div>
          <div className="top-label">Categories</div>
          <div className="top-value green">{categories.length}</div>
        </div>

        <div className="top-master-card">
          <div className="card-circle"></div>
          <div className="top-label">Customers</div>
          <div className="top-value orange">{customers.length}</div>
        </div>
      </div>

      <div className="masters-grid">

        {/* SUPPLIERS */}
        <div className="master-card">
          <div className="master-head">🚚 Suppliers</div>

          <div className="mini-text">
            {suppliers.length} Active Suppliers
          </div>

          <div className="master-add">
            <input
              type="text"
              placeholder="Supplier name"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
            />

            <button className="add-btn" onClick={addSupplier}>
              +
            </button>
          </div>

          <div className="master-list">
            {suppliers.map((item) => (
              <div className="master-row" key={item.id}>
                <span>🏪 {item.name}</span>

                <button
                  className="delete-btn"
                  onClick={() => deleteSupplier(item.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CATEGORY */}
        <div className="master-card">
          <div className="master-head">📦 Categories</div>

          <div className="mini-text">
            {categories.length} Product Categories
          </div>

          <div className="master-add">
            <input
              type="text"
              placeholder="Category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />

            <button className="add-btn" onClick={addCategory}>
              +
            </button>
          </div>

          <div className="master-list">
            {categories.map((item) => (
              <div className="master-row" key={item.id}>
                <span>📁 {item.name}</span>

                {item.canDelete && (
                  <button
                    className="delete-btn"
                    onClick={() => deleteCategory(item.id)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CUSTOMERS */}
        <div className="master-card">
          <div className="master-head">👤 Customers</div>

          <div className="mini-text">
            {customers.length} Registered Customers
          </div>

          <div className="master-add">
            <input
              type="text"
              placeholder="Customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            <button className="add-btn" onClick={addCustomer}>
              +
            </button>
          </div>

          <div className="master-list">
            {customers.length > 0 ? (
              customers.map((item) => (
                <div className="master-row" key={item.id}>
                  <span>👤 {item.name}</span>

                  <button
                    className="delete-btn"
                    onClick={() => deleteCustomer(item.id)}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">
                No customers added yet
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`

        .masters-top-grid{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:20px;
          margin-top:26px;
          margin-bottom:24px;
        }

        .top-master-card{
          position:relative;
          overflow:hidden;
          background:var(--surface);
          border:1px solid var(--border);
          border-radius:24px;
          padding:28px;
          min-height:160px;
          box-shadow:0 4px 18px rgba(0,0,0,0.06);
        }

        .card-circle{
          position:absolute;
          width:120px;
          height:120px;
          border-radius:50%;
          background:rgba(59,130,246,0.05);
          top:-30px;
          right:-20px;
        }

        .top-label{
          font-size:18px;
          color:var(--muted);
          font-weight:700;
          margin-bottom:18px;
        }

        .top-value{
          font-size:58px;
          font-weight:800;
          line-height:1;
        }

        .blue{
          color:#2563eb;
        }

        .green{
          color:#16a34a;
        }

        .orange{
          color:#f59e0b;
        }

        .masters-grid{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:24px;
          margin-top:10px;
        }

        .master-card{
          background:var(--surface);
          border:1px solid var(--border);
          border-radius:24px;
          padding:26px;
          box-shadow:0 6px 20px rgba(0,0,0,0.05);
          transition:all 0.3s ease;
          animation:fadeUp 0.4s ease;
        }

        .master-card:hover{
          transform:translateY(-6px);
          box-shadow:0 20px 40px rgba(0,0,0,0.10);
        }

        .master-head{
          font-size:24px;
          font-weight:800;
          color:var(--text);
          margin-bottom:6px;
        }

        .mini-text{
          font-size:13px;
          color:var(--muted);
          margin-bottom:22px;
        }

        .master-add{
          display:flex;
          gap:12px;
          margin-bottom:24px;
        }

        .master-add input{
          flex:1;
          height:56px;
          border:1px solid var(--border);
          border-radius:16px;
          padding:0 18px;
          font-size:16px;
          outline:none;
          background:var(--bg);
          color:var(--text);
          transition:all 0.2s ease;
        }

        .master-add input:focus{
          border-color:#2563eb;
          box-shadow:0 0 0 4px rgba(37,99,235,0.08);
        }

        .master-add input::placeholder{
          color:var(--muted);
        }

        .add-btn{
          width:64px;
          border:none;
          border-radius:16px;
          background:linear-gradient(135deg,#16a34a,#15803d);
          color:#fff;
          font-size:34px;
          cursor:pointer;
          font-weight:700;
          transition:all 0.25s ease;
          box-shadow:0 10px 20px rgba(22,163,74,0.18);
        }

        .add-btn:hover{
          transform:scale(1.05);
        }

        .master-list{
          display:flex;
          flex-direction:column;
          gap:10px;
        }

        .master-row{
          display:flex;
          justify-content:space-between;
          align-items:center;
          border-bottom:1px solid var(--border);
          padding:14px 0;
          font-size:16px;
          color:var(--text);
        }

        .delete-btn{
          width:42px;
          height:42px;
          border:none;
          border-radius:12px;
          background:rgba(239,68,68,0.12);
          color:#ef4444;
          font-size:30px;
          font-weight:900;
          cursor:pointer;
          display:flex;
          align-items:center;
          justify-content:center;
          transition:all 0.25s ease;
        }

        .delete-btn:hover{
          background:#ef4444;
          color:#fff;
          transform:scale(1.08);
        }

        .empty-state{
          text-align:center;
          padding:40px 10px;
          color:var(--muted);
          font-size:15px;
          opacity:0.7;
        }

        @keyframes fadeUp{
          from{
            opacity:0;
            transform:translateY(12px);
          }
          to{
            opacity:1;
            transform:translateY(0);
          }
        }

        @media(max-width:1100px){

          .masters-grid{
            grid-template-columns:1fr;
          }

          .masters-top-grid{
            grid-template-columns:1fr;
          }
        }

        @media(max-width:768px){

          .top-value{
            font-size:44px;
          }

          .master-head{
            font-size:20px;
          }

          .master-add{
            flex-direction:column;
          }

          .add-btn{
            width:100%;
            height:54px;
          }
        }

        /* TOP SUMMARY CARD HOVER */
        .top-master-card{
          transition:all 0.35s ease;
          cursor:pointer;
        }

        .top-master-card:hover{
          transform:translateY(-8px);
          box-shadow:0 22px 45px rgba(0,0,0,0.12);
          border-color:rgba(59,130,246,0.22);
        }

        .top-master-card:hover .card-circle{
          transform:scale(1.15);
          opacity:1;
        }

        /* CIRCLE ANIMATION */
        .card-circle{
          transition:all 0.4s ease;
          opacity:0.8;
        }

        /* MASTER CARD HOVER */
        .master-card{
          transition:all 0.35s ease;
        }

        .master-card:hover{
          transform:translateY(-8px);
          box-shadow:0 22px 45px rgba(0,0,0,0.12);
          border-color:rgba(59,130,246,0.22);
        }

        /* INPUT HOVER */
        .master-add input:hover{
          border-color:#94a3b8;
        }

        /* ADD BUTTON HOVER */
        .add-btn:hover{
          transform:translateY(-2px) scale(1.05);
          box-shadow:0 18px 35px rgba(22,163,74,0.28);
        }

        /* DELETE BUTTON HOVER */
        .delete-btn:hover{
          transform:scale(1.12) rotate(6deg);
          box-shadow:0 10px 18px rgba(239,68,68,0.22);
        }

        /* ROW HOVER */
        .master-row{
          transition:all 0.25s ease;
          border-radius:12px;
          padding-left:10px;
          padding-right:10px;
        }

        .master-row:hover{
          background:rgba(148,163,184,0.08);
          transform:translateX(4px);
        }

        /* DARK MODE ROW HOVER */
        .dark .master-row:hover{
          background:rgba(255,255,255,0.04);
        }

        /* SMOOTH ICON MOVEMENT */
        .master-row span{
          transition:all 0.25s ease;
        }

        .master-row:hover span{
          transform:translateX(3px);
        }

        /* PREMIUM GLOW */
        .master-card::before{
          content:"";
          position:absolute;
          inset:0;
          border-radius:24px;
          padding:1px;
          background:linear-gradient(
            135deg,
            rgba(59,130,246,0.10),
            transparent,
            rgba(16,185,129,0.08)
          );
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor;
          pointer-events:none;
          opacity:0;
          transition:0.35s ease;
        }

        .master-card{
          position:relative;
          overflow:hidden;
        }

        .master-card:hover::before{
          opacity:1;
        }

      `}</style>
    </section>
  );
}

export default Masters;