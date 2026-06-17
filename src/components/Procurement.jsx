import React, { useEffect, useRef, useState } from "react";
import api from "../services/api";

export default function Procurement() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [payAmount, setPayAmount] = useState("");
  const [showPayInput, setShowPayInput] = useState(false);
  const [showGrnModal, setShowGrnModal] = useState(false);

  const [selectedGrn, setSelectedGrn] = useState([]);

  const [selectedGrnNumber, setSelectedGrnNumber] = useState("");

  const [summary, setSummary] = useState({
    totalPurchase: 0,
    totalPaid: 0,
    totalDue: 0,
    unpaidCount: 0,
  });

  const fileRef = useRef();

  const [form, setForm] = useState({
    supplier: "",
    invoiceRef: "",
  });

  const [items, setItems] = useState([
    {
      productId: "",
      qty: "",
      costPrice: "",
      manufactureDate: "",
    },
  ]);

  const [filters, setFilters] = useState({
    supplier: "",
    status: "",
  });

  const refreshAll = async () => {
    await loadProducts();
    await loadSuppliers();
    await loadLogs();
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.get("/products");

      setProducts(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.log(err);

      setProducts([]);
    }
  };

  const loadSuppliers = async () => {
    try {
      const data = await api.get("/masters/suppliers");
      setSuppliers(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.log(err);

      setSuppliers([]);
    }
  };

  const loadLogs = async () => {
    try {
      const data = await api.get("/procurement/grn");
      const reversed = Array.isArray(data.data) ? [...data.data].reverse() : [];
      setLogs(reversed);
      await loadSummary(); // ✅ separate summary load
    } catch (err) {
      console.log(err);
      setLogs([]);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await api.get("/procurement"); // flat list with paidAmount, dueAmount
      const rows = Array.isArray(data.data) ? data.data : [];

      let totalPurchase = 0;
      let totalPaid = 0;
      let totalDue = 0;
      let unpaidCount = 0;

      // group by GRN to count open bills per GRN
      const grnMap = {};
      rows.forEach((r) => {
        totalPurchase += Number(r.totalCost || 0);
        totalPaid += Number(r.paidAmount || 0);
        totalDue += Number(r.dueAmount || 0);
        if (r.grnNumber) {
          if (!grnMap[r.grnNumber]) grnMap[r.grnNumber] = [];
          grnMap[r.grnNumber].push(r);
        }
      });

      // a GRN is "open" if any of its rows is not PAID
      Object.values(grnMap).forEach((grnRows) => {
        const anyUnpaid = grnRows.some((r) => r.paymentStatus !== "PAID");
        if (anyUnpaid) unpaidCount++;
      });

      setSummary({ totalPurchase, totalPaid, totalDue, unpaidCount });
    } catch (err) {
      console.log(err);
    }
  }
  const addItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        qty: "",
        costPrice: "",
        manufactureDate: "",
      },
    ]);
  };

  const updateItem = (index, field, value) => {
    const copy = [...items];

    copy[index][field] = value;

    setItems(copy);
  };

  const removeItem = (index) => {
    const copy = [...items];

    copy.splice(index, 1);

    setItems(copy);
  };

  const createGrn = async () => {
    try {
      const supplier = suppliers.find((s) => s.name === form.supplier);

      if (!supplier) {
        alert("Select Supplier");
        return;
      }

      const payload = {
        supplierId: supplier.id,
        invoiceRef: form.invoiceRef || "NA",
        items,
      };

      const res = await api.post("/procurement/grn", payload);

      alert(`GRN Created : ${res.data.grnNumber}`);

      setForm({
        supplier: "",
        invoiceRef: "",
      });

      setItems([
        {
          productId: "",
          qty: "",
          costPrice: "",
        },
      ]);

      await refreshAll();
    } catch (e) {
      console.log(e);

      alert("Failed to create GRN");
    }
  };

  const openGrn = async (grnNumber) => {
    try {
      const res = await api.get(`/procurement/grn/${grnNumber}`);

      setSelectedGrn(res.data || []);

      setSelectedGrnNumber(grnNumber);

      setShowGrnModal(true);
    } catch (err) {
      console.error(err);

      alert("Unable to load GRN");
    }
  };

  const payGrn = async () => {
    if (!payAmount || isNaN(payAmount) || Number(payAmount) <= 0) {
      alert("Enter a valid amount");
      return;
    }
    try {
      // pay each procurement row in this GRN
      for (const p of selectedGrn) {
        await api.put(`/procurement/payment/${p.id}?amount=${payAmount}`);
      }
      alert("Payment recorded successfully");
      setShowPayInput(false);
      setPayAmount("");
      await refreshAll();
      // refresh modal data too
      const res = await api.get(`/procurement/grn/${selectedGrnNumber}`);
      setSelectedGrn(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }
  };

  const deleteGrn = async (grnNumber) => {
    const ok = window.confirm(`Delete ${grnNumber} ?`);

    if (!ok) return;

    try {
      await api.delete(`/procurement/grn/${grnNumber}`);

      await refreshAll(); // ✅ was loadGrnSummary() — doesn't exist

      // also close the modal if it's open
      if (showGrnModal && selectedGrnNumber === grnNumber) {
        setShowGrnModal(false);
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const importExcel = async (e) => {
    try {
      const file = e.target.files[0];

      if (!file) return;

      const fd = new FormData();

      fd.append("file", file);

      const token = localStorage.getItem("token");

      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
      const res = await fetch(`${baseUrl}/api/procurement/import-excel`, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: fd,
      });

      const data = await res.json();

      console.log(data);

      alert("Excel Imported Successfully");

      await refreshAll();
    } catch (err) {
      console.log(err);

      alert("Import failed");
    }
  };
  const filteredLogs = logs.filter((l) => {
    const supplierName = String(l.supplier || "").toLowerCase(); // ✅ remove ?.name

    const supplierOk =
      !filters.supplier ||
      supplierName.includes(filters.supplier.toLowerCase());

    const statusOk = !filters.status || l.paymentStatus === filters.status;

    return supplierOk && statusOk;
  });

  const isGrnPaid =
    selectedGrn.length > 0 &&
    selectedGrn.every((p) => p.paymentStatus === "PAID");

 
  return (
    <>
      <style>{`

      .grid5 {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 12px;
  align-items: center;
}

@media(max-width:1000px) {
  .grid5 { grid-template-columns: 1fr 1fr; }
}

@media(max-width:800px) {
  .grid5 { grid-template-columns: 1fr; }
}

      .modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 28px;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
  color: var(--text);
}

.modal-content h3 {
  margin: 0 0 18px;
  font-size: 18px;
  font-weight: 800;
}
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

      /* SUMMARY WATERMARK + SUB */
.sum-watermark {
  position: absolute;
  bottom: 14px;
  right: 18px;
  font-size: 36px;
  opacity: 0.13;
  transition: .3s ease;
  z-index: 1;
}
.sum-card:hover .sum-watermark {
  opacity: 0.28;
  transform: scale(1.18) rotate(-8deg);
}
.sum-sub {
  font-size: 12px;
  color: #94a3b8;
  margin: 6px 0 0;
  position: relative;
  z-index: 2;
}

/* IMPORT CARD */
.import-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.import-header {
  display: flex;
  align-items: center;
  gap: 16px;
}
.import-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 8px 18px rgba(37,99,235,0.22);
  flex-shrink: 0;
}
.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 2px dashed #d1d5db;
  border-radius: 16px;
  padding: 28px 20px;
  cursor: pointer;
  transition: .25s ease;
  background: #f8fafc;
}
.dark-theme .upload-zone {
  border-color: #334155;
  background: rgba(255,255,255,0.02);
}
.upload-zone:hover {
  border-color: #22c55e;
  background: #f0fdf4;
}
.dark-theme .upload-zone:hover {
  background: rgba(34,197,94,0.05);
}
.upload-zone-icon { font-size: 28px; }
.upload-zone-text { font-weight: 700; font-size: 14px; color: #374151; }
.dark-theme .upload-zone-text { color: #e2e8f0; }
.upload-zone-hint { font-size: 12px; color: #94a3b8; }

/* PROC FORM CARD */
.proc-form-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 4px;
}
.proc-form-icon {
  width: 50px;
  height: 50px;
  border-radius: 15px;
  background: linear-gradient(135deg, #22c55e, #15803d);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 8px 20px rgba(22,163,74,0.22);
  flex-shrink: 0;
}
.proc-divider {
  height: 1px;
  background: linear-gradient(to right, #e0e7ff, transparent);
  margin: 18px 0;
}
.dark-theme .proc-divider {
  background: linear-gradient(to right, rgba(255,255,255,0.07), transparent);
}
.proc-label {
  font-size: 11px !important;
  font-weight: 800 !important;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #64748b !important;
  margin-bottom: 8px !important;
}
.dark-theme .proc-label { color: #94a3b8 !important; }

/* RUPEE PREFIX */
.rupee-wrap { position: relative; }
.rupee-prefix {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-weight: 700;
  color: #6b7280;
  z-index: 1;
  pointer-events: none;
}
.has-rupee { padding-left: 30px !important; }

/* READONLY FIELD */
.readonly-field {
  background: #f1f5f9 !important;
  color: #94a3b8 !important;
  cursor: not-allowed;
}
.dark-theme .readonly-field {
  background: #1e293b !important;
  color: #475569 !important;
}

/* PROC FORM FOOTER */
.proc-form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px dashed #e5e7eb;
}
.dark-theme .proc-form-footer { border-top-color: rgba(255,255,255,0.07); }
.form-note { font-size: 12px; color: #9ca3af; font-style: italic; }
.save-proc-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 28px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #22c55e, #15803d);
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: all .25s ease;
  box-shadow: 0 10px 24px rgba(22,163,74,0.28);
}
.save-proc-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 36px rgba(22,163,74,0.36);
}

/* TABLE CHIPS & CELLS */
.po-chip {
  background: #eff6ff;
  color: #2563eb;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  font-family: monospace;
  white-space: nowrap;
}
.dark-theme .po-chip { background: #1e3a5f; color: #93c5fd; }

.inv-ref-chip {
  background: #f5f3ff;
  color: #7c3aed;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  font-family: monospace;
  white-space: nowrap;
}
.dark-theme .inv-ref-chip { background: #2e1065; color: #c4b5fd; }

.proc-product-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.proc-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 13px;
  color: #fff;
  flex-shrink: 0;
}
.proc-product-name {
  font-weight: 700;
  font-size: 14px;
}
.supplier-chip {
  background: #f0fdf4;
  color: #15803d;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.dark-theme .supplier-chip { background: #052e16; color: #4ade80; }

.date-cell { display: flex; flex-direction: column; gap: 2px; }
.date-main { font-weight: 700; font-size: 13px; }

/* TABLE HEADER */
table thead th {
  font-size: 11px !important;
  letter-spacing: 1px !important;
  text-transform: uppercase !important;
}
  .modal-content table {
  min-width: unset;
  width: 100%;
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
        <div className="card import-card">
          <div className="import-header">
            <div className="import-icon">📥</div>
            <div>
              <div className="small-title" style={{ margin: 0 }}>
                Excel Import
              </div>
              <p className="import-sub" style={{ margin: "4px 0 0" }}>
                Upload supplier invoice files (.xlsx, .xls)
              </p>
            </div>
          </div>

          <div className="upload-zone" onClick={() => fileRef.current.click()}>
            <span className="upload-zone-icon">📂</span>
            <span className="upload-zone-text">
              Click to browse or drop Excel file here
            </span>
            <span className="upload-zone-hint">.xlsx / .xls supported</span>
          </div>

          <input
            type="file"
            ref={fileRef}
            style={{ display: "none" }}
            accept=".xlsx,.xls"
            onChange={importExcel}
          />
        </div>

        {/* FORM */}
        <div className="card proc-form-card">
          <div className="proc-form-header">
            <div className="proc-form-icon">📦</div>
            <div>
              <div className="small-title" style={{ margin: 0 }}>
                New Procurement
              </div>
              <p className="import-sub" style={{ margin: "4px 0 0" }}>
                Register a new purchase entry with supplier details
              </p>
            </div>
          </div>

          <div className="proc-divider" />

          <div className="grid2">
            <div>
              <label className="proc-label">Supplier</label>

              <select
                value={form.supplier}
                onChange={(e) =>
                  setForm({
                    ...form,
                    supplier: e.target.value,
                  })
                }
              >
                <option value="">Select Supplier</option>

                {suppliers.map((s) => (
                  <option key={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="proc-label">Invoice Ref</label>

              <input
                value={form.invoiceRef}
                onChange={(e) =>
                  setForm({
                    ...form,
                    invoiceRef: e.target.value,
                  })
                }
                placeholder="Supplier Invoice"
              />
            </div>
          </div>
          <div
            style={{
              marginTop: 20,
            }}
          >
            {items.map((item, index) => (
              <div key={index} className="grid5" style={{ marginBottom: 12 }}>
                <select
                  value={item.productId}
                  onChange={(e) =>
                    updateItem(index, "productId", e.target.value)
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
                  value={item.qty}
                  onChange={(e) => updateItem(index, "qty", e.target.value)}
                />

                <input
                  placeholder="Cost ₹"
                  value={item.costPrice}
                  onChange={(e) =>
                    updateItem(index, "costPrice", e.target.value)
                  }
                />

                <input
                  type="date"
                  value={item.manufactureDate || ""}
                  onChange={(e) =>
                    updateItem(index, "manufactureDate", e.target.value)
                  }
                />

                <button
                  style={{
                    border: "none",
                    background: "#dc2626",
                    color: "#fff",
                    borderRadius: "10px",
                    height: "40px",
                    padding: "0 14px",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => removeItem(index)}
                >
                  ✕ Remove
                </button>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "16px",
                alignItems: "center",
              }}
            >
              <button className="btn blue" onClick={addItem}>
                + Add Item
              </button>

              <button className="save-proc-btn" onClick={createGrn}>
                📦 Create GRN
              </button>
            </div>
          </div>
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
                  <th>GRN Number</th>
                  <th>Supplier</th>
                  <th>Invoice Ref</th>
                  <th>Items</th>
                  <th>Total Qty</th>
                  <th>Total Amount</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#94a3b8",
                      }}
                    >
                      No procurement records found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((l) => (
                    <tr key={l.grnNumber}>
                      <td>
                        <span className="po-chip">{l.grnNumber}</span>
                      </td>

                      <td>
                        <span className="supplier-chip">🏢 {l.supplier}</span>
                      </td>

                      <td>
                        <span className="inv-ref-chip">{l.invoiceRef}</span>
                      </td>

                      <td>
                        <strong>{l.items}</strong>
                      </td>

                      <td>
                        <strong>{l.totalQty}</strong>
                      </td>

                      <td>
                        <strong>₹{Number(l.amount).toFixed(2)}</strong>
                      </td>

                      <td>{l.date}</td>

                      <td>
                        <div className="action-row">
                          <button
                            className="action-btn pay-btn"
                            onClick={() => openGrn(l.grnNumber)}
                          >
                            👁 View
                          </button>

                          <button
                            className="action-btn delete-btn"
                            onClick={() => deleteGrn(l.grnNumber)}
                          >
                            🗑 Delete
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
        {showGrnModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>{selectedGrnNumber}</h3>

              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Cost</th>
                    <th>MFD</th>
                    <th>Expiry</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedGrn.map((p) => (
                    <tr key={p.id}>
                      <td>{p.product?.name}</td>

                      <td>{p.qty}</td>

                      <td>₹{p.totalCost}</td>

                      <td>{p.manufactureDate || "-"}</td>

                      <td>{p.expiryDate || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  marginTop: "20px",
                }}
              >
                {/* Payment input row */}
                {showPayInput && (
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="number"
                      placeholder="Enter amount (₹)"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      style={{
                        flex: 1,
                        height: "42px",
                        borderRadius: "10px",
                        border: "1px solid var(--border)",
                        padding: "0 14px",
                        background: "var(--bg)",
                        color: "var(--text)",
                      }}
                    />
                    <button className="action-btn pay-btn" onClick={payGrn}>
                      ✅ Confirm
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => {
                        setShowPayInput(false);
                        setPayAmount("");
                      }}
                    >
                      ✖
                    </button>
                  </div>
                )}

                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  {isGrnPaid ? (
                    <span
                      style={{
                        background: "#dcfce7",
                        color: "#15803d",
                        padding: "6px 16px",
                        borderRadius: "999px",
                        fontWeight: 800,
                        fontSize: "13px",
                      }}
                    >
                      ✅ PAID
                    </span>
                  ) : (
                    !showPayInput && (
                      <button
                        className="action-btn pay-btn"
                        onClick={() => setShowPayInput(true)}
                      >
                        💰 Pay
                      </button>
                    )
                  )}
                  <button
                    className="action-btn delete-btn"
                    onClick={() => {
                      setShowGrnModal(false);
                      setShowPayInput(false);
                      setPayAmount("");
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
