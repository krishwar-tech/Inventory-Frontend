import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [scannerOpen, setScannerOpen] = useState(false);

  const scannerRef = useRef(null);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    lowStock: 0,
  });

  const [form, setForm] = useState({
    name: "",
    barcode: "",
    categoryId: "",
    mrp: "",
    price: "",
    unit: "pcs",
  });

  const loadProducts = async () => {
    const res = await fetch("https://inventory-backend-final-1.onrender.com/api/products");
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  };

  const loadStats = async () => {
    try {
      const res = await fetch("https://inventory-backend-final-1.onrender.com/api/products/stats");
      const data = await res.json();
      setStats(data);
    } catch {}
  };

  const loadCategories = async () => {
    try {
      const res = await fetch("https://inventory-backend-final-1.onrender.com/api/masters/categories");
      const data = await res.json();

      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  };

  const refreshAll = () => {
    loadProducts();
    loadStats();
  };

  useEffect(() => {
    refreshAll();
    loadCategories();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (p.status === "DELETED") return false;

    const q = search.toLowerCase();

    const searchMatch =
      (p.name || "").toLowerCase().includes(q) ||
      (p.barcode || "").toLowerCase().includes(q) ||
      (p.sku || "").toLowerCase().includes(q);

    const statusMatch =
      statusFilter === "ALL"
        ? true
        : (p.status || "").toUpperCase() === statusFilter;

    return searchMatch && statusMatch;
  });

  const resetForm = () => {
    setForm({
      name: "",
      barcode: "",
      categoryId: "",
      mrp: "",
      price: "",
      unit: "pcs",
    });
  };

  const handleAdd = async () => {
    try {
      const res = await fetch("https://inventory-backend-final-1.onrender.com/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          barcode: form.barcode,
          categoryId: form.categoryId,
          mrp: Number(form.mrp) || 0,
          price: Number(form.price) || 0,
          unit: form.unit,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        alert(txt);
        return;
      }

      resetForm();
      refreshAll();
      alert("Product added successfully");
    } catch {
      alert("Failed to add");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      const res = await fetch(`https://inventory-backend-final-1.onrender.com/api/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const txt = await res.text();

        alert("DELETE FAILED:\n" + txt);

        return;
      }

      alert("Deleted Successfully");

      refreshAll();
    } catch (e) {
      console.log(e);

      alert("Server error while deleting");
    }
  };

  const handleDeactivate = async (id) => {
    await fetch(`https://inventory-backend-final-1.onrender.com/api/products/deactivate/${id}`, {
      method: "PUT",
    });

    refreshAll();
  };

  const handleActivate = async (id) => {
    await fetch(`https://inventory-backend-final-1.onrender.com/api/products/activate/${id}`, {
      method: "PUT",
    });

    refreshAll();
  };

  const handleApprove = async (p) => {
    const price = prompt("Selling Price", p.price || 0);

    if (price === null) return;

    const mrp = prompt("MRP", p.mrp || 0);

    if (mrp === null) return;

    await fetch(`https://inventory-backend-final-1.onrender.com/api/products/approve/${p.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price: Number(price),
        mrp: Number(mrp),
      }),
    });

    refreshAll();
  };

  const handlePrice = async (p) => {
    const price = prompt("New Price", p.price || 0);

    if (price === null) return;

    const mrp = prompt("New MRP", p.mrp || 0);

    if (mrp === null) return;

    await fetch(`https://inventory-backend-final-1.onrender.com/api/products/price/${p.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price: Number(price),
        mrp: Number(mrp),
      }),
    });

    refreshAll();
  };

  const margin = (p) => {
    const sell = Number(p.price) || 0;
    const mrp = Number(p.mrp) || 0;

    if (!mrp) return "0%";

    return (((mrp - sell) / mrp) * 100).toFixed(0) + "%";
  };

  const badgeColor = (status) => {
    if (status === "ACTIVE") return "#16a34a";

    if (status === "PENDING") return "#d97706";

    return "#dc2626";
  };

  const handleBarcodeResult = async (code) => {
    try {
      const res = await fetch(
        `https://inventory-backend-final-1.onrender.com/api/products/scan/${code}`,
      );

      const data = await res.json();

      if (data.exists) {
        alert("Already exists in DB");
        return;
      }

      if (data.lookup && data.lookup.found) {
        setForm({
          name: data.lookup.name || "",
          barcode: code,
          category: data.lookup.category || "",
          mrp: data.lookup.mrp || "",
          price: "",
          unit: data.lookup.unit || "pcs",
        });

        alert("Auto-filled product");
        return;
      }

      setForm({
        ...form,
        barcode: code,
      });

      alert("Unknown barcode");
    } catch {
      alert("Scan failed");
    }
  };

  useEffect(() => {
    if (!scannerOpen) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: 220,
      },
      false,
    );

    scanner.render(
      async (decodedText) => {
        await handleBarcodeResult(decodedText);

        scanner.clear().catch(() => {});

        setScannerOpen(false);
      },
      () => {},
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [scannerOpen]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const qr = new Html5Qrcode("temp-reader");

      const result = await qr.scanFile(file, true);

      await handleBarcodeResult(result);
    } catch {
      alert("No barcode found");
    }
  };

  return (
    <>
      <style>{`
      .products-page{
          width:100%;
        }

        .stats-grid{
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:16px;
          margin-bottom:18px;
        }

        .stat-box{
          padding:20px;
          border-radius:20px;
          background:var(--surface);
          border:1px solid var(--border);
          transition:.25s;
          cursor:pointer;
          position:relative;
          overflow:hidden;
        }

        .stat-box:hover{
          transform:translateY(-6px) scale(1.02);
          box-shadow:0 14px 35px rgba(0,0,0,0.25);
          border-color:#16a34a;
        }

        .stat-box::before{
          content:"";
          position:absolute;
          inset:0;
          background:linear-gradient(
            120deg,
            transparent,
            rgba(255,255,255,0.08),
            transparent
          );
          opacity:0;
          transition:.3s;
        }

        .stat-box:hover::before{
          opacity:1;
        }

        body.dark-theme .stat-box{
          background:linear-gradient(145deg,#1f2937,#111827);
          border:1px solid #374151;
        }

        .card{
          background:var(--surface);
          border:1px solid var(--border);
          border-radius:22px;
          padding:22px;
          margin-bottom:16px;
          transition:.25s;
        }

        .card:hover{
          box-shadow:0 10px 28px rgba(0,0,0,0.05);
        }

        .row-grid{
          display:flex;
          gap:16px;
          margin-bottom:14px;
        }

        .col{
          flex:1;
          min-width:0;
        }

        input, select{
          width:100%;
          padding:10px 12px;
          border-radius:10px;
          border:1px solid var(--border);
          outline:none;
          transition:.2s;
        }

        input:focus, select:focus{
          border-color:#16a34a;
          box-shadow:0 0 0 2px rgba(22,163,74,.15);
        }

        .green{
          margin-top:10px;
          padding:12px 18px;
          border-radius:14px;
          border:none;
          background:linear-gradient(135deg,#16a34a,#15803d);
          color:#fff;
          font-weight:700;
          cursor:pointer;
          transition:.25s;
        }

        .green:hover{
          transform:translateY(-2px);
          box-shadow:0 8px 20px rgba(22,163,74,.3);
        }

        .table-wrap{
          overflow:auto;
        }

        .product-table{
          width:100%;
          min-width:1200px;
          border-collapse:separate;
          border-spacing:0 8px;
        }

        .product-table tr{
          background:var(--surface);
          transition:.2s;
        }

        .product-table tr:hover{
          transform:scale(1.01);
          box-shadow:0 6px 18px rgba(0,0,0,0.05);
        }

        .product-table td, th{
          padding:12px;
          text-align:left;
        }

        .mini-btn{
          border:none;
          padding:7px 10px;
          border-radius:10px;
          cursor:pointer;
          color:#fff;
          font-size:12px;
          font-weight:700;
          transition:.2s;
        }

        .mini-btn:hover{
          transform:scale(1.08);
        }

        .badge{
          padding:6px 10px;
          border-radius:20px;
          color:#fff;
          font-size:12px;
          font-weight:700;
        }

        @media(max-width:900px){
          .stats-grid{
            grid-template-columns:1fr 1fr;
          }
          .row-grid{
            flex-direction:column;
          }
        }

        @media(max-width:600px){
          .stats-grid{
            grid-template-columns:1fr;
          }
        }
        .stat-blue h2 { color:#3b82f6; }
        .stat-green h2 { color:#16a34a; }
        .stat-orange h2 { color:#f59e0b; }
        .stat-red h2 { color:#dc2626; }
        
      `}</style>

      <div className="content products-page">
        <div className="page-header">
          <h2 className="page-title">Products</h2>
          <p className="page-subtitle">
            Manage product catalog, pricing and barcode-based entries
          </p>
        </div>

        {/* SUMMARY */}
        <div className="stats-grid">
          <div className="stat-box stat-blue">
            <h4>Total</h4>
            <h2>{stats.total}</h2>
          </div>

          <div className="stat-box stat-green">
            <h4>Active</h4>
            <h2>{stats.active}</h2>
          </div>

          <div className="stat-box stat-orange">
            <h4>Pending</h4>
            <h2>{stats.pending}</h2>
          </div>

          <div className="stat-box stat-red">
            <h4>Low Stock</h4>
            <h2>{stats.lowStock}</h2>
          </div>
        </div>
        {/* ADD PRODUCT */}
        <div className="card">
          <h4 style={{ fontWeight: 700, fontSize: 16 }}>+ Add Product</h4>

          <div className="row-grid">
            <div className="col">
              <label>Name</label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />
            </div>

            <div className="col">
              <label>Barcode</label>

              <div className="barcode-wrap">
                <input
                  value={form.barcode}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      barcode: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="col">
              <label>Category</label>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    categoryId: e.target.value,
                  })
                }
              >
                <option value="">Select</option>

                {categories.map((c) => (
                  <option value={c.id} key={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row-grid">
            <div className="col">
              <label>MRP</label>
              <input
                value={form.mrp}
                onChange={(e) =>
                  setForm({
                    ...form,
                    mrp: e.target.value,
                  })
                }
              />
            </div>

            <div className="col">
              <label>Price</label>
              <input
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: e.target.value,
                  })
                }
              />
            </div>

            <div className="col">
              <label>Unit</label>

              <select
                value={form.unit}
                onChange={(e) =>
                  setForm({
                    ...form,
                    unit: e.target.value,
                  })
                }
              >
                <option>pcs</option>
                <option>kg</option>
                <option>ltr</option>
                <option>g</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="green" onClick={handleAdd}>
              + Add Product
            </button>
          </div>
        </div>

        {/* LIST */}
        <div className="card">
          <div className="top-row">
            <h3>PRODUCT LIST</h3>

            <div className="filters">
              <input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="table-wrap">
            <table className="product-table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>BARCODE</th>
                  <th>SKU</th>
                  <th>CATEGORY</th>
                  <th>MRP</th>
                  <th>PRICE</th>
                  <th>MARGIN</th>
                  <th>UNIT</th>
                  <th>STOCK</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.barcode}</td>
                    <td>{p.sku}</td>
                    <td>{p.category?.name || "-"}</td>
                    <td>₹{p.mrp}</td>
                    <td>₹{p.price}</td>
                    <td>{margin(p)}</td>
                    <td>{p.unit}</td>
                    <td>{p.stock || 0}</td>

                    <td>
                      <span
                        className="badge"
                        style={{
                          background: badgeColor(p.status),
                        }}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      {p.status === "PENDING" && (
                        <button
                          className="mini-btn"
                          style={{
                            background: "#16a34a",
                          }}
                          onClick={() => handleApprove(p)}
                        >
                          Approve
                        </button>
                      )}

                      <button
                        className="mini-btn"
                        style={{
                          background: "#2563eb",
                        }}
                        onClick={() => handlePrice(p)}
                      >
                        Price
                      </button>

                      {p.status === "ACTIVE" ? (
                        <button
                          className="mini-btn"
                          style={{
                            background: "#d97706",
                          }}
                          onClick={() => handleDeactivate(p.id)}
                        >
                          Off
                        </button>
                      ) : (
                        <button
                          className="mini-btn"
                          style={{
                            background: "#16a34a",
                          }}
                          onClick={() => handleActivate(p.id)}
                        >
                          On
                        </button>
                      )}

                      <button
                        className="mini-btn"
                        style={{
                          background: "#dc2626",
                        }}
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {scannerOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.55)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: 15,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              background: "#fff",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 15,
              }}
            >
              <h3>Scan Barcode</h3>

              <button className="red" onClick={() => setScannerOpen(false)}>
                X
              </button>
            </div>

            <div id="reader"></div>
          </div>
        </div>
      )}

      <div
        id="temp-reader"
        style={{
          display: "none",
        }}
      ></div>
    </>
  );
}
