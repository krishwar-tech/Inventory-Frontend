import React, { useEffect, useState } from "react";
import axios from "axios";

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
      const res = await axios.get("http://http://https://inventory-backend-final-1.onrender.com/inventory");
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await axios.get(
        "http://http://https://inventory-backend-final-1.onrender.com/inventory/history",
      );
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
      await axios.post(
        `http://http://https://inventory-backend-final-1.onrender.com/inventory/damage?productId=${action.productId}&qty=${action.qty}&remarks=${action.remarks}`,
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
      await axios.post(
        `http://http://https://inventory-backend-final-1.onrender.com/inventory/return?productId=${action.productId}&qty=${action.qty}&remarks=${action.remarks}`,
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
      await axios.post(
        `http://http://https://inventory-backend-final-1.onrender.com/inventory/adjust?productId=${action.productId}&qty=${action.qty}&mode=${action.mode}&remarks=${action.remarks}`,
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
          gap:16px;
          margin-bottom:18px;
        }

        .sum-card{
          padding:20px;
          border-radius:20px;
          background:var(--surface); 
          border:1px solid var(--border);
          transition:.25s;
          cursor:pointer;
          position:relative;
          overflow:hidden;
        }

        .sum-card:hover{
          transform:translateY(-6px) scale(1.02);
          box-shadow:0 14px 35px rgba(0,0,0,0.25);
          border-color:#16a34a;
        }

        .sum-card::before{
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

        .sum-card:hover::before{
          opacity:1;
        }

        body.dark-theme .sum-card{
          background:linear-gradient(145deg,#1f2937,#111827);
          border:1px solid #374151;
        }

        .inventory-card{
          background:var(--surface);
          border:1px solid var(--border);
          border-radius:22px;
          padding:22px;
          margin-bottom:16px;
          transition:.25s;
        }

        .inventory-card:hover{
          box-shadow:0 10px 28px rgba(0,0,0,0.05);
        }

        .action-grid{
          display:grid;
          grid-template-columns:2fr 1fr 1fr 2fr;
          gap:12px;
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
          background:linear-gradient(135deg,#16a34a,#15803d);
          color:#fff;
          border:none;
          padding:10px 16px;
          border-radius:12px;
          font-weight:700;
          cursor:pointer;
          transition:.2s;
        }

        .yellow{
          background:linear-gradient(135deg,#f59e0b,#d97706);
          color:#fff;
          border:none;
          padding:10px 16px;
          border-radius:12px;
          font-weight:700;
          cursor:pointer;
        }

        .red{
          background:linear-gradient(135deg,#ef4444,#dc2626);
          color:#fff;
          border:none;
          padding:10px 16px;
          border-radius:12px;
          font-weight:700;
          cursor:pointer;
        }

        button:hover{
          transform:translateY(-2px);
          box-shadow:0 6px 18px rgba(0,0,0,0.1);
        }

        .filter-group button{
          padding:8px 14px;
          border-radius:14px;
          border:none;
          font-weight:600;
          cursor:pointer;
          transition:.2s;
          background:#f1f5f9;
        }

        .filter-group button:hover{
          transform:scale(1.05);
        }

        .inventory-scroll{
          overflow:auto;
        }

        .inventory-table{
          min-width:1100px;
          width:100%;
          border-collapse:separate;
          border-spacing:0 8px;
        }

        .inventory-table tr{
          background:var(--surface);
          transition:.2s;
        }

        .inventory-table tr:hover{
          transform:scale(1.01);
          box-shadow:0 6px 18px rgba(0,0,0,0.05);
        }

        .inventory-table td, th{
          padding:12px;
        }

        .stock-box{
          display:flex;
          flex-direction:column;
          gap:4px;
        }

        .bar-bg{
          width:100%;
          height:6px;
          background:#e5e7eb;
          border-radius:10px;
          overflow:hidden;
        }

        .bar-fill{
          height:100%;
          border-radius:10px;
        }

        .badge{
          padding:6px 10px;
          border-radius:20px;
          color:#fff;
          font-size:12px;
          font-weight:700;
        }

        .circle-badge{
          width:26px;
          height:26px;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          font-weight:700;
          color:#fff;
        }

        .abc{
          background:#7c3aed;
        }

        .fsn{
          background:#2563eb;
        }

        .mini-badge{
          padding:6px 10px;
          border-radius:20px;
          color:#fff;
          font-size:12px;
          font-weight:700;
        }

        @media(max-width:768px){
          .summary-grid{
            grid-template-columns:1fr 1fr;
          }

          .action-grid{
            grid-template-columns:1fr;
          }
        }

        @media(max-width:480px){
          .summary-grid{
            grid-template-columns:1fr;
          }
        }
        .sum-blue h2 { color:#3b82f6; }
        .sum-green h2 { color:#16a34a; }
        .sum-orange h2 { color:#f59e0b; }
        .sum-red h2 { color:#dc2626; }
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
            <h4>Total Products</h4>
            <h2>{summary.total}</h2>
          </div>

          <div className="sum-card sum-green">
            <h4>Safe Stock</h4>
            <h2>{summary.safe}</h2>
          </div>

          <div className="sum-card sum-orange">
            <h4>Low Stock</h4>
            <h2>{summary.low}</h2>
          </div>

          <div className="sum-card sum-red">
            <h4>Reorder Now</h4>
            <h2>{summary.reorder}</h2>
          </div>
        </div>

        {/* STOCK ACTIONS */}
        <div className="card inventory-card">
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
              gap: 10,
              flexWrap: "wrap",
              marginTop: 14,
            }}
          >
            <button className="green" onClick={returnStock}>
              + Return
            </button>

            <button className="yellow" onClick={adjustStock}>
              ⇄ Adjust
            </button>

            <button className="red" onClick={damageStock}>
              - Damage
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="card inventory-card">
          <div className="inventory-top">
            <h3>📋 STOCK LEVELS</h3>

            <div className="filter-group">
              <button onClick={() => setFilter("ALL")}>All</button>

              <button onClick={() => setFilter("REORDER")} className="red">
                ● Reorder
              </button>

              <button onClick={() => setFilter("LOW")} className="yellow">
                ● Low
              </button>

              <button onClick={() => setFilter("SAFE")} className="green">
                ● Safe
              </button>

              <button onClick={() => setFilter("A")} className="purple">
                A-Class
              </button>

              <button onClick={() => setFilter("B")} className="blue">
                B-Class
              </button>

              <button onClick={() => setFilter("C")} className="gray">
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
                    <tr key={item.id}>
                      <td>{item.name}</td>

                      <td>{item.sku}</td>

                      <td>{item.category?.name || "-"}</td>

                      <td>
                        <div className="stock-box">
                          <span>{item.stock || 0}</span>

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
                          className={`badge ${
                            status === "SAFE"
                              ? "green"
                              : status === "LOW"
                                ? "yellow"
                                : "red"
                          }`}
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

        {/* STOCK ACTION HISTORY */}
        <div className="card inventory-card">
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
