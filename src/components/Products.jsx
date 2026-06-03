import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import api from "../services/api";

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
    try {
      const data = await api.get("/products");
      setProducts(Array.isArray(data.data) ? data.data : []);
    } catch {
      setProducts([]);
    }
  };

  const loadStats = async () => {
    try {
      const res = await api.get("/products/stats");

      setStats(res.data);
    } catch {}
  };

  const loadCategories = async () => {
    try {
      const res = await api.get("/masters/categories");

      console.log(res);

      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);

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
      await api.post("/products", {
        name: form.name,
        barcode: form.barcode,
        categoryId: form.categoryId,
        mrp: Number(form.mrp) || 0,
        price: Number(form.price) || 0,
        unit: form.unit,
      });

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
      await api.delete(`/products/${id}`);

      alert("Deleted Successfully");

      refreshAll();
    } catch {
      alert("Server error while deleting");
    }
  };

  const handleDeactivate = async (id) => {
    await api.put(`/products/deactivate/${id}`);

    refreshAll();
  };

  const handleActivate = async (id) => {
    await api.put(`/products/activate/${id}`);

    refreshAll();
  };

  const handleApprove = async (p) => {
    const price = prompt("Selling Price", p.price || 0);

    if (price === null) return;

    const mrp = prompt("MRP", p.mrp || 0);

    if (mrp === null) return;

    await api.put(`/products/approve/${p.id}`, {
      price: Number(price),
      mrp: Number(mrp),
    });

    refreshAll();
  };

  const handlePrice = async (p) => {
    const price = prompt("New Price", p.price || 0);

    if (price === null) return;

    const mrp = prompt("New MRP", p.mrp || 0);

    if (mrp === null) return;

    await api.put(`/products/price/${p.id}`, {
      price: Number(price),
      mrp: Number(mrp),
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
      const data = await api.get(`/products/scan/${code}`);

      if (data.exists) {
        alert("Already exists in DB");
        return;
      }

      if (data.lookup && data.lookup.found) {
        setForm({
          name: data.lookup.name || "",
          barcode: code,
          categoryId: data.lookup.category || "",
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

        /* =========================
          SUMMARY CARDS
        ========================= */

        .stats-grid{
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:16px;
          margin-bottom:20px;
        }

      .stat-box{

  position:relative;

  overflow:hidden;

  padding:22px;

  border-radius:24px;

  background:#ffffff;

  border:1px solid #e5e7eb;

  transition:.25s ease;

  cursor:pointer;

  box-shadow:0 4px 14px rgba(0,0,0,.05);
}

/* LIGHT MODE DESIGN */

.stat-box::before{
  content:"";

  position:absolute;

  width:150px;
  height:150px;

  border-radius:50%;

  background:rgba(37,99,235,.05);

  top:-55px;
  right:-45px;
}

.stat-box::after{
  content:"";

  position:absolute;

  width:70px;
  height:70px;

  border-radius:50%;

  background:rgba(255,255,255,.85);

  top:20px;
  right:20px;

  filter:blur(10px);
}

.stat-box:hover{
  transform:translateY(-5px);
  box-shadow:0 16px 32px rgba(0,0,0,.08);
}

.stat-box h4{
  font-size:14px;
  font-weight:700;
  color:#64748b;
  margin-bottom:10px;
  position:relative;
  z-index:2;
}

.stat-box h2{
  font-size:42px;
  font-weight:800;
  position:relative;
  z-index:2;
}

.stat-blue h2{
  color:#2563eb;
}

.stat-green h2{
  color:#16a34a;
}

.stat-orange h2{
  color:#f59e0b;
}

.stat-red h2{
  color:#ef4444;
}

/* DARK MODE */

body.dark-theme .stat-box{

  background:
  linear-gradient(
    145deg,
    #1e293b,
    #0f172a
  );

  border:1px solid rgba(255,255,255,.06);
}

body.dark-theme .stat-box::before{
  background:rgba(255,255,255,.04);
}

body.dark-theme .stat-box::after{
  background:rgba(255,255,255,.03);
}

body.dark-theme .stat-box h4{
  color:#94a3b8;
}

        .stat-blue h2{ color:#3b82f6; }
        .stat-green h2{ color:#22c55e; }
        .stat-orange h2{ color:#f59e0b; }
        .stat-red h2{ color:#ef4444; }

        .stats-card{

            background:#ffffff;

            border-radius:26px;

            padding:24px;

            position:relative;

            overflow:hidden;

            min-height:150px;

            border:1px solid #e5e7eb;

            transition:.25s ease;

            box-shadow:0 4px 14px rgba(0,0,0,.04);
          }

          /* DARK MODE */

          body.dark-theme .stats-card{

            background:
            linear-gradient(
              145deg,
              #1e293b,
              #0f172a
            );

            border:1px solid rgba(255,255,255,.06);
          }
        /* =========================
          CARD
        ========================= */

        .card{

          background:#ffffff;

          border:1px solid #e5e7eb;

          border-radius:26px;

          padding:24px;

          margin-bottom:18px;

          transition:.25s ease;

          box-shadow:0 4px 14px rgba(0,0,0,.04);
        }

        /* DARK MODE */

        body.dark-theme .card{

          background:
          linear-gradient(
            145deg,
            #1e293b,
            #172033
          );

          border:1px solid rgba(255,255,255,.06);
        }

        .card:hover{
          box-shadow:0 15px 35px rgba(0,0,0,.20);
        }

        /* =========================
          FORM
        ========================= */

        .row-grid{
          display:flex;
          gap:18px;
          margin-bottom:14px;
        }

        .col{
          flex:1;
          min-width:0;
        }

        label{
          display:block;
          margin-bottom:8px;
          font-size:13px;
          font-weight:700;
          color:black;
        }

       input,
        select{
          width:100%;

          height:48px;

          border-radius:14px;

          border:1px solid #d1d5db;

          background:#ffffff;

          color:#111827;

          padding:0 14px;

          outline:none;

          transition:.2s ease;
        }

        /* DARK MODE */

        body.dark-theme input,
        body.dark-theme select{

          border:1px solid #334155;

          background:#0f172a;

          color:#fff;
        }

        input:focus,
        select:focus{
          border-color:#16a34a;
          box-shadow:0 0 0 3px rgba(22,163,74,.15);
        }

        /* =========================
          GREEN BUTTON
        ========================= */

        .green{
          margin-top:12px;

          border:none;

          height:46px;

          padding:0 22px;

          border-radius:14px;

          background:
          linear-gradient(
            135deg,
            #22c55e,
            #16a34a
          );

          color:#fff;

          font-size:14px;
          font-weight:700;

          cursor:pointer;

          transition:.25s ease;

          box-shadow:0 10px 20px rgba(34,197,94,.18);
        }

        .green:hover{
          transform:translateY(-3px);
          box-shadow:0 16px 28px rgba(34,197,94,.28);
        }

        /* =========================
          PRODUCT LIST
        ========================= */

        .top-row{
          margin-bottom:18px;
        }

        .top-row h3{
          margin-bottom:14px;
          font-size:18px;
        }

        .filters{
          display:flex;
          gap:14px;
        }

        /* LIGHT MODE */

        .filters input,
        .filters select{
          background:#ffffff;
        }

        /* DARK MODE */

        body.dark-theme .filters input,
        body.dark-theme .filters select{
          background:#0b1327;
        }

        /* =========================
          TABLE
        ========================= */

        .table-wrap{
          overflow:auto;
          border-radius:18px;
        }

        .product-table{
          width:100%;
          min-width:1250px;

          border-collapse:separate;
          border-spacing:0;
        }

        .product-table thead th{

          position:sticky;
          top:0;

          background:#1e293b;

          z-index:5;

          font-size:13px;
          letter-spacing:.4px;

          color:#94a3b8;

          padding:16px 14px;

          border-bottom:1px solid rgba(255,255,255,.06);
        }

        .product-table tbody tr{
          transition:.22s ease;
        }

        body.dark-theme .product-table tbody tr:nth-child(even){
            background:rgba(255,255,255,.02);
          }

          body:not(.dark-theme) .product-table tbody tr:nth-child(even){
            background:#f8fafc;
          }

        .product-table tbody tr:hover{
          background:#0f172a;
          transform:scale(1.003);
        }

        .product-table td{
          padding:16px 14px;
          border-bottom:1px solid rgba(255,255,255,.06);

          color:var(--text);

          font-weight:500;
        }

        /* LIGHT MODE TABLE */

          body:not(.dark-theme) .product-table td{
            color:#111827;
          }

          body:not(.dark-theme) .product-name{
            color:#111827;
          }

          body:not(.dark-theme) .product-table tbody tr{
            background:#ffffff;
          }

          body:not(.dark-theme) .product-table tbody tr:hover{
            background:#f8fafc;
          }

          /* DARK MODE TABLE */

          body.dark-theme .product-table td{
            color:#f1f5f9;
          }

          body.dark-theme .product-name{
            color:#f8fafc;
          }

        /* =========================
          PRODUCT AVATAR
        ========================= */

        .product-name{
          display:flex;
          align-items:center;
          gap:12px;
          font-weight:600;
        }

        .product-avatar{
          width:38px;
          height:38px;

          border-radius:12px;

          display:flex;
          align-items:center;
          justify-content:center;

          font-weight:800;

          background:
          linear-gradient(
            135deg,
            #2563eb,
            #16a34a
          );

          color:#fff;

          font-size:14px;
        }

        /* =========================
          LOW STOCK
        ========================= */

        .low-stock-row{
          border-left:4px solid #ef4444;
        }

        .low-stock{
          color:#ef4444;
          font-weight:800;
        }

        /* =========================
          STATUS BADGE
        ========================= */

        .badge{
          padding:7px 14px;

          border-radius:999px;

          color:#fff;

          font-size:11px;
          font-weight:800;

          letter-spacing:.3px;
        }

        /* =========================
          ACTION BUTTONS
        ========================= */

        .action-group{
          display:flex;
          gap:8px;
          align-items:center;
        }

        .mini-btn{
          border:none;

          height:34px;

          padding:0 14px;

          border-radius:10px;

          color:#fff;

          font-size:12px;
          font-weight:700;

          cursor:pointer;

          transition:.2s ease;
        }

        .mini-btn:hover{
          transform:translateY(-2px);
        }

        .btn-blue{
          background:
          linear-gradient(
            135deg,
            #3b82f6,
            #2563eb
          );
        }

        .btn-orange{
          background:
          linear-gradient(
            135deg,
            #f59e0b,
            #d97706
          );
        }

        .btn-green{
          background:
          linear-gradient(
            135deg,
            #22c55e,
            #16a34a
          );
        }

        .btn-red{
          background:
          linear-gradient(
            135deg,
            #ef4444,
            #dc2626
          );
        }

        /* =========================
          MOBILE
        ========================= */

        @media(max-width:900px){

          .stats-grid{
            grid-template-columns:1fr 1fr;
          }

          .row-grid{
            flex-direction:column;
          }

          .filters{
            flex-direction:column;
          }

        }

        @media(max-width:600px){

          .stats-grid{
            grid-template-columns:1fr;
          }

          .card{
            padding:18px;
            border-radius:20px;
          }

          .product-table{
            min-width:1000px;
          }

          .mini-btn{
            height:30px;
            padding:0 10px;
            font-size:11px;
          }

        }

      .sum-card{
        position:relative;

        padding:18px;

        border-radius:22px;

        background:#ffffff;

        border:1px solid #e5e7eb;

        overflow:hidden;

        transition:.25s ease;

        box-shadow:0 4px 14px rgba(0,0,0,.04);
      }

      /* ADD THIS */

      .sum-card::before{
        content:"";

        position:absolute;

        width:140px;
        height:140px;

        border-radius:50%;

        background:rgba(37,99,235,.04);

        top:-55px;
        right:-45px;
      }

      /* OPTIONAL SMALL GLOW */

      .sum-card::after{
        content:"";

        position:absolute;

        width:80px;
        height:80px;

        border-radius:50%;

        background:rgba(255,255,255,.55);

        top:18px;
        right:18px;

        filter:blur(10px);
      }

      /* HOVER */

      .sum-card:hover{
        transform:translateY(-4px);

        box-shadow:0 14px 28px rgba(0,0,0,.08);
      }
        body.dark-theme .sum-card{
        background:
        linear-gradient(
          145deg,
          #1e293b,
          #0f172a
        );

        border:1px solid rgba(255,255,255,.06);
      }

      body.dark-theme .sum-card::before{
        background:rgba(255,255,255,.04);
      }

      body.dark-theme .sum-card::after{
        background:rgba(255,255,255,.02);
      }
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
          <h4
            style={{
              fontWeight: 800,
              fontSize: 20,
              marginBottom: 18,
            }}
          >
            Product Information
          </h4>

          <div className="row-grid">
            <div className="col">
              <label>Product Name</label>
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
              <label> Product Category</label>
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
              <label>Selling Price</label>
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
                  <tr
                    key={p.id}
                    className={(p.stock || 0) < 15 ? "low-stock-row" : ""}
                  >
                    <td>
                      <div className="product-name">
                        <div className="product-avatar">
                          {(p.name || "P")[0]}
                        </div>

                        {p.name}
                      </div>
                    </td>
                    <td>{p.barcode}</td>
                    <td>{p.sku}</td>
                    <td>{p.category?.name || "-"}</td>
                    <td>₹{p.mrp}</td>
                    <td>₹{p.price}</td>
                    <td>{margin(p)}</td>
                    <td>{p.unit}</td>
                    <td className={(p.stock || 0) < 15 ? "low-stock" : ""}>
                      {p.stock || 0}
                    </td>

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

                    <td>
                      <div className="action-group">
                        {p.status === "PENDING" && (
                          <button
                            className="mini-btn btn-green"
                            onClick={() => handleApprove(p)}
                          >
                            Approve
                          </button>
                        )}

                        <button
                          className="mini-btn btn-blue"
                          onClick={() => handlePrice(p)}
                        >
                          Price
                        </button>

                        {p.status === "ACTIVE" ? (
                          <button
                            className="mini-btn btn-orange"
                            onClick={() => handleDeactivate(p.id)}
                          >
                            Off
                          </button>
                        ) : (
                          <button
                            className="mini-btn btn-green"
                            onClick={() => handleActivate(p.id)}
                          >
                            On
                          </button>
                        )}

                        <button
                          className="mini-btn btn-red"
                          onClick={() => handleDelete(p.id)}
                        >
                          Delete
                        </button>
                      </div>
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
