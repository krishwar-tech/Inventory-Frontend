import { useEffect, useState } from "react";

function Masters() {
  const API = "http://http://https://inventory-backend-final-1.onrender.com/masters";

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

      <div className="masters-grid">
        {/* SUPPLIERS */}
        <div className="master-card">
          <div className="master-head">🚚 SUPPLIERS</div>

          <div className="master-add">
            <input
              type="text"
              placeholder="Supplier name"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
            />

            <button onClick={addSupplier}>+</button>
          </div>

          <div className="master-list">
            {suppliers.map((item) => (
              <div className="master-row" key={item.id}>
                <span>{item.name}</span>

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
          <div className="master-head">📁 CATEGORIES</div>

          <div className="master-add">
            <input
              type="text"
              placeholder="Category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />

            <button onClick={addCategory}>+</button>
          </div>

          <div className="master-list">
            {categories.map((item) => (
              <div className="master-row" key={item.id}>
                <span>{item.name}</span>

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
          <div className="master-head">👤 CUSTOMERS</div>

          <div className="master-add">
            <input
              type="text"
              placeholder="Customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            <button onClick={addCustomer}>+</button>
          </div>

          <div className="master-list">
            {customers.map((item) => (
              <div className="master-row" key={item.id}>
                <span>{item.name}</span>

                <button
                  className="delete-btn"
                  onClick={() => deleteCustomer(item.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .masters-grid{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:20px;
          margin-top:20px;
        }

        .master-card{
          background:var(--surface);
          border:1px solid var(--border);
          border-radius:18px;
          padding:24px;
          box-shadow:0 1px 2px rgba(0,0,0,.06);
        }

        .master-head{
          font-size:15px;
          font-weight:800;
          color:var(--muted);
          letter-spacing:1px;
          margin-bottom:22px;
        }

        .master-add{
          display:flex;
          gap:10px;
          margin-bottom:22px;
        }

        .master-add input{
          flex:1;
          height:50px;
          border:1px solid var(--border);
          border-radius:12px;
          padding:0 16px;
          font-size:16px;
          outline:none;
          background:var(--bg);
          color:var(--text);
        }

        .master-add input::placeholder{
          color:var(--muted);
        }

        .master-add button{
          width:54px;
          border:none;
          border-radius:12px;
          background:#166534;
          color:#fff;
          font-size:28px;
          cursor:pointer;
          font-weight:700;
        }

        .master-add button:hover{
          background:#15803d;
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
          padding:10px 0;
          font-size:16px;
          color:var(--text);
        }
        .delete-btn{
          width:36px;
          height:36px;
          border:none;
          border-radius:10px;
          background:#fee2e2;
          color:#dc2626 !important;   /* FIXED RED CROSS */
          font-size:28px;
          font-weight:900;
          cursor:pointer;
          line-height:36px;
          text-align:center;
          display:flex;
          align-items:center;
          justify-content:center;
        }

        .delete-btn:hover{
          background:#ef4444;
          color:#ffffff !important;
        }

        @media(max-width:1000px){
          .masters-grid{
            grid-template-columns:1fr;
          }
        }
      `}</style>
    </section>
  );
}

export default Masters;
