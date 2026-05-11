import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";

export default function Billing() {
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [scanLock, setScanLock] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [cashPaid, setCashPaid] = useState(0);
  const [upiPaid, setUpiPaid] = useState(0);
  const [cardPaid, setCardPaid] = useState(0);

  const scannerRef = useRef(null);

  const API = "http://https://inventory-backend-final-1.onrender.com/api";

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      fetchProduct(barcode);
      setBarcode("");
    }
  };

  const fetchProduct = async (code) => {
    if (!code) return;

    try {
      const clean = code.trim();

      const res = await axios.get(`${API}/products/scan/${clean}`);

      if (res.data.exists && res.data.product) {
        const product = res.data.product;

        if (product.status === "PENDING") {
          alert("This product is pending approval. Set selling price first.");
          return;
        }

        if (product.status !== "ACTIVE") {
          alert(product.name + " is not for sale");
          return;
        }
        addToCart(product);

        if (navigator.vibrate) navigator.vibrate(200);

        return;
      }

      alert("Product not found");
    } catch {
      alert("Product not found");
    }
  };
  const handleImageUpload = async (e) => {

  const file = e.target.files[0];

  if (!file) return;

  try {

    const reader = new BrowserMultiFormatReader();

    const imageUrl = URL.createObjectURL(file);

    const img = document.createElement("img");

    img.src = imageUrl;

    img.onload = async () => {

      try {

        const result = await reader.decodeFromImageElement(img);

        const code = result.getText();

        setBarcode(code);

        fetchProduct(code);

      } catch {

        alert("Barcode not detected");

      }
    };

  } catch {

    alert("Scan failed");

  }
};

  const addToCart = (product) => {
    const exists = cart.find((x) => x.id === product.id);

    if (exists) {
      setCart(
        cart.map((x) => (x.id === product.id ? { ...x, qty: x.qty + 1 } : x)),
      );
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
        },
      ]);
    }
  };

  const increase = (id) => {
    setCart(cart.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)));
  };

  const decrease = (id) => {
    setCart(
      cart
        .map((x) => (x.id === id ? { ...x, qty: x.qty - 1 } : x))
        .filter((x) => x.qty > 0),
    );
  };

  const removeItem = (id) => {
    setCart(cart.filter((x) => x.id !== id));
  };

  const clearAll = () => {
    setCart([]);
    setDiscount(0);
    setCashPaid(0);
    setUpiPaid(0);
    setCardPaid(0);
    setPaymentMode("Cash");
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const safeDiscount = discount > subtotal ? subtotal : discount;

  const tax = (subtotal - safeDiscount) * 0.05;

  const grandTotal = subtotal - safeDiscount + tax;

  const totalPaid = Number(cashPaid) + Number(upiPaid) + Number(cardPaid);

  const balance = totalPaid - grandTotal;

  const checkout = async () => {
    if (cart.length === 0) {
      alert("Cart empty");
      return;
    }

    if (totalPaid < grandTotal) {
      alert("Insufficient payment");
      return;
    }

    try {
      await axios.post(`${API}/billing/checkout`, {
        customerName: "Walk-in Customer",
        customerMobile: "",
        paymentMode,
        discount: safeDiscount,
        cashPaid,
        upiPaid,
        cardPaid,
        items: cart.map((x) => ({
          productId: x.id,
          qty: x.qty,
          price: x.price,
        })),
      });

      alert("Invoice Created");
      clearAll();
    } catch {
      alert("Checkout failed");
    }
  };

  useEffect(() => {
    if (!scannerOpen) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: 220,
      },
      false,
    );

    scanner.render(
      (decodedText) => {
        if (scanLock) return;

        setScanLock(true);

        fetchProduct(decodedText);

        setTimeout(() => {
          scanner.clear();
          setScannerOpen(false);
          setScanLock(false);
        }, 800);
      },
      () => {},
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [scannerOpen]);

  const inputStyle = {
    width: "95px",
    height: "36px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    padding: "0 10px",
    background: "var(--bg)",
    color: "var(--text)",
  };

  const selectStyle = {
    height: "36px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    padding: "0 10px",
    background: "var(--bg)",
    color: "var(--text)",
  };

  return (
    <>
      <style>{`
        .billing-page{
          display:flex;
          gap:20px;
          padding:30px;
          min-height:100vh;
          background:var(--bg);
          color:var(--text);
      }
        .billing-left{flex:1;min-width:0;}
        .billing-right{
          width:360px;
          flex-shrink:0;
          align-self:flex-start;
        }
        .scan-box{
          background:var(--surface);
          border:2px dashed #16a34a;
          border-radius:20px;
          padding:14px;
          display:flex;
          align-items:center;
          gap:12px;
          margin-bottom:20px;
        }
        .scan-input{
          flex:1;
          border:none;
          background:var(--bg);
          color:var(--text);
          height:50px;
          border-radius:12px;
          padding:0 16px;
          outline:none;
        }
        .camera-btn,.checkout-btn{
          border:none;
          background:#166534;
          color:#fff;
          cursor:pointer;
          font-weight:700;
        }
        .camera-btn{
          padding:12px 18px;
          border-radius:12px;
        }
        .cart-box,.summary{
          background:var(--surface);
          border:1px solid var(--border);
          border-radius:22px;
          padding:22px;
        }
        .cart-top{
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
          margin-bottom:20px;
        }
        .billing-table{
          width:100%;
          min-width:620px;
          border-collapse:collapse;
        }
        .billing-table th,
        .billing-table td{
          padding:14px 8px;
          border-bottom:1px solid var(--border);
          text-align:left;
        }
        .qty-btn,.remove-btn{
          border:none;
          color:#fff;
          cursor:pointer;
          font-weight:800;
        }
        .qty-btn{
          width:28px;
          height:28px;
          border-radius:8px;
          background:#166534;
        }
        .remove-btn{
          width:32px;
          height:32px;
          border-radius:8px;
          background:#dc2626;
        }
        .total-card{
          background:#166534;
          color:#fff;
          border-radius:22px;
          padding:24px;
          margin-bottom:20px;
        }
        .row{
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
          margin-bottom:14px;
          color:var(--muted);
        }
        .big-total{
          display:flex;
          justify-content:space-between;
          font-size:30px;
          font-weight:800;
          margin-bottom:18px;
        }
        .checkout-btn,.cancel-btn{
          width:50%;
          padding:14px;
          border-radius:14px;
          font-size:17px;
        }

        .checkout-btn{margin-bottom:10px;}

        .cancel-btn{
          border:1px solid var(--border);
          background:var(--bg);
          color:var(--text);
          font-weight:700;
          cursor:pointer;
        }

        .overlay{
          position:fixed;
          inset:0;
          background:rgba(0,0,0,.7);
          display:flex;
          justify-content:center;
          align-items:center;
          z-index:9999;
          padding:16px;
        }

        .modal{
          width:100%;
          max-width:520px;
          background:var(--surface);
          border:1px solid var(--border);
          border-radius:22px;
          padding:22px;
        }

        .modal-top{
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:18px;
        }

        .close-btn{
          width:42px;
          height:42px;
          border:none;
          border-radius:12px;
          background:#dc2626;
          color:#fff;
          font-size:24px;
          cursor:pointer;
        }

        .empty{
          text-align:center;
          color:var(--muted);
          padding:80px 0;
        }

        @media(max-width:1100px){
          .billing-page{flex-direction:column;}
          .billing-right{width:100%; position:static;}
        }
          @media(min-width:1100px){
            .billing-right{
              position:sticky;
              top:90px;
            }
          }

        @media(max-width:768px){
          .billing-page{padding:16px;gap:16px;}
          .scan-box{flex-direction:column;align-items:stretch;}
          .camera-btn{width:100%;}
          .cart-top{flex-direction:column;align-items:stretch;}
          .cart-top button{width:100%;}
          .cart-box,.summary,.total-card{padding:16px;}
        }

        @media(max-width:480px){
          .billing-page{padding:12px;}
          .billing-table{min-width:560px;}
        }
      `}</style>

      <div className="billing-page">
        {/* LEFT */}
        <div className="billing-left">
          <h1 style={{ fontSize: "25px", fontWeight: 800, marginBottom: 8 }}>
            Billing
          </h1>

          <p style={{ color: "var(--muted)", marginBottom: 20 }}>
            Barcode-only lookup — scan to add products instantly
          </p>

          <div className="scan-box">
            <span>▌▌▌</span>

            <input
              className="scan-input"
              placeholder="Scan barcode then press Enter..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={handleEnter}
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="camera-btn"
                onClick={() => setScannerOpen(true)}
              >
                📷 Camera
              </button>

              <button
                className="camera-btn"
                onClick={() => fileInputRef.current.click()}
              >
                🖼 Upload
              </button>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
            </div>
          </div>

          <div className="cart-box">
            <div className="cart-top">
              <h3 style={{ margin: 0 }}>🛒 CART</h3>

              <button className="cancel-btn" onClick={clearAll}>
                Clear All
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty">
                🛒
                <br />
                Scan a barcode to start billing
              </div>
            ) : (
              <table className="billing-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>

                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;

                            setCart((prev) =>
                              prev.map((p) =>
                                p.id === item.id ? { ...p, qty: value } : p,
                              ),
                            );
                          }}
                          style={{
                            width: "60px",
                            height: "34px",
                            textAlign: "center",
                            borderRadius: "8px",
                            border: "1px solid var(--border)",
                            background: "var(--bg)",
                            color: "var(--text)",
                          }}
                        />
                      </td>

                      <td>₹{item.price}</td>

                      <td>₹{(item.price * item.qty).toFixed(2)}</td>

                      <td>
                        <button
                          className="remove-btn"
                          onClick={() => removeItem(item.id)}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="billing-right">
          <div className="total-card">
            <p>TOTAL AMOUNT</p>

            <h2 style={{ margin: 0, fontSize: 42 }}>
              ₹{grandTotal.toFixed(2)}
            </h2>

            <p>{totalItems} items</p>
          </div>

          <div className="summary">
            <div className="row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="row">
              <span>Discount</span>

              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                style={inputStyle}
              />
            </div>
            <div className="row">
              <span>Tax (5%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="row">
              <span>Payment</span>

              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                style={selectStyle}
              >
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
                <option>Split</option>
              </select>
            </div>
            {(paymentMode === "Cash" || paymentMode === "Split") && (
              <div className="row">
                <span>Cash</span>
                <input
                  type="number"
                  value={cashPaid}
                  onChange={(e) => setCashPaid(Number(e.target.value))}
                  style={inputStyle}
                />
              </div>
            )}
            {(paymentMode === "UPI" || paymentMode === "Split") && (
              <div className="row">
                <span>UPI</span>
                <input
                  type="number"
                  value={upiPaid}
                  onChange={(e) => setUpiPaid(Number(e.target.value))}
                  style={inputStyle}
                />
              </div>
            )}
            {(paymentMode === "Card" || paymentMode === "Split") && (
              <div className="row">
                <span>Card</span>
                <input
                  type="number"
                  value={cardPaid}
                  onChange={(e) => setCardPaid(Number(e.target.value))}
                  style={inputStyle}
                />
              </div>
            )}
            <div className="row">
              <span>Paid</span>
              <span>₹{totalPaid.toFixed(2)}</span>
            </div>
            <div className="row">
              <span>{balance >= 0 ? "Balance" : "Pending"}</span>

              <span>₹{Math.abs(balance).toFixed(2)}</span>
            </div>
            <hr
              style={{
                border: "none",
                borderTop: "1px solid var(--border)",
                margin: "18px 0",
              }}
            />
            <div className="big-total">
              <span>Total</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
            <button className="checkout-btn" onClick={checkout}>
              ✔ Checkout
            </button>{" "}
            <br></br>
            <button className="cancel-btn" onClick={clearAll}>
              ✖ Cancel Bill
            </button>
          </div>
        </div>
      </div>

      {scannerOpen && (
        <div className="overlay">
          <div className="modal">
            <div className="modal-top">
              <h3>Scan Barcode</h3>

              <button
                className="close-btn"
                onClick={() => setScannerOpen(false)}
              >
                ×
              </button>
            </div>

            <div id="reader"></div>
          </div>
        </div>
      )}
    </>
  );
}
