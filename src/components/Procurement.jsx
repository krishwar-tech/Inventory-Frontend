import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

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
    const res = await axios.get("http://http://https://inventory-backend-final-1.onrender.com/products");
    setProducts(res.data);
  };

  const loadSuppliers = async () => {
    const res = await axios.get("http://http://https://inventory-backend-final-1.onrender.com/masters/suppliers");
    setSuppliers(res.data);
  };

  const loadLogs = async () => {
    const res = await axios.get("http://http://https://inventory-backend-final-1.onrender.com/procurement");
    const data = res.data.reverse();
    setLogs(data);
    calculateSummary(data);
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

      if (r.paymentStatus !== "PAID") unpaidCount++;
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

  const addStock = async () => {
    if (!form.productName || !form.supplier || !form.qty || !form.costPrice) {
      alert("Fill required fields");
      return;
    }

    const selectedProduct = products.find((p) => p.name === form.productName);

    const selectedSupplier = suppliers.find((s) => s.name === form.supplier);

    if (!selectedProduct || !selectedSupplier) {
      alert("Invalid product or supplier");
      return;
    }

    try {
      await axios.post("http://http://https://inventory-backend-final-1.onrender.com/procurement", {
        productId: selectedProduct.id,

        supplierId: selectedSupplier.id,

        qty: parseInt(form.qty),

        costPrice: parseFloat(form.costPrice),
      });

      resetForm();

      loadLogs();

      loadProducts();

      alert("Procurement Added Successfully");
    } catch (err) {
      console.error(err);

      alert("Procurement failed");
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

  const uploadExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await axios.post(
        "http://http://https://inventory-backend-final-1.onrender.com/procurement/import-excel",
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      alert(
        `${res.data.rowsImported} rows imported\n${res.data.newProducts} new products pending approval`,
      );

      loadLogs();
      loadProducts();
    } catch (error) {
      alert("Import failed");
    }

    e.target.value = "";
  };

  const updatePayment = async (id) => {
    const amt = prompt("Enter payment amount");
    if (!amt) return;

    await axios.put(
      `http://http://https://inventory-backend-final-1.onrender.com/procurement/payment/${id}?amount=${amt}`,
    );

    loadLogs();
  };

  const deleteRow = async (id) => {
    if (!window.confirm("Delete this procurement entry?")) return;

    await axios.delete(`http://http://https://inventory-backend-final-1.onrender.com/procurement/${id}`);
    loadLogs();
  };

  const filteredLogs = logs.filter((l) => {
    const supplierOk =
      !filters.supplier ||
      l.supplier?.toLowerCase().includes(filters.supplier.toLowerCase());

    const statusOk = !filters.status || l.paymentStatus === filters.status;

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
          padding:24px;
          background:var(--bg);
          min-height:100vh;
          color:var(--text);
        }

        .proc-page h1{
          font-size:30px;
          font-weight:800;
          margin-bottom:6px;
        }

        .proc-page p{
          color:var(--muted);
          font-size:14px;
          margin-bottom:20px;
        }

        .card{
          background:var(--surface);
          border:1px solid var(--border);
          border-radius:22px;
          padding:24px;
          margin-bottom:20px;
        }

        .small-title{
          font-size:14px;
          font-weight:800;
          color:var(--muted);
          margin-bottom:18px;
        }

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

        .summary-grid{
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
            gap:18px;
            margin-bottom:24px;
          }

          .sum-card{
            position:relative;
            padding:20px;
            border-radius:20px;
            background:linear-gradient(145deg,var(--surface),#ffffff05);
            border:1px solid var(--border);
            transition:all .25s ease;
            overflow:hidden;
            cursor:pointer;
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

          .sum-card:hover{
            transform:translateY(-6px) scale(1.02);
            box-shadow:0 14px 35px rgba(0,0,0,0.25);
            border-color:#16a34a;
          }

          .sum-card:hover::before{
            opacity:1;
          }

          .sum-card h4{
            margin:0 0 6px;
            font-size:13px;
            color:var(--muted);
          }

          .sum-card h2{
            margin:0;
            font-size:30px;
            font-weight:800;
          }

          .card-blue h2{ color:#3b82f6; }
          .card-green h2{ color:#16a34a; }
          .card-orange h2{ color:#f59e0b; }
          .card-red h2{ color:#dc2626; }
        label{
          display:block;
          font-size:13px;
          font-weight:700;
          margin-bottom:8px;
          color:var(--muted);
        }

        input,select{
          width:100%;
          height:46px;
          border:1px solid var(--border);
          background:var(--bg);
          color:var(--text);
          border-radius:12px;
          padding:0 14px;
          box-sizing:border-box;
        }

        .btn{
          border:none;
          padding:12px 18px;
          border-radius:12px;
          font-weight:800;
          cursor:pointer;
        }

        .green{background:#15803d;color:#fff;}
        .blue{background:#2563eb;color:#fff;}
        .red{background:#dc2626;color:#fff;}

        .table-wrap{
          overflow:auto;
        }

        table{
          width:100%;
          min-width:1200px;
          border-collapse:collapse;
        }

        th,td{
          padding:14px 8px;
          border-bottom:1px solid var(--border);
          text-align:left;
          font-size:14px;
        }

        .badge{
          padding:6px 10px;
          border-radius:20px;
          color:#fff;
          font-size:12px;
          font-weight:700;
          display:inline-block;
        }

        .action-row{
          display:flex;
          gap:8px;
          flex-wrap:wrap;
        }

        @media(max-width:900px){
          .grid4,.grid3,.grid2{
            grid-template-columns:1fr;
          }

          .proc-page{
            padding:14px;
          }

          .card{
            padding:16px;
          }

          .btn{
            width:100%;
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

          <button className="btn blue" onClick={() => fileRef.current.click()}>
            Upload Invoice Excel
          </button>

          <input
            type="file"
            ref={fileRef}
            style={{ display: "none" }}
            accept=".xlsx,.xls"
            onChange={uploadExcel}
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
            onClick={addStock}
          >
            + Save Procurement
          </button>
        </div>

        {/* FILTER */}
        <div className="card">
          <div className="small-title">🔍 FILTERS</div>

          <div className="grid2">
            <input
              placeholder="Search Supplier..."
              value={filters.supplier}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  supplier: e.target.value,
                })
              }
            />

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
                              className="btn blue"
                              onClick={() => updatePayment(l.id)}
                            >
                              Pay
                            </button>
                          )}

                          <button
                            className="btn red"
                            style={{ width: "45%" }}
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
