import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";

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
      const res = await fetch("https://inventory-backend-final-1.onrender.com/api/reports/dashboard");

      const json = await res.json();

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
      const res = await fetch(
        `https://inventory-backend-final-1.onrender.com/api/billing/invoice/${saleId}`,
      );

      const json = await res.json();

      setInvoice(json);
      setShowInvoice(true);
    } catch (err) {
      console.log(err);
    }
  };

  const downloadPdf = async (saleId) => {
    try {
      const res = await fetch(
        `https://inventory-backend-final-1.onrender.com/api/billing/invoice/${saleId}`,
      );

      const json = await res.json();

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
        .report-tabs{
          display:flex;
          gap:12px;
          flex-wrap:wrap;
        }

        .table-wrap{
          width:100%;
          overflow-x:auto;
        }

        @media(max-width:768px){

          .report-page{
            padding:16px !important;
          }

          .report-title{
            font-size:28px !important;
          }

          .report-sub{
            font-size:13px !important;
            line-height:1.5;
            margin-bottom:18px !important;
          }

          .report-tabs{
            flex-direction:column;
            gap:10px;
            margin-bottom:18px !important;
          }

          .report-tabs button{
            width:100%;
          }

          .report-cards{
            grid-template-columns:1fr !important;
            gap:14px !important;
            margin-bottom:18px !important;
          }

          .report-card{
            padding:18px !important;
          }

          .report-value{
            font-size:30px !important;
          }

          .report-box{
            padding:16px !important;
            border-radius:18px !important;
          }

          .report-box h3{
            font-size:14px !important;
            line-height:1.5;
          }

          .report-table{
            min-width:820px !important;
          }

          .report-table th,
          .report-table td{
            padding:12px 10px !important;
            font-size:13px !important;
            white-space:nowrap;
          }

          .invoice-modal{
            width:95% !important;
            max-width:95% !important;
            padding:18px !important;
          }
        }

        @media(max-width:480px){

          .report-page{
            padding:12px !important;
          }

          .report-title{
            font-size:24px !important;
          }

          .report-box{
            padding:14px !important;
          }

          .report-table{
            min-width:760px !important;
          }

          .report-value{
            font-size:26px !important;
          }
        }

        .report-card{
          transition:all 0.25s ease;
          position:relative;
          overflow:hidden;
          cursor:pointer;
        }

        .report-card:hover{
          transform:translateY(-6px) scale(1.02);
          box-shadow:0 12px 30px rgba(0,0,0,0.08);
        }

        .report-card::after{
          content:"";
          position:absolute;
          inset:0;
          background:linear-gradient(120deg,transparent,rgba(59,130,246,0.15));
          opacity:0;
          transition:0.3s;
        }

        .report-card:hover::after{
          opacity:1;
        }
      `}</style>

      <div style={styles.page} className="report-page">
        <div className="page-header">
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">
            Derived from transaction history — Sales, Purchases and Low Stock
          </p>
        </div>

        {/* Tabs */}
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

        {/* SALES */}
        {tab === "sales" && (
          <>
            <div style={styles.cards} className="report-cards">
              <Card
                title="Total Revenue"
                value={money(data.totalRevenue)}
                type="green"
              />

              <Card title="Units Sold" value={data.unitsSold} type="blue" />

              <Card
                title="Transactions"
                value={data.transactions}
                type="orange"
              />
            </div>

            <div style={styles.box} className="report-box">
              <h3 style={styles.boxTitle}>SALES TRANSACTIONS</h3>

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
                              style={styles.viewBtn}
                              onClick={() => previewInvoice(item.id)}
                            >
                              👁
                            </button>

                            <button
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

        {/* PURCHASE */}
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
              <h3 style={styles.boxTitle}>PURCHASE TRANSACTIONS</h3>

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

        {/* LOW */}
        {tab === "low" && (
          <div style={styles.box} className="report-box">
            <h3 style={styles.boxTitle}>
              🔴 LOW STOCK REPORT —{data.lowStockCount} PRODUCTS NEED ATTENTION
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

                      <td style={styles.td}>{item.reorderLevel}</td>

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

        {/* MODAL */}
        {showInvoice && invoice && (
          <div style={styles.overlay} onClick={() => setShowInvoice(false)}>
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
                <b>Date:</b> {invoice.sale.createdAt.replace("T", " ")}
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

              <h3>Total: {money(invoice.sale.totalAmount)}</h3>

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

  return (
    <div style={styles.card} className="report-card">
      <p style={styles.cardTitle}>{title}</p>

      <h2
        style={{
          ...styles.cardValue,
          color: getColor(),
        }}
        className="report-value"
      >
        {value}
      </h2>
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

  title: {
    fontSize: "42px",
    fontWeight: "800",
  },

  sub: {
    color: "var(--muted)",
    marginBottom: "25px",
  },

  tabs: {
    display: "flex",
    gap: "12px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },

  tab: {
    padding: "12px 22px",
    borderRadius: "12px",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    cursor: "pointer",
  },

  activeTab: {
    padding: "12px 22px",
    borderRadius: "12px",
    border: "none",
    background: "#166534",
    color: "#fff",
    cursor: "pointer",
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
    borderRadius: "22px",
    padding: "28px",
  },

  cardTitle: {
    color: "var(--muted)",
    fontSize: "15px",
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
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  downloadBtn: {
    border: "none",
    background: "#16a34a",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  badgeOrange: {
    background: "#92400e",
    color: "#fde68a",
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
  },

  badgeRed: {
    background: "#991b1b",
    color: "#fecaca",
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
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
