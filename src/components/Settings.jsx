import { useEffect, useState } from "react";

function Settings() {
  const [form, setForm] = useState({
    safetyStock: 5,
    minimumThreshold: 5,
    reorderLevel: 10,
    storeName: "My Store",
    currencySymbol: "₹",
  });

  const API = "http://http://https://inventory-backend-final-1.onrender.com/settings";

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();

      setForm({
        safetyStock: data.safetyStock || 5,
        minimumThreshold: data.minimumThreshold || 5,
        reorderLevel: data.reorderLevel || 10,
        storeName: data.storeName || "My Store",
        currencySymbol: data.currencySymbol || "₹",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updated = {
      ...form,
      [name]:
        name === "storeName" || name === "currencySymbol"
          ? value
          : Number(value),
    };

    updated.reorderLevel =
      Number(updated.safetyStock) + Number(updated.minimumThreshold);

    setForm(updated);
  };

  const saveSettings = async () => {
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      setForm(data);
      alert("Settings Saved Successfully");
    } catch (error) {
      console.log(error);
      alert("Failed to Save");
    }
  };

  return (
    <section className="section active">
      <div className="page-title">Settings</div>
      <div className="page-sub">
        Configure stock thresholds and store preferences
      </div>

      <div className="settings-grid">
        {/* LEFT */}
        <div className="card">
          <div className="card-title">📊 STOCK THRESHOLDS</div>

          <label className="form-label">Safety Stock (units)</label>
          <input
            type="number"
            name="safetyStock"
            value={form.safetyStock}
            onChange={handleChange}
            className="form-input"
          />
          <div className="helper-text">Minimum buffer to always maintain</div>

          <label className="form-label space-top">
            Minimum Threshold (units)
          </label>
          <input
            type="number"
            name="minimumThreshold"
            value={form.minimumThreshold}
            onChange={handleChange}
            className="form-input"
          />
          <div className="helper-text">
            Added to safety stock to get reorder level
          </div>

          <label className="form-label space-top">
            Reorder Level (auto-calculated)
          </label>
          <input
            type="number"
            value={form.reorderLevel}
            readOnly
            className="form-input readonly-box"
          />
          <div className="helper-text">= Safety Stock + Minimum Threshold</div>

          <button className="save-btn" onClick={saveSettings}>
            Save Settings
          </button>
        </div>

        {/* RIGHT */}
        <div className="card">
          <div className="card-title">🏪 STORE INFO</div>
          <label className="form-label">Store Name</label>
          <input
            type="text"
            name="storeName"
            value={form.storeName}
            onChange={handleChange}
            className="form-input"
          />
          <label className="form-label space-top">Currency Symbol</label>
          <input
            type="text"
            name="currencySymbol"
            value={form.currencySymbol}
            onChange={handleChange}
            className="currency-input"
          />{" "}
          <br></br>
          <button className="save-btn" onClick={saveSettings}>
            Save Settings
          </button>
        </div>
      </div>

      {/* GUIDE */}
      <div className="card guide-card">
        <div className="card-title">🎯 CLASSIFICATION GUIDE</div>

        <div className="badge-wrap">
          <span className="badge safe">● Safe</span>
          <span className="guide-text">Stock {">"} Reorder Level</span>

          <span className="badge low">● Low</span>
          <span className="guide-text">
            Safety Stock {"<"} Stock {"<="} Reorder Level
          </span>

          <span className="badge reorder">● Reorder</span>
          <span className="guide-text">Stock {"<="} Safety Stock</span>

          <span className="badge aclass">A</span>
          <span className="guide-text">Top 70% value</span>

          <span className="badge bclass">B</span>
          <span className="guide-text">Next 20%</span><br></br>

          <span className="badge cclass">C</span>
          <span className="guide-text">Bottom 10%</span>

          <span className="badge fsn-f">F</span>
          <span className="guide-text">Fast</span>

          <span className="badge fsn-s">S</span>
          <span className="guide-text">Slow</span>

          <span className="badge fsn-n">N</span>
          <span className="guide-text">Non-moving</span>
        </div>
      </div>

      <style>{`
        .settings-grid{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:20px;
          margin-top:20px;
        }

        .form-label{
          display:block;
          font-size:12px;
          font-weight:600;
          color:#6b7280;
          margin-bottom:8px;
          margin-top:14px;
        }

        .space-top{
          margin-top:20px;
        }

        .form-input{
          width:100%;
          height:48px;
          border:1px solid #d9d9d9;
          border-radius:10px;
          padding:0 16px;
          font-size:14px;
          outline:none;
          background:#fff;
        }

        .readonly-box{
          background:#f3f3ef;
        }

        .currency-input{
          width:105px;
          height:48px;
          border:1px solid #d9d9d9;
          border-radius:10px;
          padding:0 16px;
          font-size:12px;
          background:#fff;
        }

        .helper-text{
          font-size:12px;
          color:#7b8190;
          margin-top:10px;
        }

        .save-btn{
          margin-top:24px;
          background:#166534;
          color:#fff;
          border:none;
          border-radius:10px;
          padding:14px 24px;
          font-size:14px;
          font-weight:700;
          cursor:pointer;
        }

        .save-btn:hover{
          background:#14532d;
        }

        .guide-card{
          margin-top:20px;
        }

        .badge-wrap{
          display:flex;
          flex-wrap:wrap;
          gap:10px;
          align-items:center;
          margin-top:16px;
        }

        /* ONLY CHANGED THIS */
        .badge{
          padding:5px 10px;
          border-radius:999px;
          font-size:9px;
          font-weight:700;
          line-height:1;
          min-width:auto;
        }

        .guide-text{
          font-size:10px;
          color:#6b7280;
          margin-right:8px;
        }

        .safe{
          background:#dcfce7;
          color:#16a34a;
          width:53px;
        }

        .low{
          background:#fef3c7;
          color:#d97706;
          width:47px;
        }

        .reorder{
          background:#fee2e2;
          color:#ef4444;
          width:65px;
        }

        .aclass{
          background:#ede9fe;
          color:#7c3aed;
          width:26px;
        }

        .bclass{
          background:#dbeafe;
          color:#2563eb;
          width:26px;
        }

        .cclass{
          background:#f3f4f6;
          color:#6b7280;
          width:26px;
        }

        .fsn-f{
          background:#fef3c7;
          color:#a16207;
          width:26px;
        }

        .fsn-s{
          background:#dbeafe;
          color:#2563eb;
          width:26px;
        }

        .fsn-n{
          background:#f3f4f6;
          color:#6b7280;
          width:26px;
        }

        @media(max-width:900px){
          .settings-grid{
            grid-template-columns:1fr;
          }
        }
`}</style>
    </section>
  );
}

export default Settings;
