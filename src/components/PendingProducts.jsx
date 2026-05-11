import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PendingProducts() {
  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(true);

  const [priceMap, setPriceMap] = useState({});

  const [mrpMap, setMrpMap] = useState({});

  const loadData = async () => {
    try {
      const res = await axios.get("http://http://https://inventory-backend-final-1.onrender.com/products/pending");

      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const approve = async (id) => {
    const price = priceMap[id];

    const mrp = mrpMap[id];

    if (!price || !mrp) {
      alert("Enter Selling Price and MRP");
      return;
    }

    try {
      await axios.put(`http://http://https://inventory-backend-final-1.onrender.com/products/approve/${id}`, {
        price: parseFloat(price),
        mrp: parseFloat(mrp),
      });

      alert("Product Approved");

      loadData();
    } catch {
      alert("Approval failed");
    }
  };

  return (
    <>
      <style>{`
        .pending-page{
          padding:24px;
          background:var(--bg);
          min-height:100vh;
          color:var(--text);
        }

        .pending-title{
          font-size:32px;
          font-weight:800;
          margin-bottom:6px;
        }

        .pending-sub{
          color:var(--muted);
          margin-bottom:20px;
          font-size:14px;
        }

        .pending-card{
          background:var(--surface);
          border:1px solid var(--border);
          border-radius:24px;
          padding:22px;
        }

        .table-wrap{
          width:100%;
          overflow-x:auto;
        }

        .pending-table{
          width:100%;
          min-width:980px;
          border-collapse:collapse;
        }

        .pending-table th{
          text-align:left;
          padding:14px 10px;
          border-bottom:1px solid var(--border);
          color:var(--muted);
          font-size:13px;
        }

        .pending-table td{
          padding:14px 10px;
          border-bottom:1px solid var(--border);
          font-size:14px;
        }

        .price-input{
          width:100px;
          height:42px;
          border:1px solid var(--border);
          border-radius:10px;
          background:var(--bg);
          color:var(--text);
          padding:0 10px;
          outline:none;
        }

        .approve-btn{
          border:none;
          background:#166534;
          color:#fff;
          padding:10px 14px;
          border-radius:10px;
          font-weight:700;
          cursor:pointer;
        }

        .approve-btn:hover{
          background:#14532d;
        }

        .badge{
          background:#92400e;
          color:#fde68a;
          padding:6px 10px;
          border-radius:999px;
          font-size:12px;
          font-weight:700;
        }

        .empty{
          text-align:center;
          padding:60px 0;
          color:var(--muted);
          font-size:15px;
        }

        @media(max-width:768px){

          .pending-page{
            padding:16px;
          }

          .pending-title{
            font-size:26px;
          }

          .pending-card{
            padding:16px;
            border-radius:18px;
          }

          .pending-table{
            min-width:900px;
          }
        }

        @media(max-width:480px){

          .pending-page{
            padding:12px;
          }

          .pending-title{
            font-size:22px;
          }

          .pending-card{
            padding:14px;
          }

          .pending-table{
            min-width:860px;
          }
        }
      `}</style>

      <div className="pending-page">
        <div className="pending-title">Pending Approvals</div>

        <div className="pending-sub">
          New imported products waiting for selling price approval
        </div>

        <div className="pending-card">
          <div className="table-wrap">
            <table className="pending-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>CATEGORY</th>
                  <th>STOCK</th>
                  <th>BARCODE</th>
                  <th>STATUS</th>
                  <th>SELL PRICE</th>
                  <th>MRP</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="empty">
                      Loading...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty">
                      ✅ No Pending Products
                    </td>
                  </tr>
                ) : (
                  rows.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>

                      <td>{p.category?.name || "-"}</td>

                      <td>{p.stock}</td>

                      <td>{p.barcode || "-"}</td>

                      <td>
                        <span className="badge">PENDING</span>
                      </td>

                      <td>
                        <input
                          className="price-input"
                          placeholder="0"
                          onChange={(e) =>
                            setPriceMap({
                              ...priceMap,
                              [p.id]: e.target.value,
                            })
                          }
                        />
                      </td>

                      <td>
                        <input
                          className="price-input"
                          placeholder="0"
                          onChange={(e) =>
                            setMrpMap({
                              ...mrpMap,
                              [p.id]: e.target.value,
                            })
                          }
                        />
                      </td>

                      <td>
                        <button
                          className="approve-btn"
                          onClick={() => approve(p.id)}
                        >
                          ✔ Approve
                        </button>
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
