import React, { useEffect, useState } from "react";
import api from "../services/api";
export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("ALL");

  const [action, setAction] = useState({
    productId: "",
    qty: "",
    remarks: "",
    mode: "IN",
  });

  useEffect(() => {
    loadProducts();
    loadHistory();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get("/inventory");

      setProducts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await api.get("/inventory/history");
      setHistory(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const refreshAll = () => {
    loadProducts();
    loadHistory();
  };

  const getStatus = (item) => {
    const stock = item.stock || 0;
    const reorder = item.reorderLevel || 10;
    const safety = item.safetyStock || 5;

    if (stock <= safety) return "REORDER";
    if (stock <= reorder) return "LOW";
    return "SAFE";
  };

  const getBarColor = (status) => {
    if (status === "REORDER") return "#ef4444";
    if (status === "LOW") return "#f59e0b";
    return "#22c55e";
  };

  const filteredProducts = products.filter((item) => {
    const status = getStatus(item);

    if (filter === "ALL") return true;
    if (filter === "REORDER") return status === "REORDER";
    if (filter === "LOW") return status === "LOW";
    if (filter === "SAFE") return status === "SAFE";
    if (filter === "A") return item.abcClass === "A";
    if (filter === "B") return item.abcClass === "B";
    if (filter === "C") return item.abcClass === "C";

    return true;
  });

  const summary = {
    total: products.length,
    low: products.filter((p) => getStatus(p) === "LOW").length,
    reorder: products.filter((p) => getStatus(p) === "REORDER").length,
    safe: products.filter((p) => getStatus(p) === "SAFE").length,
  };

  const damageStock = async () => {
    if (!action.productId || !action.qty) {
      alert("Select product & qty");
      return;
    }

    try {
      await api.post(
        `/inventory/damage?productId=${action.productId}&qty=${action.qty}&remarks=${action.remarks}`,
      );

      alert("Damaged stock updated");
      resetAction();
      refreshAll();
    } catch (e) {
      alert("Failed");
    }
  };

  const returnStock = async () => {
    if (!action.productId || !action.qty) {
      alert("Select product & qty");
      return;
    }

    try {
      await api.post(
        `/inventory/damage?productId=${action.productId}&qty=${action.qty}&remarks=${action.remarks}`,
      );

      alert("Return stock added");
      resetAction();
      refreshAll();
    } catch (e) {
      alert("Failed");
    }
  };

  const adjustStock = async () => {
    if (!action.productId || !action.qty) {
      alert("Select product & qty");
      return;
    }

    try {
      await api.post(
        `/inventory/damage?productId=${action.productId}&qty=${action.qty}&remarks=${action.remarks}`,
      );

      alert("Stock adjusted");
      resetAction();
      refreshAll();
    } catch (e) {
      alert("Failed");
    }
  };

  const resetAction = () => {
    setAction({
      productId: "",
      qty: "",
      remarks: "",
      mode: "IN",
    });
  };

  const txnColor = (type) => {
    if (type === "RETURN" || type === "ADJUST_IN") return "#16a34a";

    if (type === "DAMAGE" || type === "ADJUST_OUT") return "#dc2626";

    return "#2563eb";
  };

  return (
    <>
      <style>{`
      
      
      .inventory-wrap{
        width:100%;
      }


      .summary-grid{
        display:grid;
        grid-template-columns:repeat(4,1fr);
        gap:18px;
        margin-bottom:22px;
      }

      .sum-card{
        background:#ffffff;
        border:1px solid #e5e7eb;
        border-radius:24px;
        padding:24px;
        position:relative;
        overflow:hidden;
        transition:.3s ease;
        cursor:pointer;
        box-shadow:0 4px 18px rgba(15,23,42,.04);
      }

      .sum-card:hover{
        transform:translateY(-5px);
        box-shadow:0 18px 40px rgba(0,0,0,.08);
      }

      .sum-card::before{
        content:"";
        position:absolute;
        width:120px;
        height:120px;
        border-radius:50%;
        background:rgba(37,99,235,.05);
        right:-30px;
        top:-30px;
      }

      .sum-title{
        font-size:14px;
        font-weight:700;
        color:#64748b;
        margin-bottom:14px;
      }

      .sum-number{
        font-size:42px;
        font-weight:800;
      }

      .sum-blue .sum-number{
        color:#2563eb;
      }

      .sum-green .sum-number{
        color:#16a34a;
      }

      .sum-orange .sum-number{
        color:#f59e0b;
      }

      .sum-red .sum-number{
        color:#ef4444;
      }


      .inventory-card{
        background:#ffffff;
        border:1px solid #e5e7eb;
        border-radius:24px;
        padding:24px;
        margin-bottom:22px;
        box-shadow:0 4px 18px rgba(15,23,42,.04);
      }

      .inventory-top{
        display:flex;
        justify-content:space-between;
        align-items:center;
        flex-wrap:wrap;
        gap:16px;
        margin-bottom:22px;
      }

      .inventory-top h3{
        font-size:18px;
        font-weight:800;
        color:#0f172a;
      }


      .action-grid{
        display:grid;
        grid-template-columns:2fr 1fr 1fr 2fr;
        gap:14px;
      }

      input,
      select{
        width:100%;
        padding:14px 16px;
        border-radius:14px;
        border:1px solid #dbe1ea;
        background:#ffffff;
        color:#0f172a;
        font-size:15px;
        transition:.2s;
        outline:none;
      }

      input:focus,
      select:focus{
        border-color:#2563eb;
        box-shadow:0 0 0 4px rgba(37,99,235,.08);
      }

      .btn{
        border:none;
        padding:12px 18px;
        border-radius:14px;
        color:#fff;
        font-weight:700;
        cursor:pointer;
        transition:.25s;
        min-width:130px;
        box-shadow:0 8px 20px rgba(0,0,0,.08);
      }

      .btn:hover{
        transform:translateY(-2px);
      }

      .green{
        background:linear-gradient(135deg,#22c55e,#16a34a);
      }

      .yellow{
        background:linear-gradient(135deg,#f59e0b,#d97706);
      }

      .red{
        background:linear-gradient(135deg,#ef4444,#dc2626);
      }

      .filter-group{
        display:flex;
        gap:10px;
        flex-wrap:wrap;
      }

      .filter-chip{
        border:none;
        padding:10px 16px;
        border-radius:999px;
        background:#f1f5f9;
        color:#334155;
        font-weight:700;
        cursor:pointer;
        transition:.2s;
      }

      .filter-chip:hover{
        background:#e2e8f0;
        transform:translateY(-2px);
      }

      .chip-active{
        background:#2563eb !important;
        color:#fff !important;
      }

      .inventory-scroll{
        overflow:auto;
        border-radius:18px;
      }

      .inventory-table,
      .history-table{
        width:100%;
        min-width:1100px;
        border-collapse:collapse;
        background:#ffffff;
      }

      .inventory-table thead th,
      .history-table thead th{
        text-align:left;
        padding:18px 14px;
        color:#64748b;
        font-size:13px;
        letter-spacing:.5px;
        border-bottom:1px solid #e5e7eb;
        background:#f8fafc;
        position:sticky;
        top:0;
        z-index:10;
      }

      .inventory-table tbody tr,
      .history-table tbody tr{
        border-bottom:1px solid #edf2f7;
        transition:.2s;
        background:#ffffff;
      }

      .inventory-table tbody tr:hover,
      .history-table tbody tr:hover{
        background:#f8fafc;
      }

      .inventory-table td,
      .history-table td{
        padding:18px 14px;
        color:#0f172a;
      }

      .safe-row{
        border-left:4px solid #22c55e;
      }

      .low-row{
        border-left:4px solid #f59e0b;
      }

      .reorder-row{
        border-left:4px solid #ef4444;
      }

      .stock-box{
        display:flex;
        flex-direction:column;
        gap:8px;
      }

      .stock-number{
        font-size:18px;
        font-weight:800;
      }

      .stock-safe{
        color:#16a34a;
      }

      .stock-low{
        color:#f59e0b;
      }

      .stock-zero{
        color:#ef4444;
      }

      .bar-bg{
        width:100%;
        height:8px;
        background:#e5e7eb;
        border-radius:999px;
        overflow:hidden;
      }

      .bar-fill{
        height:100%;
        border-radius:999px;
        transition:width .4s ease;
      }

      .badge{
        padding:8px 14px;
        border-radius:999px;
        color:#fff;
        font-size:12px;
        font-weight:800;
      }

      .circle-badge{
        width:34px;
        height:34px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:800;
        color:#fff;
      }

      .abc{
        background:#7c3aed;
      }

      .fsn{
        background:#2563eb;
      }

      .mini-badge{
        padding:8px 14px;
        border-radius:999px;
        color:#fff;
        font-size:12px;
        font-weight:800;
      }

      body.dark-theme .sum-card,
      body.dark-theme .inventory-card{
        background:linear-gradient(145deg,#111827,#0f172a);
        border:1px solid #1e293b;
        box-shadow:none;
      }

      body.dark-theme .sum-card::before{
        background:rgba(255,255,255,.04);
      }

      body.dark-theme .sum-title,
      body.dark-theme .inventory-top h3{
        color:#e2e8f0;
      }

      body.dark-theme input,
      body.dark-theme select{
        background:#0f172a;
        border:1px solid #334155;
        color:#ffffff;
      }

      body.dark-theme .filter-chip{
        background:#1e293b;
        color:#e2e8f0;
      }

      body.dark-theme .filter-chip:hover{
        background:#334155;
      }

      body.dark-theme .inventory-table,
      body.dark-theme .history-table{
        background:transparent;
      }

      body.dark-theme .inventory-table thead th,
      body.dark-theme .history-table thead th{
        background:#111827;
        color:#94a3b8;
        border-bottom:1px solid #334155;
      }

      body.dark-theme .inventory-table tbody tr,
      body.dark-theme .history-table tbody tr{
        background:transparent;
        border-bottom:1px solid #334155;
      }

      body.dark-theme .inventory-table tbody tr:hover,
      body.dark-theme .history-table tbody tr:hover{
        background:rgba(255,255,255,.03);
      }

      body.dark-theme .inventory-table td,
      body.dark-theme .history-table td{
        color:#f8fafc;
      }

      body.dark-theme .bar-bg{
        background:#334155;
      }

      @media(max-width:900px){

        .summary-grid{
          grid-template-columns:1fr 1fr;
        }

        .action-grid{
          grid-template-columns:1fr;
        }
      }

      @media(max-width:600px){

        .summary-grid{
          grid-template-columns:1fr;
        }

        .filter-group{
          overflow:auto;
          white-space:nowrap;
          flex-wrap:nowrap;
          padding-bottom:6px;
        }

        .btn{
          width:100%;
        }

        .inventory-card{
          padding:18px;
        }

        .sum-card{
          padding:20px;
        }

        .sum-number{
          font-size:34px;
        }
      }

      `}</style>

      <div className="page-content inventory-wrap">
        <div className="page-header">
          <h1>Inventory</h1>
          <p>
            Live stock controls with damage, returns, adjustments and movement
            tracking.
          </p>
        </div>

        {/* SUMMARY */}

        <div className="summary-grid">
          <div className="sum-card sum-blue">
            <div className="sum-title">📦 Total Products</div>
            <div className="sum-number">{summary.total}</div>
          </div>

          <div className="sum-card sum-green">
            <div className="sum-title">✅ Safe Stock</div>
            <div className="sum-number">{summary.safe}</div>
          </div>

          <div className="sum-card sum-orange">
            <div className="sum-title">⚠ Low Stock</div>
            <div className="sum-number">{summary.low}</div>
          </div>

          <div className="sum-card sum-red">
            <div className="sum-title">🔁 Reorder Now</div>
            <div className="sum-number">{summary.reorder}</div>
          </div>
        </div>

        {/* STOCK ACTIONS */}

        <div className="inventory-card">
          <div className="inventory-top">
            <h3>⚙ STOCK ACTIONS</h3>
          </div>

          <div className="action-grid">
            <select
              value={action.productId}
              onChange={(e) =>
                setAction({
                  ...action,
                  productId: e.target.value,
                })
              }
            >
              <option value="">Select Product</option>

              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <input
              placeholder="Qty"
              value={action.qty}
              onChange={(e) =>
                setAction({
                  ...action,
                  qty: e.target.value,
                })
              }
            />

            <select
              value={action.mode}
              onChange={(e) =>
                setAction({
                  ...action,
                  mode: e.target.value,
                })
              }
            >
              <option value="IN">Adjust In</option>
              <option value="OUT">Adjust Out</option>
            </select>

            <input
              placeholder="Remarks"
              value={action.remarks}
              onChange={(e) =>
                setAction({
                  ...action,
                  remarks: e.target.value,
                })
              }
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 18,
            }}
          >
            <button className="btn green" onClick={returnStock}>
              + Return
            </button>

            <button className="btn yellow" onClick={adjustStock}>
              ⇄ Adjust
            </button>

            <button className="btn red" onClick={damageStock}>
              - Damage
            </button>
          </div>
        </div>

        {/* STOCK LEVELS */}

        <div className="inventory-card">
          <div className="inventory-top">
            <h3>📋 STOCK LEVELS</h3>

            <div className="filter-group">
              <button
                className={`filter-chip ${filter === "ALL" ? "chip-active" : ""}`}
                onClick={() => setFilter("ALL")}
              >
                All
              </button>

              <button
                className={`filter-chip ${filter === "REORDER" ? "chip-active" : ""}`}
                onClick={() => setFilter("REORDER")}
              >
                🔴 Reorder
              </button>

              <button
                className={`filter-chip ${filter === "LOW" ? "chip-active" : ""}`}
                onClick={() => setFilter("LOW")}
              >
                🟠 Low
              </button>

              <button
                className={`filter-chip ${filter === "SAFE" ? "chip-active" : ""}`}
                onClick={() => setFilter("SAFE")}
              >
                🟢 Safe
              </button>

              <button
                className={`filter-chip ${filter === "A" ? "chip-active" : ""}`}
                onClick={() => setFilter("A")}
              >
                A-Class
              </button>

              <button
                className={`filter-chip ${filter === "B" ? "chip-active" : ""}`}
                onClick={() => setFilter("B")}
              >
                B-Class
              </button>

              <button
                className={`filter-chip ${filter === "C" ? "chip-active" : ""}`}
                onClick={() => setFilter("C")}
              >
                C-Class
              </button>
            </div>
          </div>

          <div className="inventory-scroll">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>SKU</th>
                  <th>CATEGORY</th>
                  <th>STOCK</th>
                  <th>UNIT</th>
                  <th>REORDER</th>
                  <th>SAFETY</th>
                  <th>STATUS</th>
                  <th>ABC</th>
                  <th>FSN</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((item) => {
                  const status = getStatus(item);

                  return (
                    <tr
                      key={item.id}
                      className={
                        status === "SAFE"
                          ? "safe-row"
                          : status === "LOW"
                            ? "low-row"
                            : "reorder-row"
                      }
                    >
                      <td>{item.name}</td>

                      <td>{item.sku}</td>

                      <td>{item.category?.name || "-"}</td>

                      <td>
                        <div className="stock-box">
                          <span
                            className={`stock-number ${
                              status === "SAFE"
                                ? "stock-safe"
                                : status === "LOW"
                                  ? "stock-low"
                                  : "stock-zero"
                            }`}
                          >
                            {item.stock || 0}
                          </span>

                          <div className="bar-bg">
                            <div
                              className="bar-fill"
                              style={{
                                width: `${Math.min(
                                  (item.stock || 0) * 2,
                                  100,
                                )}%`,
                                background: getBarColor(status),
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td>{item.unit}</td>

                      <td>{item.reorderLevel || 10}</td>

                      <td>{item.safetyStock || 5}</td>

                      <td>
                        <span
                          className="badge"
                          style={{
                            background:
                              status === "SAFE"
                                ? "#22c55e"
                                : status === "LOW"
                                  ? "#f59e0b"
                                  : "#ef4444",
                          }}
                        >
                          {status}
                        </span>
                      </td>

                      <td>
                        <span className="circle-badge abc">
                          {item.abcClass || "C"}
                        </span>
                      </td>

                      <td>
                        <span className="circle-badge fsn">
                          {item.fsnClass || "N"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* HISTORY */}

        <div className="inventory-card">
          <div className="inventory-top">
            <h3>⚡ STOCK ACTION HISTORY</h3>
          </div>

          <div className="inventory-scroll">
            <table className="history-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>ACTION</th>
                  <th>QTY</th>
                  <th>REMARKS</th>
                  <th>TIME</th>
                </tr>
              </thead>

              <tbody>
                {history
                  .filter(
                    (h) =>
                      h.type === "RETURN" ||
                      h.type === "DAMAGE" ||
                      h.type === "ADJUST_IN" ||
                      h.type === "ADJUST_OUT",
                  )
                  .map((h) => (
                    <tr key={h.id}>
                      <td>{h.product?.name}</td>

                      <td>
                        <span
                          className="mini-badge"
                          style={{
                            background: txnColor(h.type),
                          }}
                        >
                          {h.type}
                        </span>
                      </td>

                      <td>{h.qty}</td>

                      <td>{h.remarks || "-"}</td>

                      <td>
                        {h.createdAt?.replace("T", " ")?.substring(0, 19)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
