import React, { useEffect, useRef, useState } from "react";
import api from "../services/api";

export default function Procurement() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [logs, setLogs] = useState([]);

  const [summary, setSummary] = useState({
    totalPurchase: 0,
    totalPaid: 0,
    totalDue: 0,
    unpaidCount: 0,
  });

  const fileRef = useRef();

  const [form, setForm] = useState({
    productName: "",
    supplier: "",
    date: new Date().toISOString().split("T")[0],
    qty: "",
    costPrice: "",
    paidAmount: "",
    poNumber: "",
    invoiceRef: "",
    remarks: "",
  });

  const [filters, setFilters] = useState({
    supplier: "",
    status: "",
  });

  useEffect(() => {
    loadProducts();
    loadSuppliers();
    loadLogs();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.get("/products");

      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);

      setProducts([]);
    }
  };

  const loadSuppliers = async () => {
    try {
      const data = await api.get("/masters/suppliers");

      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);

      setSuppliers([]);
    }
  };

  const loadLogs = async () => {
    try {
      const data = await api.get("/procurement");

      const reversed = Array.isArray(data)
        ? [...data].reverse()
        : [];

      setLogs(reversed);

      calculateSummary(reversed);
    } catch (err) {
      console.log(err);

      setLogs([]);
    }
  };

  const calculateSummary = (rows) => {
    let totalPurchase = 0;
    let totalPaid = 0;
    let totalDue = 0;
    let unpaidCount = 0;

    rows.forEach((r) => {
      totalPurchase += Number(r.totalCost || 0);

      totalPaid += Number(r.paidAmount || 0);

      totalDue += Number(r.dueAmount || 0);

      if (r.paymentStatus !== "PAID") {
        unpaidCount++;
      }
    });

    setSummary({
      totalPurchase,
      totalPaid,
      totalDue,
      unpaidCount,
    });
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const createProcurement = async () => {
    try {
      const selectedProduct = products.find(
        (p) => p.name === form.productName
      );

      const selectedSupplier = suppliers.find(
        (s) => s.name === form.supplier
      );

      if (!selectedProduct) {
        alert("Select Product");

        return;
      }

      if (!selectedSupplier) {
        alert("Select Supplier");

        return;
      }

      await api.post("/procurement", {
        productId: selectedProduct.id,

        supplierId: selectedSupplier.id,

        qty: parseInt(form.qty),

        costPrice: parseFloat(form.costPrice),

        paidAmount: parseFloat(form.paidAmount || 0),

        poNumber: form.poNumber,

        invoiceRef: form.invoiceRef,

        remarks: form.remarks,
      });

      alert("Procurement Added");

      resetForm();

      loadLogs();

      loadProducts();
    } catch (err) {
      console.log(err);

      alert("Failed to create procurement");
    }
  };

  const resetForm = () => {
    setForm({
      productName: "",
      supplier: "",
      date: new Date().toISOString().split("T")[0],
      qty: "",
      costPrice: "",
      paidAmount: "",
      poNumber: "",
      invoiceRef: "",
      remarks: "",
    });
  };

  const importExcel = async (e) => {
    try {
      const file = e.target.files[0];

      if (!file) return;

      const fd = new FormData();

      fd.append("file", file);

      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://inventory-backend-final-1.onrender.com/api/procurement/import-excel",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: fd,
        }
      );

      const data = await res.json();

      console.log(data);

      alert("Excel Imported Successfully");

      loadLogs();

      loadProducts();
    } catch (err) {
      console.log(err);

      alert("Import failed");
    }
  };

  const updatePayment = async (id) => {
    try {
      const amt = prompt("Enter payment amount");

      if (!amt) return;

      await api.put(`/procurement/payment/${id}?amount=${amt}`);

      alert("Payment Updated");

      loadLogs();
    } catch (err) {
      console.log(err);

      alert("Payment update failed");
    }
  };

  const deleteRow = async (id) => {
    try {
      if (!window.confirm("Delete this procurement entry?")) return;

      await api.delete(`/procurement/${id}`);

      alert("Deleted Successfully");

      loadLogs();

      loadProducts();
    } catch (err) {
      console.log(err);

      alert("Delete failed");
    }
  };

  const filteredLogs = logs.filter((l) => {
    const supplierOk =
      !filters.supplier ||
      l.supplier
        ?.toLowerCase()
        .includes(filters.supplier.toLowerCase());

    const statusOk =
      !filters.status ||
      l.paymentStatus === filters.status;

    return supplierOk && statusOk;
  });

  const badgeColor = (status) => {
    if (status === "PAID") return "#16a34a";

    if (status === "PARTIAL") return "#d97706";

    return "#dc2626";
  };
  return (
    <>
      <style>{`
            .proc-page{
        padding:20px;
        background:var(--bg);
        min-height:100vh;
        color:var(--text);
      }

      .page-header{
        margin-bottom:22px;
      }

      .page-title{
        font-size:28px;
        font-weight:800;
        margin-bottom:5px;
      }

      .page-subtitle{
        color:var(--muted);
        font-size:13px;
      }

      .card{
        background:var(--surface);

        border:1px solid var(--border);

        border-radius:18px;

        padding:18px;

        margin-bottom:18px;

        transition:.25s ease;
      }

      .card:hover{
        border-color:#1f2937;
      }

      .small-title{
        font-size:14px;
        font-weight:800;
        color:var(--muted);
        margin-bottom:16px;

        display:flex;
        align-items:center;
        gap:8px;
      }

      /* SUMMARY */

      .summary-grid{
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
        gap:16px;
        margin-bottom:22px;
      }

      .sum-card{

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

.sum-card::before{
  content:"";

  position:absolute;

  width:150px;
  height:150px;

  border-radius:50%;

  background:rgba(37,99,235,.05);

  top:-55px;
  right:-45px;
}

.sum-card::after{
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

.sum-card:hover{
  transform:translateY(-5px);
  box-shadow:0 16px 32px rgba(0,0,0,.08);
}

.sum-card h4{

  margin:0 0 10px;

  font-size:14px;

  font-weight:700;

  color:#64748b;

  position:relative;

  z-index:2;
}

.sum-card h2{

  margin:0;

  font-size:42px;

  font-weight:800;

  position:relative;

  z-index:2;
}

/* COLORS */

.card-blue h2{
  color:#2563eb;
}

.card-green h2{
  color:#16a34a;
}

.card-orange h2{
  color:#f59e0b;
}

.card-red h2{
  color:#ef4444;
}

/* DARK MODE */

.dark-theme .sum-card{

  background:
  linear-gradient(
    145deg,
    #1e293b,
    #0f172a
  );

  border:1px solid rgba(255,255,255,.06);

  box-shadow:none;
}

.dark-theme .sum-card::before{
  background:rgba(255,255,255,.04);
}

.dark-theme .sum-card::after{
  background:rgba(255,255,255,.03);
}

.dark-theme .sum-card h4{
  color:#94a3b8;
}

      .card-blue h2{color:#3b82f6;}
      .card-green h2{color:#22c55e;}
      .card-orange h2{color:#f59e0b;}
      .card-red h2{color:#ef4444;}

      /* GRID */

      .grid4{
        display:grid;
        grid-template-columns:repeat(4,1fr);
        gap:16px;
      }

      .grid3{
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:16px;
      }

      .grid2{
        display:grid;
        grid-template-columns:repeat(2,1fr);
        gap:16px;
      }

      /* FORM */

      label{
        display:block;
        font-size:13px;
        font-weight:700;
        margin-bottom:8px;
        color:var(--muted);
      }

      input,
      select{
        width:100%;

        height:46px;

        border:1px solid var(--border);

        background:var(--bg);

        color:var(--text);

        border-radius:14px;

        padding:0 14px;

        box-sizing:border-box;

        outline:none;

        transition:.2s ease;
      }

      input:focus,
      select:focus{
        border-color:#22c55e;

        box-shadow:0 0 0 3px rgba(34,197,94,.10);
      }

      /* BUTTONS */

      .btn{
        border:none;

        height:42px;

        min-width:90px;

        padding:0 18px;

        border-radius:12px;

        font-size:13px;

        font-weight:700;

        cursor:pointer;

        transition:.2s ease;
      }

      .btn:hover{
        transform:translateY(-1px);
      }

      .green{
        background:#15803d;
        color:#fff;
      }

      .blue{
        background:#2563eb;
        color:#fff;
      }

      .red{
        background:#dc2626;
        color:#fff;
      }

      /* IMPORT */

      .import-sub{
        font-size:12px;
        color:var(--muted);
        margin-bottom:14px;
      }

      /* FILTER */

      .filter-wrap{
        position:relative;
      }

      .filter-icon{
        position:absolute;
        left:14px;
        top:50%;
        transform:translateY(-50%);
        color:var(--muted);
        font-size:13px;
      }

      .filter-input{
        padding-left:38px !important;
      }

      /* TABLE */

      .table-wrap{
        overflow:auto;
        border-radius:14px;
      }

      table{
        width:100%;
        min-width:1200px;
        border-collapse:separate;
        border-spacing:0;
      }

      thead{
        position:sticky;
        top:0;
        z-index:10;
      }

      th{
        padding:14px 10px;

        text-align:left;

        font-size:13px;

        font-weight:800;

        color:var(--muted);

        background:var(--surface);

        border-bottom:1px solid var(--border);
      }

      td{
        padding:16px 10px;

        border-bottom:1px solid var(--border);

        font-size:14px;
      }

      tbody tr{
        transition:.2s ease;
      }

      tbody tr:hover{
        background:rgba(255,255,255,.03);
      }

      /* BADGES */

      .badge{
        padding:5px 10px;

        border-radius:999px;

        color:#fff;

        font-size:11px;

        font-weight:700;

        display:inline-flex;

        align-items:center;
        justify-content:center;

        min-width:74px;
      }
        .action-row{
          display:flex;
          align-items:center;
          gap:10px;
          flex-wrap:wrap;
        }

        

        .action-btn{

          border:none;

          height:34px;

          min-width:72px;

          padding:0 14px;

          border-radius:10px;

          font-size:12px;

          font-weight:700;

          cursor:pointer;

          transition:.22s ease;

          display:flex;
          align-items:center;
          justify-content:center;

          color:#fff;
        }

        /* PAY BUTTON */

        .pay-btn{

          background:linear-gradient(
            135deg,
            #3b82f6,
            #2563eb
          );

          box-shadow:0 6px 14px rgba(37,99,235,.18);
        }

        .pay-btn:hover{

          transform:translateY(-2px);

          box-shadow:0 10px 18px rgba(37,99,235,.28);
        }

        /* DELETE BUTTON */

        .delete-btn{

          background:linear-gradient(
            135deg,
            #ef4444,
            #dc2626
          );

          box-shadow:0 6px 14px rgba(239,68,68,.18);
        }

        .delete-btn:hover{

          transform:translateY(-2px);

          box-shadow:0 10px 18px rgba(239,68,68,.28);
        }
      /* DARK MODE */

      .dark-theme .card{
        background:#162033;
      }

      .dark-theme input,
      .dark-theme select{
        background:#091224;
        border-color:#1f2937;
      }

      .dark-theme table th{
        background:#162033;
      }

      .delete-btn{

        background:linear-gradient(
          135deg,
          #ef4444,
          #dc2626
        );

        color:#fff;

        box-shadow:0 6px 14px rgba(239,68,68,.18);
      }

      .delete-btn:hover{
        transform:translateY(-2px);
        box-shadow:0 10px 18px rgba(239,68,68,.28);
      }

      /* MOBILE */

      @media(max-width:1000px){

        .grid4{
          grid-template-columns:repeat(2,1fr);
        }

      }

      @media(max-width:800px){

        .grid4,
        .grid3,
        .grid2{
          grid-template-columns:1fr;
        }

        .proc-page{
          padding:14px;
        }

        .card{
          padding:16px;
        }

        .summary-grid{
          gap:14px;
        }

        .btn{
          width:100%;
        }

      }


      @media(max-width:768px){

        .action-row{
          gap:8px;
        }

        .action-btn{

          height:32px;

          min-width:64px;

          padding:0 12px;

          font-size:11px;

          border-radius:9px;
        }

      }
      `}</style>

      <div className="proc-page">
        <div className="page-header">
          <h1 className="page-title">Procurement</h1>
          <p className="page-subtitle">
            Purchase management with due tracking, payment updates and supplier
            control
          </p>
        </div>

        {/* SUMMARY */}
        <div className="summary-grid">
          <div className="sum-card card-blue">
            <h4>Total Purchase</h4>
            <h2>₹{summary.totalPurchase.toFixed(2)}</h2>
          </div>

          <div className="sum-card card-green">
            <h4>Total Paid</h4>
            <h2>₹{summary.totalPaid.toFixed(2)}</h2>
          </div>

          <div className="sum-card card-orange">
            <h4>Total Due</h4>
            <h2>₹{summary.totalDue.toFixed(2)}</h2>
          </div>

          <div className="sum-card card-red">
            <h4>Open Bills</h4>
            <h2>{summary.unpaidCount}</h2>
          </div>
        </div>
        {/* IMPORT */}
        <div className="card">
          <div className="small-title">📄 EXCEL IMPORT</div>

          <div className="import-sub">
            Upload supplier invoice Excel files (.xlsx, .xls)
          </div>

          <button className="btn blue" onClick={() => fileRef.current.click()}>
            Upload Invoice Excel
          </button>

          <input
            type="file"
            ref={fileRef}
            style={{ display: "none" }}
            accept=".xlsx,.xls"
            onChange={importExcel}
          />
        </div>

        {/* FORM */}
        <div className="card">
          <div className="small-title">📦 NEW PROCUREMENT</div>

          <div className="grid3">
            <div>
              <label>Product</label>
              <select
                name="productName"
                value={form.productName}
                onChange={handleChange}
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Supplier</label>
              <select
                name="supplier"
                value={form.supplier}
                onChange={handleChange}
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid4" style={{ marginTop: 16 }}>
            <div>
              <label>Qty</label>
              <input name="qty" value={form.qty} onChange={handleChange} />
            </div>

            <div>
              <label>Cost Price</label>
              <input
                name="costPrice"
                value={form.costPrice}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Paid Amount</label>
              <input
                name="paidAmount"
                value={form.paidAmount}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>PO Number</label>
              <input
                name="poNumber"
                value={form.poNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid2" style={{ marginTop: 16 }}>
            <div>
              <label>Invoice Ref</label>
              <input
                name="invoiceRef"
                value={form.invoiceRef}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Remarks</label>
              <input
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            className="btn green"
            style={{ marginTop: 18 }}
            onClick={createProcurement}
          >
            + Save Procurement
          </button>
        </div>

        {/* FILTER */}
        <div className="card">
          <div className="small-title">🔍 FILTERS</div>

          <div className="grid2">
            <div className="filter-wrap">
              <span className="filter-icon">🔍</span>

              <input
                className="filter-input"
                placeholder="Search Supplier..."
                value={filters.supplier}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    supplier: e.target.value,
                  })
                }
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: e.target.value,
                })
              }
            >
              <option value="">All Status</option>
              <option value="PAID">PAID</option>
              <option value="PARTIAL">PARTIAL</option>
              <option value="UNPAID">UNPAID</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="card">
          <div className="small-title">📋 PROCUREMENT HISTORY</div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Supplier</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="9">No records found</td>
                  </tr>
                ) : (
                  filteredLogs.map((l) => (
                    <tr key={l.id}>
                      <td>{l.product?.name}</td>
                      <td>{l.supplier?.name}</td>
                      <td>{l.qty}</td>
                      <td>₹{l.totalCost}</td>
                      <td>₹{l.paidAmount || 0}</td>
                      <td
                        style={{
                          color: l.dueAmount > 0 ? "#dc2626" : "inherit",
                          fontWeight: 700,
                        }}
                      >
                        ₹{l.dueAmount || 0}
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            width: "50%",
                            textAlign: "center",
                            background: badgeColor(l.paymentStatus),
                          }}
                        >
                          {l.paymentStatus}
                        </span>
                      </td>
                      <td>{l.date}</td>
                      <td>
                        <div className="action-row">
                          {l.dueAmount > 0 && (
                            <button
                              className="action-btn pay-btn"
                              onClick={() => updatePayment(l.id)}
                            >
                              Pay
                            </button>
                          )}

                          <button
                            className="action-btn delete-btn"
                            onClick={() => deleteRow(l.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}