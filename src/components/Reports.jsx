import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import api from "../services/api";
function Reports() {
  const [tab, setTab] = useState("sales");

  const [data, setData] = useState({
    totalRevenue: 0,
    unitsSold: 0,
    transactions: 0,
    salesRows: [],
    totalPurchase: 0,
    unitsPurchased: 0,
    purchaseRows: [],
    lowStockCount: 0,
    lowStock: [],
  });

  const [loading, setLoading] = useState(true);

  const [showInvoice, setShowInvoice] = useState(false);

  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

 const loadReports = async () => {

  try {

    const json = await api.get("/reports/dashboard");

    setData({
      totalRevenue: json.totalRevenue || 0,
      unitsSold: json.unitsSold || 0,
      transactions: json.transactions || 0,
      salesRows: json.salesRows || [],
      totalPurchase: json.totalPurchase || 0,
      unitsPurchased: json.unitsPurchased || 0,
      purchaseRows: json.purchaseRows || [],
      lowStockCount: json.lowStockCount || 0,
      lowStock: json.lowStock || [],
    });

  } catch (err) {

    console.log(err);

  } finally {

    setLoading(false);
  }
};

  const money = (n) => `₹${Number(n || 0).toFixed(2)}`;

 const previewInvoice = async (saleId) => {

  try {

    const json = await api.get(`/billing/invoice/${saleId}`);

    setInvoice(json);

    setShowInvoice(true);

  } catch (err) {

    console.log(err);
  }
};

  const downloadPdf = async (saleId) => {
    try {
      const json = await api.get(`/billing/invoice/${saleId}`);

      const doc = new jsPDF();

      let y = 20;

      doc.setFontSize(18);
      doc.text("StockFlow Invoice", 14, y);

      y += 12;

      doc.setFontSize(11);

      doc.text(`Bill No: ${json.sale.billNo}`, 14, y);

      y += 8;

      doc.text(`Date: ${json.sale.createdAt.replace("T", " ")}`, 14, y);

      y += 8;

      doc.text(`Payment: ${json.sale.paymentMode}`, 14, y);

      y += 12;

      doc.line(14, y, 195, y);

      y += 8;

      json.items.forEach((item) => {
        doc.text(item.productName, 14, y);

        doc.text(`${item.qty}`, 110, y);

        doc.text(money(item.total), 160, y);

        y += 8;
      });

      y += 5;

      doc.line(14, y, 195, y);

      y += 10;

      doc.setFontSize(14);

      doc.text(`Total: ${money(json.sale.totalAmount)}`, 14, y);

      doc.save(`${json.sale.billNo}.pdf`);
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return <div style={styles.page}>Loading...</div>;
  }

  return (
    <>
      <style>{`

      .report-page{
        animation:fadeIn 0.4s ease;
      }

      @keyframes fadeIn{
        from{
          opacity:0;
          transform:translateY(10px);
        }
        to{
          opacity:1;
          transform:translateY(0);
        }
      }

      .report-tabs{
        display:flex;
        gap:14px;
        flex-wrap:wrap;
        margin-bottom:32px;
      }

      .table-wrap{
        width:100%;
        overflow-x:auto;
      }

      .report-card{
        transition:all 0.35s ease;
        position:relative;
        overflow:hidden;
        cursor:pointer;
      }

      .report-card:hover{
        transform:translateY(-8px) scale(1.02);
        box-shadow:0 18px 40px rgba(0,0,0,0.12);
      }

      .report-box{
        transition:0.3s ease;
      }

      .report-box:hover{
        box-shadow:0 14px 40px rgba(0,0,0,0.08);
      }

      .report-table tbody tr{
        transition:0.25s ease;
      }

      .report-table tbody tr:hover{
        background:rgba(59,130,246,0.05);
      }

      .report-table th{
        position:sticky;
        top:0;
        background:var(--surface);
        z-index:2;
      }

      .report-tabs button{
        transition:0.25s ease;
        font-weight:700;
      }

      .report-tabs button:hover{
        transform:translateY(-2px);
      }

      .report-value{
        letter-spacing:-1px;
      }

      .view-btn-hover:hover{
        transform:scale(1.08);
      }

      .download-btn-hover:hover{
        transform:scale(1.08);
      }

      @media(max-width:768px){

        .report-page{
          padding:16px !important;
        }

        .report-tabs{
          flex-direction:column;
        }

        .report-tabs button{
          width:100%;
        }

        .report-cards{
          grid-template-columns:1fr !important;
        }

        .report-table{
          min-width:850px !important;
        }

        .report-value{
          font-size:30px !important;
        }

        .invoice-modal{
          width:95% !important;
          max-width:95% !important;
        }
      }

      `}</style>

      <div style={styles.page} className="report-page">
        <div className="page-header">
          <h1 className="page-title">Reports</h1>

          <p className="page-subtitle">
            Derived from transaction history — Sales, Purchases and Low Stock
          </p>
        </div>

        <div style={styles.tabs} className="report-tabs">
          <button
            style={tab === "sales" ? styles.activeTab : styles.tab}
            onClick={() => setTab("sales")}
          >
            Sales Report
          </button>

          <button
            style={tab === "purchase" ? styles.activeTab : styles.tab}
            onClick={() => setTab("purchase")}
          >
            Purchase Report
          </button>

          <button
            style={tab === "low" ? styles.activeTab : styles.tab}
            onClick={() => setTab("low")}
          >
            Low Stock Report
          </button>
        </div>

        {tab === "sales" && (
          <>
            <div style={styles.cards} className="report-cards">

              <Card
                title="Total Revenue"
                value={money(data.totalRevenue)}
                type="green"
              />

              <Card
                title="Units Sold"
                value={data.unitsSold}
                type="blue"
              />

              <Card
                title="Transactions"
                value={data.transactions}
                type="orange"
              />

            </div>

            <div style={styles.box} className="report-box">

              <h3 style={styles.boxTitle}>
                SALES TRANSACTIONS
              </h3>

              <div className="table-wrap">

                <table style={styles.table} className="report-table">

                  <thead>
                    <tr>
                      <th style={styles.th}>BILL NO</th>
                      <th style={styles.th}>PAYMENT</th>
                      <th style={styles.th}>TOTAL</th>
                      <th style={styles.th}>DATE</th>
                      <th style={styles.th}>ACTION</th>
                    </tr>
                  </thead>

                  <tbody>

                    {data.salesRows.map((item, i) => (

                      <tr key={i}>

                        <td style={styles.td}>{item.billNo}</td>

                        <td style={styles.td}>{item.paymentMode}</td>

                        <td
                          style={{
                            ...styles.td,
                            color: "#16a34a",
                            fontWeight: "700",
                          }}
                        >
                          {money(item.totalAmount)}
                        </td>

                        <td style={styles.td}>
                          {item.createdAt?.replace("T", " ")}
                        </td>

                        <td style={styles.td}>

                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                            }}
                          >

                            <button
                              className="view-btn-hover"
                              style={styles.viewBtn}
                              onClick={() => previewInvoice(item.id)}
                            >
                              👁
                            </button>

                            <button
                              className="download-btn-hover"
                              style={styles.downloadBtn}
                              onClick={() => downloadPdf(item.id)}
                            >
                              ⬇
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>
          </>
        )}

        {tab === "purchase" && (
          <>
            <div style={styles.cards} className="report-cards">

              <Card
                title="Total Procurement Cost"
                value={money(data.totalPurchase)}
                type="red"
              />

              <Card
                title="Units Procured"
                value={data.unitsPurchased}
                type="blue"
              />

              <Card
                title="Purchase Entries"
                value={data.purchaseRows.length}
                type="orange"
              />

            </div>

            <div style={styles.box} className="report-box">

              <h3 style={styles.boxTitle}>
                PURCHASE TRANSACTIONS
              </h3>

              <div className="table-wrap">

                <table style={styles.table} className="report-table">

                  <thead>
                    <tr>
                      <th style={styles.th}>PRODUCT</th>
                      <th style={styles.th}>SUPPLIER</th>
                      <th style={styles.th}>QTY</th>
                      <th style={styles.th}>COST</th>
                      <th style={styles.th}>TOTAL</th>
                      <th style={styles.th}>DATE</th>
                    </tr>
                  </thead>

                  <tbody>

                    {data.purchaseRows.map((item, i) => (

                      <tr key={i}>

                        <td style={styles.td}>{item.productName}</td>
                        <td style={styles.td}>{item.supplier}</td>
                        <td style={styles.td}>{item.qty}</td>
                        <td style={styles.td}>{money(item.costPrice)}</td>
                        <td style={styles.td}>{money(item.totalCost)}</td>
                        <td style={styles.td}>{item.date}</td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>
          </>
        )}

        {tab === "low" && (

          <div style={styles.box} className="report-box">

            <h3 style={styles.boxTitle}>
              🔴 LOW STOCK REPORT — {data.lowStockCount} PRODUCTS NEED ATTENTION
            </h3>

            <div className="table-wrap">

              <table style={styles.table} className="report-table">

                <thead>
                  <tr>
                    <th style={styles.th}>PRODUCT</th>
                    <th style={styles.th}>SKU</th>
                    <th style={styles.th}>STOCK</th>
                    <th style={styles.th}>REORDER</th>
                    <th style={styles.th}>STATUS</th>
                  </tr>
                </thead>

                <tbody>

                  {data.lowStock.map((item, i) => (

                    <tr key={i}>

                      <td style={styles.td}>{item.name}</td>

                      <td style={styles.td}>{item.sku}</td>

                      <td
                        style={{
                          ...styles.td,
                          color: "#f59e0b",
                          fontWeight: "700",
                        }}
                      >
                        {item.stock}
                      </td>

                      <td style={styles.td}>
                        {item.reorderLevel}
                      </td>

                      <td style={styles.td}>

                        <span
                          style={
                            item.status === "CRITICAL"
                              ? styles.badgeRed
                              : styles.badgeOrange
                          }
                        >
                          {item.status}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        )}

        {showInvoice && invoice && (

          <div
            style={styles.overlay}
            onClick={() => setShowInvoice(false)}
          >

            <div
              style={styles.modal}
              className="invoice-modal"
              onClick={(e) => e.stopPropagation()}
            >

              <h2>StockFlow Invoice</h2>

              <p>
                <b>Bill:</b> {invoice.sale.billNo}
              </p>

              <p>
                <b>Date:</b>{" "}
                {invoice.sale.createdAt.replace("T", " ")}
              </p>

              <p>
                <b>Payment:</b> {invoice.sale.paymentMode}
              </p>

              <hr />

              {invoice.items.map((item, i) => (

                <div key={i} style={styles.row}>

                  <span>
                    {item.productName} x {item.qty}
                  </span>

                  <span>{money(item.total)}</span>

                </div>

              ))}

              <hr />

              <h3>
                Total: {money(invoice.sale.totalAmount)}
              </h3>

              <button
                style={styles.closeBtn}
                onClick={() => setShowInvoice(false)}
              >
                Close
              </button>

            </div>

          </div>

        )}
      </div>
    </>
  );
}

function Card({ title, value, type }) {

  const getColor = () => {
    if (type === "green") return "#16a34a";
    if (type === "red") return "#dc2626";
    if (type === "blue") return "#3b82f6";
    if (type === "orange") return "#f59e0b";
    return "var(--text)";
  };

  const getIcon = () => {
    if (type === "green") return "📈";
    if (type === "red") return "💰";
    if (type === "blue") return "📦";
    if (type === "orange") return "🧾";
    return "📊";
  };

  return (

    <div
      style={styles.card}
      className="report-card"
    >

      <div
        style={{
          position: "absolute",
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          top: "-45px",
          right: "-45px",
          background: "rgba(148,163,184,0.08)",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "75px",
          height: "75px",
          borderRadius: "50%",
          top: "18px",
          right: "18px",
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(8px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "22px",
          right: "26px",
          fontSize: "24px",
          opacity: "0.8",
        }}
      >
        {getIcon()}
      </div>

      <p style={styles.cardTitle}>
        {title}
      </p>

      <h2
        style={{
          ...styles.cardValue,
          color: getColor(),
        }}
        className="report-value"
      >
        {value}
      </h2>

      <div
        style={{
          marginTop: "14px",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: "700",
          background: "rgba(34,197,94,0.12)",
          color: "#16a34a",
        }}
      >
        ↑ 12% This Week
      </div>

    </div>

  );
}

const styles = {

  page: {
    padding: "30px",
    background: "var(--bg)",
    minHeight: "100vh",
    color: "var(--text)",
  },

  tabs: {
    display: "flex",
    gap: "12px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },

  tab: {
    padding: "12px 22px",
    borderRadius: "14px",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    cursor: "pointer",
    fontWeight: "700",
  },

  activeTab: {
    padding: "12px 22px",
    borderRadius: "14px",
    border: "none",
    background: "#166534",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: "22px",
    marginBottom: "30px",
  },

  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "24px",
    padding: "28px",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.3s ease",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
    backdropFilter: "blur(10px)",
  },

  cardTitle: {
    color: "var(--muted)",
    fontSize: "15px",
    fontWeight: "600",
  },

  cardValue: {
    fontSize: "44px",
    marginTop: "14px",
    fontWeight: "800",
  },

  box: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "24px",
    padding: "30px",
  },

  boxTitle: {
    color: "var(--muted)",
    marginBottom: "24px",
    fontSize: "16px",
    letterSpacing: "1px",
    fontWeight: "800",
  },

  table: {
    width: "100%",
    minWidth: "900px",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "14px",
    color: "var(--muted)",
    borderBottom: "1px solid var(--border)",
  },

  td: {
    padding: "16px 14px",
    borderBottom: "1px solid var(--border)",
  },

  viewBtn: {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "0.25s ease",
    boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
  },

  downloadBtn: {
    border: "none",
    background: "#16a34a",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "0.25s ease",
    boxShadow: "0 4px 12px rgba(22,163,74,0.25)",
  },

  badgeOrange: {
    background: "linear-gradient(135deg,#f59e0b,#b45309)",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    boxShadow: "0 4px 12px rgba(245,158,11,0.25)",
  },

  badgeRed: {
    background: "linear-gradient(135deg,#ef4444,#991b1b)",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    boxShadow: "0 4px 12px rgba(239,68,68,0.25)",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: "14px",
  },

  modal: {
    width: "420px",
    maxWidth: "100%",
    background: "var(--surface)",
    color: "var(--text)",
    padding: "25px",
    borderRadius: "16px",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    gap: "10px",
  },

  closeBtn: {
    marginTop: "15px",
    border: "none",
    background: "#dc2626",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    width: "100%",
  },
};

export default Reports;