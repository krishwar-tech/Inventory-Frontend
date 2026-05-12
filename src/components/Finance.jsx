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
        "https://inventory-backend-final-1.onrender.com/api/finance/dashboard"
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
          padding:20px;
          min-height:100vh;
          background:var(--bg);
          color:var(--text);
        }

        .finance-title{
          font-size:38px;
          font-weight:900;
          margin-bottom:8px;
          line-height:1;
        }

        .finance-sub{
          font-size:14px;
          color:var(--muted);
          margin-bottom:22px;
        }

        /* =========================
           TOP GRID
        ========================= */

        .finance-grid{
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:16px;
          margin-bottom:22px;
        }

        .finance-card{
          position:relative;
          overflow:hidden;
          background:var(--surface);
          border:1px solid var(--border);
          border-radius:22px;
          padding:18px;
          min-height:120px;
          transition:0.3s ease;
          cursor:pointer;
        }

        .finance-card::before{
          content:"";
          position:absolute;
          width:110px;
          height:110px;
          border-radius:50%;
          top:-40px;
          right:-25px;
          background:rgba(99,102,241,0.05);
        }

        .finance-card::after{
          content:"";
          position:absolute;
          width:60px;
          height:60px;
          border-radius:50%;
          bottom:-18px;
          left:-18px;
          background:rgba(59,130,246,0.04);
        }

        .finance-card:hover{
          transform:translateY(-5px);
          box-shadow:0 12px 24px rgba(0,0,0,0.08);
        }

        .finance-card:hover .finance-value{
          transform:scale(1.03);
        }

        .finance-label{
          font-size:13px;
          color:var(--muted);
          font-weight:700;
          margin-bottom:12px;
          position:relative;
          z-index:2;
        }

        .finance-value{
          font-size:30px;
          font-weight:900;
          line-height:1;
          transition:0.25s ease;
          position:relative;
          z-index:2;
        }

        .finance-trend{
          margin-top:12px;
          font-size:11px;
          font-weight:700;
          position:relative;
          z-index:2;
        }

        /* COLORS */

        .blue{
          color:#2563eb;
        }

        .green{
          color:#16a34a;
        }

        .orange{
          color:#f59e0b;
        }

        .red{
          color:#ef4444;
        }

        /* =========================
           PANELS
        ========================= */

        .finance-panels{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:18px;
        }

        .finance-panel{
          background:var(--surface);
          border:1px solid var(--border);
          border-radius:24px;
          padding:22px;
          transition:0.3s ease;
        }

        .finance-panel:hover{
          transform:translateY(-4px);
          box-shadow:0 10px 20px rgba(0,0,0,0.06);
        }

        .panel-title{
          font-size:20px;
          font-weight:800;
          margin-bottom:18px;
        }

        /* =========================
           ROWS
        ========================= */

        .finance-row{
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:14px 0;
          border-bottom:1px solid var(--border);
          transition:0.25s ease;
        }

        .finance-row:last-child{
          border-bottom:none;
        }

        .finance-row:hover{
          padding-left:8px;
          padding-right:8px;
          background:rgba(148,163,184,0.05);
          border-radius:12px;
        }

        .finance-left{
          display:flex;
          align-items:center;
          gap:10px;
          font-size:14px;
          font-weight:600;
        }

        .dot{
          width:10px;
          height:10px;
          border-radius:50%;
        }

        .dot-green{
          background:#16a34a;
        }

        .dot-blue{
          background:#2563eb;
        }

        .dot-orange{
          background:#f59e0b;
        }

        .dot-red{
          background:#ef4444;
        }

        .finance-amount{
          font-size:16px;
          font-weight:800;
        }

        /* =========================
           RESPONSIVE
        ========================= */

        @media(max-width:1200px){

          .finance-grid{
            grid-template-columns:repeat(2,1fr);
          }

          .finance-panels{
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
            font-size:30px;
          }

          .finance-card{
            min-height:110px;
            padding:16px;
          }

          .finance-value{
            font-size:24px;
          }

          .panel-title{
            font-size:18px;
          }
        }

      `}</style>

      <div className="finance-page">

        <div className="finance-title">
          Finance
        </div>

        <div className="finance-sub">
          Real-time money movement and business overview
        </div>

        {/* =========================
            TOP CARDS
        ========================= */}

        <div className="finance-grid">

          <div className="finance-card">

            <div className="finance-label">
              💰 Today Sales
            </div>

            <div className="finance-value blue">
              {money(data.todaySales)}
            </div>

            <div className="finance-trend blue">
              +12% from yesterday
            </div>

          </div>

          <div className="finance-card">

            <div className="finance-label">
              📈 Total Sales
            </div>

            <div className="finance-value green">
              {money(data.totalSales)}
            </div>

            <div className="finance-trend green">
              Strong sales growth
            </div>

          </div>

          <div className="finance-card">

            <div className="finance-label">
              🟠 Receivable
            </div>

            <div className="finance-value orange">
              {money(data.receivable)}
            </div>

            <div className="finance-trend orange">
              Pending collections
            </div>

          </div>

          <div className="finance-card">

            <div className="finance-label">
              🔴 Payable
            </div>

            <div className="finance-value red">
              {money(data.payable)}
            </div>

            <div className="finance-trend red">
              Supplier payments pending
            </div>

          </div>

          <div className="finance-card">

            <div className="finance-label">
              💵 Cash Collected
            </div>

            <div className="finance-value green">
              {money(data.cashCollected)}
            </div>

            <div className="finance-trend green">
              Most used payment mode
            </div>

          </div>

          <div className="finance-card">

            <div className="finance-label">
              🏦 UPI Collected
            </div>

            <div className="finance-value green">
              {money(data.upiCollected)}
            </div>

            <div className="finance-trend green">
              Digital payments active
            </div>

          </div>

          <div className="finance-card">

            <div className="finance-label">
              💳 Card Collected
            </div>

            <div className="finance-value green">
              {money(data.cardCollected)}
            </div>

            <div className="finance-trend green">
              Card usage minimal
            </div>

          </div>

          <div className="finance-card">

            <div className="finance-label">
              📊 Net Business
            </div>

            <div
              className={`finance-value ${
                data.netBusiness >= 0
                  ? "green"
                  : "red"
              }`}
            >
              {money(data.netBusiness)}
            </div>

            <div
              className={`finance-trend ${
                data.netBusiness >= 0
                  ? "green"
                  : "red"
              }`}
            >
              {data.netBusiness >= 0
                ? "Business in profit"
                : "Expenses higher than revenue"}
            </div>

          </div>

        </div>

        {/* =========================
            PANELS
        ========================= */}

        <div className="finance-panels">

          {/* COLLECTIONS */}

          <div className="finance-panel">

            <div className="panel-title">
              💰 Collections Breakdown
            </div>

            <div className="finance-row">

              <div className="finance-left">
                <div className="dot dot-green"></div>
                Cash
              </div>

              <div className="finance-amount green">
                {money(data.cashCollected)}
              </div>

            </div>

            <div className="finance-row">

              <div className="finance-left">
                <div className="dot dot-blue"></div>
                UPI
              </div>

              <div className="finance-amount blue">
                {money(data.upiCollected)}
              </div>

            </div>

            <div className="finance-row">

              <div className="finance-left">
                <div className="dot dot-orange"></div>
                Card
              </div>

              <div className="finance-amount orange">
                {money(data.cardCollected)}
              </div>

            </div>

            <div className="finance-row">

              <div className="finance-left">
                <div className="dot dot-green"></div>
                Total
              </div>

              <div className="finance-amount green">
                {money(
                  data.cashCollected +
                  data.upiCollected +
                  data.cardCollected
                )}
              </div>

            </div>

          </div>

          {/* SNAPSHOT */}

          <div className="finance-panel">

            <div className="panel-title">
              📈 Business Snapshot
            </div>

            <div className="finance-row">

              <div className="finance-left">
                <div className="dot dot-blue"></div>
                Purchase Cost
              </div>

              <div className="finance-amount">
                {money(data.totalPurchase)}
              </div>

            </div>

            <div className="finance-row">

              <div className="finance-left">
                <div className="dot dot-orange"></div>
                Pending Customer Due
              </div>

              <div className="finance-amount orange">
                {money(data.receivable)}
              </div>

            </div>

            <div className="finance-row">

              <div className="finance-left">
                <div className="dot dot-red"></div>
                Supplier Due
              </div>

              <div className="finance-amount red">
                {money(data.payable)}
              </div>

            </div>

            <div className="finance-row">

              <div className="finance-left">
                <div className="dot dot-green"></div>
                Net Result
              </div>

              <div
                className={`finance-amount ${
                  data.netBusiness >= 0
                    ? "green"
                    : "red"
                }`}
              >
                {money(data.netBusiness)}
              </div>

            </div>

          </div>

        </div>

      </div>
    </>
  );
}