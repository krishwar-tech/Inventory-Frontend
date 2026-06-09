import { useEffect, useState } from "react";
import api from "../services/api";

function Masters() {
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [shelfLives, setShelfLives] = useState([]);
  const [shelfLifeMonths, setShelfLifeMonths] = useState("");

  const [showShelfLifePopup, setShowShelfLifePopup] = useState(false);

  const [mappingType, setMappingType] = useState("");
  const [selectedMappings, setSelectedMappings] = useState([]);

  const [subCategories, setSubCategories] = useState([]);

  const [subCategoryName, setSubCategoryName] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("");

  const [supplierName, setSupplierName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [s, c, sc, sl, cu] = await Promise.all([
        api.get("/masters/suppliers"),
        api.get("/masters/categories"),
        api.get("/masters/subcategories"),
        api.get("/masters/shelf-lives"),
        api.get("/masters/customers"),
      ]);

      // ADD THESE TWO LINES
      console.log("RAW suppliers response:", s);
      console.log("suppliers data:", s.data);

      setSuppliers(s.data || []);
      setCategories(c.data || []);
      setSubCategories(sc.data || []);
      setShelfLives(sl.data || []);
      setCustomers(cu.data || []);
    } catch (err) {
      console.log("LOAD ERROR:", err); // ADD THIS TOO
    }
  };

  const toggleMapping = (id) => {
    setSelectedMappings((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const addSupplier = async () => {
    if (!supplierName.trim()) return;

    try {
      await api.post("/masters/suppliers", {
        name: supplierName,
      });

      setSupplierName("");

      await loadAll();
    } catch (err) {
      console.log(err);
    }
  };

  const addCategory = async () => {
    if (!categoryName.trim()) return;

    try {
      await api.post("/masters/categories", {
        name: categoryName,
      });

      setCategoryName("");

      await loadAll();
    } catch (err) {
      console.log(err);
    }
  };

  const addSubCategory = async () => {
    if (!selectedCategory || !subCategoryName.trim()) return;

    try {
      await api.post("/masters/subcategories", {
        categoryId: selectedCategory,
        name: subCategoryName,
      });

      setSubCategoryName("");
      setSelectedCategory("");

      await loadAll();
    } catch (err) {
      console.log(err);
    }
  };
  const deleteSubCategory = async (id) => {
    try {
      await api.delete(`/masters/subcategories/${id}`);

      await loadAll();
    } catch (err) {
      console.log(err);
    }
  };
  const addCustomer = async () => {
    if (!customerName.trim()) return;

    try {
      await api.post("/masters/customers", {
        name: customerName,
      });

      setCustomerName("");

      await loadAll();
    } catch (err) {
      console.log(err);
    }
  };
  const formatShelfLife = (months) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
      return `${months} Month${months > 1 ? "s" : ""}`;
    }

    if (remainingMonths === 0) {
      return `${years} Year${years > 1 ? "s" : ""}`;
    }

    return `${years} Year${years > 1 ? "s" : ""} ${remainingMonths} Month${remainingMonths > 1 ? "s" : ""}`;
  };
  const addShelfLife = () => {
    if (!shelfLifeMonths) return;

    setShowShelfLifePopup(true);
  };

  const saveShelfLife = async () => {
    if (!mappingType || selectedMappings.length === 0) {
      alert("Please select at least one item");
      return;
    }
    try {
      const payload = {
        name: formatShelfLife(Number(shelfLifeMonths)),
        months: Number(shelfLifeMonths),
        mappingType: mappingType, // ← ADD THIS
        mappingIds: selectedMappings, // ← ADD THIS
      };

      await api.post("/masters/shelf-lives", payload);

      setShelfLifeMonths("");
      setMappingType("");
      setSelectedMappings([]);
      setShowShelfLifePopup(false);

      await loadAll();
      showToast("Shelf life added successfully! ✅"); // ← ADD THIS
    } catch (err) {
      console.log(err);
      showToast("Failed to save shelf life", "error");
    }
  };

  const deleteShelfLife = async (id) => {
    try {
      await api.delete(`/masters/shelf-lives/${id}`);

      await loadAll();
    } catch (err) {
      console.log(err);
    }
  };
  const deleteSupplier = async (id) => {
    try {
      await api.delete(`/masters/suppliers/${id}`);

      await loadAll();
    } catch (err) {
      console.log(err);
    }
  };
  const deleteCategory = async (id) => {
    try {
      await api.delete(`/masters/categories/${id}`);

      await loadAll();
    } catch (err) {
      console.log(err);
    }
  };
  const deleteCustomer = async (id) => {
    try {
      await api.delete(`/masters/customers/${id}`);

      await loadAll();
    } catch (err) {
      console.log(err);
    }
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

          <div className="top-label">Sub Categories</div>

          <div className="top-value purple">{subCategories.length}</div>
        </div>
        <div className="top-master-card">
          <div className="card-circle"></div>

          <div className="top-label">Shelf Life</div>

          <div className="top-value blue">{shelfLives.length}</div>
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

          <div className="mini-text">{suppliers.length} Active Suppliers</div>

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

        <div className="master-card">
          <div className="master-head">🗂️ Sub Categories</div>

          <div className="mini-text">{subCategories.length} Sub Categories</div>

          <div className="master-add sub-cat-add">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="sub-input-row">
              <input
                type="text"
                placeholder="Sub Category name"
                value={subCategoryName}
                onChange={(e) => setSubCategoryName(e.target.value)}
              />
              <button className="add-btn" onClick={addSubCategory}>
                +
              </button>
            </div>
          </div>

          <div className="master-list">
            {subCategories.map((item) => (
              <div className="master-row" key={item.id}>
                <span>
                  🗂️ {item.name}
                  <br />
                  <small style={{ color: "#64748b" }}>
                    {item.category?.name}
                  </small>
                </span>

                <button
                  className="delete-btn"
                  onClick={() => deleteSubCategory(item.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="master-card">
          <div className="master-head">⏳ Shelf Life</div>

          <div className="mini-text">
            {shelfLives.length} Shelf Life Options
          </div>

          <div className="master-add">
            <input
              type="number"
              placeholder="Enter Months "
              value={shelfLifeMonths}
              onChange={(e) => setShelfLifeMonths(e.target.value)}
            />

            <button className="add-btn" onClick={addShelfLife}>
              +
            </button>
          </div>

          <div className="master-list">
            {shelfLives.map((item) => (
              <div className="master-row" key={item.id}>
                <span>
                  ⏳ {formatShelfLife(item.months)}
                  <br />
                  <small style={{ color: "#64748b" }}>
                    {item.mappingName || "—"}
                  </small>
                </span>
                <button
                  className="delete-btn"
                  onClick={() => deleteShelfLife(item.id)}
                >
                  ×
                </button>
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
              <div className="empty-state">No customers added yet</div>
            )}
          </div>
        </div>
      </div>
      {showShelfLifePopup && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h3>Map Shelf Life</h3>

            <div className="popup-option">
              <label>
                <input
                  type="radio"
                  value="category"
                  checked={mappingType === "category"}
                  onChange={(e) => setMappingType(e.target.value)}
                />
                Category
              </label>

              <label>
                <input
                  type="radio"
                  value="subcategory"
                  checked={mappingType === "subcategory"}
                  onChange={(e) => setMappingType(e.target.value)}
                />
                Sub Category
              </label>
            </div>

            {mappingType === "category" && (
              <div className="checklist-box">
                {categories.map((c) => (
                  <label key={c.id} className="checklist-item">
                    <input
                      type="checkbox"
                      checked={selectedMappings.includes(c.id)}
                      onChange={() => toggleMapping(c.id)}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            )}

            {mappingType === "subcategory" && (
              <div className="checklist-box">
                {subCategories.map((s) => (
                  <label key={s.id} className="checklist-item">
                    <input
                      type="checkbox"
                      checked={selectedMappings.includes(s.id)}
                      onChange={() => toggleMapping(s.id)}
                    />
                    {s.name}
                  </label>
                ))}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                onClick={saveShelfLife}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#2563eb",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Save
              </button>

              <button
                onClick={() => {
                  setShowShelfLifePopup(false);
                  setMappingType("");
                  setSelectedMappings([]);
                }}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#ef4444",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
      .checklist-box {
  margin-top: 15px;
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  background: #fff;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
}

.checklist-item:hover {
  background: #f8fafc;
}

.checklist-item input {
  width: 18px;
  height: 18px;
}
      .popup-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,0.45);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:9999;
}

.popup-card{
  width:420px;
  background:white;
  border-radius:20px;
  padding:24px;
  box-shadow:0 20px 50px rgba(0,0,0,.25);
}

.popup-card select{
  width:100%;
  height:50px;
  margin-top:15px;
  border:1px solid #ddd;
  border-radius:12px;
  padding:0 15px;
}

.popup-option{
  display:flex;
  gap:20px;
  margin-top:15px;
}

      .master-add select{
        width:100%;
        height:56px;
        border:1px solid var(--border);
        border-radius:16px;
        padding:0 18px;
        background:var(--bg);
        color:var(--text);
        }

        .masters-top-grid{
          display:grid;
          grid-template-columns:repeat(5,1fr);
          gap:20px;
          margin-top:26px;
          margin-bottom:24px;
        }
          .sub-cat-add {
            flex-direction: column;
            gap: 10px;
          }

          .sub-cat-add select {
            width: 100%;
            height: 50px;
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 0 18px;
            background: var(--bg);
            color: var(--text);
            font-size: 15px;
            outline: none;
            cursor: pointer;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 18px center;
            transition: all 0.2s ease;
          }

          .sub-cat-add select:focus {
            border-color: #7c3aed;
            box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.08);
          }

          .sub-cat-add select:hover {
            border-color: #94a3b8;
          }

          .sub-input-row {
            display: flex;
            gap: 10px;
            width: 100%;
          }

          .sub-input-row input {
            flex: 1;
            height: 50px;
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 0 18px;
            font-size: 15px;
            outline: none;
            background: var(--bg);
            color: var(--text);
            transition: all 0.2s ease;
          }

          .sub-input-row input:focus {
            border-color: #7c3aed;
            box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.08);
          }

          .sub-input-row .add-btn {
            width: 56px;
            height: 50px;
            flex-shrink: 0;
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
        .purple{
          color:#7c3aed;
        }
        .masters-grid{
          display:grid;
          grid-template-columns:repeat(4,1fr);
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
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            background: toast.type === "error" ? "#ef4444" : "#16a34a",
            color: "white",
            padding: "14px 24px",
            borderRadius: "14px",
            fontWeight: "600",
            fontSize: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            zIndex: 99999,
            animation: "fadeUp 0.3s ease",
          }}
        >
          {toast.msg}
        </div>
      )}
    </section>
  );
}

export default Masters;
