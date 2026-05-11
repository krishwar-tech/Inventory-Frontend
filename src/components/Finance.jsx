import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Finance() {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinance();
  }, []);

  const loadFinance = async () => {
    try {
      const res = await axios.get(
        "http://http://https://inventory-backend-final-1.onrender.com/finance/dashboard",
      );

      setData(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const money = (n) =>
    "₹" +
    Number(n || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    });

  if (loading) {
    return (
      <div
        style={{
          padding: "30px",
          color: "var(--text)",
        }}
      >
        Loading Finance...
      </div>
    );
  }

  return (
    <>
      <style>{`
        .finance-page{
          padding:24px;
          background:var(--bg);
          min-height:100vh;
          color:var(--text);
        }

        .finance-title{
          font-size:30px;
          font-weight:800;
          margin-bottom:6px;
        }

        .finance-sub{
          color:var(--muted);
          margin-bottom:22px;
          font-size:14px;
        }

        .finance-grid{
          display:grid;
          grid-template-columns:
          repeat(4,1fr);
          gap:16px;
          margin-bottom:20px;
        }

        .card{
          background:var(--surface);
          border:1px solid var(--border);
          border-radius:22px;
          padding:18px;
        }

        .card-label{
          font-size:13px;
          color:var(--muted);
          margin-bottom:8px;
        }

        .card-value{
          font-size:26px;
          font-weight:800;
          line-height:1.2;
        }

        .two-col{
          display:grid;
          grid-template-columns:
          1fr 1fr;
          gap:16px;
        }

        .panel{
          background:var(--surface);
          border:1px solid var(--border);
          border-radius:22px;
          padding:20px;
        }

        .panel h3{
          margin:0 0 16px;
          font-size:18px;
        }

        .row{
          display:flex;
          justify-content:space-between;
          padding:12px 0;
          border-bottom:1px solid var(--border);
          gap:12px;
        }

        .row:last-child{
          border-bottom:none;
        }

        .good{
          color:#16a34a;
          font-weight:700;
        }

        .bad{
          color:#dc2626;
          font-weight:700;
        }

        .warn{
          color:#d97706;
          font-weight:700;
        }

        @media(max-width:1100px){
          .finance-grid{
            grid-template-columns:
            repeat(2,1fr);
          }

          .two-col{
            grid-template-columns:1fr;
          }
        }

        @media(max-width:768px){
          .finance-page{
            padding:16px;
          }

          .finance-grid{
            grid-template-columns:1fr;
          }

          .finance-title{
            font-size:24px;
          }

          .card-value{
            font-size:22px;
          }
        }

        @media(max-width:480px){
          .finance-page{
            padding:12px;
          }

          .panel,
          .card{
            border-radius:18px;
            padding:16px;
          }
        }

        .primary{
          color:#2563eb;   /* Blue */
        }

        .success{
          color:#16a34a;
        }

        .warning{
          color:#f59e0b;
        }

        .danger{
          color:#dc2626;
        }
        .card{
          transition:all 0.25s ease;
          position:relative;
          overflow:hidden;
          cursor:pointer;
        }

        .card:hover{
          transform:translateY(-6px) scale(1.02);
          box-shadow:0 12px 30px rgba(0,0,0,0.08);
        }

        .card::after{
          content:"";
          position:absolute;
          inset:0;
          background:linear-gradient(120deg,transparent,rgba(59,130,246,0.15));
          opacity:0;
          transition:0.3s;
        }

        .card:hover::after{
          opacity:1;
        }

        .card-value{
          transition:0.2s;
        }

        .card:hover .card-value{
          transform:scale(1.05);
        }
      `}</style>

      <div className="finance-page">
        <div className="finance-title">Finance</div>

        <div className="finance-sub">
          Real-time money movement and business health overview
        </div>

        {/* TOP CARDS */}
        <div className="finance-grid">
          <div className="card">
            <div className="card-label">Today Sales</div>
            <div className="card-value primary">{money(data.todaySales)}</div>
          </div>

          <div className="card">
            <div className="card-label">Total Sales</div>
            <div className="card-value success">{money(data.totalSales)}</div>
          </div>

          <div className="card">
            <div className="card-label">Receivable</div>
            <div className="card-value warning">{money(data.receivable)}</div>
          </div>

          <div className="card">
            <div className="card-label">Payable</div>
            <div className="card-value danger">{money(data.payable)}</div>
          </div>

          <div className="card">
            <div className="card-label">Cash Collected</div>
            <div className="card-value success">
              {money(data.cashCollected)}
            </div>
          </div>

          <div className="card">
            <div className="card-label">UPI Collected</div>
            <div className="card-value success">{money(data.upiCollected)}</div>
          </div>

          <div className="card">
            <div className="card-label">Card Collected</div>
            <div className="card-value success">
              {money(data.cardCollected)}
            </div>
          </div>

          <div className="card">
            <div className="card-label">Net Business</div>
            <div
              className={`card-value ${
                data.netBusiness >= 0 ? "success" : "danger"
              }`}
            >
              {money(data.netBusiness)}
            </div>
          </div>
        </div>
        {/* DETAILS */}
        <div className="two-col">
          <div className="panel">
            <h3>Collections Breakdown</h3>

            <div className="row">
              <span>Cash</span>
              <strong>{money(data.cashCollected)}</strong>
            </div>

            <div className="row">
              <span>UPI</span>
              <strong>{money(data.upiCollected)}</strong>
            </div>

            <div className="row">
              <span>Card</span>
              <strong>{money(data.cardCollected)}</strong>
            </div>

            <div className="row">
              <span>Total</span>
              <strong className="good">
                {money(
                  data.cashCollected + data.upiCollected + data.cardCollected,
                )}
              </strong>
            </div>
          </div>

          <div className="panel">
            <h3>Business Snapshot</h3>

            <div className="row">
              <span>Purchase Cost</span>
              <strong>{money(data.totalPurchase)}</strong>
            </div>

            <div className="row">
              <span>Pending Customer Due</span>
              <strong className="warn">{money(data.receivable)}</strong>
            </div>

            <div className="row">
              <span>Supplier Due</span>
              <strong className="bad">{money(data.payable)}</strong>
            </div>

            <div className="row">
              <span>Net Result</span>
              <strong className={data.netBusiness >= 0 ? "good" : "bad"}>
                {money(data.netBusiness)}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
